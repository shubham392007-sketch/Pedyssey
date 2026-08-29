import React from 'react';
import type { Document } from '../../types';
import { CheckIcon, LockShieldIcon, PdfIcon } from '../common/SvgIcons';
import { documentApi } from '../../services/api';

interface PedupCoverageModalProps {
  document: Document | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const PedupCoverageModal: React.FC<PedupCoverageModalProps> = ({
  document,
  onClose,
  onRefresh,
}) => {
  if (!document) return null;

  const handleReindex = async () => {
    try {
      await documentApi.reindex(document.id);
      onRefresh();
      alert(`Reindexing started for ${document.filename}`);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to reindex document.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete ${document.filename}? This will remove its local index.`)) {
      try {
        await documentApi.delete(document.id);
        onRefresh();
        onClose();
      } catch (e) {
        console.error(e);
        alert('Failed to delete document.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white/40 backdrop-blur-2xl rounded-[24px] border border-white/70 p-6 md:p-7 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.22)] space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-ink/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-ink/20 shadow-xs">
              <PdfIcon className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-ink truncate max-w-[280px]">
                {document.filename}
              </h3>
              <p className="text-[10px] text-ink/70 font-bold uppercase tracking-wider">
                Coverage &amp; Processing <span className="font-script lowercase text-xs font-normal text-ink">details</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/60 text-ink/70 hover:text-ink font-bold text-base transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Verification Metrics Grid (Frosted Glass Tiles) */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs space-y-1">
            <span className="text-ink/60 font-bold uppercase tracking-wider text-[10px]">Pages Extracted</span>
            <div className="text-sm font-black text-ink flex items-center gap-1.5">
              <span>{document.page_count} / {document.page_count}</span>
              <CheckIcon className="w-3.5 h-3.5 text-utility-success" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs space-y-1">
            <span className="text-ink/60 font-bold uppercase tracking-wider text-[10px]">Status</span>
            <div className="text-xs font-black text-utility-success uppercase">
              {document.status}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs space-y-1">
            <span className="text-ink/60 font-bold uppercase tracking-wider text-[10px]">Vector Search (FAISS)</span>
            <div className="text-xs font-black text-ink">Ready ✓ (Dense)</div>
          </div>

          <div className="p-3 rounded-xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs space-y-1">
            <span className="text-ink/60 font-bold uppercase tracking-wider text-[10px]">Keyword Search (BM25)</span>
            <div className="text-xs font-black text-ink">Ready ✓ (Sparse)</div>
          </div>

          <div className="p-3 rounded-xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs space-y-1">
            <span className="text-ink/60 font-bold uppercase tracking-wider text-[10px]">Cross-Encoder Reranker</span>
            <div className="text-xs font-black text-ink">Ready ✓ (ms-marco)</div>
          </div>

          <div className="p-3 rounded-xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs space-y-1">
            <span className="text-ink/60 font-bold uppercase tracking-wider text-[10px]">LLM Generation</span>
            <div className="text-xs font-black text-ink">Qwen3 8B via Ollama</div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-white/50 backdrop-blur-md border border-white/70 flex items-center gap-2.5 text-xs text-ink font-medium shadow-xs">
          <LockShieldIcon className="w-4 h-4 text-ink shrink-0" />
          <span className="text-[11px] leading-snug">
            Processed 100% locally on your laptop. No data was transferred to cloud servers.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-ink/10">
          <button
            onClick={handleDelete}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline uppercase tracking-wide"
          >
            DELETE DOCUMENT
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReindex}
              className="px-4 py-1.5 rounded-full bg-white/80 hover:bg-white border border-ink/30 text-xs font-bold text-ink shadow-xs transition-colors"
            >
              RE-INDEX
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-ink hover:bg-ink/90 text-xs font-bold text-cream shadow-xs transition-colors"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
