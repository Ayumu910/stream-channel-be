import express from 'express';
import { createCategoryHandler, getAllCategoriesHandler } from '../controllers/categoriesController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/categories', authenticateToken, createCategoryHandler);
router.get('/categories', authenticateToken, getAllCategoriesHandler);

export default router;