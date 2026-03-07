"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Particles from "@/components/particles";

interface Hotspot {
  id: string;
  title: string;
  content: string;
  top: string; 
  left: string;
  width: string;
  height: string;
}

// YOUR EXACT COORDINATES - Untouched and saved!
const HOTSPOTS: Hotspot[] = [
  { id: "globe", title: "Travel", content: "Coordinates and logs from traversing different environments.", top: "39%", left: "40.5%", width: "6%", height: "8%" },
  { id: "printer", title: "Projects", content: "My physical and digital builds. Turning theoretical logic into tangible systems.", top: "40%", left: "47%", width: "6%", height: "7%" },
  { id: "football", title: "Sports Obsessions", content: "The mechanics of the game. Analyzing strategy and team dynamics.", top: "81.5%", left: "44.5%", width: "8%", height: "6%" },
  { id: "shirt", title: "Profession", content: "My formal career history, roles, and the systems I have optimized.", top: "64%", left: "27%", width: "12%", height: "8%" },
  { id: "books", title: "Media", content: "Literature, cinematic analysis, and the intake of information.", top: "22%", left: "45%", width: "6%", height: "7%" },
  { id: "cards", title: "Strategic Statistics", content: "Probability and decision-making under uncertainty.", top: "43%", left: "36.5%", width: "5%", height: "4%" },
  { id: "trophy", title: "Proudest Moments", content: "Milestones achieved through persistent effort.", top: "19%", left: "40%", width: "4%", height: "7%" }
];

export default function AboutPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const activeData = HOTSPOTS.find((h) => h.id === activeModal);

  return (
    // Main container
    <main className="relative h-screen w-screen overflow-hidden bg-black flex items-center justify-center">
      
      {/* 1. THE COSMOS BACKGROUND (z-0) */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#ffffff", "#cccccc", "#888888"]}
          particleCount={400} 
          particleSpread={15}
          speed={0.05} 
          particleBaseSize={60}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* 2. Back Button - Floating Top Left (z-30) */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-30 text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md px-5 py-2 rounded-full border border-white/10"
      >
        ← EXIT_ROOM
      </Link>

      {/* 3. IMAGE WRAPPER (z-10 so it sits over the stars) */}
      <div className="relative z-10 w-full max-w-[100vw] max-h-screen aspect-[16/9] md:aspect-auto md:h-full md:w-auto">
        <div className="relative h-full w-full flex items-center justify-center">
          <Image 
            src="/about.png" 
            alt="Interactive Room" 
            width={1920} 
            height={1080}
            priority
            className="h-full w-auto object-contain select-none shadow-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          />

          {/* HOTSPOTS CONTAINER */}
          <div className="absolute inset-0 m-auto h-full w-auto aspect-[16/9]">
            {HOTSPOTS.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() => setActiveModal(hotspot.id)}
                style={{
                  top: hotspot.top,
                  left: hotspot.left,
                  width: hotspot.width,
                  height: hotspot.height,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-all duration-300 bg-white/0 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] z-10 border border-transparent hover:border-white/20"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. MODAL OVERLAY (z-50) */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
          activeModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setActiveModal(null)}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`relative w-[90%] max-w-sm bg-white text-black p-10 rounded-2xl shadow-2xl transform transition-all duration-500 ${
            activeModal ? "scale-100 translate-y-0" : "scale-90 translate-y-10"
          }`}
        >
          <button 
            onClick={() => setActiveModal(null)}
            className="absolute top-6 right-6 text-zinc-300 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {activeData && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-4">
                {activeData.title}
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed font-light">
                {activeData.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}