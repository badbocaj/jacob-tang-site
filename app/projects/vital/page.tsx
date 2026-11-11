import type { Metadata } from "next";

import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { Margins } from "@/components/casestudy/vital/Margins";
import { VITAL } from "@/components/casestudy/vital/data";

export const metadata: Metadata = {
  title: "Pressurization drivetrain — Jacob Tang",
  description: VITAL.summary,
};

/* The words live in components/casestudy/vital/data.ts. */
export default function VitalPage() {
  return <CaseStudy data={VITAL} signature={<Margins />} />;
}
