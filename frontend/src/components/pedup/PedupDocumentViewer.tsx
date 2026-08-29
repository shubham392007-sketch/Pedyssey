import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { documentApi } from '../../services/api';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { PdfIcon } from '../common/SvgIcons';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PedupDocumentViewerProps {
  initialPage?: number;
  onClose: () => void;
}

export const PedupDocumentViewer: React.FC<PedupDocumentViewerProps> = ({
  initialPage = 1,
  onClose,
}) => {
  const { activeDocId, documents } = useDocumentStore();
  const [page, setPage] = useState<number>(initialPage);
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);

  const activeDoc = documents.find((d) => d.id === activeDocId);

  if (!activeDocId || !activeDoc) {
    return (
      <div className="w-[380px] md:w-[460px] lg:w-[480px] bg-[#FAF6EB]/60 backdrop-blur-xl rounded-[28px] border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] p-6 flex flex-col items-center justify-center text-center text-xs text-ink/70 font-bold shrink-0">
        <p>Select a document to inspect pages.</p>
        <button onClick={onClose} className="mt-4 px-4 py-1.5 rounded-full bg-lime text-ink border border-ink font-bold shadow-xs">
          Close
        </button>
      </div>
    );
  }

  const fileUrl = documentApi.getFileUrl(activeDocId);

  return (
    <div className="w-[380px] md:w-[460px] lg:w-[480px] bg-[#FAF6EB]/60 backdrop-blur-xl rounded-[28px] border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] flex flex-col h-full shrink-0 select-none overflow-hidden transition-all">
      {/* Top Header Controls */}
      <div className="h-14 border-b-2 border-ink px-4 md:px-5 bg-white/70 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-lime border border-ink shrink-0">
            <PdfIcon className="w-3.5 h-3.5 text-ink" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-ink truncate block max-w-[160px]" title={activeDoc.filename}>
              {activeDoc.filename}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-7 h-7 rounded-lg border border-ink bg-white/90 hover:bg-lime backdrop-blur-sm font-black flex items-center justify-center disabled:opacity-40 shadow-xs transition-colors"
          >
            ‹
          </button>
          <span className="font-mono text-[11px] font-black text-ink px-1.5">
            {page} / {numPages || activeDoc.page_count}
          </span>
          <button
            onClick={() => setPage(Math.min(numPages || activeDoc.page_count, page + 1))}
            disabled={page >= (numPages || activeDoc.page_count)}
            className="w-7 h-7 rounded-lg border border-ink bg-white/90 hover:bg-lime backdrop-blur-sm font-black flex items-center justify-center disabled:opacity-40 shadow-xs transition-colors"
          >
            ›
          </button>
          <button
            onClick={onClose}
            className="ml-2 w-7 h-7 rounded-lg border border-ink bg-cream hover:bg-blush font-black text-xs flex items-center justify-center shadow-xs transition-colors"
            title="Close viewer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* PDF Document Render Area */}
      <div className="flex-1 overflow-auto bg-white/30 backdrop-blur-sm p-4 flex justify-center">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="p-4 text-xs font-bold text-ink/60 animate-pulse">Rendering PDF page...</div>}
          error={<div className="p-4 text-xs font-bold text-utility-error">Failed to load preview.</div>}
        >
          <Page
            pageNumber={page}
            scale={zoom}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-[4px_4px_0px_#1C1C1C] border-2 border-ink rounded-xl overflow-hidden bg-white"
          />
        </Document>
      </div>

      {/* Zoom Controls */}
      <div className="h-11 border-t-2 border-ink px-4 md:px-5 bg-white/70 backdrop-blur-md flex items-center justify-between text-[11px] font-black text-ink">
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(Math.max(0.6, zoom - 0.15))} className="w-6 h-6 rounded-md bg-white/90 hover:bg-lime border border-ink font-bold shadow-xs">
            -
          </button>
          <button onClick={() => setZoom(Math.min(2.0, zoom + 0.15))} className="w-6 h-6 rounded-md bg-white/90 hover:bg-lime border border-ink font-bold shadow-xs">
            +
          </button>
        </div>
      </div>
    </div>
  );
};
