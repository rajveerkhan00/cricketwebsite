"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from "next/head";

const FREE_THEME_SLUGS = new Set(["asia-cup", "cwc-19"]);

interface ThemeItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  badge?: string;
}

function getPreviewColors(slug: string) {
  const normalized = slug.toLowerCase();
  if (normalized.includes("cwc") || normalized.includes("asia")) {
    return { bg: "from-orange-500 via-amber-500 to-yellow-400", accent: "bg-amber-300", text: "text-slate-950" };
  }
  if (normalized.includes("ipl") || normalized.includes("bbl") || normalized.includes("sa20")) {
    return { bg: "from-sky-500 via-cyan-500 to-blue-500", accent: "bg-cyan-300", text: "text-white" };
  }
  if (normalized.includes("wcl") || normalized.includes("fan")) {
    return { bg: "from-violet-500 via-fuchsia-500 to-pink-500", accent: "bg-fuchsia-300", text: "text-white" };
  }
  return { bg: "from-slate-900 via-slate-800 to-zinc-900", accent: "bg-amber-300", text: "text-white" };
}

export default function ThemesPage() {
  const { data: session, status } = useSession();
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [approvedSlugs, setApprovedSlugs] = useState<string[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const userEmail = session?.user?.email || "";

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.slug === selectedSlug),
    [selectedSlug, themes]
  );

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

  const handlePreview = (slug: string) => {
    setSelectedSlug(slug);
  };

  const previewTitle = selectedTheme ? selectedTheme.name : "Select a scoreboard theme to preview";

  return (
    <> 
    <Header />
    <main className="min-h-screen bg-[#05072c] text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#0b1030]/90 p-8 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-amber-400">Scoreboard Themes</p>
              <h1 className="text-4xl font-black tracking-tight">Your unlocked scoreboard cards</h1>
              <p className="max-w-2xl text-sm text-zinc-300">
                Browse all scoreboard themes, preview them directly in this page, and see which are unlocked for your account. The first two themes are free for every user.
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

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loadingThemes ? (
              <div className="col-span-full rounded-3xl border border-zinc-700/80 bg-[#081020]/80 p-8 text-center text-zinc-400">
                Loading themes...
              </div>
            ) : (
              themes.map((theme) => {
                const isFree = theme.id <= 2 || FREE_THEME_SLUGS.has(theme.slug.toLowerCase().trim());
                const isUnlocked = isFree || approvedSlugs.includes(theme.slug);
                return (
                  <div
                    key={theme.slug}
                    className={`rounded-3xl border p-6 shadow-xl transition-all duration-300 ${
                      isUnlocked ? "border-amber-500/30 bg-white/5 hover:-translate-y-1" : "border-zinc-700 bg-[#071122]/80"
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
                        onClick={() => handlePreview(theme.slug)}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-bold text-white transition hover:brightness-110"
                      >
                        Preview
                      </button>
                      {isUnlocked ? (
                        <span className="inline-flex items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-100">
                          View unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-100">
                          Buy to unlock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#081022]/90 p-6 shadow-2xl shadow-black/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-300">Preview panel</p>
                <h2 className="mt-2 text-2xl font-black text-white">{previewTitle}</h2>
              </div>
              {selectedTheme && (
                <button
                  onClick={() => setSelectedSlug("")}
                  className="rounded-2xl border border-zinc-600 bg-zinc-900/80 px-4 py-2 text-xs uppercase tracking-wider text-white transition hover:bg-zinc-800"
                >
                  Clear preview
                </button>
              )}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[2rem] border border-white/10 bg-[#081822]/90 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                {selectedTheme ? (
                  <iframe
                    title={`Preview ${selectedTheme.name}`}
                    src={`/themes/preview/${selectedTheme.slug}`}
                    className="h-[520px] w-full rounded-[1.75rem] border border-white/10 bg-black shadow-xl shadow-black/30"
                  />
                ) : (
                  <div className="flex h-[520px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 text-center text-zinc-400 px-8">
                    <p className="text-lg font-bold text-white">Select a theme to preview</p>
                    <p className="mt-3 text-sm leading-6">
                      The preview will appear here instantly, using the same inline preview style instead of a popup.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[#0d1329] p-5 shadow-lg shadow-black/30">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-4 text-sm leading-6 text-zinc-300">
                  <p className="font-bold text-white">How preview works</p>
                  <p className="mt-3 text-zinc-400">
                    Select any theme card above to preview its scoreboard layout directly in this page. The first two themes are free for everyone, and unlocked themes show as "Unlocked" so you can easily identify which scoreboards are ready to use.
                  </p>
                  <ul className="mt-4 space-y-2 text-zinc-400">
                    <li>• Preview the scoreboard style without leaving this page.</li>
                    <li>• Free themes are available to everyone instantly.</li>
                    <li>• Locked themes show a purchase prompt to unlock from pricing.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
