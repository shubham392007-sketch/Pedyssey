import React from 'react';

interface VerificationWidgetProps {
  verdict: 'SUPPORTED' | 'PARTIALLY SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT EVIDENCE';
}

export const VerificationWidget: React.FC<VerificationWidgetProps> = ({ verdict }) => {
  let badgeBg = "bg-lime";
  let badgeText = "text-ink";
  let verdictIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-ink">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  if (verdict === 'SUPPORTED') {
    badgeBg = "bg-lime";
    badgeText = "text-ink";
  } else if (verdict === 'PARTIALLY SUPPORTED') {
    badgeBg = "bg-[#FFE082]";
    badgeText = "text-ink";
    verdictIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-ink">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  } else if (verdict === 'CONTRADICTED') {
    badgeBg = "bg-[#FF8A80]";
    badgeText = "text-ink";
    verdictIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-ink">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  } else {
    badgeBg = "bg-[#E0E0E0]";
    badgeText = "text-ink/80";
    verdictIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-ink">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }

  return (
    <div className="my-2.5 p-3 md:p-3.5 rounded-[16px] bg-white border-2 border-ink shadow-[2px_2px_0px_#1C1C1C] flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-cream border-1.5 border-ink flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 text-ink">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 block leading-none">
            Document Claim Verification
          </span>
          <span className="text-xs font-bold text-ink">
            Ground-Truth Audit
          </span>
        </div>
      </div>

      <div className={`px-3.5 py-1.5 rounded-full border-1.5 border-ink ${badgeBg} ${badgeText} text-xs font-black uppercase tracking-wider shadow-[1px_1px_0px_#1C1C1C] flex items-center gap-1.5`}>
        {verdictIcon}
        <span>{verdict}</span>
      </div>
    </div>
  );
};
