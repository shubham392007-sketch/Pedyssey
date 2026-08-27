import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import type { Document } from '../../types';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useDeleteDocument, useProcessingStatus } from '../../hooks/useDocuments';
import { ProcessingProgress } from './ProcessingProgress';

export const DocumentItem: React.FC<{ document: Document }> = ({ document }) => {
  const { toggleSelect, selectedDocIds, setActiveDoc, activeDocId } = useDocumentStore();
  const deleteMut = useDeleteDocument();
  
  const isSelected = selectedDocIds.has(document.id);
  const isActive = activeDocId === document.id;
  const isProcessing = document.status === 'processing' || document.status === 'pending';
  
  const { data: statusData } = useProcessingStatus(document.id, isProcessing);

  const getStatusColor = () => {
    if (document.status === 'ready') return 'bg-green-500';
    if (document.status === 'error') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div 
      className={`group flex flex-col p-3 rounded-lg border cursor-pointer transition-colors
        ${isActive ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-white border-transparent hover:border-surface-200 dark:bg-surface-900 dark:hover:border-surface-700'}`}
      onClick={() => setActiveDoc(document.id)}
    >
      <div className="flex items-start gap-3">
        <input 
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); toggleSelect(document.id); }}
          className="mt-1 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-surface-400 shrink-0" />
            <span className="text-sm font-medium truncate text-surface-900 dark:text-surface-100" title={document.filename}>
              {document.filename}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
            <span>{document.page_count} pages</span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}></span>
              <span className="capitalize">{document.status}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); deleteMut.mutate(document.id); }}
          className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {isProcessing && statusData && (
        <div className="mt-3 pl-8">
          <ProcessingProgress status={statusData} />
        </div>
      )}
    </div>
  );
};
