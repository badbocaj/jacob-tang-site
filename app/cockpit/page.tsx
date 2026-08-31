import type { Metadata } from "next";
import Cockpit from "@/components/Cockpit";

export const metadata: Metadata = {
  title: "Cockpit — Jacob Tang",
  description:
    "First-person flight deck over a rain-slicked city. Initialize the HUD to reach the archives.",
};

export default function CockpitPage() {
  return <Cockpit />;
}
