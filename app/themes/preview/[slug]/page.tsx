import { notFound } from "next/navigation";

const PREVIEW_THEMES: Record<string, { name: string; bg: string; panelBg: string; accent: string; text: string; muted: string; scoreBg: string; scoreText: string; }> = {
  "asia-cup": { name: "Asia Cup", bg: "#031b10", panelBg: "rgba(13, 37, 19, 0.92)", accent: "#fbbf24", text: "#ffffff", muted: "#9ca3af", scoreBg: "rgba(251, 191, 36, 0.14)", scoreText: "#fbbf24" },
  "cwc-19": { name: "CWC 19", bg: "#031d3e", panelBg: "rgba(10, 24, 71, 0.92)", accent: "#38bdf8", text: "#ffffff", muted: "#c7d2fe", scoreBg: "rgba(56, 189, 248, 0.14)", scoreText: "#bae6fd" },
  "champions-trophy-2025": { name: "Champions Trophy 2025", bg: "#071f17", panelBg: "rgba(12, 36, 27, 0.92)", accent: "#34d399", text: "#ffffff", muted: "#c7f9cc", scoreBg: "rgba(52, 211, 153, 0.14)", scoreText: "#34d399" },
  "cwc-25-india": { name: "CWC 25 India", bg: "#0b122d", panelBg: "rgba(11, 15, 44, 0.92)", accent: "#fb923c", text: "#ffffff", muted: "#fdba74", scoreBg: "rgba(251, 146, 60, 0.14)", scoreText: "#fb923c" },
  "wcl-fancode": { name: "WCL (Fancode)", bg: "#2a0b30", panelBg: "rgba(38, 9, 45, 0.92)", accent: "#f0abfc", text: "#ffffff", muted: "#e9d5ff", scoreBg: "rgba(240, 171, 252, 0.14)", scoreText: "#f0abfc" },
};

const DEFAULT_THEME = {
  name: "Scoreboard Preview",
  bg: "#08111f",
  panelBg: "rgba(13, 18, 33, 0.96)",
  accent: "#f59e0b",
  text: "#ffffff",
  muted: "#94a3b8",
  scoreBg: "rgba(245, 158, 11, 0.14)",
  scoreText: "#f59e0b",
};

export default function ThemePreviewPage({ params }: { params?: { slug?: string } }) {
  const slug = params?.slug?.toLowerCase() || "default";
  const theme = PREVIEW_THEMES[slug] || DEFAULT_THEME;

  return (
    <main className="min-h-screen bg-black text-white">
      <div
        className="min-h-screen"
        style={{
          background: `linear-gradient(180deg, ${theme.bg} 0%, #020617 100%)`,
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Scoreboard preview</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white">{theme.name}</h1>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white ring-1 ring-white/10">
                Inline preview
              </span>
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-6 shadow-xl shadow-black/50">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Match</p>
                    <h2 className="mt-2 text-2xl font-black text-white">KK vs KHR</h2>
                  </div>
                  <span className="inline-flex rounded-full bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-200">
                    Group Stage
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-5 shadow-[0_35px_120px_-80px_rgba(255,255,255,0.35)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-300">KK</p>
                        <p className="mt-2 text-5xl font-black" style={{ color: theme.scoreText }}>82/3</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Overs</p>
                        <p className="mt-2 text-4xl font-black text-white">14.2</p>
                      </div>
                    </div>
                    <div className="mt-6 rounded-[1.5rem] bg-[rgba(255,255,255,0.05)] p-4">
                      <div className="grid grid-cols-3 gap-4 text-center text-xs uppercase tracking-[0.25em] text-slate-400">
                        <div>4s</div>
                        <div>6s</div>
                        <div>RR</div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-center text-xl font-black text-white">
                        <div>8</div>
                        <div>3</div>
                        <div>5.8</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-5">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Bowler</p>
                      <div className="mt-4 flex items-center justify-between text-white">
                        <span className="font-bold">A. Khan</span>
                        <span className="text-slate-300">3-0-18-1</span>
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-5">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Last ball</p>
                      <p className="mt-4 text-2xl font-black text-white">4</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
                <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Status</p>
                  <div className="mt-3 inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.35em] text-white">
                    LIVE
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Current run rate</p>
                  <p className="mt-3 text-4xl font-black text-white">5.8</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Strike zone</p>
                  <p className="mt-3 text-sm text-slate-300">KK batting, 82/3 in 14.2 overs</p>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-[2rem] border border-white/10 bg-[#081022]/90 p-6 text-sm leading-7 text-slate-300">
            <p className="font-bold text-white">Same preview style</p>
            <p className="mt-3">
              This inline preview shows the same kind of scoreboard look you get from the links page, but inside the themes page itself. Swap themes from the list and the sample scoreboard updates with the selected theme style.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
