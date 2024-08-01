import express from 'express';
import { sanitizeInputs, sanitizeParams } from '../middlewares/xssProtection';
import { getStreamDetailHandler, postStreamRatingHandler, postStreamCommentHandler } from '../controllers/streamsController';

const router = express.Router();

// すべてのルートに sanitizeParams を適用
router.use(sanitizeParams);

router.get('/streams/:stream_id', getStreamDetailHandler);
router.post('/streams/:stream_id/ratings', postStreamRatingHandler);
router.post('/streams/:stream_id/comments', sanitizeInputs, postStreamCommentHandler);

export default router;