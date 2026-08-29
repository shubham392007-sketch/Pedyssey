import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Logo } from '../common/Logo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only the most critical navigation links in the header
  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'FEATURES', path: '/features' },
    { label: 'HOW IT WORKS', path: '/how-it-works' },
    { label: 'ABOUT', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6EB]/85 backdrop-blur-xl border-b-2 border-ink shadow-xs transition-all">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Logo size="md" to="/" />

        {/* Center: Essential Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-xs font-black tracking-wider uppercase transition-all duration-150 py-1 ${
                  isActive
                    ? 'text-ink border-b-2 border-ink'
                    : 'text-ink/75 hover:text-ink hover:underline'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Primary Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/pedup"
            className="inline-flex items-center gap-2 bg-ink text-cream text-xs font-black tracking-wider uppercase px-4 py-2 rounded-full border border-ink shadow-[2px_2px_0px_#1C1C1C] hover:shadow-[3px_3px_0px_#1C1C1C] hover:bg-ink/90 transition-all duration-150 transform hover:-translate-y-0.5"
          >
            <span>LAUNCH PEDUP</span>
            <span className="text-lime font-black text-sm">→</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-ink hover:bg-lime-400 rounded-lg transition-colors border border-ink"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-lime border-t border-ink px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block text-xs font-bold tracking-wider uppercase py-2 px-3 rounded-lg transition-colors ${
                  isActive ? 'bg-ink text-cream' : 'text-ink hover:bg-lime-400'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-ink/20">
            <Link
              to="/pedup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between bg-ink text-cream text-xs font-bold tracking-wider uppercase py-2.5 px-4 rounded-full shadow-sm"
            >
              <span>LAUNCH PEDUP WORKSPACE</span>
              <span className="text-lime font-bold">→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
