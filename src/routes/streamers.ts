import express from 'express';
import { getStreamerDetailHandler, getStreamerCommentsHandler, postStreamerCommentHandler } from '../controllers/streamersController';

const router = express.Router();

router.get('/streamer/:streamer_id', getStreamerDetailHandler);
router.get('/streamer/:streamer_id/comments', getStreamerCommentsHandler);
router.post('/streamer/:streamer_id/comments', postStreamerCommentHandler);

export default router;