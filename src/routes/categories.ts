import express from 'express';
import { createCategoryHandler, getAllCategoriesHandler, addStreamerToCategoryHandler,
      getStreamersByCategoryHandler, deleteCategoryHandler,shareCategoryHandler,
      removeStreamerFromCategoryHandler, getRecommendedCategoriesHandler } from '../controllers/categoriesController';

import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/categories', authenticateToken, createCategoryHandler);
router.get('/categories', authenticateToken, getAllCategoriesHandler);
router.post('/categories/:category_id', authenticateToken, addStreamerToCategoryHandler);
router.get('/categories/:category_id', authenticateToken, getStreamersByCategoryHandler);
router.delete('/categories/:category_id', authenticateToken, deleteCategoryHandler);
router.put('/categories/:category_id/share', authenticateToken, shareCategoryHandler);
router.delete('/categories/:category_id/streamers/:streamer_id', authenticateToken, removeStreamerFromCategoryHandler);
router.get('/recommended-categories', getRecommendedCategoriesHandler);

export default router;