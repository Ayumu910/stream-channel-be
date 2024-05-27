import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Request インターフェイスを拡張
declare module 'express' {
    export interface Request {
      user?: {
        userId: string;
      };
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (error, decoded) => {
    if (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = { userId: (decoded as any).userId };
    next();
  });
};