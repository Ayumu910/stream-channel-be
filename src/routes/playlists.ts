import express from 'express';
import { createPlaylistHandler, getAllPlaylistsHandler,addStreamToPlaylistHandler,getStreamsFromPlaylistHandler } from '../controllers/playlistsController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/playlists', authenticateToken, createPlaylistHandler);
router.get('/playlists', authenticateToken, getAllPlaylistsHandler);
router.post('/playlists/:playlist_id', authenticateToken, addStreamToPlaylistHandler);
router.get('/playlists/:playlist_id', authenticateToken, getStreamsFromPlaylistHandler);

export default router;