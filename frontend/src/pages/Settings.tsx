import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RefreshCw, Cpu, Server, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SystemStatus } from '../components/system/SystemStatus';
import { ModelStatus } from '../components/system/ModelStatus';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useUIStore } from '../stores/useUIStore';
import { systemApi, settingsApi } from '../services/api';
import type { LocalModelItem } from '../types';

export const Settings: React.FC = () => {
  const { data: status, refetch: refetchStatus } = useSystemStatus();
  const { theme, toggleTheme } = useUIStore();

  const [localModels, setLocalModels] = useState<LocalModelItem[]>([]);
  const [activeModel, setActiveModel] = useState<string>('qwen3:4b');
  const [ollamaUrl] = useState<string>('http://localhost:11434');
  const [testPrompt, setTestPrompt] = useState<string>('Explain RAG in one sentence.');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testError, setTestError] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchModels();
    loadSettings();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await systemApi.getLocalModels();
      if (res && res.models) {
        setLocalModels(res.models);
      }
    } catch (e) {
      console.error('Failed to fetch local Ollama models', e);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await settingsApi.get();
      if (res && res.settings && res.settings.llm_model) {
        setActiveModel(res.settings.llm_model);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setActiveModel(newModel);
    try {
      await settingsApi.update({ llm_model: newModel });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      refetchStatus();
    } catch (e) {
      console.error('Failed to update active model', e);
    }
  };

  const handleRunTest = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestError('');
    setTestResponse('');
    try {
      const data = await systemApi.testOllama(testPrompt.trim());
      setTestResponse(data.response);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to connect to Ollama.';
      setTestError(msg);
    } finally {
      setIsTesting(false);
    }
  };

  const isOllamaConnected = status?.ollama?.status === 'ready';

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
          <h1 className="text-2xl font-semibold mb-2">Settings</h1>
          <p className="text-sm text-surface-500 mb-6">Manage local neural models, Ollama connectivity, and workspace preferences.</p>
          
          <div className="space-y-6">
            {/* Dedicated Local AI (Ollama) Section */}
            <section className="p-6 border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 space-y-6">
              <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                    <Cpu size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-surface-900 dark:text-surface-100">Local AI (Ollama)</h2>
                    <p className="text-xs text-surface-500">Zero-cloud neural answer generation on your local machine</p>
                  </div>
                </div>
                <button
                  onClick={() => { refetchStatus(); fetchModels(); }}
                  className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-surface-300 hover:text-primary-600 p-2 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-700/60">
                  <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Ollama Status</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isOllamaConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-sm font-medium">{isOllamaConnected ? 'Connected' : 'Offline'}</span>
                  </div>
                  <p className="text-xs text-surface-500 mt-1">
                    {isOllamaConnected ? 'Running on localhost' : 'Ensure `ollama serve` is running'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-700/60">
                  <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Ollama URL</span>
                  <div className="text-sm font-mono mt-1.5 text-surface-800 dark:text-surface-200">{ollamaUrl}</div>
                  <p className="text-xs text-surface-500 mt-1">Restricted to localhost for privacy</p>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-surface-800 dark:text-surface-200">
                    Active LLM Model
                  </label>
                  {saveSuccess && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={14} /> Model updated
                    </span>
                  )}
                </div>
                
                {localModels.length > 0 ? (
                  <select
                    value={activeModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    {localModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} {m.size ? `(${(m.size / 1024 / 1024 / 1024).toFixed(2)} GB)` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 border border-dashed border-surface-300 dark:border-surface-700 rounded-lg text-xs text-surface-500">
                    No models detected yet in local Ollama. To download a model, run:
                    <code className="block mt-1 font-mono text-primary-600 dark:text-primary-400">ollama pull qwen3:4b</code>
                  </div>
                )}
                
                <p className="text-xs text-surface-500">
                  Configured model: <span className="font-mono font-medium">{activeModel}</span>
                </p>
              </div>

              {/* Interactive Test Generation Endpoint */}
              <div className="p-4 rounded-xl border border-primary-100 dark:border-primary-900/40 bg-primary-50/40 dark:bg-primary-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Test Ollama Connection</h3>
                </div>
                <p className="text-xs text-surface-500">
                  Send a lightweight prompt to test local neural inference directly without running the RAG retrieval pipeline.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter test prompt..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleRunTest}
                    disabled={isTesting || !testPrompt.trim()}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Play size={14} />
                    <span>{isTesting ? 'Testing...' : 'Run Test'}</span>
                  </button>
                </div>

                {testError && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{testError}</span>
                  </div>
                )}

                {testResponse && (
                  <div className="p-3 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-1">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ollama Test Response</span>
                    <p className="text-xs text-surface-800 dark:text-surface-200 whitespace-pre-wrap">{testResponse}</p>
                  </div>
                )}
              </div>
            </section>

            {/* System Status Overview */}
            <section>
              <h2 className="text-lg font-medium mb-4 text-surface-800 dark:text-surface-200">System Services</h2>
              <SystemStatus />
            </section>

            {/* Other Models Configuration */}
            {status && (
              <section>
                <h2 className="text-lg font-medium mb-4 text-surface-800 dark:text-surface-200">Local Neural Models</h2>
                <div className="space-y-3">
                  <ModelStatus title="Embedding Model" model={status.embedding_model} />
                  <ModelStatus title="Cross-Encoder Reranker" model={status.reranker} />
                </div>
              </section>
            )}

            {/* Preferences */}
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
            
            {/* Privacy Promise */}
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
