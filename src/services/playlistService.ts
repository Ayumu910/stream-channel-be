import { createPlaylistRecord, findAllPlaylistsByUserId, findPlaylistById,
  createStreamPlaylistRelation, findStreamsByPlaylistId, findFirstStreamByPlaylistId,
  deletePlaylistRecord, updatePlaylistShareRecord, removeStreamFromPlaylistRecord,
  findRandomPlaylists } from '../repositories/playlistRepository';

import { findStreamById, createStream } from '../repositories/streamRepository';
import { findStreamerById, createStreamer } from '../repositories/streamerRepository';
import { getYoutubeStreamDataOnly, getYoutubeStreamerDataOnly, getYoutubeStreamIdFromUrl, getYoutubeStreamDetail, getYoutubeStreamThumbnailOnly } from '../api/youtubeApi';
import { getTwitchStreamDataOnly, getTwitchStreamerDataOnly, getTwitchStreamIdFromUrl , getTwitchStreamDetail, getTwitchStreamThumbnailOnly} from '../api/twitchApi';

export async function createPlaylist(title: string, userId: string) {
  return await createPlaylistRecord(title, userId);
}

export async function getAllPlaylists(userId: string) {
  //ユーザーのすべてのプレイリストを取得
  const playlists = await findAllPlaylistsByUserId(userId);

  //プレイリスト中の最初の配信のサムネイルを取得
  const playlistsWithThumbnail = await Promise.all(playlists.map(async (playlist) => {
    const stream = await findFirstStreamByPlaylistId(playlist.playlist_id);
    let thumbnail = null;

    if (stream) {
      if (stream.platform === 'youtube') {
        thumbnail = await getYoutubeStreamThumbnailOnly(stream.stream_id);
      } else if (stream.platform === 'twitch') {
        thumbnail = await getTwitchStreamThumbnailOnly(stream.stream_id);
      }
    }

    return {
      playlist_id: playlist.playlist_id,
      playlist_title: playlist.playlist_title,
      thumbnail: thumbnail,
    };
  }));

  return playlistsWithThumbnail;
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

  //プレイリストが存在するか確認
  if (!playlist) {
    throw new Error('Category not found');
  }

  //プレイリストが共有されているか、あるいはユーザー本人のものかを確認
  if (!playlist.shared && playlist.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  //プレイリスト中の配信一覧を取得
  const streams = await findStreamsByPlaylistId(parseInt(playlistId));

  //取得した配信のそれぞれについて、レスポンスデータを生成
  const streamsWithDetails = await Promise.all(streams.map(async (stream ) => {
    try {
      const platform = stream.platform;
      let streamDetail: any;
      let tags = [];
      let thumbnailImage = 'デフォルトのサムネイルURL';
      let views = '0';

      if (platform === 'youtube') {
        streamDetail = await getYoutubeStreamDetail(stream.stream_id);
        tags = streamDetail.streamData.snippet.tags || [];
        thumbnailImage = streamDetail.streamData.snippet.thumbnails?.standard?.url || process.env.DEFAULT_THUMBNAIL;
        views = streamDetail.streamData.statistics.viewCount || '0';
      } else if (platform === 'twitch') {
        streamDetail = await getTwitchStreamDetail(stream.stream_id);
        thumbnailImage = streamDetail.thumbnailImage || process.env.DEFAULT_THUMBNAIL;
        views = (streamDetail.streamData.view_count || 0).toString();
      } else {
        throw new Error('Invalid platform');
      }

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
    } catch (error) {
      //配信の取得に失敗した場合は、ダミーデータを返す
      console.error(`Error fetching details for stream ${stream.stream_id}:`, error);
      return {
        stream_id: stream.stream_id,
        url: '#',
        title: 'Unknown Stream',
        views: '0',
        tags: [],
        platform: stream.platform,
        thumbnail_image: process.env.DEFAULT_THUMBNAIL,
        addedAt: stream.stream_playlist_relation[0].added_at,
      };
    }
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

export async function removeStreamFromPlaylist(playlistId: string, streamId: string, userId: string) {
  const playlist = await findPlaylistById(parseInt(playlistId));

  if (!playlist || playlist.user_id !== userId) {
    throw new Error('Playlist not found or unauthorized');
  }

  await removeStreamFromPlaylistRecord(parseInt(playlistId), streamId);
}

export async function getRecommendedPlaylists() {
  //プレイリストを取得
  const playlists :any = await findRandomPlaylists(6);

  //プレイリスト中の最初の配信のサムネイルを取得
  const playlistsWithThumbnail = await Promise.all(playlists.map(async (playlist :any) => {
    const stream = await findFirstStreamByPlaylistId(playlist.playlist_id);
    let thumbnail = process.env.DEFAULT_THUMBNAIL;

    if (stream) {
      try {
        if (stream.platform === 'youtube') {
          thumbnail = await getYoutubeStreamThumbnailOnly(stream.stream_id);
        } else if (stream.platform === 'twitch') {
          thumbnail = await getTwitchStreamThumbnailOnly(stream.stream_id);
        }
      } catch (error) {
        console.error(`Error fetching thumbnail for stream ${stream.stream_id}:`, error);
      }
    }

    return {
      playlist_id: playlist.playlist_id,
      playlist_name: playlist.playlist_title,
      thumbnail: thumbnail,
    };
  }));

  return playlistsWithThumbnail;
}