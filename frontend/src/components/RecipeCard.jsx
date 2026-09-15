import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Clock, Bookmark, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

export const RecipeCard = ({ recipe, onUpdate }) => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(
    user && recipe.likes ? recipe.likes.some((id) => (id._id || id) === user._id) : false
  );
  const [likeCount, setLikeCount] = useState(recipe.likeCount || (recipe.likes ? recipe.likes.length : 0));
  const [saved, setSaved] = useState(
    user && user.savedRecipes ? user.savedRecipes.some((r) => (r._id || r) === recipe._id) : false
  );
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Please sign in to like recipes.');
      navigate('/login');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic toggle
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.put(`/recipes/${recipe._id}/like`);
      if (res.success) {
        setLiked(res.isLiked);
        setLikeCount(res.likeCount);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error('Failed to update like status.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Please sign in to save recipes to your cookbook.');
      navigate('/login');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    const prevSaved = saved;
    setSaved(!prevSaved);

    try {
      const res = await api.put(`/recipes/${recipe._id}/save`);
      if (res.success) {
        setSaved(res.isSaved);
        toast.success(res.isSaved ? 'Saved to your cookbook!' : 'Removed from cookbook.');
        
        // Update user saved recipes array in context
        setUser((prev) => {
          if (!prev) return prev;
          let updatedSaved = [...(prev.savedRecipes || [])];
          if (res.isSaved) {
            updatedSaved.push(recipe._id);
          } else {
            updatedSaved = updatedSaved.filter((id) => (id._id || id) !== recipe._id);
          }
          return { ...prev, savedRecipes: updatedSaved };
        });

        if (onUpdate) onUpdate();
      }
    } catch (err) {
      setSaved(prevSaved);
      toast.error('Failed to update bookmark.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="recipe-card glass-panel">
      <Link to={`/recipe/${recipe._id}`} className="card-media-wrapper">
        <img
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
          alt={recipe.title}
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay" />

        <div className="card-top-badges">
          <span className="badge badge-orange">{recipe.cuisine || 'Gourmet'}</span>
          {recipe.difficulty && (
            <span className={`badge ${recipe.difficulty === 'Easy' ? 'badge-green' : 'badge-yellow'}`}>
              {recipe.difficulty}
            </span>
          )}
        </div>

        <div className="card-action-floating">
          <button
            className={`action-pill ${saved ? 'active-save' : ''}`}
            onClick={handleSave}
            title={saved ? 'Remove from Cookbook' : 'Save to Cookbook'}
            aria-label="Save Recipe"
          >
            <Bookmark size={16} fill={saved ? 'var(--accent-secondary)' : 'none'} color={saved ? 'var(--accent-secondary)' : '#fff'} />
          </button>
        </div>
      </Link>

      <div className="card-content">
        <div className="card-meta-row">
          <div className="card-time">
            <Clock size={14} />
            <span>{totalTime} mins</span>
          </div>
          {recipe.averageRating > 0 && (
            <div className="card-rating">
              <Star size={13} fill="#f7c548" color="#f7c548" />
              <span>{recipe.averageRating}</span>
            </div>
          )}
        </div>

        <Link to={`/recipe/${recipe._id}`} className="card-title-link">
          <h3 className="card-title">{recipe.title}</h3>
        </Link>

        <p className="card-description">
          {recipe.description?.length > 95 ? `${recipe.description.substring(0, 95)}...` : recipe.description}
        </p>

        <div className="card-footer-row">
          {recipe.author && (
            <Link to={`/profile/${recipe.author._id || recipe.author}`} className="card-author">
              <img
                src={recipe.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={recipe.author.name}
                className="author-avatar"
              />
              <span className="author-name">{recipe.author.name}</span>
            </Link>
          )}

          <div className="card-interactions">
            <button
              className={`interaction-btn ${liked ? 'active-like' : ''}`}
              onClick={handleLike}
              aria-label="Like Recipe"
            >
              <Heart
                size={16}
                fill={liked ? 'var(--accent-primary)' : 'none'}
                color={liked ? 'var(--accent-primary)' : 'var(--text-secondary)'}
              />
              <span>{likeCount}</span>
            </button>

            <Link to={`/recipe/${recipe._id}#comments`} className="interaction-btn comment-btn">
              <MessageSquare size={15} color="var(--text-secondary)" />
              <span>{recipe.comments?.length || 0}</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .recipe-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
          position: relative;
        }
        .recipe-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(255, 107, 53, 0.3);
        }
        .card-media-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          display: block;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .recipe-card:hover .card-image {
          transform: scale(1.06);
        }
        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(14, 17, 23, 0.8) 100%);
        }
        .card-top-badges {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 2;
        }
        .card-action-floating {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          z-index: 2;
        }
        .action-pill {
          background: rgba(14, 17, 23, 0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-full);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .action-pill:hover {
          background: rgba(14, 17, 23, 0.9);
          transform: scale(1.1);
        }
        .active-save {
          border-color: var(--accent-secondary);
        }
        .card-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .card-time, .card-rating {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .card-rating {
          color: var(--accent-secondary);
          font-weight: 600;
        }
        .card-title-link {
          text-decoration: none;
        }
        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.45rem;
          transition: color var(--transition-fast);
          line-height: 1.35;
        }
        .card-title:hover {
          color: var(--accent-primary);
        }
        .card-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
          flex: 1;
        }
        .card-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
        }
        .card-author {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }
        .author-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          object-fit: cover;
        }
        .author-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .card-author:hover .author-name {
          color: #fff;
        }
        .card-interactions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .interaction-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: none;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .interaction-btn:hover {
          color: #fff;
        }
        .active-like {
          color: var(--accent-primary) !important;
        }
      `}</style>
    </div>
  );
};
