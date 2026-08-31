// Server component — held up while the cockpit client bundle streams in.
// Deliberately matches the dormant flight deck so there is no flash of a
// different design before the real scene mounts.

export default function CockpitLoading() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#01030a 0%,#030815 38%,#071227 66%,#0d2038 86%,#14304a 100%)",
          opacity: 0.5,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 46%, transparent 42%, rgba(0,0,0,0.6) 78%, rgba(0,0,0,0.94) 100%)",
        }}
      />
      <p className="cockpit-prompt relative m-0 font-mono text-xs uppercase tracking-label text-cyan-300/40">
        FLIGHT DECK :: SPOOLING UP
      </p>
    </div>
  );
}
