import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [25, 38, 50, 60, 70, 75, 80, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  allowedDevOrigins: ["10.221.96.145", "*.ngrok-free.app", "*.ngrok.io"],
};

export default nextConfig;
