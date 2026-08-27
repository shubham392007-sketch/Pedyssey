import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useUploadDocument, useProcessDocument } from '../../hooks/useDocuments';

export const DocumentUpload: React.FC = () => {
  const uploadMut = useUploadDocument();
  const processMut = useProcessDocument();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        const doc = await uploadMut.mutateAsync(file);
        // Automatically start processing
        await processMut.mutateAsync(doc.id);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  }, [uploadMut, processMut]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-300 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-8 w-8 text-surface-400 dark:text-surface-500 mb-2" />
      <p className="text-sm text-surface-600 dark:text-surface-400">
        {isDragActive ? "Drop PDF here" : "Drag & drop PDF, or click to select"}
      </p>
    </div>
  );
};
