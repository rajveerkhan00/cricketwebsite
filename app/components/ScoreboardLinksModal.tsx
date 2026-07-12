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

const FREE_THEME_SLUGS = new Set(["asia-cup", "cwc-19"]);

interface ScoreboardLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  userEmail?: string;
}

export default function ScoreboardLinksModal({
  isOpen,
  onClose,
  matchId,
  showToast,
  userEmail = "",
}: ScoreboardLinksModalProps) {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [isJazzCashOpen, setIsJazzCashOpen] = useState(false);
  const [selectedThemeForPurchase, setSelectedThemeForPurchase] = useState<ThemeItem | null>(null);
  const [approvedSlugs, setApprovedSlugs] = useState<string[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const fetchPurchases = async () => {
    if (!userEmail) return;
    try {
      setLoadingPurchases(true);
      const res = await fetch(`/api/my-theme-purchases?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setApprovedSlugs(data.approvedSlugs || []);
      }
    } catch (error) {
      console.error("Failed to load purchases:", error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchPurchases();
    }
  }, [isOpen, userEmail]);

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
    if (userEmail) {
      url += `&email=${encodeURIComponent(userEmail)}`;
    }
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

  const handlePrintPDF = (themeSlug: string, screen: "SUMMARY" | "FULLSCORE") => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/matches/${matchId}/overlay?theme=${themeSlug}&screen=${screen}&print=true`;
    window.open(url, "_blank", "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no");
  };


  return (
    <>
      {/* Full-screen scrollable overlay */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Content wrapper — pushes modal into view, allows outer-div scrolling */}
        <div className="relative flex min-h-full items-start justify-center p-4 py-8">
          {/* Modal card */}
          <div className="w-full max-w-4xl bg-[#eaecfa] text-zinc-800 rounded-3xl shadow-2xl border border-zinc-300 font-sans">
            {/* Close Button */}
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 font-extrabold text-xl z-10 w-8 h-8 rounded-full bg-zinc-200/60 hover:bg-zinc-200 flex items-center justify-center transition-all cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-10 flex flex-col items-center">
              {/* Header */}
              <h2 className="text-xl md:text-2xl font-black text-center text-zinc-900 tracking-wider font-space uppercase">
                ALL SCOREBOARD LINKS
              </h2>
              <p className="text-red-600 text-xs md:text-sm text-center font-bold tracking-wide mt-1 underline">
                Note: Trial theme will not be available from now.
              </p>

              {/* Theme store instruction panel */}
              <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-xl text-center bg-white/40 border border-zinc-300 rounded-2xl p-4">
                <p className="text-zinc-700 font-extrabold text-xs font-space uppercase">
                  ⚡ Theme Store (JazzCash Checkout Only)
                </p>
                <p className="text-zinc-500 text-[10px] md:text-xs max-w-md">
                  Click <span className="font-extrabold text-[#d22630]">Buy Theme</span> next to any theme to submit payment via JazzCash. The admin will approve and unlock the theme link within 1 hour.
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                  <span className="text-[10px] font-bold text-zinc-600">Your Email:</span>
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2.5 py-0.5">
                    {userEmail || "Not logged in"}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600">Unlocked:</span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2.5 py-0.5">
                    {approvedSlugs.length} / {themes.length}
                  </span>
                </div>
              </div>

              {/* Themes Table */}
              <div className="w-full mt-6 border border-zinc-300 rounded-xl overflow-x-auto shadow-lg bg-white">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#008080] text-white text-xs font-bold uppercase tracking-wider">
                      <th className="p-3 w-12 text-center">No.</th>
                      <th className="p-3">Theme</th>
                      <th className="p-3 text-center">Price (per day)</th>
                      <th className="p-3 text-center w-24">Preview</th>
                      <th className="p-3 text-center w-48">Graphical PDFs (Themed)</th>
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
                      themes.map((theme, idx) => {
                        const isFreeTheme = theme.id <= 2 || FREE_THEME_SLUGS.has(theme.slug.toLowerCase().trim());
                        const isUnlocked = isFreeTheme || approvedSlugs.includes(theme.slug);
                        return (
                          <tr
                            key={theme.id}
                            className={`text-xs font-semibold hover:bg-zinc-100 transition-colors ${
                              idx % 2 === 0 ? "bg-white" : "bg-[#f2f4ff]"
                            }`}
                          >
                            <td className="p-3 text-center text-zinc-500">{theme.id}</td>
                            <td className="p-3 font-bold text-zinc-950">
                              <div className="flex items-center gap-2">
                                {theme.name}
                                {theme.badge && (
                                  <span className="bg-amber-500 text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                                    {theme.badge}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center font-bold text-emerald-700">
                              {isFreeTheme ? "FREE" : `PKR ${theme.price}`}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handlePreview(theme.slug)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-[10px] uppercase py-1 px-3.5 rounded-full active:scale-95 transition-all cursor-pointer border border-zinc-800"
                              >
                                Preview
                              </button>
                            </td>
                            {isUnlocked ? (
                              <td className="p-3 text-center flex items-center gap-1 justify-center min-w-[170px]">
                                <button
                                  onClick={() => handlePrintPDF(theme.slug, "SUMMARY")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase py-1 px-2 rounded active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                                  title="Download graphical themed Match Summary PDF"
                                >
                                  📄 Summary
                                </button>
                                <button
                                  onClick={() => handlePrintPDF(theme.slug, "FULLSCORE")}
                                  className="bg-[#008080] hover:bg-[#006666] text-white font-extrabold text-[9px] uppercase py-1 px-2 rounded active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                                  title="Download graphical themed Full Scorecard PDF"
                                >
                                  📊 Scorecard
                                </button>
                              </td>
                            ) : (
                              <td className="p-3 text-center text-zinc-500 text-[10px] italic">
                                🔒 Locked
                              </td>
                            )}
                            {isUnlocked ? (
                              <>
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
                              </>
                            ) : (
                              <td colSpan={2} className="p-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedThemeForPurchase(theme);
                                    setIsJazzCashOpen(true);
                                  }}
                                  className="w-full max-w-[280px] mx-auto py-1 px-4 rounded-full font-black text-[10px] uppercase tracking-wider text-white shadow bg-gradient-to-r from-[#d22630] to-[#ffb612] hover:from-[#b91e27] hover:to-[#e09e0c] active:scale-95 transition-all cursor-pointer"
                                >
                                  🔒 Buy Theme (JazzCash)
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom padding */}
              <div className="h-4" />
            </div>
          </div>
        </div>
      </div>

      {selectedThemeForPurchase && (
        <JazzCashPaymentModal
          isOpen={isJazzCashOpen}
          onClose={() => {
            setIsJazzCashOpen(false);
            setSelectedThemeForPurchase(null);
          }}
          itemName={`Scoreboard Theme: ${selectedThemeForPurchase.slug}`}
          itemPrice={`${selectedThemeForPurchase.price}`}
          onSuccess={() => {
            showToast(
              `JazzCash payment details submitted for theme ${selectedThemeForPurchase.name}! Check your email once admin approves it.`,
              "success"
            );
            fetchPurchases();
          }}
        />
      )}
    </>
  );
}
