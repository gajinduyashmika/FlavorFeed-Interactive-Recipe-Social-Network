import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get profile by id (or self if no id provided)
router.get('/profile', protect, getUserProfile);
router.get('/profile/:id', getUserProfile);

export default router;
