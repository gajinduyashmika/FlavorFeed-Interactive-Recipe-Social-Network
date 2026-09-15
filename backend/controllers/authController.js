import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'flavorfeed_super_secret_jwt_key_2026_recipe_network',
    { expiresIn: '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        savedRecipes: user.savedRecipes || [],
      },
    });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar, bio } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar: avatar || undefined,
      bio: bio || undefined,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }

    const user = await User.findOne({ email }).select('+password').populate('savedRecipes');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedRecipes');
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        savedRecipes: user.savedRecipes || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (avatar) fieldsToUpdate.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).populate('savedRecipes');

    res.status(200).json({
      success: true,
      user,
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};
