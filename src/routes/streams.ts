import express from 'express';
import { getStreamDetail } from '../controllers/streamsController';

const router = express.Router();

router.get('/streams/:stream_id', getStreamDetail);

export default router;