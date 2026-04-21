import React, { useEffect, useState } from "react";
import "./themeToggle.css"; // NEW CSS FILE

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark-mode");
      setDarkMode(true);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <div className={`toggle-circle ${darkMode ? "dark" : ""}`}>
        {darkMode ? "🌙" : "☀️"}
      </div>
    </div>
  );
};

export default ThemeToggle;