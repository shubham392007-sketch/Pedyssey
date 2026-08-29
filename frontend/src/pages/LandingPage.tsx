import React from 'react';
import { Link } from 'react-router-dom';
import { PageFrame } from '../components/layout/PageFrame';
import {
  PdfIcon,
  SearchIcon,
  CitationIcon,
  LockShieldIcon,
  AiSparkIcon,
} from '../components/common/SvgIcons';

// Floating Sparkle Star Decoration
const SparkleStar: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
      fill="#FFFFFF"
      fillOpacity="0.6"
    />
  </svg>
);

export const LandingPage: React.FC = () => {
  return (
    <PageFrame>
      {/* ============================================================ */}
      {/* 1. HERO SECTION (Editorial 3-Column Flanking Hero Layout) */}
      {/* ============================================================ */}
      <section className="relative pt-4 md:pt-8 pb-12 md:pb-16 overflow-visible">
        {/* Background Ambient Sparkles */}
        <div className="absolute top-6 left-6 pointer-events-none hidden xl:block">
          <SparkleStar className="w-8 h-8 text-white/70 animate-pulse" />
        </div>
        <div className="absolute bottom-16 right-6 pointer-events-none hidden xl:block">
          <SparkleStar className="w-10 h-10 text-white/60 animate-pulse" />
        </div>

        {/* 3-Column Desktop Hero Composition (Zero Overlap Guaranteed) */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-6 xl:gap-8 max-w-[1240px] mx-auto">
          
          {/* LEFT FLANK: Top Document Card + Bottom RAG Process Card */}
          <div className="hidden lg:flex flex-col justify-between items-start w-[240px] xl:w-[265px] shrink-0 py-2 space-y-8 select-none">
            {/* 1. TOP-LEFT: PDF Document Card (-3deg rotation) */}
            <div 
              className="w-full bg-[#FAF6EB] rounded-[22px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] p-4 text-left space-y-2.5 transition-all duration-300 hover:-translate-y-1 hover:rotate-0"
              style={{ transform: 'rotate(-3deg)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-ink/50 uppercase tracking-widest font-mono">-3°</span>
                <div className="p-1 rounded-md bg-lime border border-ink">
                  <PdfIcon className="w-3.5 h-3.5 text-ink" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-lime border border-ink text-[9px] font-black text-ink">
                    PDF
                  </span>
                  <span className="text-xs font-black text-ink truncate max-w-[140px]">Research_Paper.pdf</span>
                </div>
                <p className="text-[10px] text-ink/70 font-bold">
                  42 pages, <span className="text-utility-success font-black">● Indexed</span>
                </p>
              </div>
              <div className="pt-1 border-t border-ink/10">
                <span className="inline-block px-2.5 py-1 rounded-full bg-lime border border-ink text-[9px] font-black text-ink">
                  FAISS + BM25 READY
                </span>
              </div>
            </div>

            {/* 2. BOTTOM-LEFT: RAG Process Card (-2deg rotation) */}
            <div 
              className="w-full bg-[#FAF6EB] rounded-[22px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] p-4 text-left space-y-2.5 transition-all duration-300 hover:-translate-y-1 hover:rotate-0"
              style={{ transform: 'rotate(-2deg)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-ink/50 uppercase tracking-widest font-mono">-2°</span>
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded-md bg-lime border border-ink">
                    <SearchIcon className="w-3 h-3 text-ink" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-ink">RAG PROCESS</span>
                </div>
              </div>
              
              {/* Visual Node Flow */}
              <div className="bg-white/70 rounded-xl border border-ink/20 p-2 text-[10px] font-black text-ink space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded bg-cream border border-ink/40">PDF</span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-cream border border-ink/40">INDEX</span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-cream border border-ink/40">RETRIEVE</span>
                </div>
                <div className="flex items-center justify-between pl-3 pr-3 text-ink/60">
                  <span>↓</span>
                  <span>↑</span>
                </div>
                <div className="flex items-center justify-around">
                  <span className="px-2 py-0.5 rounded bg-lime border border-ink">QWEN3</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 rounded bg-[#FAD7BC] border border-ink">ANSWER</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER HERO: Eyebrow + Signature Headline + Description + CTAs */}
          <div className="flex-1 min-w-0 max-w-[580px] xl:max-w-[640px] text-center space-y-6 mx-auto px-2">
            {/* Main Central Brand Heading */}
            <div className="inline-flex items-baseline justify-center select-none text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-bold text-ink tracking-tight mb-1">
              <span className="font-script text-[1.25em] font-normal leading-none -mr-1">Ped</span>
              <span className="font-sans font-extrabold tracking-tight">yssey</span>
            </div>

            {/* Dominant Headline with Signature Mixture Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-extrabold text-ink leading-[1.12] tracking-tight">
              Understand every{' '}
              <span className="font-script text-[1.28em] font-normal leading-none inline-block -rotate-2 -mr-1 text-ink">
                page.
              </span>{' '}
              Ask anything.
              <br />
              Get answers that{' '}
              <span className="font-script text-[1.32em] font-normal leading-none inline-block -rotate-1 text-ink">
                matter.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-xs sm:text-sm md:text-base text-ink/80 max-w-lg mx-auto font-medium leading-relaxed">
              Pedyssey turns research papers, technical reports and PDFs into an intelligent, completely private workspace using local <strong className="font-black text-ink">Qwen3 8B</strong> and hybrid <strong className="font-black text-ink">FAISS + BM25</strong> retrieval.
            </p>

            {/* Primary + Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <Link
                to="/pedup"
                className="px-7 py-3.5 rounded-full bg-[#F3A878] hover:bg-[#efa06e] border-2 border-ink text-xs sm:text-sm font-black uppercase tracking-wider text-ink shadow-[3px_3px_0px_#1C1C1C] hover:shadow-[4px_4px_0px_#1C1C1C] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>LAUNCH PEDUP</span>
                <span className="text-base font-bold">→</span>
              </Link>

              <Link
                to="/how-it-works"
                className="px-7 py-3.5 rounded-full bg-[#FAF6EB]/80 hover:bg-[#FAF6EB] border-2 border-ink text-xs sm:text-sm font-black uppercase tracking-wider text-ink shadow-[2px_2px_0px_#1C1C1C] hover:shadow-[3px_3px_0px_#1C1C1C] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                HOW IT WORKS
              </Link>
            </div>
          </div>

          {/* RIGHT FLANK: Top AI Answer Card + Bottom Local AI Card */}
          <div className="hidden lg:flex flex-col justify-between items-end w-[240px] xl:w-[265px] shrink-0 py-2 space-y-8 select-none">
            {/* 3. TOP-RIGHT: AI Answer Card (+2deg rotation) */}
            <div 
              className="w-full bg-[#FAF6EB] rounded-[22px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] p-4 text-left space-y-2.5 transition-all duration-300 hover:-translate-y-1 hover:rotate-0"
              style={{ transform: 'rotate(2deg)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-lime border border-ink">
                    <AiSparkIcon className="w-3 h-3 text-ink" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-ink">AI ANSWER</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-lime border border-ink text-[9px] font-black text-ink">
                    READY
                  </span>
                  <span className="text-[10px] font-black text-ink/50 uppercase tracking-widest font-mono">+2°</span>
                </div>
              </div>

              <div className="space-y-1 text-[10px]">
                <p className="font-black text-ink uppercase text-[9px]">QUESTION:</p>
                <p className="font-medium text-ink/80 italic">"What is the methodology?"</p>
                
                <p className="font-black text-ink uppercase text-[9px] pt-1">GROUNDED ANSWER:</p>
                <p className="font-medium text-ink/80 text-[10px] line-clamp-2">
                  "Multi-stage hierarchical cross-encoder reranking..."
                </p>
              </div>

              <div className="pt-1 border-t border-ink/10 flex items-center gap-1 flex-wrap">
                <span className="text-[9px] font-black uppercase text-ink/60">SOURCES:</span>
                <span className="px-1.5 py-0.2 rounded bg-white border border-ink/40 text-[9px] font-bold">Page 12</span>
                <span className="px-1.5 py-0.2 rounded bg-white border border-ink/40 text-[9px] font-bold">Page 18</span>
                <span className="px-1.5 py-0.2 rounded bg-white border border-ink/40 text-[9px] font-bold">Page 21</span>
              </div>
            </div>

            {/* 4. BOTTOM-RIGHT: Local AI Badge Card (+4deg rotation) */}
            <div 
              className="w-full bg-[#FAF6EB] rounded-[22px] border-2 border-ink shadow-[4px_4px_0px_#1C1C1C] p-4 text-left space-y-2 transition-all duration-300 hover:-translate-y-1 hover:rotate-0"
              style={{ transform: 'rotate(4deg)' }}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-lime border border-ink text-[10px] font-black text-ink flex items-center gap-1">
                  <LockShieldIcon className="w-3 h-3 text-ink" />
                  <span>LOCAL AI</span>
                </span>
                <span className="text-[10px] font-black text-ink/50 uppercase tracking-widest font-mono">+4°</span>
              </div>

              <div className="text-[11px] font-bold text-ink space-y-0.5 pt-1">
                <p className="font-black text-ink">QWEN3 8B, OLLAMA</p>
                <p className="text-[10px] text-utility-success font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-utility-success inline-block"></span>
                  RUNNING LOCALLY
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET FLOATING CARDS (Responsive 2x2 Grid below Hero on small screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 lg:hidden max-w-xl mx-auto">
          {/* Card 1 */}
          <div className="bg-[#FAF6EB] rounded-[20px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-lime border border-ink text-[9px] font-black text-ink">PDF</span>
              <span className="text-[9px] font-black text-utility-success">● Indexed</span>
            </div>
            <p className="text-xs font-black text-ink truncate">Research_Paper.pdf</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-lime border border-ink text-[9px] font-black text-ink">
              FAISS + BM25 READY
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-[#FAF6EB] rounded-[20px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-ink">AI ANSWER</span>
              <span className="px-2 py-0.5 rounded-full bg-lime border border-ink text-[9px] font-black text-ink">READY</span>
            </div>
            <p className="text-[11px] font-bold text-ink italic">"What is the methodology?"</p>
            <div className="flex items-center gap-1 text-[9px] font-bold">
              <span>Sources:</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-ink/40">p.12</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-ink/40">p.18</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-ink/40">p.21</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#FAF6EB] rounded-[20px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-ink">RAG PROCESS</span>
              <span className="text-[9px] font-bold text-ink/60">Hybrid</span>
            </div>
            <p className="text-xs font-black text-ink">PDF → INDEX → RETRIEVE → QWEN3</p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#FAF6EB] rounded-[20px] border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-ink">LOCAL AI</span>
              <span className="text-[9px] font-black text-utility-success">● RUNNING</span>
            </div>
            <p className="text-xs font-black text-ink">Qwen3 8B • Ollama Engine</p>
          </div>
        </div>

        {/* Product Trust Strip (Cleanly placed below the entire hero block) */}
        <div className="mt-14 pt-6 border-t border-ink/20 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-ink/75">
          <span>LOCAL PROCESSING</span>
          <span>•</span>
          <span>QWEN3</span>
          <span>•</span>
          <span>OLLAMA</span>
          <span>•</span>
          <span>FAISS</span>
          <span>•</span>
          <span>BM25</span>
          <span>•</span>
          <span>PAGE CITATIONS</span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. SECTION: DOCUMENT INTELLIGENCE ("Your PDFs are more than pages.") */}
      {/* ============================================================ */}
      <section className="my-16 md:my-24 text-center">
        <div className="max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-ink/70 bg-[#FAF6EB] px-3.5 py-1 rounded-full border border-ink shadow-xs">
            DOCUMENT DECOMPOSITION
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
            Your PDFs are more than{' '}
            <span className="font-script text-[1.3em] font-normal leading-none inline-block -rotate-1 text-ink">
              pages.
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-ink/75 font-medium max-w-xl mx-auto leading-relaxed">
            Pedyssey transforms static documents into a dynamic vector graph of verifiable insights, formulas, and cross-section evidence.
          </p>
        </div>

        {/* Oversized SVG Transformation Diagram */}
        <div className="bg-[#FAF6EB]/80 backdrop-blur-xl rounded-[28px] border-2 border-ink p-6 md:p-10 shadow-[5px_5px_0px_#1C1C1C] max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Step 1: Raw PDF */}
            <div className="p-4 rounded-2xl bg-white/90 border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-ink/60 uppercase">01 INPUT</span>
                <span className="p-1 rounded bg-lime border border-ink"><PdfIcon className="w-3.5 h-3.5 text-ink" /></span>
              </div>
              <h3 className="text-sm font-black text-ink">Raw Multi-Page PDF</h3>
              <p className="text-[11px] text-ink/70 font-medium">Full textual &amp; column extraction without dropping references or tables.</p>
            </div>

            {/* Step 2: Smart Chunks */}
            <div className="p-4 rounded-2xl bg-cream border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-ink/60 uppercase">02 CHUNK</span>
                <span className="p-1 rounded bg-[#FAD7BC] border border-ink"><SearchIcon className="w-3.5 h-3.5 text-ink" /></span>
              </div>
              <h3 className="text-sm font-black text-ink">Token-Aware Chunks</h3>
              <p className="text-[11px] text-ink/70 font-medium">Boundaries preserved with page coordinate tags for 100% citation fidelity.</p>
            </div>

            {/* Step 3: Relevant Context */}
            <div className="p-4 rounded-2xl bg-[#F6C8D6]/60 border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-ink/60 uppercase">03 RERANK</span>
                <span className="p-1 rounded bg-lime border border-ink"><CitationIcon className="w-3.5 h-3.5 text-ink" /></span>
              </div>
              <h3 className="text-sm font-black text-ink">Relevant Evidence</h3>
              <p className="text-[11px] text-ink/70 font-medium">Neural Cross-Encoder isolates the top passages from pages 1–100+.</p>
            </div>

            {/* Step 4: Grounded Answer */}
            <div className="p-4 rounded-2xl bg-lime/60 border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-ink/60 uppercase">04 SYNTHESIS</span>
                <span className="p-1 rounded bg-white border border-ink"><AiSparkIcon className="w-3.5 h-3.5 text-ink" /></span>
              </div>
              <h3 className="text-sm font-black text-ink">Grounded Answer</h3>
              <p className="text-[11px] text-ink/70 font-medium">Synthesized by local Qwen3 8B strictly from cited passages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SECTION: HOW PEDYSSEY THINKS ("From pages to answers.") */}
      {/* ============================================================ */}
      <section className="my-16 md:my-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-ink/70 bg-[#FAF6EB] px-3.5 py-1 rounded-full border border-ink shadow-xs">
            EDITORIAL WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
            From pages to{' '}
            <span className="font-script text-[1.3em] font-normal leading-none inline-block -rotate-1 text-ink">
              answers.
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-ink/75 font-medium max-w-xl mx-auto leading-relaxed">
            Four rigorous phases ensure complete document comprehension without hallucinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phase 1: READ */}
          <div className="bg-[#FAF6EB] rounded-[24px] border-2 border-ink p-6 shadow-[4px_4px_0px_#1C1C1C] flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-ink/20 font-mono">01</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cream border border-ink text-[10px] font-black text-ink">READ</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-ink mb-1.5">Column &amp; Text Parsing</h3>
              <p className="text-xs text-ink/75 font-medium leading-relaxed">
                Extracts multi-column scientific layouts, bibliographies, equations, and footnotes across all pages.
              </p>
            </div>
            <div className="pt-2 border-t border-ink/10 text-[10px] font-bold text-utility-success">
              ✓ Multi-page extraction
            </div>
          </div>

          {/* Phase 2: RETRIEVE */}
          <div className="bg-[#FAF6EB] rounded-[24px] border-2 border-ink p-6 shadow-[4px_4px_0px_#1C1C1C] flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-ink/20 font-mono">02</span>
              <span className="px-2.5 py-0.5 rounded-full bg-lime border border-ink text-[10px] font-black text-ink">RETRIEVE</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-ink mb-1.5">Dual Hybrid Search</h3>
              <p className="text-xs text-ink/75 font-medium leading-relaxed">
                Fuses FAISS dense semantic embeddings with BM25 keyword matching via Reciprocal Rank Fusion (RRF).
              </p>
            </div>
            <div className="pt-2 border-t border-ink/10 text-[10px] font-bold text-utility-success">
              ✓ FAISS + BM25 Fusion
            </div>
          </div>

          {/* Phase 3: REASON */}
          <div className="bg-[#FAF6EB] rounded-[24px] border-2 border-ink p-6 shadow-[4px_4px_0px_#1C1C1C] flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-ink/20 font-mono">03</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAD7BC] border border-ink text-[10px] font-black text-ink">REASON</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-ink mb-1.5">Cross-Encoder Scoring</h3>
              <p className="text-xs text-ink/75 font-medium leading-relaxed">
                Evaluates candidate relevance with neural cross-attention, filtering noise and scoring confidence.
              </p>
            </div>
            <div className="pt-2 border-t border-ink/10 text-[10px] font-bold text-utility-success">
              ✓ ms-marco-MiniLM-L6
            </div>
          </div>

          {/* Phase 4: ANSWER */}
          <div className="bg-[#FAF6EB] rounded-[24px] border-2 border-ink p-6 shadow-[4px_4px_0px_#1C1C1C] flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-ink/20 font-mono">04</span>
              <span className="px-2.5 py-0.5 rounded-full bg-lime border border-ink text-[10px] font-black text-ink">ANSWER</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-ink mb-1.5">Grounded Local Synthesis</h3>
              <p className="text-xs text-ink/75 font-medium leading-relaxed">
                Qwen3 8B generates research-grade answers strictly backed by explicit, clickable page citations.
              </p>
            </div>
            <div className="pt-2 border-t border-ink/10 text-[10px] font-bold text-utility-success">
              ✓ Strict Citation Links
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SECTION: COMPLETE PDF COVERAGE ("Every page matters.") */}
      {/* ============================================================ */}
      <section className="my-16 md:my-24 bg-[#FAF6EB]/80 backdrop-blur-xl rounded-[28px] border-2 border-ink p-8 md:p-12 shadow-[5px_5px_0px_#1C1C1C]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Story */}
          <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-ink/70 bg-lime px-3.5 py-1 rounded-full border border-ink shadow-xs">
              FULL-DOCUMENT INDEXING
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
              Every page{' '}
              <span className="font-script text-[1.3em] font-normal leading-none inline-block -rotate-1 text-ink">
                matters.
              </span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-ink/80 font-medium leading-relaxed">
              Most standard document chatbots only ingest the first 3 pages and hallucinate the rest. Pedyssey builds a complete, high-dimensional index across the entire PDF, enabling exact retrieval whether the evidence is on Page 1 or Page 42.
            </p>
            
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-lime border border-ink text-xs font-black text-ink shadow-xs">
                42 / 42 PAGES INDEXED
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-ink text-xs font-black text-ink shadow-xs">
                100% COVERAGE GUARANTEE
              </span>
            </div>
          </div>

          {/* Right Column: Abstract SVG Document Stack */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-sm h-64 flex items-center justify-center">
              {/* Back Page 1 */}
              <div 
                className="absolute w-56 h-44 bg-cream rounded-2xl border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] p-4 text-[10px] font-bold text-ink/50"
                style={{ transform: 'rotate(-8deg) translateY(-10px)' }}
              >
                <span>PAGE 01 · ABSTRACT</span>
              </div>
              {/* Middle Page 2 */}
              <div 
                className="absolute w-56 h-44 bg-[#F6C8D6] rounded-2xl border-2 border-ink shadow-[3px_3px_0px_#1C1C1C] p-4 text-[10px] font-bold text-ink/60"
                style={{ transform: 'rotate(6deg) translateY(5px)' }}
              >
                <span>PAGE 18 · METHODOLOGY</span>
              </div>
              {/* Front Page 3 */}
              <div 
                className="absolute w-60 h-48 bg-[#FAF6EB] rounded-2xl border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] p-5 text-left space-y-2 z-10"
                style={{ transform: 'rotate(-1deg)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-lime border border-ink text-[10px] font-black text-ink">PAGE 42</span>
                  <span className="text-[10px] font-black text-utility-success">VERIFIED ✓</span>
                </div>
                <p className="text-xs font-black text-ink">REFERENCES &amp; CITATIONS</p>
                <div className="space-y-1.5 pt-1">
                  <div className="h-2 w-3/4 rounded bg-ink/20"></div>
                  <div className="h-2 w-5/6 rounded bg-ink/15"></div>
                  <div className="h-2 w-1/2 rounded bg-ink/15"></div>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-ink/80 bg-cream px-2 py-0.5 rounded border border-ink/30">
                    Cited Authors &amp; DOI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. SECTION: LOCAL PRIVACY ("Your documents stay yours.") */}
      {/* ============================================================ */}
      <section className="my-16 md:my-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          <span className="text-xs font-black uppercase tracking-widest text-ink/70 bg-[#FAF6EB] px-3.5 py-1 rounded-full border border-ink shadow-xs">
            ZERO DATA LEAKAGE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
            Your documents stay{' '}
            <span className="font-script text-[1.3em] font-normal leading-none inline-block -rotate-1 text-ink">
              yours.
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-ink/80 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
            Pedyssey runs entirely on your local machine using Ollama and local neural embeddings. Your proprietary PDFs, corporate reports, and research never leave your hardware.
          </p>

          <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
            <span className="px-4 py-1.5 rounded-full bg-lime border border-ink text-xs font-black text-ink shadow-xs">
              ● 100% LOCAL PROCESSING
            </span>
            <span className="px-4 py-1.5 rounded-full bg-[#FAF6EB] border border-ink text-xs font-black text-ink shadow-xs">
              ● OLLAMA ENGINE
            </span>
            <span className="px-4 py-1.5 rounded-full bg-[#FAD7BC] border border-ink text-xs font-black text-ink shadow-xs">
              ● NO REQUIRED CLOUD LLM
            </span>
          </div>
        </div>

        {/* Laptop SVG Illustration */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-[#FAF6EB] rounded-[24px] border-2 border-ink shadow-[5px_5px_0px_#1C1C1C] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ink/15">
              <span className="text-xs font-black text-ink uppercase">OFFLINE WORKSPACE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-utility-success animate-pulse"></span>
            </div>
            
            <div className="bg-white rounded-xl border border-ink/20 p-4 space-y-2 text-xs font-mono">
              <div className="text-utility-success font-bold">✓ PDF Parsing (PyMuPDF)</div>
              <div className="text-utility-success font-bold">✓ FAISS Indexing (Local CPU)</div>
              <div className="text-utility-success font-bold">✓ Qwen3 8B Inference (Ollama)</div>
              <div className="text-ink/60 text-[11px] pt-1">Cloud telemetry: 0 bytes transferred</div>
            </div>

            <div className="text-center pt-1">
              <span className="text-[11px] font-bold text-ink/75">
                Safe for confidential research &amp; enterprise files
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SECTION: PEDUP CONVERSION CTA ("Ready to ask your documents something better?") */}
      {/* ============================================================ */}
      <section className="my-16 md:my-24 text-center">
        <div className="bg-[#FAF6EB] rounded-[36px] border-2 border-ink p-8 md:p-14 shadow-[6px_6px_0px_#1C1C1C] max-w-4xl mx-auto space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-ink/70 bg-lime px-3.5 py-1 rounded-full border border-ink shadow-xs">
            START RESEARCHING
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to ask your documents something{' '}
            <span className="font-script text-[1.3em] font-normal leading-none inline-block -rotate-1 text-ink">
              better?
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-ink/75 font-medium max-w-xl mx-auto leading-relaxed">
            Turn any research paper, technical manual, or report into an interactive, fully private knowledge workspace in seconds.
          </p>

          <div className="pt-2">
            <Link
              to="/pedup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#F3A878] hover:bg-[#efa06e] border-2 border-ink text-sm sm:text-base font-black uppercase tracking-wider text-ink shadow-[4px_4px_0px_#1C1C1C] hover:shadow-[5px_5px_0px_#1C1C1C] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>OPEN PEDUP WORKSPACE</span>
              <span className="text-lg font-bold">→</span>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-[11px] font-bold text-ink/70">
            <span>• 100% Free &amp; Open</span>
            <span>• No account needed</span>
            <span>• Runs locally</span>
          </div>
        </div>
      </section>
    </PageFrame>
  );
};

