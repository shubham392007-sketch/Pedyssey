import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLensStore } from '../../stores/useLensStore';
import type { LensAction } from '../../stores/useLensStore';
import { LensIcon } from '../common/SvgIcons';

/* ── SVG micro-icons for each Lens action ─────────────────────── */
const AskIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="5.5" r="4.5" /><path d="M8 7.5v0m0-3v1.5" /><path d="M5.5 13h5" /><path d="M8 10v3" />
  </svg>
);
const ExplainIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h12M2 7h8M2 11h10" />
  </svg>
);
const AnalyzeIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2" width="13" height="12" rx="2" /><path d="M4 10l2.5-3 2 2 3.5-4" />
  </svg>
);
const VerifyIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8.5l2.5 2.5L12 5" /><circle cx="8" cy="8" r="6.5" />
  </svg>
);
const CompareIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3" width="5" height="10" rx="1" /><rect x="9.5" y="3" width="5" height="10" rx="1" /><path d="M7.5 5v6" strokeDasharray="1.5 1.5" />
  </svg>
);
const EvidenceIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
  </svg>
);
const SummarizeIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h10M3 6.5h7M3 10h5" />
  </svg>
);
const TranslateIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h5M4.5 3v1.5c0 2-1.5 3.5-3 4.5" /><path d="M3 6c1 1.5 3 2.5 4 3" /><path d="M9 5l2.5 8M14 13l-2.5-8" /><path d="M10 10h3" />
  </svg>
);
const NotesIcon = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" /><path d="M5 5h6M5 8h4M5 11h5" />
  </svg>
);

const LENS_ACTIONS: { key: LensAction; label: string; tooltip: string; Icon: React.FC }[] = [
  { key: 'ask',            label: 'Ask',           tooltip: 'Ask a targeted question about this selection', Icon: AskIcon },
  { key: 'explain',        label: 'Explain',       tooltip: 'Clarify concepts and technical terms',          Icon: ExplainIcon },
  { key: 'analyze',        label: 'Analyze',       tooltip: 'Critically analyze claims & methodology',       Icon: AnalyzeIcon },
  { key: 'verify',         label: 'Verify',        tooltip: 'Verify claims against the entire document',     Icon: VerifyIcon },
  { key: 'compare',        label: 'Compare',       tooltip: 'Compare with other sections in the document',   Icon: CompareIcon },
  { key: 'find_evidence',  label: 'Evidence',      tooltip: 'Find supporting & contradicting citations',     Icon: EvidenceIcon },
  { key: 'summarize',      label: 'Summarize',     tooltip: 'Generate a concise summary of the selection',   Icon: SummarizeIcon },
  { key: 'translate',      label: 'Translate',     tooltip: 'Translate selection into Hindi',                Icon: TranslateIcon },
  { key: 'create_notes',   label: 'Notes',         tooltip: 'Create high-yield study notes',                 Icon: NotesIcon },
];

interface LensToolbarProps {
  onAction: (action: LensAction, askQuestion?: string) => void;
}

export const LensToolbar: React.FC<LensToolbarProps> = ({ onAction }) => {
  const { selection, isToolbarVisible, hideToolbar, clearLens, isLensStreaming } = useLensStore();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [showAskInput, setShowAskInput] = useState(false);
  const [askText, setAskText] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: -999, left: -999 });

  // Compute fixed viewport coordinates so it never shifts incorrectly
  useEffect(() => {
    if (!selection || !isToolbarVisible) return;

    const selRect = selection.rect;
    const padding = 16;
    const toolbarWidth = toolbarRef.current?.offsetWidth || 490;
    const toolbarHeight = toolbarRef.current?.offsetHeight || 44;

    // Anchor horizontally centered on selection
    let left = selRect.left + selRect.width / 2 - toolbarWidth / 2;
    // Strict viewport boundary clamping
    const maxLeft = Math.max(padding, window.innerWidth - toolbarWidth - padding);
    left = Math.max(padding, Math.min(left, maxLeft));

    // Anchor vertically above selection with safety fallback
    let top = selRect.top - toolbarHeight - 12;
    if (top < padding) {
      // Flip below selection if too close to top of viewport
      top = selRect.top + selRect.height + 12;
    }

    setPosition({ top, left });
  }, [selection, isToolbarVisible, showAskInput]);

  // Dismiss on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) {
            clearLens();
          }
        }, 120);
      }
    };
    if (isToolbarVisible) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isToolbarVisible, clearLens]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isToolbarVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAskInput(false);
        clearLens();
      } else if (e.key === 'ArrowRight' && !showAskInput) {
        e.preventDefault();
        setFocusIndex((prev) => (prev + 1) % LENS_ACTIONS.length);
      } else if (e.key === 'ArrowLeft' && !showAskInput) {
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 + LENS_ACTIONS.length) % LENS_ACTIONS.length);
      } else if (e.key === 'Enter' && !e.ctrlKey && focusIndex >= 0 && !showAskInput) {
        e.preventDefault();
        handleActionClick(LENS_ACTIONS[focusIndex].key);
      } else if (e.key === 'Enter' && e.ctrlKey && !showAskInput) {
        e.preventDefault();
        handleActionClick('ask');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isToolbarVisible, focusIndex, showAskInput, clearLens]);

  const handleActionClick = useCallback((action: LensAction) => {
    if (action === 'ask') {
      setShowAskInput(true);
      return;
    }
    onAction(action);
    hideToolbar();
  }, [onAction, hideToolbar]);

  const handleAskSubmit = useCallback(() => {
    onAction('ask', askText.trim() || undefined);
    setShowAskInput(false);
    setAskText('');
    hideToolbar();
  }, [onAction, askText, hideToolbar]);

  if (!selection || !isToolbarVisible || isLensStreaming) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-150 select-none"
      style={{ top: Math.max(8, position.top), left: Math.max(8, position.left) }}
    >
      {/* Main Action Bar Container */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-[#FAF6EB] backdrop-blur-xl rounded-full border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] max-w-[calc(100vw-32px)] overflow-x-auto no-scrollbar">
          {/* Lens badge with SVG icon */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-lime rounded-full border border-ink text-[10px] font-black text-ink shrink-0 shadow-xs">
            <LensIcon className="w-3.5 h-3.5 text-ink" />
            <span>LENS</span>
            <span className="opacity-70 font-mono text-[9px]">p.{selection.page}</span>
          </div>

          <div className="w-px h-5 bg-ink/20 shrink-0 mx-0.5" />

          {/* Action Pills */}
          <div className="flex items-center gap-1 shrink-0">
            {LENS_ACTIONS.map((action, i) => (
              <button
                key={action.key}
                type="button"
                onClick={() => handleActionClick(action.key)}
                title={action.tooltip}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-ink shrink-0
                  transition-all duration-150 whitespace-nowrap
                  ${focusIndex === i
                    ? 'bg-lime border border-ink shadow-xs -translate-y-0.5'
                    : 'hover:bg-lime/70 hover:border-ink/50 border border-transparent active:scale-95'
                  }
                `}
              >
                <action.Icon />
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={clearLens}
            title="Dismiss Lens (Esc)"
            className="w-6 h-6 rounded-full hover:bg-blush border border-transparent hover:border-ink text-[10px] font-black text-ink/70 flex items-center justify-center shrink-0 transition-colors ml-0.5"
          >
            ✕
          </button>
        </div>

        {/* Ask follow-up input (shown when Ask is clicked) */}
        {showAskInput && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white backdrop-blur-xl rounded-2xl border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] animate-in fade-in slide-in-from-top-1 duration-150">
            <input
              autoFocus
              type="text"
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAskSubmit();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowAskInput(false);
                }
              }}
              placeholder={`Ask about this selection on Page ${selection.page}...`}
              className="flex-1 text-xs font-bold text-ink bg-transparent outline-none placeholder:text-ink/40 min-w-[240px]"
            />
            <button
              type="button"
              onClick={handleAskSubmit}
              className="px-3 py-1 rounded-full bg-lime text-ink border border-ink text-[11px] font-black shadow-xs hover:bg-lime-400 transition-colors"
            >
              Ask
            </button>
            <button
              type="button"
              onClick={() => setShowAskInput(false)}
              className="w-5 h-5 rounded-full bg-cream border border-ink text-[10px] font-black flex items-center justify-center hover:bg-blush transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
