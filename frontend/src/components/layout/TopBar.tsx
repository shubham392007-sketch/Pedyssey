import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { useSystemStatus } from '../../hooks/useSystemStatus';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();
  const { data: status } = useSystemStatus();

  const isReady = status?.ollama?.status === 'ready';
  const isModelMissing = status?.ollama?.status === 'ready' && status?.llm_model?.status === 'offline';
  const isOffline = !status || status.ollama?.status === 'offline';

  const getStatusDisplay = () => {
    if (isReady && !isModelMissing) {
      return {
        label: 'Ollama Connected',
        detail: status.llm_model?.detail || 'Model Ready',
        indicator: 'bg-emerald-500',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
        dot: '●',
      };
    }
    if (isModelMissing) {
      return {
        label: 'Model Missing',
        detail: status.llm_model?.detail || 'Configure in settings',
        indicator: 'bg-amber-500',
        badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
        dot: '○',
      };
    }
    return {
      label: 'Ollama Offline',
      detail: 'Local daemon unreachable (run ollama serve)',
      indicator: 'bg-surface-400',
      badge: 'border-surface-200 bg-surface-100 text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400',
      dot: '○',
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <header className="h-14 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-xl font-semibold text-primary-600 dark:text-primary-400 tracking-tight">
          Pedyssey
        </Link>
        <span className="text-xs px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 font-medium">
          Local-Only RAG
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Ollama Status Indicator (SVG / CSS only, no emojis) */}
        <div 
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.badge} transition-colors`}
          title={statusInfo.detail}
        >
          <span className="flex h-2 w-2 relative">
            {isReady && !isModelMissing && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusInfo.indicator}`}></span>
          </span>
          <span className="font-semibold">{statusInfo.label}</span>
          {isReady && !isModelMissing && status?.llm_model?.detail && (
            <span className="text-[11px] opacity-75 font-normal">
              ({status.llm_model.detail.split(' ')[1] || 'ready'})
            </span>
          )}
        </div>

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
