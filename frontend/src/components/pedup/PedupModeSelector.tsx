import React, { useState } from 'react';
import type { ResponseMode, ActionMode, ExplainLevel } from '../../types';

// Crisp SVG Icons (Strictly No Emojis)
const QuickIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const ThinkIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a5 5 0 0 1 5 5v1a4 4 0 0 1 3 3.87A4 4 0 0 1 18 16v1a5 5 0 0 1-5 5 5 5 0 0 1-5-5v-1a4 4 0 0 1-2-4.13A4 4 0 0 1 7 8V7a5 5 0 0 1 5-5z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
    <path d="M9 12h6" />
  </svg>
);

const DeepResearchIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <path d="M11 8v6M8 11h6" strokeLinecap="round" />
  </svg>
);

const StudyIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ResearchIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ExplainIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CompareIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="18" rx="1" />
    <rect x="14" y="3" width="7" height="18" rx="1" />
  </svg>
);

const AnalyzeIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const VerifyIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

interface PedupModeSelectorProps {
  selectedMode: ResponseMode;
  onSelectMode: (mode: ResponseMode) => void;
  selectedAction?: ActionMode;
  onSelectAction?: (action?: ActionMode) => void;
  explainLevel: ExplainLevel;
  onSelectExplainLevel: (level: ExplainLevel) => void;
  onTriggerQuickAction?: (action: ActionMode, promptText: string) => void;
}

export const PedupModeSelector: React.FC<PedupModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  selectedAction,
  onSelectAction,
  explainLevel,
  onSelectExplainLevel,
  onTriggerQuickAction,
}) => {
  const [showExplore, setShowExplore] = useState(false);

  const primaryModes: { id: ResponseMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    { id: 'quick', label: 'QUICK', icon: <QuickIcon />, tooltip: 'Fast concise answers with page citations' },
    { id: 'think', label: 'THINK', icon: <ThinkIcon />, tooltip: 'Multi-step reasoning across document sections' },
    { id: 'deep_research', label: 'DEEP RESEARCH', icon: <DeepResearchIcon />, tooltip: 'Comprehensive full-PDF investigation & structured report' },
  ];

  const exploreModes: { id: ResponseMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    { id: 'study', label: 'STUDY', icon: <StudyIcon />, tooltip: 'Revision notes, quizzes, flashcards & interactive tutor' },
    { id: 'research', label: 'RESEARCH', icon: <ResearchIcon />, tooltip: 'Academic analysis: Problem, Methods, Results, Datasets' },
    { id: 'explain', label: 'EXPLAIN', icon: <ExplainIcon />, tooltip: 'Multi-level conceptual breakdown (Beginner to Expert)' },
    { id: 'compare', label: 'COMPARE', icon: <CompareIcon />, tooltip: 'Side-by-side comparative matrices across documents' },
    { id: 'analyze', label: 'ANALYZE', icon: <AnalyzeIcon />, tooltip: 'Critical audit of claims, methodology & limitations' },
    { id: 'verify', label: 'VERIFY', icon: <VerifyIcon />, tooltip: 'Fact-check claims with ground-truth verification verdicts' },
  ];

  const isExploreActive = exploreModes.some((m) => m.id === selectedMode);

  return (
    <div className="w-full space-y-2 select-none">
      {/* Top Bar: Primary Modes + Explore Dropdown Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Primary Modes */}
          {primaryModes.map((m) => {
            const isActive = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelectMode(m.id);
                  onSelectAction?.(undefined);
                }}
                title={m.tooltip}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full border-1.5 border-ink text-[11px] font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#1C1C1C] ${
                  isActive
                    ? 'bg-lime text-ink -translate-y-0.5 shadow-[2px_2px_0px_#1C1C1C]'
                    : 'bg-[#FAF6EB]/90 hover:bg-[#FAF6EB] text-ink/80 hover:text-ink'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}

          {/* Explore Modes Toggle Pill */}
          <button
            type="button"
            onClick={() => setShowExplore(!showExplore)}
            className={`px-3 py-1.5 rounded-full border-1.5 border-ink text-[11px] font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#1C1C1C] ${
              isExploreActive
                ? 'bg-[#F7D4BE] text-ink shadow-[2px_2px_0px_#1C1C1C]'
                : showExplore
                ? 'bg-cream text-ink shadow-[2px_2px_0px_#1C1C1C]'
                : 'bg-[#FAF6EB]/80 hover:bg-[#FAF6EB] text-ink/70 hover:text-ink'
            }`}
          >
            <span>Explore Modes</span>
            {isExploreActive && (
              <span className="font-script lowercase text-xs font-normal text-ink -mt-0.5">
                ({selectedMode.replace('_', ' ')})
              </span>
            )}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`w-3 h-3 transition-transform duration-200 ${showExplore ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Current Active Mode Hint */}
        <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-ink/60 uppercase tracking-wider">
          <span>Mode:</span>
          <span className="text-ink font-black bg-cream px-2 py-0.5 rounded border border-ink/30">
            {selectedMode.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Expanded Explore Modes Bar */}
      {showExplore && (
        <div className="p-2.5 rounded-[16px] bg-[#FFFBF0]/95 backdrop-blur-md border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-ink/60">
              Specialized Document Modes
            </span>
            <button
              type="button"
              onClick={() => setShowExplore(false)}
              className="text-[10px] font-black text-ink/60 hover:text-ink hover:bg-cream px-2 py-0.5 rounded transition-colors"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {exploreModes.map((m) => {
              const isActive = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelectMode(m.id);
                    onSelectAction?.(undefined);
                  }}
                  title={m.tooltip}
                  className={`px-3 py-1.5 rounded-full border-1.5 border-ink text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-lime text-ink shadow-[1.5px_1.5px_0px_#1C1C1C] -translate-y-0.5'
                      : 'bg-white hover:bg-cream text-ink/80 hover:text-ink shadow-[1px_1px_0px_#1C1C1C]'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contextual Action Sub-Bar tailored for Active Mode */}
      {selectedMode === 'study' && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-[14px] bg-[#FAF6EB] border border-ink/40">
          <span className="text-[10px] font-black uppercase tracking-wider text-ink/70 pl-1 mr-1">
            Study Actions:
          </span>
          <button
            type="button"
            onClick={() => onTriggerQuickAction?.('flashcards', 'Generate interactive flashcards for key concepts in this document')}
            className={`px-2.5 py-1 rounded-full border border-ink text-[10px] font-black shadow-[1px_1px_0px_#1C1C1C] transition-all ${
              selectedAction === 'flashcards' ? 'bg-lime text-ink' : 'bg-white hover:bg-lime text-ink'
            }`}
          >
            Generate Flashcards
          </button>
          <button
            type="button"
            onClick={() => onTriggerQuickAction?.('quiz', 'Create a 5-question interactive quiz on the core topics of this document')}
            className={`px-2.5 py-1 rounded-full border border-ink text-[10px] font-black shadow-[1px_1px_0px_#1C1C1C] transition-all ${
              selectedAction === 'quiz' ? 'bg-lime text-ink' : 'bg-white hover:bg-lime text-ink'
            }`}
          >
            Create Quiz
          </button>
          <button
            type="button"
            onClick={() => onTriggerQuickAction?.('summarize', 'Provide a comprehensive study summary with revision notes')}
            className={`px-2.5 py-1 rounded-full border border-ink text-[10px] font-black shadow-[1px_1px_0px_#1C1C1C] transition-all ${
              selectedAction === 'summarize' ? 'bg-lime text-ink' : 'bg-white hover:bg-lime text-ink'
            }`}
          >
            Revision Notes
          </button>
          <button
            type="button"
            onClick={() => onTriggerQuickAction?.('tutor', 'Teach me the core concepts of this document step by step')}
            className={`px-2.5 py-1 rounded-full border border-ink text-[10px] font-black shadow-[1px_1px_0px_#1C1C1C] transition-all ${
              selectedAction === 'tutor' ? 'bg-lime text-ink' : 'bg-white hover:bg-lime text-ink'
            }`}
          >
            Interactive Tutor
          </button>
        </div>
      )}

      {selectedMode === 'explain' && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-[14px] bg-[#FAF6EB] border border-ink/40">
          <span className="text-[10px] font-black uppercase tracking-wider text-ink/70 pl-1">
            Explanation Level:
          </span>
          {(['beginner', 'intermediate', 'technical', 'expert'] as ExplainLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onSelectExplainLevel(lvl)}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                explainLevel === lvl
                  ? 'bg-lime border-ink text-ink shadow-[1px_1px_0px_#1C1C1C]'
                  : 'bg-white border-ink/40 text-ink/60 hover:text-ink'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      )}

      {selectedMode === 'research' && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-[14px] bg-[#FAF6EB] border border-ink/40">
          <span className="text-[10px] font-black uppercase tracking-wider text-ink/70 pl-1 mr-1">
            Research Tools:
          </span>
          <button
            type="button"
            onClick={() => onTriggerQuickAction?.('write', 'Generate a full research report covering Problem, Methodology, Results, and Limitations')}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-lime border border-ink text-[10px] font-black text-ink shadow-[1px_1px_0px_#1C1C1C] transition-all"
          >
            Full Academic Report
          </button>
          <button
            type="button"
            onClick={() => onTriggerQuickAction?.('extract', 'Extract all models, datasets, metrics, and algorithms into structured tables')}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-lime border border-ink text-[10px] font-black text-ink shadow-[1px_1px_0px_#1C1C1C] transition-all"
          >
            Extract Tables & Datasets
          </button>
          <button
            type="button"
            onClick={() => onTriggerQuickAction?.('review', 'Audit document for contradictions, missing data, and methodological gaps')}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-lime border border-ink text-[10px] font-black text-ink shadow-[1px_1px_0px_#1C1C1C] transition-all"
          >
            Methodology Audit
          </button>
        </div>
      )}

      {selectedMode === 'verify' && (
        <div className="flex items-center gap-2 p-2 rounded-[14px] bg-[#FAF6EB] border border-ink/40 text-[10px] text-ink/80 font-medium">
          <span className="font-black uppercase text-ink">Verify Rule:</span>
          <span>Enter any statement or metric to verify if it is SUPPORTED, CONTRADICTED, or INSUFFICIENT in the text.</span>
        </div>
      )}
    </div>
  );
};
