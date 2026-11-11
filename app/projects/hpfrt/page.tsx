import type { Metadata } from "next";

import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { BendingMoment } from "@/components/casestudy/hpfrt/BendingMoment";
import { HPFRT } from "@/components/casestudy/hpfrt/data";

export const metadata: Metadata = {
  title: "Human-powered flight — Jacob Tang",
  description: HPFRT.summary,
};

/* The words live in components/casestudy/hpfrt/data.ts. */
export default function HpfrtPage() {
  return <CaseStudy data={HPFRT} signature={<BendingMoment />} />;
}
