import { useState } from 'react';
import api from '../services/api';

function MediaUploader({ mediaFile, onMediaChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Pass the uploaded file information back to the parent state
      onMediaChange({
        name: response.data.name,
        type: response.data.type,
        path: response.data.path, // Store static uploads path on backend
      });
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || 'File upload failed. Only images and videos under 50MB are allowed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    onMediaChange(null);
    setError('');
  };

  return (
    <section className="card">
      <div className="section-heading">
        <h3>Media Upload</h3>
        <p>Attach an image or video for your post.</p>
      </div>

      {!mediaFile ? (
        <label className="upload-box" style={{ opacity: uploading ? 0.7 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}>
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} />
          <span>{uploading ? '📤 Uploading to server...' : 'Choose Image or Video'}</span>
        </label>
      ) : (
        <div className="media-file-uploaded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '12px 16px', borderRadius: '16px' }}>
          <span style={{ color: '#10b981', fontWeight: '500' }}>📎 Selected: {mediaFile.name}</span>
          <button
            type="button"
            className="publish-btn"
            style={{ background: '#ef4444', padding: '6px 12px' }}
            onClick={handleRemoveMedia}
          >
            Remove
          </button>
        </div>
      )}

      {error && <p className="auth-error" style={{ marginTop: '10px' }}>{error}</p>}
    </section>
  );
}

export default MediaUploader;
