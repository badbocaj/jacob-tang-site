// Server component — shown by Next.js App Router while the client bundle loads.
// Matches Phase 1 of CockpitIntro so there is no jarring flash.

export default function AboutLoading() {
  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Static rocket SVG — same proportions as RocketSketch in CockpitIntro */}
      <svg
        viewBox="0 0 200 280"
        className="w-48 h-64"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.6 }}
      >
        <rect x="70" y="90" width="60" height="110" />
        <path d="M70 90 L100 30 L130 90" />
        <path d="M70 160 L40 210 L70 200" />
        <path d="M130 160 L160 210 L130 200" />
        <circle cx="100" cy="120" r="14" />
        <line x1="82" y1="200" x2="78" y2="230" />
        <line x1="100" y1="200" x2="100" y2="240" />
        <line x1="118" y1="200" x2="122" y2="230" />
      </svg>

      <p
        className="font-mono text-[10px] text-slate-600 tracking-[0.3em] uppercase mt-6"
        style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
      >
        initializing...
      </p>
    </div>
  );
}
