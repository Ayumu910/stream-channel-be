import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getStreamDetail, createStreamComment, rateStream } from '../services/streamService';

const prisma = new PrismaClient();

export const getStreamDetailHandler = async (req: Request, res: Response) => {
  const { stream_id } = req.params;
  const { platforms } = req.query;

  try {
    const streamDetail = await getStreamDetail(stream_id, platforms as string);
    res.status(200).json(streamDetail);

    if (!streamDetail) {
      return res.status(404).json({ error: 'Stream not found', message: `The stream with ID '${stream_id}' was not found.` });
    }

  } catch (error) {
    console.error('Error fetching stream detail:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while fetching the stream detail.' });
  }
};

export const postStreamRatingHandler = async (req: Request, res: Response) => {
  const { stream_id } = req.params;
  const { rating, platforms } = req.body;

  try {
    let stream = await rateStream(stream_id, rating, platforms);
    res.status(200).json({ message: 'Rating updated successfully', stream: stream });
  } catch (error) {
    console.error('Error adding stream rating:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while adding the stream rating.' });
  }
};

export const postStreamCommentHandler = async (req: Request, res: Response) => {
  const { stream_id } = req.params;
  const { comment_text, platforms } = req.body;

  try {
    const comment = await createStreamComment(stream_id, comment_text, platforms);
    res.status(201).json({ message: 'Comment added successfully', comment: comment });
  } catch (error) {
    console.error('Error adding stream comment:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while adding the stream comment.' });
  }
};
