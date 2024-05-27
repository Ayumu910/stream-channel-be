import { Request, Response } from 'express';
import { createCategory, getAllCategories, addStreamerToCategory, getStreamersByCategory } from '../services/categoryService';


export const createCategoryHandler = async (req: Request, res: Response) => {
  const { title } = req.body;

  if (!req.user) {  //コンパイラを満足させるため
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    const category = await createCategory(title, userId);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while creating the category.' });
  }
};

export const getAllCategoriesHandler = async (req: Request, res: Response) => {
  if (!req.user) {  //コンパイラを満足させるため
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    const categories = await getAllCategories(userId);
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while fetching the categories.' });
  }
};

export const addStreamerToCategoryHandler = async (req: Request, res: Response) => {
  const { category_id } = req.params;
  const { streamer_url } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    const result = await addStreamerToCategory(category_id, streamer_url, userId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding streamer to category:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while adding the streamer to the category.' });
  }
};

export const getStreamersByCategoryHandler = async (req: Request, res: Response) => {
  const { category_id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  try {
    const result = await getStreamersByCategory(category_id, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching streamers by category:', error);
    res.status(500).json({ error: 'Internal server error', message: 'An error occurred while fetching the streamers by category.' });
  }
};