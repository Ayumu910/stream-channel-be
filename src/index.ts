import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';

const app = express();
const prisma = new PrismaClient();

// ミドルウェアの設定
app.use(bodyParser.json());
app.use(cors());

// ルーティングの設定
app.use('/api', authRoutes);

// サーバーの起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Prismaクライアントの初期化
async function main() {
  await prisma.$connect();
}

// Prismaクライアントの終了処理
async function shutdown() {
  await prisma.$disconnect();
}

// プロセスのシグナルハンドリング
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Prismaクライアントの初期化
main()
  .catch((error) => {
    console.error('Error initializing Prisma client:', error);
    process.exit(1);
});