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