import type { Metadata } from "next";

// The page itself is a client component, so its tab title lives here.
export const metadata: Metadata = {
  title: "Movies — Jacob Tang",
  description: "Movie reviews and opinions nobody asked for.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
