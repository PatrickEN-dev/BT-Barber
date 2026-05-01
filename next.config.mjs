/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "utfs.io" },
      { hostname: "picsum.photos" },
      { hostname: "fastly.picsum.photos" },
      { hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
