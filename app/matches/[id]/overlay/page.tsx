"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface BatsmanStats { name: string; runs: number; balls: number; fours: number; sixes: number; out: boolean; }
interface BowlerStats { name: string; runsConceded: number; ballsBowled: number; wickets: number; }
interface FallOfWicket { score: number; wickets: number; over: number; batsman: string; }
interface ScoringState {
  battingTeam: "team1" | "team2"; bowlingTeam: "team1" | "team2";
  inningsNo: 1 | 2; inningsStarted: boolean;
  striker: string; nonStriker: string; bowler: string;
  score: number; wickets: number; balls: number; overs: number;
  target: number | null; thisOver: string[];
  batsmen: BatsmanStats[]; bowlers: BowlerStats[];
  fallOfWickets?: FallOfWicket[];
  animation: string | null; displayScreen: string;
  customInputText: string; momPlayer: string;
  tournamentStatsPlayer?: string;
  decision: "PENDING" | "OUT" | "NOT OUT" | null;
  displayStatsMode?: string | null;
  firstInnings?: { score: number; wickets: number; balls: number; overs: number; batsmen: BatsmanStats[]; bowlers: BowlerStats[]; fallOfWickets: FallOfWicket[]; };
}
interface Match {
  _id: string; team1Name: string; team2Name: string;
  overs: number; ballsPerOver: number; status: string;
  scoringState: ScoringState | null;
  playersTeam1?: string[]; playersTeam2?: string[];
  tossWonBy?: "team1" | "team2"; optedTo?: "Bat" | "Bowl";
}

const THEME_MAP: Record<string, { name: string; primaryBg: string; secondaryBg: string; accent: string; accentText: string; textPrimary: string; textSecondary: string; scoreBg: string; scoreText: string; borderColor: string; headerBg: string; ballColors: { runs: string; four: string; six: string; wicket: string; extra: string }; bgUrl: string; }> = {
  "asia-cup": { name: "Asia Cup", primaryBg: "rgba(0,40,20,0.92)", secondaryBg: "rgba(0,60,30,0.85)", accent: "#fbbf24", accentText: "#fbbf24", textPrimary: "#ffffff", textSecondary: "#bbf7d0", scoreBg: "rgba(251,191,36,0.15)", scoreText: "#fbbf24", borderColor: "#fbbf24", headerBg: "rgba(0,25,12,0.98)", ballColors: { runs: "#16a34a", four: "#fbbf24", six: "#f59e0b", wicket: "#dc2626", extra: "#7c3aed" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "cwc-19": { name: "CWC 19", primaryBg: "rgba(10,40,90,0.92)", secondaryBg: "rgba(14,60,120,0.85)", accent: "#38bdf8", accentText: "#7dd3fc", textPrimary: "#ffffff", textSecondary: "#bae6fd", scoreBg: "rgba(56,189,248,0.15)", scoreText: "#e0f2fe", borderColor: "#38bdf8", headerBg: "rgba(5,25,60,0.98)", ballColors: { runs: "#0284c7", four: "#facc15", six: "#f97316", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "champions-trophy-2025": { name: "Champions Trophy 2025", primaryBg: "rgba(2,30,15,0.94)", secondaryBg: "rgba(4,50,25,0.85)", accent: "#34d399", accentText: "#34d399", textPrimary: "#ffffff", textSecondary: "#a7f3d0", scoreBg: "rgba(52,211,153,0.15)", scoreText: "#34d399", borderColor: "#10b981", headerBg: "rgba(1,15,8,0.98)", ballColors: { runs: "#059669", four: "#fde68a", six: "#fbbf24", wicket: "#f87171", extra: "#c084fc" }, bgUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=1920&auto=format&fit=crop" },
  "cwc-25-india": { name: "CWC 25 India", primaryBg: "rgba(12,10,35,0.94)", secondaryBg: "rgba(18,15,50,0.85)", accent: "#fb923c", accentText: "#fb923c", textPrimary: "#ffffff", textSecondary: "#fed7aa", scoreBg: "rgba(251,146,60,0.15)", scoreText: "#fb923c", borderColor: "#f97316", headerBg: "rgba(6,5,20,0.98)", ballColors: { runs: "#2563eb", four: "#fb923c", six: "#22c55e", wicket: "#ef4444", extra: "#a78bfa" }, bgUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop" },
  "wcl-fancode": { name: "WCL (Fancode)", primaryBg: "rgba(50,0,50,0.94)", secondaryBg: "rgba(80,0,80,0.85)", accent: "#f0abfc", accentText: "#e879f9", textPrimary: "#ffffff", textSecondary: "#f5d0fe", scoreBg: "rgba(232,121,249,0.15)", scoreText: "#e879f9", borderColor: "#d946ef", headerBg: "rgba(30,0,35,0.98)", ballColors: { runs: "#a21caf", four: "#fbbf24", six: "#f0abfc", wicket: "#ef4444", extra: "#818cf8" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "cwc-23-india": { name: "CWC 23 India", primaryBg: "rgba(8,12,40,0.95)", secondaryBg: "rgba(12,20,60,0.85)", accent: "#f97316", accentText: "#fb923c", textPrimary: "#ffffff", textSecondary: "#e0e7ff", scoreBg: "rgba(249,115,22,0.15)", scoreText: "#f97316", borderColor: "#ea580c", headerBg: "rgba(4,6,25,0.98)", ballColors: { runs: "#3b82f6", four: "#f97316", six: "#22c55e", wicket: "#f43f5e", extra: "#c084fc" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "bbl-black": { name: "BBL Black", primaryBg: "rgba(5,5,5,0.96)", secondaryBg: "rgba(15,15,15,0.88)", accent: "#4ade80", accentText: "#4ade80", textPrimary: "#ffffff", textSecondary: "#bbf7d0", scoreBg: "rgba(74,222,128,0.12)", scoreText: "#4ade80", borderColor: "#22c55e", headerBg: "rgba(1,1,1,0.99)", ballColors: { runs: "#16a34a", four: "#facc15", six: "#4ade80", wicket: "#ef4444", extra: "#60a5fa" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "cricfusion": { name: "CricFusion Theme", primaryBg: "rgba(20,4,40,0.94)", secondaryBg: "rgba(40,8,60,0.85)", accent: "#f97316", accentText: "#fb923c", textPrimary: "#ffffff", textSecondary: "#ede9fe", scoreBg: "rgba(249,115,22,0.15)", scoreText: "#f97316", borderColor: "#c026d3", headerBg: "rgba(12,2,25,0.98)", ballColors: { runs: "#7c3aed", four: "#f97316", six: "#f0abfc", wicket: "#ef4444", extra: "#818cf8" }, bgUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop" },
  "t20-emerging-asia-cup": { name: "T20 Emerging Asia Cup 2024", primaryBg: "rgba(15,18,25,0.95)", secondaryBg: "rgba(25,30,42,0.85)", accent: "#ef4444", accentText: "#fca5a5", textPrimary: "#ffffff", textSecondary: "#e2e8f0", scoreBg: "rgba(239,68,68,0.15)", scoreText: "#fca5a5", borderColor: "#dc2626", headerBg: "rgba(8,10,15,0.98)", ballColors: { runs: "#6b7280", four: "#fbbf24", six: "#f97316", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "sa20": { name: "SA20", primaryBg: "rgba(4,20,12,0.95)", secondaryBg: "rgba(6,35,22,0.85)", accent: "#facc15", accentText: "#fde047", textPrimary: "#ffffff", textSecondary: "#fef9c3", scoreBg: "rgba(250,204,21,0.15)", scoreText: "#facc15", borderColor: "#eab308", headerBg: "rgba(2,10,6,0.98)", ballColors: { runs: "#16a34a", four: "#facc15", six: "#22d3ee", wicket: "#ef4444", extra: "#a78bfa" }, bgUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=1920&auto=format&fit=crop" },
  "jiocinema": { name: "Jio Cinema", primaryBg: "rgba(100,0,0,0.94)", secondaryBg: "rgba(20,20,70,0.85)", accent: "#60a5fa", accentText: "#93c5fd", textPrimary: "#ffffff", textSecondary: "#dbeafe", scoreBg: "rgba(96,165,250,0.15)", scoreText: "#93c5fd", borderColor: "#3b82f6", headerBg: "rgba(70,0,0,0.98)", ballColors: { runs: "#1d4ed8", four: "#fbbf24", six: "#60a5fa", wicket: "#fca5a5", extra: "#c084fc" }, bgUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop" },
  "ipl": { name: "IPL", primaryBg: "rgba(5,5,40,0.95)", secondaryBg: "rgba(10,10,60,0.85)", accent: "#fbbf24", accentText: "#fde68a", textPrimary: "#ffffff", textSecondary: "#e0e7ff", scoreBg: "rgba(251,191,36,0.15)", scoreText: "#fde68a", borderColor: "#f59e0b", headerBg: "rgba(2,2,25,0.98)", ballColors: { runs: "#4f46e5", four: "#fbbf24", six: "#f59e0b", wicket: "#ef4444", extra: "#22d3ee" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "wt20-2024": { name: "WT20 2024", primaryBg: "rgba(8,0,22,0.96)", secondaryBg: "rgba(16,4,40,0.85)", accent: "#a78bfa", accentText: "#c4b5fd", textPrimary: "#ffffff", textSecondary: "#ede9fe", scoreBg: "rgba(167,139,250,0.15)", scoreText: "#c4b5fd", borderColor: "#7c3aed", headerBg: "rgba(4,0,12,0.99)", ballColors: { runs: "#6d28d9", four: "#4ade80", six: "#a78bfa", wicket: "#ef4444", extra: "#38bdf8" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "bbl-starsports": { name: "BBL Star Sports", primaryBg: "rgba(0,30,10,0.95)", secondaryBg: "rgba(0,50,20,0.85)", accent: "#ef4444", accentText: "#fca5a5", textPrimary: "#ffffff", textSecondary: "#dcfce7", scoreBg: "rgba(239,68,68,0.15)", scoreText: "#fca5a5", borderColor: "#dc2626", headerBg: "rgba(0,18,6,0.98)", ballColors: { runs: "#16a34a", four: "#fbbf24", six: "#ef4444", wicket: "#7f1d1d", extra: "#60a5fa" }, bgUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=1920&auto=format&fit=crop" },
  "ipl-2025": { name: "IPL 2025", primaryBg: "rgba(4,6,35,0.96)", secondaryBg: "rgba(8,12,55,0.85)", accent: "#fbbf24", accentText: "#fde68a", textPrimary: "#ffffff", textSecondary: "#e0e7ff", scoreBg: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(79,70,229,0.18))", scoreText: "#fde68a", borderColor: "#f59e0b", headerBg: "rgba(2,3,20,0.99)", ballColors: { runs: "#4338ca", four: "#fbbf24", six: "#f59e0b", wicket: "#ef4444", extra: "#34d399" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
};
const DEFAULT_THEME = THEME_MAP["ipl"];
const THEME_FONTS: Record<string, string> = {
  "asia-cup": "'Space Grotesk', sans-serif", "cwc-19": "'Space Grotesk', sans-serif",
  "champions-trophy-2025": "'Space Grotesk', sans-serif", "cwc-25-india": "'Outfit', sans-serif",
  "wcl-fancode": "'Outfit', sans-serif", "cwc-23-india": "'Space Grotesk', sans-serif",
  "bbl-black": "'Orbitron', sans-serif", "cricfusion": "'Outfit', sans-serif",
  "t20-emerging-asia-cup": "'Space Grotesk', sans-serif", "sa20": "'Rubik', sans-serif",
  "jiocinema": "'Rubik', sans-serif", "ipl": "'Outfit', sans-serif",
  "wt20-2024": "'Space Grotesk', sans-serif", "bbl-starsports": "'Orbitron', sans-serif",
  "ipl-2025": "'Outfit', sans-serif",
};

const getPlayerTournamentStats = (name: string) => {
  if (!name) return null;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  hash = Math.abs(hash);
  const matches = (hash % 4) + 6; const runs = (hash % 180) + 160;
  const innings = matches - (hash % 2); const notOuts = hash % 3;
  const avg = (runs / Math.max(1, innings - notOuts)).toFixed(2);
  const sr = ((hash % 35) + 132.5).toFixed(2);
  const wickets = hash % 3 === 0 ? (hash % 10) + 2 : 0;
  const economy = wickets > 0 ? ((hash % 3) + 6.4 + (hash % 10) / 10).toFixed(2) : "—";
  const best = wickets > 0 ? `${Math.min(wickets, (hash % 3) + 2)}/${(hash % 18) + 12}` : "—";
  const fours = Math.floor(runs / 10) + (hash % 6); const sixes = Math.floor(runs / 22) + (hash % 4);
  const hs = `${(hash % 50) + 55}${hash % 2 === 0 ? "*" : ""}`;
  return { matches, runs, avg, sr, wickets, economy, best, fours, sixes, hs };
};

const getPointsTable = (match: Match, themeSlug: string, plusOne: boolean) => {
  const t1 = match.team1Name; const t2 = match.team2Name;
  let others = ["CSK", "MI", "RCB", "KKR", "SRH", "LSG"];
  if (["asia-cup","cwc-19","cwc-23-india","cwc-25-india","wt20-2024"].includes(themeSlug)) others = ["IND","AUS","ENG","RSA","NZL","PAK"];
  else if (["bbl-black","bbl-starsports"].includes(themeSlug)) others = ["SYS","AS","BH","MS","PS","MR"];
  const allTeams = Array.from(new Set([t1, t2, ...others])).slice(0, 6);
  return allTeams.map((name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = Math.abs(hash);
    const won = (hash % 4) + 2; const tied = hash % 2; const lost = 7 - won - tied;
    const pts = won * 2 + tied * (plusOne ? 2 : 1);
    return { name, p: 7, w: won, l: lost, t: tied, pts, nrr: ((hash % 200) / 100 - 1).toFixed(3) };
  }).sort((a, b) => b.pts - a.pts || parseFloat(b.nrr) - parseFloat(a.nrr));
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@400;700;900&family=Rubik:wght@400;500;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes pulseGlow { 0% { transform: scale(1); } 100% { transform: scale(1.04); } }
  @keyframes slideUp { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes scaleIn { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes strikerPing { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes rowIn { 0% { transform: translateX(-20px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
  @keyframes batSwing { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
  .slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .striker-dot-ring { position:absolute; width:16px; height:16px; border-radius:50%; border:2px solid #4ade80; animation:strikerPing 1.4s cubic-bezier(0,0,0.2,1) infinite; }
  .live-dot { animation: livePulse 1.2s ease-in-out infinite; }
  .table-row-animated { animation: rowIn 0.3s ease forwards; }
  .bat-swing { display:inline-block; animation: batSwing 1.6s ease-in-out infinite; }
`;

// ── TeamLogo component ──────────────────────────────────────────────────────
function TeamLogo({ name, isBatting, isBowling, accentColor, borderColor, size = 72 }: {
  name: string; isBatting: boolean; isBowling: boolean;
  accentColor: string; borderColor: string; size?: number;
}) {
  const words = name.trim().split(/\s+/);
  const sc = isBatting ? "#22c55e" : isBowling ? "#ef4444" : borderColor;
  
  // Format team name text inside logo
  // If team name is very long, truncate or scale it down
  const getFontSize = (text: string) => {
    if (text.length <= 4) return size * 0.22;
    if (text.length <= 8) return size * 0.16;
    if (text.length <= 12) return size * 0.13;
    return size * 0.11;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      {/* Outer shield/crest */}
      <div style={{
        width: size,
        height: size,
        borderRadius: "24%", // sporty squircle shape
        background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))`,
        border: `3px solid ${sc}`,
        boxShadow: `0 0 ${size * 0.25}px ${sc}50, inset 0 0 15px rgba(255,255,255,0.1)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "6px",
        overflow: "hidden",
        transition: "all 0.3s ease"
      }}>
        {/* Decorative inner pattern */}
        <div style={{
          position: "absolute",
          inset: "2px",
          border: `1px dashed ${sc}50`,
          borderRadius: "20%",
          pointerEvents: "none"
        }} />
        
        {/* Team Name inside the logo */}
        <div style={{
          zIndex: 1,
          textAlign: "center",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "1px"
        }}>
          {words.slice(0, 3).map((w, idx) => (
            <span key={idx} style={{
              fontSize: getFontSize(w),
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              lineHeight: 1.1,
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
              wordBreak: "break-word",
              maxWidth: "100%"
            }}>
              {w}
            </span>
          ))}
        </div>

        {/* Batting/Bowling sign badge directly on the logo */}
        {isBatting && (
          <div style={{
            position: "absolute",
            bottom: "0px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #15803d, #22c55e)",
            border: "1.5px solid #ffffff",
            borderRadius: "6px",
            padding: "1px 4px",
            display: "flex",
            alignItems: "center",
            gap: "2px",
            boxShadow: "0 2px 6px rgba(34,197,94,0.5)",
            zIndex: 10
          }}>
            <span className="bat-swing" style={{ fontSize: size * 0.16 }}>🏏</span>
            <span style={{ fontSize: size * 0.11, fontWeight: 900, color: "#fff", letterSpacing: "0.5px" }}>BAT</span>
          </div>
        )}

        {isBowling && (
          <div style={{
            position: "absolute",
            bottom: "0px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #991b1b, #ef4444)",
            border: "1.5px solid #ffffff",
            borderRadius: "6px",
            padding: "1px 4px",
            display: "flex",
            alignItems: "center",
            gap: "2px",
            boxShadow: "0 2px 6px rgba(239,68,68,0.5)",
            zIndex: 10
          }}>
            <span style={{ fontSize: size * 0.16 }}>⚾</span>
            <span style={{ fontSize: size * 0.11, fontWeight: 900, color: "#fff", letterSpacing: "0.5px" }}>BOWL</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Full screen cricket ground background ───────────────────────────────────
function GroundBG({ bgUrl }: { bgUrl: string }) {
  return <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0, backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.14) saturate(0.5)", pointerEvents: "none" }} />;
}

// ── Ball outcome circle ─────────────────────────────────────────────────────
function BallCircle({ val, ballColors, borderColor, size = 28 }: { val?: string; ballColors: Record<string,string>; borderColor: string; size?: number }) {
  let bg = `${borderColor}18`, color = "#64748b", shadow = "none";
  if (val) {
    if (val === "W") { bg = ballColors.wicket; color = "#fff"; shadow = `0 0 10px ${ballColors.wicket}`; }
    else if (val === "6") { bg = ballColors.six; color = "#000"; shadow = `0 0 10px ${ballColors.six}`; }
    else if (val === "4") { bg = ballColors.four; color = "#000"; shadow = `0 0 10px ${ballColors.four}`; }
    else if (val === "Wd" || val === "Nb" || val === "WNb") { bg = ballColors.extra; color = "#fff"; }
    else { bg = ballColors.runs; color = "#fff"; }
  }
  return <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, boxShadow: shadow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.length > 1 ? size * 0.29 : size * 0.38, fontWeight: 900, border: val ? "none" : `1px solid ${borderColor}20`, flexShrink: 0 }}>{val || ""}</div>;
}

export default function OverlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params?.id as string;
  const themeSlug = searchParams?.get("theme") || "ipl";
  const isPreview = searchParams?.get("preview") === "true";
  const theme = THEME_MAP[themeSlug] || DEFAULT_THEME;
  const activeFont = THEME_FONTS[themeSlug] || "'Space Grotesk', sans-serif";

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMatch(data.match);
    } catch (_) { } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!matchId) return;
    fetchMatch();
    const interval = setInterval(fetchMatch, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  const fmtOv = (balls: number, bpo = 6) => `${Math.floor(balls / bpo)}.${balls % bpo}`;
  const calcRR = (state: ScoringState) => (!match || state.balls === 0) ? "0.00" : (state.score / (state.balls / match.ballsPerOver)).toFixed(2);
  const scoringState = match?.scoringState;

  if (loading) return (
    <div style={{ background: "#03041c", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: activeFont }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 52, height: 52, border: "4px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ fontWeight: 800, letterSpacing: 3, fontSize: 13, color: "#94a3b8" }}>LOADING OVERLAY...</div>
      </div>
    </div>
  );

  if (!match || !scoringState) return (
    <div style={{ background: "#03041c", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontWeight: 800, fontFamily: activeFont, fontSize: 18 }}>
      <style>{GLOBAL_CSS}</style>🏏 MATCH DATA NOT STARTED
    </div>
  );

  const striker = scoringState.batsmen.find(b => b.name === scoringState.striker);
  const nonStriker = scoringState.batsmen.find(b => b.name === scoringState.nonStriker);
  const bowler = scoringState.bowlers.find(bw => bw.name === scoringState.bowler);
  const currentBatTeam = scoringState.battingTeam === "team1" ? match.team1Name : match.team2Name;
  const currentBowlTeam = scoringState.bowlingTeam === "team1" ? match.team1Name : match.team2Name;
  const team1IsBatting = scoringState.battingTeam === "team1";

  const getInnState = (n: 1 | 2) => {
    if (scoringState.inningsNo === n) return { score: scoringState.score, wickets: scoringState.wickets, balls: scoringState.balls, overs: scoringState.overs, batsmen: scoringState.batsmen, bowlers: scoringState.bowlers, fallOfWickets: scoringState.fallOfWickets || [] };
    if (n === 1 && scoringState.firstInnings) return scoringState.firstInnings;
    return null;
  };

  const getInnTeam = (n: 1 | 2, role: "bat" | "bowl") => {
    const tw = match.tossWonBy === "team1"; const bat = match.optedTo === "Bat";
    const batFirst = tw ? (bat ? match.team1Name : match.team2Name) : (bat ? match.team2Name : match.team1Name);
    const bowlFirst = tw ? (bat ? match.team2Name : match.team1Name) : (bat ? match.team1Name : match.team2Name);
    if (n === 1) return role === "bat" ? batFirst : bowlFirst;
    return role === "bat" ? bowlFirst : batFirst;
  };

  const renderCustomOverlay = () => !scoringState.customInputText ? null : (
    <div style={{ position: "fixed", top: isPreview ? 52 : 16, left: "50%", transform: "translateX(-50%)", background: theme.headerBg, border: `2px solid ${theme.borderColor}`, boxShadow: `0 8px 24px rgba(0,0,0,0.5)`, borderRadius: 12, padding: "10px 32px", color: theme.accent, fontWeight: 900, fontSize: 14, letterSpacing: 2.5, zIndex: 900, textAlign: "center", fontFamily: activeFont, whiteSpace: "nowrap" }}>
      {scoringState.customInputText.split("-").map((c, i) => <div key={i} style={{ marginTop: i > 0 ? 4 : 0 }}>{c.trim().toUpperCase()}</div>)}
    </div>
  );

  const renderMom = () => !scoringState.momPlayer ? null : (
    <div style={{ position: "fixed", top: isPreview ? 120 : 64, right: 24, background: theme.headerBg, border: `2px solid ${theme.accent}`, boxShadow: `0 0 20px ${theme.accent}30`, borderRadius: 18, padding: "14px 26px", zIndex: 900, textAlign: "center", fontFamily: activeFont }}>
      <div style={{ fontSize: 9, color: theme.textSecondary, marginBottom: 3, letterSpacing: 2, fontWeight: 800 }}>🌟 MAN OF THE MATCH</div>
      <div style={{ fontSize: 16, color: theme.accent, fontWeight: 900 }}>{scoringState.momPlayer.toUpperCase()}</div>
    </div>
  );

  // ════════════════════ 1. ANIMATION ════════════════════
  if (scoringState.animation) {
    const anim = scoringState.animation;
    let bg = "linear-gradient(135deg,#0f172a,#1e293b)", glow = theme.borderColor, label = "★", main = anim, sub = `${match.team1Name} vs ${match.team2Name}`;
    if (anim === "FOUR") { bg = "linear-gradient(135deg,#7c2d12,#dc2626,#f97316,#fbbf24)"; glow = "#fbbf24"; label = "✨ BOUNDARY HIT"; main = "FOUR!"; sub = `${scoringState.striker} • ${striker?.runs ?? 0} runs`; }
    else if (anim === "SIX") { bg = "linear-gradient(135deg,#1e1b4b,#1d4ed8,#06b6d4)"; glow = "#06b6d4"; label = "🚀 MAXIMUM SIX"; main = "SIX!"; sub = `${scoringState.striker} clears the rope!`; }
    else if (anim === "WICKET") { bg = "linear-gradient(135deg,#450a0a,#991b1b,#ef4444)"; glow = "#ef4444"; label = "🔴 WICKET TAKEN"; main = "OUT!"; sub = `${scoringState.bowler} strikes • ${scoringState.wickets} down`; }
    else if (anim === "FREE HIT") { bg = "linear-gradient(135deg,#052e16,#059669,#34d399)"; glow = "#34d399"; label = "⚡ NO BALL"; main = "FREE HIT!"; sub = "Next delivery is a FREE HIT!"; }
    else if (anim === "HAT-TRICK BALL") { bg = "linear-gradient(135deg,#2e1065,#7e22ce,#a855f7)"; glow = "#c084fc"; label = "🔥 HAT-TRICK ALERT"; main = "HAT-TRICK BALL!"; sub = `${scoringState.bowler} is on a hat-trick!`; }
    else if (anim === "INNINGS BREAK") { bg = "linear-gradient(135deg,#0c4a6e,#0ea5e9,#38bdf8)"; glow = "#38bdf8"; label = "🏏 END OF INNINGS 1"; main = "INNINGS BREAK"; sub = `${currentBatTeam} scored ${scoringState.firstInnings?.score ?? scoringState.score}/${scoringState.firstInnings?.wickets ?? scoringState.wickets}`; }
    else if (anim === "TOUR BOUNDARIES") { bg = "linear-gradient(135deg,#4a044e,#d946ef,#f0abfc)"; glow = "#f0abfc"; label = "🎇 TOURNAMENT BOUNDARIES"; main = "TOP BOUNDARIES"; sub = "Tournament boundary leaders!"; }
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,3,16,0.88)", backdropFilter: "blur(8px)", zIndex: 1000, fontFamily: activeFont }}>
        <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
        <div className="scale-in" style={{ background: bg, border: `4px solid ${glow}`, boxShadow: `0 0 80px ${glow}55,0 0 30px ${glow}30,inset 0 0 30px rgba(255,255,255,0.12)`, borderRadius: 40, padding: "44px 90px", textAlign: "center", animation: "pulseGlow 1.6s ease-in-out infinite alternate", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: 4, marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 76, fontWeight: 950, color: "#fff", letterSpacing: 4, textShadow: `0 4px 16px rgba(0,0,0,0.5),0 0 40px ${glow}60`, lineHeight: 1, margin: "8px 0" }}>{main}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 2, marginTop: 8 }}>{sub}</div>
        </div>
      </div>
    );
  }

  // ════════════════════ 2. DECISION ════════════════════
  if (scoringState.decision) {
    const isOut = scoringState.decision === "OUT"; const isNO = scoringState.decision === "NOT OUT";
    const bg = isOut ? "linear-gradient(135deg,#7f1d1d,#dc2626)" : isNO ? "linear-gradient(135deg,#14532d,#16a34a)" : "linear-gradient(135deg,#713f12,#d97706)";
    const glow = isOut ? "#ef4444" : isNO ? "#22c55e" : "#fbbf24";
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 999, fontFamily: activeFont }}>
        <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
        <div className="scale-in" style={{ background: bg, boxShadow: `0 0 60px ${glow}60,0 16px 40px rgba(0,0,0,0.6)`, border: `3px solid ${glow}`, borderRadius: 28, padding: "28px 72px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.85)", letterSpacing: 4, marginBottom: 6 }}>THIRD UMPIRE DECISION</div>
          <div style={{ fontSize: 24, marginBottom: 4 }}>{isOut ? "🔴" : isNO ? "🟢" : "⚖️"}</div>
          <div style={{ fontSize: 52, fontWeight: 950, color: "#fff", letterSpacing: 6 }}>{scoringState.decision === "PENDING" ? "⚖️ REVIEW IN PROGRESS" : scoringState.decision}</div>
        </div>
      </div>
    );
  }

  // ════════════════════ 3. PLAYER SPOTLIGHT ════════════════════
  if (scoringState.tournamentStatsPlayer) {
    const pName = scoringState.tournamentStatsPlayer;
    const pStats = getPlayerTournamentStats(pName);
    const goldColor = "#fbbf24";
    return (
      <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
        <div style={{ position: "relative", zIndex: 1, width: "72vw" }}>
          {renderCustomOverlay()}{renderMom()}
          {/* Unique: Trophy banner header + 2-col layout */}
          <div className="slide-up" style={{ background: `linear-gradient(135deg, #d97706, #fbbf24)`, border: `3px solid ${goldColor}`, borderRadius: "40px 10px 0 0", padding: "20px 36px", display: "flex", alignItems: "center", gap: 24, boxShadow: `0 4px 20px rgba(217,119,6,0.3)` }}>
            <div style={{ fontSize: 48, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>🏆</div>
            <div>
              <div style={{ fontSize: 10, color: "rgba(0,0,0,0.7)", fontWeight: 900, letterSpacing: 3, marginBottom: 2 }}>PLAYER SPOTLIGHT · TOURNAMENT STATS</div>
              <div style={{ fontSize: 32, fontWeight: 950, color: "#000", textShadow: "0 1px 2px rgba(255,255,255,0.4)" }}>{pName.toUpperCase()}</div>
            </div>
            <div style={{ marginLeft: "auto", background: "#000", color: goldColor, fontSize: 9, fontWeight: 900, padding: "5px 14px", borderRadius: 8, letterSpacing: 2, display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${goldColor}` }}>
              <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: goldColor, display: "inline-block" }} />LIVE
            </div>
          </div>
          <div style={{ background: "rgba(12, 10, 5, 0.98)", border: `3px solid ${goldColor}`, borderTop: "none", borderRadius: "0 0 10px 40px", padding: "32px 36px", boxShadow: `0 20px 50px rgba(0,0,0,0.8)` }}>
            {pStats ? (
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32 }}>
                <div style={{ textAlign: "center", background: "rgba(217,119,6,0.06)", border: `1px solid rgba(217,119,6,0.25)`, borderRadius: "20px 8px 20px 8px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <TeamLogo name={pName} isBatting={false} isBowling={false} accentColor={goldColor} borderColor={goldColor} size={110} />
                  <div style={{ marginTop: 20, background: "linear-gradient(135deg, #d97706, #fbbf24)", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 12, color: "#000", fontWeight: 900, boxShadow: "0 4px 12px rgba(217,119,6,0.2)" }}>{pStats.matches} Matches</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[{l:"Total Runs",v:pStats.runs,c:goldColor},{l:"Highest",v:pStats.hs,c:"#fff"},{l:"Batting Avg",v:pStats.avg,c:"#4ade80"},{l:"Strike Rate",v:pStats.sr,c:"#38bdf8"},{l:"Fours",v:pStats.fours,c:"#fbbf24"},{l:"Sixes",v:pStats.sixes,c:"#f97316"},{l:"Wickets",v:pStats.wickets||"—",c:"#f87171"},{l:"Economy",v:pStats.economy,c:"#a78bfa"},{l:"Best Spell",v:pStats.best,c:"#4ade80"}].map((item,i)=>(
                    <div key={i} className="table-row-animated" style={{ animationDelay:`${i*0.05}s`, background:"rgba(255,255,255,0.03)", border:`1px solid rgba(217,119,6,0.15)`, borderRadius:12, padding:"16px 12px", textAlign:"center", position:"relative", overflow:"hidden" }}>
                      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:item.c, opacity:0.6 }} />
                      <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", fontWeight:800, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>{item.l}</div>
                      <div style={{ fontSize:24, fontWeight:950, color:item.c }}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div style={{ textAlign:"center", color:theme.textSecondary, padding:40 }}>Player data unavailable.</div>}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════ 4. STATS MODES ════════════════════
  if (scoringState.displayStatsMode) {
    const mode = scoringState.displayStatsMode!;
    const isPT = mode === "POINTS TABLE" || mode === "PT (TIED POINT +1)";
    const isTB = mode === "TOP BATTERS"; const isTBo = mode === "TOP BOWLERS";
    const isTSt = mode === "TOP 4/6 STRIKERS"; const isPOS = mode === "TOP PLAYER OF SERIES";
    const allP = [...(match.playersTeam1||[]),...(match.playersTeam2||[])];
    return (
      <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
        <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
        <div style={{ position:"relative", zIndex:1, width:"84vw" }}>
          {renderCustomOverlay()}{renderMom()}
          <div className="slide-up" style={{ background:`linear-gradient(90deg,#4c1d95,#7c3aed)`, borderTop:`4px solid #a78bfa`, borderRadius:"16px 16px 0 0", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:26 }}>📊</div>
              <div>
                <div style={{ fontSize:10, color:"#ddd6fe", fontWeight:800, letterSpacing:3 }}>TOURNAMENT STATS</div>
                <div style={{ fontSize:22, fontWeight:950, color:"#fff" }}>{mode.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:"#ddd6fe", fontWeight:700 }}>{match.team1Name} vs {match.team2Name}</div>
          </div>
          <div style={{ background:"rgba(10,8,20,0.98)", border:`2px solid rgba(124,58,237,0.3)`, borderTop:"none", borderRadius:"0 0 16px 16px", padding:"28px 32px", boxShadow: "0 20px 40px rgba(0,0,0,0.7)" }}>
            {isPT && (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:`${theme.borderColor}18`, borderBottom:`2px solid ${theme.borderColor}50` }}>
                  {["#","TEAM","P","W","L","T","NRR","PTS"].map(h=><th key={h} style={{ padding:"12px 14px", fontSize:10, fontWeight:900, textAlign:h==="TEAM"||h==="#"?"left":"center", color:theme.textSecondary, letterSpacing:1.5 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {getPointsTable(match,themeSlug,mode.includes("+1")).map((row,i)=>(
                    <tr key={i} className="table-row-animated" style={{ animationDelay:`${i*0.06}s`, borderBottom:"1px solid rgba(255,255,255,0.04)", background:(row.name===match.team1Name||row.name===match.team2Name)?`${theme.accent}08`:"transparent" }}>
                      <td style={{ padding:"13px 14px" }}><div style={{ width:24, height:24, borderRadius:"50%", background:i<4?`${theme.accent}25`:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:i<4?theme.accent:theme.textSecondary }}>{i+1}</div></td>
                      <td style={{ padding:"13px 14px", fontWeight:900, fontSize:14 }}>{row.name.toUpperCase()}</td>
                      <td style={{ padding:"13px 14px", textAlign:"center", fontSize:13 }}>{row.p}</td>
                      <td style={{ padding:"13px 14px", textAlign:"center", fontSize:13, color:"#4ade80", fontWeight:800 }}>{row.w}</td>
                      <td style={{ padding:"13px 14px", textAlign:"center", fontSize:13, color:"#f87171" }}>{row.l}</td>
                      <td style={{ padding:"13px 14px", textAlign:"center", fontSize:13 }}>{row.t}</td>
                      <td style={{ padding:"13px 14px", textAlign:"center", fontSize:11, fontFamily:"monospace", color:parseFloat(row.nrr)>=0?"#4ade80":"#f87171" }}>{row.nrr}</td>
                      <td style={{ padding:"13px 14px", textAlign:"center" }}><div style={{ background:i<4?`${theme.accent}20`:"rgba(255,255,255,0.06)", border:`1px solid ${i<4?theme.accent:"transparent"}30`, borderRadius:8, padding:"4px 12px", fontWeight:950, fontSize:18, color:i<4?theme.accentText:"#fff", display:"inline-block" }}>{row.pts}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(isTB||isTBo||isTSt) && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16 }}>
                {(isTBo?[...(match.playersTeam2||[]),...(match.playersTeam1||[])]:allP).slice(0,5).map((p,idx)=>{
                  const s=getPlayerTournamentStats(p);
                  return <div key={idx} className="table-row-animated" style={{ animationDelay:`${idx*0.08}s`, background:idx===0?`linear-gradient(180deg,${isTBo?"rgba(239,68,68,0.18)":theme.accent+"18"},transparent)`:"rgba(255,255,255,0.03)", border:`2px solid ${idx===0?isTBo?"#ef4444":theme.accent:theme.borderColor}25`, borderRadius:20, padding:20, textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:10 }}>{isTBo?["🔥","💨","⚡","🎯","💫"][idx]:isTSt?"⚡":["🥇","🥈","🥉","🏅","🎖️"][idx]}</div>
                    <div style={{ fontSize:13, fontWeight:900, color:theme.accentText, marginBottom:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p}</div>
                    <div style={{ fontSize:34, fontWeight:950, color:isTBo?"#ef4444":isTSt?theme.accent:"#fff", lineHeight:1, marginBottom:4 }}>{isTBo?s?.wickets||(idx+4):isTSt?`SR: ${s?.sr}`:s?.runs}</div>
                    <div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:1.5, marginBottom:10 }}>{isTBo?"WICKETS":isTSt?"STRIKE RATE":"RUNS"}</div>
                    <div style={{ display:"flex", justifyContent:"center", gap:6, flexWrap:"wrap" }}>
                      {isTBo?<><span style={{ fontSize:10, color:"#fbbf24", fontWeight:800 }}>ECO {s?.economy!=="—"?s?.economy:"7.24"}</span><span style={{ color:"rgba(255,255,255,0.2)" }}>|</span><span style={{ fontSize:10, color:"#4ade80", fontWeight:800 }}>BEST {s?.best!=="—"?s?.best:"3/18"}</span></>
                      :isTSt?<><span style={{ fontSize:10, color:"#fbbf24", fontWeight:800 }}>{s?.fours} 4s</span><span style={{ color:"rgba(255,255,255,0.2)" }}>|</span><span style={{ fontSize:10, color:"#38bdf8", fontWeight:800 }}>{s?.sixes} 6s</span></>
                      :<><span style={{ fontSize:10, color:"#fbbf24", fontWeight:800 }}>AVG {s?.avg}</span><span style={{ color:"rgba(255,255,255,0.2)" }}>|</span><span style={{ fontSize:10, color:"#38bdf8", fontWeight:800 }}>SR {s?.sr}</span></>}
                    </div>
                  </div>;
                })}
              </div>
            )}
            {isPOS && (()=>{const p=allP[0]||"CRICKET SUPERSTAR"; const s=getPlayerTournamentStats(p); return (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ fontSize:60, marginBottom:16 }}>🏆</div>
                <div style={{ fontSize:11, color:theme.textSecondary, fontWeight:800, letterSpacing:3, marginBottom:14 }}>PLAYER OF THE TOURNAMENT</div>
                <div style={{ display:"flex", justifyContent:"center" }}><TeamLogo name={p} isBatting={false} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={100} /></div>
                <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:24, flexWrap:"wrap" }}>
                  {[{l:"Runs",v:s?.runs??342},{l:"Wickets",v:s?.wickets||8},{l:"Avg",v:s?.avg??"68.4"},{l:"SR",v:s?.sr??"152.8"}].map((it,i)=>(
                    <div key={i} style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${theme.borderColor}30`, borderRadius:16, padding:"14px 28px" }}>
                      <div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:2 }}>{it.l}</div>
                      <div style={{ fontSize:24, fontWeight:900, marginTop:4, color:"#fff" }}>{it.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );})()}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════ 5. FULL-SCREEN CARDS ════════════════════
  const isFS = scoringState.displayScreen && scoringState.displayScreen.toUpperCase() !== "DEFAULT!" && scoringState.displayScreen !== "default";
  if (isFS) {
    const ds = scoringState.displayScreen.toUpperCase();
    const isY1Bat=ds==="Y1BAT"; const isY2Bat=ds==="Y2BAT";
    const isY1Ball=ds==="Y1BALL"; const isY2Ball=ds==="Y2BALL";
    const isSummary=ds==="SUMMARY"; const isFow=ds==="FOW";
    const isBowlerSp=ds==="BOWLER"; const isTarget=ds==="TARGET";
    const isPartner=ds==="PARTNERSHIP";
    const isSquads=ds==="B1"||ds==="B2"||ds==="TEAMS PLAYERS";

    // ── BATTING CARD — left-accent column table ──────────────────────────
    if (isY1Bat||isY2Bat) {
      const inn=(isY1Bat?1:2) as 1|2; const innData=getInnState(inn);
      const batTeam=getInnTeam(inn,"bat"); const bowlTeam=getInnTeam(inn,"bowl");
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"relative", zIndex:1, width:"95vw" }}>
            {renderCustomOverlay()}{renderMom()}
            {/* Header: team logo left, score right, accent left-border */}
            <div className="slide-up" style={{ background:`linear-gradient(135deg,#064e3b,#047857)`, borderLeft:`8px solid #10b981`, border:`2px solid rgba(16,185,129,0.4)`, borderRadius:"16px 16px 0 0", padding:"22px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 25px rgba(6,78,59,0.3)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <TeamLogo name={batTeam} isBatting={scoringState.inningsNo===inn} isBowling={false} accentColor="#10b981" borderColor="#10b981" size={80} />
                <div>
                  <div style={{ fontSize:10, color:"#a7f3d0", fontWeight:800, letterSpacing:3, marginBottom:4 }}>INNINGS {inn} · BATTING SCORECARD</div>
                  <div style={{ fontSize:26, fontWeight:950, color:"#fff" }}>{batTeam.toUpperCase()}</div>
                  <div style={{ fontSize:11, color:"#a7f3d0", marginTop:3 }}>vs {bowlTeam.toUpperCase()}</div>
                </div>
              </div>
              {innData && <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:52, fontWeight:950, color:"#10b981", lineHeight:1 }}>{innData.score}/{innData.wickets}</div>
                <div style={{ fontSize:12, color:"#a7f3d0", fontWeight:700, marginTop:4 }}>{fmtOv(innData.balls,match.ballsPerOver)} / {match.overs} OVERS</div>
              </div>}
            </div>
            <div style={{ background:"rgba(2,15,10,0.98)", border:`2px solid rgba(16,185,129,0.25)`, borderTop:"none", borderRadius:"0 0 16px 16px", overflow:"hidden", boxShadow:"0 20px 40px rgba(0,0,0,0.8)" }}>
              {innData ? <>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:`${theme.accent}12`, borderBottom:`2px solid ${theme.accent}30` }}>
                    {["BATSMAN","STATUS","R","B","4s","6s","SR"].map((h,i)=><th key={h} style={{ padding:"12px 16px", fontSize:10, fontWeight:900, textAlign:i===0?"left":"center", color:theme.textSecondary, letterSpacing:2 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {innData.batsmen.map((b,idx)=>{
                      const isSt=b.name===scoringState.striker&&scoringState.inningsNo===inn;
                      const isNS=b.name===scoringState.nonStriker&&scoringState.inningsNo===inn;
                      return <tr key={idx} className="table-row-animated" style={{ animationDelay:`${idx*0.05}s`, borderBottom:"1px solid rgba(255,255,255,0.04)", background:isSt?`${theme.accent}12`:isNS?"rgba(255,255,255,0.03)":"transparent", borderLeft:isSt?`4px solid ${theme.accent}`:isNS?"4px solid rgba(255,255,255,0.15)":"4px solid transparent" }}>
                        <td style={{ padding:"14px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {isSt&&<div style={{ position:"relative", width:10, height:10, flexShrink:0 }}><span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px #4ade80", display:"block", margin:"auto" }} /><span className="striker-dot-ring" /></div>}
                            <span style={{ fontWeight:900, fontSize:15, color:b.out?"#6b7280":"#fff" }}>{b.name}</span>
                            {isSt&&<span className="bat-swing" style={{ fontSize:13 }}>🏏</span>}
                          </div>
                        </td>
                        <td style={{ padding:"14px 16px", textAlign:"center" }}><span style={{ background:b.out?"rgba(239,68,68,0.15)":"rgba(74,222,128,0.15)", border:`1px solid ${b.out?"#ef4444":"#4ade80"}40`, borderRadius:6, padding:"3px 10px", fontSize:10, fontWeight:900, color:b.out?"#ef4444":"#4ade80" }}>{b.out?"OUT":"BATTING"}</span></td>
                        <td style={{ padding:"14px", textAlign:"center", fontWeight:950, fontSize:20, color:b.runs>=50?theme.accentText:"#fff" }}>{b.runs}</td>
                        <td style={{ padding:"14px", textAlign:"center", fontSize:14, color:theme.textSecondary }}>{b.balls}</td>
                        <td style={{ padding:"14px", textAlign:"center", fontSize:14, color:"#fbbf24", fontWeight:800 }}>{b.fours}</td>
                        <td style={{ padding:"14px", textAlign:"center", fontSize:14, color:"#38bdf8", fontWeight:800 }}>{b.sixes}</td>
                        <td style={{ padding:"14px", textAlign:"center", fontSize:14, color:theme.accentText, fontWeight:800 }}>{b.balls>0?((b.runs/b.balls)*100).toFixed(1):"0.0"}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
                <div style={{ background:`${theme.accent}10`, borderTop:`2px solid ${theme.accent}30`, padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:theme.textSecondary }}>INN {inn} TOTAL</div>
                  <div style={{ fontSize:24, fontWeight:950, color:theme.accentText }}>{innData.score}/{innData.wickets} <span style={{ fontSize:13, color:theme.textSecondary, fontWeight:600 }}>({fmtOv(innData.balls,match.ballsPerOver)}/{match.overs} OVS)</span></div>
                </div>
              </> : <div style={{ textAlign:"center", color:theme.textSecondary, padding:40 }}>No scorecard data.</div>}
            </div>
          </div>
        </div>
      );
    }

    // ── BOWLING CARD — circular card grid (not a table) ─────────────────
    if (isY1Ball||isY2Ball) {
      const inn=(isY1Ball?1:2) as 1|2; const innData=getInnState(inn);
      const bowlTeam=getInnTeam(inn,"bowl"); const batTeam=getInnTeam(inn,"bat");
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"relative", zIndex:1, width:"86vw" }}>
            {renderCustomOverlay()}{renderMom()}
            {/* Header: red accent top border */}
            <div className="slide-up" style={{ background:`linear-gradient(135deg,rgba(120,15,15,0.96),rgba(40,10,10,0.98))`, borderTop:"5px solid #ef4444", border:`2px solid rgba(239,68,68,0.4)`, borderRadius:"12px 12px 0 0", padding:"22px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 25px rgba(220,38,38,0.3)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <TeamLogo name={bowlTeam} isBatting={false} isBowling={scoringState.inningsNo===inn} accentColor="#ef4444" borderColor="#ef4444" size={80} />
                <div>
                  <div style={{ fontSize:10, color:"#fca5a5", fontWeight:800, letterSpacing:3, marginBottom:4 }}>INNINGS {inn} · BOWLING FIGURES</div>
                  <div style={{ fontSize:26, fontWeight:950, color:"#fff" }}>{bowlTeam.toUpperCase()} BOWLING</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, color:"#fca5a5", fontWeight:700 }}>vs {batTeam.toUpperCase()}</div>
                {innData&&<div style={{ fontSize:22, fontWeight:950, color:"#fff", marginTop:4 }}>{innData.score}/{innData.wickets} ({fmtOv(innData.balls,match.ballsPerOver)})</div>}
              </div>
            </div>
            <div style={{ background:"rgba(15,4,4,0.99)", border:`2px solid rgba(239,68,68,0.25)`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"28px 24px", boxShadow:"0 20px 40px rgba(0,0,0,0.8)" }}>
              {innData ? (
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(innData.bowlers.length,4)},1fr)`, gap:20 }}>
                  {innData.bowlers.map((bw,idx)=>{
                    const isAct=scoringState.inningsNo===inn&&bw.name===scoringState.bowler;
                    const eco=bw.ballsBowled>0?((bw.runsConceded/bw.ballsBowled)*match.ballsPerOver).toFixed(2):"0.00";
                    return <div key={idx} className="table-row-animated" style={{ animationDelay:`${idx*0.07}s`, background:isAct?"linear-gradient(180deg,rgba(239,68,68,0.15),rgba(0,0,0,0))":"rgba(255,255,255,0.03)", border:`2px solid ${isAct?"#ef4444":theme.borderColor}30`, borderRadius:18, padding:"24px 20px", textAlign:"center", position:"relative" }}>
                      {isAct&&<div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,transparent,#ef4444,transparent)" }} />}
                      <div style={{ fontSize:15, fontWeight:900, color:isAct?"#fca5a5":"#fff", marginBottom:4 }}>{bw.name}{isAct&&<span style={{ marginLeft:6 }}>⚡</span>}</div>
                      <div style={{ fontSize:9, color:isAct?"#ef4444":theme.textSecondary, fontWeight:800, letterSpacing:2, marginBottom:18 }}>{isAct?"● BOWLING NOW":"BOWLER"}</div>
                      <div style={{ width:80, height:80, borderRadius:"50%", background:bw.wickets>0?"linear-gradient(135deg,#7f1d1d,#dc2626)":"rgba(255,255,255,0.05)", border:`3px solid ${bw.wickets>0?"#ef4444":theme.borderColor}40`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:bw.wickets>0?"0 0 20px #ef444440":"none" }}>
                        <div style={{ fontSize:28, fontWeight:950, color:bw.wickets>0?"#fff":"#6b7280", lineHeight:1 }}>{bw.wickets}</div>
                        <div style={{ fontSize:8, color:bw.wickets>0?"#fca5a5":"#4b5563", fontWeight:800, letterSpacing:1 }}>WKT{bw.wickets!==1?"S":""}</div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                        {[{l:"OVERS",v:fmtOv(bw.ballsBowled,match.ballsPerOver)},{l:"RUNS",v:bw.runsConceded},{l:"ECO",v:eco}].map((st,si)=>(
                          <div key={si} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"8px 4px" }}>
                            <div style={{ fontSize:8, color:theme.textSecondary, fontWeight:800, letterSpacing:1, marginBottom:3 }}>{st.l}</div>
                            <div style={{ fontSize:14, fontWeight:900, color:"#fff" }}>{st.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>;
                  })}
                </div>
              ) : <div style={{ textAlign:"center", color:theme.textSecondary, padding:40 }}>No bowling details.</div>}
            </div>
          </div>
        </div>
      );
    }

    // ── MATCH SUMMARY — Billboard two-team split ─────────────────────────
    if (isSummary) {
      const inn1=getInnState(1); const inn2=getInnState(2);
      const bt1=getInnTeam(1,"bat"); const bt2=getInnTeam(2,"bat");
      const topB1=inn1?.batsmen.slice().sort((a,b)=>b.runs-a.runs).slice(0,2)||[];
      const topB2=inn2?.batsmen.slice().sort((a,b)=>b.runs-a.runs).slice(0,2)||[];
      const topBw1=inn1?.bowlers.slice().sort((a,b)=>b.wickets-a.wickets||a.runsConceded-b.runsConceded).slice(0,2)||[];
      const topBw2=inn2?.bowlers.slice().sort((a,b)=>b.wickets-a.wickets||a.runsConceded-b.runsConceded).slice(0,2)||[];
      const bt1IsT1=bt1===match.team1Name;
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"relative", zIndex:1, width:"80vw" }}>
            {renderCustomOverlay()}{renderMom()}
            {/* Central match title */}
            <div className="slide-up" style={{ background:`linear-gradient(90deg,rgba(0,0,0,0.96),${theme.headerBg},rgba(0,0,0,0.96))`, borderTop:`4px solid ${theme.borderColor}`, borderRadius:"20px 20px 0 0", padding:"16px 32px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:theme.textSecondary, fontWeight:800, letterSpacing:4 }}>MATCH SUMMARY · {theme.name.toUpperCase()}</div>
              <div style={{ fontSize:18, fontWeight:900, color:theme.accentText, marginTop:4 }}>{match.team1Name.toUpperCase()} <span style={{ color:"rgba(255,255,255,0.2)", margin:"0 12px" }}>vs</span> {match.team2Name.toUpperCase()}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 160px 1fr", background:"rgba(4,6,20,0.97)", border:`2px solid ${theme.borderColor}25`, borderTop:"none", borderRadius:"0 0 20px 20px", overflow:"hidden" }}>
              {[{label:"INNINGS 1",team:bt1,inn:inn1,topBat:topB1,topBowl:topBw1,isT1:bt1IsT1},{label:"INNINGS 2",team:bt2,inn:inn2,topBat:topB2,topBowl:topBw2,isT1:!bt1IsT1}].map((blk,bi)=>(
                <div key={bi} style={{ padding:"32px 28px", borderRight:bi===0?`1px solid ${theme.borderColor}20`:"none", borderLeft:bi===1?`1px solid ${theme.borderColor}20`:"none" }}>
                  <div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:3, marginBottom:16 }}>{blk.label}</div>
                  <div style={{ display:"flex", justifyContent:bi===1?"flex-end":"flex-start" }}>
                    <TeamLogo
                      name={blk.team}
                      isBatting={scoringState.inningsNo===(bi===0?1:2) && scoringState.battingTeam===(blk.isT1?"team1":"team2") && scoringState.inningsStarted && match.status!=="Completed"}
                      isBowling={scoringState.inningsNo===(bi===0?1:2) && scoringState.bowlingTeam===(blk.isT1?"team1":"team2") && scoringState.inningsStarted && match.status!=="Completed"}
                      accentColor={theme.accent}
                      borderColor={theme.borderColor}
                      size={88}
                    />
                  </div>
                  {blk.inn ? <>
                    <div style={{ fontSize:50, fontWeight:950, color:theme.accentText, lineHeight:1, marginTop:16, marginBottom:4 }}>{blk.inn.score}<span style={{ color:"rgba(255,255,255,0.3)" }}>/{blk.inn.wickets}</span></div>
                    <div style={{ fontSize:12, color:theme.textSecondary, marginBottom:18 }}>({fmtOv(blk.inn.balls,match.ballsPerOver)} / {match.overs} Overs)</div>
                    {blk.topBat.length>0&&<><div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:2, marginBottom:8 }}>🏏 TOP BATSMEN</div>
                    {blk.topBat.map((b,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}><span style={{ color:"#fff", fontWeight:700 }}>{b.name}</span><span style={{ color:theme.accent, fontWeight:900 }}>{b.runs}({b.balls})</span></div>)}</>}
                    {blk.topBowl.length>0&&<><div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:2, marginBottom:8, marginTop:14 }}>🎯 TOP BOWLERS</div>
                    {blk.topBowl.map((bw,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}><span style={{ color:"#fff", fontWeight:700 }}>{bw.name}</span><span style={{ color:"#ef4444", fontWeight:900 }}>{bw.wickets}/{bw.runsConceded}</span></div>)}</>}
                  </> : <div style={{ color:"#6b7280", fontSize:14, fontWeight:700, marginTop:20 }}>Yet to bat</div>}
                </div>
              ))}
              {/* Center */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 12px", background:`linear-gradient(180deg,${theme.accent}06,transparent)`, borderLeft:`1px solid ${theme.borderColor}20`, borderRight:`1px solid ${theme.borderColor}20` }}>
                <div style={{ fontSize:28, color:"rgba(255,255,255,0.1)", fontWeight:900, marginBottom:20 }}>VS</div>
                <div style={{ background:match.status==="Completed"?`${theme.accent}20`:"rgba(239,68,68,0.15)", border:`1px solid ${match.status==="Completed"?theme.accent:"#ef4444"}40`, borderRadius:12, padding:"10px 14px", textAlign:"center", fontSize:11, fontWeight:900, color:match.status==="Completed"?theme.accentText:"#fca5a5" }}>
                  {match.status==="Completed"?"🏆 DONE":scoringState.inningsNo===2?`NEED\n${Math.max(0,(scoringState.target||0)-scoringState.score)}`:"🏏 LIVE"}
                </div>
                <div style={{ marginTop:20, fontSize:10, color:theme.textSecondary, fontWeight:700 }}>{match.overs} OVS FORMAT</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── FALL OF WICKETS — Horizontal timeline beads ──────────────────────
    if (isFow) {
      const fowList=scoringState.fallOfWickets||[];
      const row1=fowList.slice(0,5); const row2=fowList.slice(5);
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"relative", zIndex:1, width:"78vw" }}>
            {renderCustomOverlay()}{renderMom()}
            <div className="slide-up" style={{ background:`linear-gradient(90deg,rgba(120,20,20,0.96),#450a0a,rgba(120,20,20,0.96))`, border:`2px solid #ef4444`, borderRadius:"12px 12px 0 0", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(220,38,38,0.25)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ fontSize:32 }}>⚰️</div>
                <div>
                  <div style={{ fontSize:10, color:"#fca5a5", fontWeight:800, letterSpacing:3, marginBottom:2 }}>FALL OF WICKETS</div>
                  <div style={{ fontSize:22, fontWeight:950, color:"#fff" }}>{currentBatTeam.toUpperCase()} · INN {scoringState.inningsNo}</div>
                </div>
              </div>
              <div style={{ fontSize:32, fontWeight:950, color:"#ef4444" }}>{fowList.length} / 10</div>
            </div>
            <div style={{ background:"rgba(10,4,4,0.99)", border:`2px solid rgba(239,68,68,0.25)`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"36px 32px", boxShadow:"0 20px 40px rgba(0,0,0,0.8)" }}>
              {fowList.length>0 ? <>
                {/* Timeline row 1 */}
                <div style={{ position:"relative", marginBottom:row2.length>0?32:16 }}>
                  <div style={{ position:"absolute", top:16, left:"5%", right:"5%", height:3, background:"linear-gradient(90deg,rgba(239,68,68,0.7),rgba(239,68,68,0.2))", borderRadius:4 }} />
                  <div style={{ display:"grid", gridTemplateColumns:`repeat(${row1.length},1fr)`, gap:12 }}>
                    {row1.map((f,i)=>(
                      <div key={i} className="table-row-animated" style={{ animationDelay:`${i*0.07}s`, display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#991b1b,#dc2626)", border:"2px solid #ef4444", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", boxShadow:"0 0 12px #ef444450", zIndex:1 }}>{f.wickets}</div>
                        <div style={{ marginTop:12, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:"10px 12px", textAlign:"center", width:"100%" }}>
                          <div style={{ fontSize:9, color:"#f87171", fontWeight:800, letterSpacing:1.5, marginBottom:3 }}>WKT {f.wickets}</div>
                          <div style={{ fontSize:12, fontWeight:900, color:"#fff", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.batsman}</div>
                          <div style={{ fontSize:20, fontWeight:950, color:theme.accentText }}>{f.score}</div>
                          <div style={{ fontSize:9, color:theme.textSecondary }}>{typeof f.over==="number"?f.over.toFixed(1):f.over} Ov</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Row 2 */}
                {row2.length>0&&<div style={{ display:"grid", gridTemplateColumns:`repeat(${row2.length},1fr)`, gap:12, marginBottom:20 }}>
                  {row2.map((f,i)=>(
                    <div key={i} className="table-row-animated" style={{ animationDelay:`${(i+5)*0.07}s`, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:"10px 12px", textAlign:"center" }}>
                      <div style={{ fontSize:9, color:"#f87171", fontWeight:800, letterSpacing:1.5, marginBottom:3 }}>WKT {f.wickets}</div>
                      <div style={{ fontSize:12, fontWeight:900, color:"#fff", marginBottom:4 }}>{f.batsman}</div>
                      <div style={{ fontSize:20, fontWeight:950, color:theme.accentText }}>{f.score}</div>
                      <div style={{ fontSize:9, color:theme.textSecondary }}>{typeof f.over==="number"?f.over.toFixed(1):f.over} Ov</div>
                    </div>
                  ))}
                </div>}
                {/* Summary pills */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {fowList.map((f,i)=><span key={i} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:800, color:"#f87171" }}>{f.score}/{f.wickets}</span>)}
                </div>
              </> : <div style={{ textAlign:"center", color:theme.textSecondary, padding:40 }}>No wickets fallen yet.</div>}
            </div>
          </div>
        </div>
      );
    }

    // ── BOWLER SPOTLIGHT — Centered oval design ──────────────────────────
    if (isBowlerSp) {
      const eco=bowler&&bowler.ballsBowled>0?((bowler.runsConceded/bowler.ballsBowled)*match.ballsPerOver).toFixed(2):"0.00";
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"fixed", inset:0, zIndex:0, background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(6,182,212,0.15),transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1, width:"62vw", display:"flex", flexDirection:"column", alignItems:"center" }}>
            {renderCustomOverlay()}{renderMom()}
            <div className="slide-up" style={{ marginBottom:20 }}>
              <TeamLogo name={currentBowlTeam} isBatting={false} isBowling={true} accentColor="#06b6d4" borderColor="#06b6d4" size={88} />
            </div>
            <div className="scale-in" style={{ background:"linear-gradient(180deg,rgba(8,30,40,0.7),rgba(4,6,15,0.98) 50%)", border:`2px solid #06b6d4`, borderTop:"6px solid #06b6d4", borderRadius:20, padding:"40px 48px", textAlign:"center", minWidth:"100%", boxShadow:"0 32px 80px rgba(6,182,212,0.25)" }}>
              <div style={{ fontSize:11, color:"#22d3ee", fontWeight:800, letterSpacing:4, marginBottom:8 }}>⚡ BOWLING SPOTLIGHT · CURRENT SPELL</div>
              <div style={{ fontSize:48, fontWeight:950, color:"#fff", letterSpacing:1, marginBottom:4, textShadow:"0 0 30px rgba(239,68,68,0.4)" }}>{scoringState.bowler||"No Bowler"}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginTop:28, marginBottom:scoringState.thisOver.length>0?28:0 }}>
                {[{l:"WICKETS",v:bowler?.wickets??0,c:"#ef4444"},{l:"RUNS",v:bowler?.runsConceded??0,c:"#fff"},{l:"OVERS",v:fmtOv(bowler?.ballsBowled??0,match.ballsPerOver),c:theme.accentText},{l:"ECONOMY",v:eco,c:parseFloat(eco)<8?"#4ade80":"#f87171"}].map((st,i)=>(
                  <div key={i} style={{ background:i===0?"rgba(239,68,68,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${i===0?"#ef4444":"rgba(255,255,255,0.08)"}30`, borderRadius:18, padding:"20px 14px" }}>
                    <div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:2, marginBottom:8 }}>{st.l}</div>
                    <div style={{ fontSize:34, fontWeight:950, color:st.c }}>{st.v}</div>
                  </div>
                ))}
              </div>
              {scoringState.thisOver.length>0&&<>
                <div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:2, marginBottom:12 }}>THIS OVER</div>
                <div style={{ display:"flex", justifyContent:"center", gap:10 }}>
                  {(() => {
                    const bpo = match.ballsPerOver || 6;
                    const thisOver = scoringState.thisOver || [];
                    const extrasCount = thisOver.filter((b) => b === "Nb" || b === "WNb" || b === "Wd").length;
                    const totalCircles = bpo + extrasCount;
                    return Array.from({ length: totalCircles }).map((_, i) => (
                      <BallCircle key={i} val={thisOver[i]} ballColors={theme.ballColors} borderColor={theme.borderColor} size={40} />
                    ));
                  })()}
                </div>
              </>}
            </div>
          </div>
        </div>
      );
    }

    // ── TARGET — Giant equation with progress bar ────────────────────────
    if (isTarget) {
      const need=Math.max(0,(scoringState.target||0)-scoringState.score);
      const bLeft=Math.max(0,match.overs*match.ballsPerOver-scoringState.balls);
      const rrr=bLeft>0?((need/bLeft)*match.ballsPerOver).toFixed(2):"0.00";
      const pct=scoringState.target?Math.min(100,(scoringState.score/scoringState.target)*100):0;
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"relative", zIndex:1, width:"68vw" }}>
            {renderCustomOverlay()}{renderMom()}
            <div className="slide-up" style={{ background:`linear-gradient(90deg, #ea580c, #f97316)`, borderTop:`4px solid #fdba74`, borderRadius:"16px 16px 0 0", padding:"20px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(234,88,12,0.3)" }}>
              <TeamLogo name={currentBatTeam} isBatting={true} isBowling={false} accentColor="#ea580c" borderColor="#ea580c" size={70} />
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:10, color:"#ffedd5", fontWeight:800, letterSpacing:4 }}>MATCH EQUATION</div>
                <div style={{ fontSize:16, fontWeight:900, color:"#fff", marginTop:4 }}>CHASING {scoringState.target} RUNS</div>
              </div>
              <TeamLogo name={currentBowlTeam} isBatting={false} isBowling={true} accentColor="#ea580c" borderColor="#ea580c" size={70} />
            </div>
            <div style={{ background:"rgba(18,8,2,0.99)", border:`2px solid rgba(249,115,22,0.35)`, borderTop:"none", borderRadius:"0 0 16px 16px", padding:"40px 56px", textAlign:"center", boxShadow:"0 20px 40px rgba(0,0,0,0.8)" }}>
              {scoringState.target!==null ? <>
                <div style={{ fontSize:13, color:theme.textSecondary, fontWeight:800, letterSpacing:4, marginBottom:8 }}>{currentBatTeam.toUpperCase()} REQUIRE</div>
                <div style={{ fontSize:110, fontWeight:950, color:theme.accentText, lineHeight:1, textShadow:`0 0 60px ${theme.accent}50,0 8px 24px rgba(0,0,0,0.8)`, marginBottom:4 }}>{need}</div>
                <div style={{ fontSize:18, color:"#94a3b8", fontWeight:700, marginBottom:36 }}>runs to win</div>
                {/* Progress bar */}
                <div style={{ marginBottom:32 }}>
                  <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${theme.accent},${theme.borderColor})`, borderRadius:4 }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:theme.textSecondary, fontWeight:700 }}>
                    <span>0</span><span style={{ color:theme.accentText, fontWeight:900 }}>{scoringState.score} scored</span><span>TARGET {scoringState.target}</span>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
                  {[{l:"TARGET",v:scoringState.target,c:theme.accent},{l:"BALLS LEFT",v:bLeft,c:"#fff"},{l:"CURR RR",v:calcRR(scoringState),c:"#4ade80"},{l:"REQ RR",v:rrr,c:parseFloat(rrr)>12?"#ef4444":parseFloat(rrr)>9?"#f97316":"#4ade80"}].map((st,i)=>(
                    <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${theme.borderColor}20`, borderRadius:18, padding:"20px 14px" }}>
                      <div style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:2, marginBottom:8 }}>{st.l}</div>
                      <div style={{ fontSize:28, fontWeight:950, color:st.c }}>{st.v}</div>
                    </div>
                  ))}
                </div>
              </> : <div style={{ color:theme.textSecondary, fontSize:16, padding:40 }}>Target not yet set.</div>}
            </div>
          </div>
        </div>
      );
    }

    // ── PARTNERSHIP — VS battle side panels ─────────────────────────────
    if (isPartner) {
      const pRuns=(striker?.runs||0)+(nonStriker?.runs||0);
      const pBalls=(striker?.balls||0)+(nonStriker?.balls||0);
      const pSR=pBalls>0?((pRuns/pBalls)*100).toFixed(1):"0.0";
      const stCont=pRuns>0?Math.round(((striker?.runs||0)/pRuns)*100):50;
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"fixed", inset:0, zIndex:0, background:"radial-gradient(ellipse 70% 50% at 50% 50%,rgba(16,185,129,0.15),transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1, width:"75vw" }}>
            {renderCustomOverlay()}{renderMom()}
            <div className="slide-up" style={{ background:`linear-gradient(90deg,rgba(2,44,23,0.96),#064e3b,rgba(2,44,23,0.96))`, border:`2px solid #10b981`, borderRadius:"16px 16px 0 0", padding:"18px 36px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(16,185,129,0.25)" }}>
              <div>
                <div style={{ fontSize:9, color:"#34d399", fontWeight:800, letterSpacing:3, marginBottom:2 }}>ACTIVE PARTNERSHIP</div>
                <div style={{ fontSize:20, fontWeight:900, color:"#fff" }}>{currentBatTeam.toUpperCase()} BATTING</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#a7f3d0", fontWeight:700 }}>PARTNERSHIP</div>
                <div style={{ fontSize:40, fontWeight:950, color:"#10b981", lineHeight:1 }}>{pRuns}</div>
                <div style={{ fontSize:10, color:"#a7f3d0" }}>{pBalls} balls · SR {pSR}</div>
              </div>
              <TeamLogo name={currentBatTeam} isBatting={true} isBowling={false} accentColor="#10b981" borderColor="#10b981" size={70} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 1fr", background:"rgba(2,12,6,0.98)", border:`2px solid rgba(16,185,129,0.2)`, borderTop:"none", borderRadius:"0 0 16px 16px", overflow:"hidden", boxShadow:"0 20px 40px rgba(0,0,0,0.8)" }}>
              {/* Striker */}
              <div style={{ padding:"36px 32px", borderRight:"1px solid rgba(74,222,128,0.1)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  <div style={{ position:"relative", width:12, height:12 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px #4ade80", display:"block", margin:"auto" }} /><span className="striker-dot-ring" /></div>
                  <span style={{ fontSize:9, color:"#4ade80", fontWeight:900, letterSpacing:2 }}>ON STRIKE 🏏</span>
                </div>
                <div style={{ fontSize:24, fontWeight:950, color:"#fff", marginBottom:8 }}>{scoringState.striker||"—"}</div>
                <div style={{ fontSize:64, fontWeight:950, color:"#4ade80", lineHeight:1, marginBottom:4 }}>{striker?.runs??0}</div>
                <div style={{ fontSize:14, color:theme.textSecondary, marginBottom:16 }}>({striker?.balls??0} balls)</div>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:10, padding:"6px 14px", fontSize:13, color:"#fbbf24", fontWeight:900 }}>{striker?.fours??0}×4s</div>
                  <div style={{ background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)", borderRadius:10, padding:"6px 14px", fontSize:13, color:"#38bdf8", fontWeight:900 }}>{striker?.sixes??0}×6s</div>
                </div>
              </div>
              {/* Contribution split */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 8px", background:"rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.12)", fontWeight:900, marginBottom:20 }}>VS</div>
                <div style={{ width:8, height:120, background:"rgba(255,255,255,0.06)", borderRadius:4, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:`${stCont}%`, background:"linear-gradient(180deg,#4ade80,#16a34a)", borderRadius:4 }} />
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${100-stCont}%`, background:"linear-gradient(180deg,#38bdf8,#0284c7)", borderRadius:4 }} />
                </div>
                <div style={{ marginTop:12, fontSize:9, color:theme.textSecondary, fontWeight:700, textAlign:"center" }}>{stCont}% | {100-stCont}%</div>
              </div>
              {/* Non-striker */}
              <div style={{ padding:"36px 32px", borderLeft:"1px solid rgba(74,222,128,0.1)", textAlign:"right" }}>
                <div style={{ fontSize:9, color:theme.textSecondary, fontWeight:900, letterSpacing:2, marginBottom:16 }}>NON-STRIKER</div>
                <div style={{ fontSize:24, fontWeight:950, color:"#fff", marginBottom:8 }}>{scoringState.nonStriker||"—"}</div>
                <div style={{ fontSize:64, fontWeight:950, color:theme.accentText, lineHeight:1, marginBottom:4 }}>{nonStriker?.runs??0}</div>
                <div style={{ fontSize:14, color:theme.textSecondary, marginBottom:16 }}>({nonStriker?.balls??0} balls)</div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <div style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:10, padding:"6px 14px", fontSize:13, color:"#fbbf24", fontWeight:900 }}>{nonStriker?.fours??0}×4s</div>
                  <div style={{ background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)", borderRadius:10, padding:"6px 14px", fontSize:13, color:"#38bdf8", fontWeight:900 }}>{nonStriker?.sixes??0}×6s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── SQUADS — Jersey-numbered two-column ──────────────────────────────
    if (isSquads) {
      return (
        <div className="fade-in" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:activeFont, overflow:"hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position:"relative", zIndex:1, width:"92vw" }}>
            {renderCustomOverlay()}{renderMom()}
            <div className="slide-up" style={{ background:`linear-gradient(90deg,#1e3a8a,#0f172a,#1e3a8a)`, border:`2px solid rgba(59,130,246,0.4)`, borderRadius:"16px 16px 0 0", padding:"20px 36px", display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", boxShadow:"0 4px 20px rgba(30,58,138,0.3)" }}>
              <TeamLogo name={match.team1Name} isBatting={team1IsBatting} isBowling={!team1IsBatting} accentColor="#3b82f6" borderColor="#3b82f6" size={80} />
              <div style={{ textAlign:"center", padding:"0 24px" }}>
                <div style={{ fontSize:10, color:"#93c5fd", fontWeight:800, letterSpacing:3, marginBottom:4 }}>PLAYING SQUADS</div>
                <div style={{ fontSize:18, fontWeight:900, color:"#fff" }}>PLAYING XI</div>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <TeamLogo name={match.team2Name} isBatting={!team1IsBatting} isBowling={team1IsBatting} accentColor="#3b82f6" borderColor="#3b82f6" size={80} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:"rgba(10,15,30,0.99)", border:`2px solid rgba(59,130,246,0.25)`, borderTop:"none", borderRadius:"0 0 16px 16px", overflow:"hidden", boxShadow:"0 20px 40px rgba(0,0,0,0.8)" }}>
              {[{name:match.team1Name,players:match.playersTeam1||[],isBat:team1IsBatting},{name:match.team2Name,players:match.playersTeam2||[],isBat:!team1IsBatting}].map((team,ti)=>(
                <div key={ti} style={{ padding:"24px 28px", borderRight:ti===0?`1px solid ${theme.borderColor}20`:"none" }}>
                  <div style={{ fontSize:11, fontWeight:900, color:team.isBat?"#4ade80":"#f87171", letterSpacing:2, marginBottom:16 }}>{team.name.toUpperCase()} · {team.isBat?"🏏 BATTING":"🎯 BOWLING"}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {team.players.length>0 ? team.players.map((p,i)=>{
                      const isSt=p===scoringState.striker; const isNS=p===scoringState.nonStriker; const isBwl=p===scoringState.bowler;
                      return <div key={i} className="table-row-animated" style={{ animationDelay:`${i*0.04}s`, display:"flex", alignItems:"center", gap:12, background:isSt?"rgba(74,222,128,0.08)":isBwl?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${isSt?"#4ade80":isBwl?"#ef4444":theme.borderColor}20`, borderRadius:12, padding:"10px 14px" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:`${theme.borderColor}20`, border:`1px solid ${theme.borderColor}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:theme.borderColor, flexShrink:0 }}>{i+1}</div>
                        <span style={{ fontSize:14, fontWeight:700, color:isSt?"#4ade80":isBwl?"#fca5a5":"#fff" }}>{p}</span>
                        {isSt&&<span style={{ marginLeft:"auto", fontSize:12 }} className="bat-swing">🏏</span>}
                        {isNS&&!isSt&&<span style={{ marginLeft:"auto", fontSize:12 }}>🏃</span>}
                        {isBwl&&<span style={{ marginLeft:"auto", fontSize:12 }}>⚡</span>}
                      </div>;
                    }) : <div style={{ fontSize:12, color:theme.textSecondary }}>No players registered.</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  // ════════════════════ 6. DEFAULT LOWER THIRD ════════════════════
  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:isPreview?"center":"flex-end", padding:isPreview?"80px 0 28px":"0 0 28px", fontFamily:activeFont, overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {/* Full cricket ground background */}
      <GroundBG bgUrl={theme.bgUrl} />

      {isPreview&&<div style={{ position:"fixed", top:0, left:0, right:0, background:"rgba(0,0,0,0.92)", backdropFilter:"blur(8px)", color:"#fbbf24", padding:"9px 20px", fontSize:11, fontWeight:900, letterSpacing:2.5, zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
        <span style={{ display:"flex", alignItems:"center", gap:6 }}><span className="live-dot" style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", display:"inline-block" }} />PREVIEW MODE</span>
        <span style={{ color:"rgba(255,255,255,0.3)" }}>—</span><span style={{ color:"#93c5fd" }}>{theme.name} Theme</span>
        <span style={{ color:"#4b5563", fontSize:10 }}>| OBS: remove ?preview=true from URL</span>
      </div>}
      {renderCustomOverlay()}{renderMom()}

      {scoringState.inningsStarted ? (
        <div className="slide-up" style={{ width:"90vw", position:"relative", zIndex:1 }}>
          {/* Brand bar */}
          <div style={{ background:"linear-gradient(90deg,rgba(5,7,26,0.98),rgba(10,14,46,0.95))", borderTop:`3px solid ${theme.borderColor}`, borderLeft:`3px solid ${theme.borderColor}60`, borderRight:`3px solid ${theme.borderColor}60`, borderRadius:"18px 18px 0 0", padding:"9px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span className="live-dot" style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", boxShadow:"0 0 8px #ef4444", display:"inline-block" }} />
              <span style={{ color:theme.accentText, fontWeight:900, fontSize:13, letterSpacing:2 }}>{match.team1Name.toUpperCase()} <span style={{ color:"rgba(255,255,255,0.3)", margin:"0 6px" }}>vs</span> {match.team2Name.toUpperCase()}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ color:theme.textSecondary, fontWeight:700, fontSize:10, letterSpacing:1.5 }}>{theme.name.toUpperCase()}</span>
              <span style={{ color:`${theme.borderColor}50` }}>•</span>
              <span style={{ color:theme.accentText, fontWeight:800, fontSize:10 }}>INN {scoringState.inningsNo}</span>
            </div>
          </div>

          {/* Main score panel with team logos */}
          <div style={{ backgroundImage:`linear-gradient(rgba(6,8,28,0.95),rgba(8,12,40,0.97)),url(${theme.bgUrl})`, backgroundSize:"cover", backgroundPosition:"center", backdropFilter:"blur(16px)", border:`2px solid ${theme.borderColor}45`, borderTop:"none", overflow:"hidden", boxShadow:`0 12px 40px rgba(0,0,0,0.6)` }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"16px 22px", gap:16 }}>
              {/* Left: Team 1 logo + batsmen or bowler info */}
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <TeamLogo name={match.team1Name} isBatting={team1IsBatting} isBowling={!team1IsBatting} accentColor={theme.accent} borderColor={theme.borderColor} size={54} />
                <div style={{ flex:1 }}>
                  {team1IsBatting ? <>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <div style={{ position:"relative", width:8, height:8, flexShrink:0 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80", display:"block" }} /><span className="striker-dot-ring" style={{ width:12, height:12 }} /></div>
                      <span style={{ color:"#fff", fontWeight:900, fontSize:13 }}>{scoringState.striker||"—"}</span>
                      <span style={{ color:theme.accentText, fontWeight:900, fontSize:12, marginLeft:3 }}>{striker?.runs??0}<span style={{ color:theme.textSecondary, fontSize:9 }}>({striker?.balls??0})</span></span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, paddingLeft:14 }}>
                      <span style={{ color:theme.textSecondary, fontSize:11 }}>{scoringState.nonStriker||"—"}</span>
                      <span style={{ color:theme.textSecondary, fontSize:10, marginLeft:3 }}>{nonStriker?.runs??0}<span style={{ fontSize:8 }}>({nonStriker?.balls??0})</span></span>
                    </div>
                  </> : <>
                    <div style={{ color:"#fff", fontWeight:900, fontSize:13, marginBottom:2 }}>{scoringState.bowler||"—"}</div>
                    <div style={{ color:theme.accentText, fontSize:11, fontWeight:800 }}>{bowler?.wickets??0}-{bowler?.runsConceded??0} <span style={{ color:theme.textSecondary, fontSize:9 }}>({fmtOv(bowler?.ballsBowled??0,match.ballsPerOver)})</span></div>
                  </>}
                </div>
              </div>

              {/* Center: Big score */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"0 24px", borderLeft:`1px solid ${theme.borderColor}25`, borderRight:`1px solid ${theme.borderColor}25` }}>
                <div style={{ fontSize:50, fontWeight:950, color:theme.scoreText, lineHeight:1, letterSpacing:-1, textShadow:`0 0 24px ${theme.accent}50` }}>{scoringState.score}-{scoringState.wickets}</div>
                <div style={{ color:theme.textSecondary, fontSize:10, fontWeight:800, marginTop:3, letterSpacing:1 }}>{fmtOv(scoringState.balls,match.ballsPerOver)}/{match.overs} OVR · RR:{calcRR(scoringState)}</div>
                {scoringState.target!==null&&<div style={{ marginTop:5, background:`${theme.accent}22`, border:`1px solid ${theme.accent}50`, borderRadius:6, padding:"2px 10px", color:theme.accent, fontSize:9, fontWeight:900, letterSpacing:1.5 }}>TGT:{scoringState.target} | NEED:{Math.max(0,scoringState.target-scoringState.score)}</div>}
              </div>

              {/* Right: Team 2 logo + info */}
              <div style={{ display:"flex", alignItems:"center", gap:14, justifyContent:"flex-end" }}>
                <div style={{ flex:1, textAlign:"right" }}>
                  {!team1IsBatting ? <>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:6, marginBottom:4 }}>
                      <span style={{ color:theme.accentText, fontWeight:900, fontSize:12 }}>{striker?.runs??0}<span style={{ color:theme.textSecondary, fontSize:9 }}>({striker?.balls??0})</span></span>
                      <span style={{ color:"#fff", fontWeight:900, fontSize:13 }}>{scoringState.striker||"—"}</span>
                      <div style={{ position:"relative", width:8, height:8, flexShrink:0 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80", display:"block" }} /><span className="striker-dot-ring" style={{ width:12, height:12 }} /></div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:6, paddingRight:14 }}>
                      <span style={{ color:theme.textSecondary, fontSize:10 }}>{nonStriker?.runs??0}<span style={{ fontSize:8 }}>({nonStriker?.balls??0})</span></span>
                      <span style={{ color:theme.textSecondary, fontSize:11 }}>{scoringState.nonStriker||"—"}</span>
                    </div>
                  </> : <>
                    <div style={{ color:"#fff", fontWeight:900, fontSize:13, marginBottom:2 }}>{scoringState.bowler||"—"}</div>
                    <div style={{ color:theme.accentText, fontSize:11, fontWeight:800 }}>{bowler?.wickets??0}-{bowler?.runsConceded??0} <span style={{ color:theme.textSecondary, fontSize:9 }}>({fmtOv(bowler?.ballsBowled??0,match.ballsPerOver)})</span></div>
                  </>}
                </div>
                <TeamLogo name={match.team2Name} isBatting={!team1IsBatting} isBowling={team1IsBatting} accentColor={theme.accent} borderColor={theme.borderColor} size={54} />
              </div>
            </div>

            {/* This over strip */}
            <div style={{ padding:"8px 22px", display:"flex", alignItems:"center", gap:10, borderTop:`1px solid ${theme.borderColor}20`, background:"rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize:9, color:theme.textSecondary, fontWeight:800, letterSpacing:1.5, flexShrink:0 }}>THIS OVER</span>
              <div style={{ display:"flex", gap:5 }}>
                {(() => {
                  const bpo = match?.ballsPerOver || 6;
                  const thisOver = scoringState.thisOver || [];
                  const extrasCount = thisOver.filter((b) => b === "Nb" || b === "WNb" || b === "Wd").length;
                  const totalCirclesCount = bpo + extrasCount;
                  return Array.from({ length: totalCirclesCount }).map((_, i) => (
                    <BallCircle key={i} val={scoringState.thisOver[i]} ballColors={theme.ballColors} borderColor={theme.borderColor} size={26} />
                  ));
                })()}
              </div>
              <div style={{ marginLeft:"auto", display:"flex", gap:16 }}>
                <div style={{ fontSize:10, fontWeight:800, color:theme.textSecondary }}>CRR: <span style={{ color:theme.accent }}>{calcRR(scoringState)}</span></div>
                {scoringState.target!==null&&<div style={{ fontSize:10, fontWeight:800, color:theme.textSecondary }}>RRR: <span style={{ color:"#4ade80" }}>{(((scoringState.target-scoringState.score)/Math.max(1,match.overs*match.ballsPerOver-scoringState.balls))*match.ballsPerOver).toFixed(2)}</span></div>}
              </div>
            </div>
          </div>

          {/* Target ticker */}
          {scoringState.target!==null&&<div style={{ background:`linear-gradient(90deg,${theme.accent}12,transparent,${theme.accent}12)`, border:`2px solid ${theme.borderColor}25`, borderTop:`1px solid ${theme.borderColor}15`, borderRadius:"0 0 18px 18px", padding:"8px 22px", display:"flex", gap:20, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
            {[{l:"CRR",v:calcRR(scoringState),c:theme.accent},{l:"NEED",v:`${Math.max(0,scoringState.target-scoringState.score)} RUNS`,c:"#f87171"},{l:"FROM",v:`${Math.max(0,match.overs*match.ballsPerOver-scoringState.balls)} BALLS`,c:theme.accentText},{l:"RRR",v:(((scoringState.target-scoringState.score)/Math.max(1,match.overs*match.ballsPerOver-scoringState.balls))*match.ballsPerOver).toFixed(2),c:"#4ade80"}].map((it,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:theme.textSecondary, fontWeight:800, fontSize:10, letterSpacing:1 }}>{it.l}:</span>
                <span style={{ color:it.c, fontWeight:900, fontSize:11 }}>{it.v}</span>
                {i<3&&<span style={{ color:`${theme.borderColor}35`, marginLeft:8 }}>|</span>}
              </div>
            ))}
          </div>}
        </div>
      ) : (
        /* Match not started */
        <div className="scale-in" style={{ position:"relative", zIndex:1, background:"linear-gradient(rgba(8,10,28,0.94),rgba(8,10,28,0.97))", border:`2px solid ${theme.borderColor}`, borderRadius:22, padding:"32px 48px", textAlign:"center", boxShadow:`0 12px 40px rgba(0,0,0,0.6),0 0 24px ${theme.borderColor}20`, width:"90vw" }}>
          <div style={{ display:"flex", justifyContent:"center", gap:48, marginBottom:24 }}>
            <TeamLogo name={match.team1Name} isBatting={false} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={90} />
            <div style={{ display:"flex", alignItems:"center" }}><span style={{ color:"rgba(255,255,255,0.12)", fontSize:36, fontWeight:900 }}>VS</span></div>
            <TeamLogo name={match.team2Name} isBatting={false} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={90} />
          </div>
          <div style={{ color:theme.accentText, fontWeight:950, fontSize:18, letterSpacing:3 }}>🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}</div>
          <div style={{ color:theme.textSecondary, fontSize:11, fontWeight:700, marginTop:8, letterSpacing:3 }}>MATCH NOT STARTED</div>
        </div>
      )}
    </div>
  );
}
