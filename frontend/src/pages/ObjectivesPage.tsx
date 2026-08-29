import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';

export const ObjectivesPage: React.FC = () => {
  const objectives = [
    {
      num: "01",
      title: "Understand",
      desc: "Transform dense, complex multi-page PDF documents into clear, navigable conversational workspaces.",
      color: "bg-card-cream"
    },
    {
      num: "02",
      title: "Retrieve",
      desc: "Locate the precise paragraph, table, or finding across hundreds of pages using hybrid dense and sparse search.",
      color: "bg-lime"
    },
    {
      num: "03",
      title: "Explain",
      desc: "Deliver clear, structured answers with executive overviews, key bullet points, and technical nuances.",
      color: "bg-peach"
    },
    {
      num: "04",
      title: "Verify",
      desc: "Provide verifiable citations for every statement, allowing readers to instantly audit the underlying source text.",
      color: "bg-blush"
    },
    {
      num: "05",
      title: "Protect",
      desc: "Ensure zero data leaks by running the entire embedding, vector database, and Qwen3 inference locally.",
      color: "bg-card-cream"
    },
    {
      num: "06",
      title: "Learn",
      desc: "Empower students, engineers, and researchers to digest information 10x faster without sacrificing deep understanding.",
      color: "bg-cream"
    }
  ];

  return (
    <PageFrame>
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-lime px-3 py-1 rounded-pill border border-ink">
          CORE PURPOSE
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          What Pedyssey is built to <span className="font-script text-[1.25em] font-normal">achieve.</span>
        </h1>
        <p className="text-sm md:text-base text-ink/80 leading-relaxed font-medium">
          Six foundational goals driving the architecture, algorithms, and interface of Pedyssey.
        </p>
      </section>

      {/* 6 Numbered Editorial Blocks */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {objectives.map((obj) => (
          <div
            key={obj.num}
            className={`${obj.color} rounded-card border-1.5 border-ink p-8 shadow-editorial flex flex-col justify-between hover:-translate-y-1 transition-all duration-200`}
          >
            <div>
              <span className="text-4xl lg:text-5xl font-black text-ink/30 block mb-3 font-sans">{obj.num}</span>
              <h3 className="text-2xl font-bold text-ink mb-2">{obj.title}</h3>
              <p className="text-xs md:text-sm text-ink/80 leading-relaxed font-medium">{obj.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="text-center my-12">
        <PillButton to="/pedup" variant="primary" size="lg" withArrow>
          EXPLORE PEDUP NOW
        </PillButton>
      </section>
    </PageFrame>
  );
};
