// Content-Security-Policy baseline. Pragmatic compromise:
// - 'unsafe-inline' for scripts/styles is required by Next 14's inline boot
//   scripts and Tailwind/style libraries that inject <style>.
// - 'unsafe-eval' only enabled in development (Next dev uses eval for HMR).
// - Connect/img/font allowed for our known third parties (Supabase, Google
//   OAuth, Wikimedia, Unsplash, etc).
// - frame-ancestors 'none' enforces the same anti-clickjacking we already get
//   from X-Frame-Options: DENY.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https://utfs.io https://picsum.photos https://fastly.picsum.photos https://images.unsplash.com https://loremflickr.com https://upload.wikimedia.org https://lh3.googleusercontent.com`,
  `connect-src 'self' https://*.supabase.co https://*.supabase.com https://accounts.google.com`,
  `frame-src https://accounts.google.com`,
  `frame-ancestors 'none'`,
  `form-action 'self' https://accounts.google.com`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: "utfs.io" },
      { hostname: "picsum.photos" },
      { hostname: "fastly.picsum.photos" },
      { hostname: "images.unsplash.com" },
      { hostname: "loremflickr.com" },
      { hostname: "upload.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
