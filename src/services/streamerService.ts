import { findStreamerById, createStreamer, findStreamerCommentsByStreamerId, createStreamerComment,
  createStreamerAnalytics, findStreamerAnalyticsByStreamerId, findAudienceDemographicsByStreamerId
} from '../repositories/streamerRepository';
import { getYoutubeStreamerDetail, getYoutubeStreamerDataOnly, getYoutubeStreamerBasicInfo } from '../api/youtubeApi';
import { getTwitchStreamerDetail, getTwitchStreamerDataOnly, getTwitchStreamerBasicInfo } from '../api/twitchApi';

export async function getStreamerDetail(streamerId: string, platform: string) {
  let streamerData : any;
  let streamerIconUrl = '';

  if (platform === 'youtube') {
    streamerData = await getYoutubeStreamerDetail(streamerId);
    streamerIconUrl = streamerData.streamerIconUrl;
  } else if (platform === 'twitch') {
    streamerData = await getTwitchStreamerDetail(streamerId);
    streamerIconUrl = streamerData.streamerIconUrl;
  } else {
    throw new Error('Invalid platform');
  }

  const streamerDetail = {
    id: streamerData.id,
    name: streamerData.name,
    url: platform === 'youtube' ? `https://www.youtube.com/channel/${streamerData.id}` : `https://www.twitch.tv/${streamerData.login}`,
    platform: platform,
    streams: streamerData.streams.map((stream: any) => ({
      id: stream.id,
      title: stream.title,
      views: platform === 'youtube' ? stream.viewCount : stream.view_count + "" ,
      platform: platform,
      thumbnail_image: platform === 'youtube' ? stream.thumbnails.medium.url : stream.thumbnail_url.replace('%{width}', '320').replace('%{height}', '180')
    })),
    streamer_icon: streamerIconUrl
  };

  return streamerDetail;
}

export async function getStreamerComments(streamerId: string) {
  const streamer = await findStreamerById(streamerId);

  if (!streamer) {
    throw new Error('Streamer not found');
  }

  return await findStreamerCommentsByStreamerId(streamerId);
}


export async function postStreamerComment(streamerId: string, commentText: string, platform: string) {
  //DB から配信者情報を取得
  let streamer = await findStreamerById(streamerId);

  if (!streamer) {
    // 配信者情報が DB にない場合は、fetch して DB に登録
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

  //コメントをする
  return await createStreamerComment(streamer.streamer_id, commentText);
}

export async function postStreamerAnalytics(streamerId: string, age: number, gender: string, ratings: any, platform: string) {
  if (age < 10) {
    throw new Error('Invalid age. Age must be 10 or above.');
  }

  let streamer = await findStreamerById(streamerId);

  if (!streamer) {
    // 配信者情報が DB にない場合は、fetch して DB に登録
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

  return await createStreamerAnalytics(streamer.streamer_id, age, gender, ratings);
}

export async function getStreamerAnalytics(streamerId: string, platform: string) {
  let basicInfo;

  //配信者の基本情報を取得
  if (platform === 'youtube') {
    basicInfo = await getYoutubeStreamerBasicInfo(streamerId);
  } else if (platform === 'twitch') {
    basicInfo = await getTwitchStreamerBasicInfo(streamerId);
  } else {
    throw new Error('Invalid platform');
  }

  //配信者の分析情報を取得
  const analytics = await findStreamerAnalyticsByStreamerId(streamerId);
  const audienceDemographics = await findAudienceDemographicsByStreamerId(streamerId);

  const ratingsAverage = {
    humor: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.humor, 0) / analytics.length),
    gaming_skill: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.gaming_skill, 0) / analytics.length),
    appearance: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.appearance, 0) / analytics.length),
    uniqueness: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.uniqueness, 0) / analytics.length),
    collaboration_frequency: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.collaboration_frequency, 0) / analytics.length),
    streaming_frequency: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.streaming_frequency, 0) / analytics.length),
    game_or_chat: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.game_or_chat, 0) / analytics.length),
    wholesomeness: roundToOneDecimal(analytics.reduce((sum, a) => sum + a.wholesomeness, 0) / analytics.length)
  };

  return {
    basic_info: basicInfo,
    ratings: ratingsAverage,
    audience_demographics: audienceDemographics,
  };
}

//四捨五入のための関数
function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}