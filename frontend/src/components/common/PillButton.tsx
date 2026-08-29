import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './SvgIcons';

interface PillButtonProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'dark' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  children,
  to,
  onClick,
  variant = 'primary',
  size = 'md',
  withArrow = false,
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const variantStyles = {
    primary: 'bg-cta hover:bg-cta-hover text-ink border-1.5 border-ink shadow-editorial hover:shadow-editorial-hover',
    secondary: 'bg-transparent hover:bg-cream/50 text-ink border-1.5 border-ink',
    dark: 'bg-ink hover:bg-ink-light text-cream border-1.5 border-ink',
    lime: 'bg-lime hover:bg-lime-400 text-ink border-1.5 border-ink shadow-editorial',
  };

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs font-semibold tracking-wide uppercase',
    md: 'px-6 py-2.5 text-xs md:text-sm font-bold tracking-wide uppercase',
    lg: 'px-8 py-3.5 text-sm md:text-base font-bold tracking-wide uppercase',
  };

  const baseStyles = `inline-flex items-center justify-center gap-2 rounded-pill transition-all duration-200 active:translate-y-0.5 hover:-translate-y-0.5 select-none disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseStyles}>
        <span>{children}</span>
        {withArrow && <ArrowRightIcon className="w-3.5 h-3.5" />}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseStyles}>
      <span>{children}</span>
      {withArrow && <ArrowRightIcon className="w-3.5 h-3.5" />}
    </button>
  );
};
