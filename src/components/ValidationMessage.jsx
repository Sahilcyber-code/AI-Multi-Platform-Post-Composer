function ValidationMessage({ validations }) {
  return (
    <section className="card compact-card">
      <div className="section-heading">
        <h3>Real-Time Validation</h3>
      </div>
      <ul className="validation-list">
        {Object.entries(validations).map(([platformId, item]) => (
          <li key={platformId} className={item.isValid ? 'valid' : 'invalid'}>
            {item.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ValidationMessage;
