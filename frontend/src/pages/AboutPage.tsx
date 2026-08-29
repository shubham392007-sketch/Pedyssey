import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';
import { LockShieldIcon, CitationIcon, SearchIcon } from '../components/common/SvgIcons';

export const AboutPage: React.FC = () => {
  return (
    <PageFrame>
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-lime px-3 py-1 rounded-pill border border-ink">
          OUR MISSION
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          About <span className="font-script text-[1.25em] font-normal">Pedyssey</span>
        </h1>
        <p className="text-lg md:text-xl font-semibold text-ink/90 mb-4">
          A different way to understand documents.
        </p>
        <p className="text-sm md:text-base text-ink/75 leading-relaxed">
          Pedyssey is a local-first PDF intelligence platform designed to help students, researchers, developers, and curious minds understand long documents without losing themselves in hundreds of pages.
        </p>
      </section>

      {/* 3 Core Principles Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            num: "01",
            title: "Read deeply.",
            desc: "Extract every nuance, table, and argument from the complete document hierarchy.",
            bg: "bg-card-cream"
          },
          {
            num: "02",
            title: "Ask naturally.",
            desc: "Converse with your documents using plain human language rather than brittle keyword strings.",
            bg: "bg-blush/80"
          },
          {
            num: "03",
            title: "Understand clearly.",
            desc: "Receive synthesized answers verified by exact page numbers and traceable citations.",
            bg: "bg-lime/80"
          }
        ].map((item) => (
          <div 
            key={item.num} 
            className={`${item.bg} rounded-card border-1.5 border-ink p-8 shadow-editorial transition-transform hover:-translate-y-1`}
          >
            <span className="text-2xl font-black text-ink/30 block mb-2">{item.num}</span>
            <h3 className="text-xl font-bold text-ink mb-2">{item.title}</h3>
            <p className="text-xs md:text-sm text-ink/80 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Philosophy Section */}
      <section className="my-20 bg-card-cream rounded-card-lg border-2 border-ink p-8 md:p-12 shadow-editorial">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
            We believe documents should be <span className="font-script text-[1.25em] font-normal">conversational.</span>
          </h2>
          <div className="space-y-4 text-xs md:text-sm text-ink/80 text-left leading-relaxed">
            <p>
              PDFs are the bedrock of academic research, technical specifications, and legal records—yet they remain stubborn, static documents that are frustrating to navigate.
            </p>
            <p>
              Traditional search tools only highlight matching keyword occurrences out of context. On the other hand, generic cloud chatbots often hallucinate facts because they lack deep, verified grounding in the source material.
            </p>
            <p>
              Pedyssey bridges this gap by executing high-precision hybrid retrieval (FAISS vector embeddings + BM25 keyword matching) and Cross-Encoder reranking entirely on your laptop. Every answer is backed by verifiable citations directly from your PDF.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Pedyssey Different */}
      <section className="my-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
            What makes Pedyssey <span className="font-script text-[1.2em] font-normal">different</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card-cream rounded-card p-8 border-1.5 border-ink shadow-editorial">
            <div className="p-3 w-fit rounded-2xl bg-lime border border-ink mb-4">
              <LockShieldIcon className="w-6 h-6 text-ink" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Local First</h3>
            <p className="text-xs md:text-sm text-ink/75 leading-relaxed">
              Processing and inference execute locally via Ollama and Qwen3 8B. Your sensitive research and personal files never leak to third-party clouds.
            </p>
          </div>

          <div className="bg-card-cream rounded-card p-8 border-1.5 border-ink shadow-editorial">
            <div className="p-3 w-fit rounded-2xl bg-peach border border-ink mb-4">
              <CitationIcon className="w-6 h-6 text-ink" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Document Grounded</h3>
            <p className="text-xs md:text-sm text-ink/75 leading-relaxed">
              Every synthesized answer is constructed from retrieved document chunks. The system never makes up facts when source evidence is missing.
            </p>
          </div>

          <div className="bg-card-cream rounded-card p-8 border-1.5 border-ink shadow-editorial">
            <div className="p-3 w-fit rounded-2xl bg-blush border border-ink mb-4">
              <SearchIcon className="w-6 h-6 text-ink" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Complete Retrieval</h3>
            <p className="text-xs md:text-sm text-ink/75 leading-relaxed">
              Pedyssey indexes every single page of your PDF without shortcuts. Questions targeting Page 50 receive the exact same high precision as Page 1.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="text-center my-16">
        <PillButton to="/pedup" variant="primary" size="lg" withArrow>
          TRY PEDUP WORKSPACE
        </PillButton>
      </section>
    </PageFrame>
  );
};
