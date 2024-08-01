import express from 'express';
import { sanitizeInputs, sanitizeParams } from '../middlewares/xssProtection';
import { createCategoryHandler, getAllCategoriesHandler, addStreamerToCategoryHandler,
      getStreamersByCategoryHandler, deleteCategoryHandler,shareCategoryHandler,
      removeStreamerFromCategoryHandler, getRecommendedCategoriesHandler } from '../controllers/categoriesController';

import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/categories', authenticateToken, sanitizeInputs, createCategoryHandler);
router.get('/categories', authenticateToken, getAllCategoriesHandler);
router.post('/categories/:category_id', authenticateToken, sanitizeParams, sanitizeInputs, addStreamerToCategoryHandler);
router.get('/categories/:category_id', authenticateToken, sanitizeParams, getStreamersByCategoryHandler);
router.delete('/categories/:category_id', authenticateToken, sanitizeParams, deleteCategoryHandler);
router.put('/categories/:category_id/share', authenticateToken, sanitizeParams, shareCategoryHandler);
router.delete('/categories/:category_id/streamers/:streamer_id', authenticateToken, sanitizeParams, removeStreamerFromCategoryHandler);
router.get('/recommended-categories', getRecommendedCategoriesHandler);

export default router;