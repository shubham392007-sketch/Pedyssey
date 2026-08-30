import React from 'react';
import { useLensStore } from '../../stores/useLensStore';

export const LensContextBadge: React.FC = () => {
  const { selection, clearLens } = useLensStore();

  if (!selection) return null;

  const preview = selection.text.length > 60
    ? selection.text.slice(0, 60) + '...'
    : selection.text;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 mb-1.5 bg-lime/20 border border-lime/50 rounded-xl animate-in fade-in slide-in-from-bottom-1 duration-200">
      {/* Lens indicator */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-2 h-2 rounded-full bg-lime border border-ink/40" />
        <span className="text-[10px] font-black text-ink uppercase tracking-wider">Lens</span>
      </div>

      <div className="w-px h-4 bg-ink/15 shrink-0" />

      {/* Page badge */}
      <span className="text-[10px] font-mono font-bold text-ink/60 shrink-0">
        p.{selection.page}
      </span>

      {/* Selection preview */}
      <p className="text-[11px] text-ink/70 font-medium truncate min-w-0 flex-1 italic">
        "{preview}"
      </p>

      {/* Dismiss button */}
      <button
        onClick={clearLens}
        className="w-5 h-5 rounded-full bg-cream hover:bg-blush border border-ink/30 text-[10px] font-black text-ink/60 flex items-center justify-center shrink-0 transition-colors"
        title="Clear Lens selection"
      >
        ✕
      </button>
    </div>
  );
};
