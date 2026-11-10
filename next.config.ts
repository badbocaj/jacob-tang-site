import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The cockpit is retired. Old links land on the front door.
  async redirects() {
    return [{ source: "/cockpit", destination: "/", permanent: false }];
  },
  experimental: {
    // Avast/AV SSL scanning re-signs TLS with a local root cert that Turbopack's
    // bundled cert store doesn't trust, which breaks next/font Google fetches.
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
