import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ServingsScaler } from '../components/ServingsScaler';
import { CookModeModal } from '../components/CookModeModal';
import { StarRating } from '../components/StarRating';
import { CommentSection } from '../components/CommentSection';
import {
  Heart,
  Bookmark,
  Share2,
  Printer,
  Clock,
  PlayCircle,
  Edit3,
  Trash2,
  ChefHat,
  ArrowLeft,
  Flame,
} from 'lucide-react';

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookModeOpen, setCookModeOpen] = useState(false);

  // Social states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/recipes/${id}`);
        if (res.success && res.recipe) {
          setRecipe(res.recipe);
          setLiked(res.recipe.isLiked);
          setLikeCount(res.recipe.likeCount || (res.recipe.likes ? res.recipe.likes.length : 0));
          setSaved(res.recipe.isSaved);
        }
      } catch (err) {
        toast.error('Recipe not found or failed to load.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!user) {
      toast.info('Please sign in to like this recipe.');
      navigate('/login');
      return;
    }

    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.put(`/recipes/${id}/like`);
      if (res.success) {
        setLiked(res.isLiked);
        setLikeCount(res.likeCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error('Could not update like.');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.info('Please sign in to bookmark recipes.');
      navigate('/login');
      return;
    }

    const prevSaved = saved;
    setSaved(!prevSaved);

    try {
      const res = await api.put(`/recipes/${id}/save`);
      if (res.success) {
        setSaved(res.isSaved);
        toast.success(res.isSaved ? 'Added to your cookbook!' : 'Removed from cookbook.');
        setUser((prev) => {
          if (!prev) return prev;
          let updated = [...(prev.savedRecipes || [])];
          if (res.isSaved) {
            updated.push(id);
          } else {
            updated = updated.filter((item) => (item._id || item) !== id);
          }
          return { ...prev, savedRecipes: updated };
        });
      }
    } catch {
      setSaved(prevSaved);
      toast.error('Could not update cookbook.');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Recipe link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
      return;
    }

    try {
      const res = await api.delete(`/recipes/${id}`);
      if (res.success) {
        toast.success('Recipe deleted successfully.');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete recipe.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <ChefHat size={48} className="spin-animation" color="var(--accent-primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Prepping recipe details...</p>
      </div>
    );
  }

  if (!recipe) return null;

  const isAuthor = user && recipe.author && (recipe.author._id === user._id || recipe.author === user._id);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <article className="recipe-detail-page">
      {/* Top Back Nav */}
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Header Container */}
      <header className="container recipe-hero-header">
        <div className="hero-category-row">
          <span className="badge badge-orange">{recipe.cuisine || 'International'}</span>
          {recipe.category?.map((cat, idx) => (
            <span key={idx} className="badge badge-yellow">{cat}</span>
          ))}
          {recipe.difficulty && (
            <span className={`badge ${recipe.difficulty === 'Easy' ? 'badge-green' : 'badge-orange'}`}>
              {recipe.difficulty}
            </span>
          )}
        </div>

        <h1 className="recipe-main-title">{recipe.title}</h1>

        <div className="recipe-author-bar flex-between">
          {recipe.author && (
            <Link to={`/profile/${recipe.author._id || recipe.author}`} className="author-chip">
              <img
                src={recipe.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={recipe.author.name}
                className="chip-avatar"
              />
              <div>
                <p className="chip-name">{recipe.author.name}</p>
                <p className="chip-role">Creator & Foodie</p>
              </div>
            </Link>
          )}

          {/* Rating Widget */}
          <StarRating
            recipeId={recipe._id}
            currentRating={recipe.userRating || 0}
            averageRating={recipe.averageRating || 0}
            totalRatings={recipe.ratings?.length || 0}
            onRateSuccess={(res) => {
              setRecipe((prev) => ({
                ...prev,
                averageRating: res.averageRating,
                ratings: [...(prev.ratings || []), { user: user._id, rating: res.userRating }],
              }));
            }}
          />
        </div>
      </header>

      {/* Hero Media + Action Bar */}
      <div className="container">
        <div className="hero-image-wrapper">
          <img src={recipe.imageUrl} alt={recipe.title} className="hero-full-image" />
        </div>

        {/* Action Controls Toolbar */}
        <div className="action-toolbar glass-panel flex-between">
          <div className="toolbar-left-group">
            <button
              onClick={handleLike}
              className={`btn ${liked ? 'btn-primary' : 'btn-secondary'}`}
              aria-label="Like Recipe"
            >
              <Heart size={18} fill={liked ? '#fff' : 'none'} />
              <span>{liked ? 'Liked' : 'Like'} ({likeCount})</span>
            </button>

            <button
              onClick={handleSave}
              className={`btn ${saved ? 'btn-outline' : 'btn-secondary'}`}
              aria-label="Save Recipe"
            >
              <Bookmark size={18} fill={saved ? 'var(--accent-secondary)' : 'none'} />
              <span>{saved ? 'Saved in Cookbook' : 'Save to Cookbook'}</span>
            </button>

            <button onClick={() => setCookModeOpen(true)} className="btn btn-primary cook-mode-launch-btn">
              <PlayCircle size={18} />
              <span>Start Cook Mode</span>
            </button>
          </div>

          <div className="toolbar-right-group">
            <button onClick={handleShare} className="icon-toolbar-btn" title="Share Recipe">
              <Share2 size={18} />
            </button>
            <button onClick={handlePrint} className="icon-toolbar-btn" title="Print Recipe">
              <Printer size={18} />
            </button>

            {isAuthor && (
              <div className="author-management-btns">
                <Link to={`/edit-recipe/${recipe._id}`} className="icon-toolbar-btn edit" title="Edit Recipe">
                  <Edit3 size={18} />
                </Link>
                <button onClick={handleDelete} className="icon-toolbar-btn delete" title="Delete Recipe">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meta Stats Quick Glance Bar */}
        <div className="quick-stats-grid">
          <div className="quick-stat-box glass-panel">
            <Clock size={20} color="var(--accent-primary)" />
            <div>
              <span className="stat-value">{recipe.prepTime} mins</span>
              <span className="stat-label">Prep Time</span>
            </div>
          </div>

          <div className="quick-stat-box glass-panel">
            <Flame size={20} color="var(--accent-secondary)" />
            <div>
              <span className="stat-value">{recipe.cookTime} mins</span>
              <span className="stat-label">Cook Time</span>
            </div>
          </div>

          <div className="quick-stat-box glass-panel">
            <Clock size={20} color="var(--accent-emerald)" />
            <div>
              <span className="stat-value">{totalTime} mins</span>
              <span className="stat-label">Total Time</span>
            </div>
          </div>
        </div>

        {/* Description & Story */}
        <section className="recipe-story-section">
          <h2>About this Recipe</h2>
          <p className="recipe-story-text">{recipe.description}</p>
        </section>

        {/* Main Cooking Content Layout */}
        <div className="recipe-recipe-grid">
          {/* Ingredients with Dynamic Servings Scaler */}
          <aside className="recipe-ingredients-col">
            <ServingsScaler
              baseServings={recipe.servings || 4}
              ingredients={recipe.ingredients || []}
            />
          </aside>

          {/* Instructions Column */}
          <main className="recipe-instructions-col">
            <div className="instructions-card glass-panel">
              <div className="instructions-header flex-between">
                <h2>Step-by-Step Instructions</h2>
                <button
                  onClick={() => setCookModeOpen(true)}
                  className="btn btn-outline btn-sm"
                >
                  <PlayCircle size={15} />
                  <span>Launch Guided Cook Mode</span>
                </button>
              </div>

              <ol className="instructions-step-list">
                {recipe.instructions?.map((inst, idx) => (
                  <li key={idx} className="instruction-step-item">
                    <div className="step-number-bubble">{inst.stepNumber || idx + 1}</div>
                    <div className="step-content">
                      <p className="step-text">{inst.text}</p>
                      {inst.timerMinutes > 0 && (
                        <div className="step-timer-tag">
                          <Clock size={14} />
                          <span>Timer: {inst.timerMinutes} mins</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </main>
        </div>

        {/* Community Discussion Section */}
        <CommentSection
          recipeId={recipe._id}
          recipeAuthorId={recipe.author?._id || recipe.author}
          initialComments={recipe.comments || []}
        />
      </div>

      {/* Full-Screen Guided Cook Mode */}
      <CookModeModal
        isOpen={cookModeOpen}
        onClose={() => setCookModeOpen(false)}
        recipeTitle={recipe.title}
        instructions={recipe.instructions || []}
      />

      <style>{`
        .recipe-detail-page {
          padding-bottom: 5rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          transition: color var(--transition-fast);
        }
        .back-link:hover {
          color: var(--accent-primary);
        }
        .recipe-hero-header {
          margin-bottom: 2rem;
        }
        .hero-category-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .recipe-main-title {
          font-size: 2.75rem;
          font-weight: 800;
          line-height: 1.2;
          color: #fff;
          margin-bottom: 1.5rem;
        }
        .recipe-author-bar {
          flex-wrap: wrap;
          gap: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .author-chip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .chip-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
        }
        .chip-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: #fff;
        }
        .chip-role {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .hero-image-wrapper {
          width: 100%;
          height: 480px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-lg);
        }
        .hero-full-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .action-toolbar {
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .toolbar-left-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }
        .cook-mode-launch-btn {
          background: linear-gradient(135deg, #ff6b35 0%, #f7c548 100%);
        }
        .toolbar-right-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .icon-toolbar-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .icon-toolbar-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .icon-toolbar-btn.edit:hover {
          color: var(--accent-secondary);
          border-color: var(--accent-secondary);
        }
        .icon-toolbar-btn.delete:hover {
          color: var(--accent-red);
          border-color: var(--accent-red);
        }
        .author-management-btns {
          display: flex;
          gap: 0.5rem;
          margin-left: 0.5rem;
          padding-left: 0.5rem;
          border-left: 1px solid var(--border-subtle);
        }
        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .quick-stat-box {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-value {
          display: block;
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
        }
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .recipe-story-section {
          margin-bottom: 2.5rem;
        }
        .recipe-story-section h2 {
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 0.75rem;
        }
        .recipe-story-text {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 850px;
        }
        .recipe-recipe-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        .instructions-card {
          padding: 2rem;
        }
        .instructions-header {
          margin-bottom: 1.75rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle);
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .instructions-header h2 {
          font-size: 1.35rem;
          color: #fff;
        }
        .instructions-step-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .instruction-step-item {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
        }
        .step-number-bubble {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: #fff;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(255, 107, 53, 0.35);
        }
        .step-content {
          flex: 1;
        }
        .step-text {
          font-size: 1rem;
          color: var(--text-primary);
          line-height: 1.65;
        }
        .step-timer-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(247, 197, 72, 0.12);
          border: 1px solid rgba(247, 197, 72, 0.3);
          color: var(--accent-secondary);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.65rem;
        }
        .spin-animation {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .recipe-recipe-grid {
            grid-template-columns: 1fr;
          }
          .hero-image-wrapper {
            height: 320px;
          }
          .recipe-main-title {
            font-size: 2rem;
          }
          .quick-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </article>
  );
};
