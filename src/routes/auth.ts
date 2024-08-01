// 認証関係のルーティングを行う
import express from 'express';
import { sanitizeInputs } from '../middlewares/xssProtection';
import { createAccount, login, guestLogin } from '../controllers/authController';

const router = express.Router();

//パスワードはサニタイズせず、メールアドレスのみサニタイズ
router.post('/accounts', sanitizeInputs, createAccount);
router.post('/login', sanitizeInputs, login);
router.post('/guest-login', guestLogin);

export default router;