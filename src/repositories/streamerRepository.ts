import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findStreamerById(streamerId: string) {
  return await prisma.streamer.findUnique({
    where: {
      streamer_id: streamerId
    }
  });
}

export async function findStreamerByUrl(streamerUrl: string) {
  return await prisma.streamer.findFirst({
    where: {
      url: streamerUrl,
    },
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

export async function createStreamerAnalytics(streamerId: string, age: number, gender: string, ratings: any) {
  return await prisma.streamerAnalysis.create({
    data: {
      users_age: age,
      users_gender: gender,
      humor: ratings.humor,
      gaming_skill: ratings.gaming_skill,
      appearance: ratings.appearance,
      uniqueness: ratings.uniqueness,
      collaboration_frequency: ratings.collaboration_frequency,
      streaming_frequency: ratings.streaming_frequency,
      game_or_chat: ratings.game_or_chat,
      wholesomeness: ratings.wholesomeness,
      streamer: {
        connect: {
          streamer_id: streamerId
        }
      }
    }
  });
}

export async function findStreamerAnalyticsByStreamerId(streamerId: string) {
  return await prisma.streamerAnalysis.findMany({
    where: {
      streamer_id: streamerId
    }
  });
}

export async function findAudienceDemographicsByStreamerId(streamerId: string) {
  const analytics = await prisma.streamerAnalysis.findMany({
    where: {
      streamer_id: streamerId
    }
  });

  const demographics: Record<string, number> = {
    "10s_male": 0,
    "20s_male": 0,
    "30s_male": 0,
    "40s_male": 0,
    "50s_male": 0,
    "60s_over_male": 0,
    "10s_female": 0,
    "20s_female": 0,
    "30s_female": 0,
    "40s_female": 0,
    "50s_female": 0,
    "60s_over_female": 0
  };

  analytics.forEach(a => {
    let ageGroup;
    if (a.users_age >= 60) {  //何十代か
      ageGroup = "60s_over";
    } else {
      ageGroup = `${Math.floor(a.users_age / 10) * 10}s`;
    }
    const genderKey = `${ageGroup}_${a.users_gender}`; //性別も付加してキー生成
    demographics[genderKey]++;  //値を更新
  });

  return demographics;
}