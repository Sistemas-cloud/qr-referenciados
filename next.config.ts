import type { NextConfig } from "next";

// 2026-09-09: Evitar HTML/JS viejo en caché (usuarios veían UI púrpura antigua).
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
