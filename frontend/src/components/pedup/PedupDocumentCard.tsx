import React from 'react';
import type { Document } from '../../types';
import { PdfIcon } from '../common/SvgIcons';

interface PedupDocumentCardProps {
  document: Document;
  isSelected: boolean;
  isActive: boolean;
  onToggleSelect: (id: string) => void;
  onSetActive: (id: string) => void;
  onOpenDetails: (doc: Document) => void;
}

export const PedupDocumentCard: React.FC<PedupDocumentCardProps> = ({
  document,
  isSelected,
  isActive,
  onToggleSelect,
  onSetActive,
  onOpenDetails,
}) => {
  return (
    <div
      onClick={() => onSetActive(document.id)}
      className={`group relative p-3 rounded-2xl border-1.5 transition-all duration-150 cursor-pointer select-none ${
        isActive
          ? 'bg-lime border-ink shadow-editorial'
          : 'bg-card-cream border-ink/40 hover:border-ink hover:bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Checkbox for Multi-Doc RAG */}
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleSelect(document.id)}
            className="mt-1 h-3.5 w-3.5 rounded border-ink text-ink focus:ring-lime cursor-pointer"
            title="Include in multi-document search"
          />

          <div className="p-1.5 rounded-lg bg-white border border-ink shrink-0">
            <PdfIcon className="w-4 h-4 text-ink" />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-ink truncate max-w-[140px]" title={document.filename}>
              {document.filename}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-ink/60 font-semibold">
                {document.page_count || 1} pages
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-white/70 border border-ink/20 text-utility-success">
                {document.status === 'READY' ? 'Indexed' : document.status}
              </span>
            </div>
          </div>
        </div>

        {/* Options / Coverage Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(document);
          }}
          className="p-1 rounded-lg hover:bg-white/80 text-ink/70 hover:text-ink transition-colors"
          title="View document details & coverage"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="18" r="2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
