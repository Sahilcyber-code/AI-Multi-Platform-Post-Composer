function PublishButton({ onPublish, isEnabled, publishMessage }) {
  return (
    <section className="card publish-card">
      <button className="publish-btn" onClick={onPublish} disabled={!isEnabled}>
        Publish
      </button>
      {publishMessage ? <p className="success-message">{publishMessage}</p> : null}
    </section>
  );
}

export default PublishButton;
