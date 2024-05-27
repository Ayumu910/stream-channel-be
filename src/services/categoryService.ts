import { createStreamerCategory, findAllStreamerCategoriesByUserId } from '../repositories/categoryRepository';

export async function createCategory(title: string, userId: string) {
  return await createStreamerCategory(title, userId);
}

export async function getAllCategories(userId: string) {
  return await findAllStreamerCategoriesByUserId(userId);
}