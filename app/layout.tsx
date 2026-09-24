import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CriOverlay | Live Cricket Scoring Overlay App",
  description:
    "Professional broadcast-quality live cricket scorecards and sports graphics overlays for OBS, Prism Live Studio, and streaming commentators.",
  icons: {
    icon: [
      { url: "/api/favicon", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/api/favicon",
    apple: "/api/favicon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/api/favicon" type="image/svg+xml" />
        <link rel="shortcut icon" href="/api/favicon" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/api/favicon" />
      </head>
      <body
        className="min-h-full flex flex-col bg-white text-slate-900"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
