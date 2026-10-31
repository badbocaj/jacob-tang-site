import type { Metadata } from "next";

// The page itself is a client component, so its tab title lives here.
export const metadata: Metadata = {
  title: "Professional — Jacob Tang",
  description: "Work history, drawn as a comic: research, internships, and the hardware in between.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
