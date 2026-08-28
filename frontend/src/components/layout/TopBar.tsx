import React from 'react';
import { Settings, Sun, Moon, Server, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { useSystemStatus } from '../../hooks/useSystemStatus';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();
  const { data: status } = useSystemStatus();

  const isOllamaOnline = status?.ollama?.status === 'ready' || status?.ollama?.status === 'online';

  return (
    <header className="h-14 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-xl font-semibold text-primary-600 dark:text-primary-400 tracking-tight">
          Pedyssey
        </Link>
        <span className="text-xs px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 font-medium">
          Local RAG
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Ollama Status Badge */}
        {status && (
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOllamaOnline 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' 
                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
            }`}
            title={isOllamaOnline ? "Local Ollama LLM is active" : "Ollama is offline. Run 'ollama serve' in your terminal."}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOllamaOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>{isOllamaOnline ? 'Ollama Online' : 'Ollama Offline'}</span>
          </div>
        )}

        <button 
          onClick={toggleTheme} 
          className="p-2 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <Link 
          to="/settings" 
          className="p-2 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </Link>
      </div>
    </header>
  );
};
