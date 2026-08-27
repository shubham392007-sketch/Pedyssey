import React from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { DocumentItem } from './DocumentItem';

export const DocumentList: React.FC = () => {
  const { data: documents, isLoading } = useDocuments();
  const { selectedDocIds, selectAll, deselectAll } = useDocumentStore();

  if (isLoading) {
    return <div className="p-4 text-surface-500 text-sm">Loading documents...</div>;
  }

  if (!documents || documents.length === 0) {
    return <div className="p-4 text-surface-500 text-sm text-center mt-10">No documents found. Upload one to begin.</div>;
  }

  const allSelected = documents.length > 0 && selectedDocIds.size === documents.length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 flex items-center justify-between border-b border-surface-200 dark:border-surface-800 text-sm">
        <label className="flex items-center gap-2 cursor-pointer text-surface-600 dark:text-surface-400">
          <input 
            type="checkbox" 
            checked={allSelected}
            onChange={() => allSelected ? deselectAll() : selectAll()}
            className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          Select All
        </label>
        <span className="text-xs text-surface-500">{selectedDocIds.size} selected</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {documents.map(doc => (
          <DocumentItem key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
};
