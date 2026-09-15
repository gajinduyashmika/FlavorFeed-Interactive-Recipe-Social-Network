import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="brand-logo">
            <div className="logo-icon-box">
              <Flame size={20} color="#fff" />
            </div>
            <span className="brand-name">Flavor<span>Feed</span></span>
          </div>
          <p className="footer-desc">
            The culinary sanctuary where chefs, home cooks, and food explorers share authentic recipes, master global flavors, and build personal digital cookbooks.
          </p>
        </div>

        <div className="footer-links-group">
          <h4>Explore</h4>
          <Link to="/?category=Sri%20Lankan">Sri Lankan</Link>
          <Link to="/?category=Italian">Italian Classics</Link>
          <Link to="/?category=Vegan">Plant-Based</Link>
          <Link to="/?category=Dessert">Artisan Desserts</Link>
        </div>

        <div className="footer-links-group">
          <h4>Community</h4>
          <Link to="/create-recipe">Share Your Recipe</Link>
          <Link to="/register">Join the Foodie Network</Link>
          <a href="#about">Culinary Philosophy</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container flex-between footer-bottom-inner">
          <p>© {new Date().getFullYear()} FlavorFeed Inc. Crafted with pure JavaScript & MERN stack.</p>
          <p className="footer-love">
            Cooked with <Heart size={14} fill="#ff6b35" color="#ff6b35" /> for culinary enthusiasts.
          </p>
        </div>
      </div>

      <style>{`
        .footer-wrapper {
          background: #090b0e;
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
          padding-top: 3.5rem;
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          padding-bottom: 3rem;
        }
        .footer-desc {
          margin-top: 1rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 420px;
          line-height: 1.6;
        }
        .footer-links-group h4 {
          font-size: 1rem;
          margin-bottom: 1.25rem;
          color: #fff;
        }
        .footer-links-group a {
          display: block;
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 0.65rem;
          transition: color var(--transition-fast);
        }
        .footer-links-group a:hover {
          color: var(--accent-primary);
        }
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.25rem 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .footer-love {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        @media (max-width: 768px) {
          .footer-inner {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-bottom-inner {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};
