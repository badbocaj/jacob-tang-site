import type { Metadata } from "next";

// The page itself is a client component, so its tab title lives here.
export const metadata: Metadata = {
  title: "Travel — Jacob Tang",
  description: "A travel log of trips, people, and the weird details that stuck.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
