import { platformRules } from '../data/platformRules.jsx';

function PreviewCard({ platformId, post, mediaFile }) {
  const rule = platformRules[platformId];
  const previewText = post.trim() ? post : 'Your post preview will appear here...';

  // Helper to determine media type and render appropriate node
  const renderMediaPreview = () => {
    if (!mediaFile || !mediaFile.path) return null;

    const isImage = mediaFile.type?.startsWith('image/') || /\.(jpeg|jpg|png|gif)$/i.test(mediaFile.path);
    const isVideo = mediaFile.type?.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(mediaFile.path);
    const mediaUrl = `http://localhost:5000${mediaFile.path}`;

    if (isImage) {
      return (
        <div className="preview-media-wrapper" style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
          <img
            src={mediaUrl}
            alt="Preview"
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="preview-media-wrapper" style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
          <video
            src={mediaUrl}
            controls
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      );
    }

    // Fallback pill
    return (
      <div className="media-pill" style={{ marginTop: '10px' }}>
        📎 {mediaFile.name}
      </div>
    );
  };

  return (
    <section className="card preview-card" style={{ borderTop: `4px solid ${rule?.color || '#3b82f6'}` }}>
      <div className="section-heading">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: rule?.color }}>{rule?.icon}</span>
          <span>{rule?.name} Preview</span>
        </h3>
      </div>
      <div className="preview-body">
        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{previewText}</p>
        {renderMediaPreview()}
      </div>
    </section>
  );
}

export default PreviewCard;
