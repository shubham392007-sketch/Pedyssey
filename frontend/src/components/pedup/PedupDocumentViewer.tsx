import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { documentApi } from '../../services/api';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useLensStore } from '../../stores/useLensStore';
import type { LensAction } from '../../stores/useLensStore';
import { PdfIcon, LensIcon } from '../common/SvgIcons';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PedupDocumentViewerProps {
  initialPage?: number;
  onClose: () => void;
  onLensAction?: (action: LensAction, askQuestion?: string) => void;
}

export const PedupDocumentViewer: React.FC<PedupDocumentViewerProps> = ({
  initialPage = 1,
  onClose,
  onLensAction,
}) => {
  const { activeDocId, documents } = useDocumentStore();
  const { selection, setSelection, isLensDirectOpen, toggleLensDirect } = useLensStore();
  const [page, setPage] = useState<number>(initialPage);
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);

  const activeDoc = documents.find((d) => d.id === activeDocId);

  const handleTextSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 3) return;
    
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setSelection({
      text,
      page,
      documentId: activeDocId!,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    });
  };

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
    <div className="w-[380px] md:w-[460px] lg:w-[480px] bg-[#FAF6EB]/60 backdrop-blur-xl rounded-[28px] border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] flex flex-col h-full shrink-0 overflow-hidden transition-all">
      {/* Top Header Controls */}
      <div className="h-14 border-b-2 border-ink px-4 md:px-5 bg-white/70 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
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
            onClick={toggleLensDirect}
            className={`ml-1 px-2.5 py-1 rounded-lg border border-ink font-black text-[11px] flex items-center gap-1.5 shadow-xs transition-all ${
              isLensDirectOpen ? 'bg-lime shadow-[1.5px_1.5px_0px_#1C1C1C]' : 'bg-white/90 hover:bg-lime'
            }`}
            title="Open Pedyssey Lens"
          >
            <LensIcon className="w-3.5 h-3.5 text-ink" />
            <span>Lens</span>
          </button>
          <button
            onClick={onClose}
            className="ml-1 w-7 h-7 rounded-lg border border-ink bg-cream hover:bg-blush font-black text-xs flex items-center justify-center shadow-xs transition-colors"
            title="Close viewer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Dedicated Built-in Lens Panel */}
      {isLensDirectOpen && (
        <div className="border-b-2 border-ink bg-[#FFFDF7] p-3 space-y-2 select-none animate-in fade-in slide-in-from-top-2 duration-150 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-lime border border-ink text-[10px] font-black text-ink flex items-center gap-1 shadow-xs">
                <LensIcon className="w-3 h-3 text-ink" />
                <span>PEDYSSEY LENS</span>
              </span>
              <span className="text-[10px] font-bold text-ink/70">
                {selection ? `Selection on p.${selection.page}` : `Target: Page ${page}`}
              </span>
            </div>
            <button
              onClick={toggleLensDirect}
              className="text-[10px] font-bold text-ink/50 hover:text-ink px-1.5 py-0.5 rounded"
            >
              Hide
            </button>
          </div>

          {selection ? (
            <div className="px-2.5 py-1 bg-lime/15 border border-lime/50 rounded-lg text-[10px] text-ink/80 italic truncate">
              "{selection.text.slice(0, 90)}{selection.text.length > 90 ? '...' : ''}"
            </div>
          ) : (
            <p className="text-[10px] font-medium text-ink/60 italic">
              Highlight any text in the PDF below, or click an action to run on Page {page}:
            </p>
          )}

          {/* Quick Action Grid/Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'explain', label: 'Explain' },
              { id: 'analyze', label: 'Analyze' },
              { id: 'verify', label: 'Verify' },
              { id: 'compare', label: 'Compare' },
              { id: 'find_evidence', label: 'Evidence' },
              { id: 'summarize', label: 'Summarize' },
              { id: 'translate', label: 'Translate' },
              { id: 'create_notes', label: 'Notes' },
            ].map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  if (!selection) {
                    setSelection({
                      text: `Page ${page} excerpt`,
                      page,
                      documentId: activeDocId!,
                      rect: { top: 0, left: 0, width: 0, height: 0 },
                    });
                  }
                  onLensAction?.(action.id as LensAction);
                }}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-lime border border-ink text-[10px] font-black text-ink shadow-xs transition-all active:scale-95"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PDF Document Render Area */}
      <div className="flex-1 overflow-auto bg-white/30 backdrop-blur-sm p-4 flex justify-center" onMouseUp={handleTextSelection}>
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
      <div className="h-11 border-t-2 border-ink px-4 md:px-5 bg-white/70 backdrop-blur-md flex items-center justify-between text-[11px] font-black text-ink select-none">
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
