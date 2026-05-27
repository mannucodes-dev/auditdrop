import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack and reactCompiler disabled — both are extremely RAM-heavy
  // on machines with 8GB RAM and will cause system freezes during dev.
  // Re-enable only when deploying to a machine with 16GB+ RAM.

  // Keep firebase-admin out of the client bundle — it uses native Node modules
  // (gRPC) that are incompatible with the browser. Without this, the bundler
  // tries to polyfill ~200+ Node.js built-ins and consumes gigabytes of RAM.
  serverExternalPackages: ['firebase-admin'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;

