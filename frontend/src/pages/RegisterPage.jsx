import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Flame, UserPlus } from 'lucide-react';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('Culinary enthusiast & flavor explorer.');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        bio: bio.trim(),
        avatar: selectedAvatar,
      });

      if (res.success) {
        toast.success(`Welcome to FlavorFeed, ${res.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="logo-icon-box">
            <Flame size={24} color="#fff" />
          </div>
          <h1>Join FlavorFeed</h1>
          <p>Create your foodie profile to discover, share, and save signature recipes.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Kasun Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password * (min 6 characters)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Short Bio</label>
            <input
              type="text"
              placeholder="Tell us what you love to cook..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-input"
              maxLength={150}
            />
          </div>

          {/* Choose Avatar */}
          <div className="form-group">
            <label className="form-label">Select Avatar</label>
            <div className="avatar-pick-row">
              {DEFAULT_AVATARS.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt={`Avatar option ${idx + 1}`}
                  className={`avatar-pick-item ${selectedAvatar === av ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(av)}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary auth-submit-btn"
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Creating Profile...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          min-height: calc(100vh - 180px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
        }
        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .auth-header h1 {
          font-size: 1.85rem;
          color: #fff;
          margin-top: 1rem;
          margin-bottom: 0.35rem;
        }
        .auth-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .avatar-pick-row {
          display: flex;
          gap: 0.75rem;
        }
        .avatar-pick-item {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all var(--transition-fast);
        }
        .avatar-pick-item:hover {
          transform: scale(1.1);
        }
        .avatar-pick-item.selected {
          border-color: var(--accent-primary);
          box-shadow: 0 0 12px rgba(255, 107, 53, 0.4);
        }
        .auth-submit-btn {
          width: 100%;
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }
        .auth-footer {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .auth-switch-link {
          color: var(--accent-primary);
          font-weight: 600;
        }
        .auth-switch-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
