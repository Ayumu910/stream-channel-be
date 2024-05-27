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

export async function findStreamerCategoryById(categoryId: number) {
  return await prisma.streamerCategory.findUnique({
    where: {
      category_id: categoryId,
    },
  });
}

export async function addStreamerToCategoryRelation(categoryId: number, streamerId: string) {
  return await prisma.streamerCategoryRelation.create({
    data: {
      category_id: categoryId,
      streamer_id: streamerId,
    },
  });
}

export async function findStreamersByCategoryId(categoryId: number) {
  return await prisma.streamer.findMany({
    where: {
      streamer_category_relation: {
        some: {
          category_id: categoryId,
        },
      },
    },
  });
}