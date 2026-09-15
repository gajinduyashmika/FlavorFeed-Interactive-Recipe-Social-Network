import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUpload } from '../components/ImageUpload';
import { Plus, Trash2, Clock, Sparkles, ChefHat } from 'lucide-react';

const POPULAR_TAGS = [
  'Sri Lankan',
  'Curry',
  'Italian',
  'Vegan',
  'Dessert',
  'Street Food',
  'Quick & Easy',
  'Healthy',
  'Dinner',
  'Breakfast',
  'Baking',
];

export const CreateRecipePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('Easy');
  const [cuisine, setCuisine] = useState('International');
  const [selectedCategories, setSelectedCategories] = useState(['Quick & Easy']);
  const [customTag, setCustomTag] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const [ingredients, setIngredients] = useState([
    { name: '', amount: 1, unit: 'cup' },
    { name: '', amount: 2, unit: 'tbsp' },
  ]);

  const [instructions, setInstructions] = useState([
    { stepNumber: 1, text: '', timerMinutes: 0 },
    { stepNumber: 2, text: '', timerMinutes: 0 },
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <ChefHat size={54} color="var(--accent-primary)" />
        <h2 style={{ color: '#fff', marginTop: '1rem' }}>Sign in to Share a Recipe</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem' }}>
          Join our community of culinary creators to post your signature dishes!
        </p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Sign In Now
        </button>
      </div>
    );
  }

  // Ingredient handlers
  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', amount: 1, unit: '' }]);
  };

  const handleUpdateIngredient = (index, field, value) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length <= 1) {
      toast.info('A recipe must have at least one ingredient.');
      return;
    }
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Instruction handlers
  const handleAddInstruction = () => {
    setInstructions((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, text: '', timerMinutes: 0 },
    ]);
  };

  const handleUpdateInstruction = (index, field, value) => {
    setInstructions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveInstruction = (index) => {
    if (instructions.length <= 1) {
      toast.info('A recipe must have at least one instruction step.');
      return;
    }
    setInstructions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );
  };

  // Category tags toggle
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (customTag.trim() && !selectedCategories.includes(customTag.trim())) {
      setSelectedCategories((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please provide a recipe title.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a recipe description.');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    if (validIngredients.length === 0) {
      toast.error('Please enter at least one named ingredient.');
      return;
    }

    const validInstructions = instructions.filter((inst) => inst.text.trim() !== '');
    if (validInstructions.length === 0) {
      toast.error('Please enter at least one instruction step.');
      return;
    }

    setSubmitting(true);

    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('prepTime', prepTime);
      formData.append('cookTime', cookTime);
      formData.append('servings', servings);
      formData.append('difficulty', difficulty);
      formData.append('cuisine', cuisine.trim());
      formData.append('category', JSON.stringify(selectedCategories));
      formData.append('ingredients', JSON.stringify(validIngredients));
      formData.append('instructions', JSON.stringify(validInstructions));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const res = await api.post('/recipes', formData, true);

      if (res.success && res.recipe) {
        toast.success('Recipe published to FlavorFeed!');
        navigate(`/recipe/${res.recipe._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container create-recipe-container">
      <div className="form-page-header">
        <span className="badge badge-orange">
          <Sparkles size={13} />
          <span>New Culinary Creation</span>
        </span>
        <h1 className="page-title">Share Your Recipe</h1>
        <p className="page-subtitle">
          Inspire foodies across the world with your signature techniques, secret spices, and comforting family traditions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="recipe-form">
        {/* Basic Info Card */}
        <div className="form-card glass-panel">
          <h2>1. Recipe Overview</h2>

          <div className="form-group">
            <label className="form-label">Recipe Title *</label>
            <input
              type="text"
              placeholder="e.g. Grandma's Sri Lankan Kukul Mas Curry, Artisanal Focaccia..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Culinary Story *</label>
            <textarea
              placeholder="Describe the aroma, flavor profile, pairing recommendations, or cultural background..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={4}
              required
            />
          </div>

          <div className="meta-inputs-grid">
            <div className="form-group">
              <label className="form-label">Prep Time (mins) *</label>
              <input
                type="number"
                min={0}
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cook Time (mins) *</label>
              <input
                type="number"
                min={0}
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Servings</label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skill Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="form-select"
              >
                <option value="Easy">Easy (Beginner friendly)</option>
                <option value="Medium">Medium (Home chef)</option>
                <option value="Hard">Hard (Culinary artisan)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cuisine Tradition</label>
              <input
                type="text"
                placeholder="e.g. Sri Lankan, Italian, Mexican, Asian..."
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Recipe Photography */}
        <div className="form-card glass-panel">
          <h2>2. Recipe Photography</h2>
          <p className="section-hint">High quality photos with natural lighting boost community engagement by 400%.</p>
          <ImageUpload
            onImageChange={({ file, url }) => {
              setImageFile(file);
              setImageUrl(url);
            }}
          />
        </div>

        {/* Category Tags */}
        <div className="form-card glass-panel">
          <h2>3. Categories & Flavor Tags</h2>
          <div className="category-chips-selector">
            {POPULAR_TAGS.map((tag) => {
              const isSelected = selectedCategories.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleCategory(tag)}
                  className={`tag-select-btn ${isSelected ? 'selected' : ''}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="custom-tag-row">
            <input
              type="text"
              placeholder="Add custom tag (e.g., Gluten-Free, Spicy)..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="form-input custom-tag-input"
            />
            <button type="button" onClick={handleAddCustomTag} className="btn btn-secondary">
              Add Tag
            </button>
          </div>
        </div>

        {/* Ingredients Builder */}
        <div className="form-card glass-panel">
          <div className="flex-between card-title-row">
            <div>
              <h2>4. Ingredients</h2>
              <p className="section-hint">Amounts scale automatically when fellow foodies use the Serving Scaler.</p>
            </div>
            <button type="button" onClick={handleAddIngredient} className="btn btn-secondary btn-sm">
              <Plus size={15} />
              <span>Add Ingredient</span>
            </button>
          </div>

          <div className="dynamic-rows-container">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="ingredient-row-input">
                <input
                  type="text"
                  placeholder="Ingredient name (e.g. Coconut milk, Goraka paste)..."
                  value={ing.name}
                  onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                  className="form-input ing-name-input"
                  required
                />
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                  className="form-input ing-amount-input"
                />
                <input
                  type="text"
                  placeholder="Unit (g, ml, tbsp, cup)..."
                  value={ing.unit}
                  onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                  className="form-input ing-unit-input"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="row-delete-btn"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Builder */}
        <div className="form-card glass-panel">
          <div className="flex-between card-title-row">
            <div>
              <h2>5. Step-by-Step Instructions</h2>
              <p className="section-hint">Optionally assign a timer in minutes for baking, marinating, or simmering steps.</p>
            </div>
            <button type="button" onClick={handleAddInstruction} className="btn btn-secondary btn-sm">
              <Plus size={15} />
              <span>Add Step</span>
            </button>
          </div>

          <div className="dynamic-rows-container">
            {instructions.map((inst, idx) => (
              <div key={idx} className="instruction-row-input">
                <div className="step-badge">{inst.stepNumber}</div>
                <div className="inst-fields-wrapper">
                  <textarea
                    placeholder={`Describe Step ${inst.stepNumber} in detail...`}
                    value={inst.text}
                    onChange={(e) => handleUpdateInstruction(idx, 'text', e.target.value)}
                    className="form-textarea"
                    rows={2}
                    required
                  />
                  <div className="timer-input-wrapper">
                    <Clock size={15} color="var(--accent-secondary)" />
                    <label>Step Timer (mins):</label>
                    <input
                      type="number"
                      min="0"
                      value={inst.timerMinutes}
                      onChange={(e) => handleUpdateInstruction(idx, 'timerMinutes', Number(e.target.value))}
                      className="form-input timer-input"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInstruction(idx)}
                  className="row-delete-btn"
                  title="Remove Step"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-bottom-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary submit-recipe-btn"
          >
            <ChefHat size={18} />
            <span>{submitting ? 'Publishing Culinary Creation...' : 'Publish Recipe'}</span>
          </button>
        </div>
      </form>

      <style>{`
        .create-recipe-container {
          padding-top: 2rem;
          padding-bottom: 5rem;
          max-width: 900px;
        }
        .form-page-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .page-title {
          font-size: 2.5rem;
          color: #fff;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .page-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          max-width: 580px;
          margin: 0 auto;
        }
        .recipe-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .form-card {
          padding: 2rem;
        }
        .form-card h2 {
          font-size: 1.35rem;
          color: #fff;
          margin-bottom: 0.35rem;
        }
        .section-hint {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .meta-inputs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        .category-chips-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }
        .tag-select-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .tag-select-btn.selected {
          background: var(--accent-primary);
          color: #fff;
          border-color: var(--accent-primary);
        }
        .custom-tag-row {
          display: flex;
          gap: 0.75rem;
        }
        .custom-tag-input {
          max-width: 320px;
        }
        .dynamic-rows-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .ingredient-row-input {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .ing-name-input {
          flex: 2;
        }
        .ing-amount-input {
          flex: 1;
        }
        .ing-unit-input {
          flex: 1;
        }
        .instruction-row-input {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .step-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--accent-primary);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .inst-fields-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .timer-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .timer-input {
          width: 80px;
          padding: 0.35rem 0.5rem;
        }
        .row-delete-btn {
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .row-delete-btn:hover {
          color: var(--accent-red);
          background: rgba(239, 68, 68, 0.1);
        }
        .form-bottom-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
        }
        .submit-recipe-btn {
          padding: 0.85rem 2rem;
          font-size: 1rem;
        }
        @media (max-width: 600px) {
          .ingredient-row-input {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
