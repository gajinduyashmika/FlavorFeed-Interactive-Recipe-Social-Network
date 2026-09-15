import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleLike,
  toggleSave,
  addComment,
  deleteComment,
  rateRecipe,
} from '../controllers/recipeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getRecipes);
router.get('/:id', optionalAuth, getRecipeById);

router.post('/', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);
router.delete('/:id', protect, deleteRecipe);

// Social routes
router.put('/:id/like', protect, toggleLike);
router.put('/:id/save', protect, toggleSave);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/rate', protect, rateRecipe);

export default router;
