import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="h-14 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xl font-semibold text-primary-600 dark:text-primary-400">
          Pedyssey
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Status dots could go here */}
        
        <button onClick={toggleTheme} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <Link to="/settings" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
};
