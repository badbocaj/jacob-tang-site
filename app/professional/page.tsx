import ServiceRecord from "@/components/professional/ServiceRecord";

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL — the work history as a pilot's service record.
// An amber-phosphor terminal on the site's warm black: the cockpit's HUD
// language in the Archives' palette. One faint grid, one accent.
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfessionalPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-clip px-4 pb-16 pt-24 sm:px-8"
      style={{
        backgroundColor: "#0d0b09",
        backgroundImage:
          "linear-gradient(rgba(243,234,215,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(243,234,215,0.035) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <ServiceRecord />
    </main>
  );
}
