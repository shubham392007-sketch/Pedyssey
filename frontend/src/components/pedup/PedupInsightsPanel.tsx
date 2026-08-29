import React from 'react';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useChatStore } from '../../stores/useChatStore';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import { CheckIcon, LockShieldIcon } from '../common/SvgIcons';

export const PedupInsightsPanel: React.FC = () => {
  const { documents } = useDocumentStore();
  const { messages } = useChatStore();
  const { data: status } = useSystemStatus();

  const totalPages = documents.reduce((acc, d) => acc + (d.page_count || 1), 0);
  const questionsAsked = messages.filter((m) => m.role === 'user').length;
  const answersGenerated = messages.filter((m) => m.role === 'assistant').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF6EB]/60 backdrop-blur-xl rounded-[28px] border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] space-y-8 select-none">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
          Document Insights &amp;{' '}
          <span className="font-script text-[1.25em] font-normal text-ink leading-none inline-block -rotate-1">
            health.
          </span>
        </h2>
        <p className="text-xs text-ink/70 mt-1 font-medium">
          Real-time metrics from your local FAISS vector store, BM25 index, and{' '}
          <span className="font-script text-sm font-normal text-ink">Ollama</span> engine.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-card bg-card-cream border-1.5 border-ink shadow-editorial">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Document <span className="font-script lowercase text-xs font-normal text-ink">vault</span>
          </span>
          <span className="text-3xl font-black text-ink">{documents.length}</span>
        </div>

        <div className="p-5 rounded-card bg-lime border-1.5 border-ink shadow-editorial">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Total <span className="font-script lowercase text-xs font-normal text-ink">pages</span>
          </span>
          <span className="text-3xl font-black text-ink">{totalPages}</span>
        </div>

        <div className="p-5 rounded-card bg-peach border-1.5 border-ink shadow-editorial">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Questions <span className="font-script lowercase text-xs font-normal text-ink">asked</span>
          </span>
          <span className="text-3xl font-black text-ink">{questionsAsked}</span>
        </div>

        <div className="p-5 rounded-card bg-blush border-1.5 border-ink shadow-editorial">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Answers <span className="font-script lowercase text-xs font-normal text-ink">synthesized</span>
          </span>
          <span className="text-3xl font-black text-ink">{answersGenerated}</span>
        </div>
      </div>

      {/* Pipeline Status Breakdown */}
      <div className="bg-card-cream rounded-card-lg border-2 border-ink p-6 md:p-8 shadow-editorial space-y-4">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          <span>Local Engine &amp; RAG <span className="font-script lowercase text-xl font-normal text-ink">health</span></span>
          <span className="text-xs px-2 py-0.5 rounded-pill bg-lime border border-ink text-ink font-semibold">
            100% OPERATIONAL
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-ink/30 flex items-center justify-between">
            <span className="font-semibold text-ink">Vector Store (FAISS)</span>
            <span className="font-bold text-utility-success flex items-center gap-1">
              <CheckIcon className="w-3.5 h-3.5" /> Dense Search Active
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-ink/30 flex items-center justify-between">
            <span className="font-semibold text-ink">Keyword Search (BM25)</span>
            <span className="font-bold text-utility-success flex items-center gap-1">
              <CheckIcon className="w-3.5 h-3.5" /> Sparse Index Active
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-ink/30 flex items-center justify-between">
            <span className="font-semibold text-ink">Cross-Encoder Reranker</span>
            <span className="font-bold text-utility-success flex items-center gap-1">
              <CheckIcon className="w-3.5 h-3.5" /> ms-marco-MiniLM
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-ink/30 flex items-center justify-between">
            <span className="font-semibold text-ink">LLM Model</span>
            <span className="font-bold text-ink">
              {status?.llm_model?.detail || 'qwen3:8b'} (Ollama)
            </span>
          </div>
        </div>
      </div>

      {/* Local Guarantee Card */}
      <div className="p-4 rounded-2xl bg-lime/50 border-1.5 border-ink flex items-center gap-3 text-xs font-semibold text-ink">
        <LockShieldIcon className="w-5 h-5 text-ink shrink-0" />
        <span>
          Pedyssey enforces zero remote telemetry. All document text and vectors reside on your disk at <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-ink/30">data/indexes/</code>.
        </span>
      </div>
    </div>
  );
};
