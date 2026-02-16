"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Apply CSS theme variables
  const applyTheme = (t: "light" | "dark") => {
    if (t === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme"); // light via :root
    }
  };

  // Initialize theme (saved preference → OS preference → light)
  useEffect(() => {
    let initial: "light" | "dark" = "light";
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as "light" | "dark" | null;
      if (saved) {
        initial = saved;
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        initial = "dark";
      }
    }
    setTheme(initial);
    applyTheme(initial);
  }, []);

  // Toggle theme + persist
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    if (typeof window !== "undefined") localStorage.setItem("theme", next);
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      style={{
        padding: "6px 10px",
        background: "transparent",
        border: "1px solid var(--muted)",
        borderRadius: 6,
        color: "inherit",
        cursor: "pointer",
      }}
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
}
