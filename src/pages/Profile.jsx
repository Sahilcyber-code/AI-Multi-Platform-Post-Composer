import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateProfile, changePassword, deleteAccount, error } = useAuth();
  
  // Profile Update State
  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Delete State
  const [confirmDelete, setConfirmDelete] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Display Name cannot be blank.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (avatarFile) {
      formData.append('profileImage', avatarFile);
    }

    const res = await updateProfile(formData);
    if (res.success) {
      setProfileSuccess('Profile updated successfully!');
      setAvatarFile(null);
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Confirm password does not match.');
      return;
    }

    const res = await changePassword(currentPassword, newPassword);
    if (res.success) {
      setPassSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError(res.error || 'Failed to change password.');
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (confirmDelete !== 'delete my account') {
      setDeleteError('Please type the exact phrase to confirm deletion.');
      return;
    }

    const res = await deleteAccount();
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete account.');
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  return (
    <div className="profile-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Personal settings</p>
          <h2>User Profile</h2>
        </div>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <section className="card">
          <h3>Display Information</h3>
          <form onSubmit={handleProfileSubmit} className="auth-form" style={{ marginTop: '16px' }}>
            {profileError && <div className="auth-error">{profileError}</div>}
            {profileSuccess && <div className="auth-success">{profileSuccess}</div>}

            <div className="avatar-edit-section">
              <div className="avatar-wrapper profile-large-avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="user-avatar" />
                ) : user?.profileImage ? (
                  <img src={`http://localhost:5000${user.profileImage}`} alt="Avatar" className="user-avatar" />
                ) : (
                  <div className="avatar-placeholder">{user?.name?.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <label className="publish-btn upload-avatar-btn">
                Change Picture
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="form-group">
              <label>Email Address (ReadOnly)</label>
              <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>

            <div className="form-group">
              <label htmlFor="display-name">Display Name</label>
              <input
                type="text"
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="profile-meta-info">
              Joined Workspace: <strong>{formattedDate}</strong>
            </div>

            <button type="submit" className="publish-btn auth-submit-btn">
              Save Profile Changes
            </button>
          </form>
        </section>

        {/* Change Password Card */}
        <section className="card">
          <h3>Update Password</h3>
          <form onSubmit={handlePasswordSubmit} className="auth-form" style={{ marginTop: '16px' }}>
            {passError && <div className="auth-error">{passError}</div>}
            {passSuccess && <div className="auth-success">{passSuccess}</div>}

            <div className="form-group">
              <label htmlFor="curr-pass">Current Password</label>
              <input
                type="password"
                id="curr-pass"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-pass">New Password</label>
              <input
                type="password"
                id="new-pass"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="conf-pass">Confirm New Password</label>
              <input
                type="password"
                id="conf-pass"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="publish-btn auth-submit-btn">
              Change Password
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="card danger-card span-cols">
          <h3>Danger Zone</h3>
          <p>Permanently remove all drafts, publish logs, and delete this profile. This action cannot be undone.</p>
          
          {!showDeleteModal ? (
            <button
              type="button"
              className="publish-btn delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', marginTop: '14px' }}
            >
              Delete My Account
            </button>
          ) : (
            <form onSubmit={handleDeleteSubmit} className="auth-form" style={{ marginTop: '16px', maxWidth: '400px' }}>
              {deleteError && <div className="auth-error">{deleteError}</div>}
              <div className="form-group">
                <label>Type <strong>delete my account</strong> to confirm:</label>
                <input
                  type="text"
                  placeholder="delete my account"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  className="publish-btn"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                >
                  Yes, Delete Permanently
                </button>
                <button
                  type="button"
                  className="publish-btn"
                  style={{ background: '#64748b' }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmDelete('');
                    setDeleteError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
