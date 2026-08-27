import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export const PdfControls: React.FC<{ numPages: number, docName: string }> = ({ numPages, docName }) => {
  const { pdfPage, pdfZoom, setPdfPage, setPdfZoom } = useUIStore();

  return (
    <div className="h-12 border-b border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate max-w-[200px]" title={docName}>
        {docName}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-md p-1">
          <button 
            onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}
            disabled={pdfPage <= 1}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-50 text-surface-600 dark:text-surface-400"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium w-16 text-center text-surface-700 dark:text-surface-300">
            {pdfPage} / {numPages || '-'}
          </span>
          <button 
            onClick={() => setPdfPage(Math.min(numPages, pdfPage + 1))}
            disabled={!numPages || pdfPage >= numPages}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-50 text-surface-600 dark:text-surface-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-md p-1">
          <button 
            onClick={() => setPdfZoom(Math.max(0.5, pdfZoom - 0.25))}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-medium w-12 text-center text-surface-700 dark:text-surface-300">
            {Math.round(pdfZoom * 100)}%
          </span>
          <button 
            onClick={() => setPdfZoom(Math.min(3, pdfZoom + 0.25))}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
