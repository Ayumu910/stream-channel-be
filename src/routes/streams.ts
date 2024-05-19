import express from 'express';
import { getStreamDetail, postStreamRating, postStreamComment } from '../controllers/streamsController';

const router = express.Router();

router.get('/streams/:stream_id', getStreamDetail);
router.post('/streams/:stream_id/ratings', postStreamRating);
router.post('/streams/:stream_id/comments', postStreamComment);

export default router;