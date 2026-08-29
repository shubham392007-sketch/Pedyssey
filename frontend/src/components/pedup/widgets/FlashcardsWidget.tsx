import React, { useState } from 'react';
import type { Flashcard } from '../../../types';

interface FlashcardsWidgetProps {
  cards: Flashcard[];
  onCitationClick?: (page: number) => void;
}

export const FlashcardsWidget: React.FC<FlashcardsWidgetProps> = ({ cards, onCitationClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [knownMap, setKnownMap] = useState<{ [index: number]: boolean }>({});

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex] || cards[0];
  const isKnown = !!knownMap[currentIndex];
  const totalKnown = Object.values(knownMap).filter(Boolean).length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleKnownIndex = (idx: number) => {
    setKnownMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="my-4 p-4 sm:p-5 rounded-[24px] bg-[#FFFBF0] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] space-y-4">
      {/* Header bar with Mode Switcher & Mastery Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-ink/15">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-lime border-1.5 border-ink flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-ink">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-ink block">
              Interactive Flashcards
            </span>
            <span className="text-[10px] font-bold text-ink/60">
              {cards.length} Key Concept{cards.length > 1 ? 's' : ''} Derived from Document
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-white/80 p-0.5 rounded-full border border-ink/40 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                viewMode === 'carousel'
                  ? 'bg-lime text-ink border border-ink shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              Flip Deck
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                viewMode === 'grid'
                  ? 'bg-lime text-ink border border-ink shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              View All ({cards.length})
            </button>
          </div>

          <div className="hidden sm:block text-[10px] font-black uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-ink text-ink">
            Mastered: <span className="text-ink font-extrabold">{totalKnown}/{cards.length}</span>
          </div>
        </div>
      </div>

      {/* CAROUSEL / FLIP VIEW */}
      {viewMode === 'carousel' && (
        <div className="space-y-3.5">
          {/* Quick Jump Number Pills */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center py-1">
            {cards.map((_, idx) => {
              const isSelected = idx === currentIndex;
              const cardKnown = !!knownMap[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex(idx);
                  }}
                  className={`w-7 h-7 rounded-lg border font-mono text-xs font-black transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-lime border-ink text-ink shadow-[2px_2px_0px_#1C1C1C] -translate-y-0.5'
                      : cardKnown
                      ? 'bg-[#E7F6D4] border-ink/50 text-ink/80'
                      : 'bg-white hover:bg-cream border-ink/40 text-ink/70'
                  }`}
                  title={`Card ${idx + 1}: ${cards[idx].topic || cards[idx].front}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Flashcard Body */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[220px] p-6 sm:p-7 rounded-[20px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] cursor-pointer transition-all duration-200 flex flex-col justify-between group select-none ${
              isFlipped
                ? 'bg-[#F9FCF2] hover:bg-[#F4FAEB]'
                : 'bg-white hover:bg-cream/40'
            }`}
          >
            {/* Card Top Sub-Header */}
            <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold uppercase tracking-wider text-ink/60 pb-2 border-b border-ink/10">
              <span className="bg-cream px-2 py-0.5 rounded border border-ink/30 text-ink truncate max-w-[200px]">
                {currentCard.topic || `Topic ${currentIndex + 1}`}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-ink font-bold group-hover:underline">
                <span>{isFlipped ? 'Answer Side' : 'Question Side'}</span>
                <span className="text-xs">↻ Click to Flip</span>
              </span>
            </div>

            {/* Main Content Area */}
            <div className="py-4 my-auto">
              {!isFlipped ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/50 block">
                    Question / Term:
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-ink leading-relaxed whitespace-pre-line">
                    {currentCard.front}
                  </h3>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-[10px] font-black uppercase tracking-wider text-utility-success font-mono block">
                    ✓ Verified Document Answer:
                  </span>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-ink leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-ink/30 shadow-xs">
                    {currentCard.back}
                  </p>
                  {currentCard.page && onCitationClick && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCitationClick(currentCard.page!);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-lime hover:bg-lime/80 border border-ink text-ink shadow-[1px_1px_0px_#1C1C1C] transition-all"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>Jump to Page {currentCard.page}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="flex items-center justify-between text-[10px] text-ink/60 font-semibold pt-2 border-t border-ink/10">
              <span className="italic">
                {isFlipped ? 'Click card to see question' : 'Click card or button below to reveal answer'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  isKnown
                    ? 'bg-lime border-ink text-ink'
                    : 'bg-cream border-ink/30 text-ink/60'
                }`}
              >
                {isKnown ? 'Mastered' : 'Needs Review'}
              </span>
            </div>
          </div>

          {/* Bottom Card Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={cards.length <= 1}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-cream border-1.5 border-ink text-xs font-black text-ink shadow-[1.5px_1.5px_0px_#1C1C1C] active:translate-y-0.5 transition-all flex items-center gap-1 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-3.5 py-1.5 rounded-full bg-cream hover:bg-lime border-1.5 border-ink text-xs font-black text-ink shadow-[1.5px_1.5px_0px_#1C1C1C] active:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>{isFlipped ? 'Show Question' : 'Flip to Answer'}</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={cards.length <= 1}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-cream border-1.5 border-ink text-xs font-black text-ink shadow-[1.5px_1.5px_0px_#1C1C1C] active:translate-y-0.5 transition-all flex items-center gap-1 disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleKnownIndex(currentIndex)}
              className={`px-3.5 py-1.5 rounded-full border-1.5 border-ink text-xs font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#1C1C1C] transition-all flex items-center gap-1.5 ${
                isKnown
                  ? 'bg-lime text-ink'
                  : 'bg-white hover:bg-lime/50 text-ink'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{isKnown ? 'Marked Known' : 'Mark as Known'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW ALL / GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {cards.map((c, idx) => {
              const cardKnown = !!knownMap[idx];
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-[18px] border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] flex flex-col justify-between gap-2.5 transition-all ${
                    cardKnown ? 'bg-[#F7FCF0]' : 'bg-white'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-1 text-[10px] font-black uppercase tracking-wider pb-1.5 border-b border-ink/10">
                    <span className="bg-cream px-2 py-0.5 rounded border border-ink/30 text-ink">
                      #{idx + 1} {c.topic || 'Concept'}
                    </span>
                    {c.page && onCitationClick && (
                      <button
                        type="button"
                        onClick={() => onCitationClick(c.page!)}
                        className="px-2 py-0.5 rounded bg-lime/60 hover:bg-lime border border-ink text-ink font-bold text-[9px]"
                      >
                        Page {c.page}
                      </button>
                    )}
                  </div>

                  {/* Question */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-ink/50 tracking-wider">
                      Question
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-ink leading-snug">
                      {c.front}
                    </h4>
                  </div>

                  {/* Answer */}
                  <div className="space-y-1 bg-[#FAF6EB]/70 p-2.5 rounded-xl border border-ink/20">
                    <span className="text-[9px] font-black uppercase text-utility-success tracking-wider block">
                      Answer
                    </span>
                    <p className="text-xs font-semibold text-ink leading-relaxed">
                      {c.back}
                    </p>
                  </div>

                  {/* Footer Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => toggleKnownIndex(idx)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border border-ink transition-colors flex items-center gap-1 ${
                        cardKnown
                          ? 'bg-lime text-ink'
                          : 'bg-white hover:bg-cream text-ink/70'
                      }`}
                    >
                      <span>{cardKnown ? '✓ Mastered' : '○ Mark as Known'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
