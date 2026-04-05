// Minimal Suspense fallback — shows for the brief moment before the JS bundle
// hydrates. Black background matches SingularityGate's opening frame so there
// is no visible flash between this and the animation taking over.
export default function ProfessionalLoading() {
  return <div className="fixed inset-0 z-[60] bg-black" />;
}
