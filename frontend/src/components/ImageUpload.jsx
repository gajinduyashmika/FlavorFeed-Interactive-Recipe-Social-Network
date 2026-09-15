import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';

export const ImageUpload = ({ onImageChange, initialPreview = '' }) => {
  const [mode, setMode] = useState('file'); // 'file' | 'url'
  const [preview, setPreview] = useState(initialPreview);
  const [urlInput, setUrlInput] = useState(initialPreview.startsWith('http') ? initialPreview : '');
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageChange({ file, url: '' });
    }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrlInput(val);
    setPreview(val);
    onImageChange({ file: null, url: val });
  };

  const handleClear = () => {
    setPreview('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageChange({ file: null, url: '' });
  };

  return (
    <div className="image-upload-wrapper">
      <div className="mode-toggle-bar">
        <button
          type="button"
          className={`toggle-tab ${mode === 'file' ? 'active' : ''}`}
          onClick={() => setMode('file')}
        >
          <UploadCloud size={16} />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          className={`toggle-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => setMode('url')}
        >
          <LinkIcon size={16} />
          <span>Image URL</span>
        </button>
      </div>

      {preview ? (
        <div className="image-preview-container">
          <img src={preview} alt="Recipe Preview" className="preview-image" />
          <button type="button" onClick={handleClear} className="remove-img-btn" aria-label="Remove Image">
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          {mode === 'file' ? (
            <div
              className="dropzone-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              <div className="dropzone-icon">
                <ImageIcon size={36} color="var(--accent-primary)" />
              </div>
              <p className="dropzone-title">Click to upload recipe photo</p>
              <p className="dropzone-subtitle">Supports JPG, PNG, WEBP up to 5MB</p>
            </div>
          ) : (
            <div className="url-input-box">
              <input
                type="url"
                placeholder="Paste web image URL (e.g., Unsplash, Cloudinary)..."
                value={urlInput}
                onChange={handleUrlChange}
                className="form-input"
              />
            </div>
          )}
        </>
      )}

      <style>{`
        .image-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mode-toggle-bar {
          display: flex;
          gap: 0.5rem;
        }
        .toggle-tab {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .toggle-tab.active {
          background: var(--bg-input);
          color: #fff;
          border-color: var(--accent-primary);
        }
        .dropzone-area {
          border: 2px dashed var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 2.5rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          background: rgba(255, 255, 255, 0.02);
        }
        .dropzone-area:hover {
          border-color: var(--accent-primary);
          background: rgba(255, 107, 53, 0.04);
        }
        .dropzone-icon {
          margin-bottom: 0.75rem;
        }
        .dropzone-title {
          font-weight: 600;
          color: #fff;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }
        .dropzone-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .image-preview-container {
          position: relative;
          width: 100%;
          height: 260px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
        }
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-img-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .remove-img-btn:hover {
          background: var(--accent-red);
        }
      `}</style>
    </div>
  );
};
