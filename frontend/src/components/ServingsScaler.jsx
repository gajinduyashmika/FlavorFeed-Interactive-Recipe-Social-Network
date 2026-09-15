import React, { useState } from 'react';
import { Users, Minus, Plus, Check } from 'lucide-react';

export const ServingsScaler = ({ baseServings = 4, ingredients = [] }) => {
  const [currentServings, setCurrentServings] = useState(baseServings);
  const [checkedItems, setCheckedItems] = useState({});

  const handleDecrease = () => {
    if (currentServings > 1) {
      setCurrentServings((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (currentServings < 50) {
      setCurrentServings((prev) => prev + 1);
    }
  };

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const formatAmount = (amount) => {
    if (!amount || isNaN(amount)) return '';
    const scaled = (amount / baseServings) * currentServings;

    // Clean formatting: if close to integer, show integer, else 1-2 decimals
    if (Number.isInteger(scaled)) return scaled.toString();
    const rounded = Math.round(scaled * 100) / 100;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1).replace(/\.0$/, '');
  };

  return (
    <div className="servings-scaler-box glass-panel">
      <div className="scaler-header">
        <div className="scaler-title-group">
          <h3>Ingredients</h3>
          <span className="ingredients-count">({ingredients.length} items)</span>
        </div>

        <div className="scaler-controls">
          <div className="scaler-badge">
            <Users size={16} />
            <span>Servings:</span>
          </div>
          <div className="counter-controls">
            <button
              onClick={handleDecrease}
              disabled={currentServings <= 1}
              className="counter-btn"
              aria-label="Decrease Servings"
            >
              <Minus size={14} />
            </button>
            <span className="counter-val">{currentServings}</span>
            <button
              onClick={handleIncrease}
              disabled={currentServings >= 50}
              className="counter-btn"
              aria-label="Increase Servings"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <p className="scaler-hint">
        Tap any ingredient to cross it off as you gather and prep your mise en place!
      </p>

      <ul className="ingredients-list">
        {ingredients.map((ing, idx) => {
          const isChecked = checkedItems[idx];
          const displayAmount = formatAmount(ing.amount);

          return (
            <li
              key={idx}
              className={`ingredient-item ${isChecked ? 'checked' : ''}`}
              onClick={() => toggleCheck(idx)}
            >
              <div className={`checkbox-indicator ${isChecked ? 'active' : ''}`}>
                {isChecked && <Check size={13} color="#fff" strokeWidth={3} />}
              </div>

              <div className="ingredient-details">
                {(displayAmount || ing.unit) && (
                  <span className="ingredient-qty">
                    {displayAmount} {ing.unit}
                  </span>
                )}
                <span className="ingredient-name">{ing.name}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <style>{`
        .servings-scaler-box {
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .scaler-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .scaler-title-group {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .scaler-title-group h3 {
          font-size: 1.35rem;
          color: #fff;
        }
        .ingredients-count {
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .scaler-controls {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .scaler-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .counter-controls {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .counter-btn {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .counter-btn:hover:not(:disabled) {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        .counter-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .counter-val {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--accent-primary);
          min-width: 24px;
          text-align: center;
        }
        .scaler-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }
        .ingredients-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .ingredient-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
        }
        .ingredient-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .ingredient-item.checked {
          background: rgba(16, 185, 129, 0.06);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .checkbox-indicator {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .checkbox-indicator.active {
          background: var(--accent-emerald);
          border-color: var(--accent-emerald);
        }
        .ingredient-details {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          font-size: 0.95rem;
        }
        .ingredient-item.checked .ingredient-details {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        .ingredient-qty {
          font-weight: 700;
          color: var(--accent-secondary);
        }
        .ingredient-name {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};
