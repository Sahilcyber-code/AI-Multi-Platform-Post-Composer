import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { platformRules } from '../data/platformRules';
import { FaStar, FaRegStar, FaCopy, FaPen, FaTrash, FaMagnifyingGlass, FaFilter } from 'react-icons/fa6';

function DraftsList({ onLoadDraft }) {
  const [drafts, setDrafts] = useState([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [favouriteFilter, setFavouriteFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search;
      if (platformFilter) params.platform = platformFilter;
      if (favouriteFilter) params.favourite = 'true';

      const response = await api.get('/drafts', { params });
      setDrafts(response.data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      showToast('Error loading drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [search, platformFilter, favouriteFilter]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleToggleFavourite = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/drafts/${id}/favourite`);
      // Update local state
      setDrafts(drafts.map((d) => (d._id === id ? response.data : d)));
      showToast(response.data.isFavourite ? 'Draft added to Favourites' : 'Draft removed from Favourites');
    } catch (error) {
      console.error('Error favoriting draft:', error);
      showToast('Action failed');
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/drafts/${id}/duplicate`);
      setDrafts([response.data, ...drafts]);
      showToast('Draft duplicated successfully');
    } catch (error) {
      console.error('Error duplicating draft:', error);
      showToast('Duplication failed');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft?')) return;

    try {
      await api.delete(`/drafts/${id}`);
      setDrafts(drafts.filter((d) => d._id !== id));
      showToast('Draft deleted');
    } catch (error) {
      console.error('Error deleting draft:', error);
      showToast('Deletion failed');
    }
  };

  const handleEdit = (draft) => {
    onLoadDraft(draft);
    navigate('/');
  };

  return (
    <div className="drafts-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Saved Workspace</p>
          <h2>Saved Drafts</h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section className="card filter-card">
        <div className="search-box">
          <FaMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search drafts by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <FaFilter className="filter-icon" />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="">All Platforms</option>
              {Object.entries(platformRules).map(([id, rule]) => (
                <option key={id} value={id}>
                  {rule.name}
                </option>
              ))}
            </select>
          </div>

          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={favouriteFilter}
              onChange={(e) => setFavouriteFilter(e.target.checked)}
            />
            <span>Show Favourites Only</span>
          </label>
        </div>
      </section>

      {/* Drafts Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading saved drafts...</div>
      ) : drafts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No drafts found. Write something in the Composer and click Save Draft!
        </div>
      ) : (
        <div className="drafts-grid">
          {drafts.map((draft) => (
            <div key={draft._id} className="card draft-item-card">
              <div className="draft-card-header">
                <h4>{draft.title}</h4>
                <button
                  type="button"
                  className="fav-btn"
                  onClick={(e) => handleToggleFavourite(draft._id, e)}
                >
                  {draft.isFavourite ? (
                    <FaStar style={{ color: '#fbbf24' }} />
                  ) : (
                    <FaRegStar style={{ color: '#94a3b8' }} />
                  )}
                </button>
              </div>

              <p className="draft-snippet">
                {draft.content ? (
                  draft.content.length > 140
                    ? `${draft.content.slice(0, 140)}...`
                    : draft.content
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Empty content</span>
                )}
              </p>

              {draft.media && draft.media.name && (
                <div className="draft-media-badge">
                  📎 {draft.media.name}
                </div>
              )}

              <div className="draft-card-footer">
                <div className="draft-platforms">
                  {draft.platforms.map((id) => (
                    <span key={id} className="platform-tiny-icon" title={platformRules[id]?.name}>
                      {platformRules[id]?.icon}
                    </span>
                  ))}
                </div>

                <div className="draft-actions">
                  <button
                    type="button"
                    title="Duplicate Draft"
                    onClick={(e) => handleDuplicate(draft._id, e)}
                  >
                    <FaCopy />
                  </button>
                  <button
                    type="button"
                    title="Edit Draft"
                    className="edit-draft-btn"
                    onClick={() => handleEdit(draft)}
                  >
                    <FaPen />
                  </button>
                  <button
                    type="button"
                    title="Delete Draft"
                    className="delete-draft-btn"
                    onClick={(e) => handleDelete(draft._id, e)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default DraftsList;
