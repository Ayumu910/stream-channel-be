import { Request, Response } from 'express';

export const getStreamDetail = async (req: Request, res: Response) => {
  const { stream_id } = req.params;
  const { platforms } = req.query;

  try {
    let streamData;
    let streamerIconUrl = '';
    let thumbnailImage = '';

    if (platforms === 'youtube') {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${stream_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics`);
      const data = await response.json();
      streamData = data.items[0];

      //youtube の配信者アイコン取得のために
      const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?id=${streamData.snippet.channelId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`);
      const channelData = await channelResponse.json();
      streamerIconUrl = channelData.items[0].snippet.thumbnails.default.url;

    } else if (platforms === 'twitch') {
      const headers = new Headers();
      headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
      headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);

      const response = await fetch(`https://api.twitch.tv/helix/videos?id=${stream_id}`, {
        headers: headers
      });

      const data = await response.json();
      streamData = data.data[0];

      // 配信のサムネイル
      // url中の %{width} and %{height} の部分に数値を入力する必要がある
      thumbnailImage = streamData.thumbnail_url.replace('%{width}', '640').replace('%{height}', '480');

      // twitch の配信者アイコン取得のために
      const userResponse = await fetch(`https://api.twitch.tv/helix/users?id=${streamData.user_id}`, {
        headers: headers
      });
      const userData = await userResponse.json();
      streamerIconUrl = userData.data[0].profile_image_url;
    } else {
      return res.status(400).json({ error: 'Invalid platform', message: 'The specified platform is not supported.' });
    }

    if (!streamData) {
      return res.status(404).json({ error: 'Stream not found', message: `The stream with ID '${stream_id}' was not found.` });
    }

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
      rating: {       //DB から取得、後で修正
        good: 111,
        bad: 22,
      },
      tags: platforms === 'youtube' ? (streamData.snippet.tags ? streamData.snippet.tags : []) : [], //twitch の場合、tags はなし
      platform: platforms,
      comments: [    //DB から取得、後で修正
        {
          "id": "113",
          "comment_text": "aaa"
        }
      ],

      //サムネイル画像は 640 × 480
      thumbnail_image: platforms === 'youtube' ? streamData.snippet.thumbnails.standard.url : thumbnailImage
    };

    res.status(200).json(streamDetail);
  } catch (error) {
    console.error('Error fetching stream detail:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while fetching the stream detail.' });
  }
};