import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Flame, LogIn, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setSubmitting(true);
    try {
      const res = await login(demoEmail, 'password123');
      if (res.success) {
        toast.success(`Logged in as ${res.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Could not log in demo user.');
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
          <h1>Welcome Back</h1>
          <p>Sign in to like, save, and share your favorite culinary recipes.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
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
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary auth-submit-btn"
          >
            <LogIn size={18} />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Logins for Fast Review */}
        <div className="demo-accounts-box">
          <div className="demo-badge">
            <Sparkles size={13} color="var(--accent-secondary)" />
            <span>One-Click Demo Logins</span>
          </div>
          <div className="demo-btns-grid">
            <button
              type="button"
              onClick={() => handleQuickLogin('kasun@flavorfeed.com')}
              className="demo-chef-btn"
            >
              Chef Kasun (Sri Lankan)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sofia@flavorfeed.com')}
              className="demo-chef-btn"
            >
              Chef Sofia (Italian)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('maya@flavorfeed.com')}
              className="demo-chef-btn"
            >
              Maya Lin (Vegan/Bowls)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-switch-link">
              Create one for free
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
          max-width: 460px;
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
          gap: 1.25rem;
        }
        .auth-submit-btn {
          width: 100%;
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }
        .demo-accounts-box {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }
        .demo-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
        }
        .demo-btns-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .demo-chef-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 0.55rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .demo-chef-btn:hover {
          background: rgba(255, 107, 53, 0.12);
          border-color: var(--accent-primary);
          color: #fff;
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
