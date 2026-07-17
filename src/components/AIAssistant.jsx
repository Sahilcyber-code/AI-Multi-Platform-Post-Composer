import { useState } from 'react';
import api from '../services/api';
import { FaRobot, FaCheck } from 'react-icons/fa6';

function AIAssistant({ text, onApplyText }) {
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tones'); // tones, content, shortcuts

  const handleGenerate = async (option) => {
    if (!text.trim()) {
      setError('Please enter some text in the editor first.');
      return;
    }
    setLoading(true);
    setError('');
    setAiResult('');
    
    try {
      const response = await api.post('/ai/generate', { text, option });
      setAiResult(response.data.result);
    } catch (err) {
      console.error('AI Generation failed:', err);
      setError(err.response?.data?.message || 'AI assistant is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (aiResult) {
      onApplyText(aiResult);
      setAiResult('');
    }
  };

  const toneOptions = [
    { label: '✨ Improve Writing', id: 'improve' },
    { label: '💼 Professional Tone', id: 'professional' },
    { label: '🤪 Funny Tone', id: 'funny' },
    { label: '👔 Formal Tone', id: 'formal' },
  ];

  const contentOptions = [
    { label: '#️⃣ Generate Hashtags', id: 'hashtags' },
    { label: '😀 Generate Emojis', id: 'emojis' },
    { label: '📢 Add Call-to-Action', id: 'cta' },
    { label: '✍️ Create Caption Hook', id: 'caption' },
  ];

  const lengthOptions = [
    { label: '⚡ Short Version', id: 'short' },
    { label: '📝 Long Version', id: 'long' },
  ];

  return (
    <section className="card compact-card ai-assistant-panel">
      <div className="section-heading">
        <h3>
          <FaRobot style={{ marginRight: '8px', color: '#4f46e5' }} />
          AI Copywriting Assistant
        </h3>
      </div>

      <div className="ai-tabs">
        <button
          type="button"
          className={`ai-tab-btn ${activeTab === 'tones' ? 'active' : ''}`}
          onClick={() => setActiveTab('tones')}
        >
          Tones
        </button>
        <button
          type="button"
          className={`ai-tab-btn ${activeTab === 'formatting' ? 'active' : ''}`}
          onClick={() => setActiveTab('formatting')}
        >
          Formats
        </button>
        <button
          type="button"
          className={`ai-tab-btn ${activeTab === 'length' ? 'active' : ''}`}
          onClick={() => setActiveTab('length')}
        >
          Length
        </button>
      </div>

      <div className="ai-options-grid" style={{ marginTop: '12px' }}>
        {activeTab === 'tones' &&
          toneOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="ai-action-btn"
              disabled={loading}
              onClick={() => handleGenerate(opt.id)}
            >
              {opt.label}
            </button>
          ))}

        {activeTab === 'formatting' &&
          contentOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="ai-action-btn"
              disabled={loading}
              onClick={() => handleGenerate(opt.id)}
            >
              {opt.label}
            </button>
          ))}

        {activeTab === 'length' &&
          lengthOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="ai-action-btn"
              disabled={loading}
              onClick={() => handleGenerate(opt.id)}
            >
              {opt.label}
            </button>
          ))}
      </div>

      {error && <div className="auth-error" style={{ marginTop: '12px' }}>{error}</div>}

      {loading && (
        <div className="ai-loading" style={{ marginTop: '12px', textAlign: 'center', color: '#64748b' }}>
          ⏳ Generating content suggestion...
        </div>
      )}

      {aiResult && (
        <div className="ai-output-box" style={{ marginTop: '14px' }}>
          <p className="eyebrow">AI Recommendation</p>
          <div className="ai-result-content">{aiResult}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="publish-btn" onClick={handleApply} style={{ padding: '6px 12px' }}>
              <FaCheck style={{ marginRight: '4px' }} /> Replace Text
            </button>
            <button
              type="button"
              className="publish-btn"
              style={{ background: '#64748b', padding: '6px 12px' }}
              onClick={() => setAiResult('')}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AIAssistant;
