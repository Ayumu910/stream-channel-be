import express from 'express';
import { getStreamerDetailHandler, getStreamerCommentsHandler, postStreamerCommentHandler, getStreamerAnalyticsHandler, postStreamerAnalyticsHandler } from '../controllers/streamersController';

const router = express.Router();

router.get('/streamer/:streamer_id', getStreamerDetailHandler);
router.get('/streamer/:streamer_id/comments', getStreamerCommentsHandler);
router.post('/streamer/:streamer_id/comments', postStreamerCommentHandler);
router.post('/streamer/:streamer_id/analytics', postStreamerAnalyticsHandler);
router.get('/streamer/:streamer_id/analytics', getStreamerAnalyticsHandler);

export default router;