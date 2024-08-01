import request from 'supertest';
import express from 'express';
import { sanitizeInputs, sanitizeParams } from '../src/middlewares/xssProtection';

const app = express();
app.use(express.json());
app.use(sanitizeInputs);
app.use(sanitizeParams);

// テスト用のルート
app.post('/test-body', (req, res) => {
  res.json(req.body);
});

app.get('/test-params/:param', (req, res) => {
  res.json(req.params);
});

describe('XSS Protection Middleware', () => {
  it('should sanitize body inputs', async () => {
    const response = await request(app)
      .post('/test-body')
      .send({
        normal: 'Hello, World!',
        script: '<script>alert("XSS")</script>',
        html: '<p>This is <strong>bold</strong></p>',
        password: 'securePassword123!',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      normal: 'Hello, World!',
      script: '',
      html: 'This is bold',
      password: 'securePassword123!',
    });
  });

  it('should sanitize URL parameters', async () => {
    const response = await request(app)
      .get('/test-params/<script>alert("XSS")</script>');

    expect(response.status).toBe(404);
  });

  it('should handle nested objects in body', async () => {
    const response = await request(app)
      .post('/test-body')
      .send({
        user: {
          name: 'John <script>alert("XSS")</script> Doe',
          age: 30,
          address: {
            street: '<img src="x" onerror="alert(\'XSS\')">Main St',
            city: 'New York',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        name: 'John  Doe',
        age: 30,
        address: {
          street: 'Main St',
          city: 'New York',
        },
      },
    });
  });

  it('should not modify non-string values', async () => {
    const response = await request(app)
      .post('/test-body')
      .send({
        number: 123,
        boolean: true,
        array: [1, 2, 3],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      number: 123,
      boolean: true,
      array: [1, 2, 3],
    });
  });

  it('should handle various XSS attack vectors', async () => {
    const response = await request(app)
      .post('/test-body')
      .send({
        imgTag: '<img src="x" onerror="alert(\'XSS\')">',
        onclickAttribute: '<a href="#" onclick="alert(\'XSS\')">Click me</a>',
        javascriptUrl: '<a href="javascript:alert(\'XSS\')">Click me</a>',
        dataAttribute: '<div data-custom="<script>alert(\'XSS\')</script>">Test</div>',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      imgTag: '',
      onclickAttribute: 'Click me',
      javascriptUrl: 'Click me',
      dataAttribute: 'Test',
    });
  });
});