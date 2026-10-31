import type { Metadata } from "next";

// The page itself is a client component, so its tab title lives here.
export const metadata: Metadata = {
  title: "Personalized — Jacob Tang",
  description: "Restricted access terminal. Identify yourself.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
