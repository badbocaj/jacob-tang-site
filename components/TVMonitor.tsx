"use client";

export const TVMonitor = () => {
  return (
    // Changed to 'relative' and removed the 'max-w-md' limits. 
    // It will now expand to fill the right side of the screen up to a massive 5xl size.
    <div className="relative z-0 w-full max-w-5xl aspect-[4/3] flex items-center justify-center p-8 md:p-12 lg:p-16 bg-[#111] rounded-3xl border-4 border-[#222] shadow-[0_0_50px_rgba(255,255,255,0.05)] select-none">
      
      {/* 1. Dimensional TV Casing & Details */}
      <div className="absolute inset-4 md:inset-6 bg-[#080808] rounded-2xl border border-[#333] shadow-inner flex items-center justify-center">
        
        {/* Vents / Grilles */}
        <div className="absolute top-6 left-10 right-10 h-6 grid grid-cols-12 gap-2 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white h-full rounded-full" />
          ))}
        </div>

        {/* Dials & Knobs (Scaled up for the larger TV) */}
        <div className="absolute -left-6 md:-left-8 top-1/2 -translate-y-1/2 h-64 w-12 md:w-16 flex flex-col gap-8 items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1A1A1A] border-4 border-[#333] shadow-lg flex items-center justify-center">
            <div className="w-1.5 md:w-2 h-8 md:h-10 bg-amber-600 rounded-full rotate-45" />
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1A1A1A] border-2 border-[#333] shadow-lg" />
        </div>

        {/* 2. THE BRANDED SCREEN */}
        <div className="relative w-[90%] h-[85%] rounded-xl overflow-hidden border border-[#1A1A1A] bg-black shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          
          {/* Scanlines */}
          <div className="absolute inset-0 z-10 opacity-5 bg-[linear-gradient(0deg,rgba(0,0,0,0)_50%,rgba(255,255,255,0.1)_50%)] bg-[size:100%_4px]" />

          {/* Glowing TVA logo (Scaled up for the larger screen) */}
          <div className="absolute inset-0 flex items-center justify-center scale-90 lg:scale-110">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[400px] fill-amber-500/80 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
              <circle cx="100" cy="100" r="95" fill="none" strokeWidth="2" strokeDasharray="5 5" className="opacity-30" />
              <path d="M100 5 C 100 5, 10 50, 10 100 C 10 150, 100 195, 100 195 C 100 195, 190 150, 190 100 C 190 50, 100 5, 100 5" fill="none" strokeWidth="1.5" />
              <text x="100" y="85" textAnchor="middle" className="text-[14px] font-bold uppercase tracking-[0.4em]">TEMPORAL VARIANCE</text>
              <text x="100" y="105" textAnchor="middle" className="text-[18px] font-bold uppercase tracking-[0.2em] font-serif italic">AUTHORITY</text>
              <path d="M50 120 Q 100 160, 150 120" fill="none" strokeWidth="2" strokeLinecap="round" className="opacity-60"/>
              <text x="100" y="145" textAnchor="middle" className="text-[36px] font-bold uppercase tracking-[-0.05em] font-mono opacity-90">TVA</text>
            </svg>
          </div>
        </div>

        {/* Branding badge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 md:w-32 h-6 md:h-8 bg-[#1A1A1A] border border-[#333] rounded flex items-center justify-center">
          <span className="text-[9px] md:text-xs font-mono text-[#444] tracking-widest uppercase">LOG // 01</span>
        </div>

      </div>
    </div>
  );
};