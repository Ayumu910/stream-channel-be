import express from 'express';
import { getStreamDetail, postStreamRating } from '../controllers/streamsController';

const router = express.Router();

router.get('/streams/:stream_id', getStreamDetail);
router.post('/streams/:stream_id/ratings', postStreamRating);

export default router;