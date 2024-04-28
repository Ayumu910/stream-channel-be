import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { createAccount, login, guestLogin } from '../src/controllers/authController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(async () => {
    //reset database
    await prisma.account.deleteMany({});

    //mock request and response
    req = {
      body: {},
    } as unknown as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  afterAll(async () => {
    await prisma.account.deleteMany({});
    await prisma.$disconnect();
  });

  describe('createAccount', () => {
    it('should create a new account', async () => {
        const email = 'test@example.com';
        const password = 'Password123';
        req.body = { email, password };

        await createAccount(req, res);

        const createdAccount = await prisma.account.findUnique({ where: { email } });
        expect(createdAccount).not.toBeNull();
        expect(createdAccount?.email).toBe(email);
        expect(await bcrypt.compare(password, createdAccount?.password_hash as string)).toBe(true);
        expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
    });

    it('should return 400 if the email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'Password123';
      req.body = { email, password };

      await prisma.account.create({
        data: {
          email,
          password_hash: 'existing_password_hash',
        },
      });

      //use email already exists
      await createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' });
    });

    it('should return 400 if the password does not meet the requirements', async () => {
      const email = 'test@example.com';
      const password = 'weak';          //less than 8 characters
      req.body = { email, password };

      await createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Password does not meet the requirements' });
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
        const email = 'test@example.com';
        const password = 'Password123';
        req.body = { email, password };

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.account.create({
          data: {
            email,
            password_hash: hashedPassword,
          },
        });

        await login(req, res);

        expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
    });

    it('should return 401 if the account does not exist', async () => {
      const email = 'nonexistent@example.com';
      const password = 'Password123';
      req.body = { email, password };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 if the password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'WrongPassword';
      req.body = { email, password };

      await prisma.account.create({
        data: {
          email,
          password_hash: await bcrypt.hash('CorrectPassword', 10),
        },
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('guestLogin', () => {
    it('should create a guest account and login', async () => {
        await guestLogin(req, res);

        const guestAccount = await prisma.account.findFirst({
          where: {
            email: {
              startsWith: 'guest',
            },
          },
        });
        expect(guestAccount).not.toBeNull();
        expect(guestAccount?.is_guest).toBe(true);
        expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
    });
  });
});