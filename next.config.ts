import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // For testing, keep PWA enabled even in development
  disable: false, // Set to true only when you want to deliberately disable PWA
});

const nextConfig: NextConfig = {
  // ✅ Silences the Turbopack error in Next.js 16
  turbopack: {},

  // Your other existing config options can go here...
};

// Wrap your config with the PWA plugin
export default withPWA(nextConfig);