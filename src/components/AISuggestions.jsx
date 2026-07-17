import { useMemo } from 'react';

function AISuggestions({ text }) {
  const suggestions = useMemo(() => {
    const keywords = (text.toLowerCase().match(/[a-zA-Z]+/g) || []).slice(0, 6);
    const hashtags = keywords
      .filter((word) => word.length > 3)
      .map((word) => `#${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .slice(0, 4);

    const emojis = ['🚀', '💻', '🤖', '✨'];

    const tone = text.includes('!')
      ? 'Positive'
      : text.includes('please') || text.includes('professional')
        ? 'Professional'
        : text.includes('bad') || text.includes('issue')
          ? 'Negative'
          : 'Neutral';

    return {
      hashtags: hashtags.length ? hashtags : ['#React', '#AI', '#Productivity'],
      emojis,
      tone,
    };
  }, [text]);

  return (
    <section className="card compact-card">
      <div className="section-heading">
        <h3>AI Suggestions</h3>
      </div>
      <div className="suggestion-block">
        <p><strong>Hashtags</strong></p>
        <div className="chip-list">{suggestions.hashtags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
      <div className="suggestion-block">
        <p><strong>Emojis</strong></p>
        <div className="chip-list">{suggestions.emojis.map((emoji) => <span key={emoji}>{emoji}</span>)}</div>
      </div>
      <div className="suggestion-block">
        <p><strong>Tone</strong></p>
        <span className="tone-pill">{suggestions.tone}</span>
      </div>
    </section>
  );
}

export default AISuggestions;
