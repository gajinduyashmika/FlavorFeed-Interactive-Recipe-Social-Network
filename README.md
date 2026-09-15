# 🍳 FlavorFeed — Interactive Recipe Social Network

> The interactive culinary social platform for home cooks, bakers, and food explorers to discover authentic global recipes, cook with live step timers, scale servings dynamically, and curate personal digital cookbooks.

---

## 🚀 Key Features

### 🌟 Core Capabilities
- **Authentication & Security**: Secure registration and login using JSON Web Tokens (JWT) stored in HTTP-only cookies with automatic session hydration.
- **Recipe Management (CRUD)**: Create, view, edit, and delete rich recipe documents with Title, Description, Prep Time, Cook Time, Servings, Cuisine, Difficulty, Categories, Ingredients, and Instructions.
- **Multipart Image Uploads**: Integrated image uploads using **Multer** with preview, format validation, and support for external image URLs.
- **Social Engagement**:
  - **Dynamic Likes**: Real-time optimistic like/unlike toggle with live like counter.
  - **Community Discussion**: Nested comment threads with author attribution and creator badges.
  - **Star Ratings (1–5 Stars)**: Interactive star rating widget calculating live average ratings and review counts.
- **Search & Discovery**: Multi-field search across titles, descriptions, cuisines, categories, and ingredients using regex/text queries, combined with quick category pills (Sri Lankan, Italian, Vegan, Dessert, Street Food, etc.).

### 💡 Advanced Culinary Innovations
1. **Interactive Servings Scaler**: Effortlessly scale ingredient quantities up or down in real time based on your party size.
2. **Mise en Place Checklist**: Click ingredients to mark them as gathered and prepared.
3. **Distraction-Free "Cook Mode"**: Step-by-step full-screen cooking guide with:
   - Live step progress tracking
   - Automated countdown step timers with audio-alert support
   - Confetti celebration upon completing all cooking steps
4. **Personal Digital Cookbook**: Fast 1-click bookmarking of recipes into personal collections accessible on user profiles.
5. **One-Click Demo Logins**: Pre-configured demo accounts (Chef Kasun, Chef Sofia, Maya Lin) for instant review without typing.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Lucide React, Canvas-Confetti, Vite.
  - *Strictly pure JavaScript (No TypeScript)*.
  - *Custom Vanilla CSS design system (Dark culinary aesthetic, glassmorphism, responsive masonry grid)*.
- **Backend**: Node.js, Express.js.
  - *Strictly pure JavaScript (ES Modules)*.
  - *Multer* for image uploads.
  - *JWT* & *Cookie-Parser* for authentication.
- **Database**: MongoDB with Mongoose ODM.
  - Out-of-the-box support for external MongoDB / Atlas.
  - Automatic zero-config fallback to embedded in-memory MongoDB (`mongodb-memory-server`) if no local database is running.

---

## 📂 Project Structure

```
recipe_network/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection & memory server fallback
│   ├── controllers/
│   │   ├── authController.js  # Auth & profile logic
│   │   ├── recipeController.js# CRUD, search, likes, comments, ratings
│   │   └── userController.js  # User profile & saved recipes
│   ├── middleware/
│   │   ├── auth.js            # JWT protection
│   │   ├── errorHandler.js    # Centralized error handler
│   │   └── upload.js          # Multer storage configuration
│   ├── models/
│   │   ├── Recipe.js          # Recipe schema with text search indexes
│   │   └── User.js            # User schema with bcrypt encryption
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── recipeRoutes.js
│   │   └── userRoutes.js
│   ├── seed/
│   │   ├── autoSeed.js        # Auto-seed on first boot
│   │   └── seedData.js        # Realistic gourmet seed data
│   ├── server.js              # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js      # Fetch wrapper with credentials
│   │   ├── components/        # Navbar, Footer, RecipeCard, RecipeFilter, ServingsScaler, CookMode, StarRating, CommentSection, ImageUpload
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── pages/             # HomePage, RecipeDetailPage, CreateRecipePage, EditRecipePage, ProfilePage, LoginPage, RegisterPage
│   │   ├── index.css          # Design system tokens & animations
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── package.json               # Root scripts
```

---

## ⚡ Getting Started

### 1. Install Dependencies
In the project root:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment (Optional)
A default `.env` is already configured in `backend/`. If you want to connect to a specific MongoDB instance or Atlas cluster:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/flavorfeed
JWT_SECRET=flavorfeed_super_secret_jwt_key_2026_recipe_network
FRONTEND_URL=http://localhost:5173
```
*Note: If `MONGODB_URI` is left blank, FlavorFeed automatically uses an embedded in-memory MongoDB instance.*

### 3. Run the Servers
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be live at:
- **Frontend SPA**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 🧑‍🍳 Demo User Accounts
You can sign in using one click on the login page or with the following credentials:
- **Chef Kasun Silva**: `kasun@flavorfeed.com` / `password123`
- **Chef Sofia Rossi**: `sofia@flavorfeed.com` / `password123`
- **Maya Lin**: `maya@flavorfeed.com` / `password123`

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in and receive HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Clear user session | Yes |
| `GET` | `/api/auth/me` | Get current logged-in user | Yes |
| `PUT` | `/api/auth/profile` | Update profile bio & avatar | Yes |
| `GET` | `/api/recipes` | Search and filter recipes | No (Optional) |
| `GET` | `/api/recipes/:id` | Get full recipe details | No (Optional) |
| `POST` | `/api/recipes` | Create new recipe (Multipart) | Yes |
| `PUT` | `/api/recipes/:id` | Update authored recipe | Yes |
| `DELETE` | `/api/recipes/:id` | Delete authored recipe | Yes |
| `PUT` | `/api/recipes/:id/like` | Toggle recipe like status | Yes |
| `PUT` | `/api/recipes/:id/save` | Toggle cookbook save status | Yes |
| `POST` | `/api/recipes/:id/rate` | Submit 1–5 star rating | Yes |
| `POST` | `/api/recipes/:id/comments` | Post a comment | Yes |
| `DELETE` | `/api/recipes/:id/comments/:cId` | Delete a comment | Yes |
| `GET` | `/api/users/profile/:id` | Get profile with creations & cookbook | No |
