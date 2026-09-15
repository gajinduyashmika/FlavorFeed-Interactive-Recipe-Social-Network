import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeFilter } from '../components/RecipeFilter';
import { api } from '../api/client';
import { Sparkles, ChefHat, Users, Flame, PlusCircle } from 'lucide-react';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');
  const [difficulty, setDifficulty] = useState('All');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Keep category in sync with URL
  useEffect(() => {
    if (selectedCategory !== 'All') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/recipes', {
        search: debouncedSearch,
        category: selectedCategory,
        sort,
        difficulty,
      });
      if (res.success) {
        setRecipes(res.recipes);
        setTotalResults(res.total);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sort, difficulty]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div className="home-page-container">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} color="var(--accent-secondary)" />
              <span>The Next Generation Culinary Platform</span>
            </div>

            <h1 className="hero-title">
              Where Flavors Spark & <span className="highlight-text">Communities Gather</span>
            </h1>

            <p className="hero-subtitle">
              Explore authentic Sri Lankan curries, artisanal sourdoughs, vibrant vegan bowls, and Michelin-inspired pastry. Adjust servings in real time, cook with live step timers, and curate your personal digital cookbook.
            </p>

            <div className="hero-cta-group">
              <Link to="/create-recipe" className="btn btn-primary hero-btn">
                <PlusCircle size={18} />
                <span>Share Your Recipe</span>
              </Link>
              <a href="#feed" className="btn btn-secondary hero-btn">
                <Flame size={18} color="var(--accent-primary)" />
                <span>Explore Trending</span>
              </a>
            </div>

            {/* Platform Highlights */}
            <div className="hero-stats-row">
              <div className="stat-card">
                <ChefHat size={20} color="var(--accent-primary)" />
                <div>
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Tested Recipes</div>
                </div>
              </div>

              <div className="stat-card">
                <Sparkles size={20} color="var(--accent-secondary)" />
                <div>
                  <div className="stat-number">Live</div>
                  <div className="stat-label">Cook Mode</div>
                </div>
              </div>

              <div className="stat-card">
                <Users size={20} color="var(--accent-emerald)" />
                <div>
                  <div className="stat-number">Global</div>
                  <div className="stat-label">Foodie Tribe</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Recipe Feed */}
      <main className="container feed-container" id="feed">
        <RecipeFilter
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sort={sort}
          setSort={setSort}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          totalResults={totalResults}
        />

        {/* Recipes Grid */}
        {loading ? (
          <div className="recipe-grid-skeleton">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton-card glass-panel" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="empty-state glass-panel">
            <ChefHat size={48} color="var(--text-muted)" />
            <h3>No recipes found</h3>
            <p>Try searching for a different ingredient, cuisine, or clear your filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setDifficulty('All');
              }}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="recipe-masonry-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} onUpdate={fetchRecipes} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        .home-page-container {
          padding-bottom: 5rem;
        }
        .hero-section {
          padding: 4.5rem 0 3.5rem;
          background: radial-gradient(circle at 50% -20%, rgba(255, 107, 53, 0.15) 0%, transparent 60%);
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 2.5rem;
        }
        .hero-inner {
          display: flex;
          justify-content: center;
          text-align: center;
        }
        .hero-content {
          max-width: 820px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }
        .hero-title {
          font-size: 3.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          color: #fff;
        }
        .highlight-text {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 680px;
        }
        .hero-cta-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .hero-btn {
          padding: 0.85rem 1.85rem;
          font-size: 1rem;
        }
        .hero-stats-row {
          display: flex;
          gap: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          width: 100%;
          justify-content: center;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          text-align: left;
        }
        .stat-number {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.25rem;
          color: #fff;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .recipe-masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.75rem;
        }
        .recipe-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.75rem;
        }
        .skeleton-card {
          height: 380px;
          animation: pulse 1.5s infinite ease-in-out;
          background: rgba(255, 255, 255, 0.02);
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .empty-state h3 {
          font-size: 1.5rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        .empty-state p {
          color: var(--text-secondary);
          max-width: 420px;
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.25rem;
          }
          .hero-stats-row {
            flex-direction: column;
            align-items: center;
            gap: 1.25rem;
          }
          .recipe-masonry-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
