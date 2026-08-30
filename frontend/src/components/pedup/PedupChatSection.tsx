import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '../../stores/useChatStore';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useAskQuestion } from '../../hooks/useChat';
import { AiSparkIcon, CitationIcon } from '../common/SvgIcons';
import { PedupModeSelector } from './PedupModeSelector';
import { FlashcardsWidget } from './widgets/FlashcardsWidget';
import { QuizWidget } from './widgets/QuizWidget';
import { VerificationWidget } from './widgets/VerificationWidget';
import type { Citation, ResponseMode, ActionMode, ExplainLevel } from '../../types';

interface PedupChatSectionProps {
  onCitationClick: (citation: Citation) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const PedupChatSection: React.FC<PedupChatSectionProps> = ({
  onCitationClick,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const { messages, isStreaming, streamingContent, clearMessages } = useChatStore();
  const { documents, selectedDocIds, activeDocId } = useDocumentStore();
  const { ask, isLoading } = useAskQuestion();

  const [inputVal, setInputVal] = useState('');
  const [selectedMode, setSelectedMode] = useState<ResponseMode>('quick');
  const [selectedAction, setSelectedAction] = useState<ActionMode | undefined>(undefined);
  const [explainLevel, setExplainLevel] = useState<ExplainLevel>('technical');
  const [expandedEvidence, setExpandedEvidence] = useState<{ [msgId: string]: boolean }>({});
  const [expandedDetails, setExpandedDetails] = useState<{ [msgId: string]: boolean }>({});
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic thinking stage text tailored to the selected mode
  const getThinkingStages = (mode: ResponseMode, action?: ActionMode) => {
    if (action === 'flashcards') {
      return [
        'Scanning document for high-yield concepts...',
        'Extracting precise definitions & principles...',
        'Formatting interactive flashcards with page references...',
      ];
    }
    if (action === 'quiz') {
      return [
        'Formulating challenging multiple-choice questions...',
        'Validating answer keys against factual passages...',
        'Structuring interactive quiz checkpoints...',
      ];
    }
    if (mode === 'deep_research') {
      return [
        'Understanding question & decomposing facets...',
        'Searching document (Multi-pass retrieval across all pages)...',
        'Analyzing evidence & grouping sections...',
        'Cross-checking sections & experimental setup...',
        'Generating comprehensive research report...',
        'Checking completeness & verifying citations...',
      ];
    }
    if (mode === 'think') {
      return [
        'Thinking through the document...',
        'Expanding query & searching vector space across sections...',
        'Cross-referencing evidence & evaluating multi-step logic...',
        'Formulating reasoned synthesis with page citations...',
      ];
    }
    if (mode === 'quick') {
      return [
        'Retrieving from your document...',
        'Searching FAISS & BM25 indices across pages...',
        'Cross-Encoder neural reranking top candidate passages...',
        'Synthesizing direct grounded answer...',
      ];
    }
    if (mode === 'study') {
      return [
        'Extracting core pedagogical principles & definitions...',
        'Structuring clear revision notes & learning checkpoints...',
        'Building grounded study synthesis...',
      ];
    }
    if (mode === 'research') {
      return [
        'Auditing academic problem, methodology & dataset baselines...',
        'Analyzing experimental metrics & validation quality...',
        'Cataloging limitations, future work & citations...',
      ];
    }
    if (mode === 'explain') {
      return [
        'Extracting fundamental mechanism...',
        `Calibrating explanation depth for ${explainLevel} level...`,
        'Synthesizing intuitive pedagogical answer...',
      ];
    }
    if (mode === 'compare') {
      return [
        'Retrieving comparative evidence across documents & sections...',
        'Aligning metrics, methodologies, and performance trade-offs...',
        'Structuring comparative analysis matrix...',
      ];
    }
    if (mode === 'analyze') {
      return [
        'Extracting author assertions, assumptions & methodologies...',
        'Auditing evidentiary validity & baseline appropriateness...',
        'Synthesizing critical evaluation breakdown...',
      ];
    }
    if (mode === 'verify') {
      return [
        'Isolating target factual claim...',
        'Searching complete document for corroborating & contradicting evidence...',
        'Determining verification verdict: SUPPORTED / CONTRADICTED...',
      ];
    }
    return [
      'Searching FAISS vector space for dense semantic matches...',
      'Running BM25 lexical keyword scoring & filtering...',
      'Cross-Encoder neural reranker scoring top candidate passages...',
      'Synthesizing grounded response with local Qwen3 8B...',
    ];
  };

  const thinkingStages = getThinkingStages(selectedMode, selectedAction);

  useEffect(() => {
    if (!isLoading) {
      setThinkingIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % thinkingStages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading, thinkingStages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isLoading]);

  const samplePrompts = [
    { label: "Summarize", scriptWord: "overview", full: "Summarize this document in a key concepts table" },
    { label: "What is the main", scriptWord: "idea?", full: "What is the main idea of this document?" },
    { label: "Explain the", scriptWord: "methodology", full: "Explain the methodology in detail" },
    { label: "Find key", scriptWord: "findings", full: "Find the key findings and experimental results" },
    { label: "Verify", scriptWord: "claims", full: "Verify the main performance claims against the experimental data" },
    { label: "List all", scriptWord: "references", full: "List all references [1] to [8] and cited author names from the paper" },
  ];

  const handleSend = (text?: string, actionOverride?: ActionMode, modeOverride?: ResponseMode) => {
    const q = (text || inputVal).trim();
    if (!q || isLoading || isStreaming) return;

    let targetDocIds: string[] = [];
    if (selectedDocIds.size > 0) {
      targetDocIds = Array.from(selectedDocIds);
    } else if (activeDocId) {
      targetDocIds = [activeDocId];
    } else if (documents.length > 0) {
      targetDocIds = documents.map((d) => d.id);
    }

    if (targetDocIds.length === 0) {
      alert('Please upload a PDF document first.');
      return;
    }

    const currentMode = modeOverride || selectedMode;
    const currentAction = actionOverride || selectedAction;

    ask(
      q,
      targetDocIds,
      currentMode,
      currentAction,
      explainLevel,
      'hindi',
      { count: 5, difficulty: 'medium' }
    );
    setInputVal('');
  };

  const handleQuickAction = (action: ActionMode, promptText: string) => {
    setSelectedAction(action);
    handleSend(promptText, action);
  };

  const handleCitationPageNavigate = (pageNum: number) => {
    const docId = activeDocId || (documents.length > 0 ? documents[0].id : '');
    onCitationClick({
      document_id: docId,
      filename: 'document.pdf',
      page_start: pageNum,
      page_end: pageNum,
      chunk_id: 'page_' + pageNum,
    });
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Custom Markdown table components for clean GFM rendering
  const markdownComponents = {
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-3 rounded-[12px] border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] bg-white">
        <table className="w-full text-left text-xs border-collapse divide-y divide-ink" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-[#FAF6EB] text-ink font-black uppercase text-[10px] tracking-wider border-b-2 border-ink" {...props} />
    ),
    tbody: ({ node, ...props }: any) => (
      <tbody className="divide-y divide-ink/20 text-xs font-medium" {...props} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr className="hover:bg-cream/40 transition-colors" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="px-3.5 py-2.5 font-black text-ink border-r border-ink/30 last:border-r-0" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="px-3.5 py-2 text-ink border-r border-ink/20 last:border-r-0 align-top" {...props} />
    ),
    code: ({ node, inline, className, children, ...props }: any) => (
      inline ? (
        <code className="px-1.5 py-0.5 rounded bg-cream border border-ink/30 font-mono text-[11px] text-ink font-semibold" {...props}>
          {children}
        </code>
      ) : (
        <pre className="p-3 my-2 rounded-[10px] bg-[#1C1C1C] text-[#FBF1CF] font-mono text-xs overflow-x-auto border border-ink">
          <code {...props}>{children}</code>
        </pre>
      )
    ),
  };

  return (
    <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-md rounded-[28px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-5 border-b-2 border-ink flex items-center justify-between bg-white/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title={isSidebarOpen ? "Hide Documents Sidebar (View Chat in Full Width)" : "Show Documents Sidebar"}
              className={`p-1.5 px-2.5 rounded-xl border border-ink text-ink text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#1C1C1C] ${
                !isSidebarOpen ? 'bg-lime text-ink animate-pulse' : 'bg-cream hover:bg-lime/70 text-ink'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span>{isSidebarOpen ? 'Hide Vault' : 'Open Vault'}</span>
            </button>
          )}

          <div className="w-7 h-7 rounded-xl bg-lime border-1.5 border-ink flex items-center justify-center font-black text-xs text-ink shadow-[1.5px_1.5px_0px_#1C1C1C]">
            P
          </div>
          <span className="font-extrabold text-sm tracking-tight text-ink uppercase">
            CHAT &amp; <span className="font-script lowercase text-lg font-normal text-ink">insights</span>
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-lime/80 border border-ink text-ink">
            {selectedDocIds.size > 0
              ? `Searching ${selectedDocIds.size} document${selectedDocIds.size > 1 ? 's' : ''}`
              : activeDocId
              ? 'Searching active document'
              : 'Searching 1 document'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-[11px] font-black text-ink/70 hover:text-ink uppercase tracking-wider transition-colors px-2 py-1"
            >
              CLEAR CHAT
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
        {messages.length === 0 && (
          <div className="space-y-5 max-w-2xl">
            {/* Welcome Greeting Card */}
            <div className="bg-white/85 backdrop-blur-md rounded-[24px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] p-6 md:p-7 text-ink space-y-4 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime border-1.5 border-ink flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#1C1C1C]">
                  <AiSparkIcon className="w-4 h-4 text-ink" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-ink/70">
                  LOCAL DOCUMENT INTELLIGENCE ENGINE · READY
                </span>
              </div>

              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-ink leading-tight">
                We believe documents should be{' '}
                <span className="font-script text-[1.3em] font-normal text-ink leading-none inline-block -rotate-1">
                  conversational.
                </span>
              </h1>

              <p className="text-xs md:text-sm font-medium text-ink/80 leading-relaxed">
                Choose any mode (Quick, Think, Deep Research, Study, Research, Explain, Compare, Analyze, Verify) to investigate evidence across pages.
              </p>

              {/* Suggested Prompts */}
              <div className="pt-2 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-ink/60">
                  Suggested prompts to start <span className="font-script lowercase text-sm font-normal text-ink">exploring:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((prompt) => (
                    <button
                      key={prompt.full}
                      onClick={() => handleSend(prompt.full)}
                      className="px-3.5 py-1.5 rounded-full bg-cream/90 hover:bg-lime backdrop-blur-sm border-1.5 border-ink text-xs font-bold text-ink transition-all duration-150 shadow-[1.5px_1.5px_0px_#1C1C1C] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1"
                    >
                      <span>{prompt.label}</span>
                      <span className="font-script text-sm font-normal text-ink">{prompt.scriptWord}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render History Messages */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isEvidenceOpen = expandedEvidence[msg.id] || false;
          const isDetailsOpen = expandedDetails[msg.id] || false;

          if (isUser) {
            return (
              <div key={msg.id} className="flex items-center justify-end gap-3 max-w-2xl ml-auto">
                <div className="bg-[#F7D4BE]/85 backdrop-blur-md rounded-[20px] border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] px-4 py-3 text-xs md:text-sm font-bold text-ink leading-relaxed">
                  {msg.content}
                </div>
                <div className="w-8 h-8 rounded-full bg-white border-2 border-ink flex items-center justify-center font-black text-xs text-ink shrink-0 shadow-[1.5px_1.5px_0px_#1C1C1C]">
                  U
                </div>
              </div>
            );
          }

          // Format timing badge label
          const duration = msg.duration_seconds ? `${msg.duration_seconds}s` : null;
          let timingLabel = null;
          if (msg.mode === 'deep_research') {
            timingLabel = duration ? `Research completed in ${duration}` : 'Deep Research';
          } else if (msg.mode === 'think') {
            timingLabel = duration ? `Thought for ${duration}` : 'Reasoned Synthesis';
          } else if (msg.mode === 'verify') {
            timingLabel = duration ? `Verified in ${duration}` : 'Verified';
          } else if (duration) {
            timingLabel = `Answered in ${duration}`;
          }

          const hasFlashcards = msg.structured_data?.type === 'flashcards' && msg.structured_data.items;
          const hasQuiz = msg.structured_data?.type === 'quiz' && msg.structured_data.questions;
          const hasVerification = msg.structured_data?.type === 'verification' && msg.structured_data.verdict;

          return (
            <div key={msg.id} className="flex items-start gap-3.5 max-w-2xl">
              <div className="w-9 h-9 rounded-xl bg-lime border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1C1C1C]">
                <AiSparkIcon className="w-4 h-4 text-ink" />
              </div>

              <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md rounded-[22px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-5 text-ink space-y-3.5 transition-all flex-1">
                {/* Header Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-ink/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink/70">
                      Grounded Synthesis
                    </span>
                    {msg.mode && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cream border border-ink/40 text-ink/80 uppercase">
                        {msg.mode.replace('_', ' ')}
                      </span>
                    )}
                    {timingLabel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream border border-ink/40 text-ink/80">
                        {timingLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {msg.evidence_quality && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-ink uppercase ${
                          msg.evidence_quality === 'STRONG EVIDENCE'
                            ? 'bg-lime text-ink'
                            : msg.evidence_quality === 'MODERATE EVIDENCE'
                            ? 'bg-[#FAD7BC] text-ink'
                            : 'bg-cream text-ink/80'
                        }`}
                      >
                        {msg.evidence_quality}
                      </span>
                    )}

                    {msg.confidence_level && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-ink ${
                          msg.confidence_level === 'High Confidence'
                            ? 'bg-lime text-ink'
                            : 'bg-[#FAD7BC] text-ink'
                        }`}
                      >
                        {msg.confidence_level}
                      </span>
                    )}
                  </div>
                </div>

                {/* Structured Verification Badge (if in Verify mode) */}
                {hasVerification && (
                  <VerificationWidget verdict={msg.structured_data!.verdict!} />
                )}

                {/* Interactive Flashcards Widget (if present) */}
                {hasFlashcards && (
                  <FlashcardsWidget
                    cards={msg.structured_data!.items!}
                    onCitationClick={handleCitationPageNavigate}
                  />
                )}

                {/* Interactive Quiz Widget (if present) */}
                {hasQuiz && (
                  <QuizWidget
                    questions={msg.structured_data!.questions!}
                    onCitationClick={handleCitationPageNavigate}
                  />
                )}

                {/* Markdown Content (cleaned of raw JSON if widget is rendered) */}
                {(() => {
                  const cleanedText = (hasFlashcards || hasQuiz)
                    ? msg.content.replace(/```(?:json)?\s*[\s\S]*?```/gi, '').trim()
                    : msg.content;
                  if (!cleanedText) return null;
                  return (
                    <div className="prose prose-sm max-w-none text-ink font-medium leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {cleanedText}
                      </ReactMarkdown>
                    </div>
                  );
                })()}

                {/* Clickable Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-ink/10 space-y-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink/70 flex items-center gap-1.5">
                      <CitationIcon className="w-3.5 h-3.5" />
                      <span>Verified Page <span className="font-script lowercase text-xs font-normal text-ink">sources:</span></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onCitationClick(c)}
                          className="px-3 py-1 rounded-full bg-cream hover:bg-lime border-1.5 border-ink text-[11px] font-bold text-ink transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <span>
                            {c.filename.replace('.pdf', '')} · p.{c.page_start === c.page_end ? c.page_start : `${c.page_start}–${c.page_end}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsible Evidence Passages Drawer (Requirement #26) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleEvidence(msg.id)}
                        className="text-[11px] font-black text-ink/80 hover:text-ink flex items-center gap-1 transition-colors"
                      >
                        <span className="text-xs">{isEvidenceOpen ? '▴' : '▾'}</span>
                        <span>{isEvidenceOpen ? 'Hide Grounded Evidence' : 'Show Grounded Evidence'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDetails(msg.id)}
                        className="text-[10px] font-bold text-ink/50 hover:text-ink underline"
                      >
                        {isDetailsOpen ? 'Hide pipeline log' : 'Verification log'}
                      </button>
                    </div>

                    {isEvidenceOpen && (
                      <div className="p-3.5 rounded-[16px] bg-[#FAF6EB] border border-ink/30 space-y-2.5 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-ink/70 block">
                          Retrieved Document Passages:
                        </span>
                        {msg.citations.map((c, idx) => (
                          <div key={idx} className="p-2.5 rounded-[10px] bg-white border border-ink/20 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-black text-ink">
                              <span>Evidence {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => onCitationClick(c)}
                                className="px-2 py-0.5 rounded bg-lime/60 hover:bg-lime border border-ink/60"
                              >
                                Open Page {c.page_start}
                              </button>
                            </div>
                            {c.text_preview && (
                              <p className="text-[11px] font-medium text-ink/80 italic leading-relaxed">
                                "{c.text_preview}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isDetailsOpen && (
                      <div className="p-3 rounded-xl bg-card-cream border border-ink/20 text-[11px] space-y-1 font-mono">
                        <div className="text-utility-success font-bold font-sans">
                          ✓ Hybrid FAISS + BM25 Candidate Search
                        </div>
                        <div className="text-utility-success font-bold font-sans">✓ Cross-Encoder Neural Reranking</div>
                        <div className="text-ink/60 text-[10px] font-sans">
                          {msg.citations.length} passage(s) verified across document index.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-Up Questions (Requirement #25) */}
                {msg.follow_ups && msg.follow_ups.length > 0 && (
                  <div className="pt-2 border-t border-ink/10 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-ink/60">
                      You might also <span className="font-script lowercase text-xs font-normal text-ink">ask:</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {msg.follow_ups.map((fq, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(fq)}
                          className="text-left px-3 py-1.5 rounded-[10px] bg-cream/70 hover:bg-lime border border-ink/30 text-xs font-bold text-ink transition-all flex items-center gap-1.5 group shadow-xs"
                        >
                          <span className="text-ink/60 group-hover:text-ink font-bold">→</span>
                          <span>{fq}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Multi-Step Real-time Thinking & Retrieval Animation Card */}
        {(isLoading || isStreaming) && !streamingContent && (
          <div className="flex items-start gap-3.5 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="relative w-9 h-9 rounded-xl bg-lime border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1C1C1C] overflow-hidden">
              <div className="absolute inset-0 border-2 border-dashed border-ink/40 rounded-xl animate-radar" />
              <AiSparkIcon className="w-4 h-4 text-ink animate-spin" />
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-[22px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-5 text-ink space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-utility-success animate-ping inline-block" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                    <span className="mr-1 text-ink/70">∴ {selectedMode.toUpperCase()}: </span>
                    {thinkingStages[thinkingIndex]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/60 animate-bounce-dot-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/60 animate-bounce-dot-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/60 animate-bounce-dot-3" />
                </div>
              </div>

              {/* Shimmering Animated Skeleton Bars */}
              <div className="space-y-2 pt-1">
                <div className="h-3 w-3/4 rounded-full bg-cream/90 border border-ink/30 overflow-hidden">
                  <div className="h-full bg-lime/70 animate-shimmer-stripes w-full" />
                </div>
                <div className="h-3 w-5/6 rounded-full bg-cream/90 border border-ink/30 overflow-hidden">
                  <div className="h-full bg-lime/70 animate-shimmer-stripes w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Streaming Message Card */}
        {isStreaming && streamingContent && (
          <div className="flex items-start gap-3.5 max-w-2xl animate-in fade-in duration-150">
            <div className="w-9 h-9 rounded-xl bg-lime border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1C1C1C]">
              <AiSparkIcon className="w-4 h-4 text-ink animate-pulse" />
            </div>
            <div className="bg-white/95 backdrop-blur-md rounded-[22px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-5 text-ink space-y-2 flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink/70">
                  Grounded Synthesis
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-lime border border-ink text-ink">
                  <span className="w-2 h-2 rounded-full bg-utility-success animate-pulse inline-block" />
                  {selectedMode === 'deep_research'
                    ? 'Deep Researching with Qwen3 8B...'
                    : selectedMode === 'think'
                    ? 'Reasoning with Qwen3 8B...'
                    : 'Streaming with Qwen3 8B...'}
                </span>
              </div>
              <div className="prose prose-sm max-w-none font-medium text-ink leading-relaxed pt-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {streamingContent}
                </ReactMarkdown>
                <span className="animate-cursor inline-block font-mono font-bold text-ink ml-0.5">▋</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area (Frosted Glass) */}
      <div className="p-4 md:p-5 bg-white/50 backdrop-blur-md border-t-2 border-ink shrink-0 space-y-2.5">
        {/* Full Multi-Mode Selector */}
        <PedupModeSelector
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          selectedAction={selectedAction}
          onSelectAction={setSelectedAction}
          explainLevel={explainLevel}
          onSelectExplainLevel={setExplainLevel}
          onTriggerQuickAction={handleQuickAction}
        />

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center bg-white/95 backdrop-blur-md rounded-full border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] px-4 py-2"
        >
          <input
            type="text"
            placeholder={
              selectedMode === 'deep_research'
                ? 'Deeply investigate across entire document...'
                : selectedMode === 'think'
                ? 'Ask a question requiring reasoning or calculations...'
                : selectedMode === 'verify'
                ? 'Enter a claim or statement to verify against the text...'
                : selectedMode === 'study'
                ? 'Ask for notes, quiz, flashcards, or concepts...'
                : 'Ask something about your documents...'
            }
            value={inputVal ?? ''}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isLoading || isStreaming}
            className="w-full text-xs md:text-sm font-bold text-ink placeholder:text-ink/40 bg-transparent focus:outline-none disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading || isStreaming}
            className="w-8 h-8 rounded-full bg-lime hover:bg-lime-400 border-1.5 border-ink flex items-center justify-center text-ink disabled:opacity-40 transition-all active:scale-95 shadow-xs shrink-0 ml-2"
          >
            <span className="text-sm font-bold">→</span>
          </button>
        </form>

        {/* Bottom Grounded Trust Footer */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-ink/75">
          <span>• 100% Local &amp; <span className="font-script lowercase text-xs font-normal text-ink">private</span></span>
          <span>• Citations grounded in <span className="font-script lowercase text-xs font-normal text-ink">source PDF</span></span>
        </div>
      </div>
    </div>
  );
};
