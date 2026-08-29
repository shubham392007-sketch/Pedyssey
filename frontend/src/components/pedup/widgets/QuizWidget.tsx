import React, { useState } from 'react';
import type { QuizQuestion } from '../../../types';

interface QuizWidgetProps {
  questions: QuizQuestion[];
  onCitationClick?: (page: number) => void;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({ questions, onCitationClick }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) return null;

  const handleSelect = (qId: number, optionIdx: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = answeredCount === questions.length;

  const correctCount = questions.reduce((acc, q, idx) => {
    const userAns = selectedAnswers[q.id ?? idx];
    return userAns === q.correct_index ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((correctCount / questions.length) * 100);

  // Identify weak topics
  const weakTopics = questions
    .filter((q, idx) => selectedAnswers[q.id ?? idx] !== q.correct_index)
    .map((q) => q.topic)
    .filter((t): t is string => Boolean(t));

  const uniqueWeakTopics = Array.from(new Set(weakTopics));

  return (
    <div className="my-4 p-4 md:p-5 rounded-[20px] bg-[#FFFBF0] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-ink/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-lime border-1.5 border-ink flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-ink">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-ink">
            Document Knowledge Quiz
          </span>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cream border border-ink/40 text-ink/70">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const qKey = q.id ?? idx;
          const userChoice = selectedAnswers[qKey];
          const isAnswered = userChoice !== undefined;
          const isCorrect = isAnswered && userChoice === q.correct_index;

          return (
            <div
              key={qKey}
              className="p-4 rounded-[16px] bg-white border-2 border-ink shadow-[1.5px_1.5px_0px_#1C1C1C] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-black text-ink uppercase tracking-wide">
                  Question {idx + 1}
                </span>
                {q.page && onCitationClick && (
                  <button
                    type="button"
                    onClick={() => onCitationClick(q.page!)}
                    className="text-[9px] font-black px-2 py-0.5 rounded bg-cream hover:bg-lime border border-ink text-ink transition-colors flex items-center gap-1"
                  >
                    Page {q.page}
                  </button>
                )}
              </div>

              <h4 className="text-sm font-bold text-ink leading-snug">
                {q.question}
              </h4>

              {/* 4 Multiple Choice Options */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  let btnStyle = "bg-[#FAF6EB] hover:bg-white text-ink border-ink/40";
                  if (userChoice === optIdx) {
                    btnStyle = "bg-[#F7D4BE] text-ink border-ink font-extrabold shadow-[1px_1px_0px_#1C1C1C]";
                  }

                  if (showResults) {
                    if (optIdx === q.correct_index) {
                      btnStyle = "bg-lime text-ink border-ink font-extrabold shadow-[1.5px_1.5px_0px_#1C1C1C]";
                    } else if (userChoice === optIdx) {
                      btnStyle = "bg-[#FFCDD2] text-ink border-ink font-bold";
                    } else {
                      btnStyle = "bg-[#FAF6EB]/60 text-ink/40 border-ink/20";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={showResults}
                      onClick={() => handleSelect(qKey, optIdx)}
                      className={`text-left px-3.5 py-2.5 rounded-[12px] border-1.5 text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-ink/60 bg-white/80 shrink-0 flex items-center justify-center text-[10px] font-black text-ink">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Result (when revealed) */}
              {showResults && (
                <div className={`p-3 rounded-[10px] text-xs space-y-1 border ${
                  isCorrect ? 'bg-lime/20 border-lime/60 text-ink' : 'bg-[#FFEBEE] border-[#FFCDD2] text-ink'
                }`}>
                  <div className="font-black flex items-center gap-1.5">
                    {isCorrect ? (
                      <span className="text-[#336600]">✓ Correct!</span>
                    ) : (
                      <span className="text-[#B71C1C]">✗ Incorrect (Correct: Option {String.fromCharCode(65 + q.correct_index)})</span>
                    )}
                  </div>
                  {q.explanation && (
                    <p className="text-[11px] font-medium text-ink/80 leading-relaxed">
                      {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Submission & Score Summary */}
      {!showResults ? (
        <button
          type="button"
          onClick={() => setShowResults(true)}
          disabled={!isComplete}
          className="w-full py-3 rounded-full bg-lime hover:bg-[#85b02a] disabled:bg-cream disabled:opacity-60 border-2 border-ink text-xs font-black uppercase tracking-wider text-ink shadow-[2px_2px_0px_#1C1C1C] transition-all"
        >
          {isComplete ? 'Submit & Review Score' : `Answer All ${questions.length} Questions to Submit`}
        </button>
      ) : (
        <div className="p-4 rounded-[16px] bg-white border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              Quiz Score Results
            </span>
            <span className="text-base font-black px-3 py-1 rounded-full bg-lime border-1.5 border-ink text-ink shadow-[1px_1px_0px_#1C1C1C]">
              {correctCount}/{questions.length} ({percentage}%)
            </span>
          </div>

          {uniqueWeakTopics.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-ink/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-ink/70">
                Recommended Focus Areas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {uniqueWeakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-0.5 rounded-full bg-[#FAF6EB] border border-ink/40 text-[10px] font-bold text-ink"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedAnswers({});
              setShowResults(false);
            }}
            className="w-full py-2 rounded-full bg-cream hover:bg-white border-1.5 border-ink text-xs font-bold text-ink transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};
