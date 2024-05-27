import { createStreamerCategory, findAllStreamerCategoriesByUserId, addStreamerToCategoryRelation, findStreamerCategoryById, findStreamersByCategoryId } from '../repositories/categoryRepository';
import { findStreamerById, createStreamer } from '../repositories/streamerRepository';
import { getYoutubeStreamerDataOnly, getYoutubeStreamerDetail, getYoutubeStreamerIdFromUrl } from '../api/youtubeApi';
import { getTwitchStreamerDataOnly, getTwitchStreamerDetail, getTwitchStreamerIdFromUrl } from '../api/twitchApi';

export async function createCategory(title: string, userId: string) {
  return await createStreamerCategory(title, userId);
}

export async function getAllCategories(userId: string) {
  return await findAllStreamerCategoriesByUserId(userId);
}

export async function addStreamerToCategory(categoryId: string, streamerUrl: string, userId: string) {
  //カテゴリを特定
  const category = await findStreamerCategoryById(parseInt(categoryId));

  //本人が作ったカテゴリか検証
  if (!category || category.user_id !== userId) {
    throw new Error('Category not found or unauthorized');
  }

  let streamerId: string;
  let platform: string;

  //url から配信者 id を取得
  if (streamerUrl.includes('youtube.com')) {
    platform = 'youtube';
    streamerId = await getYoutubeStreamerIdFromUrl(streamerUrl);
  } else if (streamerUrl.includes('twitch.tv')) {
    platform = 'twitch';
    streamerId = await getTwitchStreamerIdFromUrl(streamerUrl);
  } else {
    throw new Error('Invalid streamer URL');
  }

  //配信者を特定
  let streamer = await findStreamerById(streamerId);

  //DB 内に配信者情報がない場合は、新たに fetch() して作成
  if (!streamer) {
    let streamerData: any;

    if (platform === 'youtube') {
      streamerData = await getYoutubeStreamerDataOnly(streamerId);
    } else if (platform === 'twitch') {
      streamerData = await getTwitchStreamerDataOnly(streamerId);
    } else {
      throw new Error('Invalid platform');
    }

    streamer = await createStreamer(streamerData);
  }

  return await addStreamerToCategoryRelation(parseInt(categoryId), streamer.streamer_id);
}

export async function getStreamersByCategory(categoryId: string, userId: string) {
  //カテゴリを取得
  const category = await findStreamerCategoryById(parseInt(categoryId));

  //カテゴリがユーザー本人のものか検証
  if (!category || category.user_id !== userId) {
    throw new Error('Category not found or unauthorized');
  }

  //カテゴリ中の配信者を取得
  const streamers = await findStreamersByCategoryId(parseInt(categoryId));

  //配信者の詳細情報を取得
  const streamersWithDetails = await Promise.all(streamers.map(async (streamer) => {
    const platform = streamer.platform;
    let streamer_detail;
    let streamer_icon;
    let most_recent_stream_thumbnail;

    if (platform === 'youtube') {
      streamer_detail = await getYoutubeStreamerDetail(streamer.streamer_id);
      streamer_icon = streamer_detail.streamerIconUrl;
      most_recent_stream_thumbnail = streamer_detail.streams[0].thumbnails.high.url;
    } else if (platform === 'twitch') {
      streamer_detail = await getTwitchStreamerDetail(streamer.streamer_id);
      streamer_icon = streamer_detail.streamerIconUrl;
      most_recent_stream_thumbnail = streamer_detail.streams[0].thumbnail_url.replace('%{width}', 480).replace('%{height}', 360);
    } else {
      throw new Error('Invalid platform');
    }

    return {
      id: streamer.streamer_id,
      name: streamer.name,
      platform: streamer.platform,
      streamer_icon: streamer_icon,
      most_recent_stream_thumbnail: most_recent_stream_thumbnail
    };
  }));

  return {
    category_id: category.category_id.toString(),
    category_name: category.category_title,
    streamers: streamersWithDetails
  };
}