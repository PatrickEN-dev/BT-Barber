/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
