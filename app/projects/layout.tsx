import type { Metadata } from "next";

// The page itself is a client component, so its tab title lives here.
export const metadata: Metadata = {
  title: "Projects — Jacob Tang",
  description: "The Lab: hardware projects in liquid propulsion, human-powered flight, and test stands.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
