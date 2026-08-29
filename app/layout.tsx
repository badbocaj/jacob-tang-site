import "./globals.css";
import type { Metadata } from "next";
import { Archivo, Public_Sans, IBM_Plex_Mono, Caveat } from "next/font/google";
import { Navbar } from "@/components/Navbar";

/* ── Type system ───────────────────────────────────────────────────────────
   display — Archivo, width axis pushed wide for the aerospace-nameplate feel
   body    — Public Sans, the readable prose face the site was missing
   mono    — IBM Plex Mono, the technical/HUD utility face
   hand    — Caveat, the human annotation layer (was stranded on /travel)
   ------------------------------------------------------------------------ */

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--ff-display",
  display: "swap",
});

const body = Public_Sans({
  subsets: ["latin"],
  variable: "--ff-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--ff-mono",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  variable: "--ff-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jacob Tang",
  description: "Mechanical engineering portfolio — structures, testing, propulsion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} ${hand.variable}`}
    >
      <body className="bg-black text-white antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
