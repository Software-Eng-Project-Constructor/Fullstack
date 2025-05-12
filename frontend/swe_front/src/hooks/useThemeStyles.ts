import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

// This hook provides theme-specific styles that can be used in any component
export const useThemeStyles = () => {
  const { theme } = useTheme();
  
  // Memoize the styles to avoid unnecessary recalculations
  const styles = useMemo(() => {
    // Base styles
    return {
      // Common element styles
      container: {
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
      },
      card: {
        backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
        borderColor: theme === 'light' ? '#e2e8f0' : '#475569',
        boxShadow: theme === 'light' 
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      },
      input: {
        backgroundColor: theme === 'light' ? '#f1f5f9' : '#1e293b',
        borderColor: theme === 'light' ? '#cbd5e1' : '#475569',
        color: 'var(--text-color)',
      },
      button: {
        primary: {
          backgroundColor: '#3b82f6',
          color: 'white',
          hoverBg: '#2563eb',
        },
        secondary: {
          backgroundColor: theme === 'light' ? '#e2e8f0' : '#334155',
          color: theme === 'light' ? '#1e293b' : '#f8fafc',
          hoverBg: theme === 'light' ? '#cbd5e1' : '#475569',
        },
        danger: {
          backgroundColor: '#ef4444',
          color: 'white',
          hoverBg: '#dc2626',
        },
      },
      
      // Utility classes for Tailwind
      tailwind: {
        // Background colors
        bg: theme === 'light' ? 'bg-white' : 'bg-slate-800',
        bgSecondary: theme === 'light' ? 'bg-gray-100' : 'bg-slate-700',
        
        // Text colors
        text: theme === 'light' ? 'text-gray-900' : 'text-gray-100',
        textMuted: theme === 'light' ? 'text-gray-500' : 'text-gray-400',
        
        // Border colors
        border: theme === 'light' ? 'border-gray-200' : 'border-gray-700',
        
        // Input backgrounds
        inputBg: theme === 'light' ? 'bg-gray-50' : 'bg-slate-700',
        
        // Hover states
        hoverBg: theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-700',
      },
    };
  }, [theme]);
  
  return styles;
};