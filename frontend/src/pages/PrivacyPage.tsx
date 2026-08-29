import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { LockShieldIcon } from '../components/common/SvgIcons';

export const PrivacyPage: React.FC = () => {
  return (
    <PageFrame>
      <section className="max-w-3xl mx-auto my-12 bg-card-cream rounded-card-lg border-2 border-ink p-8 md:p-12 shadow-editorial">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ink/20">
          <div className="p-3 rounded-2xl bg-lime border border-ink">
            <LockShieldIcon className="w-6 h-6 text-ink" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-ink/60 font-semibold uppercase tracking-wider">Local-First Architecture Guarantee</p>
          </div>
        </div>

        <div className="space-y-6 text-xs md:text-sm text-ink/80 leading-relaxed font-medium">
          <section>
            <h2 className="text-base font-bold text-ink mb-2">1. Local Execution Policy</h2>
            <p>
              Pedyssey is engineered as an on-device, local-first application. When you upload a PDF document, all text extraction, semantic chunking, embedding generation, FAISS vector indexing, and BM25 indexing are performed directly on your machine.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink mb-2">2. Zero Cloud Telemetry for Document Data</h2>
            <p>
              Your PDF documents and extracted chunks are never uploaded to any remote server or external cloud LLM API (such as OpenAI, Anthropic, or Google). All generation is routed locally through your Ollama instance and Qwen3 8B model.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink mb-2">3. Data Storage & Deletion</h2>
            <p>
              Extracted chunks and metadata are stored locally in your SQLite database (`data/database/pedyssey.db`) and local index directories (`data/indexes/`). When you delete a document from Pedyssey, all associated vector embeddings and text chunks are immediately pruned from the index.
            </p>
          </section>
        </div>
      </section>
    </PageFrame>
  );
};
