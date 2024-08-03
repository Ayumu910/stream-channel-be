import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import streamsRoutes from './routes/streams';
import streamersRoutes from './routes/streamers'
import categoriesRoutes from './routes/categories'
import playlistsRoutes from './routes/playlists'


const app = express();
const prisma = new PrismaClient();

// ミドルウェアの設定
app.use(bodyParser.json());

const allowedOrigins = ['http://localhost:3000', 'https://Ayumu910.github.io'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// ルーティングの設定
app.use('/api', authRoutes);
app.use('/api', streamsRoutes);
app.use('/api', streamersRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', playlistsRoutes);

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