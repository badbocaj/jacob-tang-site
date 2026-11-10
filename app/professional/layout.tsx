import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional — Jacob Tang",
  description: "Work history as a service record: research, internships, and the hardware in between.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
