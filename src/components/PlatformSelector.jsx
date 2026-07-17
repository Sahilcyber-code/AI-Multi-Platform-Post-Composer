import { useState } from 'react';
import { platformRules } from '../data/platformRules.jsx';

function PlatformSelector({ selectedPlatforms, onPlatformSelection }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={`card ${isOpen ? 'dropdown-open' : ''}`}>
      <div className="section-heading">
        <h2>Platform Selection</h2>
        <p>Choose where your post should appear.</p>
      </div>

      <div className="dropdown-shell">
        <button type="button" className="dropdown-toggle" onClick={() => setIsOpen((value) => !value)}>
          <span>
            {selectedPlatforms.length > 0
              ? selectedPlatforms.map((id) => platformRules[id]?.name).join(', ')
              : 'Select platforms'}
          </span>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▾</span>
        </button>

        {isOpen ? (
          <div className="dropdown-menu">
            {Object.entries(platformRules).map(([id, rule]) => {
              const isSelected = selectedPlatforms.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => onPlatformSelection(id)}
                >
                  <span className="check-icon">{isSelected ? '✓' : '○'}</span>
                  <span>{rule.icon}</span>
                  <span>{rule.name}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="selected-tags">
        {selectedPlatforms.length > 0 ? (
          selectedPlatforms.map((id) => (
            <span key={id} className="tag-pill">
              {platformRules[id]?.icon} {platformRules[id]?.name}
            </span>
          ))
        ) : (
          <span className="empty-tag">No platforms selected</span>
        )}
      </div>
    </section>
  );
}

export default PlatformSelector;
