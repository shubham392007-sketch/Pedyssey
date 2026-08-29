import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';
import {
  UploadIcon,
  PdfIcon,
  NetworkIcon,
  SearchIcon,
  AiSparkIcon,
  CitationIcon,
} from '../components/common/SvgIcons';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Upload",
      subtitle: "Drop your PDF into the private workspace",
      desc: "Upload research papers, manuals, legal briefs, or book chapters. Files remain strictly on your local disk without uploading to third-party clouds.",
      icon: <UploadIcon className="w-6 h-6 text-ink" />,
      color: "bg-card-cream"
    },
    {
      num: "02",
      title: "Process",
      subtitle: "Complete multi-page extraction",
      desc: "Pedyssey parses every single page sequentially from Page 1 to Page N. Headers, footers, tables, and paragraphs are extracted without truncation.",
      icon: <PdfIcon className="w-6 h-6 text-ink" />,
      color: "bg-blush"
    },
    {
      num: "03",
      title: "Understand",
      subtitle: "Token windowing & semantic embedding",
      desc: "Extracted text is partitioned into semantic chunks with boundary-safe overlaps and encoded into 384-dimensional dense vectors.",
      icon: <NetworkIcon className="w-6 h-6 text-ink" />,
      color: "bg-cream"
    },
    {
      num: "04",
      title: "Retrieve",
      subtitle: "Hybrid dense & sparse matching",
      desc: "When you ask a question, the query executes parallel searches across FAISS (vector similarity) and BM25 (exact keyword match), fused by Reciprocal Rank Fusion.",
      icon: <SearchIcon className="w-6 h-6 text-ink" />,
      color: "bg-lime"
    },
    {
      num: "05",
      title: "Reason",
      subtitle: "Neural Cross-Encoder reranking",
      desc: "Top retrieved candidate chunks are evaluated pairwise by a Cross-Encoder to filter false matches and deliver the highest-relevance evidence to Qwen3 8B.",
      icon: <AiSparkIcon className="w-6 h-6 text-ink" />,
      color: "bg-peach"
    },
    {
      num: "06",
      title: "Answer",
      subtitle: "Synthesized answer with exact page citations",
      desc: "Qwen3 8B synthesizes a clear, structured response. Every factual statement is hyperlinked with clickable page citation chips directly opening the source text.",
      icon: <CitationIcon className="w-6 h-6 text-ink" />,
      color: "bg-card-cream"
    }
  ];

  return (
    <PageFrame>
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-lime px-3 py-1 rounded-pill border border-ink">
          PIPELINE OVERVIEW
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          How Pedyssey turns <span className="font-script text-[1.25em] font-normal">pages</span> into answers.
        </h1>
        <p className="text-sm md:text-base text-ink/80 leading-relaxed font-medium">
          A transparent, local-first RAG pipeline designed to ensure that no critical page or evidence is ever overlooked.
        </p>
      </section>

      {/* 6 Steps List */}
      <section className="max-w-4xl mx-auto space-y-8 mb-24">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`${s.color} rounded-card border-2 border-ink p-8 shadow-editorial transition-transform hover:-translate-y-1`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-ink/15">
              <div className="flex items-center gap-4">
                <span className="text-3xl md:text-4xl font-black text-ink/30 font-sans">{s.num}</span>
                <div>
                  <h3 className="text-2xl font-bold text-ink">{s.title}</h3>
                  <p className="text-xs font-bold text-ink/60 uppercase tracking-wider">{s.subtitle}</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-ink self-end md:self-auto">
                {s.icon}
              </div>
            </div>
            <p className="text-xs md:text-sm text-ink/85 leading-relaxed font-medium">
              {s.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Banner */}
      <section className="text-center my-16 bg-lime rounded-card-lg border-2 border-ink p-8 md:p-12 shadow-editorial max-w-3xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-extrabold text-ink mb-3 tracking-tight">
          Every page matters.
        </h3>
        <p className="text-xs md:text-sm text-ink/80 max-w-md mx-auto mb-6">
          Ready to experience true multi-page document intelligence on your own computer?
        </p>
        <PillButton to="/pedup" variant="primary" size="md" withArrow>
          OPEN PEDUP WORKSPACE
        </PillButton>
      </section>
    </PageFrame>
  );
};
