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
  metadataBase: new URL("https://crioverlay.com"),
  title: "CriOverlay | Live Cricket Scoring Overlay App",
  description:
    "Professional broadcast-quality live cricket scorecards and sports graphics overlays for OBS, Prism Live Studio, and streaming commentators.",
  manifest: "/manifest.json", // ✅ Added for PWA installation
  icons: {
    icon: [
      { url: "/api/favicon", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/api/favicon",
    // ✅ Changed to point to the physical PNG file required for iOS homescreens
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "CriOverlay | Live Cricket Scoring Overlay App",
    description: "Professional broadcast-quality live cricket scorecards and sports graphics overlays for OBS, Prism Live Studio, and streaming commentators.",
    url: "https://crioverlay.com",
    siteName: "CriOverlay",
    images: [
      {
        url: "/image2.jpeg",
        width: 1200,
        height: 630,
        alt: "CriOverlay Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CriOverlay | Live Cricket Scoring Overlay App",
    description: "Professional broadcast-quality live cricket scorecards and sports graphics overlays for OBS, Prism Live Studio, and streaming commentators.",
    images: ["/image2.jpeg"],
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
        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CriOverlay" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#1b8c1b" />
        <link rel="icon" href="/api/favicon" type="image/svg+xml" />
        <link rel="shortcut icon" href="/api/favicon" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />

        {/* ✅ Moved from body to head for proper PWA detection */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1b8c1b" />
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