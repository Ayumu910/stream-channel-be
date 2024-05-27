import { Request, Response } from 'express';
import { createCategory, getAllCategories } from '../services/categoryService';


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