import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

dotenv.config();

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // すでに登録されているメールアドレスと重複する場合
    const existingAccount = await prisma.account.findUnique({ where: { email } });
    if (existingAccount) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // パスワードの条件をチェック
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password does not meet the requirements' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const account = await prisma.account.create({
      data: {
        email,
        password_hash: passwordHash,
      },
    });

    const token = jwt.sign({ userId: account.user_id }, process.env.JWT_SECRET as string, { expiresIn: '30m' });

    res.json({ token });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const account = await prisma.account.findUnique({ where: { email } });

    if (!account) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, account.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: account.user_id }, process.env.JWT_SECRET as string, { expiresIn: '30m' } );

    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

export const guestLogin = async (req: Request, res: Response) => {
  try {
    const guestAccount = await prisma.account.create({
      data: {
        email: `guest${Date.now()}@example.com`,
        password_hash: '',
        is_guest: true,
      },
    });

    const token = jwt.sign({ userId: guestAccount.user_id }, process.env.JWT_SECRET as string, { expiresIn: '30m' } );

    res.json({ token });
  } catch (error) {
    console.error('Error creating guest account:', error);
    res.status(500).json({ error: 'Failed to create guest account' });
  }
};