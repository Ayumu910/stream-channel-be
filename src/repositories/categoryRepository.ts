import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createStreamerCategory(title: string, userId: string) {
  return await prisma.streamerCategory.create({
    data: {
      category_title: title,
      account: {
        connect: {
          user_id: userId,
        },
      },
    },
  });
}

export async function findAllStreamerCategoriesByUserId(userId: string) {
  return await prisma.streamerCategory.findMany({
    where: {
      user_id: userId,
    },
  });
}