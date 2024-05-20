import { PrismaClient, Stream } from '@prisma/client';
const prisma = new PrismaClient();

export async function findStreamById(streamId: string) {
  return await prisma.stream.findUnique({
    where: {
      stream_id: streamId,
    },
    include: {
      streamer: true,
    },
  });
}

export async function findStreamerById(streamerId: string) {
  return await prisma.streamer.findUnique({
    where: { streamer_id: streamerId },
  });
}


export async function getStreamRating(streamId: string) {
  const stream = await prisma.stream.findUnique({
    where: { stream_id: streamId },
    include: {
      stream_comment: true,
    },
  });

  if (!stream) {
    return null;
  }

  return {
    rating: {
      good: stream.good_rate,
      bad: stream.bad_rate,
    }
  };
}

export async function getStreamComments(streamId: string) {
  const stream = await prisma.stream.findUnique({
    where: { stream_id: streamId },
    include: {
      stream_comment: true,
    },
  });

  if (!stream) {
    return null;
  }

  return {
    comments: stream.stream_comment.map((comment) => ({
      id: comment.comment_id.toString(),
      comment_text: comment.comment_text,
    })),
  };
}

export async function createStream(streamData: any, streamerId: string, platform: string) {
  return await prisma.stream.create({
    data: {
      stream_id: streamData.id,
      stream_title: platform === 'youtube' ? streamData.snippet.title : streamData.title,
      url: platform === 'youtube' ? `https://www.youtube.com/watch?v=${streamData.id}` : `https://www.twitch.tv/videos/${streamData.id}`,
      platform: platform,
      streamer: {
        connect: { streamer_id: streamerId },
      },
    },
  });
}

export async function createStreamer(streamerData: any, platform: string) {
  return await prisma.streamer.create({
    data: {
      streamer_id: platform === 'youtube' ? streamerData.snippet.channelId : streamerData.user_id,
      name: platform === 'youtube' ? streamerData.snippet.channelTitle : streamerData.user_name,
      url: platform === 'youtube' ? `https://www.youtube.com/channel/${streamerData.snippet.channelId}` : `https://www.twitch.tv/${streamerData.user_login}`,
      platform: platform,
    },
  });
}

export async function updateStreamRating(streamId: string, rating: { good: boolean; bad: boolean }) {
  return await prisma.stream.update({
    where: {
      stream_id: streamId
    },
    include: {
      streamer: true,
    },
    data: {
      good_rate: rating.good ? {increment : 1} : {increment: 0},
      bad_rate: rating.bad ? {increment : 1} : {increment: 0}
    },
  });
}

export async function createComment(streamId: string, commentText: string) {
  return await prisma.streamComment.create({
    data: {
      comment_text: commentText,
      stream: {
        connect: {
          stream_id: streamId,
        },
      },
    },
  });
}