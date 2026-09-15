import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Sri Lankan',
  'Italian',
  'Curry',
  'Vegan',
  'Dessert',
  'Street Food',
  'Quick & Easy',
];

export const RecipeFilter = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  sort,
  setSort,
  difficulty,
  setDifficulty,
  totalResults,
}) => {
  return (
    <div className="filter-section">
      {/* Top Search & Filter Bar */}
      <div className="filter-top-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by recipe title, cuisine, or ingredients (e.g. coconut milk, pork, matcha)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="search-clear-btn" aria-label="Clear Search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <div className="select-wrapper">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="filter-select"
              aria-label="Sort recipes"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="fastest">Fastest Cook</option>
            </select>
          </div>

          <div className="select-wrapper">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="filter-select"
              aria-label="Filter by difficulty"
            >
              <option value="All">All Skill Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Master Chef</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills-row">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-pill ${isActive ? 'active' : ''}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Result Count Info */}
      <div className="results-count-bar">
        <span className="results-count-text">
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'culinary creation' : 'culinary creations'}
        </span>
        {(search || selectedCategory !== 'All' || difficulty !== 'All') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setDifficulty('All');
            }}
            className="reset-filters-btn"
          >
            Reset Filters
          </button>
        )}
      </div>

      <style>{`
        .filter-section {
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .filter-top-bar {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .search-input-wrapper {
          position: relative;
          flex: 1;
        }
        .search-icon {
          position: absolute;
          left: 1.15rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: #151922;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 2.8rem 0.85rem 3rem;
          color: #fff;
          font-size: 0.95rem;
          transition: all var(--transition-fast);
        }
        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.2);
          background: #1a202c;
        }
        .search-clear-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .filter-dropdowns {
          display: flex;
          gap: 0.75rem;
        }
        .select-wrapper {
          position: relative;
        }
        .filter-select {
          background: #151922;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.2rem;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .filter-select:focus {
          border-color: var(--accent-primary);
        }
        .category-pills-row {
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          padding-bottom: 0.35rem;
          scrollbar-width: none;
        }
        .category-pills-row::-webkit-scrollbar {
          display: none;
        }
        .category-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 0.5rem 1.15rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .category-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .category-pill.active {
          background: var(--accent-primary);
          color: #fff;
          border-color: var(--accent-primary);
          box-shadow: 0 2px 10px rgba(255, 107, 53, 0.4);
        }
        .results-count-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--text-muted);
          padding-top: 0.25rem;
        }
        .results-count-text strong {
          color: var(--text-primary);
        }
        .reset-filters-btn {
          background: none;
          color: var(--accent-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .reset-filters-btn:hover {
          text-decoration: underline;
        }
        @media (max-width: 860px) {
          .filter-top-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-dropdowns {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
