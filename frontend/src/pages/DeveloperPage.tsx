import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';
import { DeveloperIllustration } from '../components/common/Illustrations';
import {
  GithubSvg,
  InstagramSvg,
  LinkedInSvg,
  MailSvg,
  XSvg,
  ArrowRightIcon,
} from '../components/common/SvgIcons';

export const DeveloperPage: React.FC = () => {
  const socialLinks = [
    {
      name: "GitHub",
      handle: "github.com/shubham392007-sketch",
      url: "https://github.com/shubham392007-sketch",
      icon: <GithubSvg className="w-5 h-5 text-ink" />,
      bg: "bg-white"
    },
    {
      name: "Instagram",
      handle: "instagram.com/shubhamofficial_2007",
      url: "https://instagram.com/shubhamofficial_2007",
      icon: <InstagramSvg className="w-5 h-5 text-ink" />,
      bg: "bg-white"
    },
    {
      name: "LinkedIn",
      handle: "linkedin.com/in/shubham-pokale-94030b37",
      url: "https://linkedin.com/in/shubham-pokale-94030b37",
      icon: <LinkedInSvg className="w-5 h-5 text-ink" />,
      bg: "bg-white"
    },
    {
      name: "Email",
      handle: "shubham392007@gmail.com",
      url: "mailto:shubham392007@gmail.com",
      icon: <MailSvg className="w-5 h-5 text-ink" />,
      bg: "bg-white"
    },
    {
      name: "X (Twitter)",
      handle: "x.com/SHUBHAM392007",
      url: "https://x.com/SHUBHAM392007",
      icon: <XSvg className="w-5 h-5 text-ink" />,
      bg: "bg-white"
    },
  ];

  return (
    <PageFrame>
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-ink/60 bg-lime px-3 py-1 rounded-pill border border-ink">
          THE CREATOR
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mt-4 mb-6 tracking-tight">
          Developer
        </h1>
      </section>

      {/* Main Profile Card */}
      <section className="bg-card-cream rounded-card-lg border-2 border-ink p-8 md:p-12 shadow-editorial max-w-4xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Avatar Illustration */}
          <div className="md:col-span-4 flex justify-center">
            <DeveloperIllustration className="w-44 h-44 md:w-52 md:h-52 drop-shadow-lg" />
          </div>

          {/* Bio Content */}
          <div className="md:col-span-8 space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-extrabold text-ink tracking-tight">
                Shubham Pokale
              </h2>
              <p className="text-xs md:text-sm font-bold text-ink/60 uppercase tracking-wider mt-1">
                Developer | AI/ML Enthusiast | Problem Solver
              </p>
            </div>

            <p className="text-sm md:text-base text-ink/80 leading-relaxed font-medium">
              Pedyssey is built with passion to make document understanding simple, smart, and private. I believe in building tools that empower people to learn, research, and grow.
            </p>

            <p className="text-xs md:text-sm text-ink/75 font-semibold">
              Let's build the future together.
            </p>
          </div>
        </div>
      </section>

      {/* Social Links List */}
      <section className="max-w-2xl mx-auto space-y-3 mb-24">
        <h3 className="text-xl font-bold text-ink text-center mb-6">
          Connect & Follow
        </h3>
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-pill border-1.5 border-ink bg-card-cream hover:bg-lime transition-all duration-200 shadow-card-subtle group hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5 pl-2">
              <div className="p-2 rounded-full bg-white border border-ink">
                {link.icon}
              </div>
              <div>
                <span className="text-xs font-bold text-ink block">{link.name}</span>
                <span className="text-[11px] text-ink/70 font-medium">{link.handle}</span>
              </div>
            </div>
            <div className="pr-3 text-ink group-hover:translate-x-1 transition-transform">
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </a>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center my-12">
        <PillButton to="/contact" variant="primary" size="lg" withArrow>
          GET IN TOUCH
        </PillButton>
      </section>
    </PageFrame>
  );
};
