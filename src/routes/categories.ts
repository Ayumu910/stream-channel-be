import express from 'express';
import { createCategoryHandler, getAllCategoriesHandler, addStreamerToCategoryHandler, getStreamersByCategoryHandler } from '../controllers/categoriesController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/categories', authenticateToken, createCategoryHandler);
router.get('/categories', authenticateToken, getAllCategoriesHandler);
router.post('/categories/:category_id', authenticateToken, addStreamerToCategoryHandler);
router.get('/categories/:category_id', authenticateToken, getStreamersByCategoryHandler);

export default router;