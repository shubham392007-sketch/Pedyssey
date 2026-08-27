import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useUIStore } from '../../stores/useUIStore';
import { documentApi } from '../../services/api';
import { PdfControls } from './PdfControls';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const PdfViewer: React.FC = () => {
  const { activeDocId, documents } = useDocumentStore();
  const { pdfPage, pdfZoom } = useUIStore();
  const [numPages, setNumPages] = useState<number>(0);

  const activeDoc = documents.find(d => d.id === activeDocId);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!activeDocId || !activeDoc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100/50 dark:bg-surface-900/20 text-surface-400">
        <p>Select a document to view</p>
      </div>
    );
  }

  const fileUrl = documentApi.getFileUrl(activeDocId);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-100/50 dark:bg-surface-900/20 relative">
      <PdfControls numPages={numPages} docName={activeDoc.filename} />
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="p-4 text-surface-500">Loading PDF...</div>}
          className="drop-shadow-lg"
        >
          <Page 
            pageNumber={pdfPage} 
            scale={pdfZoom}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="bg-white"
          />
        </Document>
      </div>
    </div>
  );
};
