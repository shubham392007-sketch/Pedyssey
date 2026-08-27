import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DocumentSidebar } from '../components/documents/DocumentSidebar';
import { PdfViewer } from '../components/pdf/PdfViewer';
import { ChatPanel } from '../components/chat/ChatPanel';

export const Dashboard: React.FC = () => {
  return (
    <AppLayout>
      <DocumentSidebar />
      <PdfViewer />
      <ChatPanel />
    </AppLayout>
  );
};
