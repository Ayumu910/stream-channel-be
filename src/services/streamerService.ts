import { findStreamerById, createStreamer, findStreamerCommentsByStreamerId, createStreamerComment } from '../repositories/streamerRepository';
import { getYoutubeStreamerDetail, getYoutubeStreamerDataOnly } from '../api/youtubeApi';
import { getTwitchStreamerDetail, getTwitchStreamerDataOnly } from '../api/twitchApi';

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
      views: platform === 'youtube' ? stream.viewCount : stream.view_count,
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