import React from 'react';

/**
 * Large Organic SVG Blob Illustration for Hero Section
 * Replaces any photographs with rich vector document art, magnifying glass,
 * floating page layers, and AI spark nodes.
 */
export const HeroBlobIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-[440px] aspect-square" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Organic Blob Shape */}
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full drop-shadow-2xl animate-blob"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DFE968" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#F6BB84" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="goldLens" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBF1CF" />
            <stop offset="50%" stopColor="#F6BB84" />
            <stop offset="100%" stopColor="#DFE968" />
          </linearGradient>
        </defs>

        {/* Organic Blob Path */}
        <path 
          d="M410,130 C470,200 480,310 430,390 C380,470 270,490 170,460 C70,430 20,340 30,240 C40,140 120,60 220,35 C320,10 350,60 410,130 Z" 
          fill="url(#blobGrad)"
        />

        {/* Ambient Glow */}
        <circle cx="280" cy="220" r="140" fill="url(#sparkGlow)" />

        {/* Stacked PDF Document Sheets */}
        <g transform="translate(140, 180) rotate(-6)">
          {/* Back page */}
          <rect x="15" y="-15" width="150" height="190" rx="12" fill="#F6C8D6" opacity="0.4" stroke="#DFE968" strokeWidth="1.5" />
          {/* Middle page */}
          <rect x="8" y="-8" width="150" height="190" rx="12" fill="#FBF1CF" opacity="0.7" stroke="#1C1C1C" strokeWidth="1.5" />
          {/* Front page */}
          <rect x="0" y="0" width="150" height="190" rx="12" fill="#FBF6DF" stroke="#1C1C1C" strokeWidth="2" />
          
          {/* Document Header Badge */}
          <rect x="16" y="18" width="45" height="14" rx="7" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1" />
          <text x="25" y="29" fontSize="8" fontWeight="700" fill="#1C1C1C" fontFamily="Poppins">PDF</text>
          
          {/* Text Skeleton Lines */}
          <line x1="16" y1="46" x2="134" y2="46" stroke="#1C1C1C" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="16" y1="62" x2="120" y2="62" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="16" y1="76" x2="130" y2="76" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="16" y1="90" x2="105" y2="90" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="16" y1="104" x2="128" y2="104" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="16" y1="118" x2="90" y2="118" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          
          {/* Citation Tag on Page */}
          <rect x="16" y="142" width="76" height="22" rx="11" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1.5" />
          <text x="26" y="156" fontSize="9" fontWeight="600" fill="#1C1C1C" fontFamily="Poppins">Page 18 · Qwen3</text>
        </g>

        {/* Magnifying Glass Over Knowledge */}
        <g transform="translate(250, 190) rotate(22)">
          {/* Glass Rim */}
          <circle cx="50" cy="50" r="46" stroke="url(#goldLens)" strokeWidth="6" fill="#FBF1CF" fillOpacity="0.15" />
          <circle cx="50" cy="50" r="42" stroke="#1C1C1C" strokeWidth="2" />
          
          {/* Glass Reflection Arc */}
          <path d="M 22 40 A 34 34 0 0 1 65 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          
          {/* Handle */}
          <path d="M85 85 L145 145" stroke="#DFE968" strokeWidth="12" strokeLinecap="round" />
          <path d="M85 85 L145 145" stroke="#1C1C1C" strokeWidth="4" strokeLinecap="round" />
          <circle cx="145" cy="145" r="4" fill="#F6BB84" />
        </g>

        {/* Orbiting Sparkles and AI Neural Nodes */}
        <g transform="translate(320, 80)">
          <polygon points="15,0 19,10 30,15 19,20 15,30 11,20 0,15 11,10" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1" />
        </g>
        <g transform="translate(80, 180)">
          <polygon points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7" fill="#F6C8D6" stroke="#1C1C1C" strokeWidth="1" />
        </g>
        <g transform="translate(370, 360)">
          <polygon points="12,0 15,8 24,12 15,16 12,24 9,16 0,12 9,8" fill="#F6BB84" stroke="#1C1C1C" strokeWidth="1" />
        </g>

        {/* Neural Network Nodes */}
        <circle cx="100" cy="360" r="8" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1.5" />
        <circle cx="150" cy="400" r="6" fill="#F6BB84" stroke="#1C1C1C" strokeWidth="1.5" />
        <circle cx="70" cy="420" r="5" fill="#FBF1CF" stroke="#1C1C1C" strokeWidth="1.5" />
        <line x1="100" y1="360" x2="150" y2="400" stroke="#DFE968" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="100" y1="360" x2="70" y2="420" stroke="#DFE968" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    </div>
  );
};

/**
 * Card 1: PDF Intelligence SVG
 */
export const PdfIntelligenceIllustration: React.FC = () => (
  <svg viewBox="0 0 200 160" className="w-full h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="15" width="110" height="130" rx="14" fill="#FBF6DF" stroke="#1C1C1C" strokeWidth="1.5" />
    <rect x="38" y="30" width="38" height="14" rx="7" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1" />
    <text x="47" y="41" fontSize="8" fontWeight="700" fill="#1C1C1C" fontFamily="Poppins">PDF</text>
    
    <line x1="38" y1="58" x2="118" y2="58" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="72" x2="105" y2="72" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="38" y1="84" x2="114" y2="84" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="38" y1="96" x2="85" y2="96" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    
    {/* Floating Smart Mini Card */}
    <g transform="translate(100, 65)">
      <rect x="0" y="0" width="75" height="75" rx="12" fill="#F6C8D6" stroke="#1C1C1C" strokeWidth="1.5" />
      <circle cx="37" cy="30" r="16" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1.5" />
      <path d="M37 20v20M27 30h20" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="15" y="52" width="45" height="10" rx="5" fill="#FBF1CF" stroke="#1C1C1C" strokeWidth="1" />
      <text x="22" y="60" fontSize="6" fontWeight="700" fill="#1C1C1C" fontFamily="Poppins">EXTRACT</text>
    </g>
  </svg>
);

/**
 * Card 2: Ask & Analyze SVG
 */
export const AskAnalyzeIllustration: React.FC = () => (
  <svg viewBox="0 0 200 160" className="w-full h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Question Bubble */}
    <g transform="translate(30, 20)">
      <rect x="0" y="0" width="80" height="55" rx="16" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1.5" />
      <path d="M20 55 L20 68 L36 55 Z" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1.5" />
      <text x="32" y="38" fontSize="28" fontWeight="800" fill="#1C1C1C" fontFamily="Poppins">?</text>
    </g>

    {/* Answer Bubble with Qwen3 node */}
    <g transform="translate(85, 65)">
      <rect x="0" y="0" width="95" height="65" rx="16" fill="#F6BB84" stroke="#1C1C1C" strokeWidth="1.5" />
      <path d="M75 65 L75 78 L60 65 Z" fill="#F6BB84" stroke="#1C1C1C" strokeWidth="1.5" />
      <line x1="18" y1="22" x2="78" y2="22" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="34" x2="68" y2="34" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <rect x="18" y="44" width="55" height="12" rx="6" fill="#FBF1CF" stroke="#1C1C1C" strokeWidth="1" />
      <text x="24" y="53" fontSize="7" fontWeight="700" fill="#1C1C1C" fontFamily="Poppins">QWEN3 8B ✓</text>
    </g>
  </svg>
);

/**
 * Card 3: Insights & More SVG
 */
export const InsightsMoreIllustration: React.FC = () => (
  <svg viewBox="0 0 200 160" className="w-full h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="20" width="150" height="120" rx="16" fill="#1C1C1C" stroke="#1C1C1C" strokeWidth="1.5" />
    
    {/* Knowledge Graph Lines */}
    <line x1="60" y1="50" x2="100" y2="90" stroke="#DFE968" strokeWidth="2" />
    <line x1="100" y1="90" x2="150" y2="60" stroke="#F6C8D6" strokeWidth="2" />
    <line x1="100" y1="90" x2="80" y2="120" stroke="#F6BB84" strokeWidth="2" />
    <line x1="100" y1="90" x2="140" y2="115" stroke="#DFE968" strokeWidth="2" />

    {/* Nodes */}
    <circle cx="60" cy="50" r="14" fill="#DFE968" stroke="#FFFFFF" strokeWidth="1.5" />
    <text x="54" y="54" fontSize="11" fontWeight="800" fill="#1C1C1C">01</text>
    
    <circle cx="100" cy="90" r="18" fill="#F6BB84" stroke="#FFFFFF" strokeWidth="1.5" />
    <text x="92" y="95" fontSize="13" fontWeight="800" fill="#1C1C1C">AI</text>

    <circle cx="150" cy="60" r="12" fill="#F6C8D6" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="80" cy="120" r="10" fill="#FBF1CF" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="140" cy="115" r="10" fill="#DFE968" stroke="#FFFFFF" strokeWidth="1.5" />
  </svg>
);

/**
 * RAG Architecture Pipeline SVG Diagram
 */
export const RagPipelineDiagram: React.FC = () => {
  const steps = [
    { label: "PDF Upload", sub: "Multi-page extraction", color: "#FBF6DF" },
    { label: "Smart Chunking", sub: "Token preservation", color: "#F6C8D6" },
    { label: "Embeddings", sub: "all-MiniLM-L6-v2", color: "#FBF1CF" },
    { label: "Hybrid Search", sub: "FAISS + BM25", color: "#DFE968" },
    { label: "Reranking", sub: "Cross-Encoder", color: "#F6BB84" },
    { label: "Qwen3 8B", sub: "Local inference", color: "#DFE968" },
    { label: "Grounded Answer", sub: "Traceable citations", color: "#FBF6DF" },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 py-6 overflow-x-auto">
      {steps.map((s, idx) => (
        <React.Fragment key={s.label}>
          <div 
            className="flex flex-col items-center justify-center p-4 rounded-2xl border-1.5 border-ink min-w-[130px] text-center shadow-editorial transition-transform hover:-translate-y-1"
            style={{ backgroundColor: s.color }}
          >
            <span className="text-[11px] font-bold text-ink/60 uppercase tracking-wider mb-1">0{idx + 1}</span>
            <span className="text-sm font-bold text-ink">{s.label}</span>
            <span className="text-[11px] text-ink/75 font-medium mt-0.5">{s.sub}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className="text-ink font-black text-lg rotate-90 md:rotate-0 select-none">→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Local AI Laptop SVG Illustration
 */
export const LocalLaptopIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-sm" }) => (
  <svg viewBox="0 0 320 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Screen Frame */}
    <rect x="40" y="20" width="240" height="150" rx="14" fill="#1C1C1C" stroke="#1C1C1C" strokeWidth="2" />
    <rect x="52" y="32" width="216" height="126" rx="8" fill="#FBF6DF" />
    
    {/* Screen Content: RAG local workflow */}
    <rect x="66" y="44" width="70" height="42" rx="6" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1" />
    <text x="74" y="60" fontSize="8" fontWeight="700" fill="#1C1C1C">LOCAL RAG</text>
    <text x="74" y="74" fontSize="7" fill="#1C1C1C">FAISS + BM25</text>
    
    <rect x="146" y="44" width="70" height="42" rx="6" fill="#F6BB84" stroke="#1C1C1C" strokeWidth="1" />
    <text x="154" y="60" fontSize="8" fontWeight="700" fill="#1C1C1C">QWEN3 8B</text>
    <text x="154" y="74" fontSize="7" fill="#1C1C1C">Ollama Engine</text>

    {/* Verification Badge */}
    <rect x="66" y="98" width="150" height="46" rx="8" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="1" />
    <text x="76" y="116" fontSize="9" fontWeight="700" fill="#1C1C1C">100% PRIVATE & OFFLINE</text>
    <text x="76" y="132" fontSize="8" fill="#557A50" fontWeight="600">✓ No cloud API calls</text>

    {/* Laptop Base */}
    <path d="M10 170 L310 170 C315 170 318 174 316 178 L300 195 C298 198 294 200 290 200 L30 200 C26 200 22 198 20 195 L4 178 C2 174 5 170 10 170 Z" fill="#F6C8D6" stroke="#1C1C1C" strokeWidth="2" />
    <rect x="130" y="174" width="60" height="6" rx="3" fill="#1C1C1C" />
  </svg>
);

/**
 * Developer Profile Badge SVG Illustration (Shubham Pokale)
 * Pure SVG avatar badge with code & neural matrix (NO RASTER PHOTOS)
 */
export const DeveloperIllustration: React.FC<{ className?: string }> = ({ className = "w-48 h-48" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="devGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DFE968" />
        <stop offset="50%" stopColor="#F6BB84" />
        <stop offset="100%" stopColor="#F6C8D6" />
      </linearGradient>
    </defs>
    {/* Oval Avatar Outer Border */}
    <ellipse cx="100" cy="100" rx="85" ry="92" fill="url(#devGrad)" stroke="#1C1C1C" strokeWidth="2.5" />
    
    {/* Inner Dark Background */}
    <ellipse cx="100" cy="100" rx="76" ry="82" fill="#1C1C1C" />
    
    {/* Developer Code & Brain Graphic */}
    <g transform="translate(50, 42)">
      {/* Code bracket symbol */}
      <path d="M25 20 L10 35 L25 50" stroke="#DFE968" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M75 20 L90 35 L75 50" stroke="#DFE968" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="58" y1="15" x2="42" y2="55" stroke="#F6BB84" strokeWidth="3" strokeLinecap="round" />
      
      {/* AI / RAG Core Matrix */}
      <rect x="25" y="66" width="50" height="28" rx="8" fill="#FBF6DF" stroke="#DFE968" strokeWidth="1.5" />
      <text x="35" y="84" fontSize="11" fontWeight="800" fill="#1C1C1C" fontFamily="Poppins">AI·RAG</text>
    </g>
    
    {/* Floating orbiting dots */}
    <circle cx="35" cy="70" r="5" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1" />
    <circle cx="165" cy="130" r="6" fill="#F6C8D6" stroke="#1C1C1C" strokeWidth="1" />
    <circle cx="140" cy="40" r="4" fill="#FBF1CF" stroke="#1C1C1C" strokeWidth="1" />
  </svg>
);

/**
 * 404 Floating Document Illustration
 */
export const NotFoundIllustration: React.FC<{ className?: string }> = ({ className = "w-64 h-64" }) => (
  <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(60, 40) rotate(15)">
      <rect x="0" y="0" width="110" height="140" rx="14" fill="#FBF6DF" stroke="#1C1C1C" strokeWidth="2" />
      <rect x="15" y="20" width="30" height="12" rx="6" fill="#F6C8D6" stroke="#1C1C1C" strokeWidth="1" />
      <text x="21" y="29" fontSize="8" fontWeight="700" fill="#1C1C1C">404</text>
      
      <line x1="15" y1="46" x2="95" y2="46" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="15" y1="60" x2="80" y2="60" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="15" y1="74" x2="90" y2="74" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      
      <circle cx="55" cy="105" r="16" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1.5" />
      <path d="M48 105 L62 105" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" />
    </g>
    {/* Floating clouds/stars */}
    <g transform="translate(30, 160)">
      <polygon points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7" fill="#DFE968" stroke="#1C1C1C" strokeWidth="1" />
    </g>
    <g transform="translate(190, 80)">
      <polygon points="8,0 10,6 16,8 10,10 8,16 6,10 0,8 6,6" fill="#F6BB84" stroke="#1C1C1C" strokeWidth="1" />
    </g>
  </svg>
);
