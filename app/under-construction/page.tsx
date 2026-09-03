import type { Metadata } from "next";

import { UnderConstruction } from "@/components/UnderConstruction";
import { sectionLabel } from "@/lib/construction";

export const metadata: Metadata = {
  title: "Under Construction — Jacob Tang",
  description: "This section is sealed while it is being built.",
  // Sealed sections are rewritten here, so this page answers on their URLs.
  // Keeping it out of the index stops /movies being cached as a dead channel.
  robots: { index: false, follow: false },
};

export default async function UnderConstructionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  // `from` is set by the middleware rewrite; the visitor never sees it.
  const { from } = await searchParams;
  return <UnderConstruction section={sectionLabel(from ?? "")} />;
}
