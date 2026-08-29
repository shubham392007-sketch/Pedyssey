import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';

export const ChallengePage: React.FC = () => {
  return (
    <PageFrame>
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-peach px-3 py-1 rounded-pill border border-ink">
          THE PROBLEM
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          PDFs are full of answers. Finding them is the <span className="font-script text-[1.25em] font-normal">challenge.</span>
        </h1>
        <p className="text-sm md:text-base text-ink/80 leading-relaxed font-medium">
          Understanding long documents is time-consuming and exhausting. When critical insights are buried on page 340, standard tools fall short.
        </p>
      </section>

      {/* 4 Challenges Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {[
          {
            title: "Long Documents",
            desc: "Important empirical data and limitations can be buried hundreds of pages away from the introduction. Skimming leaves huge blindspots.",
            tag: "PAGE 01 ... PAGE 400",
            bg: "bg-card-cream"
          },
          {
            title: "Context Loss in Standard Search",
            desc: "Command-F matching searches literal keywords without understanding synonyms, conceptual meaning, or contextual relationships.",
            tag: "BRITTLE LOOKUP",
            bg: "bg-blush/80"
          },
          {
            title: "Information Overload",
            desc: "Researchers and students often drown in technical jargon, equations, and dense formatting, making fast synthesis nearly impossible.",
            tag: "COGNITIVE OVERLOAD",
            bg: "bg-cream"
          },
          {
            title: "Cloud Privacy Risks",
            desc: "Uploading proprietary research or legal contracts to commercial cloud LLM providers creates serious security and compliance hazards.",
            tag: "DATA EXPOSURE",
            bg: "bg-peach/80"
          }
        ].map((item) => (
          <div key={item.title} className={`${item.bg} rounded-card border-1.5 border-ink p-8 shadow-editorial`}>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-pill bg-white border border-ink/40 text-ink uppercase tracking-wider mb-4 inline-block">
              {item.tag}
            </span>
            <h3 className="text-2xl font-bold text-ink mb-3">{item.title}</h3>
            <p className="text-xs md:text-sm text-ink/80 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Why RAG Matters Comparison */}
      <section className="bg-card-cream rounded-card-lg border-2 border-ink p-8 md:p-12 shadow-editorial mb-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink text-center mb-8 tracking-tight">
          Why Grounded RAG <span className="font-script text-[1.25em] font-normal">matters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Naive Approach */}
          <div className="p-6 rounded-2xl bg-utility-error/10 border-1.5 border-utility-error text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-utility-error bg-white px-3 py-1 rounded-pill border border-utility-error">
              NAIVE / CHATBOT
            </span>
            <div className="py-4 space-y-2 text-xs font-semibold text-ink">
              <div className="p-2.5 rounded-lg bg-white border border-ink/20">User Question</div>
              <div className="text-utility-error font-black">↓</div>
              <div className="p-2.5 rounded-lg bg-utility-error/20 border border-utility-error text-utility-error">Wrong Context / Hallucination</div>
              <div className="text-utility-error font-black">↓</div>
              <div className="p-2.5 rounded-lg bg-utility-error/20 border border-utility-error font-bold">Unreliable Answer</div>
            </div>
          </div>

          {/* Pedyssey Grounded RAG */}
          <div className="p-6 rounded-2xl bg-lime/30 border-1.5 border-utility-success text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-utility-success bg-white px-3 py-1 rounded-pill border border-utility-success">
              PEDYSSEY LOCAL RAG
            </span>
            <div className="py-4 space-y-2 text-xs font-semibold text-ink">
              <div className="p-2.5 rounded-lg bg-white border border-ink/20">User Question</div>
              <div className="text-utility-success font-black">↓</div>
              <div className="p-2.5 rounded-lg bg-lime border border-ink font-bold">FAISS + BM25 + Cross-Encoder Verification</div>
              <div className="text-utility-success font-black">↓</div>
              <div className="p-2.5 rounded-lg bg-cta border border-ink font-bold">Traceable, Grounded Answer with Citations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center my-12">
        <PillButton to="/pedup" variant="primary" size="lg" withArrow>
          EXPERIENCE THE DIFFERENCE
        </PillButton>
      </section>
    </PageFrame>
  );
};
