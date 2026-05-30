import type { NextConfig } from "next";

// ── Security Headers ─────────────────────────────────────────────
// Applied to all routes unless overridden by a more specific matcher.

const commonSecurityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];

const globalCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.screenshotone.com https://api.microlink.io https://maps.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
  "frame-src 'self' https://*.firebaseapp.com",
].join('; ');

const embedCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.screenshotone.com https://api.microlink.io https://maps.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
  "frame-ancestors *",
  "frame-src 'self' https://*.firebaseapp.com",
].join('; ');

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
      {
        protocol: 'https',
        hostname: 'api.screenshotone.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
    ],
  },

  async headers() {
    return [
      // Global security headers — all routes
      {
        source: '/((?!embed).*)',
        headers: [
          ...commonSecurityHeaders,
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: globalCSP },
        ],
      },
      // Embed routes — allow iframing, use CSP frame-ancestors instead
      {
        source: '/embed/:path*',
        headers: [
          ...commonSecurityHeaders,
          // No X-Frame-Options — CSP frame-ancestors takes precedence
          { key: 'Content-Security-Policy', value: embedCSP },
        ],
      },
    ];
  },
};

export default nextConfig;
