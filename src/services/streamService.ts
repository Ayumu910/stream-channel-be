import { findStreamById, createStream, updateStreamRating, findStreamerById, createStreamer, createComment, getStreamRating, getStreamComments } from '../repositories/streamRepository';
import { getYoutubeStreamDetail, getYoutubeStreamDataOnly } from '../api/youtubeApi';
import { getTwitchStreamDetail, getTwitchStreamDataOnly } from '../api/twitchApi';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getStreamDetail(streamId: string, platforms: string) {
  let streamData;
  let streamerIconUrl = '';
  let thumbnailImage = '';

  if (platforms === 'youtube') {
    const fetch_result = getYoutubeStreamDetail(streamId);

    streamData = (await fetch_result).streamData;
    streamerIconUrl = (await fetch_result).streamerIconUrl;

  } else if (platforms === 'twitch') {
    const fetch_result = getTwitchStreamDetail(streamId);

    streamData = (await fetch_result).streamData;
    thumbnailImage = (await fetch_result).thumbnailImage;
    streamerIconUrl = (await fetch_result).streamerIconUrl;

  } else {
    throw new Error('Invalid platform');
  }

  const streamRating= await getStreamRating(streamId);
  const streamComments = await getStreamComments(streamId);

  const streamDetail = {
    id: streamData.id,
    url: platforms === 'youtube' ? `https://www.youtube.com/watch?v=${streamData.id}` : `https://www.twitch.tv/videos/${streamData.id}`,
    title: platforms === 'youtube' ? streamData.snippet.title : streamData.title,
    views: platforms === 'youtube' ? streamData.statistics.viewCount : streamData.view_count,
    streamer: {
      id: platforms === 'youtube' ? streamData.snippet.channelId : streamData.user_id,
      name: platforms === 'youtube' ? streamData.snippet.channelTitle : streamData.user_name,
      platform: platforms,
      streamer_icon: streamerIconUrl
    },
    rating: streamRating ? streamRating.rating : null,
    tags: platforms === 'youtube' ? (streamData.snippet.tags ? streamData.snippet.tags : []) : [], //twitch の場合、tags はなし
    platform: platforms,
    comments: streamComments ? streamComments.comments : null,

    //サムネイル画像は 640 × 480
    thumbnail_image: platforms === 'youtube' ? streamData.snippet.thumbnails.standard.url : thumbnailImage
  };

  return streamDetail;
}

export async function rateStream( streamId: string, rating: { good: boolean; bad: boolean }, platform: string ) {
  // 配信情報をDB から取得
  let stream = await findStreamById(streamId);

  // 配信情報が存在する場合、評価を更新
  if (stream) {
    return await updateStreamRating(streamId, rating);
  } else {
    // 配信情報が存在しない場合、新しく取得
    let streamData :any;
    if (platform === 'youtube') {
      streamData = await getYoutubeStreamDataOnly(streamId);
    } else if (platform === 'twitch') {
      streamData = await getTwitchStreamDataOnly(streamId);
    } else {
      throw new Error('Invalid platform');
    }

    // 配信者情報をDBから取得
    const streamerId = platform === 'youtube' ? streamData.snippet.channelId : streamData.user_id;
    let streamer = await findStreamerById(streamerId);

    // 配信者情報が存在しない場合、配信者情報を新たに作成
    if (!streamer) {
      streamer = await createStreamer(streamData, platform);
    }

    // 配信情報が存在しない場合、fetch() した内容をもとに新たに作成
    await createStream(streamData, streamer.streamer_id, platform);
    return await updateStreamRating(streamId, rating);
  }
}

export async function createStreamComment(streamId: string, commentText: string, platform: string) {
  // 配信情報を取得
  let stream = await findStreamById(streamId);

  if (!stream) {
    // 配信情報が存在しない場合、新しく取得
    let streamData: any;
    if (platform === 'youtube') {
      streamData = await getYoutubeStreamDataOnly(streamId);
    } else if (platform === 'twitch') {
      streamData =  await getTwitchStreamDataOnly(streamId);
    } else {
      throw new Error('Invalid platform');
    }

    // 配信者情報をDBから取得
    const streamerId = platform === 'youtube' ? streamData.snippet.channelId : streamData.user_id;
    let streamer = await findStreamerById(streamerId);

    // 配信者情報が存在しない場合、配信者情報を新たに作成
    if (!streamer) {
      streamer = await createStreamer(streamData, platform);
    }

    // 配信情報が存在しない場合、fetch() した内容をもとに新たに作成
    await createStream(streamData, streamer.streamer_id, platform);
  }

  return await createComment(streamId, commentText);
}