import { createStreamerCategory, findAllStreamerCategoriesByUserId, addStreamerToCategoryRelation,
        findStreamerCategoryById, findStreamersByCategoryId, deleteStreamerCategory, updateStreamerCategory,
        deleteStreamerFromCategoryRelation, findRandomCategories } from '../repositories/categoryRepository';

import { findStreamerById, createStreamer } from '../repositories/streamerRepository';
import { getYoutubeStreamerDataOnly, getYoutubeStreamerDetail, getYoutubeStreamerIdFromUrl, getYoutubeStreamerIconOnly } from '../api/youtubeApi';
import { getTwitchStreamerDataOnly, getTwitchStreamerDetail, getTwitchStreamerIdFromUrl, getTwitchStreamerIconOnly } from '../api/twitchApi';

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

export async function getStreamersByCategory(categoryId: string, userId: string ) {
  //カテゴリを取得
  const category = await findStreamerCategoryById(parseInt(categoryId));

  //カテゴリが存在するか確認
  if (!category) {
    throw new Error('Category not found');
  }

   // カテゴリが共有されているか、あるいはユーザー本人のものかを確認
   if (!category.shared && category.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  //カテゴリ中の配信者を取得
  const streamers = await findStreamersByCategoryId(parseInt(categoryId));

  //配信者の詳細情報を取得
  const streamersWithDetails = await Promise.all(streamers.map(async (streamer) => {
    try {
      const platform = streamer.platform;
      let streamer_detail;
      let streamer_icon;
      let most_recent_stream_thumbnail;

      if (platform === 'youtube') {
        streamer_detail = await getYoutubeStreamerDetail(streamer.streamer_id);
        streamer_icon = streamer_detail.streamerIconUrl;
        most_recent_stream_thumbnail = streamer_detail.streams.length > 0
          ? streamer_detail.streams[0].thumbnails.high.url
          : process.env.DEFAULT_THUMBNAIL;
      } else if (platform === 'twitch') {
        streamer_detail = await getTwitchStreamerDetail(streamer.streamer_id);
        streamer_icon = streamer_detail.streamerIconUrl;

        //https://vod-secure.twitch.tv/_404/404_processing_480x360.png という形式のサムネイル URL を除外する
        most_recent_stream_thumbnail = process.env.DEFAULT_THUMBNAIL;
        for (let stream of streamer_detail.streams) {
          if (stream.thumbnail_url && !stream.thumbnail_url.includes('404_processing')) {
            most_recent_stream_thumbnail = stream.thumbnail_url.replace('%{width}', '480').replace('%{height}', '360');
            break;
          }
        }
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
    } catch(error) {
        //配信者の詳細情報を取得する際にエラーが発生しても、カテゴリの取得を中断しない
        console.error(`配信者 ${streamer.streamer_id} の詳細取得中にエラーが発生しました:`, error);
        return {
          id: streamer.streamer_id,
          name: streamer.name,
          platform: streamer.platform,
          streamer_icon: process.env.DEFAULT_THUMBNAIL,
          most_recent_stream_thumbnail: process.env.DEFAULT_THUMBNAIL
        };
      }
  }));

  return {
    category_id: category.category_id.toString(),
    category_name: category.category_title,
    streamers: streamersWithDetails
  };
}

export async function deleteCategory(categoryId: string, userId: string) {
  const category = await findStreamerCategoryById(parseInt(categoryId));

  if (!category || category.user_id !== userId) {
    throw new Error('Category not found or unauthorized');
  }

  await deleteStreamerCategory(parseInt(categoryId));
}

export async function shareCategory(categoryId: string, userId: string, share: boolean) {
  const category = await findStreamerCategoryById(parseInt(categoryId));

  if (!category || category.user_id !== userId) {
    throw new Error('Category not found or unauthorized');
  }

  await updateStreamerCategory(parseInt(categoryId), { shared: share });
}

export async function removeStreamerFromCategory(categoryId: string, streamerId: string, userId: string) {
  const category = await findStreamerCategoryById(parseInt(categoryId));

  if (!category || category.user_id !== userId) {
    throw new Error('Category not found or unauthorized');
  }

  await deleteStreamerFromCategoryRelation(parseInt(categoryId), streamerId);
}

export async function getRecommendedCategories() {
  const categories: any = await findRandomCategories(4);

  const categoriesWithIcons = await Promise.all(categories.map(async (category: any) => {
    const streamers = await findStreamersByCategoryId(category.category_id);
    const streamerIcons = await Promise.all(streamers.slice(0, 5).map(async (streamer) => {
      try {
        return await getStreamerIcon(streamer.streamer_id, streamer.platform);
      } catch (error) {
        //取得に失敗した場合は、デフォルトの画像 url を返す
        console.error(`Error fetching icon for streamer ${streamer.streamer_id}:`, error);
        return process.env.DEFAULT_THUMBNAIL;
      }

    }));

    return {
      category_id: category.category_id.toString(),
      streamer_icons: streamerIcons,
      category_name: category.category_title,
    };
  }));

  return categoriesWithIcons;
}
export async function getStreamerIcon(streamerId: string, platform: string) {
  try {
    if (platform === 'youtube') {
      return await getYoutubeStreamerIconOnly(streamerId);
    } else if (platform === 'twitch') {
      return await getTwitchStreamerIconOnly(streamerId);
    } else {
      throw new Error('Invalid platform');
    }
  } catch (error) {
    //取得に失敗した場合は、デフォルトの画像 url を返す
    console.error(`Error fetching icon for streamer ${streamerId}:`, error);
    return process.env.DEFAULT_THUMBNAIL;
  }
}