import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cada aplicação tem suas próprias dependências e lockfile no monorepo.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
      },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "objectstorage.sa-saopaulo-1.oraclecloud.com",
        port: "",
        pathname: "/n/grdi592jtydg/b/storage-app-financeiro/o/users/**",
      },
    ],
  },
};

export default nextConfig;
