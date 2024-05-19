import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export const postStreamRating = async (req: Request, res: Response) => {
  const { stream_id } = req.params;
  const { rating, platforms } = req.body;

  try {
  // 配信情報をDB から取得
  let stream = await prisma.stream.findUnique({
    where: {
      stream_id: stream_id,
    },
    include: {
      streamer: true,
    },
  });

  if (stream) {
    // 配信情報が存在する場合、評価を更新
    stream = await prisma.stream.update({
      where: {
        stream_id: stream_id,
      },
      include: {
        streamer: true,
      },
      data: {
        good_rate: rating.good ? stream.good_rate + 1 : stream.good_rate,
        bad_rate: rating.bad ? stream.bad_rate + 1 : stream.bad_rate,
      },
    });

    res.status(200).json({ message: 'Rating updated successfully', stream: stream });

  } else {
    // 配信情報が存在しない場合、fetch() して新たに作成
    let streamData;
    if (platforms === 'youtube') {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${stream_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics`);
      const data = await response.json();
      streamData = data.items[0];
    } else if (platforms === 'twitch') {
      const headers = new Headers();
      headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
      headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);
      const response = await fetch(`https://api.twitch.tv/helix/videos?id=${stream_id}`, { headers: headers });
      const data = await response.json();
      streamData = data.data[0];
    } else {
      return res.status(400).json({ error: 'Invalid platform', message: 'The specified platform is not supported.' });
    }

    if (!streamData) {
      return res.status(404).json({ error: 'Stream not found', message: `The stream with ID '${stream_id}' was not found.` });
    }

    // 配信者情報をDBから取得
    let streamer = await prisma.streamer.findUnique({
      where: {
        streamer_id: platforms === 'youtube' ? streamData.snippet.channelId : streamData.user_id,
      },
    });

     // 配信者情報が存在しない場合、配信者情報を新たに作成
    if (!streamer) {
      streamer = await prisma.streamer.create({
        data: {
          streamer_id: platforms === 'youtube' ? streamData.snippet.channelId : streamData.user_id,
          name: platforms === 'youtube' ? streamData.snippet.channelTitle : streamData.user_name,
          url: platforms === 'youtube' ? `https://www.youtube.com/channel/${streamData.snippet.channelId}` : `https://www.twitch.tv/${streamData.user_login}`,
          platform: platforms,
        },
      });
    }

    // 配信情報が存在しない場合、fetch() した内容をもとに新たに作成
    stream = await prisma.stream.create({
      include: {
        streamer: true,
      },
      data: {
        stream_id: stream_id,
        stream_title: platforms === 'youtube' ? streamData.snippet.title : streamData.title,
        url: platforms === 'youtube' ? `https://www.youtube.com/watch?v=${streamData.id}` : `https://www.twitch.tv/videos/${streamData.id}`,
        platform: platforms,
        good_rate: rating.good ? 1 : 0,
        bad_rate: rating.bad ? 1 : 0,
        streamer: {
          connect: {
            streamer_id: streamer.streamer_id,
          },
        },
      },
    });

    res.status(201).json({ message: 'Stream and rating created successfully', stream: stream });
  }
  } catch (error) {
    console.error('Error adding stream rating:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while adding the stream rating.' });
  }
};

export const postStreamComment = async (req: Request, res: Response) => {
  const { stream_id } = req.params;
  const { comment_text, platforms } = req.body;

  try {
    // 配信情報を取得
    let stream = await prisma.stream.findUnique({
      where: {
        stream_id: stream_id,
      },
      include: {
        streamer: true,
      },
    });

    if (!stream) {
      // 配信情報が存在しない場合、新しく取得
      let streamData;
      if (platforms === 'youtube') {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${stream_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics`);
        const data = await response.json();

        if (data.error) {
          console.error('YouTube API error:', data.error);
          return res.status(500).json({ error: 'YouTube API error', message: 'An error occurred while fetching stream data from YouTube API.' });
        }

        streamData = data.items[0];
      } else if (platforms === 'twitch') {
        const headers = new Headers();
        headers.append('Client-ID', process.env.TWITCH_CLIENT_ID!);
        headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);

        const response = await fetch(`https://api.twitch.tv/helix/videos?id=${stream_id}`, { headers: headers });
        const data = await response.json();

        if (data.error) {
          console.error('Twitch API error:', data.error);
          return res.status(500).json({ error: 'Twitch API error', message: 'An error occurred while fetching stream data from Twitch API.' });
        }

        streamData = data.data[0];
      } else {
        return res.status(400).json({ error: 'Invalid platform', message: 'The specified platform is not supported.' });
      }

      if (!streamData) {
        console.log("streamData is nothing", streamData);
        return res.status(404).json({ error: 'Stream not found', message: `The stream with ID '${stream_id}' was not found.` });
      }

      // 配信者情報を取得
      let streamer = await prisma.streamer.findUnique({
        where: {
          streamer_id: platforms === 'youtube' ? streamData.snippet.channelId : streamData.user_id,
        },
      });

      // 配信者情報が存在しない場合、新しく作成
      if (!streamer) {
        streamer = await prisma.streamer.create({
          data: {
            streamer_id: platforms === 'youtube' ? streamData.snippet.channelId : streamData.user_id,
            name: platforms === 'youtube' ? streamData.snippet.channelTitle : streamData.user_name,
            url: platforms === 'youtube' ? `https://www.youtube.com/channel/${streamData.snippet.channelId}` : `https://www.twitch.tv/${streamData.user_login}`,
            platform: platforms,
          },
        });
      }

      // 配信情報が存在しない場合、fetch() した内容をもとに新たに作成
      stream = await prisma.stream.create({
        include: {
          streamer: true,
        },
        data: {
          stream_id: stream_id,
          stream_title: platforms === 'youtube' ? streamData.snippet.title : streamData.title,
          url: platforms === 'youtube' ? `https://www.youtube.com/watch?v=${streamData.id}` : `https://www.twitch.tv/videos/${streamData.id}`,
          platform: platforms,
          good_rate: 0,
          bad_rate: 0,
          streamer: {
            connect: {
              streamer_id: streamer.streamer_id,
            },
          },
        },
      });
    }

    // 配信のコメントを登録
    const comment = await prisma.streamComment.create({
      data: {
        comment_text: comment_text,
        stream: {
          connect: {
            stream_id: stream_id,
          },
        },
      },
    });

    res.status(201).json({ message: 'Comment added successfully', comment: comment });
  } catch (error) {
    console.error('Error adding stream comment:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while adding the stream comment.' });
  }
};
