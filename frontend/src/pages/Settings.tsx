import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SystemStatus } from '../components/system/SystemStatus';
import { ModelStatus } from '../components/system/ModelStatus';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useUIStore } from '../stores/useUIStore';

export const Settings: React.FC = () => {
  const { data: status } = useSystemStatus();
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100">
      <header className="h-14 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center px-4 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to App</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-6">Settings</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-medium mb-4 text-surface-800 dark:text-surface-200">System Services</h2>
              <SystemStatus />
            </section>

            {status && (
              <section>
                <h2 className="text-lg font-medium mb-4 text-surface-800 dark:text-surface-200">Models Configuration</h2>
                <div className="space-y-3">
                  <ModelStatus title="Embedding Model" model={status.embedding_model} />
                  <ModelStatus title="LLM (Ollama)" model={status.llm_model} />
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-medium mb-4 text-surface-800 dark:text-surface-200">Preferences</h2>
              <div className="p-4 border border-surface-200 dark:border-surface-800 rounded-lg bg-white dark:bg-surface-900 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Theme</h4>
                  <p className="text-sm text-surface-500">Toggle light/dark mode</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded-md text-sm font-medium transition-colors"
                >
                  {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                </button>
              </div>
            </section>
            
            <section className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/50 p-4 rounded-lg">
              <h3 className="font-medium text-primary-800 dark:text-primary-300 mb-2">Privacy First</h3>
              <p className="text-sm text-primary-700 dark:text-primary-400">
                Pedyssey runs entirely on your local machine. No documents or queries are ever sent to the cloud. Your data remains completely private.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
