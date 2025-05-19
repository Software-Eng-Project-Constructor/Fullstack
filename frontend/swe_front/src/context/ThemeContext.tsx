import React, { createContext, useState, useEffect, useContext } from "react";

// Define theme types
export type ThemeType = "light" | "dark" | "adaptive";

// Utility function to apply theme - moved from Settings.tsx
export const applyTheme = (themeName: ThemeType) => {
  const root = document.documentElement;

  // Remove all theme classes first
  root.classList.remove("theme-light", "theme-dark", "theme-adaptive");

  // Store the selected theme
  localStorage.setItem("app-theme", themeName);

  // Apply the selected theme
  if (themeName === "light") {
    root.style.setProperty("--bg-color", "#ffffff");
    root.style.setProperty("--text-color", "#000000");
    root.style.setProperty("--primary-color", "#3b82f6");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#000000";
    root.classList.add("theme-light");
  } else if (themeName === "dark") {
    root.style.setProperty("--bg-color", "#141414"); // Main page background
    root.style.setProperty("--card-bg", "#1e293b"); // Card, modal, input bg
    root.style.setProperty("--border-color", "#475569"); // Input/modal border
    root.style.setProperty("--text-color", "#e2e8f0"); // Primary text
    root.style.setProperty("--muted-text-color", "#94a3b8"); // Subtle/help text
    root.style.setProperty("--primary-color", "#f97316"); // Orange-500
    root.style.setProperty("--primary-color-hover", "#ea580c"); // Orange-600

    document.body.style.backgroundColor = "#0f172a";
    document.body.style.color = "#e2e8f0";
    root.classList.add("theme-dark");
  } else {
    // Adaptive theme - check system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      root.style.setProperty("--bg-color", "#0f172a");
      root.style.setProperty("--text-color", "#e2e8f0");
      document.body.style.backgroundColor = "#0f172a";
      document.body.style.color = "#e2e8f0";
    } else {
      root.style.setProperty("--bg-color", "#ffffff");
      root.style.setProperty("--text-color", "#000000");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    }
    root.classList.add("theme-adaptive");
  }

  // Force re-render styles
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 100);
};

// Create context type
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType>({
  theme: "adaptive",
  setTheme: () => {},
});

// Custom hook for easy use of theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme from localStorage or default to 'adaptive'
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("app-theme");
    return (savedTheme as ThemeType) || "adaptive";
  });

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Setup listener for system preference changes when in adaptive mode
  useEffect(() => {
    if (theme === "adaptive") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Initial application
      applyTheme("adaptive");

      // Create event handler
      const handleChange = () => {
        if (theme === "adaptive") {
          applyTheme("adaptive");
        }
      };

      // Add event listener
      mediaQuery.addEventListener("change", handleChange);

      // Cleanup
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
