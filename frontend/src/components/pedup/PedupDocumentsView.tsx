import React from 'react';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDocuments } from '../../hooks/useDocuments';
import { PillButton } from '../common/PillButton';
import { PdfIcon } from '../common/SvgIcons';
import { documentApi } from '../../services/api';
import type { Document } from '../../types';

interface PedupDocumentsViewProps {
  onOpenDetails: (doc: Document) => void;
  onOpenViewer: (docId: string) => void;
}

export const PedupDocumentsView: React.FC<PedupDocumentsViewProps> = ({
  onOpenDetails,
  onOpenViewer,
}) => {
  const { data: documents, refetch } = useDocuments();
  const { selectedDocIds, toggleSelect, selectAll, deselectAll } = useDocumentStore();

  const handleReindexAll = async () => {
    try {
      await documentApi.reindexAll();
      alert('Reindexing started for all documents.');
      refetch();
    } catch (e) {
      console.error(e);
      alert('Failed to trigger reindexing.');
    }
  };

  const allSelected = documents && documents.length > 0 && selectedDocIds.size === documents.length;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF6EB]/60 backdrop-blur-xl rounded-[28px] border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
            Document{' '}
            <span className="font-script text-[1.25em] font-normal text-ink leading-none inline-block -rotate-1">
              repository.
            </span>
          </h2>
          <p className="text-xs text-ink/70 mt-1 font-medium">
            Manage your indexed PDF files, trigger vector rebuilds, and explore{' '}
            <span className="font-script text-sm font-normal text-ink">insights.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PillButton onClick={handleReindexAll} variant="secondary" size="sm">
            Re-Index <span className="font-script lowercase text-sm font-normal">all</span>
          </PillButton>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3.5 rounded-xl bg-card-cream border-1.5 border-ink flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-ink">
          <input
            type="checkbox"
            checked={Boolean(allSelected)}
            onChange={() => (allSelected ? deselectAll() : selectAll())}
            className="rounded border-ink text-ink focus:ring-lime cursor-pointer"
          />
          <span>Select All ({documents?.length || 0})</span>
        </label>
        <span className="text-[11px] font-bold text-ink/70">
          {selectedDocIds.size} selected for multi-search
        </span>
      </div>

      {/* Document Cards Table / Grid */}
      {!documents || documents.length === 0 ? (
        <div className="p-12 text-center bg-card-cream rounded-card border-1.5 border-ink text-xs text-ink/60 space-y-3">
          <p>No documents uploaded yet.</p>
          <p className="font-semibold text-ink">Use the upload box on the sidebar to add your first PDF.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-white border-1.5 border-ink shadow-card-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ink hover:bg-card-cream/50 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <input
                  type="checkbox"
                  checked={Boolean(selectedDocIds.has(doc.id))}
                  onChange={() => toggleSelect(doc.id)}
                  className="h-4 w-4 rounded border-ink text-ink focus:ring-lime cursor-pointer"
                />
                <div className="p-2 rounded-xl bg-lime border border-ink shrink-0">
                  <PdfIcon className="w-5 h-5 text-ink" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs md:text-sm font-bold text-ink truncate max-w-sm" title={doc.filename}>
                    {doc.filename}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink/60 font-semibold">
                    <span>{doc.page_count || 1} pages</span>
                    <span>•</span>
                    <span className="uppercase text-utility-success font-bold">
                      {doc.status === 'READY' ? 'Ready' : doc.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <PillButton onClick={() => onOpenViewer(doc.id)} variant="secondary" size="sm">
                  View PDF
                </PillButton>
                <PillButton onClick={() => onOpenDetails(doc)} variant="primary" size="sm">
                  Details
                </PillButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
