import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { Document } from '../../types';
import { useUploadDocument, useProcessDocument } from '../../hooks/useDocuments';
import { documentApi } from '../../services/api';
import { PdfIcon } from '../common/SvgIcons';

interface PedupDocumentsSidebarProps {
  documents: Document[];
  selectedDocIds: Set<string>;
  activeDocId: string | null;
  onToggleSelect: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onSetActive: (id: string) => void;
  onOpenDetails: (doc: Document) => void;
  onRefresh?: () => void;
}

export const PedupDocumentsSidebar: React.FC<PedupDocumentsSidebarProps> = ({
  documents,
  selectedDocIds,
  activeDocId,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onSetActive,
  onOpenDetails,
  onRefresh,
}) => {
  const uploadMut = useUploadDocument();
  const processMut = useProcessDocument();

  const [processingInfo, setProcessingInfo] = useState<{
    filename: string;
    stage: string;
    progress: number;
    step: 'upload' | 'extract' | 'bm25' | 'faiss' | 'ready';
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setProcessingInfo({
          filename: file.name,
          stage: 'Uploading & Verifying PDF...',
          progress: 15,
          step: 'upload',
        });
        const doc = await uploadMut.mutateAsync(file);

        setProcessingInfo({
          filename: file.name,
          stage: 'Parsing & Extracting pages...',
          progress: 30,
          step: 'extract',
        });
        await processMut.mutateAsync(doc.id);

        // Real-time polling with 400ms interval for ultra-smooth live animation
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 450));
          const st = await documentApi.getStatus(doc.id);

          if (st.status === 'READY') {
            setProcessingInfo({
              filename: file.name,
              stage: 'RAG Pipeline Ready!',
              progress: 100,
              step: 'ready',
            });
            if (onRefresh) onRefresh();
            setTimeout(() => setProcessingInfo(null), 2400);
            break;
          }

          if (st.status === 'FAILED') {
            setProcessingInfo({
              filename: file.name,
              stage: 'Processing failed',
              progress: 0,
              step: 'upload',
            });
            setTimeout(() => setProcessingInfo(null), 3000);
            break;
          }

          let stageText = 'Processing...';
          let stepName: 'upload' | 'extract' | 'bm25' | 'faiss' | 'ready' = 'extract';
          let progressVal = Math.max(st.progress || 0, 20);

          if (st.current_stage === 'VALIDATING') {
            stageText = 'Validating document syntax...';
            stepName = 'upload';
            progressVal = Math.max(progressVal, 20);
          } else if (st.current_stage === 'EXTRACTING') {
            stageText = st.total_pages
              ? `Extracting page ${st.current_page || 1} of ${st.total_pages}...`
              : 'Extracting text pages...';
            stepName = 'extract';
            progressVal = Math.max(progressVal, 35);
          } else if (st.current_stage === 'OCR_PROCESSING') {
            stageText = 'Running local OCR extraction...';
            stepName = 'extract';
            progressVal = Math.max(progressVal, 45);
          } else if (st.current_stage === 'CLEANING') {
            stageText = 'Parsing layout & headers...';
            stepName = 'bm25';
            progressVal = Math.max(progressVal, 55);
          } else if (st.current_stage === 'CHUNKING') {
            stageText = 'Generating semantic chunks...';
            stepName = 'bm25';
            progressVal = Math.max(progressVal, 65);
          } else if (st.current_stage === 'EMBEDDING') {
            stageText = 'Computing neural FAISS vectors...';
            stepName = 'faiss';
            progressVal = Math.max(progressVal, 80);
          } else if (st.current_stage === 'INDEXING') {
            stageText = 'Registering FAISS & BM25 indices...';
            stepName = 'faiss';
            progressVal = Math.max(progressVal, 92);
          }

          setProcessingInfo({
            filename: file.name,
            stage: stageText,
            progress: progressVal,
            step: stepName,
          });
        }
      } catch (err) {
        console.error("Upload error", err);
        setProcessingInfo(null);
      }
    }
  }, [uploadMut, processMut, onRefresh]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  const badgeColors = ['bg-[#F7D4BE]', 'bg-[#FAD4E0]', 'bg-[#DFE968]', 'bg-[#FBE6ED]'];
  const allSelected = documents.length > 0 && selectedDocIds.size === documents.length;

  const handleToggleAll = () => {
    if (allSelected) {
      if (onDeselectAll) onDeselectAll();
    } else {
      if (onSelectAll) onSelectAll();
    }
  };

  return (
    <aside className="w-80 lg:w-[340px] bg-[#FAF6EB]/60 backdrop-blur-xl rounded-[28px] border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] p-4 md:p-5 flex flex-col h-full overflow-hidden select-none shrink-0 transition-all">
      {/* Title */}
      <div className="mb-3">
        <h3 className="text-xs font-black tracking-wider uppercase text-ink flex items-center gap-1.5">
          <span>UPLOAD &amp;</span>
          <span className="font-script lowercase text-base font-normal -rotate-2 text-ink">manage</span>
          <span>PDFS</span>
        </h3>
      </div>

      {/* Drag & Drop Upload Card (Glassmorphism) */}
      <div
        {...getRootProps()}
        className={`rounded-[20px] border-2 border-dashed border-ink p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_#1C1C1C] active:scale-[0.98] ${
          isDragActive
            ? 'bg-lime/90 scale-[0.99] border-solid'
            : 'bg-white/60 hover:bg-white/85 backdrop-blur-md'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-9 h-9 rounded-full bg-cream border border-ink flex items-center justify-center mb-2 shadow-sm text-ink font-bold group-hover:scale-105 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
        <span className="text-xs font-black text-ink tracking-tight">
          {isDragActive ? 'Drop PDF here...' : (
            <>
              Drag &amp; drop your PDF <span className="font-script text-sm font-normal text-ink">here</span>
            </>
          )}
        </span>
        <span className="text-[10px] font-semibold text-ink/60 mt-0.5">
          or click to <span className="font-script text-xs font-normal text-ink">browse</span> from laptop
        </span>
      </div>

      {/* Live Real-time Processing Card with Animations */}
      {processingInfo && (
        <div className="mt-3 bg-white/95 backdrop-blur-md rounded-[20px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          {/* Top header with Radar Scanner Icon */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-lime border border-ink flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <div className="absolute inset-0 border-2 border-dashed border-ink/40 rounded-xl animate-radar" />
              <svg className="w-4 h-4 text-ink animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-ink truncate" title={processingInfo.filename}>
                {processingInfo.filename}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-utility-success animate-ping inline-block" />
                <span className="text-[10px] text-ink/75 font-bold truncate">
                  {processingInfo.stage}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Pipeline Milestone Badges */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-bold">
            <div className={`p-1.5 rounded-lg border flex items-center justify-between transition-colors ${
              processingInfo.progress >= 35 ? 'bg-cream/90 border-ink text-ink' : 'bg-surface-50 border-ink/20 text-ink/40'
            }`}>
              <span>1. Extraction</span>
              <span>{processingInfo.progress >= 45 ? '✓' : processingInfo.progress >= 15 ? '⟳' : '○'}</span>
            </div>
            <div className={`p-1.5 rounded-lg border flex items-center justify-between transition-colors ${
              processingInfo.progress >= 55 ? 'bg-cream/90 border-ink text-ink' : 'bg-surface-50 border-ink/20 text-ink/40'
            }`}>
              <span>2. BM25 Parse</span>
              <span>{processingInfo.progress >= 65 ? '✓' : processingInfo.progress >= 45 ? '⟳' : '○'}</span>
            </div>
            <div className={`p-1.5 rounded-lg border flex items-center justify-between transition-colors ${
              processingInfo.progress >= 80 ? 'bg-cream/90 border-ink text-ink' : 'bg-surface-50 border-ink/20 text-ink/40'
            }`}>
              <span>3. FAISS Neural</span>
              <span>{processingInfo.progress >= 92 ? '✓' : processingInfo.progress >= 65 ? '⟳' : '○'}</span>
            </div>
            <div className={`p-1.5 rounded-lg border flex items-center justify-between transition-colors ${
              processingInfo.progress === 100 ? 'bg-lime border-ink text-ink font-black' : 'bg-surface-50 border-ink/20 text-ink/40'
            }`}>
              <span>4. RAG Ready</span>
              <span>{processingInfo.progress === 100 ? '✓' : '○'}</span>
            </div>
          </div>

          {/* Animated Shimmer Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] font-black text-ink">
              <span className="uppercase tracking-wider text-ink/70">Neural Indexing</span>
              <span className="font-mono bg-lime px-2 py-0.5 rounded border border-ink text-[10px]">
                {processingInfo.progress}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-cream border-1.5 border-ink overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-lime border border-ink rounded-full transition-all duration-300 animate-shimmer-stripes"
                style={{ width: `${Math.max(processingInfo.progress, 6)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Selection Header */}
      <div className="mt-4 pt-3 border-t border-ink/15 flex items-center justify-between px-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-ink">
          <input
            type="checkbox"
            checked={Boolean(allSelected)}
            onChange={handleToggleAll}
            className="h-3.5 w-3.5 rounded border-ink text-ink focus:ring-lime cursor-pointer"
          />
          <span>Your <span className="font-script lowercase text-sm font-normal text-ink">vault</span> ({documents.length})</span>
        </label>
        <span className="text-[10px] font-bold text-ink/70 bg-lime/70 px-2 py-0.5 rounded-full border border-ink/30">
          {selectedDocIds.size} <span className="font-script lowercase text-xs font-normal">active</span>
        </span>
      </div>

      {/* Documents List */}
      <div className="mt-2.5 space-y-2.5 flex-1 overflow-y-auto pr-1">
        {documents.length === 0 && !processingInfo ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-[18px] border-2 border-dashed border-ink/30 p-5 text-center text-xs text-ink/60 space-y-1">
            <p className="font-bold text-ink">No documents loaded.</p>
            <p className="text-[10px]">Upload a PDF above to begin <span className="font-script text-xs font-normal text-ink">exploring.</span></p>
          </div>
        ) : (
          documents.map((doc, idx) => {
            const isSelected = selectedDocIds.has(doc.id);
            const isActive = doc.id === activeDocId;
            const badgeBg = badgeColors[idx % badgeColors.length];

            return (
              <div
                key={doc.id}
                onClick={() => onSetActive(doc.id)}
                className={`bg-white/70 hover:bg-white/90 backdrop-blur-md rounded-[18px] border-2 border-ink p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'shadow-[3px_3px_0px_#1C1C1C] border-ink bg-white/95 ring-1 ring-ink'
                    : 'shadow-[2px_2px_0px_#1C1C1C] hover:shadow-[3px_3px_0px_#1C1C1C]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Select Checkbox */}
                  <input
                    type="checkbox"
                    checked={Boolean(isSelected)}
                    onChange={() => onToggleSelect(doc.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-ink text-ink focus:ring-lime cursor-pointer shrink-0"
                    title="Include in multi-document search"
                  />

                  {/* Badge Icon */}
                  <div className={`p-1.5 rounded-lg ${badgeBg} border border-ink shrink-0`}>
                    <PdfIcon className="w-3.5 h-3.5 text-ink" />
                  </div>

                  {/* Title & Status */}
                  <div className="min-w-0">
                    <h4
                      className="text-xs font-bold text-ink truncate max-w-[130px] lg:max-w-[150px]"
                      title={doc.filename}
                    >
                      {doc.filename}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-ink/60 font-semibold">{doc.page_count || 1} pages</span>
                      <span className="text-[10px] text-ink/30">•</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#FAF1CF] border border-ink/40 text-ink">
                        {doc.status === 'READY' ? 'INDEXED' : doc.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3-Dots Action Menu Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(doc);
                  }}
                  className="p-1 rounded-md hover:bg-cream border border-transparent hover:border-ink text-ink/60 hover:text-ink transition-colors shrink-0"
                  title="Inspect Coverage & Details"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="18" r="2" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status Footer */}
      <div className="mt-3 pt-3 border-t-2 border-ink flex items-center justify-between text-[10px] font-bold text-ink/75">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-utility-success inline-block"></span>
          <span>100% Local • Private</span>
        </div>
        <span className="font-mono text-ink/60">Qwen3 8B RAG</span>
      </div>
    </aside>
  );
};
