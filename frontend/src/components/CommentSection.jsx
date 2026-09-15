import React, { useState } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

export const CommentSection = ({ recipeId, recipeAuthorId, initialComments = [], onCommentAdded }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to join the conversation.');
      return;
    }
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/recipes/${recipeId}/comments`, { text });
      if (res.success) {
        setComments(res.comments);
        setText('');
        toast.success('Comment posted!');
        if (onCommentAdded) onCommentAdded(res.comments);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const res = await api.delete(`/recipes/${recipeId}/comments/${commentId}`);
      if (res.success) {
        setComments(res.comments);
        toast.info('Comment removed.');
        if (onCommentAdded) onCommentAdded(res.comments);
      }
    } catch (err) {
      toast.error(err.message || 'Could not delete comment.');
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="comments-section glass-panel" id="comments">
      <div className="comments-header">
        <div className="comments-title-group">
          <MessageCircle size={22} color="var(--accent-primary)" />
          <h3>Community Discussion</h3>
          <span className="comments-count">({comments.length})</span>
        </div>
      </div>

      {/* Add Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <img src={user.avatar} alt={user.name} className="commenter-avatar" />
          <div className="input-btn-group">
            <textarea
              placeholder="Ask a question, share how it turned out, or suggest a culinary variation..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="comment-textarea"
              rows={2}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="btn btn-primary send-comment-btn"
            >
              <Send size={15} />
              <span>{submitting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="signin-prompt">
          <p>Have you tried this recipe? Sign in to share your thoughts and tips!</p>
        </div>
      )}

      {/* Comments Feed */}
      <div className="comments-feed">
        {comments.length === 0 ? (
          <div className="empty-comments">
            <p>No comments yet. Be the first to share your culinary notes!</p>
          </div>
        ) : (
          comments.map((c) => {
            const isCommentAuthor = user && (c.user._id === user._id || c.user === user._id);
            const isRecipeAuthor = user && (recipeAuthorId === user._id);
            const canDelete = isCommentAuthor || isRecipeAuthor;

            return (
              <div key={c._id} className="comment-card">
                <img
                  src={c.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={c.user.name}
                  className="comment-user-avatar"
                />

                <div className="comment-content-wrapper">
                  <div className="comment-top-line flex-between">
                    <div className="comment-author-meta">
                      <span className="comment-author-name">{c.user.name}</span>
                      {recipeAuthorId === (c.user._id || c.user) && (
                        <span className="creator-badge">Author</span>
                      )}
                      <span className="comment-time">{formatDate(c.createdAt)}</span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="comment-delete-btn"
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="comment-text-body">{c.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .comments-section {
          padding: 2rem;
          margin-top: 2.5rem;
        }
        .comments-header {
          margin-bottom: 1.5rem;
        }
        .comments-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .comments-title-group h3 {
          font-size: 1.35rem;
          color: #fff;
        }
        .comments-count {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
        }
        .comment-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }
        .commenter-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .input-btn-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .comment-textarea {
          width: 100%;
          background: #141822;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          color: #fff;
          font-size: 0.95rem;
          resize: none;
        }
        .comment-textarea:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.2);
        }
        .send-comment-btn {
          align-self: flex-end;
          padding: 0.5rem 1.25rem;
          font-size: 0.85rem;
        }
        .signin-prompt {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--border-subtle);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        .comments-feed {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .empty-comments {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          padding: 1.5rem 0;
        }
        .comment-card {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .comment-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .comment-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .comment-content-wrapper {
          flex: 1;
        }
        .comment-author-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .comment-author-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: #fff;
        }
        .creator-badge {
          background: rgba(255, 107, 53, 0.2);
          color: var(--accent-primary);
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .comment-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .comment-delete-btn {
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .comment-delete-btn:hover {
          color: var(--accent-red);
        }
        .comment-text-body {
          margin-top: 0.35rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
