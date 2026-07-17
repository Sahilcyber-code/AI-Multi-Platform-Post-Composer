function Header({ darkMode, onToggleTheme, onCopy, onClear, onSaveDraft, activeDraftId }) {
  return (
    <header className="header-card">
      <div>
        <p className="eyebrow">AI-powered workspace</p>
        <h1>AI Multi-Platform Post Composer</h1>
      </div>
      <div className="header-actions">
        {onSaveDraft && (
          <button
            onClick={onSaveDraft}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {activeDraftId ? '💾 Update Draft' : '💾 Save Draft'}
          </button>
        )}
        <button onClick={onCopy}>Copy Post</button>
        <button onClick={onClear}>Clear</button>
        <button onClick={onToggleTheme}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>
    </header>
  );
}

export default Header;
