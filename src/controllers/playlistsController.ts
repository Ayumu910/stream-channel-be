import { Request, Response } from 'express';
import { createPlaylist, getAllPlaylists,
  addStreamToPlaylist, getStreamsFromPlaylist,
  deletePlaylist, updatePlaylistShare,
  removeStreamFromPlaylist } from '../services/playlistService';

export const createPlaylistHandler = async (req: Request, res: Response) => {
  const { playlist_title } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    const playlist = await createPlaylist(playlist_title, userId);
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while creating the playlist.' });
  }
};

export const getAllPlaylistsHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    const playlists = await getAllPlaylists(userId);
    res.status(200).json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while fetching the playlists.' });
  }
};

export const addStreamToPlaylistHandler = async (req: Request, res: Response) => {
  const { playlist_id } = req.params;
  const { stream_url } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    await addStreamToPlaylist(playlist_id, stream_url, userId);
    res.status(201).json({ message: 'Stream added to playlist successfully' });
  } catch (error) {
    console.error('Error adding stream to playlist:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while adding the stream to the playlist.' });
  }
};

export const getStreamsFromPlaylistHandler = async (req: Request, res: Response) => {
  const { playlist_id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    const streams = await getStreamsFromPlaylist(playlist_id, userId);
    res.status(200).json(streams);
  } catch (error) {
    console.error('Error fetching streams from playlist:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while fetching the streams from the playlist.' });
  }
};

export const deletePlaylistHandler = async (req: Request, res: Response) => {
  const { playlist_id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    await deletePlaylist(playlist_id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while deleting the playlist.' });
  }
};

export const updatePlaylistShareHandler = async (req: Request, res: Response) => {
  const { playlist_id } = req.params;
  const { share } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    await updatePlaylistShare(playlist_id, userId, share);
    res.status(200).json({ message: 'Playlist share status updated successfully' });
  } catch (error) {
    console.error('Error updating playlist share status:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while updating the playlist share status.' });
  }
};

export const removeStreamFromPlaylistHandler = async (req: Request, res: Response) => {
  const { playlist_id, stream_id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    await removeStreamFromPlaylist(playlist_id, stream_id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing stream from playlist:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while removing the stream from the playlist.' });
  }
};