import express from 'express';
import { sanitizeInputs, sanitizeParams } from '../middlewares/xssProtection';
import { getStreamerDetailHandler, getStreamerCommentsHandler, postStreamerCommentHandler, getStreamerAnalyticsHandler, postStreamerAnalyticsHandler } from '../controllers/streamersController';

const router = express.Router();

// すべてのルートに sanitizeParams を適用
router.use(sanitizeParams);

router.get('/streamer/:streamer_id', getStreamerDetailHandler);
router.get('/streamer/:streamer_id/comments', getStreamerCommentsHandler);
router.post('/streamer/:streamer_id/comments', sanitizeInputs, postStreamerCommentHandler);
router.post('/streamer/:streamer_id/analytics', postStreamerAnalyticsHandler);
router.get('/streamer/:streamer_id/analytics', getStreamerAnalyticsHandler);

export default router;