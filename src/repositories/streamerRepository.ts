import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findStreamerById(streamerId: string) {
  return await prisma.streamer.findUnique({
    where: {
      streamer_id: streamerId
    }
  });
}

export async function createStreamer(streamerData: any) {
  return await prisma.streamer.create({
    data: {
      streamer_id: streamerData.streamer_id,
      name: streamerData.name,
      url: streamerData.url,
      platform: streamerData.platform
    }
  });
}

export async function findStreamerCommentsByStreamerId(streamerId: string) {
  return await prisma.streamerComment.findMany({
    where: {
      streamer_id: streamerId
    }
  });
}

export async function createStreamerComment(streamerId: string, commentText: string) {
  return await prisma.streamerComment.create({
    data: {
      comment_text: commentText,
      streamer: {
        connect: {
          streamer_id: streamerId
        }
      }
    }
  });
}