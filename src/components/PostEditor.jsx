import { useEffect } from "react";

function PostEditor({ value, onChange, wordCount, readingTime }) {

  useEffect(() => {
    console.log("✅ Mounted");
  }, []);

  console.log("🔄 Render");

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <section className="card">
      <div className="section-heading">
        <h2>Post Editor</h2>
        <p>Write one message and adapt it for every selected platform.</p>
      </div>

      <textarea
        value={value || ""}
        onChange={handleChange}
        placeholder="Write your post here..."
        rows={8}
        autoComplete="off"
      />

      <div className="meta-row">
        <span>Words: {wordCount}</span>
        <span>Estimated reading time: {readingTime} min</span>
      </div>
    </section>
  );
}

export default PostEditor;