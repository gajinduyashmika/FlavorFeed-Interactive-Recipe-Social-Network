import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const instructionSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Instruction step description is required'],
      trim: true,
    },
    timerMinutes: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    },
    text: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [120, 'Recipe title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    prepTime: {
      type: Number,
      required: [true, 'Preparation time (in minutes) is required'],
      min: [0, 'Prep time cannot be negative'],
    },
    cookTime: {
      type: Number,
      required: [true, 'Cooking time (in minutes) is required'],
      min: [0, 'Cook time cannot be negative'],
    },
    servings: {
      type: Number,
      default: 4,
      min: [1, 'Servings must be at least 1'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    cuisine: {
      type: String,
      default: 'International',
      trim: true,
    },
    category: [
      {
        type: String,
        trim: true,
      },
    ],
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Recipe must have at least one ingredient',
      },
    },
    instructions: {
      type: [instructionSchema],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Recipe must have at least one instruction step',
      },
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipe must belong to an author'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    ratings: [ratingSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for average rating
recipeSchema.virtual('averageRating').get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / this.ratings.length).toFixed(1));
});

// Virtual for like count
recipeSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
recipeSchema.virtual('commentCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

// Text index for search across title, description, cuisine, category, and ingredients
recipeSchema.index({
  title: 'text',
  description: 'text',
  cuisine: 'text',
  category: 'text',
  'ingredients.name': 'text',
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
