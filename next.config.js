/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "7844", pathname: "/api/v1/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
