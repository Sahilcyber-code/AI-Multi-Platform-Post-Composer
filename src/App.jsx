import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import { platformRules } from './data/platformRules.jsx';
import api from './services/api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import DraftsList from './pages/DraftsList';
import HistoryList from './pages/HistoryList';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Settings from './pages/Settings';
import ComposerView from './pages/ComposerView';

const defaultDraft = {
  post: '',
  selectedPlatforms: ['twitter', 'instagram'],
  media: null,
  draftTitle: 'Untitled Draft',
  activeDraftId: null,
};

function App() {
  const { token, loading } = useAuth();
  const [post, setPost] = useState(defaultDraft.post);
  const [selectedPlatforms, setSelectedPlatforms] = useState(defaultDraft.selectedPlatforms);
  const [mediaFile, setMediaFile] = useState(defaultDraft.media);
  const [draftTitle, setDraftTitle] = useState(defaultDraft.draftTitle);
  const [activeDraftId, setActiveDraftId] = useState(defaultDraft.activeDraftId);

  const [darkMode, setDarkMode] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [toast, setToast] = useState('');

  // Sync theme with local storage
  useEffect(() => {
    const localTheme = localStorage.getItem('theme');
    if (localTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const handleToggleTheme = () => {
    setDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handlePlatformSelection = (platformId) => {
    setSelectedPlatforms((current) =>
      current.includes(platformId)
        ? current.filter((item) => item !== platformId)
        : [...current, platformId]
    );
  };

  const counts = useMemo(() => {
    return selectedPlatforms.reduce((acc, platformId) => {
      const rule = platformRules[platformId];
      if (!rule) return acc;
      acc[platformId] = {
        count: post.length,
        limit: rule.limit,
      };
      return acc;
    }, {});
  }, [post, selectedPlatforms]);

  const validations = useMemo(() => {
    return selectedPlatforms.reduce((acc, platformId) => {
      const rule = platformRules[platformId];
      if (!rule) return acc;
      const isValid = post.length <= rule.limit;
      acc[platformId] = {
        isValid,
        message: isValid
          ? `✅ ${rule.name} Ready`
          : `❌ ${rule.name} character limit exceeded`,
      };
      return acc;
    }, {});
  }, [post, selectedPlatforms]);

  const isPublishEnabled =
    selectedPlatforms.length > 0 &&
    post.trim().length > 0 &&
    Object.values(validations).every((item) => item.isValid);

  const handlePublish = async () => {
    if (!isPublishEnabled) {
      setToast('Please fix validation issues before publishing.');
      setPublishMessage('');
      return;
    }

    try {
      // Create a history entry in the backend for each selected platform
      const publishPromises = selectedPlatforms.map((platformId) =>
        api.post('/history', {
          post,
          platform: platformId,
          status: 'Published',
          media: mediaFile ? { name: mediaFile.name, path: mediaFile.path } : undefined,
        })
      );

      await Promise.all(publishPromises);

      setPublishMessage(`Published successfully to ${selectedPlatforms.map(p => platformRules[p]?.name || p).join(', ')}!`);
      setToast('Published successfully!');
    } catch (err) {
      console.error('Publish logging error:', err);
      setToast('Failed to log publishing. Verify backend connection.');
    }
  };

  const handleSaveDraft = async () => {
    if (!post.trim()) {
      setToast('Please enter some content before saving a draft.');
      return;
    }

    const title = draftTitle.trim() || `Draft - ${new Date().toLocaleDateString()}`;

    try {
      const payload = {
        title,
        content: post,
        platforms: selectedPlatforms,
        media: mediaFile ? { name: mediaFile.name, type: mediaFile.type, path: mediaFile.path } : undefined,
      };

      if (activeDraftId) {
        // Update existing draft
        const response = await api.put(`/drafts/${activeDraftId}`, payload);
        setToast('Draft updated successfully!');
        setDraftTitle(response.data.title);
      } else {
        // Save new draft
        const response = await api.post('/drafts', payload);
        setActiveDraftId(response.data._id);
        setDraftTitle(response.data.title);
        setToast('Draft saved successfully!');
      }
    } catch (err) {
      console.error('Draft save failed:', err);
      setToast('Failed to save draft. Check backend.');
    }
  };

  const handleLoadDraft = (draft) => {
    setPost(draft.content || '');
    setSelectedPlatforms(draft.platforms || []);
    if (draft.media && draft.media.path) {
      setMediaFile({
        name: draft.media.name,
        type: draft.media.type,
        path: draft.media.path,
      });
    } else {
      setMediaFile(null);
    }
    setDraftTitle(draft.title || 'Untitled Draft');
    setActiveDraftId(draft._id);
    setToast(`Loaded draft: "${draft.title}"`);
  };

  const handleCopy = async () => {
    if (!post.trim()) return;
    await navigator.clipboard.writeText(post);
    setToast('Post copied to clipboard');
  };

  const handleClear = () => {
    setPost('');
    setMediaFile(null);
    setPublishMessage('');
    setDraftTitle('Untitled Draft');
    setActiveDraftId(null);
    setToast('Editor cleared');
  };

  const wordCount = post.trim() ? post.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loading) {
    return (
      <div className={`loading-wrapper ${darkMode ? 'dark' : ''}`} style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: darkMode ? '#0f172a' : '#f5f7ff', color: darkMode ? '#f8fafc' : '#14213d' }}>
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <h3>🔄 Initializing SaaS Workspace...</h3>
          <p style={{ marginTop: '10px', color: '#64748b' }}>Restoring secure credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''}`} style={{ padding: 0 }}>
      {token ? (
        // Logged-in Creators layout
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route
                path="/"
                element={
                  <ComposerView
                    darkMode={darkMode}
                    onToggleTheme={handleToggleTheme}
                    onCopy={handleCopy}
                    onClear={handleClear}
                    onSaveDraft={handleSaveDraft}
                    activeDraftId={activeDraftId}
                    draftTitle={draftTitle}
                    setDraftTitle={setDraftTitle}
                    setActiveDraftId={setActiveDraftId}
                    setToast={setToast}
                    post={post}
                    setPost={setPost}
                    selectedPlatforms={selectedPlatforms}
                    onPlatformSelection={handlePlatformSelection}
                    counts={counts}
                    validations={validations}
                    mediaFile={mediaFile}
                    setMediaFile={setMediaFile}
                    onPublish={handlePublish}
                    publishMessage={publishMessage}
                    wordCount={wordCount}
                    readingTime={readingTime}
                    isPublishEnabled={isPublishEnabled}
                  />
                }
              />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/drafts" element={<DraftsList onLoadDraft={handleLoadDraft} />} />
              <Route path="/history" element={<HistoryList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings darkMode={darkMode} onToggleTheme={handleToggleTheme} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      ) : (
        // Unauthenticated auth workflow
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
