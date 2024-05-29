import { createPlaylistRecord, findAllPlaylistsByUserId, findPlaylistById,
  createStreamPlaylistRelation, findStreamsByPlaylistId,
  deletePlaylistRecord, updatePlaylistShareRecord } from '../repositories/playlistRepository';

import { findStreamById, createStream } from '../repositories/streamRepository';
import { findStreamerById, createStreamer } from '../repositories/streamerRepository';
import { getYoutubeStreamDataOnly, getYoutubeStreamerDataOnly, getYoutubeStreamIdFromUrl, getYoutubeStreamDetail } from '../api/youtubeApi';
import { getTwitchStreamDataOnly, getTwitchStreamerDataOnly, getTwitchStreamIdFromUrl , getTwitchStreamDetail} from '../api/twitchApi';

export async function createPlaylist(title: string, userId: string) {
  return await createPlaylistRecord(title, userId);
}

export async function getAllPlaylists(userId: string) {
  return await findAllPlaylistsByUserId(userId);
}

export async function addStreamToPlaylist(playlistId: string, streamUrl: string, userId: string) {
  //プレイリストを取得
  const playlist = await findPlaylistById(parseInt(playlistId));

  if (!playlist || playlist.user_id !== userId) {
    throw new Error('Playlist not found or unauthorized');
  }

  let streamId: string;
  let platform: string;

  // url から streamId を取得
  if (streamUrl.includes('youtube.com')) {
    platform = 'youtube';
    streamId = await getYoutubeStreamIdFromUrl(streamUrl);
  } else if (streamUrl.includes('twitch.tv')) {
    platform = 'twitch';
    streamId = await getTwitchStreamIdFromUrl(streamUrl);
  } else {
    throw new Error('Invalid stream URL');
  }

  // 配信情報を DB から取得
  let stream :any = await findStreamById(streamId);

  if (!stream) {
    // 配信情報が存在しない場合、新しく fetch() して取得
    let streamData: any;
    let streamerData: any;

    if (platform === 'youtube') {
      streamData = await getYoutubeStreamDataOnly(streamId);
      streamerData = await getYoutubeStreamerDataOnly(streamData.snippet.channelId);
    } else if (platform === 'twitch') {
      streamData = await getTwitchStreamDataOnly(streamId);
      streamerData = await getTwitchStreamerDataOnly(streamData.user_id);
    }

    // 配信者情報をDBから取得
    let streamer = await findStreamerById(streamerData.streamer_id);

    // 配信者情報が存在しない場合、配信者情報を新たに作成
    if (!streamer) {
      streamer = await createStreamer(streamerData);
    }

    // 配信情報が存在しない場合、fetch() した内容をもとに新たに DB に登録
    stream = await createStream(streamData, streamer.streamer_id, platform);
  }

  // 配信をプレイリストに追加する
  await createStreamPlaylistRelation(parseInt(playlistId), stream.stream_id);
}

export async function getStreamsFromPlaylist(playlistId: string, userId: string) {
  //プレイリストを取得
  const playlist = await findPlaylistById(parseInt(playlistId));

  if (!playlist || playlist.user_id !== userId) {
    throw new Error('Playlist not found or unauthorized');
  }

  //プレイリスト中の配信一覧を取得
  const streams = await findStreamsByPlaylistId(parseInt(playlistId));

  //取得した配信のそれぞれについて、レスポンスデータを生成
  const streamsWithDetails = await Promise.all(streams.map(async (stream ) => {
    const platform = stream.platform;
    let streamDetail :any;
    let tags = [];

    if (platform === 'youtube') {
      streamDetail = await getYoutubeStreamDetail(stream.stream_id);
      tags = streamDetail.streamData.snippet.tags || [];
    } else if (platform === 'twitch') {
      streamDetail = await getTwitchStreamDetail(stream.stream_id);
      tags = [];
    } else {
      throw new Error('Invalid platform');
    }

    const thumbnailImage = platform === 'youtube'
      ? streamDetail.streamData.snippet.thumbnails.standard.url
      : streamDetail.thumbnailImage;

    const views = platform === 'youtube'
      ? streamDetail.streamData.statistics.viewCount
      : streamDetail.streamData.view_count;

    return {
      stream_id: stream.stream_id,
      url: stream.url,
      title: stream.stream_title,
      views: views,
      tags: tags,
      platform: stream.platform,
      thumbnail_image: thumbnailImage,
      addedAt: stream.stream_playlist_relation[0].added_at,
    };
  }));

  return {
    playlist_id: playlistId,
    playlist_name: playlist.playlist_title,
    streams: streamsWithDetails,
  };
}

export async function deletePlaylist(playlistId: string, userId: string) {
  const playlist = await findPlaylistById(parseInt(playlistId));

  if (!playlist || playlist.user_id !== userId) {
    throw new Error('Playlist not found or unauthorized');
  }

  await deletePlaylistRecord(parseInt(playlistId));
}

export async function updatePlaylistShare(playlistId: string, userId: string, share: boolean) {
  const playlist = await findPlaylistById(parseInt(playlistId));

  if (!playlist || playlist.user_id !== userId) {
    throw new Error('Playlist not found or unauthorized');
  }

  await updatePlaylistShareRecord(parseInt(playlistId), share);
}