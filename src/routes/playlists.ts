import express from 'express';
import { sanitizeInputs, sanitizeParams } from '../middlewares/xssProtection';
import { createPlaylistHandler, getAllPlaylistsHandler,
    addStreamToPlaylistHandler,getStreamsFromPlaylistHandler,
    deletePlaylistHandler, updatePlaylistShareHandler,
    removeStreamFromPlaylistHandler, getRecommendedPlaylistsHandler } from '../controllers/playlistsController';

import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/playlists', authenticateToken, sanitizeInputs, createPlaylistHandler);
router.get('/playlists', authenticateToken, getAllPlaylistsHandler);
router.post('/playlists/:playlist_id', authenticateToken, sanitizeParams, sanitizeInputs, addStreamToPlaylistHandler);
router.get('/playlists/:playlist_id', authenticateToken, sanitizeParams, getStreamsFromPlaylistHandler);
router.delete('/playlists/:playlist_id', authenticateToken, sanitizeParams, deletePlaylistHandler);
router.put('/playlists/:playlist_id/share', authenticateToken,sanitizeParams, updatePlaylistShareHandler);
router.delete('/playlists/:playlist_id/streams/:stream_id', authenticateToken, sanitizeParams, removeStreamFromPlaylistHandler);
router.get('/recommended-playlists', getRecommendedPlaylistsHandler);

export default router;