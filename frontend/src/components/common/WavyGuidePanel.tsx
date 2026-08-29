import React, { useState } from 'react';
import { PillButton } from './PillButton';
import { CheckIcon } from './SvgIcons';

export const WavyGuidePanel: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="my-16 md:my-24">
      <div className="wavy-panel p-8 md:p-12 text-center shadow-editorial max-w-4xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-bold text-ink mb-3 tracking-tight">
          Download the Pedyssey Guide
        </h3>
        <p className="text-sm md:text-base text-ink/80 max-w-xl mx-auto mb-2">
          Learn more about Pedyssey, its features, how it works, and how it can transform the way you understand documents.
        </p>
        <p className="text-xs md:text-sm text-ink/60 max-w-md mx-auto mb-8">
          We respect your privacy and promise that we won't spam you.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-lime border border-ink text-ink font-semibold text-sm">
            <CheckIcon className="w-4 h-4 text-ink" />
            <span>Thank you! The guide has been prepared for {firstName}.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="FIRST NAME"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full sm:w-44 px-5 py-2.5 rounded-pill border-1.5 border-ink bg-white text-xs font-semibold placeholder:text-ink/40 text-ink focus:outline-none focus:ring-2 focus:ring-lime"
            />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full sm:w-60 px-5 py-2.5 rounded-pill border-1.5 border-ink bg-white text-xs font-semibold placeholder:text-ink/40 text-ink focus:outline-none focus:ring-2 focus:ring-lime"
            />
            <PillButton type="submit" variant="primary" size="sm" withArrow>
              DOWNLOAD
            </PillButton>
          </form>
        )}
      </div>
    </section>
  );
};
