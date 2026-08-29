import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';

interface PedupTopBarProps {
  activeTab: 'ASK' | 'INSIGHTS' | 'DOCUMENTS';
  onTabChange: (tab: 'ASK' | 'INSIGHTS' | 'DOCUMENTS') => void;
  onOpenManageModels?: () => void;
  modelName?: string;
}

export const PedupTopBar: React.FC<PedupTopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenManageModels,
  modelName = 'qwen3:8b',
}) => {
  const tabs: Array<'ASK' | 'INSIGHTS' | 'DOCUMENTS'> = ['ASK', 'INSIGHTS', 'DOCUMENTS'];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EB]/85 backdrop-blur-xl border-b-2 border-ink px-4 md:px-8 py-2.5 flex items-center justify-between select-none shadow-sm">
      {/* Left: Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <Logo size="md" to="/" />
        <span className="hidden sm:inline-block text-ink/40 font-bold">|</span>
        <span className="hidden sm:inline-block text-xs md:text-sm font-bold text-ink tracking-tight">
          PDF Intelligence <span className="font-script text-base font-normal -rotate-1 inline-block text-ink">workspace.</span>
        </span>
      </div>

      {/* Center: Tabs (ASK, INSIGHTS, DOCUMENTS) */}
      <nav className="flex items-center gap-1 sm:gap-2 bg-white/70 p-1 rounded-full border-1.5 border-ink">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-150 ${
                isActive
                  ? 'bg-lime text-ink border border-ink shadow-[1.5px_1.5px_0px_#1C1C1C]'
                  : 'text-ink/70 hover:text-ink hover:bg-cream/80'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Right: Local AI Status Badge & Exit */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Model Badge */}
        <button
          type="button"
          onClick={onOpenManageModels}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-1.5 border-ink shadow-[1.5px_1.5px_0px_#1C1C1C] hover:bg-cream transition-colors text-xs font-bold text-ink"
          title="Inspect Local AI Engine & System Status"
        >
          <span className="text-[10px] font-black uppercase text-ink/60 hidden sm:inline">LOCAL AI</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-utility-success animate-pulse inline-block"></span>
            '{modelName}'
          </span>
        </button>

        {/* Exit Button */}
        <Link
          to="/"
          className="flex items-center gap-1 text-xs font-black tracking-wider uppercase text-ink hover:text-ink/75 transition-colors px-2 py-1"
          title="Exit Workspace and return to Home"
        >
          <span>EXIT</span>
          <span className="text-sm font-bold">→</span>
        </Link>
      </div>
    </header>
  );
};
