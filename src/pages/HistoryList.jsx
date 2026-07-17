import { useState, useEffect } from 'react';
import api from '../services/api';
import { platformRules } from '../data/platformRules';
import { FaTrash, FaMagnifyingGlass, FaFilter, FaClock } from 'react-icons/fa6';

function HistoryList() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search;
      if (platformFilter) params.platform = platformFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/history', { params });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching publish history:', error);
      showToast('Error loading history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, platformFilter, statusFilter]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this publish log entry?')) return;
    try {
      await api.delete(`/history/${id}`);
      setHistory(history.filter((h) => h._id !== id));
      showToast('Publish log deleted');
    } catch (error) {
      console.error('Error deleting history entry:', error);
      showToast('Deletion failed');
    }
  };

  return (
    <div className="history-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Audit Log</p>
          <h2>Publish History</h2>
        </div>
      </div>

      {/* Search and Filters */}
      <section className="card filter-card">
        <div className="search-box">
          <FaMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search published posts..."
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

          <div className="filter-item">
            <FaClock className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </section>

      {/* History Log List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading publish logs...</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No published posts logged yet. Select a platform, write a post, and click Publish!
        </div>
      ) : (
        <div className="history-list">
          {history.map((log) => {
            const rule = platformRules[log.platform];
            const logDate = new Date(log.publishedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={log._id} className="card history-item-card">
                <div className="history-item-left">
                  <div className="history-platform-badge" style={{ color: rule?.color || '#3b82f6' }}>
                    {rule?.icon}
                    <span>{rule?.name || log.platform}</span>
                  </div>
                  <p className="history-text">{log.post}</p>
                  {log.media && log.media.name && (
                    <div className="draft-media-badge" style={{ marginTop: '8px' }}>
                      📎 {log.media.name}
                    </div>
                  )}
                  <span className="history-date">{logDate}</span>
                </div>

                <div className="history-item-right">
                  <span className={`status-badge ${log.status.toLowerCase()}`}>
                    {log.status}
                  </span>
                  <button
                    type="button"
                    className="delete-history-btn"
                    title="Delete log entry"
                    onClick={() => handleDelete(log._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default HistoryList;
