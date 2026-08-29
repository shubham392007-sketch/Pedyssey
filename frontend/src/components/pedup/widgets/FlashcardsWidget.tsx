import React, { useState } from 'react';
import type { Flashcard } from '../../../types';

interface FlashcardsWidgetProps {
  cards: Flashcard[];
  onCitationClick?: (page: number) => void;
}

export const FlashcardsWidget: React.FC<FlashcardsWidgetProps> = ({ cards, onCitationClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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

  const toggleKnown = () => {
    setKnownMap((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  return (
    <div className="my-4 p-4 md:p-5 rounded-[20px] bg-[#FFFBF0] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-lime border-1.5 border-ink flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-ink">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-ink">
            Interactive Flashcards
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream border border-ink/40 text-ink/70">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        <div className="text-[10px] font-black uppercase tracking-wider text-ink/70">
          Mastered: <span className="text-ink font-bold">{totalKnown}/{cards.length}</span>
        </div>
      </div>

      {/* Interactive Card Canvas with Flip Animation */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[160px] p-6 rounded-[16px] bg-white border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] cursor-pointer hover:border-ink transition-all duration-200 flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between text-[10px] font-bold text-ink/50 uppercase tracking-wider">
          <span>{currentCard.topic || 'Core Concept'}</span>
          <span className="group-hover:text-ink transition-colors">
            {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
          </span>
        </div>

        <div className="my-auto py-2">
          {!isFlipped ? (
            <h4 className="text-base md:text-lg font-extrabold text-ink leading-snug">
              {currentCard.front}
            </h4>
          ) : (
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium text-ink/90 leading-relaxed">
                {currentCard.back}
              </p>
              {currentCard.page && onCitationClick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCitationClick(currentCard.page!);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-lime/60 hover:bg-lime border border-ink text-ink transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Page {currentCard.page}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-ink/60 font-semibold pt-2 border-t border-ink/10">
          <span>Click anywhere on card to {isFlipped ? 'see question' : 'reveal answer'}</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isKnown ? 'bg-lime text-ink' : 'bg-cream text-ink/60'}`}>
            {isKnown ? 'Mastered' : 'To Review'}
          </span>
        </div>
      </div>

      {/* Card Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={cards.length <= 1}
            className="px-3 py-1.5 rounded-full bg-cream hover:bg-white border-1.5 border-ink text-xs font-bold text-ink shadow-[1.5px_1.5px_0px_#1C1C1C] active:translate-y-0.5 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={cards.length <= 1}
            className="px-3 py-1.5 rounded-full bg-cream hover:bg-white border-1.5 border-ink text-xs font-bold text-ink shadow-[1.5px_1.5px_0px_#1C1C1C] active:translate-y-0.5 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        <button
          type="button"
          onClick={toggleKnown}
          className={`px-3.5 py-1.5 rounded-full border-1.5 border-ink text-xs font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#1C1C1C] transition-all flex items-center gap-1.5 ${
            isKnown ? 'bg-lime text-ink' : 'bg-[#FAF6EB] hover:bg-lime/50 text-ink'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {isKnown ? 'Marked Known' : 'Mark as Known'}
        </button>
      </div>
    </div>
  );
};
