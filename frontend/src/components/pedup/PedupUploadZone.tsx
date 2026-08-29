import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, CheckIcon } from '../common/SvgIcons';
import { useUploadDocument, useProcessDocument } from '../../hooks/useDocuments';
import { documentApi } from '../../services/api';

export const PedupUploadZone: React.FC = () => {
  const uploadMut = useUploadDocument();
  const processMut = useProcessDocument();
  const [processingInfo, setProcessingInfo] = useState<{
    filename: string;
    stage: string;
    progress: number;
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setProcessingInfo({ filename: file.name, stage: 'Uploading PDF...', progress: 15 });
        const doc = await uploadMut.mutateAsync(file);
        
        setProcessingInfo({ filename: file.name, stage: 'Extracting pages & chunking...', progress: 50 });
        await processMut.mutateAsync(doc.id);
        
        // Poll for completion
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 1200));
          const st = await documentApi.getStatus(doc.id);
          if (st.status === 'READY') {
            setProcessingInfo({ filename: file.name, stage: 'Index built successfully!', progress: 100 });
            setTimeout(() => setProcessingInfo(null), 2500);
            break;
          }
          if (st.status === 'INDEXING') {
            setProcessingInfo({ filename: file.name, stage: 'Building FAISS & BM25 index...', progress: 85 });
          }
        }
      } catch (err) {
        console.error("Upload error", err);
        setProcessingInfo(null);
      }
    }
  }, [uploadMut, processMut]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragActive
            ? 'border-ink bg-lime/60 shadow-editorial scale-[0.99]'
            : 'border-ink/50 bg-card-cream hover:bg-white hover:border-ink shadow-card-subtle'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-10 h-10 rounded-full bg-cream border border-ink flex items-center justify-center mx-auto mb-2.5">
          <UploadIcon className="w-5 h-5 text-ink" />
        </div>
        <p className="text-xs font-bold text-ink mb-0.5">
          {isDragActive ? "Drop your PDF file here" : "Drag & drop your PDF here"}
        </p>
        <p className="text-[11px] text-ink/60 font-medium">
          or click to browse from laptop
        </p>
      </div>

      {/* Live Processing Stage Feedback */}
      {processingInfo && (
        <div className="p-3.5 rounded-xl bg-lime/90 border-1.5 border-ink text-ink shadow-card-subtle text-xs space-y-2">
          <div className="flex items-center justify-between font-bold">
            <span className="truncate max-w-[180px]">{processingInfo.filename}</span>
            <span>{processingInfo.progress}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-white/70 border border-ink overflow-hidden">
            <div
              className="h-full bg-ink transition-all duration-300 rounded-full"
              style={{ width: `${processingInfo.progress}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-ink/80 flex items-center gap-1.5">
            {processingInfo.progress === 100 ? (
              <CheckIcon className="w-3.5 h-3.5 text-utility-success" />
            ) : (
              <span className="animate-spin text-xs inline-block">↻</span>
            )}
            {processingInfo.stage}
          </p>
        </div>
      )}
    </div>
  );
};
