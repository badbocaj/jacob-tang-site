import type { Metadata } from "next";

// The page itself is a client component, so its tab title lives here.
export const metadata: Metadata = {
  title: "Funny — Jacob Tang",
  description: "Things that made me laugh.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
