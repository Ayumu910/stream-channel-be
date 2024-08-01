FROM node:20.12

RUN npm install -g typescript
WORKDIR /stream-channel-be
RUN npm install typescript express @types/node @types/express jest @types/jest ts-jest supertest @types/supertest
RUN npm install bcrypt jsonwebtoken cors dotenv @types/jsonwebtoken @types/bcrypt @types/cors

# ビルドコンテキストをルートに設定
COPY tsconfig.json  /stream-channel-be/
COPY package.json /stream-channel-be/
COPY jest.config.js /stream-channel-be/

# 後に src, __tests__ の内容をバインドマウントする
RUN mkdir src __tests__

# prisma 関係
RUN npm install prisma
RUN npx prisma init
COPY schema.prisma /stream-channel-be/prisma/
COPY .env /stream-channel-be/
RUN npx prisma generate

