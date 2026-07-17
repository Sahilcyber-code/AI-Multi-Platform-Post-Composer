import { useState, useEffect } from 'react';
import api from '../services/api';
import { platformRules } from '../data/platformRules';
import { FaFileLines, FaPaperPlane, FaStar, FaShareNodes } from 'react-icons/fa6';

function AnalyticsDashboard() {
  const [drafts, setDrafts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [draftsRes, historyRes] = await Promise.all([
          api.get('/drafts'),
          api.get('/history'),
        ]);
        setDrafts(draftsRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading analytics metrics...</div>;
  }

  // Calculate statistics
  const totalDrafts = drafts.length;
  const totalPublished = history.length;
  const totalFavourites = drafts.filter((d) => d.isFavourite).length;

  // Platforms usage calculation
  const platformCounts = { twitter: 0, instagram: 0, facebook: 0, linkedin: 0 };
  
  // Count from drafts platforms
  drafts.forEach((d) => {
    d.platforms.forEach((p) => {
      if (platformCounts[p] !== undefined) platformCounts[p]++;
    });
  });

  // Count from publish history
  history.forEach((h) => {
    if (platformCounts[h.platform] !== undefined) platformCounts[h.platform]++;
  });

  const totalPlatformsUsed = Object.values(platformCounts).reduce((a, b) => a + b, 0);

  // Character Statistics
  const draftChars = drafts.map((d) => d.content?.length || 0);
  const avgDraftChars = draftChars.length
    ? Math.round(draftChars.reduce((a, b) => a + b, 0) / draftChars.length)
    : 0;

  const historyChars = history.map((h) => h.post?.length || 0);
  const avgPublishedChars = historyChars.length
    ? Math.round(historyChars.reduce((a, b) => a + b, 0) / historyChars.length)
    : 0;

  // Weekly activity: publish counts in the last 7 days
  const last7Days = [];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize labels for the last 7 calendar days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push({
      dateStr: d.toDateString(),
      dayName: dayNames[d.getDay()],
      dayIndex: d.getDay(),
    });
  }

  // Populate counts
  history.forEach((h) => {
    const logDate = new Date(h.publishedAt).toDateString();
    const dayMatch = last7Days.find((day) => day.dateStr === logDate);
    if (dayMatch) {
      dayCounts[dayMatch.dayIndex]++;
    }
  });

  const chartData = last7Days.map((day) => ({
    label: day.dayName,
    count: dayCounts[day.dayIndex],
  }));

  const maxWeeklyCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="analytics-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Performance Hub</p>
          <h2>Workspace Analytics</h2>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="analytics-kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <FaFileLines />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Total Drafts</span>
            <span className="kpi-value">{totalDrafts}</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <FaPaperPlane />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Published Posts</span>
            <span className="kpi-value">{totalPublished}</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
            <FaStar />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Favorites</span>
            <span className="kpi-value">{totalFavourites}</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <FaShareNodes />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Total Actions</span>
            <span className="kpi-value">{totalDrafts + totalPublished}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Weekly Publishing Activity */}
        <section className="card chart-section-card">
          <h3>Weekly Publishing Activity</h3>
          <p className="eyebrow" style={{ marginBottom: '24px' }}>Posts simulated in the last 7 days</p>

          <div className="svg-chart-container">
            <svg viewBox="0 0 500 240" className="svg-chart">
              {/* Grid Lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 4" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 4" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 4" />
              <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(148, 163, 184, 0.3)" />

              {/* Y Axis Labels */}
              <text x="30" y="35" textAnchor="end" className="chart-text">{maxWeeklyCount}</text>
              <text x="30" y="115" textAnchor="end" className="chart-text">{Math.round(maxWeeklyCount / 2)}</text>
              <text x="30" y="204" textAnchor="end" className="chart-text">0</text>

              {/* Columns */}
              {chartData.map((d, index) => {
                const colWidth = 40;
                const colGap = 20;
                const startX = 60 + index * (colWidth + colGap);
                // Max height 150px
                const barHeight = (d.count / maxWeeklyCount) * 150;
                const startY = 200 - barHeight;

                return (
                  <g key={d.label}>
                    {/* Hover tooltip hint */}
                    <rect
                      x={startX}
                      y={startY}
                      width={colWidth}
                      height={barHeight}
                      rx="6"
                      fill="url(#chartGrad)"
                      className="chart-bar"
                    />
                    <text x={startX + colWidth / 2} y={startY - 6} textAnchor="middle" className="chart-bar-value">
                      {d.count}
                    </text>
                    <text x={startX + colWidth / 2} y="222" textAnchor="middle" className="chart-text">
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        {/* Platform Share and Statistics */}
        <section className="card chart-section-card">
          <h3>Platform Share & Statistics</h3>
          <p className="eyebrow" style={{ marginBottom: '20px' }}>Total interactions by platform</p>

          <div className="platform-stats-list">
            {Object.entries(platformRules).map(([id, rule]) => {
              const count = platformCounts[id] || 0;
              const percentage = totalPlatformsUsed > 0 ? Math.round((count / totalPlatformsUsed) * 100) : 0;

              return (
                <div key={id} className="platform-stat-item">
                  <div className="platform-stat-header">
                    <span className="platform-stat-name">
                      <span style={{ color: rule.color, marginRight: '8px', fontSize: '1.2rem' }}>
                        {rule.icon}
                      </span>
                      {rule.name}
                    </span>
                    <span className="platform-stat-count">
                      <strong>{count}</strong> interactions ({percentage}%)
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '8px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${percentage || 1}%`,
                        backgroundColor: rule.color,
                        '--platform-color': rule.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="character-stats-summary" style={{ marginTop: '24px', borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '20px' }}>
            <h4 style={{ marginBottom: '12px' }}>Content Length Insights</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="stat-subcard">
                <span className="stat-subcard-title">Avg. Draft Characters</span>
                <span className="stat-subcard-val">{avgDraftChars} chars</span>
              </div>
              <div className="stat-subcard">
                <span className="stat-subcard-title">Avg. Published Characters</span>
                <span className="stat-subcard-val">{avgPublishedChars} chars</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
