import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';

export const PrioritiesPage: React.FC = () => {
  const priorities = [
    {
      num: "01",
      title: "Accuracy",
      quote: "The right answer is more important than a fast answer.",
      desc: "We enforce strict retrieval reranking and confidence evaluation. If facts are absent from the document, Pedyssey transparently informs you rather than guessing.",
      color: "bg-card-cream"
    },
    {
      num: "02",
      title: "Privacy",
      quote: "Your documents should not become someone else's dataset.",
      desc: "All vector embeddings, search indexes, and Qwen3 LLM inferences run on your laptop. No cloud telemetry, no account requirements, zero data leakage.",
      color: "bg-blush"
    },
    {
      num: "03",
      title: "Usability",
      quote: "Document intelligence accessible to everyone.",
      desc: "We hide unnecessary complexity behind an intuitive, delightful interface. Drag a PDF, ask a question, and read structured answers immediately.",
      color: "bg-cream"
    },
    {
      num: "04",
      title: "Performance",
      quote: "Process once, retrieve many times.",
      desc: "Instant asynchronous indexing and lightning-fast sub-second vector queries keep your workflow seamless and responsive.",
      color: "bg-lime"
    },
    {
      num: "05",
      title: "Transparency",
      quote: "Every answer must be verifiable.",
      desc: "Full source attribution with clickable page citation chips and optional retrieval inspection details for complete auditability.",
      color: "bg-peach"
    },
    {
      num: "06",
      title: "Continuous Improvement",
      quote: "Always evolving for a better tomorrow.",
      desc: "Constantly refining chunking algorithms, hybrid fusion weighting, and prompt precision to ensure cutting-edge local AI performance.",
      color: "bg-card-cream"
    }
  ];

  return (
    <PageFrame>
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-peach px-3 py-1 rounded-pill border border-ink">
          GUIDING VALUES
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          What matters most to <span className="font-script text-[1.25em] font-normal">Pedyssey.</span>
        </h1>
        <p className="text-sm md:text-base text-ink/80 leading-relaxed font-medium">
          The engineering and design standards we hold ourselves to every day.
        </p>
      </section>

      {/* Priorities List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
        {priorities.map((p) => (
          <div
            key={p.num}
            className={`${p.color} rounded-card border-1.5 border-ink p-8 shadow-editorial flex flex-col justify-between hover:-translate-y-1 transition-all duration-200`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-black text-ink/30 font-sans">{p.num}</span>
                <span className="text-xs font-bold px-3 py-1 rounded-pill bg-white border border-ink/30 text-ink uppercase tracking-wider">
                  {p.title}
                </span>
              </div>
              <blockquote className="text-base font-bold text-ink mb-2 italic">
                "{p.quote}"
              </blockquote>
              <p className="text-xs md:text-sm text-ink/75 leading-relaxed font-medium">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center my-12">
        <PillButton to="/pedup" variant="primary" size="lg" withArrow>
          EXPLORE THE WORKSPACE
        </PillButton>
      </section>
    </PageFrame>
  );
};
