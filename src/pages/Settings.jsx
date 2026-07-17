import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Settings({ darkMode, onToggleTheme }) {
  const { deleteAccount } = useAuth();
  
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'en');
  const [notifications, setNotifications] = useState(localStorage.getItem('appNotifications') === 'true');
  const [toast, setToast] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('appLanguage', val);
    showToast(`Language set to ${val === 'en' ? 'English' : val === 'es' ? 'Spanish' : val === 'fr' ? 'French' : 'German'}`);
  };

  const handleNotificationsToggle = (e) => {
    const val = e.target.checked;
    setNotifications(val);
    localStorage.setItem('appNotifications', val.toString());
    showToast(val ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  const handleClearAllDrafts = async () => {
    try {
      await api.delete('/drafts');
      showToast('All drafts deleted successfully');
      setShowConfirmClear(false);
    } catch (error) {
      console.error('Error clearing drafts:', error);
      showToast('Action failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'delete my account') {
      showToast('Confirmation phrase does not match');
      return;
    }
    try {
      const res = await deleteAccount();
      if (!res.success) {
        showToast(res.error || 'Failed to delete account');
      }
    } catch (error) {
      showToast('Deletion failed');
    }
  };

  return (
    <div className="settings-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Preferences</p>
          <h2>Workspace Settings</h2>
        </div>
      </div>

      <div className="settings-grid">
        {/* Appearance Settings */}
        <section className="card">
          <h3>Appearance & Language</h3>
          <div className="settings-options" style={{ marginTop: '16px' }}>
            {/* Dark Mode Toggle */}
            <div className="settings-item">
              <div className="settings-item-info">
                <span>Dark Theme</span>
                <p className="eyebrow" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                  Adjust interface colors to reduce eye strain
                </p>
              </div>
              <button
                type="button"
                className="publish-btn"
                onClick={onToggleTheme}
                style={{ minWidth: '100px' }}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>

            {/* Language Select */}
            <div className="settings-item" style={{ marginTop: '20px' }}>
              <div className="settings-item-info">
                <span>Display Language</span>
                <p className="eyebrow" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                  Select the language for text and AI suggestions
                </p>
              </div>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="dropdown-toggle"
                style={{ width: '160px', padding: '8px 12px' }}
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications Settings */}
        <section className="card">
          <h3>Communication Settings</h3>
          <div className="settings-options" style={{ marginTop: '16px' }}>
            <div className="settings-item">
              <div className="settings-item-info">
                <span>Email Notifications</span>
                <p className="eyebrow" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                  Receive weekly analytics reports and publishing insights
                </p>
              </div>
              <label className="switch-toggle">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={handleNotificationsToggle}
                  style={{ width: 'auto', marginRight: '8px' }}
                />
                <span>Enabled</span>
              </label>
            </div>
          </div>
        </section>

        {/* Danger zone utilities */}
        <section className="card danger-card span-cols">
          <h3>Danger Zone Preferences</h3>
          <p>Irreversible cleanup actions for deleting app data.</p>

          <div className="danger-actions-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Delete All Drafts */}
            <div className="settings-item" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '16px' }}>
              <div className="settings-item-info">
                <span style={{ color: '#ef4444', fontWeight: '600' }}>Delete All Drafts</span>
                <p className="eyebrow" style={{ textTransform: 'none', letterSpacing: 'normal', color: '#ef4444' }}>
                  Clear all saved drafts permanently from the database.
                </p>
              </div>
              {!showConfirmClear ? (
                <button
                  type="button"
                  className="publish-btn"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                  onClick={() => setShowConfirmClear(true)}
                >
                  Clear Drafts
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>Are you sure?</span>
                  <button
                    type="button"
                    className="publish-btn"
                    style={{ background: '#dc2626', padding: '6px 12px' }}
                    onClick={handleClearAllDrafts}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="publish-btn"
                    style={{ background: '#64748b', padding: '6px 12px' }}
                    onClick={() => setShowConfirmClear(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Delete Account Shortcut */}
            <div className="settings-item">
              <div className="settings-item-info">
                <span style={{ color: '#ef4444', fontWeight: '600' }}>Delete Creator Profile</span>
                <p className="eyebrow" style={{ textTransform: 'none', letterSpacing: 'normal', color: '#ef4444' }}>
                  Close your account and wipe all personal databases.
                </p>
              </div>
              {!showConfirmDelete ? (
                <button
                  type="button"
                  className="publish-btn"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Delete Account
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
                  <label style={{ fontSize: '0.85rem' }}>Type <strong>delete my account</strong> to verify:</label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="delete my account"
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #dc2626' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="publish-btn"
                      style={{ background: '#dc2626', padding: '6px 12px' }}
                      onClick={handleDeleteAccount}
                    >
                      Verify & Delete
                    </button>
                    <button
                      type="button"
                      className="publish-btn"
                      style={{ background: '#64748b', padding: '6px 12px' }}
                      onClick={() => {
                        setShowConfirmDelete(false);
                        setConfirmText('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default Settings;
