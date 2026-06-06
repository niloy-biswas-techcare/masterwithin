'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative rounded-lg p-2 text-text/80 hover:text-primary transition-all duration-300 hover:bg-surface border border-transparent hover:border-border"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="relative h-5 w-5 overflow-hidden">
        <span
          className={`absolute inset-0 transform transition-transform duration-500 ease-spring ${
            theme === 'dark' ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-50'
          }`}
        >
          <Sun className="h-5 w-5 text-amber-400" />
        </span>
        <span
          className={`absolute inset-0 transform transition-transform duration-500 ease-spring ${
            theme === 'light' ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-50'
          }`}
        >
          <Moon className="h-5 w-5 text-indigo-500" />
        </span>
      </div>
    </button>
  );
}
