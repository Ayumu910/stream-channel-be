import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createPlaylistRecord(title: string, userId: string) {
  return await prisma.playlist.create({
    data: {
      playlist_title: title,
      account: {
        connect: {
          user_id: userId,
        },
      },
    },
  });
}

export async function findAllPlaylistsByUserId(userId: string) {
  return await prisma.playlist.findMany({
    where: {
      user_id: userId,
    },
    select: {
      playlist_id: true,
      playlist_title: true,
    },
  });
}

export async function findPlaylistById(playlistId: number) {
  return await prisma.playlist.findUnique({
    where: {
      playlist_id: playlistId,
    },
  });
}

export async function createStreamPlaylistRelation(playlistId: number, streamId: string) {
  await prisma.streamPlaylistRelation.create({
    data: {
      playlist_id: playlistId,
      stream_id: streamId,
    },
  });
}

export async function findStreamsByPlaylistId(playlistId: number) {
  return await prisma.stream.findMany({
    where: {
      stream_playlist_relation: {
        some: {
          playlist_id: playlistId,
        },
      },
    },
    include: {
        stream_playlist_relation: {
          where: {
            playlist_id: playlistId,
          },
        },
      },
  });
}

export async function deletePlaylistRecord(playlistId: number) {
  await prisma.streamPlaylistRelation.deleteMany({
    where: {
      playlist_id: playlistId,
    },
  });

  await prisma.playlist.delete({
    where: {
      playlist_id: playlistId,
    },
  });
}

export async function updatePlaylistShareRecord(playlistId: number, share: boolean) {
  await prisma.playlist.update({
    where: {
      playlist_id: playlistId,
    },
    data: {
      shared: share,
    },
  });
}

export async function removeStreamFromPlaylistRecord(playlistId: number, streamId: string) {
  await prisma.streamPlaylistRelation.deleteMany({
    where: {
      playlist_id: playlistId,
      stream_id: streamId,
    },
  });
}