import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaPenToSquare,
  FaChartLine,
  FaFileLines,
  FaClockRotateLeft,
  FaUser,
  FaGear,
  FaRightFromBracket,
} from 'react-icons/fa6';

function Sidebar() {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="card sidebar">
      <div className="sidebar-profile">
        <div className="avatar-wrapper">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="Avatar"
              className="user-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  user?.name || 'User'
                )}`;
              }}
            />
          ) : (
            <div className="avatar-placeholder">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : 'U'}
            </div>
          )}
        </div>

        <div className="profile-info">
          <p className="profile-name">{user?.name || 'Welcome'}</p>
          <p className="profile-role">Creator Plan</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={navLinkClass}>
          <FaPenToSquare className="sidebar-icon" />
          <span>Composer</span>
        </NavLink>

        <NavLink to="/analytics" className={navLinkClass}>
          <FaChartLine className="sidebar-icon" />
          <span>Analytics</span>
        </NavLink>

        <NavLink to="/drafts" className={navLinkClass}>
          <FaFileLines className="sidebar-icon" />
          <span>Saved Drafts</span>
        </NavLink>

        <NavLink to="/history" className={navLinkClass}>
          <FaClockRotateLeft className="sidebar-icon" />
          <span>Publish History</span>
        </NavLink>

        <NavLink to="/profile" className={navLinkClass}>
          <FaUser className="sidebar-icon" />
          <span>Profile</span>
        </NavLink>

        <NavLink to="/settings" className={navLinkClass}>
          <FaGear className="sidebar-icon" />
          <span>Settings</span>
        </NavLink>
      </nav>

      <button className="sidebar-link logout-btn" onClick={logout}>
        <FaRightFromBracket className="sidebar-icon" />
        <span>Log Out</span>
      </button>
    </aside>
  );
}

export default Sidebar;