import React, { useState } from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';
import {
  GithubSvg,
  InstagramSvg,
  LinkedInSvg,
  MailSvg,
  XSvg,
  CheckIcon,
} from '../components/common/SvgIcons';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSent(true);
    }
  };

  return (
    <PageFrame>
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-lime px-3 py-1 rounded-pill border border-ink">
          GET IN TOUCH
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          Let's <span className="font-script text-[1.25em] font-normal">connect.</span>
        </h1>
        <p className="text-sm md:text-base text-ink/80 leading-relaxed font-medium">
          Have an idea, found something broken, or want to talk about Pedyssey? I'd love to hear from you.
        </p>
      </section>

      {/* Main Grid: Form + Direct Links */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto mb-24">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-card-cream rounded-card-lg border-2 border-ink p-8 md:p-10 shadow-editorial">
          <h3 className="text-2xl font-bold text-ink mb-6">Send a Message</h3>

          {sent ? (
            <div className="p-8 text-center bg-lime/40 rounded-2xl border-1.5 border-ink space-y-3">
              <div className="w-12 h-12 rounded-full bg-lime border border-ink flex items-center justify-center mx-auto">
                <CheckIcon className="w-6 h-6 text-ink" />
              </div>
              <h4 className="text-lg font-bold text-ink">Message Received!</h4>
              <p className="text-xs text-ink/80">
                Thank you for reaching out, {formData.name}. We'll get back to you shortly at {formData.email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1.5 pl-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 rounded-pill border-1.5 border-ink bg-white text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1.5 pl-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 rounded-pill border-1.5 border-ink bg-white text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1.5 pl-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Feedback / Collaboration / Bug"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-5 py-3 rounded-pill border-1.5 border-ink bg-white text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1.5 pl-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="How can we help?"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-[24px] border-1.5 border-ink bg-white text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-lime resize-none"
                />
              </div>

              <div className="pt-2">
                <PillButton type="submit" variant="primary" size="md" withArrow className="w-full">
                  SEND MESSAGE
                </PillButton>
              </div>
            </form>
          )}
        </div>

        {/* Direct Channels */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-lime rounded-card-lg border-2 border-ink p-8 shadow-editorial space-y-4">
            <h3 className="text-2xl font-bold text-ink">Let's connect!</h3>
            <p className="text-xs md:text-sm text-ink/80 leading-relaxed font-medium">
              I'd love to hear from you. Reach out through any of the platforms below or send a direct email.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "GitHub", url: "https://github.com/shubham392007-sketch", icon: <GithubSvg /> },
              { label: "Instagram", url: "https://instagram.com/shubhamofficial_2007", icon: <InstagramSvg /> },
              { label: "LinkedIn", url: "https://linkedin.com/in/shubham-pokale-94030b37", icon: <LinkedInSvg /> },
              { label: "Gmail", url: "mailto:shubham392007@gmail.com", icon: <MailSvg /> },
              { label: "X (Twitter)", url: "https://x.com/SHUBHAM392007", icon: <XSvg /> },
            ].map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-pill bg-card-cream border-1.5 border-ink hover:bg-cta transition-colors text-xs font-bold text-ink shadow-card-subtle"
              >
                <div className="p-1.5 rounded-full bg-white border border-ink">
                  {s.icon}
                </div>
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
};
