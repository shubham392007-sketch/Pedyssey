import React from 'react';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { useUIStore } from '../../stores/useUIStore';

export const DocumentSidebar: React.FC = () => {
  const { sidebarWidth } = useUIStore();
  
  return (
    <div 
      style={{ width: sidebarWidth }} 
      className="flex flex-col border-r border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 shrink-0"
    >
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <DocumentUpload />
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <DocumentList />
      </div>
    </div>
  );
};
