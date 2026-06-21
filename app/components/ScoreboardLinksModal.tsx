"use client";

import { useState, useEffect } from "react";
import JazzCashPaymentModal from "./JazzCashPaymentModal";

interface ThemeItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  badge?: string;
}

interface ScoreboardLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export default function ScoreboardLinksModal({
  isOpen,
  onClose,
  matchId,
  showToast,
}: ScoreboardLinksModalProps) {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [purchaseActive, setPurchaseActive] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<"PhonePe" | "Razorpay" | null>(null);
  const [simulatedStatus, setSimulatedStatus] = useState<"idle" | "processing" | "success">("idle");
  const [isJazzCashOpen, setIsJazzCashOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPurchase = localStorage.getItem("crickpro_purchase_active");
      if (savedPurchase === "true") {
        setPurchaseActive(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    async function loadThemes() {
      try {
        setLoadingThemes(true);
        const res = await fetch("/api/scoreboard-themes");
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.themes || []).map((t: any) => ({
            id: t.themeId,
            name: t.name,
            slug: t.slug,
            price: t.price,
            badge: t.badge,
          }));
          setThemes(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch scoreboard themes:", error);
      } finally {
        setLoadingThemes(false);
      }
    }
    loadThemes();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = (themeSlug: string, isCameraFi = false) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    let url = `${origin}/matches/${matchId}/overlay?theme=${themeSlug}`;
    if (isCameraFi) {
      url += "&camerafi=true";
    }

    navigator.clipboard.writeText(url)
      .then(() => {
        showToast(
          `Copied ${isCameraFi ? "CameraFi" : "PC + Mobile"} Link for ${
            themes.find((t) => t.slug === themeSlug)?.name || ""
          } theme!`,
          "success"
        );
      })
      .catch(() => {
        showToast("Failed to copy link to clipboard.", "error");
      });
  };

  const handlePreview = (themeSlug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/matches/${matchId}/overlay?theme=${themeSlug}&preview=true`;
    window.open(url, "_blank", "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no");
  };

  const startPaymentSimulation = (provider: "PhonePe" | "Razorpay") => {
    setPaymentProvider(provider);
    setSimulatedStatus("processing");

    setTimeout(() => {
      setSimulatedStatus("success");
      setPurchaseActive(true);
      localStorage.setItem("crickpro_purchase_active", "true");
      showToast(`Payment successfully processed via ${provider}! All themes unlocked.`, "success");
    }, 2000);
  };

  const resetPurchase = () => {
    setPurchaseActive(false);
    localStorage.removeItem("crickpro_purchase_active");
    showToast("Purchase reset successfully.", "info");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#eaecfa] text-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 border border-zinc-300 font-sans animate-scale-up-fade flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 font-extrabold text-xl z-10 w-8 h-8 rounded-full bg-zinc-200/60 hover:bg-zinc-200 flex items-center justify-center transition-all cursor-pointer"
        >
          ×
        </button>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Header section matching exact layout */}
          <h2 className="text-xl md:text-2xl font-black text-center text-zinc-900 tracking-wider font-space uppercase">
            ALL SCOREBOARD LINKS
          </h2>
          <p className="text-red-600 text-xs md:text-sm text-center font-bold tracking-wide mt-1 underline">
            Note: Trial theme will not be available from now.
          </p>

          {/* Payment buttons & purchase indicator */}
          <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-md">
            <button
              onClick={() => startPaymentSimulation("PhonePe")}
              disabled={purchaseActive}
              className={`w-full py-2.5 px-6 rounded-full font-extrabold text-xs tracking-wider text-white shadow-md active:scale-95 transition-all cursor-pointer ${
                purchaseActive
                  ? "bg-zinc-400 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              }`}
            >
              BUY THEME USING PhonePe ₹(INR)
            </button>

            {/* Razorpay button with orange glowing border simulation */}
            <button
              onClick={() => startPaymentSimulation("Razorpay")}
              disabled={purchaseActive}
              className={`w-full py-2.5 px-6 rounded-full font-extrabold text-xs tracking-wider text-white active:scale-95 transition-all cursor-pointer relative ${
                purchaseActive
                  ? "bg-zinc-400 cursor-not-allowed opacity-50 shadow-none border-none"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              }`}
              style={
                !purchaseActive
                  ? {
                      boxShadow: "0 0 12px 3px rgba(249, 115, 22, 0.75)",
                      border: "1px solid rgba(249, 115, 22, 0.8)",
                    }
                  : {}
              }
            >
              BUY THEME USING RAZORPAY ₹(INR)/$(USD)
            </button>

            {/* JazzCash payment button */}
            <button
              onClick={() => setIsJazzCashOpen(true)}
              disabled={purchaseActive}
              className={`w-full py-2.5 px-6 rounded-full font-extrabold text-xs tracking-wider text-white shadow-md active:scale-95 transition-all cursor-pointer bg-gradient-to-r from-[#d22630] to-[#ffb612] hover:from-[#b91e27] hover:to-[#e09e0c]`}
            >
              BUY THEME USING JAZZCASH (PKR)
            </button>

            <p className="text-red-600 text-[10px] md:text-xs text-center font-bold tracking-wide underline mt-1">
              Note: Trial theme will not be available from now. Both PhonePe/Razorpay support UPI.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <p className="text-blue-700 font-extrabold text-xs md:text-sm">
                Your Purchase:{" "}
                {purchaseActive ? (
                  <span className="text-emerald-600 font-black">Unlimited Themes Access (Active)</span>
                ) : (
                  <span className="text-red-600 font-bold">No Purchase Found</span>
                )}
              </p>
              {purchaseActive && (
                <button
                  onClick={resetPurchase}
                  className="text-[10px] bg-zinc-300 hover:bg-zinc-400 text-zinc-700 px-2 py-0.5 rounded transition-colors font-bold uppercase cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Payment overlay loader */}
          {simulatedStatus === "processing" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
              <div className="bg-[#07092e] text-white p-6 rounded-2xl border border-zinc-800 flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  Simulating {paymentProvider} Checkout...
                </p>
              </div>
            </div>
          )}

          {/* Large Themes Table */}
          <div className="w-full mt-6 border border-zinc-300 rounded-xl overflow-hidden shadow-lg bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#008080] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-3 w-12 text-center">No.</th>
                  <th className="p-3">Theme</th>
                  <th className="p-3 text-center">Price (per day)</th>
                  <th className="p-3 text-center w-24">Preview</th>
                  <th className="p-3 text-center w-48">Scoreboard Link (PC + Mobile)</th>
                  <th className="p-3 text-center w-48">CameraFi Mobile Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loadingThemes ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#008080] border-t-transparent rounded-full animate-spin" />
                        Loading themes...
                      </div>
                    </td>
                  </tr>
                ) : themes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-semibold">
                      No themes found.
                    </td>
                  </tr>
                ) : (
                  themes.map((theme, idx) => (
                    <tr
                      key={theme.id}
                      className={`text-xs font-semibold hover:bg-zinc-100 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#f2f4ff]"
                      }`}
                    >
                      <td className="p-3 text-center text-zinc-500">{theme.id}</td>
                      <td className="p-3 font-bold text-zinc-950 flex items-center gap-2">
                        {theme.name}
                        {theme.badge && (
                          <span className="bg-amber-500 text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                            {theme.badge}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-zinc-700">₹ {theme.price}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handlePreview(theme.slug)}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-[10px] uppercase py-1 px-3.5 rounded-full active:scale-95 transition-all cursor-pointer border border-zinc-800"
                        >
                          Preview
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleCopyLink(theme.slug, false)}
                          className="bg-[#ff3b30] hover:bg-[#e03126] text-white font-extrabold text-[10px] uppercase py-1 px-4 rounded-full active:scale-95 transition-all cursor-pointer shadow-sm"
                        >
                          Copy Link
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleCopyLink(theme.slug, true)}
                          className="bg-[#ff3b30] hover:bg-[#e03126] text-white font-extrabold text-[10px] uppercase py-1 px-4 rounded-full active:scale-95 transition-all cursor-pointer shadow-sm"
                        >
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <JazzCashPaymentModal
        isOpen={isJazzCashOpen}
        onClose={() => setIsJazzCashOpen(false)}
        itemName="All Scoreboard Themes"
        itemPrice="150"
        onSuccess={() => {
          setPurchaseActive(true);
          localStorage.setItem("crickpro_purchase_active", "true");
          showToast("Payment successfully processed via JazzCash! All themes unlocked.", "success");
        }}
      />
    </div>
  );
}
