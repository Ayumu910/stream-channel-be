import { Request, Response } from 'express';
import { getStreamerDetail, getStreamerComments, postStreamerComment, postStreamerAnalytics, getStreamerAnalytics } from '../services/streamerService';

export const getStreamerDetailHandler = async (req: Request, res: Response) => {
  const { streamer_id } = req.params;
  const { platform } = req.query;

  try {
    const streamerDetail = await getStreamerDetail(streamer_id as string, platform as string);
    res.status(200).json(streamerDetail);
  } catch (error) {
    console.error('Error fetching streamer detail:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching the streamer detail.'
    });
  }
};

export const getStreamerCommentsHandler = async (req: Request, res: Response) => {
  const { streamer_id } = req.params;

  try {
    const comments = await getStreamerComments(streamer_id);
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching streamer comments:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching the streamer comments.'
    });
  }
};

export const postStreamerCommentHandler = async (req: Request, res: Response) => {
  const { streamer_id } = req.params;
  const { comment_text, platform } = req.body;

  try {
    const comment = await postStreamerComment(streamer_id, comment_text, platform);
    res.status(201).json({
      message: 'Comment added successfully',
      comment: comment
    });
  } catch (error) {
    console.error('Error adding streamer comment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while adding the streamer comment.'
    });
  }
};

export const postStreamerAnalyticsHandler = async (req: Request, res: Response) => {
  const { streamer_id } = req.params;
  const { age, gender, ratings, platform } = req.body;

  try {
    const analytics = await postStreamerAnalytics(streamer_id, age, gender, ratings, platform);
    res.status(201).json({
      message: 'Analytics added successfully',
      analytics: analytics
    });
  } catch (error) {
    console.error('Error adding streamer analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while adding the streamer analytics.'
    });
  }
};

export const getStreamerAnalyticsHandler = async (req: Request, res: Response) => {
  const { streamer_id } = req.params;
  const { platform } = req.query;

  try {
    const analytics = await getStreamerAnalytics(streamer_id, platform as string);
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching streamer analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching the streamer analytics.'
    });
  }
};