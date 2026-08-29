import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { PillButton } from '../common/PillButton';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-ink/20 pt-16 pb-12 bg-white/40">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Top Section: Brand & Quick Action */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-ink/15">
          <div className="text-center md:text-left">
            <Logo size="xl" to="/" />
            <p className="text-sm text-ink/75 max-w-md mt-2 font-medium">
              Private, local-first PDF intelligence and multi-page document RAG powered by Qwen3 8B.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PillButton to="/how-it-works" variant="secondary" size="md">
              HOW IT WORKS
            </PillButton>
            <PillButton to="/pedup" variant="primary" size="md" withArrow>
              OPEN PEDUP
            </PillButton>
          </div>
        </div>

        {/* Multi-Column Comprehensive Navigation Map */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-ink/15 text-left">
          {/* Column 1: Core Workspace */}
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wider text-ink uppercase mb-4">
              Workspace & AI
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-ink/80">
              <li>
                <Link to="/" className="hover:text-ink hover:underline">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/pedup" className="inline-flex items-center gap-1.5 text-ink font-bold hover:underline">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime border border-ink"></span>
                  Pedup Workspace
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-ink hover:underline">
                  Features & Capabilities
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-ink hover:underline">
                  How It Works (RAG Flow)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Product & Vision */}
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wider text-ink uppercase mb-4">
              Product & Vision
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-ink/80">
              <li>
                <Link to="/about" className="hover:text-ink hover:underline">
                  About Pedyssey
                </Link>
              </li>
              <li>
                <Link to="/challenge" className="hover:text-ink hover:underline">
                  The Problem & Challenge
                </Link>
              </li>
              <li>
                <Link to="/objectives" className="hover:text-ink hover:underline">
                  Key Objectives
                </Link>
              </li>
              <li>
                <Link to="/priorities" className="hover:text-ink hover:underline">
                  Technical Priorities
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Creator & Legal */}
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wider text-ink uppercase mb-4">
              Creator & Trust
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-ink/80">
              <li>
                <Link to="/developer" className="hover:text-ink hover:underline">
                  Developer Profile
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-ink hover:underline">
                  Contact & Feedback
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-ink hover:underline">
                  Privacy Policy (Local-First)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Local Tech Specs */}
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wider text-ink uppercase mb-4">
              Local Architecture
            </h4>
            <div className="space-y-2 text-[11px] text-ink/70 font-mono">
              <div className="p-2 rounded-lg bg-cream/80 border border-ink/15">
                <span className="font-bold text-ink block">LLM Engine:</span>
                <span>Qwen3 8B (via Ollama)</span>
              </div>
              <div className="p-2 rounded-lg bg-cream/80 border border-ink/15">
                <span className="font-bold text-ink block">Hybrid Search:</span>
                <span>FAISS Dense + BM25 Sparse</span>
              </div>
              <div className="p-2 rounded-lg bg-cream/80 border border-ink/15">
                <span className="font-bold text-ink block">Neural Reranker:</span>
                <span>MiniLM Cross-Encoder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ecosystem Statement Ribbon */}
        <div className="py-6 my-2 flex flex-wrap items-center justify-around gap-6 md:gap-12 opacity-85">
          <span className="font-serif italic text-lg md:text-2xl font-bold tracking-widest text-ink">LOCAL AI</span>
          <span className="font-sans font-black text-xs md:text-sm tracking-[0.25em] text-ink uppercase">DOCUMENT RAG</span>
          <span className="font-serif text-lg md:text-2xl font-extrabold tracking-wide text-ink">PRIVATE BY DESIGN</span>
          <span className="font-sans font-black text-xs md:text-sm tracking-[0.2em] text-ink uppercase">QWEN3 8B</span>
          <span className="font-serif italic text-base md:text-xl font-bold text-ink">OFFLINE READY</span>
        </div>

        {/* Bottom Copyright & Credit */}
        <div className="pt-6 border-t border-ink/15 flex flex-col sm:flex-row items-center justify-between text-xs text-ink/60 gap-3">
          <p>
            © {new Date().getFullYear()} Pedyssey. Made by{' '}
            <Link to="/developer" className="underline font-bold text-ink hover:text-ink/80">
              Shubham Pokale
            </Link>
            . All processing stays 100% on your laptop.
          </p>
          <p className="font-medium">
            Zero telemetry • Zero external API keys
          </p>
        </div>
      </div>
    </footer>
  );
};
