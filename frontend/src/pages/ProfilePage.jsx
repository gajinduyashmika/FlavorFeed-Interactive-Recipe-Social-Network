import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RecipeCard } from '../components/RecipeCard';
import {
  ChefHat,
  Bookmark,
  Heart,
  Edit2,
  Calendar,
  Sparkles,
  X,
  PlusCircle,
} from 'lucide-react';

export const ProfilePage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'authored';

  const { user: currentUser, updateProfile } = useAuth();
  const toast = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [authoredRecipes, setAuthoredRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [stats, setStats] = useState({ authoredCount: 0, savedCount: 0, totalLikesReceived: 0 });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [updating, setUpdating] = useState(false);

  const isOwnProfile = !id || (currentUser && currentUser._id === id);
  const targetId = id || (currentUser ? currentUser._id : null);

  const fetchProfile = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/profile/${targetId}`);
      if (res.success) {
        setProfileUser(res.user);
        setAuthoredRecipes(res.authoredRecipes || []);
        setSavedRecipes(res.savedRecipes || []);
        setStats(res.stats || {});

        setEditName(res.user.name || '');
        setEditBio(res.user.bio || '');
        setEditAvatar(res.user.avatar || '');
      }
    } catch (err) {
      toast.error('Could not load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await updateProfile({
        name: editName,
        bio: editBio,
        avatar: editAvatar,
      });

      if (res.success) {
        toast.success('Profile updated successfully!');
        setProfileUser(res.user);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <ChefHat size={48} className="spin-animation" color="var(--accent-primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading foodie profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>User not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Feed</Link>
      </div>
    );
  }

  const joinDate = profileUser.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="profile-page-wrapper">
      {/* Profile Header Card */}
      <div className="profile-header-banner">
        <div className="container">
          <div className="profile-card glass-panel">
            <div className="profile-info-row flex-between">
              <div className="avatar-details-group">
                <img src={profileUser.avatar} alt={profileUser.name} className="profile-big-avatar" />
                <div className="profile-text-meta">
                  <div className="name-badge-row">
                    <h1 className="profile-name">{profileUser.name}</h1>
                    <span className="badge badge-orange">
                      <Sparkles size={12} />
                      <span>Culinary Creator</span>
                    </span>
                  </div>
                  <p className="profile-bio">{profileUser.bio || 'Exploring world flavors one dish at a time.'}</p>
                  <div className="profile-joined-date">
                    <Calendar size={14} />
                    <span>Member since {joinDate}</span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-secondary edit-profile-btn"
                >
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Profile Statistics */}
            <div className="profile-stats-grid">
              <div className="profile-stat-box">
                <span className="stat-big-num">{stats.authoredCount}</span>
                <span className="stat-meta-label">Recipes Shared</span>
              </div>
              <div className="profile-stat-box">
                <span className="stat-big-num">{stats.savedCount}</span>
                <span className="stat-meta-label">Cookbook Saves</span>
              </div>
              <div className="profile-stat-box">
                <span className="stat-big-num">{stats.totalLikesReceived}</span>
                <span className="stat-meta-label">Likes Received</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="profile-tabs-bar">
          <button
            onClick={() => handleTabChange('authored')}
            className={`profile-tab-btn ${activeTab === 'authored' ? 'active' : ''}`}
          >
            <ChefHat size={18} />
            <span>Shared Recipes ({authoredRecipes.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('saved')}
            className={`profile-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          >
            <Bookmark size={18} />
            <span>Personal Cookbook ({savedRecipes.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-recipes-feed" style={{ marginTop: '2rem' }}>
          {activeTab === 'authored' && (
            <>
              {authoredRecipes.length === 0 ? (
                <div className="empty-profile-box glass-panel">
                  <ChefHat size={44} color="var(--text-muted)" />
                  <h3>No recipes shared yet</h3>
                  <p>Share your favorite homemade dish with the global FlavorFeed community.</p>
                  {isOwnProfile && (
                    <Link to="/create-recipe" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                      <PlusCircle size={18} />
                      <span>Post Your First Recipe</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="recipe-masonry-grid">
                  {authoredRecipes.map((r) => (
                    <RecipeCard key={r._id} recipe={r} onUpdate={fetchProfile} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {savedRecipes.length === 0 ? (
                <div className="empty-profile-box glass-panel">
                  <Bookmark size={44} color="var(--text-muted)" />
                  <h3>Your digital cookbook is empty</h3>
                  <p>Tap the bookmark icon on any recipe to save it to your personal culinary collection.</p>
                  <Link to="/" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                    Browse Delicious Recipes
                  </Link>
                </div>
              ) : (
                <div className="recipe-masonry-grid">
                  {savedRecipes.map((r) => (
                    <RecipeCard key={r._id} recipe={r} onUpdate={fetchProfile} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="edit-profile-modal glass-panel">
            <div className="modal-header flex-between">
              <h2>Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="edit-modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio (max 200 chars)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="form-textarea"
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="btn btn-primary">
                  <span>{updating ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .profile-page-wrapper {
          padding-bottom: 5rem;
        }
        .profile-header-banner {
          background: radial-gradient(circle at 50% 0%, rgba(255, 107, 53, 0.12) 0%, transparent 70%);
          padding: 3rem 0 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .profile-card {
          padding: 2.5rem;
        }
        .profile-info-row {
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .avatar-details-group {
          display: flex;
          gap: 1.75rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .profile-big-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--accent-primary);
          box-shadow: var(--shadow-glow);
        }
        .profile-text-meta {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .name-badge-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .profile-name {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
        }
        .profile-bio {
          font-size: 0.95rem;
          color: var(--text-secondary);
          max-width: 520px;
          line-height: 1.5;
        }
        .profile-joined-date {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding-top: 1.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .profile-stat-box {
          text-align: center;
        }
        .stat-big-num {
          display: block;
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
        }
        .stat-meta-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .profile-tabs-bar {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.5rem;
        }
        .profile-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: none;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          border-bottom: 2px solid transparent;
        }
        .profile-tab-btn:hover {
          color: #fff;
        }
        .profile-tab-btn.active {
          color: var(--accent-primary);
          background: rgba(255, 107, 53, 0.08);
          border-bottom-color: var(--accent-primary);
        }
        .empty-profile-box {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-profile-box h3 {
          font-size: 1.4rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        .empty-profile-box p {
          color: var(--text-secondary);
          max-width: 420px;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .edit-profile-modal {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          background: #161b24;
        }
        .modal-header {
          margin-bottom: 1.5rem;
        }
        .modal-header h2 {
          font-size: 1.35rem;
          color: #fff;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .recipe-masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.75rem;
        }
        @media (max-width: 600px) {
          .profile-stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
