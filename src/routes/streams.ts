import express from 'express';
import { getStreamDetailHandler, postStreamRatingHandler, postStreamCommentHandler } from '../controllers/streamsController';

const router = express.Router();

router.get('/streams/:stream_id', getStreamDetailHandler);
router.post('/streams/:stream_id/ratings', postStreamRatingHandler);
router.post('/streams/:stream_id/comments', postStreamCommentHandler);

export default router;