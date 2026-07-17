import Header from '../components/Header';
import PlatformSelector from '../components/PlatformSelector';
import PostEditor from '../components/PostEditor';
import CharacterCounter from '../components/CharacterCounter';
import ValidationMessage from '../components/ValidationMessage';
import PreviewCard from '../components/PreviewCard';
import MediaUploader from '../components/MediaUploader';
import PublishButton from '../components/PublishButton';
import AIAssistant from '../components/AIAssistant';

function ComposerView({
  darkMode,
  onToggleTheme,
  onCopy,
  onClear,
  onSaveDraft,
  activeDraftId,
  draftTitle,
  setDraftTitle,
  setActiveDraftId,
  setToast,
  post,
  setPost,
  selectedPlatforms,
  onPlatformSelection,
  counts,
  validations,
  mediaFile,
  setMediaFile,
  onPublish,
  publishMessage,
  wordCount,
  readingTime,
  isPublishEnabled,
}) {
  return (
    <div className="composer-view">
      <Header
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
        onCopy={onCopy}
        onClear={onClear}
        onSaveDraft={onSaveDraft}
        activeDraftId={activeDraftId}
      />

      <div className="card title-bar-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label htmlFor="draft-title-input" style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>Draft Name:</label>
        <input
          type="text"
          id="draft-title-input"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Enter draft title..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid #dbe4f0',
            background: 'transparent',
            outline: 'none',
          }}
        />
        {activeDraftId && (
          <button
            type="button"
            className="publish-btn"
            style={{ background: '#64748b', padding: '6px 12px', fontSize: '0.85rem' }}
            onClick={() => {
              setActiveDraftId(null);
              setDraftTitle('Untitled Draft');
              setToast('Switched to new draft');
            }}
          >
            Create New Copy
          </button>
        )}
      </div>

      <main className="dashboard">
        <section className="panel editor-panel">
          <PlatformSelector selectedPlatforms={selectedPlatforms} onPlatformSelection={onPlatformSelection} />

          <PostEditor
            value={post}
            onChange={setPost}
            wordCount={wordCount}
            readingTime={readingTime}
          />

          <div className="info-row">
            <CharacterCounter counts={counts} validations={validations} />
          </div>

          <MediaUploader mediaFile={mediaFile} onMediaChange={setMediaFile} />

          <PublishButton onPublish={onPublish} isEnabled={isPublishEnabled} publishMessage={publishMessage} />
        </section>

        <aside className="panel preview-panel">
          <AIAssistant text={post} onApplyText={setPost} />
          <ValidationMessage validations={validations} />
          <div className="preview-list">
            {selectedPlatforms.map((platformId) => (
              <PreviewCard
                key={platformId}
                platformId={platformId}
                post={post}
                mediaFile={mediaFile}
              />
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ComposerView;