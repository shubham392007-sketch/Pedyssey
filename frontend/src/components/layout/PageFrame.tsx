import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageFrameProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const PageFrame: React.FC<PageFrameProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-moonwood-gradient text-ink selection:bg-lime selection:text-ink">
      <Navbar />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};
