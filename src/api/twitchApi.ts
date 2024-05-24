export async function getTwitchStreamDetail(streamId: string) {
  const headers = new Headers();
  headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
  headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);

  //twitch の配信情報を取得
  const response = await fetch(`https://api.twitch.tv/helix/videos?id=${streamId}`, {
    headers: headers
  });
  const data = await response.json();
  const streamData = data.data[0];

  // 配信のサムネイル
  // url中の %{width} and %{height} の部分に数値を入力する必要がある
  const thumbnailImage = streamData.thumbnail_url.replace('%{width}', '640').replace('%{height}', '480');

  // twitch の配信者アイコン取得のために
  const userResponse = await fetch(`https://api.twitch.tv/helix/users?id=${streamData.user_id}`, {
    headers: headers
  });
  const userData = await userResponse.json();
  const streamerIconUrl = userData.data[0].profile_image_url;

  return {streamData: streamData, thumbnailImage:thumbnailImage, streamerIconUrl: streamerIconUrl};
}

export async function getTwitchStreamDataOnly(streamId: string) {
  const headers = new Headers();
  headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
  headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);

  //twitch の配信情報を取得
  const response = await fetch(`https://api.twitch.tv/helix/videos?id=${streamId}`, {
    headers: headers
  });
  const data = await response.json();
  return data.data[0];
}

export async function getTwitchStreamerDetail(streamerId: string) {
  const headers = new Headers();
  headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
  headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);

  //配信者のライブ配信一覧の取得
  const response = await fetch(`https://api.twitch.tv/helix/videos?user_id=${streamerId}&first=12`, {
    headers: headers
  });
  const data = await response.json();

  if (data.error) {
    throw new Error('Twitch API error: ' + data.error.message);
  }

  //配信者情報の取得
  const streamerResponse = await fetch(`https://api.twitch.tv/helix/users?id=${streamerId}`, {
    headers: headers
  });
  const streamerData = await streamerResponse.json();

  return {
    id: streamerId,
    name: streamerData.data[0].display_name,
    login: streamerData.data[0].login,
    streams: data.data,
    streamerIconUrl: streamerData.data[0].profile_image_url
  };
}

export async function getTwitchStreamerDataOnly(streamerId: string) {
  const headers = new Headers();
  headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
  headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);

  const response = await fetch(`https://api.twitch.tv/helix/users?id=${streamerId}`, {
    headers: headers
  });
  const data = await response.json();

  if (data.error) {
    throw new Error('Twitch API error: ' + data.error.message);
  }

  const streamerData = data.data[0];

  return {
    streamer_id: streamerId,
    name: streamerData.display_name,
    url: `https://www.twitch.tv/${streamerData.login}`,
    platform: 'twitch'
  };
}

export async function getTwitchStreamerBasicInfo(streamerId: string) {
  const headers = new Headers();
  headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
  headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);

  const response = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${streamerId}`, {
    headers: headers
  });
  const data = await response.json();

  if (data.error) {
    throw new Error('Twitch API error: ' + data.error.message);
  }

  return {
    total_views: 'Total views are not available on twitch',
    subscribers: data.total
  };
}