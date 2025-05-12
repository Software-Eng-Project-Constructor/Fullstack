import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css"; // Global styles

// Initialize theme from localStorage on application start
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('app-theme') || 'adaptive';
  const root = document.documentElement;
  
  // Remove all theme classes first
  root.classList.remove('theme-light', 'theme-dark', 'theme-adaptive');
  
  // Apply the theme class
  root.classList.add(`theme-${savedTheme}`);
  
  // For adaptive theme, check system preference
  if (savedTheme === 'adaptive') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.style.setProperty('--bg-color', '#0f172a');
      root.style.setProperty('--text-color', '#e2e8f0');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#e2e8f0';
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  } else if (savedTheme === 'light') {
    root.style.setProperty('--bg-color', '#ffffff');
    root.style.setProperty('--text-color', '#000000');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
  } else if (savedTheme === 'dark') {
    root.style.setProperty('--bg-color', '#0f172a');
    root.style.setProperty('--text-color', '#e2e8f0');
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = '#e2e8f0';
  }
};

// Initialize theme before rendering
initializeTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);