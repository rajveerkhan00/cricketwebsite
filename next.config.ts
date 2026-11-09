import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disables PWA in dev to prevent caching headaches
});

const nextConfig: NextConfig = {
  // ✅ Silences the Turbopack error in Next.js 16
  turbopack: {},

  // Your other existing config options can go here...
};

// Wrap your config with the PWA plugin
export default withPWA(nextConfig);