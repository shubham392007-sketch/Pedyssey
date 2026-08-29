import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';
import {
  PdfIcon,
  SearchIcon,
  AiSparkIcon,
  CitationIcon,
  LockShieldIcon,
  NetworkIcon,
  QuestionIcon,
  CheckIcon,
} from '../components/common/SvgIcons';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: <PdfIcon className="w-6 h-6 text-ink" />,
      name: "PDF Intelligence & Parsing",
      desc: "Deep document extraction parsing typography, tables, headings, and layout structure.",
      tech: "PyMuPDF + pdfplumber",
      badgeColor: "bg-lime"
    },
    {
      icon: <LockShieldIcon className="w-6 h-6 text-ink" />,
      name: "Local Edge Execution",
      desc: "All calculations, embeddings, indexes, and LLM inference run strictly on your local hardware.",
      tech: "100% On-Device",
      badgeColor: "bg-cream"
    },
    {
      icon: <SearchIcon className="w-6 h-6 text-ink" />,
      name: "Hybrid Retrieval",
      desc: "Combines dense semantic vector search with sparse BM25 keyword matching for unparalleled recall.",
      tech: "FAISS + BM25 (RRF)",
      badgeColor: "bg-peach"
    },
    {
      icon: <NetworkIcon className="w-6 h-6 text-ink" />,
      name: "Dense Semantic Embeddings",
      desc: "Converts text chunks into dense 384-dimensional vectors capturing conceptual meaning.",
      tech: "all-MiniLM-L6-v2",
      badgeColor: "bg-blush"
    },
    {
      icon: <AiSparkIcon className="w-6 h-6 text-ink" />,
      name: "Cross-Encoder Reranking",
      desc: "Deep pairwise neural scoring evaluates retrieved candidates against user query before LLM prompt.",
      tech: "ms-marco-MiniLM",
      badgeColor: "bg-lime"
    },
    {
      icon: <AiSparkIcon className="w-6 h-6 text-ink" />,
      name: "Qwen3 8B Integration",
      desc: "State-of-the-art 8B parameter model synthesizes accurate, nuanced, and grounded answers.",
      tech: "Qwen3:8B via Ollama",
      badgeColor: "bg-cta"
    },
    {
      icon: <CitationIcon className="w-6 h-6 text-ink" />,
      name: "Traceable Page Citations",
      desc: "Clickable citation chips with exact start and end page numbers opening document preview.",
      tech: "Chunk Metadata Mapping",
      badgeColor: "bg-cream"
    },
    {
      icon: <QuestionIcon className="w-6 h-6 text-ink" />,
      name: "Cross-Document Synthesis",
      desc: "Query multiple documents simultaneously to compare methodologies, results, and findings.",
      tech: "Multi-Index Fusion",
      badgeColor: "bg-blush"
    },
    {
      icon: <PdfIcon className="w-6 h-6 text-ink" />,
      name: "Boundary-Safe Chunking",
      desc: "Smart token windowing with independent page tracking prevents first-page cascading bugs.",
      tech: "500-Token Overlap",
      badgeColor: "bg-peach"
    },
    {
      icon: <NetworkIcon className="w-6 h-6 text-ink" />,
      name: "Multi-Signal Confidence",
      desc: "Automatic query intent evaluation categorizes responses (High, Medium, Out-of-domain).",
      tech: "Confidence Engine",
      badgeColor: "bg-lime"
    },
    {
      icon: <CheckIcon className="w-6 h-6 text-ink" />,
      name: "Document Coverage Audit",
      desc: "Explicit audit display verifies that all pages and chunks were successfully indexed.",
      tech: "1:1 Index Parity",
      badgeColor: "bg-cream"
    },
    {
      icon: <LockShieldIcon className="w-6 h-6 text-ink" />,
      name: "Offline & Air-Gapped",
      desc: "Operate completely without internet access once model weights are stored locally.",
      tech: "Zero Telemetry",
      badgeColor: "bg-blush"
    },
  ];

  return (
    <PageFrame>
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-lime px-3 py-1 rounded-pill border border-ink">
          FULL ARCHITECTURE
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          Features built for <span className="font-script text-[1.25em] font-normal">understanding.</span>
        </h1>
        <p className="text-sm md:text-base text-ink/80 leading-relaxed">
          Every tool, algorithm, and interface in Pedyssey was engineered to make complex document understanding instant, accurate, and completely private.
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {features.map((f) => (
          <div
            key={f.name}
            className="bg-card-cream rounded-card border-1.5 border-ink p-7 shadow-editorial flex flex-col justify-between hover:-translate-y-1 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${f.badgeColor} border border-ink`}>
                  {f.icon}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-pill bg-white border border-ink/40 text-ink/80 uppercase tracking-wide">
                  {f.tech}
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{f.name}</h3>
              <p className="text-xs md:text-sm text-ink/75 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Workspace Link */}
      <section className="text-center my-12">
        <PillButton to="/pedup" variant="primary" size="lg" withArrow>
          LAUNCH PEDUP WORKSPACE
        </PillButton>
      </section>
    </PageFrame>
  );
};
