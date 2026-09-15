import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUpload } from '../components/ImageUpload';
import { Plus, Trash2, Clock, ChefHat, Save } from 'lucide-react';

export const EditRecipePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('Easy');
  const [cuisine, setCuisine] = useState('International');
  const [category, setCategory] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/recipes/${id}`);
        if (res.success && res.recipe) {
          const r = res.recipe;
          // Check ownership
          if (!user || (r.author._id !== user._id && r.author !== user._id)) {
            toast.error('You are not authorized to edit this recipe.');
            navigate(`/recipe/${id}`);
            return;
          }

          setTitle(r.title);
          setDescription(r.description);
          setPrepTime(r.prepTime);
          setCookTime(r.cookTime);
          setServings(r.servings);
          setDifficulty(r.difficulty || 'Easy');
          setCuisine(r.cuisine || 'International');
          setCategory(r.category || []);
          setIngredients(r.ingredients || []);
          setInstructions(r.instructions || []);
          setImageUrl(r.imageUrl || '');
        }
      } catch (err) {
        toast.error('Failed to load recipe for editing.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecipe();
    }
  }, [id, user, navigate]);

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
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

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
    if (instructions.length <= 1) return;
    setInstructions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('prepTime', prepTime);
      formData.append('cookTime', cookTime);
      formData.append('servings', servings);
      formData.append('difficulty', difficulty);
      formData.append('cuisine', cuisine.trim());
      formData.append('category', JSON.stringify(category));
      formData.append('ingredients', JSON.stringify(ingredients));
      formData.append('instructions', JSON.stringify(instructions));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const res = await api.put(`/recipes/${id}`, formData, true);

      if (res.success) {
        toast.success('Recipe updated successfully!');
        navigate(`/recipe/${id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading recipe editor...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px', paddingTop: '2rem', paddingBottom: '5rem' }}>
      <h1 style={{ color: '#fff', fontSize: '2.25rem', marginBottom: '1.5rem' }}>Edit Recipe</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: '1.25rem' }}>Overview</h2>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Prep Time (min)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cook Time (min)</label>
              <input
                type="number"
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
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="form-select"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recipe Photo */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: '1rem' }}>Recipe Photo</h2>
          <ImageUpload
            initialPreview={imageUrl}
            onImageChange={({ file, url }) => {
              setImageFile(file);
              setImageUrl(url);
            }}
          />
        </div>

        {/* Ingredients */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.35rem' }}>Ingredients</h2>
            <button type="button" onClick={handleAddIngredient} className="btn btn-secondary btn-sm">
              <Plus size={15} />
              <span>Add Ingredient</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Ingredient"
                  value={ing.name}
                  onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                  className="form-input"
                  style={{ flex: 2 }}
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.35rem' }}>Instructions</h2>
            <button type="button" onClick={handleAddInstruction} className="btn btn-secondary btn-sm">
              <Plus size={15} />
              <span>Add Step</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {instructions.map((inst, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {inst.stepNumber}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <textarea
                    value={inst.text}
                    onChange={(e) => handleUpdateInstruction(idx, 'text', e.target.value)}
                    className="form-textarea"
                    rows={2}
                    required
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Clock size={15} />
                    <span>Timer (mins):</span>
                    <input
                      type="number"
                      min={0}
                      value={inst.timerMinutes || 0}
                      onChange={(e) => handleUpdateInstruction(idx, 'timerMinutes', Number(e.target.value))}
                      className="form-input"
                      style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInstruction(idx)}
                  style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => navigate(`/recipe/${id}`)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            <Save size={18} />
            <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
