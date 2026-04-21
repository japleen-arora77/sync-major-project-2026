import React, { useState } from "react";

const TagInput = ({ tags, setTags, limit }) => {
  const [input, setInput] = useState("");

   // Ensure tags is always an array (safe handling)
   const safeTags = Array.isArray(tags)
   ? tags
   : typeof tags === "string"
   ? tags.split(",").map((t) => t.trim()).filter(Boolean)
   : [];

    // new Common function to add tag (used by Enter + Button)
  const handleAddTag = () => {
    if (!input.trim()) return; // prevent empty
    if (safeTags.length >= limit) return; // max limit
    if (safeTags.includes(input.trim())) return; // prevent duplicate

    setTags([...safeTags, input.trim()]);
    setInput(""); // clear input after adding
  };


  // Existing Enter key support (Desktop)
  const addTag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(); // reuse same logic
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

       {/*  Input field */}
       <input
        type="text"
        value={input}
        placeholder="Type and press enter"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag} // Enter support
        enterKeyHint="done" 
      />

       {/* new Button for mobile users */}
       <button
        type="button"
        className="add-btn"
        onClick={handleAddTag}
      >
        +
      </button>

    </div>
  );
};

export default TagInput;
