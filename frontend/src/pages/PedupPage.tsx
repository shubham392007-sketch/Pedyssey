import React, { useState } from 'react';
import { PedupTopBar } from '../components/pedup/PedupTopBar';
import { PedupDocumentsSidebar } from '../components/pedup/PedupDocumentsSidebar';
import { PedupChatSection } from '../components/pedup/PedupChatSection';
import { PedupDocumentViewer } from '../components/pedup/PedupDocumentViewer';
import { PedupInsightsPanel } from '../components/pedup/PedupInsightsPanel';
import { PedupDocumentsView } from '../components/pedup/PedupDocumentsView';
import { PedupCoverageModal } from '../components/pedup/PedupCoverageModal';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useSystemStatus } from '../hooks/useSystemStatus';
import type { Document, Citation } from '../types';

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

  const modelName = status?.llm_model?.detail?.split("'")[1] || 'qwen3:8b';

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
            {isSidebarOpen ? (
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
            ) : (
              <aside className="hidden sm:flex flex-col justify-start shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Open Documents Sidebar"
                  className="px-3 py-3 rounded-[20px] bg-[#FAF6EB]/90 hover:bg-[#FAF6EB] backdrop-blur-md border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] hover:shadow-[4px_4px_0px_#1C1C1C] text-ink font-black flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="w-6 h-6 rounded-lg bg-lime border border-ink flex items-center justify-center shadow-xs">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-ink">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-widest text-[10px] font-black text-ink/80 py-1">
                    Vault ({documents.length})
                  </span>
                </button>
              </aside>
            )}

            {/* Right Column: Chat & Question Answering */}
            <section className="flex-1 flex gap-4 overflow-hidden h-full">
              <PedupChatSection
                onCitationClick={handleCitationClick}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              />

              {/* Right Document Viewer Drawer */}
              {showViewer && (
                <PedupDocumentViewer
                  initialPage={viewerPage}
                  onClose={() => setShowViewer(false)}
                />
              )}
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
