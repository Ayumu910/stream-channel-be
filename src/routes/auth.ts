// 認証関係のルーティングを行う
import express from 'express';
import { createAccount, login, guestLogin } from '../controllers/authController';

const router = express.Router();

router.post('/accounts', createAccount);
router.post('/login', login);
router.post('/guest-login', guestLogin);

export default router;