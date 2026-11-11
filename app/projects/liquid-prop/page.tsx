import type { Metadata } from "next";

import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { FlowCoefficient } from "@/components/casestudy/lpl/FlowCoefficient";
import { LPL } from "@/components/casestudy/lpl/data";

export const metadata: Metadata = {
  title: "Water flow test stand — Jacob Tang",
  description: LPL.summary,
};

/* The words live in components/casestudy/lpl/data.ts. */
export default function LiquidPropPage() {
  return <CaseStudy data={LPL} signature={<FlowCoefficient />} />;
}
