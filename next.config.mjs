/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "steamcdn-a.akamaihd.net",
      },
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "media.steampowered.com",
      },
    ],
  },
};

export default nextConfig;
