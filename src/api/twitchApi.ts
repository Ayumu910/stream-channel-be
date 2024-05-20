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