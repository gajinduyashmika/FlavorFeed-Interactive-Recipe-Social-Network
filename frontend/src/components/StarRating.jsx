import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

export const StarRating = ({ recipeId, currentRating = 0, averageRating = 0, totalRatings = 0, onRateSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(currentRating);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (val) => {
    if (!user) {
      toast.info('Please sign in to rate this recipe.');
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/recipes/${recipeId}/rate`, { rating: val });
      if (res.success) {
        setUserRating(val);
        toast.success(`You gave this recipe ${val} stars!`);
        if (onRateSuccess) onRateSuccess(res);
      }
    } catch (err) {
      toast.error(err.message || 'Could not save your rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="star-rating-widget">
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = hoverRating ? star <= hoverRating : star <= (userRating || Math.round(averageRating));
          return (
            <button
              key={star}
              type="button"
              className="star-btn"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
              disabled={submitting}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                size={22}
                fill={filled ? '#f7c548' : 'none'}
                color={filled ? '#f7c548' : 'var(--text-muted)'}
                strokeWidth={1.75}
              />
            </button>
          );
        })}
      </div>

      <div className="rating-summary-text">
        {averageRating > 0 ? (
          <span>
            <strong>{averageRating}</strong> ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
          </span>
        ) : (
          <span>Be the first to rate!</span>
        )}
        {userRating > 0 && <span className="your-rating-badge">Your rating: {userRating}★</span>}
      </div>

      <style>{`
        .star-rating-widget {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .stars-row {
          display: flex;
          gap: 0.25rem;
        }
        .star-btn {
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.1rem;
          transition: transform var(--transition-fast);
        }
        .star-btn:hover {
          transform: scale(1.2);
        }
        .rating-summary-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .rating-summary-text strong {
          color: #fff;
        }
        .your-rating-badge {
          background: rgba(247, 197, 72, 0.15);
          color: #f7c548;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
