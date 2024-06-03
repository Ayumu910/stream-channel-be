export async function getYoutubeStreamDetail(streamId: string) {
  //youtube の配信情報を取得
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${streamId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics`);
  const data = await response.json();
  const streamData = data.items[0];

  if (data.error) {
    throw new Error('YouTube API error: ' + data.error.message);
  }

  //youtube の配信者アイコン取得のために
  const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?id=${streamData.snippet.channelId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`);
  const channelData = await channelResponse.json();
  const streamerIconUrl = channelData.items[0].snippet.thumbnails.default.url;

  return {streamData: streamData, streamerIconUrl: streamerIconUrl};
}

export async function getYoutubeStreamDataOnly(streamId: string) {
   //youtube の配信情報を取得
   const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${streamId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics`);
   const data = await response.json();

   if (data.error) {
     throw new Error('YouTube API error: ' + data.error.message);
   }

   return data.items[0];
}

export async function getYoutubeStreamerDetail(streamerId: string) {
  //配信者の配信の ID 一覧を取得
  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${streamerId}&type=video&eventType=completed&maxResults=12&order=date&key=${process.env.YOUTUBE_API_KEY}`
  );
  const searchData = await searchResponse.json();

  if (searchData.error) {
    throw new Error('YouTube API error: ' + searchData.error.message);
  }

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  //配信の詳細一覧を取得
  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const videosData = await videosResponse.json();

  if (videosData.error) {
    throw new Error('YouTube API error: ' + videosData.error.message);
  }

  //配信者のアイコンを取得
  const streamerIconResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?id=${streamerId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`
  );
  const streamerIconData = await streamerIconResponse.json();
  const streamerIconUrl = streamerIconData.items[0].snippet.thumbnails.default.url;

  return {
    id: streamerId,
    name: videosData.items[0].snippet.channelTitle,
    streams: videosData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      viewCount: item.statistics.viewCount,
      thumbnails: item.snippet.thumbnails,
      publishedAt: item.snippet.publishedAt
    })),
    streamerIconUrl: streamerIconUrl
  };
}

export async function getYoutubeStreamerDataOnly(streamerId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${streamerId}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await response.json();

  if (data.error) {
    throw new Error('YouTube API error: ' + data.error.message);
  }

  const streamerData = data.items[0];

  return {
    streamer_id: streamerId,
    name: streamerData.snippet.title,
    url: `https://www.youtube.com/channel/${streamerId}`,
    platform: 'youtube'
  };
}

export async function getYoutubeStreamerBasicInfo(streamerId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${streamerId}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await response.json();

  if (data.error) {
    throw new Error('YouTube API error: ' + data.error.message);
  }

  const streamerData = data.items[0];

  return {
    total_views: streamerData.statistics.viewCount,
    subscribers: streamerData.statistics.subscriberCount
  };
}

export async function getYoutubeStreamerIdFromUrl(url: string): Promise<string> {
  // https://www.youtube.com/channel/{channelId} という形式の場合、id をそのまま返す
  let match = url.match(/youtube\.com\/channel\/([^/]+)/);
  if (match) {
    return match[1];
  }

  // https://www.youtube.com/channel/{handleName} という形式に対応
  match = url.match(/youtube\.com\/@([^/]+)/);
  if (match) {
    const streamerName = match[1];
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${streamerName}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (data.pageInfo.totalResults === 0) {
      throw new Error('Streamer not found on YouTube');
    }

    return data.items[0].id;
  }

  // https://www.youtube.com/c/{channelName} という形式に対応
  match = url.match(/youtube\.com\/c\/([^/]+)/);
  if (match) {
    const streamerName = match[1];
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${streamerName}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (data.pageInfo.totalResults === 0) {
      throw new Error('Streamer not found on YouTube');
    }

    return data.items[0].id;
  }

  throw new Error('Invalid YouTube streamer URL');
}

export async function getYoutubeStreamIdFromUrl(url: string): Promise<string> {
  const match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (!match) {
    throw new Error('Invalid YouTube stream URL');
  }
  return match[1];
}

export async function getYoutubeStreamerIconOnly(streamerId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${streamerId}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  return data.items[0].snippet.thumbnails.default.url;
}