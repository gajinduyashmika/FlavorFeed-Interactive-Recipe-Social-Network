import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UtensilsCrossed, PlusCircle, LogOut, User as UserIcon, Bookmark, Flame } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out.');
    navigate('/');
  };

  return (
    <header className="navbar-wrapper">
      <div className="container flex-between navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-box">
            <Flame size={24} color="#fff" />
          </div>
          <span className="brand-name">Flavor<span>Feed</span></span>
        </Link>

        {/* Center Nav Links */}
        <nav className="nav-links">
          <Link to="/" className="nav-link">Explore</Link>
          <Link to="/create-recipe" className="nav-link highlight">
            <PlusCircle size={18} />
            <span>Share Recipe</span>
          </Link>
        </nav>

        {/* Right Auth / Profile */}
        <div className="nav-auth">
          {user ? (
            <div className="profile-menu-container">
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User Profile Menu"
              >
                <img src={user.avatar} alt={user.name} className="navbar-avatar" />
                <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu" onClick={() => setDropdownOpen(false)}>
                  <div className="dropdown-header">
                    <p className="dropdown-user">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={`/profile/${user._id}`} className="dropdown-item">
                    <UserIcon size={16} />
                    <span>My Profile & Recipes</span>
                  </Link>
                  <Link to={`/profile/${user._id}?tab=saved`} className="dropdown-item">
                    <Bookmark size={16} />
                    <span>My Cookbooks ({user.savedRecipes?.length || 0})</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(14, 17, 23, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-subtle);
        }
        .navbar-inner {
          height: 72px;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
        }
        .logo-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff6b35 0%, #fa571b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        }
        .brand-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .brand-name span {
          color: var(--accent-primary);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          transition: color var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .nav-link:hover {
          color: #fff;
        }
        .nav-link.highlight {
          color: var(--accent-primary);
        }
        .btn-sm {
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
        }
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .profile-menu-container {
          position: relative;
        }
        .profile-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          padding: 0.35rem 0.75rem 0.35rem 0.35rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .navbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .navbar-user-name {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 230px;
          background: #1c222e;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          z-index: 200;
          animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dropdown-header {
          padding: 0.5rem 0.75rem;
        }
        .dropdown-user {
          font-weight: 600;
          color: #fff;
          font-size: 0.9rem;
        }
        .dropdown-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 0.3rem 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          width: 100%;
          text-align: left;
          background: none;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .logout-btn:hover {
          color: var(--accent-red);
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </header>
  );
};
