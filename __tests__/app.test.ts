const app = require('../src/app');

describe('Math operations', () => {
  test('Addition', () => {
    expect(app.add(2, 3)).toBe(5);
});

  test('Subtraction', () => {
    expect(app.subtract(5, 3)).toBe(2);
  });
});