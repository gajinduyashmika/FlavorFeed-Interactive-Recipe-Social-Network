import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to safely parse JSON arrays sent via FormData
const safeParseArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return val.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

export const getRecipes = async (req, res, next) => {
  try {
    const { search, category, cuisine, difficulty, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Keyword Search (FR-4.1 & FR-4.2)
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { cuisine: regex },
        { 'category': regex },
        { 'ingredients.name': regex },
      ];
    }

    // Category Filter
    if (category && category !== 'All') {
      query.category = { $in: [new RegExp(`^${category.trim()}$`, 'i')] };
    }

    // Cuisine Filter
    if (cuisine && cuisine !== 'All') {
      query.cuisine = new RegExp(`^${cuisine.trim()}$`, 'i');
    }

    // Difficulty Filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default newest
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOptions = { 'likes.length': -1, createdAt: -1 };
    } else if (sort === 'fastest') {
      sortOptions = { cookTime: 1, prepTime: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Recipe.countDocuments(query);

    const recipes = await Recipe.find(query)
      .populate('author', 'name avatar bio')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Determine isLiked and isSaved for current user if logged in
    const currentUserId = req.user ? req.user._id.toString() : null;
    let savedRecipeIds = [];
    if (req.user && req.user.savedRecipes) {
      savedRecipeIds = req.user.savedRecipes.map((id) => id.toString());
    }

    const enhancedRecipes = recipes.map((recipe) => {
      const recipeObj = recipe.toObject({ virtuals: true });
      recipeObj.isLiked = currentUserId ? recipe.likes.some((id) => id.toString() === currentUserId) : false;
      recipeObj.isSaved = currentUserId ? savedRecipeIds.includes(recipe._id.toString()) : false;
      return recipeObj;
    });

    res.status(200).json({
      success: true,
      count: enhancedRecipes.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      recipes: enhancedRecipes,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('comments.user._id', 'name avatar');

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    let isSaved = false;

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.savedRecipes) {
        isSaved = user.savedRecipes.some((id) => id.toString() === recipe._id.toString());
      }
    }

    const recipeObj = recipe.toObject({ virtuals: true });
    recipeObj.isLiked = currentUserId ? recipe.likes.some((id) => id.toString() === currentUserId) : false;
    recipeObj.isSaved = isSaved;

    // Check if current user has rated
    if (currentUserId && recipe.ratings) {
      const existingRating = recipe.ratings.find((r) => r.user.toString() === currentUserId);
      recipeObj.userRating = existingRating ? existingRating.rating : 0;
    } else {
      recipeObj.userRating = 0;
    }

    res.status(200).json({ success: true, recipe: recipeObj });
  } catch (err) {
    next(err);
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    let {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      difficulty,
      cuisine,
      category,
      ingredients,
      instructions,
      imageUrl,
    } = req.body;

    // Parse ingredients if sent as string (e.g. from FormData)
    if (typeof ingredients === 'string') {
      try {
        ingredients = JSON.parse(ingredients);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid ingredients format.' });
      }
    }

    // Parse instructions if sent as string
    if (typeof instructions === 'string') {
      try {
        instructions = JSON.parse(instructions);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid instructions format.' });
      }
    }

    // Parse category
    category = safeParseArray(category);

    // If file was uploaded via Multer
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const recipe = await Recipe.create({
      title,
      description,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings) || 4,
      difficulty: difficulty || 'Easy',
      cuisine: cuisine || 'International',
      category: category || [],
      ingredients: ingredients || [],
      instructions: instructions || [],
      imageUrl: imageUrl || undefined,
      author: req.user._id,
    });

    const populatedRecipe = await Recipe.findById(recipe._id).populate('author', 'name avatar bio');

    res.status(201).json({
      success: true,
      recipe: populatedRecipe,
      message: 'Recipe created successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Ensure user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this recipe.' });
    }

    let {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      difficulty,
      cuisine,
      category,
      ingredients,
      instructions,
      imageUrl,
    } = req.body;

    if (ingredients && typeof ingredients === 'string') {
      ingredients = JSON.parse(ingredients);
    }
    if (instructions && typeof instructions === 'string') {
      instructions = JSON.parse(instructions);
    }
    if (category) {
      category = safeParseArray(category);
    }

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (prepTime !== undefined) updateData.prepTime = Number(prepTime);
    if (cookTime !== undefined) updateData.cookTime = Number(cookTime);
    if (servings !== undefined) updateData.servings = Number(servings);
    if (difficulty) updateData.difficulty = difficulty;
    if (cuisine) updateData.cuisine = cuisine;
    if (category) updateData.category = category;
    if (ingredients) updateData.ingredients = ingredients;
    if (instructions) updateData.instructions = instructions;
    if (imageUrl) updateData.imageUrl = imageUrl;

    recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('author', 'name avatar bio');

    res.status(200).json({
      success: true,
      recipe,
      message: 'Recipe updated successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Ensure user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this recipe.' });
    }

    // If local uploaded image, clean up file
    if (recipe.imageUrl && recipe.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', recipe.imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete image file:', e.message);
        }
      }
    }

    // Remove from all users' saved lists
    await User.updateMany(
      { savedRecipes: recipe._id },
      { $pull: { savedRecipes: recipe._id } }
    );

    await recipe.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const userId = req.user._id;
    const isLiked = recipe.likes.some((id) => id.toString() === userId.toString());

    if (isLiked) {
      recipe.likes = recipe.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      recipe.likes.push(userId);
    }

    await recipe.save();

    res.status(200).json({
      success: true,
      isLiked: !isLiked,
      likeCount: recipe.likes.length,
      message: !isLiked ? 'Recipe liked!' : 'Recipe unliked.',
    });
  } catch (err) {
    next(err);
  }
};

export const toggleSave = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedRecipes.some((id) => id.toString() === recipeId.toString());

    if (isSaved) {
      user.savedRecipes = user.savedRecipes.filter((id) => id.toString() !== recipeId.toString());
    } else {
      user.savedRecipes.push(recipeId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isSaved: !isSaved,
      message: !isSaved ? 'Recipe saved to your cookbook!' : 'Recipe removed from cookbook.',
    });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const comment = {
      user: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
      text: text.trim(),
      createdAt: new Date(),
    };

    recipe.comments.unshift(comment);
    await recipe.save();

    res.status(201).json({
      success: true,
      comments: recipe.comments,
      message: 'Comment posted successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const comment = recipe.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    // Only comment author or recipe author can delete
    const isCommentAuthor = comment.user._id.toString() === req.user._id.toString();
    const isRecipeAuthor = recipe.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isRecipeAuthor) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    recipe.comments.pull(commentId);
    await recipe.save();

    res.status(200).json({
      success: true,
      comments: recipe.comments,
      message: 'Comment deleted.',
    });
  } catch (err) {
    next(err);
  }
};

export const rateRecipe = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const existingIndex = recipe.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      recipe.ratings[existingIndex].rating = numRating;
      recipe.ratings[existingIndex].createdAt = new Date();
    } else {
      recipe.ratings.push({
        user: req.user._id,
        rating: numRating,
        createdAt: new Date(),
      });
    }

    await recipe.save();

    const sum = recipe.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Number((sum / recipe.ratings.length).toFixed(1));

    res.status(200).json({
      success: true,
      userRating: numRating,
      averageRating,
      totalRatings: recipe.ratings.length,
      message: 'Thank you for your rating!',
    });
  } catch (err) {
    next(err);
  }
};
