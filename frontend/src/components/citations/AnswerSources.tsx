import React from 'react';
import { FileText } from 'lucide-react';
import type { Citation } from '../../types';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useUIStore } from '../../stores/useUIStore';

export const AnswerSources: React.FC<{ citations: Citation[] }> = ({ citations }) => {
  const { setActiveDoc } = useDocumentStore();
  const { setPdfPage } = useUIStore();

  const handleSourceClick = (docId: string, page: number) => {
    setActiveDoc(docId);
    setPdfPage(page);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {citations.map((cit, idx) => (
        <button
          key={idx}
          onClick={() => handleSourceClick(cit.document_id, cit.page_start)}
          className="flex items-center gap-1 text-xs bg-surface-100 hover:bg-primary-50 text-surface-600 hover:text-primary-700 dark:bg-surface-800 dark:hover:bg-primary-900/30 dark:text-surface-400 dark:hover:text-primary-400 px-2 py-1 rounded-md border border-surface-200 dark:border-surface-700 transition-colors"
          title={cit.text_preview}
        >
          <FileText size={12} />
          <span className="truncate max-w-[120px]">{cit.filename}</span>
          <span className="text-surface-400 dark:text-surface-500">p.{cit.page_start}</span>
        </button>
      ))}
    </div>
  );
};
