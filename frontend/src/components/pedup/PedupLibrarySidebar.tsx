import React from 'react';

interface PedupLibrarySidebarProps {
  activeTab: 'documents' | 'insights' | 'workspace';
  onTabChange: (tab: 'documents' | 'insights' | 'workspace') => void;
}

export const PedupLibrarySidebar: React.FC<PedupLibrarySidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <aside className="w-56 lg:w-60 bg-white rounded-[24px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] p-4 flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-2 py-2 mb-2 text-ink">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <h2 className="text-base font-extrabold tracking-tight">Library</h2>
      </div>

      {/* Navigation Items */}
      <div className="space-y-2 flex-1">
        {/* Documents Item */}
        <button
          type="button"
          onClick={() => onTabChange('documents')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[16px] text-xs font-bold transition-all duration-150 ${
            activeTab === 'documents'
              ? 'bg-lime border-1.5 border-ink text-ink shadow-[2px_2px_0px_#1C1C1C]'
              : 'text-ink/75 hover:text-ink hover:bg-cream/70 border-1.5 border-transparent'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Documents</span>
        </button>

        {/* AI Insights Item */}
        <button
          type="button"
          onClick={() => onTabChange('insights')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[16px] text-xs font-bold transition-all duration-150 ${
            activeTab === 'insights'
              ? 'bg-lime border-1.5 border-ink text-ink shadow-[2px_2px_0px_#1C1C1C]'
              : 'text-ink/75 hover:text-ink hover:bg-cream/70 border-1.5 border-transparent'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>AI Insights</span>
        </button>

        {/* Workspace Item */}
        <button
          type="button"
          onClick={() => onTabChange('workspace')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[16px] text-xs font-bold transition-all duration-150 ${
            activeTab === 'workspace'
              ? 'bg-lime border-1.5 border-ink text-ink shadow-[2px_2px_0px_#1C1C1C]'
              : 'text-ink/75 hover:text-ink hover:bg-cream/70 border-1.5 border-transparent'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Workspace</span>
        </button>
      </div>

      {/* Bottom Status Tag */}
      <div className="p-2.5 rounded-[14px] bg-cream/80 border border-ink/30 text-[10px] font-bold text-ink/70 text-center">
        100% On-Device AI
      </div>
    </aside>
  );
};
