import React from "react";
import { useTheme } from "./auth/ThemeContext";
import { BsSunFill, BsMoonStarsFill } from "react-icons/bs";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <span className={`theme-toggle-track ${theme}`}>
        <span className="theme-toggle-thumb">
          {theme === "dark" ? <BsMoonStarsFill size={11} /> : <BsSunFill size={11} />}
        </span>
      </span>
    </button>
  );
}
