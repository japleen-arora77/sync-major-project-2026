import React, { useState } from "react";

const TagInput = ({ tags, setTags, limit }) => {
  const [input, setInput] = useState("");

  const safeTags = Array.isArray(tags)
  ? tags
  : typeof tags === "string"
  ? tags.split(",").map((t) => t.trim()).filter(Boolean)
  : [];

  const addTag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!input.trim()) return;
      if (safeTags.length >= limit) return;
      if (safeTags.includes(input.trim())) return;
      setTags([...safeTags, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (index) => {
    setTags(safeTags.filter((_, i) => i !== index));
  };

  return (
    <div className="tag-input">
      {safeTags.map((tag, index) => (
        <span className="tag" key={index}>
          {tag}
          <span className="remove" onClick={() => removeTag(index)}>
            ×
          </span>
        </span>
      ))}

      <input
        type="text"
        value={input}
        placeholder="Type & press Enter"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
      />
    </div>
  );
};

export default TagInput;
