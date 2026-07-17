import { platformRules } from '../data/platformRules.jsx';

function CharacterCounter({ counts, validations }) {
  return (
    <section className="card compact-card">
      <div className="section-heading">
        <h3>Character Counter</h3>
      </div>
      <div className="counter-list">
        {Object.entries(platformRules).map(([id, rule]) => {
          const count = counts[id]?.count ?? 0;
          const limit = counts[id]?.limit ?? rule.limit;
          const validation = validations[id];
          const isOverflowed = count > limit;
          
          return (
            <div key={id} className="counter-item" style={{ '--platform-color': rule.color }}>
              <div className="counter-title-row">
                <div className="counter-title">
                  <strong>{rule.name}</strong>
                  <span>{validation?.message}</span>
                </div>
                <div className="counter-value">
                  {count} / {limit}
                </div>
              </div>
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${isOverflowed ? 'overflowed' : ''}`}
                  style={{ width: `${Math.min(100, (count / limit) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CharacterCounter;
