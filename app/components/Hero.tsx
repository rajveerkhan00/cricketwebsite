"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ✅ Type for the Chrome install prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// ✅ Extend Navigator so `navigator.standalone` (iOS Safari) is typed
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function Hero() {
  const { data: session } = useSession();
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // Capture the browser's install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed (standalone mode)
    const nav = window.navigator as NavigatorWithStandalone;
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true
    ) {
      setIsInstalled(true);
    }

    const ua = navigator.userAgent;
    setIsIos(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    setIsAndroid(/Android/.test(ua));

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleGetStarted = () => {
    if (session) {
      router.push("/tournaments");
    } else {
      router.push("/login");
    }
  };

  const handleInstallClick = async () => {
    // Already installed — nothing to do
    if (isInstalled) return;

    // Chromium browsers: trigger native install prompt (one click)
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
      return;
    }

    // Browsers without a native prompt (iOS Safari, Firefox, etc.)
    // → show manual install instructions
    setShowInstallModal(true);
  };

  return (
    <section className="relative min-h-[80vh] w-full bg-white flex items-center justify-center overflow-hidden py-20 px-6 md:px-12 font-outfit">
      {/* Subtle Light Mesh Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="hex-grid" width="45" height="77.942" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
              <path d="M 45 0 L 22.5 12.99 M 22.5 12.99 L 0 0 M 0 0 L 0 25.98 M 0 25.98 L 22.5 38.97 M 22.5 38.97 L 45 25.98 M 45 25.98 L 45 0 M 0 38.97 L 22.5 51.96 M 22.5 51.96 L 0 64.95 M 0 64.95 L 0 90.93 M 0 90.93 L 22.5 103.92 M 22.5 103.92 L 45 90.93 M 45 90.93 L 45 64.95 L 22.5 51.96" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex-grid)" />
        </svg>
      </div>

      {/* Modern Soft Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold tracking-widest text-emerald-700 uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Next-Gen Sports Technology
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight font-space">
            CriOverlay - LIVE CRICKET
            <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              SCORING OVERLAY APP
            </span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed font-normal font-outfit">
            We revolutionize your event experience with top-notch technology. Whether it's live streaming for sports, festivals, or meetings, or providing real-time cricket scoring with stunning international graphics, we have everything you need.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGetStarted}
              className="group relative bg-[#1b8c1b] hover:bg-[#157015] active:scale-95 text-white font-bold text-lg px-8 py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(27,140,27,0.25)] hover:shadow-[0_4px_25px_rgba(27,140,27,0.4)]"
            >
              Get Started
            </button>

            {/* ✅ Install App button */}
            {isInstalled ? (
              <div className="flex items-center gap-2 px-8 py-3.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-bold text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                App Installed
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="group relative bg-white hover:bg-slate-50 active:scale-95 text-[#1b8c1b] font-bold text-lg px-8 py-3.5 rounded-lg border-2 border-[#1b8c1b] transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2.5"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install App
              </button>
            )}
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6 relative">
          <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
            <Image
              src="/hero-illustration-transparent-v4.png"
              alt="CriOverlay Scorecard App Display"
              width={440}
              height={440}
              priority
              className="object-contain transform hover:scale-[1.03] transition-transform duration-500 ease-out drop-shadow-lg"
            />
          </div>

          <p className="text-xs font-bold tracking-widest text-emerald-800 uppercase text-center mt-2 font-space bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full shadow-xs">
            LIVE CRICKET STREAMING SCORECARD SOFTWARE!
          </p>
        </div>

      </div>

      {/* Install Instructions Modal (browsers without native prompt) */}
      {showInstallModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              {/* App icon */}
              <div className="w-16 h-16 rounded-2xl bg-[#1b8c1b] flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 font-space">
                Install CriOverlay
              </h3>

              {isIos ? (
                <ol className="text-left text-sm text-slate-600 space-y-3 w-full">
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">1</span>
                    <span>Tap the <strong>Share</strong> button <svg className="inline w-4 h-4 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> at the bottom of Safari</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</span>
                    <span>Tap <strong>"Add"</strong> in the top-right corner</span>
                  </li>
                </ol>
              ) : isAndroid ? (
                <ol className="text-left text-sm text-slate-600 space-y-3 w-full">
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">1</span>
                    <span>Tap the <strong>⋮ menu</strong> (three dots) in Chrome</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">2</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</span>
                    <span>Confirm with <strong>"Install"</strong></span>
                  </li>
                </ol>
              ) : (
                <ol className="text-left text-sm text-slate-600 space-y-3 w-full">
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">1</span>
                    <span>Click the <strong>install icon</strong> in the address bar, or open the <strong>⋮ browser menu</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">2</span>
                    <span>Select <strong>"Install CriOverlay"</strong> or <strong>"Apps → Install this site as an app"</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</span>
                    <span>Confirm — the app will appear on your <strong>desktop</strong></span>
                  </li>
                </ol>
              )}

              <button
                onClick={() => setShowInstallModal(false)}
                className="mt-2 w-full bg-[#1b8c1b] hover:bg-[#157015] text-white font-bold py-3 rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}