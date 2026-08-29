import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'md', to = "/" }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl md:text-5xl',
    xl: 'text-5xl md:text-6xl',
  };

  const content = (
    <div className={`inline-flex items-baseline font-bold text-ink select-none tracking-tight ${sizeClasses[size]} ${className}`}>
      <span className="font-script text-[1.25em] font-normal leading-none -mr-0.5">Ped</span>
      <span className="font-sans font-bold tracking-tight">yssey</span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
