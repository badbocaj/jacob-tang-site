// app/travel/TravelClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { TVMonitor } from "@/components/TVMonitor";

export default function TravelClient({ items }: { items: any[] }) {
  const [activeEntry, setActiveEntry] = useState<any | null>(null);

  return ( 
    <>
      {/* GLOBAL NAV (Hides on this page as per layout logic) */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 h-16 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="text-sm font-bold tracking-[0.2em] text-white">
          <Link href="/">JACOB TANG</Link>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-white border border-white/20 px-3 py-1 rounded-full bg-black/50">
          EXIT_LOG // 02
        </div>
      </div>

      {/* MAIN SCENE CONTAINER */}
      <div className="relative z-10 w-full h-full max-w-[100vw] pt-32 pb-16 flex items-center justify-center gap-12 lg:gap-16">
        
        {/* LEFT 1/3: TIMELINE SCROLL AREA */}
        <div className="w-full h-full md:w-1/2 lg:w-1/3 overflow-y-auto pr-8 relative z-20">
          
          {/* Background TVA timeline line */}
          <div className="absolute left-[39px] md:left-[55px] top-4 bottom-0 w-[2px] bg-gradient-to-b from-amber-500 via-amber-900/40 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.5)] z-10" />

          {/* Timeline header */}
          <div className="pl-12 md:pl-24 mb-20 relative z-20">
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              TRAVEL LOGS
            </h1>
            <div className="h-[1px] w-full bg-gradient-to-r from-amber-500/50 to-transparent mt-6" />
            <p className="font-mono text-xs text-amber-500 uppercase tracking-[0.3em] mt-4 opacity-70">
              SYS.ARCHIVE // Temporal Data
            </p>
          </div>

          <div className="flex flex-col gap-32 pb-32">
            {items.map((item) => (
              <div 
                key={item.slug} 
                className="relative pl-12 md:pl-24 group cursor-pointer"
                onClick={() => setActiveEntry(item)}
              >
                {/* Timeline node dot */}
                <div className="absolute left-9 md:left-[51px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-amber-500 bg-black group-hover:bg-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.8)] transition-all duration-300 z-10" />

                <div className="w-full flex flex-col pt-0.5 relative z-20">
                  <span className="font-mono text-[10px] text-amber-500/80 tracking-widest uppercase mb-1.5">
                    {item.frontmatter.date} // {item.frontmatter.location || 'LOGGED_DATA'}
                  </span>
                  <h2 className="text-xl font-bold uppercase text-white tracking-tight mb-5 group-hover:text-amber-400 transition-colors">
                    {item.frontmatter.title}
                  </h2>
                  
                  <p className="font-serif italic text-base text-zinc-400 leading-relaxed max-w-sm">
                    "{item.frontmatter.summary || 'Data corrupted. Awaiting re-integration.'}"
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {item.tags.map((tag: any) => (
                      <span key={tag.slug} className="border border-white/10 bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[8px] uppercase font-mono text-zinc-400">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 2/3: THE FIXED TVA MONITOR */}
        {/* We place the TV here, absolutely locked to the right side */}
        <div className="hidden md:flex relative w-full h-full md:w-1/2 lg:w-2/3 items-center justify-center z-10 pr-12 lg:pr-24 pointer-events-none">
           {/* TVMonitor is imported from components/TVMonitor.tsx */}
          <TVMonitor />
        </div>
      </div>

      {/* IMMERSIVE MODAL OVERLAY (z-50) */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-500 ${
          activeEntry ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setActiveEntry(null)}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`relative w-[95%] h-[90vh] max-w-7xl bg-[#0a0a0a] border border-white/10 text-white p-8 md:p-12 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.1)] transform transition-all duration-500 flex flex-col overflow-hidden ${
            activeEntry ? "scale-100 translate-y-0" : "scale-90 translate-y-10"
          }`}
        >
          {/* Close Button */}
          <button 
            onClick={() => setActiveEntry(null)}
            className="absolute top-6 right-6 text-zinc-500 hover:text-amber-500 transition-colors z-50 flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
          >
            [X] Close Log
          </button>

          {activeEntry && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col md:flex-row gap-12 h-full overflow-y-auto pr-4 custom-scrollbar">
              
              {/* Modal Left: Content */}
              <div className="w-full md:w-1/3 pt-8">
                <p className="font-mono text-[10px] text-amber-500 tracking-widest uppercase mb-4">
                  {activeEntry.frontmatter.date} // {activeEntry.frontmatter.location || 'LOGGED_DATA'}
                </p>
                <h2 className="text-4xl font-bold uppercase tracking-tight mb-8 text-white">
                  {activeEntry.frontmatter.title}
                </h2>
                <div className="h-[1px] w-12 bg-amber-500/50 mb-8" />
                <p className="text-lg text-zinc-300 leading-relaxed font-serif italic mb-8">
                  {activeEntry.frontmatter.summary}
                </p>
                {/* Optional: Render full MDX content here if you want */}
              </div>
              
              {/* Modal Right: Image Grid */}
              <div className="w-full md:w-2/3 pt-8 flex flex-col gap-4">
                {/* Placeholder for now - this is where your 9-image grid goes! */}
                <div className="w-full aspect-video border border-white/5 bg-white/[0.02] rounded flex flex-col items-center justify-center font-mono text-xs text-zinc-600">
                  <span>AWAITING_VISUAL_DATA</span>
                  <span className="text-[10px] mt-2 opacity-50">Drop images into frontmatter to populate</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}