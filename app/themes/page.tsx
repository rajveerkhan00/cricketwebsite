"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const FREE_THEME_SLUGS = new Set(["asia-cup", "cwc-19"]);

interface ThemeItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  badge?: string;
}

export default function ThemesPage() {
  const { data: session, status } = useSession();
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [approvedSlugs, setApprovedSlugs] = useState<string[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // Inline preview state (same pattern as ScoreboardLinksModal)
  const [previewTheme, setPreviewTheme] = useState<ThemeItem | null>(null);

  const userEmail = session?.user?.email || "";

  useEffect(() => {
    async function loadThemes() {
      setLoadingThemes(true);
      try {
        const res = await fetch("/api/scoreboard-themes");
        if (!res.ok) throw new Error("Failed to load themes.");
        const data = await res.json();
        setThemes(
          (data.themes || []).map((theme: any) => ({
            id: theme.themeId,
            name: theme.name,
            slug: theme.slug,
            price: theme.price,
            badge: theme.badge,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingThemes(false);
      }
    }
    loadThemes();
  }, []);

  useEffect(() => {
    if (!userEmail) {
      setApprovedSlugs([]);
      return;
    }

    async function loadPurchases() {
      setLoadingPurchases(true);
      try {
        const res = await fetch(`/api/my-theme-purchases?email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error("Failed to load purchases.");
        const data = await res.json();
        setApprovedSlugs(data.approvedSlugs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPurchases(false);
      }
    }

    loadPurchases();
  }, [userEmail]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#05072c] text-white">
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-[2rem] border border-white/10 bg-[#0b1030]/90 p-8 shadow-2xl shadow-black/40">

            {/* ── Header ── */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-widest text-amber-400">Scoreboard Themes</p>
                <h1 className="text-4xl font-black tracking-tight">Your unlocked scoreboard cards</h1>
                <p className="max-w-2xl text-sm text-zinc-300">
                  Browse all scoreboard themes, click <span className="font-bold text-amber-300">Preview</span> on any card to see a live scoreboard preview right here on the page.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {status === "authenticated" ? (
                    <>
                      Logged in as <span className="font-semibold text-white">{session?.user?.name || session?.user?.email}</span>
                    </>
                  ) : (
                    "Login to view your unlocked themes."
                  )}
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:scale-[1.01]"
                >
                  Unlock more themes
                </Link>
              </div>
            </div>

            {/* ── Theme Cards Grid ── */}
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loadingThemes ? (
                <div className="col-span-full rounded-3xl border border-zinc-700/80 bg-[#081020]/80 p-8 text-center text-zinc-400">
                  Loading themes...
                </div>
              ) : (
                themes.map((theme) => {
                  const isFree = theme.id <= 2 || FREE_THEME_SLUGS.has(theme.slug.toLowerCase().trim());
                  const isUnlocked = isFree || approvedSlugs.includes(theme.slug);
                  const isActivePrev = previewTheme?.slug === theme.slug;

                  return (
                    <div
                      key={theme.slug}
                      className={`rounded-3xl border p-6 shadow-xl transition-all duration-300 ${
                        isActivePrev
                          ? "border-amber-500/60 bg-amber-500/10 ring-2 ring-amber-500/30"
                          : isUnlocked
                          ? "border-amber-500/30 bg-white/5 hover:-translate-y-1"
                          : "border-zinc-700 bg-[#071122]/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Theme</p>
                          <h2 className="mt-3 text-xl font-black tracking-tight text-white">{theme.name}</h2>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${isUnlocked ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/20" : "bg-red-500/10 text-red-200 border border-red-500/20"}`}>
                            {isUnlocked ? "Unlocked" : isFree ? "Free" : "Locked"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-300">
                        <p>
                          Price: <span className="font-bold text-white">{isFree ? "FREE" : `PKR ${theme.price}`}</span>
                        </p>
                        <p>
                          {theme.badge ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
                              {theme.badge}
                            </span>
                          ) : (
                            "Premium scoreboard style for live match overlays."
                          )}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => setPreviewTheme(isActivePrev ? null : theme)}
                          className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-bold transition ${
                            isActivePrev
                              ? "bg-zinc-700 text-white hover:bg-zinc-600"
                              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110"
                          }`}
                        >
                          {isActivePrev ? "✕ Close Preview" : "▶ Preview"}
                        </button>
                        {isUnlocked ? (
                          <span className="inline-flex items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-100">
                            ✓ View unlocked
                          </span>
                        ) : (
                          <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20 transition"
                          >
                            🔒 Buy to unlock
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Inline Preview Panel (appears below cards) ── */}
            {previewTheme && (
              <div className="mt-8 rounded-[2rem] border border-amber-500/20 bg-[#081022]/90 shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in duration-300">
                {/* Preview header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1538]">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white font-extrabold text-sm uppercase tracking-widest">
                      Live Preview — {previewTheme.name}
                    </span>
                    <span className="text-zinc-500 text-xs font-semibold hidden sm:block">· Demo match data</span>
                  </div>
                  <button
                    onClick={() => setPreviewTheme(null)}
                    className="bg-zinc-800 hover:bg-red-700/50 text-white border border-zinc-700 hover:border-red-500 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition-all"
                  >
                    ✕ Close Preview
                  </button>
                </div>

                {/* iframe */}
                <div
                  className="w-full bg-black"
                  style={{ aspectRatio: "16/9", maxHeight: "600px" }}
                >
                  <iframe
                    key={previewTheme.slug}
                    src={`/matches/overlay/overlay?theme=${encodeURIComponent(previewTheme.slug)}&preview=true`}
                    className="w-full h-full border-none"
                    style={{ display: "block", height: "600px" }}
                    title={`Preview: ${previewTheme.name}`}
                    allow="autoplay"
                  />
                </div>

                {/* Footer note */}
                <div className="px-6 py-3 bg-[#0b1030] border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-zinc-500 text-xs font-semibold">
                    🎮 Showing demo match: India vs Australia · 125/2 (14.2 overs) — preview mode only
                  </p>
                  <Link
                    href="/pricing"
                    className="text-amber-400 text-xs font-bold hover:text-amber-300 transition"
                  >
                    Unlock {previewTheme.name} →
                  </Link>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>
      <Footer />

      {/* ── Fullscreen overlay preview (triggered by any card, floats above everything) ──
          This is an ALTERNATIVE: click Preview again for fullscreen ── */}
    </>
  );
}
