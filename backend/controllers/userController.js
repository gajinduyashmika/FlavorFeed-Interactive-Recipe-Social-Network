import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id || req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Get recipes created by this user
    const authoredRecipes = await Recipe.find({ author: user._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    // Get recipes saved by this user
    const savedRecipes = await Recipe.find({ _id: { $in: user.savedRecipes || [] } })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalLikesReceived = authoredRecipes.reduce((sum, r) => sum + (r.likes ? r.likes.length : 0), 0);

    res.status(200).json({
      success: true,
      user,
      stats: {
        authoredCount: authoredRecipes.length,
        savedCount: savedRecipes.length,
        totalLikesReceived,
      },
      authoredRecipes,
      savedRecipes,
    });
  } catch (err) {
    next(err);
  }
};
