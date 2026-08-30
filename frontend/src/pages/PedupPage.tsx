import React, { useState, useRef } from 'react';
import { PedupTopBar } from '../components/pedup/PedupTopBar';
import { PedupDocumentsSidebar } from '../components/pedup/PedupDocumentsSidebar';
import { PedupChatSection } from '../components/pedup/PedupChatSection';
import { PedupDocumentViewer } from '../components/pedup/PedupDocumentViewer';
import { PedupInsightsPanel } from '../components/pedup/PedupInsightsPanel';
import { PedupDocumentsView } from '../components/pedup/PedupDocumentsView';
import { PedupCoverageModal } from '../components/pedup/PedupCoverageModal';
import { LensToolbar } from '../components/lens/LensToolbar';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useLensAction } from '../hooks/useLensAction';
import { useLensKeyboard } from '../hooks/useLensKeyboard';
import { useLensStore } from '../stores/useLensStore';
import type { Document, Citation } from '../types';
import type { LensAction } from '../stores/useLensStore';

export const PedupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ASK' | 'INSIGHTS' | 'DOCUMENTS'>('ASK');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const { data: documents = [], refetch } = useDocuments();
  const {
    activeDocId,
    setActiveDoc,
    selectedDocIds,
    toggleSelect,
    selectAll,
    deselectAll,
  } = useDocumentStore();
  const { data: status } = useSystemStatus();

  const [selectedDocForDetails, setSelectedDocForDetails] = useState<Document | null>(null);
  const [showViewer, setShowViewer] = useState<boolean>(false);
  const [viewerPage, setViewerPage] = useState<number>(1);
  const viewerSectionRef = useRef<HTMLElement | null>(null);

  const { executeLensAction } = useLensAction();
  useLensKeyboard();

  const modelName = status?.llm_model?.detail?.split("'")[1] || 'qwen3:8b';

  const handleLensAction = (action: LensAction, askQuestion?: string) => {
    const docIds = selectedDocIds.size > 0 ? Array.from(selectedDocIds) : (activeDocId ? [activeDocId] : []);
    executeLensAction(action, docIds, 'quick', askQuestion);
  };

  const handleOpenLensDirectly = () => {
    if (!showViewer) {
      if (!activeDocId && documents.length > 0) {
        setActiveDoc(documents[0].id);
      }
      setShowViewer(true);
    }
    useLensStore.getState().openLensDirect();
  };

  const handleCitationClick = (citation: Citation) => {
    setActiveDoc(citation.document_id);
    setViewerPage(citation.page_start || 1);
    setShowViewer(true);
  };

  const handleOpenViewerForDoc = (docId: string) => {
    setActiveDoc(docId);
    setViewerPage(1);
    setShowViewer(true);
    setActiveTab('ASK');
  };

  const handleOpenManageModels = () => {
    if (documents.length > 0) {
      setSelectedDocForDetails(documents[0]);
    } else {
      setActiveTab('INSIGHTS');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-moonwood-gradient text-ink overflow-hidden selection:bg-lime selection:text-ink">
      {/* Top Navbar */}
      <PedupTopBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'ASK') {
            setShowViewer(false);
          }
        }}
        onOpenManageModels={handleOpenManageModels}
        modelName={modelName}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 p-3 md:p-5 flex gap-3 md:gap-4 overflow-hidden">
        {/* ASK Workspace: Dynamic 1 or 2 Column Layout */}
        {activeTab === 'ASK' && (
          <>
            {/* Left Column: Upload & Manage Documents Sidebar */}
            {isSidebarOpen && (
              <PedupDocumentsSidebar
                documents={documents}
                selectedDocIds={selectedDocIds}
                activeDocId={activeDocId}
                onToggleSelect={toggleSelect}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onSetActive={setActiveDoc}
                onOpenDetails={(doc) => setSelectedDocForDetails(doc)}
                onRefresh={refetch}
                onClose={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Right Column: Chat & Question Answering */}
            <section ref={viewerSectionRef} className="flex-1 flex gap-4 overflow-hidden h-full relative">
              <PedupChatSection
                onCitationClick={handleCitationClick}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onOpenLens={handleOpenLensDirectly}
              />

              {/* Right Document Viewer Drawer */}
              {showViewer && (
                <PedupDocumentViewer
                  initialPage={viewerPage}
                  onClose={() => setShowViewer(false)}
                  onLensAction={handleLensAction}
                />
              )}

              {/* Lens Floating Toolbar (appears near selection) */}
              <LensToolbar
                onAction={handleLensAction}
              />
            </section>
          </>
        )}

        {/* INSIGHTS Tab */}
        {activeTab === 'INSIGHTS' && (
          <section className="flex-1 bg-white rounded-[24px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] overflow-hidden flex flex-col">
            <PedupInsightsPanel />
          </section>
        )}

        {/* DOCUMENTS Tab */}
        {activeTab === 'DOCUMENTS' && (
          <section className="flex-1 bg-white rounded-[24px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] overflow-hidden flex flex-col">
            <PedupDocumentsView
              onOpenDetails={(d) => setSelectedDocForDetails(d)}
              onOpenViewer={handleOpenViewerForDoc}
            />
          </section>
        )}
      </main>

      {/* Coverage / Details Modal */}
      {selectedDocForDetails && (
        <PedupCoverageModal
          document={selectedDocForDetails}
          onClose={() => setSelectedDocForDetails(null)}
          onRefresh={refetch}
        />
      )}
    </div>
  );
};
