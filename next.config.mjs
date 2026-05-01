const securityHeaders = [
  // Defense against clickjacking. We don't embed in iframes anywhere.
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer leakage to other origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser APIs we don't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS for two years (browsers ignore on localhost).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Modern XSS protection (legacy header still respected by some browsers).
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
