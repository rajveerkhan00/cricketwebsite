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
  history: Omit<ScoringState, "history">[];
  firstInnings?: { score: number; wickets: number; balls: number; overs: number; batsmen: BatsmanStats[]; bowlers: BowlerStats[]; fallOfWickets: FallOfWicket[]; };
}
interface Match {
  _id: string;
  tournamentId: string;
  userId: string;
  team1Name: string;
  team2Name: string;
  overs: number;
  matchNo: number;
  tossWonBy: "team1" | "team2";
  optedTo: "Bat" | "Bowl";
  matchTied: boolean;
  ballsPerOver: number;
  matchType: string;
  status: "Not Started" | "Live" | "Completed";
  playersTeam1?: string[];
  playersTeam2?: string[];
  scoringState: ScoringState | null;
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
  "ipl-2025": { name: "IPL 2025", primaryBg: "rgba(4,6,35,0.96)", secondaryBg: "rgba(8,12,55,0.85)", accent: "#fbbf24", accentText: "#fde68a", textPrimary: "#ffffff", textSecondary: "#e0e7ff", scoreBg: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(255, 255, 255, 0.18))", scoreText: "#fde68a", borderColor: "#f59e0b", headerBg: "rgba(248, 249, 251, 0.99)", ballColors: { runs: "#4338ca", four: "#fbbf24", six: "#f59e0b", wicket: "#ef4444", extra: "#34d399" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "crioverlay-green": { name: "CriOverlay Green", primaryBg: "rgba(9,13,22,0.97)", secondaryBg: "rgba(15,22,38,0.95)", accent: "#76ff03", accentText: "#b2ff59", textPrimary: "#ffffff", textSecondary: "#ccff90", scoreBg: "rgba(118,255,3,0.15)", scoreText: "#76ff03", borderColor: "#76ff03", headerBg: "rgba(5,10,18,0.99)", ballColors: { runs: "#76ff03", four: "#fbbf24", six: "#f97316", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "" },
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

const PANEL_THEMES: Record<string, {
  bg: string;
  border: string;
  borderLeft: string;
  accent: string;
  accentText: string;
  textSecondary: string;
  shadow: string;
  radius: string;
  font?: string;
}> = {
  "asia-cup": {
    bg: "#192E68",
    border: "2px solid #0F172B",
    borderLeft: "5px solid #0F172B",
    accent: "#fbbf24",
    accentText: "#f2f0ebff",
    textSecondary: "#bbf7d0",
    shadow: "0 8px 32px #0F172B",
    radius: "10px"
  },
  "cwc-19": {
    bg: "#000000",
    border: "2px solid #38bdf840",
    borderLeft: "5px solid #38bdf8",
    accent: "#e0f2fe",
    accentText: "#7dd3fc",
    textSecondary: "#bae6fd",
    shadow: "0 8px 32px rgba(56, 189, 248, 0.25)",
    radius: "10px"
  },
  "champions-trophy-2025": {
    bg: "#0A1128",
    border: "2px solid #34d39940",
    borderLeft: "5px solid #00CC44",
    accent: "#00CC44",
    accentText: "#f6f9f8ff",
    textSecondary: "#f2f7f5ff",
    shadow: "0 8px 32px rgba(52, 211, 153, 0.25)",
    radius: "10px"
  },
  "cwc-25-india": {
    bg: "rgba(12, 10, 35, 0.95)",
    border: "2px solid #fb923c40",
    borderLeft: "5px solid #027ABA",
    accent: "#eef0f2ff",
    accentText: "#f8f4f1ff",
    textSecondary: "#fed7aa",
    shadow: "0 8px 32px rgba(251, 146, 60, 0.25)",
    radius: "12px"
  },
  "wcl-fancode": {
    bg: "#0284C7",
    border: "2px solid #f0abfc40",
    borderLeft: "5px solid #111827",
    accent: "#f7f4f7ff",
    accentText: "#f8f4f8ff",
    textSecondary: "#f5d0fe",
    shadow: "0 8px 32px rgba(240, 171, 252, 0.25)",
    radius: "12px"
  },
  "cwc-23-india": {
    bg: "rgba(8, 12, 40, 0.95)",
    border: "2px solid #f9731640",
    borderLeft: "5px solid #D946EF",
    accent: "#D946EF",
    accentText: "#f9f5faff",
    textSecondary: "#e0e7ff",
    shadow: "0 8px 32px rgba(249, 115, 22, 0.25)",
    radius: "10px"
  },
  "bbl-black": {
    bg: "#1E1254",
    border: "2px solid #4ade8040",
    borderLeft: "5px solid #F5C511",
    accent: "#F5C511",
    accentText: "#f5fbf7ff",
    textSecondary: "#f0f5f2ff",
    shadow: "0 8px 32px rgba(74, 222, 128, 0.25)",
    radius: "8px",
    font: "'Orbitron', sans-serif"
  },
  "cricfusion": {
    bg: "rgba(20, 4, 40, 0.95)",
    border: "2px solid #c026d340",
    borderLeft: "5px solid #D92D20",
    accent: "#f4efefff",
    accentText: "#fdfbfbff",
    textSecondary: "#ede9fe",
    shadow: "0 8px 22px #D92D20",
    radius: "12px"
  },
  "t20-emerging-asia-cup": {
    bg: "rgba(15, 18, 25, 0.95)",
    border: "2px solid #ef444440",
    borderLeft: "5px solid #F56B13",
    accent: "#F56B13",
    accentText: "#f7f3f3ff",
    textSecondary: "#f2f4f7ff",
    shadow: "0 8px 32px rgba(239, 68, 68, 0.25)",
    radius: "10px"
  },
  "sa20": {
    bg: "rgba(4, 20, 12, 0.95)",
    border: "2px solid #eab30840",
    borderLeft: "5px solid #eab308",
    accent: "#facc15",
    accentText: "#f8f7f2ff",
    textSecondary: "#fef9c3",
    shadow: "0 8px 32px rgba(234, 179, 8, 0.25)",
    radius: "12px",
    font: "'Rubik', sans-serif"
  },
  "jiocinema": {
    bg: "#CE1741",
    border: "2px solid #3b82f640",
    borderLeft: "5px solid #323344",
    accent: "#ececf3ff",
    accentText: "#f0f2f5ff",
    textSecondary: "#dbeafe",
    shadow: "0 8px 32px rgba(59, 130, 246, 0.25)",
    radius: "10px",
    font: "'Rubik', sans-serif"
  },
  "ipl": {
    bg: "#162756",
    border: "2px solid #f59e0b40",
    borderLeft: "5px solid #f59e0b",
    accent: "#fbbf24",
    accentText: "#f6f5f0ff",
    textSecondary: "#edeef2ff",
    shadow: "0 8px 32px rgba(245, 158, 11, 0.25)",
    radius: "12px"
  },
  "wt20-2024": {
    bg: "rgba(8, 0, 22, 0.96)",
    border: "2px solid #7c3aed40",
    borderLeft: "5px solid #7c3aed",
    accent: "#a78bfa",
    accentText: "#c4b5fd",
    textSecondary: "#ede9fe",
    shadow: "0 8px 32px rgba(124, 58, 237, 0.25)",
    radius: "10px"
  },
  "bbl-starsports": {
    bg: "rgba(0, 30, 10, 0.95)",
    border: "2px solid #dc262640",
    borderLeft: "5px solid #fbbf24",
    accent: "#fbbf24",
    accentText: "#fca5a5",
    textSecondary: "#dcfce7",
    shadow: "0 8px 32px rgba(220, 38, 38, 0.25)",
    radius: "8px",
    font: "'Orbitron', sans-serif"
  },
  "ipl-2025": {
    bg: "#251253",
    border: "2px solid #f59e0b40",
    borderLeft: "5px solid #f59e0b",
    accent: "#ffffffff",
    accentText: "hsla(60, 5%, 96%, 1.00)ff",
    textSecondary: "rgba(235, 236, 242, 1)4, 231, 255, 1)",
    shadow: "0 8px 32px rgba(245, 158, 11, 0.25)",
    radius: "14px"
  },
  "crioverlay-green": {
    bg: "linear-gradient(180deg, #050b14 0%, #0b1324 100%)",
    border: "1.5px solid #76ff0340",
    borderLeft: "5px solid #76ff03",
    accent: "#76ff03",
    accentText: "#f6f9f4ff",
    textSecondary: "#edefebff",
    shadow: "0 8px 32px rgba(118, 255, 3, 0.25)",
    radius: "14px",
    font: "'Montserrat', sans-serif"
  }
};


// ── Real tournament stats aggregation (computed from actual match data) ──────
const computePlayerTournamentStats = (matches: Match[], name: string) => {
  if (!name || !matches.length) return null;
  let totalRuns = 0, totalBalls = 0, totalFours = 0, totalSixes = 0;
  let innings = 0, notOuts = 0, highestScore = 0, highestNotOut = false;
  let totalWkts = 0, totalRunsConceded = 0, totalBallsBowled = 0;
  let bestWkts = 0, bestRuns = 999;

  for (const m of matches) {
    const ss = m.scoringState;
    if (!ss) continue;
    // Collect all innings (current + firstInnings)
    const allInnings = [ss, ...(ss.firstInnings ? [ss.firstInnings] : [])];
    for (const inn of allInnings) {
      // Batting
      const bat = inn.batsmen?.find((b: BatsmanStats) => b.name === name);
      if (bat && bat.balls > 0) {
        innings++;
        totalRuns += bat.runs;
        totalBalls += bat.balls;
        totalFours += bat.fours;
        totalSixes += bat.sixes;
        if (!bat.out) notOuts++;
        if (
          bat.runs > highestScore ||
          (bat.runs === highestScore && !bat.out)
        ) {
          highestScore = bat.runs;
          highestNotOut = !bat.out;
        }
      }
      // Bowling
      const bowl = inn.bowlers?.find((bw: BowlerStats) => bw.name === name);
      if (bowl && bowl.ballsBowled > 0) {
        totalWkts += bowl.wickets;
        totalRunsConceded += bowl.runsConceded;
        totalBallsBowled += bowl.ballsBowled;
        // Track best spell
        if (
          bowl.wickets > bestWkts ||
          (bowl.wickets === bestWkts && bowl.runsConceded < bestRuns)
        ) {
          bestWkts = bowl.wickets;
          bestRuns = bowl.runsConceded;
        }
      }
    }
  }

  if (innings === 0 && totalBallsBowled === 0) return null;

  const dismissals = innings - notOuts;
  const avg = dismissals > 0 ? (totalRuns / dismissals).toFixed(2) : innings > 0 ? "N/O" : "—";
  const sr = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : "—";
  const hs = `${highestScore}${highestNotOut ? "*" : ""}`;
  const economy = totalBallsBowled > 0
    ? ((totalRunsConceded / totalBallsBowled) * 6).toFixed(2)
    : "—";
  const best = bestWkts > 0 ? `${bestWkts}/${bestRuns}` : "—";
  const bowlAvg = totalWkts > 0 ? (totalRunsConceded / totalWkts).toFixed(2) : "—";
  const bowlSr = totalWkts > 0 ? (totalBallsBowled / totalWkts).toFixed(1) : "—";

  return {
    matches: matches.filter(m => {
      const ss = m.scoringState;
      if (!ss) return false;
      const allInns = [ss, ...(ss.firstInnings ? [ss.firstInnings] : [])];
      return allInns.some(inn =>
        inn.batsmen?.some((b: BatsmanStats) => b.name === name && b.balls > 0) ||
        inn.bowlers?.some((bw: BowlerStats) => bw.name === name && bw.ballsBowled > 0)
      );
    }).length,
    runs: totalRuns,
    avg,
    sr,
    hs,
    fours: totalFours,
    sixes: totalSixes,
    wickets: totalWkts,
    economy,
    best,
    bowlAvg,
    bowlSr,
    runsConceded: totalRunsConceded,
  };
};

const getPointsTable = (match: Match, themeSlug: string, plusOne: boolean) => {
  const t1 = match.team1Name; const t2 = match.team2Name;
  let others = ["CSK", "MI", "RCB", "KKR", "SRH", "LSG"];
  if (["asia-cup", "cwc-19", "cwc-23-india", "cwc-25-india", "wt20-2024"].includes(themeSlug)) others = ["IND", "AUS", "ENG", "RSA", "NZL", "PAK"];
  else if (["bbl-black", "bbl-starsports"].includes(themeSlug)) others = ["SYS", "AS", "BH", "MS", "PS", "MR"];
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
  html, body { background: transparent !important; }
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
  .slide-up {
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    zoom: 1.35 !important;
    width: 73vw !important;
  }
  .animate-slide-up {
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .striker-dot-ring { position:absolute; width:16px; height:16px; border-radius:50%; border:2px solid #4ade80; animation:strikerPing 1.4s cubic-bezier(0,0,0.2,1) infinite; }
  .live-dot { animation: livePulse 1.2s ease-in-out infinite; }
  .table-row-animated { animation: rowIn 0.3s ease forwards; }
  .bat-swing { display:inline-block; animation: batSwing 1.6s ease-in-out infinite; }
  /* Sleek custom scrollbars for vertical scrolling in scoreboards */
  .scroll-vertical::-webkit-scrollbar {
    width: 6px;
  }
  .scroll-vertical::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
  }
  .scroll-vertical::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
  .scroll-vertical::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  @media print {
    .no-print { display: none !important; }
    html, body {
      background: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
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

// Global variables to transfer countdown state to GroundBG without prop drilling
let globalRemainingSeconds = 0;
let globalIsPreview = false;
let globalIsPrint = false;

// ── Full screen cricket ground background ───────────────────────────────────
function GroundBG({ bgUrl }: { bgUrl: string }) {
  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {(globalIsPreview || globalIsPrint) && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0, backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.14) saturate(0.5)", pointerEvents: "none" }} />
      )}
      {!globalIsPreview && !globalIsPrint && globalRemainingSeconds > 0 && (
        <div style={{
          position: "fixed",
          top: 16,
          left: 16,
          background: "rgba(2, 6, 23, 0.9)",
          border: "1.5px solid rgba(251, 191, 36, 0.5)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 15px rgba(251, 191, 36, 0.25)",
          borderRadius: 9999,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#fff",
          fontSize: 12,
          fontWeight: 900,
          zIndex: 9999,
          backdropFilter: "blur(12px)",
          pointerEvents: "none",
          fontFamily: "monospace"
        }}>
          <span style={{ fontSize: 14 }}>⏳</span>
          <span style={{ letterSpacing: "1px", color: "rgba(255,255,255,0.7)" }}>UNLOCKED TIMER:</span>
          <span style={{ color: "#fbbf24", fontSize: 13, textShadow: "0 0 4px rgba(251, 191, 36, 0.5)" }}>
            {formatCountdown(globalRemainingSeconds)}
          </span>
        </div>
      )}
    </>
  );
}

const isExtraBall = (b: string | undefined | null) => {
  if (!b) return false;
  return b.includes("Wd") || b.includes("Nb") || b.includes("WNb");
};

const renderOutcomeText = (val: string | undefined | null, size: number) => {
  if (!val) return "";
  if (val.includes("+")) {
    const parts = val.split("+");
    const top = parts[0];
    const bottom = parts.slice(1).join("+"); // handles W+Nb+2 → bottom = "Nb+2"
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 0.95 }}>
        <span style={{ fontSize: size * 0.31, fontWeight: 950 }}>{top}</span>
        <span style={{ fontSize: size * 0.20, fontWeight: 950 }}>{bottom}</span>
      </div>
    );
  }
  return val;
};

// ── Ball outcome circle ─────────────────────────────────────────────────────
function BallCircle({ val, ballColors, borderColor, size = 28 }: { val?: string; ballColors: Record<string, string>; borderColor: string; size?: number }) {
  let bg = `${borderColor}18`, color = "#64748b", shadow = "none";
  if (val) {
    if (val === "W" || val.startsWith("W+")) { bg = ballColors.wicket; color = "#fff"; shadow = `0 0 10px ${ballColors.wicket}`; }
    else if (val === "6") { bg = ballColors.six; color = "#000"; shadow = `0 0 10px ${ballColors.six}`; }
    else if (val === "4") { bg = ballColors.four; color = "#000"; shadow = `0 0 10px ${ballColors.four}`; }
    else if (isExtraBall(val)) { bg = ballColors.extra; color = "#fff"; }
    else { bg = ballColors.runs; color = "#fff"; }
  }

  const getStyle = (text: string) => {
    if (!text) return { fontSize: size * 0.38, letterSpacing: "normal" };
    if (text.length >= 5) return { fontSize: size * 0.17, letterSpacing: "-0.8px" };
    if (text.length === 4) return { fontSize: size * 0.20, letterSpacing: "-0.6px" };
    if (text.length === 3) return { fontSize: size * 0.24, letterSpacing: "-0.4px" };
    if (text.length === 2) return { fontSize: size * 0.30, letterSpacing: "normal" };
    return { fontSize: size * 0.38, letterSpacing: "normal" };
  };

  const { fontSize, letterSpacing } = getStyle(val || "");

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      color,
      boxShadow: shadow,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: val && val.includes("+") ? undefined : fontSize,
      letterSpacing: val && val.includes("+") ? undefined : letterSpacing,
      fontWeight: 900,
      border: val ? "none" : `1px solid ${borderColor}20`,
      flexShrink: 0,
      whiteSpace: "nowrap",
      lineHeight: 1
    }}>
      {renderOutcomeText(val, size)}
    </div>
  );
}

// Demo match and scoring state for preview mode
const demoMatch: Match = {
  _id: "demo-match-id",
  tournamentId: "demo-tournament-id",
  userId: "demo-user-id",
  team1Name: "India",
  team2Name: "Australia",
  overs: 20,
  matchNo: 1,
  tossWonBy: "team1",
  optedTo: "Bat",
  matchTied: false,
  ballsPerOver: 6,
  matchType: "Group Stage",
  status: "Live",
  playersTeam1: ["Virat Kohli", "Rohit Sharma", "MS Dhoni"],
  playersTeam2: ["Steve Smith", "David Warner", "Pat Cummins"],
  scoringState: {
    battingTeam: "team1",
    bowlingTeam: "team2",
    inningsStarted: true,
    inningsNo: 1,
    striker: "Virat Kohli",
    nonStriker: "Rohit Sharma",
    bowler: "Pat Cummins",
    score: 125,
    wickets: 2,
    balls: 86,
    overs: 14.2,
    target: null,
    thisOver: ["1", "2", "4", "6", "."],
    batsmen: [
      { name: "Virat Kohli", runs: 65, balls: 42, fours: 8, sixes: 3, out: false },
      { name: "Rohit Sharma", runs: 45, balls: 35, fours: 6, sixes: 2, out: false },
      { name: "MS Dhoni", runs: 15, balls: 10, fours: 2, sixes: 1, out: true },
    ],
    bowlers: [
      { name: "Pat Cummins", runsConceded: 45, ballsBowled: 24, wickets: 1 },
      { name: "Steve Smith", runsConceded: 30, ballsBowled: 18, wickets: 1 },
    ],
    fallOfWickets: [
      { score: 45, wickets: 1, over: 5.3, batsman: "Rohit Sharma" },
      { score: 80, wickets: 2, over: 9.5, batsman: "MS Dhoni" },
    ],
    animation: null,
    displayScreen: "default",
    customInputText: "",
    momPlayer: "",
    tournamentStatsPlayer: "",
    decision: null,
    displayStatsMode: null,
    history: [],
  },
};

export default function OverlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params?.id as string;
  const themeSlug = searchParams?.get("theme") || "ipl";
  const isPreview = searchParams?.get("preview") === "true";
  const isPrint = searchParams?.get("print") === "true";
  const screenParam = searchParams?.get("screen") || ""; // e.g. SUMMARY, FULLSCORE
  const theme = THEME_MAP[themeSlug] || DEFAULT_THEME;
  const activeFont = THEME_FONTS[themeSlug] || "'Space Grotesk', sans-serif";

  const tStyle = PANEL_THEMES[themeSlug] || {
    bg: theme.primaryBg,
    border: `2px solid ${theme.borderColor}60`,
    borderLeft: `5px solid ${theme.accent}`,
    accent: theme.accent,
    accentText: theme.accentText,
    textSecondary: theme.textSecondary,
    shadow: `0 8px 40px rgba(0,0,0,0.82), 0 0 24px ${theme.accent}25`,
    radius: "18px",
    font: activeFont
  };

  const panelAccent = tStyle.accent;
  const panelBorder = tStyle.border;
  const panelBorderLeft = tStyle.borderLeft;
  const panelAccentTx = tStyle.accentText;
  const panelSecondary = tStyle.textSecondary;
  const panelBg = tStyle.bg;
  const panelShadow = tStyle.shadow;
  const panelRadius = tStyle.radius;
  const panelFont = tStyle.font || activeFont;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [currentAnim, setCurrentAnim] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);

  // Helper to look up real tournament stats for a player
  const getPlayerTournamentStats = (name: string) =>
    computePlayerTournamentStats(tournamentMatches.length > 0 ? tournamentMatches : match ? [match] : [], name);

  // The email used to check/grant access (from URL param or entered by user)
  const emailParam = searchParams?.get("email") || "";
  const [userEmail, setUserEmail] = useState(emailParam);

  // Payment form states
  const [formEmail, setFormEmail] = useState("");
  const [formSender, setFormSender] = useState("");
  const [formTrxId, setFormTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");

  // Sync to global for GroundBG countdown display
  globalRemainingSeconds = remainingSeconds;
  globalIsPreview = isPreview;
  globalIsPrint = isPrint;

  // Check if user has active ScoreboardAccess for this theme
  const checkAccess = async (emailToCheck?: string) => {
    if (isPreview) { setAccessGranted(true); setAccessChecked(true); return; }

    const email = (emailToCheck || userEmail || emailParam || "").toLowerCase().trim();

    try {
      const res = await fetch(
        `/api/scoreboard-access?email=${encodeURIComponent(email)}&themeSlug=${encodeURIComponent(themeSlug)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.hasAccess) {
          setAccessGranted(true);
          setRemainingSeconds(data.remainingSeconds);
          if (email && email.includes("@")) {
            setUserEmail(email);
          }
          return;
        }
      }
      setAccessGranted(false);
    } catch {
      setAccessGranted(false);
    } finally {
      setAccessChecked(true);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formSender.trim() || !formTrxId.trim()) {
      setSubmitErr("All fields are required.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    setSubmitErr("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          senderNumber: formSender,
          trxId: formTrxId,
          itemName: themeSlug,
          itemPrice: "PKR 250",
          themeSlug,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg(data.message || "Payment verified! Scoreboard unlocking...");
        // Check access immediately with submitted email
        setTimeout(() => checkAccess(formEmail), 1000);
      } else {
        setSubmitErr(data.message || "Failed to submit.");
      }
    } catch {
      setSubmitErr("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to check valid ObjectId
  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  const fetchMatch = async () => {
    // Use demo match if preview, no matchId, or matchId is "overlay"
    if (isPreview || !matchId || matchId === "overlay") {
      setMatch(demoMatch);
      setLoading(false);
      return;
    }

    if (matchId === "active") {
      try {
        const res = await fetch(`/api/matches/active?email=${encodeURIComponent(userEmail)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.match) {
          setMatch(data.match);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isValidObjectId(matchId)) {
      setMatch(demoMatch);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/matches/${matchId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMatch(data.match);
    } catch (_) {
    } finally { setLoading(false); }
  };

  // Poll only if valid matchId and not preview
  useEffect(() => {
    fetchMatch();
    if (matchId && (isValidObjectId(matchId) || matchId === "active") && !isPreview) {
      const interval = setInterval(fetchMatch, 3000);
      return () => clearInterval(interval);
    }
  }, [matchId, isPreview, userEmail]);

  // Fetch all matches in the same tournament for real stats aggregation
  useEffect(() => {
    if (!match?.tournamentId || match.tournamentId === "demo-tournament-id") return;
    fetch(`/api/matches?tournamentId=${match.tournamentId}`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.matches && Array.isArray(data.matches)) {
          setTournamentMatches(data.matches);
        }
      })
      .catch(() => { });
  }, [match?.tournamentId]);

  // Poll access every 8 seconds — instantly picks up admin approve/reject
  // Always call once on mount (handles preview mode immediately too)
  useEffect(() => {
    checkAccess(); // always run once — handles isPreview early-return inside
    if (!matchId || isPreview) return; // skip polling in preview
    const interval = setInterval(() => checkAccess(), 8000);
    return () => clearInterval(interval);
  }, [matchId, themeSlug, userEmail, emailParam, isPreview]);

  // Live countdown tick
  useEffect(() => {
    if (!accessGranted || remainingSeconds <= 0) return;
    const timer = setInterval(() => setRemainingSeconds(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(timer);
  }, [accessGranted, remainingSeconds]);

  // Manage animation overlays client-side for exactly 3 seconds
  useEffect(() => {
    const anim = match?.scoringState?.animation;
    if (anim) {
      if (anim !== "INNINGS BREAK" && anim !== "TOUR BOUNDARIES") {
        setCurrentAnim(anim);
        const timer = setTimeout(() => {
          setCurrentAnim(null);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setCurrentAnim(anim);
      }
    } else {
      setCurrentAnim(null);
    }
  }, [match?.scoringState?.animation]);

  // Auto-trigger print/PDF dialog when ?print=true param is present
  useEffect(() => {
    if (isPrint) {
      const timer = setTimeout(() => { window.print(); }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isPrint, match]);

  const fmtOv = (balls: number, bpo = 6) => `${Math.floor(balls / bpo)}.${balls % bpo}`;
  const calcRR = (state: ScoringState) => (!match || state.balls === 0) ? "0.00" : (state.score / (state.balls / match.ballsPerOver)).toFixed(2);
  const scoringState = match?.scoringState;

  // Active notification string resolution
  let activeNotification = "";
  if (scoringState) {
    if (currentAnim) {
      if (currentAnim === "FOUR") activeNotification = "✨ BOUNDARY: FOUR!";
      else if (currentAnim === "SIX") activeNotification = "🚀 MAXIMUM: SIX!";
      else if (currentAnim === "WICKET") activeNotification = "🔴 OUT! WICKET TAKEN";
      else if (currentAnim === "FREE HIT") activeNotification = "⚡ FREE HIT!";
      else if (currentAnim === "HAT-TRICK BALL") activeNotification = "🔥 HAT-TRICK BALL!";
      else if (currentAnim === "INNINGS BREAK") activeNotification = "🏏 INNINGS BREAK";
      else if (currentAnim === "TOUR BOUNDARIES") activeNotification = "🎇 TOURNAMENT BOUNDARIES";
      else activeNotification = currentAnim.toUpperCase();
    } else if (scoringState.decision) {
      if (scoringState.decision === "PENDING") activeNotification = "⚖️ REVIEW IN PROGRESS";
      else if (scoringState.decision === "OUT") activeNotification = "🔴 DECISION: OUT!";
      else if (scoringState.decision === "NOT OUT") activeNotification = "🟢 DECISION: NOT OUT";
      else activeNotification = `DECISION: ${scoringState.decision}`;
    } else if (scoringState.customInputText) {
      activeNotification = scoringState.customInputText.toUpperCase();
    } else if (match?.status === "Completed") {
      // Auto-inject winner message when match is completed and no custom text is set
      const bat2 = scoringState.battingTeam === "team1" ? match.team1Name : match.team2Name;
      const bowl2 = scoringState.battingTeam === "team1" ? match.team2Name : match.team1Name;
      const winnerBanner = scoringState.target !== null
        ? (scoringState.score >= scoringState.target
          ? `🏆 ${bat2} WON BY ${Math.max(0, 10 - scoringState.wickets)} WICKETS`
          : `🏆 ${bowl2} WON BY ${Math.max(0, (scoringState.target ?? 0) - scoringState.score - 1)} RUNS`)
        : "🏆 MATCH COMPLETED";
      activeNotification = winnerBanner;
    }
  }

  // Get dynamic background gradient & text color based on the type of notification
  const getNotificationStyles = (text: string) => {
    let bg = "linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)";
    let textColor = "#ffffff";
    if (text.includes("WICKET") || text.includes("OUT")) {
      bg = "linear-gradient(90deg, #7f1d1d 0%, #ef4444 50%, #7f1d1d 100%)";
    } else if (text.includes("SIX") || text.includes("FOUR") || text.includes("BOUNDARY")) {
      bg = "linear-gradient(90deg, #7c2d12 0%, #eab308 50%, #7c2d12 100%)";
      textColor = "#000000";
    } else if (text.includes("FREE HIT") || text.includes("NOT OUT")) {
      bg = "linear-gradient(90deg, #064e3b 0%, #10b981 50%, #064e3b 100%)";
    } else if (text.includes("REVIEW") || text.includes("PENDING")) {
      bg = "linear-gradient(90deg, #78350f 0%, #d97706 50%, #78350f 100%)";
    }
    return { bg, textColor };
  };

  if (loading || !accessChecked) return (
    <div style={{ background: "transparent", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: activeFont }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 52, height: 52, border: "4px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ fontWeight: 800, letterSpacing: 3, fontSize: 13, color: "#94a3b8" }}>LOADING OVERLAY...</div>
      </div>
    </div>
  );

  if (!accessGranted) {
    return (
      <div style={{ background: "linear-gradient(135deg,#020617,#0b0f19)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, padding: "32px 24px", color: "#fff" }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ width: "100%", maxWidth: 500, background: "rgba(13, 17, 39, 0.75)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px", borderRadius: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 10, filter: "drop-shadow(0 0 20px rgba(251,180,18,0.3))" }}>🔒</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 6 }}>Scoreboard Locked</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              Unlock <span style={{ color: theme.accent, fontWeight: 800 }}>{theme.name}</span> for 24 hours — unlocks instantly after payment.
            </p>
          </div>

          {/* JazzCash Instructions */}
          <div style={{ background: "rgba(255,182,18,0.05)", border: "1px solid rgba(255,182,18,0.15)", borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#ffb612", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>💳 Pay via JazzCash</div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: 13, alignItems: "center" }}>
              <span style={{ color: "#64748b" }}>Number:</span>
              <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#fff", fontSize: 15 }}>01021410502</span>
              <span style={{ color: "#64748b" }}>Name:</span>
              <span style={{ fontWeight: 800, color: "#fff" }}>MUHAMMAD RASHID</span>
              <span style={{ color: "#64748b" }}>Amount:</span>
              <span style={{ fontWeight: 900, color: "#ffb612", fontSize: 16 }}>PKR 250</span>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
              Send PKR 250 → get TID from JazzCash → fill below → unlocks instantly ✅
            </div>
          </div>

          {/* New Payment Form */}
          <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: 1 }}>Your Email</label>
              <input type="email" required placeholder="email@example.com" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                style={{ background: "#060919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: 1 }}>Your JazzCash Number</label>
              <input type="text" required placeholder="e.g. 03001234567" value={formSender} onChange={e => setFormSender(e.target.value)}
                style={{ background: "#060919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: 1 }}>Transaction ID (TID)</label>
              <input type="text" required placeholder="TID from JazzCash app" value={formTrxId} onChange={e => setFormTrxId(e.target.value)}
                style={{ background: "#060919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", textTransform: "uppercase" }} />
            </div>
            {submitErr && (
              <div style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "10px 14px", borderRadius: 10 }}>❌ {submitErr}</div>
            )}
            {submitMsg && (
              <div style={{ fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", padding: "10px 14px", borderRadius: 10, lineHeight: 1.5 }}>✅ {submitMsg}</div>
            )}
            <button type="submit" disabled={submitting}
              style={{ background: submitting ? "#334155" : "linear-gradient(135deg, #ffb612, #ea580c)", border: "none", borderRadius: 12, padding: "14px", color: submitting ? "#94a3b8" : "#000", fontWeight: 900, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
              {submitting ? "⏳ Verifying..." : "🔓 Unlock Scoreboard"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>ALREADY PAID?</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Email-only unlock for users who paid via pricing page */}
          <form onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.currentTarget.elements.namedItem("existingEmail") as HTMLInputElement).value.trim().toLowerCase();
            if (!email) return;
            await checkAccess(email);
          }} style={{ display: "flex", gap: 8 }}>
            <input name="existingEmail" type="email" required placeholder="Email used when you paid"
              style={{ flex: 1, background: "#060919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            <button type="submit"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 10, padding: "11px 16px", color: "#a5b4fc", fontWeight: 800, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}>
              Check Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!match || !scoringState) return (
    <div style={{ background: "transparent", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontWeight: 800, fontFamily: activeFont, fontSize: 18 }}>
      <style>{GLOBAL_CSS}</style>🏏 MATCH DATA NOT STARTED
    </div>
  );

  const striker = scoringState.batsmen.find(b => b.name === scoringState.striker);
  const nonStriker = scoringState.batsmen.find(b => b.name === scoringState.nonStriker);
  const bowler = scoringState.bowlers.find(bw => bw.name === scoringState.bowler);
  const currentBatTeam = scoringState.battingTeam === "team1" ? match.team1Name : match.team2Name;
  const currentBowlTeam = scoringState.bowlingTeam === "team1" ? match.team1Name : match.team2Name;
  const team1IsBatting = scoringState.battingTeam === "team1";

  // ── Compute winner text once, used across all 15 themes ──────────────────
  const bowl2ndTeam = scoringState.battingTeam === "team1" ? match.team2Name : match.team1Name;
  const winnerText = match.status === "Completed"
    ? (scoringState.target !== null
      ? (scoringState.score >= scoringState.target
        ? `🏆 ${currentBatTeam} won by ${Math.max(0, 10 - scoringState.wickets)} wicket${Math.max(0, 10 - scoringState.wickets) === 1 ? "" : "s"}`
        : `🏆 ${bowl2ndTeam} won by ${Math.max(0, (scoringState.target ?? 0) - scoringState.score - 1)} run${Math.max(0, (scoringState.target ?? 0) - scoringState.score - 1) === 1 ? "" : "s"}`)
      : "🏆 Match Completed")
    : "";

  // Auto-inject winner as fallback status text for all theme status lines
  if (winnerText && !scoringState.customInputText) {
    scoringState.customInputText = winnerText;
  }

  // Override displayScreen if ?screen= param is provided in URL (used for PDF printing)
  if (screenParam) {
    scoringState.displayScreen = screenParam.toUpperCase();
  }

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

  const renderCustomOverlay = () => null;

  const renderMom = () => !scoringState.momPlayer ? null : (
    <div style={{ position: "fixed", top: isPreview ? 120 : 64, right: 24, background: theme.headerBg, border: `2px solid ${theme.accent}`, boxShadow: `0 0 20px ${theme.accent}30`, borderRadius: 18, padding: "14px 26px", zIndex: 900, textAlign: "center", fontFamily: activeFont }}>
      <div style={{ fontSize: 9, color: theme.textSecondary, marginBottom: 3, letterSpacing: 2, fontWeight: 800 }}>🌟 MAN OF THE MATCH</div>
      <div style={{ fontSize: 16, color: theme.accent, fontWeight: 900 }}>{scoringState.momPlayer.toUpperCase()}</div>
    </div>
  );


  // ════════════════════════════════════════════════════════════════

  // ════════════════════ 1. ANIMATION ════════════════════
  // Bypassed: Animations are displayed inside the scoreboards' status bars/last sections

  // ════════════════════ 2. DECISION ════════════════════
  // Bypassed: Decisions are displayed inside the scoreboards' status bars/last sections

  // ── B1 / B2: floating left-side batter stats panel (scoreboard stays visible) ──
  const isBatterPanel = scoringState.displayScreen && (scoringState.displayScreen.toUpperCase() === "B1" || scoringState.displayScreen.toUpperCase() === "B2");
  const batterPanelPlayer = isBatterPanel
    ? (scoringState.displayScreen.toUpperCase() === "B1" ? scoringState.striker : scoringState.nonStriker)
    : null;
  const batterPanelLabel = scoringState.displayScreen?.toUpperCase() === "B1" ? "🏏 ON STRIKE" : "🏃 NON-STRIKER";
  const batterPanelIsStriker = scoringState.displayScreen?.toUpperCase() === "B1";
  const batterPanelStats = batterPanelPlayer ? getPlayerTournamentStats(batterPanelPlayer) : null;

  // ── BOWLER: floating right-side bowler stats panel (scoreboard stays visible) ──
  const isBowlerPanel = scoringState.displayScreen && scoringState.displayScreen.toUpperCase() === "BOWLER";
  const bowlerPanelPlayer = isBowlerPanel ? scoringState.bowler : null;
  const bowlerPanelStats = bowlerPanelPlayer ? getPlayerTournamentStats(bowlerPanelPlayer) : null;

  const renderBatterStatsPanel = () => {
    const renderBatterContent = () => {
      if (!isBatterPanel || !batterPanelPlayer) return null;
      // Use real stats if available; fall back to zeros for a player who hasn't batted yet
      const stats = batterPanelStats ?? { runs: 0, avg: "—", sr: "—", hs: "—", fours: 0, sixes: 0, wickets: 0, economy: "—", best: "—", matches: 0 };

      return (
        <div
          className="animate-slide-up"
          style={{
            position: "fixed",
            left: 20,
            top: 50,
            zIndex: 50,
            width: 210,
            background: panelBg,
            border: panelBorder,
            borderLeft: panelBorderLeft,
            borderRadius: panelRadius,
            overflow: "hidden",
            boxShadow: panelShadow,
            fontFamily: panelFont,
          }}
        >
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${theme.headerBg}, ${theme.primaryBg})`, borderBottom: `1px solid ${theme.borderColor}30`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 7.5, color: panelAccent, fontWeight: 900, letterSpacing: 2, marginBottom: 2, textTransform: "uppercase" }}>{batterPanelLabel} · Tournament</div>
              <div style={{ fontSize: 13, fontWeight: 950, color: theme.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{batterPanelPlayer.toUpperCase()}</div>
            </div>
            {/* Live indicator dot — uses theme accent */}
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: panelAccent, boxShadow: `0 0 8px ${panelAccent}`, flexShrink: 0 }} />
          </div>

          {/* Stats grid — all colours from theme */}
          <div style={{ padding: "10px 9px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { l: "RUNS", v: stats.runs, c: panelAccent },
              { l: "AVG", v: stats.avg, c: panelAccentTx },
              { l: "SR", v: stats.sr, c: panelAccentTx },
              { l: "H/S", v: stats.hs, c: panelAccent },
              { l: "4s", v: stats.fours, c: panelSecondary },
              { l: "6s", v: stats.sixes, c: panelSecondary },
            ].map((item, i) => (
              <div key={i} style={{
                background: `${theme.headerBg}B0`,
                border: `1px solid ${theme.borderColor}25`,
                borderTop: i < 2 ? `2px solid ${panelAccent}50` : `1px solid ${theme.borderColor}25`,
                borderRadius: 10,
                padding: "7px 5px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 7, color: panelSecondary, fontWeight: 900, letterSpacing: 1.5, marginBottom: 3 }}>{item.l}</div>
                <div style={{ fontSize: 16, fontWeight: 950, color: item.c, lineHeight: 1 }}>{item.v}</div>
              </div>
            ))}
          </div>

          {/* Matches pill */}
          <div style={{ margin: "0 9px 10px", background: `${panelAccent}18`, border: `1px solid ${panelAccent}35`, borderRadius: 8, padding: "5px 8px", textAlign: "center", fontSize: 8.5, color: panelAccentTx, fontWeight: 900, letterSpacing: 1.5 }}>
            {stats.matches} TOURNAMENT MATCH{stats.matches !== 1 ? "ES" : ""}
          </div>
        </div>
      );
    };

    return (
      <>
        {renderBatterContent()}
        {renderBowlerStatsPanel()}
        {renderBattingCard()}
        {renderBowlingCard()}
      </>
    );
  };

  const renderBowlerStatsPanel = () => {
    if (!isBowlerPanel || !bowlerPanelPlayer) return null;
    // Use real stats if available; fall back to zeros/defaults for a bowler with no stats yet
    const stats = bowlerPanelStats ?? { wickets: 0, economy: "—", bowlAvg: "—", bowlSr: "—", best: "—", runsConceded: 0, matches: 0 };

    return (
      <div
        className="animate-slide-up"
        style={{
          position: "fixed",
          right: 20,
          top: 50,
          zIndex: 50,
          width: 210,
          background: panelBg,
          border: panelBorder,
          borderLeft: panelBorderLeft,
          borderRadius: panelRadius,
          overflow: "hidden",
          boxShadow: panelShadow,
          fontFamily: panelFont,
        }}
      >
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${theme.headerBg}, ${theme.primaryBg})`, borderBottom: `1px solid ${theme.borderColor}30`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 7.5, color: panelAccent, fontWeight: 900, letterSpacing: 2, marginBottom: 2, textTransform: "uppercase" }}>🏏 ACTIVE BOWLER · Tournament</div>
            <div style={{ fontSize: 13, fontWeight: 950, color: theme.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bowlerPanelPlayer.toUpperCase()}</div>
          </div>
          {/* Live indicator dot */}
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: panelAccent, boxShadow: `0 0 8px ${panelAccent}`, flexShrink: 0 }} />
        </div>

        {/* Stats grid */}
        <div style={{ padding: "10px 9px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { l: "WKTS", v: stats.wickets ?? 0, c: panelAccent },
            { l: "ECON", v: stats.economy ?? "—", c: panelAccentTx },
            { l: "AVG", v: (stats as any).bowlAvg ?? "—", c: panelAccentTx },
            { l: "SR", v: (stats as any).bowlSr ?? "—", c: panelAccent },
            { l: "BEST", v: stats.best ?? "—", c: panelSecondary },
            { l: "RUNS", v: (stats as any).runsConceded ?? 0, c: panelSecondary },
          ].map((item, i) => (
            <div key={i} style={{
              background: `${theme.headerBg}B0`,
              border: `1px solid ${theme.borderColor}25`,
              borderTop: i < 2 ? `2px solid ${panelAccent}50` : `1px solid ${theme.borderColor}25`,
              borderRadius: 10,
              padding: "7px 5px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 7, color: panelSecondary, fontWeight: 900, letterSpacing: 1.5, marginBottom: 3 }}>{item.l}</div>
              <div style={{ fontSize: 16, fontWeight: 950, color: item.c, lineHeight: 1 }}>{item.v}</div>
            </div>
          ))}
        </div>

        {/* Matches pill */}
        <div style={{ margin: "0 9px 10px", background: `${panelAccent}18`, border: `1px solid ${panelAccent}35`, borderRadius: 8, padding: "5px 8px", textAlign: "center", fontSize: 8.5, color: panelAccentTx, fontWeight: 900, letterSpacing: 1.5 }}>
          {stats.matches} TOURNAMENT MATCH{stats.matches !== 1 ? "ES" : ""}
        </div>
      </div>
    );
  };

  // ── BATTING CARD: fixed centered overlay — scoreboard stays visible ──
  const renderBattingCard = () => {
    const ds = scoringState.displayScreen?.toUpperCase() || "";
    const isY1Bat = ds === "Y1BAT" || ds === "1BAT";
    const isY2Bat = ds === "Y2BAT" || ds === "2BAT";
    if (!isY1Bat && !isY2Bat) return null;
    const inn = (isY1Bat ? 1 : 2) as 1 | 2;
    const innData = getInnState(inn);
    const batTeam = getInnTeam(inn, "bat");
    const bowlTeam = getInnTeam(inn, "bowl");
    return (
      <div className="animate-slide-up" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "min(88vw, 900px)", background: panelBg, border: panelBorder, borderLeft: panelBorderLeft, borderRadius: panelRadius, overflow: "hidden", boxShadow: panelShadow, fontFamily: panelFont, pointerEvents: "auto" }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${theme.headerBg}ee, ${theme.headerBg}aa)`, borderBottom: `2px solid ${panelAccent}30`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <TeamLogo name={batTeam} isBatting={scoringState.inningsNo === inn} isBowling={false} accentColor={panelAccent} borderColor={panelAccent} size={56} />
              <div>
                <div style={{ fontSize: 8, color: panelSecondary, fontWeight: 800, letterSpacing: 3, marginBottom: 2, textTransform: "uppercase" }}>Innings {inn} · Batting Scorecard</div>
                <div style={{ fontSize: 20, fontWeight: 950, color: panelAccentTx }}>{batTeam.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: panelSecondary, marginTop: 1 }}>vs {bowlTeam.toUpperCase()}</div>
              </div>
            </div>
            {innData && <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 40, fontWeight: 950, color: panelAccent, lineHeight: 1 }}>{innData.score}/{innData.wickets}</div>
              <div style={{ fontSize: 10, color: panelSecondary, fontWeight: 700, marginTop: 2 }}>{fmtOv(innData.balls, match.ballsPerOver)} / {match.overs} OVS</div>
            </div>}
          </div>
          {/* Table */}
          <div className="scroll-vertical" style={{ overflowY: "auto", maxHeight: "54vh" }}>
            {innData ? <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: panelFont }}>
                <thead><tr style={{ background: `${panelAccent}15`, borderBottom: `2px solid ${panelAccent}30` }}>
                  {["BATSMAN", "STATUS", "R", "B", "4s", "6s", "SR"].map((h, i) => <th key={h} style={{ padding: "10px 14px", fontSize: 9, fontWeight: 900, textAlign: i === 0 ? "left" : "center", color: panelSecondary, letterSpacing: 2 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {innData.batsmen.map((b, idx) => {
                    const isSt = b.name === scoringState.striker && scoringState.inningsNo === inn;
                    const isNS = b.name === scoringState.nonStriker && scoringState.inningsNo === inn;
                    return <tr key={idx} className="table-row-animated" style={{ animationDelay: `${idx * 0.05}s`, borderBottom: `1px solid ${panelAccent}12`, background: isSt ? `${panelAccent}18` : isNS ? `${panelAccent}08` : "transparent", borderLeft: isSt ? `4px solid ${panelAccent}` : isNS ? `4px solid ${panelAccent}50` : "4px solid transparent" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {isSt && <span style={{ width: 7, height: 7, borderRadius: "50%", background: panelAccent, boxShadow: `0 0 8px ${panelAccent}`, display: "inline-block", flexShrink: 0 }} />}
                          <span style={{ fontWeight: 900, fontSize: 14, color: b.out ? "#6b7280" : panelAccentTx }}>{b.name}</span>
                          {isSt && <span className="bat-swing" style={{ fontSize: 12 }}>🏏</span>}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}><span style={{ background: b.out ? "rgba(239,68,68,0.15)" : `${panelAccent}20`, border: `1px solid ${b.out ? "#ef4444" : panelAccent}40`, borderRadius: 6, padding: "3px 9px", fontSize: 9, fontWeight: 900, color: b.out ? "#ef4444" : panelAccent }}>{b.out ? "OUT" : "BATTING"}</span></td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 950, fontSize: 18, color: b.runs >= 50 ? panelAccent : panelAccentTx }}>{b.runs}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontSize: 13, color: panelSecondary }}>{b.balls}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontSize: 13, color: "#fbbf24", fontWeight: 800 }}>{b.fours}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontSize: 13, color: "#38bdf8", fontWeight: 800 }}>{b.sixes}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontSize: 13, color: panelAccentTx, fontWeight: 800 }}>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
              <div style={{ background: `${panelAccent}12`, borderTop: `2px solid ${panelAccent}30`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: panelSecondary }}>INN {inn} TOTAL</div>
                <div style={{ fontSize: 20, fontWeight: 950, color: panelAccentTx }}>{innData.score}/{innData.wickets} <span style={{ fontSize: 11, color: panelSecondary, fontWeight: 600 }}>({fmtOv(innData.balls, match.ballsPerOver)}/{match.overs} OVS)</span></div>
              </div>
            </> : <div style={{ textAlign: "center", color: panelSecondary, padding: 40 }}>No scorecard data.</div>}
          </div>
        </div>
      </div>
    );
  };

  // ── BOWLING CARD: fixed centered overlay — scoreboard stays visible ──
  const renderBowlingCard = () => {
    const ds = scoringState.displayScreen?.toUpperCase() || "";
    const isY1Ball = ds === "Y1BALL" || ds === "1BALL";
    const isY2Ball = ds === "Y2BALL" || ds === "2BALL";
    if (!isY1Ball && !isY2Ball) return null;
    const inn = (isY1Ball ? 1 : 2) as 1 | 2;
    const innData = getInnState(inn);
    const bowlTeam = getInnTeam(inn, "bowl");
    const batTeam = getInnTeam(inn, "bat");
    return (
      <div className="animate-slide-up" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "min(88vw, 900px)", background: panelBg, border: panelBorder, borderLeft: panelBorderLeft, borderRadius: panelRadius, overflow: "hidden", boxShadow: panelShadow, fontFamily: panelFont, pointerEvents: "auto" }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${theme.headerBg}ee, ${theme.headerBg}aa)`, borderBottom: `2px solid ${panelAccent}30`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <TeamLogo name={bowlTeam} isBatting={false} isBowling={scoringState.inningsNo === inn} accentColor={panelAccent} borderColor={panelAccent} size={56} />
              <div>
                <div style={{ fontSize: 8, color: panelSecondary, fontWeight: 800, letterSpacing: 3, marginBottom: 2, textTransform: "uppercase" }}>Innings {inn} · Bowling Figures</div>
                <div style={{ fontSize: 20, fontWeight: 950, color: panelAccentTx }}>{bowlTeam.toUpperCase()} BOWLING</div>
                <div style={{ fontSize: 9, color: panelSecondary, marginTop: 1 }}>vs {batTeam.toUpperCase()}</div>
              </div>
            </div>
            {innData && <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 950, color: panelAccent, lineHeight: 1 }}>{innData.score}/{innData.wickets}</div>
              <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 700, marginTop: 2 }}>({fmtOv(innData.balls, match.ballsPerOver)} overs)</div>
            </div>}
          </div>
          {/* Bowler cards grid */}
          <div className="scroll-vertical" style={{ padding: "20px 18px", maxHeight: "56vh", overflowY: "auto" }}>
            {innData ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(innData.bowlers.length, 1), 4)}, 1fr)`, gap: 14 }}>
                {innData.bowlers.map((bw, idx) => {
                  const isAct = scoringState.inningsNo === inn && bw.name === scoringState.bowler;
                  const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * match.ballsPerOver).toFixed(2) : "0.00";
                  return <div key={idx} className="table-row-animated" style={{ animationDelay: `${idx * 0.07}s`, background: isAct ? `linear-gradient(180deg, ${panelAccent}22, transparent)` : `${panelAccent}08`, border: `2px solid ${isAct ? panelAccent : panelAccent + "28"}`, borderRadius: 14, padding: "18px 14px", textAlign: "center", position: "relative", boxShadow: isAct ? `0 0 16px ${panelAccent}40` : "none" }}>
                    {isAct && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${panelAccent}, transparent)`, borderRadius: "14px 14px 0 0" }} />}
                    <div style={{ fontSize: 13, fontWeight: 900, color: isAct ? panelAccent : panelAccentTx, marginBottom: 2 }}>{bw.name}{isAct && <span style={{ marginLeft: 5 }}>⚡</span>}</div>
                    <div style={{ fontSize: 7, color: isAct ? panelAccent : panelSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>{isAct ? "● BOWLING NOW" : "BOWLER"}</div>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: bw.wickets > 0 ? `linear-gradient(135deg, ${panelAccent}55, ${panelAccent}cc)` : `${panelAccent}10`, border: `3px solid ${bw.wickets > 0 ? panelAccent : panelAccent + "28"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: bw.wickets > 0 ? `0 0 16px ${panelAccent}50` : "none" }}>
                      <div style={{ fontSize: 22, fontWeight: 950, color: bw.wickets > 0 ? "#fff" : panelSecondary, lineHeight: 1 }}>{bw.wickets}</div>
                      <div style={{ fontSize: 7, color: bw.wickets > 0 ? panelAccentTx : panelSecondary, fontWeight: 800 }}>WKT{bw.wickets !== 1 ? "S" : ""}</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                      {[{ l: "OVS", v: fmtOv(bw.ballsBowled, match.ballsPerOver) }, { l: "RUNS", v: bw.runsConceded }, { l: "ECO", v: eco }].map((st, si) => (
                        <div key={si} style={{ background: `${panelAccent}10`, borderRadius: 7, padding: "5px 2px" }}>
                          <div style={{ fontSize: 6, color: panelSecondary, fontWeight: 800, letterSpacing: 1, marginBottom: 2 }}>{st.l}</div>
                          <div style={{ fontSize: 12, fontWeight: 900, color: panelAccentTx }}>{st.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>;
                })}
              </div>
            ) : <div style={{ textAlign: "center", color: panelSecondary, padding: 40 }}>No bowling details.</div>}
          </div>
        </div>
      </div>
    );
  };


  // ════════════════════ 3. PLAYER SPOTLIGHT ════════════════════
  if (scoringState.tournamentStatsPlayer) {
    const pName = scoringState.tournamentStatsPlayer;
    const pStats = getPlayerTournamentStats(pName);
    return (
      <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
        <div style={{ position: "relative", zIndex: 1, width: "72vw" }}>
          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
          {/* Unique: Trophy banner header + 2-col layout */}
          <div className="animate-slide-up" style={{ background: `linear-gradient(135deg, ${theme.headerBg}, ${theme.primaryBg})`, border: `3px solid ${theme.borderColor}`, borderRadius: "40px 10px 0 0", padding: "20px 36px", display: "flex", alignItems: "center", gap: 24, boxShadow: `0 4px 20px ${theme.accent}30` }}>
            <div style={{ fontSize: 48, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>🏆</div>
            <div>
              <div style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 900, letterSpacing: 3, marginBottom: 2 }}>PLAYER SPOTLIGHT · TOURNAMENT STATS</div>
              <div style={{ fontSize: 32, fontWeight: 950, color: theme.accentText }}>{pName.toUpperCase()}</div>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(0,0,0,0.5)", color: theme.accent, fontSize: 9, fontWeight: 900, padding: "5px 14px", borderRadius: 8, letterSpacing: 2, display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${theme.borderColor}` }}>
              <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accent, display: "inline-block" }} />LIVE
            </div>
          </div>
          <div style={{ background: theme.primaryBg, border: `3px solid ${theme.borderColor}`, borderTop: "none", borderRadius: "0 0 10px 40px", padding: "32px 36px", boxShadow: `0 20px 50px rgba(0,0,0,0.8)` }}>
            {pStats ? (
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32 }}>
                <div style={{ textAlign: "center", background: `${theme.accent}08`, border: `1px solid ${theme.borderColor}30`, borderRadius: "20px 8px 20px 8px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <TeamLogo name={pName} isBatting={false} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={110} />
                  <div style={{ marginTop: 20, background: `linear-gradient(135deg, ${theme.headerBg}, ${theme.primaryBg})`, border: `1px solid ${theme.borderColor}`, borderRadius: 12, padding: "8px 16px", fontSize: 12, color: theme.accentText, fontWeight: 900 }}>{pStats.matches} Matches</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[{ l: "Total Runs", v: pStats.runs, c: theme.accent }, { l: "Highest", v: pStats.hs, c: "#fff" }, { l: "Batting Avg", v: pStats.avg, c: "#4ade80" }, { l: "Strike Rate", v: pStats.sr, c: "#38bdf8" }, { l: "Fours", v: pStats.fours, c: "#fbbf24" }, { l: "Sixes", v: pStats.sixes, c: "#f97316" }, { l: "Wickets", v: pStats.wickets || "—", c: "#f87171" }, { l: "Economy", v: pStats.economy, c: "#a78bfa" }, { l: "Best Spell", v: pStats.best, c: "#4ade80" }].map((item, i) => (
                    <div key={i} className="table-row-animated" style={{ animationDelay: `${i * 0.05}s`, background: "rgba(255,255,255,0.03)", border: `1px solid ${theme.borderColor}20`, borderRadius: 12, padding: "16px 12px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: item.c, opacity: 0.6 }} />
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{item.l}</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: item.c }}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div style={{ textAlign: "center", color: theme.textSecondary, padding: 40 }}>Player data unavailable.</div>}
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
    const allP = [...(match.playersTeam1 || []), ...(match.playersTeam2 || [])];
    return (
      <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
        <div style={{ position: "relative", zIndex: 1, width: "84vw" }}>
          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
          <div className="animate-slide-up" style={{ background: `linear-gradient(90deg,${theme.headerBg},${theme.primaryBg})`, borderTop: `4px solid ${theme.borderColor}`, borderRadius: "16px 16px 0 0", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 4px 20px ${theme.accent}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 26 }}>📊</div>
              <div>
                <div style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 800, letterSpacing: 3 }}>TOURNAMENT STATS</div>
                <div style={{ fontSize: 22, fontWeight: 950, color: theme.accentText }}>{mode.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 700 }}>{match.team1Name} vs {match.team2Name}</div>
          </div>
          <div style={{ background: theme.primaryBg, border: `2px solid ${theme.borderColor}30`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "28px 32px", boxShadow: "0 20px 40px rgba(0,0,0,0.7)" }}>
            {isPT && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: `${theme.borderColor}18`, borderBottom: `2px solid ${theme.borderColor}50` }}>
                  {["#", "TEAM", "P", "W", "L", "T", "NRR", "PTS"].map(h => <th key={h} style={{ padding: "12px 14px", fontSize: 10, fontWeight: 900, textAlign: h === "TEAM" || h === "#" ? "left" : "center", color: theme.textSecondary, letterSpacing: 1.5 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {getPointsTable(match, themeSlug, mode.includes("+1")).map((row, i) => (
                    <tr key={i} className="table-row-animated" style={{ animationDelay: `${i * 0.06}s`, borderBottom: "1px solid rgba(255,255,255,0.04)", background: (row.name === match.team1Name || row.name === match.team2Name) ? `${theme.accent}08` : "transparent" }}>
                      <td style={{ padding: "13px 14px" }}><div style={{ width: 24, height: 24, borderRadius: "50%", background: i < 4 ? `${theme.accent}25` : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: i < 4 ? theme.accent : theme.textSecondary }}>{i + 1}</div></td>
                      <td style={{ padding: "13px 14px", fontWeight: 900, fontSize: 14 }}>{row.name.toUpperCase()}</td>
                      <td style={{ padding: "13px 14px", textAlign: "center", fontSize: 13 }}>{row.p}</td>
                      <td style={{ padding: "13px 14px", textAlign: "center", fontSize: 13, color: "#4ade80", fontWeight: 800 }}>{row.w}</td>
                      <td style={{ padding: "13px 14px", textAlign: "center", fontSize: 13, color: "#f87171" }}>{row.l}</td>
                      <td style={{ padding: "13px 14px", textAlign: "center", fontSize: 13 }}>{row.t}</td>
                      <td style={{ padding: "13px 14px", textAlign: "center", fontSize: 11, fontFamily: "monospace", color: parseFloat(row.nrr) >= 0 ? "#4ade80" : "#f87171" }}>{row.nrr}</td>
                      <td style={{ padding: "13px 14px", textAlign: "center" }}><div style={{ background: i < 4 ? `${theme.accent}20` : "rgba(255,255,255,0.06)", border: `1px solid ${i < 4 ? theme.accent : "transparent"}30`, borderRadius: 8, padding: "4px 12px", fontWeight: 950, fontSize: 18, color: i < 4 ? theme.accentText : "#fff", display: "inline-block" }}>{row.pts}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(isTB || isTBo || isTSt) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
                {(isTBo ? [...(match.playersTeam2 || []), ...(match.playersTeam1 || [])] : allP).slice(0, 5).map((p, idx) => {
                  const s = getPlayerTournamentStats(p);
                  return <div key={idx} className="table-row-animated" style={{ animationDelay: `${idx * 0.08}s`, background: idx === 0 ? `linear-gradient(180deg,${isTBo ? "rgba(239,68,68,0.18)" : theme.accent + "18"},transparent)` : "rgba(255,255,255,0.03)", border: `2px solid ${idx === 0 ? isTBo ? "#ef4444" : theme.accent : theme.borderColor}25`, borderRadius: 20, padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{isTBo ? ["🔥", "💨", "⚡", "🎯", "💫"][idx] : isTSt ? "⚡" : ["🥇", "🥈", "🥉", "🏅", "🎖️"][idx]}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: theme.accentText, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</div>
                    <div style={{ fontSize: 34, fontWeight: 950, color: isTBo ? "#ef4444" : isTSt ? theme.accent : "#fff", lineHeight: 1, marginBottom: 4 }}>{isTBo ? s?.wickets || (idx + 4) : isTSt ? `SR: ${s?.sr}` : s?.runs}</div>
                    <div style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 800, letterSpacing: 1.5, marginBottom: 10 }}>{isTBo ? "WICKETS" : isTSt ? "STRIKE RATE" : "RUNS"}</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                      {isTBo ? <><span style={{ fontSize: 10, color: "#fbbf24", fontWeight: 800 }}>ECO {s?.economy !== "—" ? s?.economy : "7.24"}</span><span style={{ color: "rgba(255,255,255,0.2)" }}>|</span><span style={{ fontSize: 10, color: "#4ade80", fontWeight: 800 }}>BEST {s?.best !== "—" ? s?.best : "3/18"}</span></>
                        : isTSt ? <><span style={{ fontSize: 10, color: "#fbbf24", fontWeight: 800 }}>{s?.fours} 4s</span><span style={{ color: "rgba(255,255,255,0.2)" }}>|</span><span style={{ fontSize: 10, color: "#38bdf8", fontWeight: 800 }}>{s?.sixes} 6s</span></>
                          : <><span style={{ fontSize: 10, color: "#fbbf24", fontWeight: 800 }}>AVG {s?.avg}</span><span style={{ color: "rgba(255,255,255,0.2)" }}>|</span><span style={{ fontSize: 10, color: "#38bdf8", fontWeight: 800 }}>SR {s?.sr}</span></>}
                    </div>
                  </div>;
                })}
              </div>
            )}
            {isPOS && (() => {
              const p = allP[0] || "CRICKET SUPERSTAR"; const s = getPlayerTournamentStats(p); return (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 800, letterSpacing: 3, marginBottom: 14 }}>PLAYER OF THE TOURNAMENT</div>
                  <div style={{ display: "flex", justifyContent: "center" }}><TeamLogo name={p} isBatting={false} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={100} /></div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
                    {[{ l: "Runs", v: s?.runs ?? 342 }, { l: "Wickets", v: s?.wickets || 8 }, { l: "Avg", v: s?.avg ?? "68.4" }, { l: "SR", v: s?.sr ?? "152.8" }].map((it, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.borderColor}30`, borderRadius: 16, padding: "14px 28px" }}>
                        <div style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2 }}>{it.l}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: "#fff" }}>{it.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════ 5. FULL-SCREEN CARDS ════════════════════
  const isFS = scoringState.displayScreen && scoringState.displayScreen.toUpperCase() !== "DEFAULT!" && scoringState.displayScreen !== "default" && scoringState.displayScreen.toUpperCase() !== "MINI" && scoringState.displayScreen.toUpperCase() !== "B1" && scoringState.displayScreen.toUpperCase() !== "B2" && scoringState.displayScreen.toUpperCase() !== "BOWLER";
  if (isFS) {
    const ds = scoringState.displayScreen.toUpperCase();
    const isY1Bat = ds === "Y1BAT" || ds === "1BAT"; const isY2Bat = ds === "Y2BAT" || ds === "2BAT";
    const isY1Ball = ds === "Y1BALL" || ds === "1BALL"; const isY2Ball = ds === "Y2BALL" || ds === "2BALL";
    const isSummary = ds === "SUMMARY"; const isFullScore = ds === "FULLSCORE"; const isFow = ds === "FOW";
    const isBowlerSp = ds === "BOWLER"; const isTarget = ds === "TARGET";
    const isPartner = ds === "PARTNERSHIP";
    const isSquads = ds === "B1" || ds === "B2" || ds === "TEAMS PLAYERS";

    // ── BATTING CARD — centered, fully themed ──────────────────────────
    if (isY1Bat || isY2Bat) {
      const inn = (isY1Bat ? 1 : 2) as 1 | 2; const innData = getInnState(inn);
      const batTeam = getInnTeam(inn, "bat"); const bowlTeam = getInnTeam(inn, "bowl");
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "92vw" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* Card wrapper — themed */}
            <div className="animate-slide-up" style={{ 
              background: `linear-gradient(145deg, ${panelBg}, ${theme.headerBg}f0)`, 
              border: panelBorder, 
              borderLeft: panelBorderLeft, 
              borderRadius: panelRadius, 
              overflow: "hidden", 
              boxShadow: panelShadow,
              backdropFilter: "blur(20px)",
              position: "relative"
            }}>
              {/* Premium top accent glow line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${panelAccent}, transparent)` }} />

              {/* Header */}
              <div style={{ background: `linear-gradient(135deg, ${theme.headerBg}ee, ${theme.headerBg}77)`, borderBottom: `1px solid ${panelAccent}20`, padding: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    {/* Spinning dash circle to make it look active */}
                    <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: `1.5px dashed ${panelAccent}40`, animation: "spin 25s linear infinite" }} />
                    <TeamLogo name={batTeam} isBatting={scoringState.inningsNo === inn} isBowling={false} accentColor={panelAccent} borderColor={panelAccent} size={68} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 900, letterSpacing: 3, marginBottom: 4, textTransform: "uppercase", opacity: 0.8 }}>Innings {inn} · Live Batting Card</div>
                    <div style={{ fontSize: 26, fontWeight: 950, color: panelAccentTx, letterSpacing: 0.5, textShadow: `0 2px 10px rgba(0,0,0,0.5)` }}>{batTeam.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: panelSecondary, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>vs {bowlTeam.toUpperCase()}</span>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: panelSecondary, opacity: 0.5 }} />
                      <span style={{ color: panelAccent }}>{match.matchType.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                {innData && (
                  <div style={{ 
                    background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`, 
                    border: `1px solid ${panelAccent}30`, 
                    borderRadius: 16, 
                    padding: "10px 24px", 
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)`, 
                    textAlign: "right"
                  }}>
                    <div style={{ fontSize: 48, fontWeight: 950, color: panelAccent, lineHeight: 1, textShadow: `0 0 15px ${panelAccent}35` }}>
                      {innData.score}<span style={{ color: panelAccentTx, opacity: 0.6, fontSize: 32, fontWeight: 500 }}>/</span>{innData.wickets}
                    </div>
                    <div style={{ fontSize: 11, color: panelSecondary, fontWeight: 800, marginTop: 4, letterSpacing: 1 }}>{fmtOv(innData.balls, match.ballsPerOver)} / {match.overs} OVERS</div>
                  </div>
                )}
              </div>

              {/* Table body */}
              <div className="scroll-vertical" style={{ overflowY: "auto", maxHeight: "50vh", background: "rgba(0,0,0,0.15)" }}>
                {innData ? <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: panelFont }}>
                    <thead>
                      <tr style={{ background: `${theme.headerBg}a0`, borderBottom: `2px solid ${panelAccent}30` }}>
                        {["BATSMAN", "STATUS", "RUNS", "BALLS", "4s", "6s", "S/R"].map((h, i) => (
                          <th key={h} style={{ padding: "14px 18px", fontSize: 9.5, fontWeight: 900, textAlign: i === 0 ? "left" : "center", color: panelSecondary, letterSpacing: 2, borderBottom: `1px solid rgba(255,255,255,0.03)` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {innData.batsmen.map((b, idx) => {
                        const isSt = b.name === scoringState.striker && scoringState.inningsNo === inn;
                        const isNS = b.name === scoringState.nonStriker && scoringState.inningsNo === inn;
                        const srVal = b.balls > 0 ? ((b.runs / b.balls) * 100) : 0;
                        return (
                          <tr key={idx} className="table-row-animated" style={{ 
                            animationDelay: `${idx * 0.04}s`, 
                            borderBottom: `1px solid rgba(255,255,255,0.03)`, 
                            background: isSt ? `linear-gradient(90deg, ${panelAccent}12, transparent)` : isNS ? `linear-gradient(90deg, rgba(255,255,255,0.02), transparent)` : "transparent", 
                            borderLeft: isSt ? `5px solid ${panelAccent}` : isNS ? `5px solid ${panelAccent}50` : "5px solid transparent",
                            transition: "background 0.2s ease"
                          }}>
                            {/* Batsman Name */}
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {isSt && (
                                  <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: panelAccent, boxShadow: `0 0 10px ${panelAccent}`, display: "block" }} />
                                    <span className="striker-dot-ring" style={{ border: `2px solid ${panelAccent}` }} />
                                  </div>
                                )}
                                <span style={{ fontWeight: 900, fontSize: 16, color: b.out ? "rgba(255,255,255,0.35)" : panelAccentTx, transition: "color 0.2s ease" }}>{b.name}</span>
                                {isSt && <span className="bat-swing" style={{ fontSize: 14 }}>🏏</span>}
                              </div>
                            </td>
                            {/* Status */}
                            <td style={{ padding: "14px 18px", textAlign: "center" }}>
                              <span style={{ 
                                background: b.out ? "rgba(239,68,68,0.1)" : `${panelAccent}15`, 
                                border: `1px solid ${b.out ? "rgba(239,68,68,0.3)" : `${panelAccent}30`}`, 
                                borderRadius: 8, 
                                padding: "4px 12px", 
                                fontSize: 9, 
                                fontWeight: 900, 
                                letterSpacing: 1,
                                color: b.out ? "#ef4444" : panelAccent,
                                textTransform: "uppercase"
                              }}>
                                {b.out ? "OUT" : "BATTING"}
                              </span>
                            </td>
                            {/* Runs */}
                            <td style={{ padding: "14px", textAlign: "center", fontWeight: 950, fontSize: 21, color: b.runs >= 50 ? panelAccent : "#fff", position: "relative" }}>
                              <span style={{ textShadow: b.runs >= 50 ? `0 0 8px ${panelAccent}50` : "none" }}>{b.runs}</span>
                              {b.runs >= 50 && <span style={{ fontSize: 11, position: "absolute", top: 4, right: 4, color: "#fbbf24" }}>⭐</span>}
                            </td>
                            {/* Balls */}
                            <td style={{ padding: "14px", textAlign: "center", fontSize: 14, color: panelSecondary, fontWeight: 700 }}>{b.balls}</td>
                            {/* Fours */}
                            <td style={{ padding: "14px", textAlign: "center", fontSize: 14, color: "#fbbf24", fontWeight: 800 }}>{b.fours}</td>
                            {/* Sixes */}
                            <td style={{ padding: "14px", textAlign: "center", fontSize: 14, color: "#38bdf8", fontWeight: 800 }}>{b.sixes}</td>
                            {/* Strike Rate + Mini Visual Meter */}
                            <td style={{ padding: "14px", textAlign: "center" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <span style={{ fontSize: 14, color: panelAccentTx, fontWeight: 800 }}>{srVal.toFixed(1)}</span>
                                {b.balls > 0 && (
                                  <div style={{ width: 48, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ width: `${Math.min(srVal / 2.5, 100)}%`, height: "100%", background: panelAccent }} />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Footer total bar */}
                  <div style={{ 
                    background: `linear-gradient(135deg, ${theme.headerBg}f5, ${panelBg}ee)`, 
                    borderTop: `2px solid ${panelAccent}30`, 
                    padding: "16px 32px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.2)"
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: panelSecondary, letterSpacing: 2 }}>INN {inn} TEAM TOTAL</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontSize: 24, fontWeight: 950, color: panelAccentTx }}>
                        {innData.score}<span style={{ color: panelAccent, opacity: 0.8 }}>/</span>{innData.wickets}
                      </div>
                      <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
                      <div style={{ fontSize: 13, color: panelSecondary, fontWeight: 700 }}>
                        ({fmtOv(innData.balls, match.ballsPerOver)}/{match.overs} OVS) · RR <span style={{ color: panelAccent, fontWeight: 900 }}>{calcRR(innData as any)}</span>
                      </div>
                    </div>
                  </div>
                </> : <div style={{ textAlign: "center", color: panelSecondary, padding: 40 }}>No scorecard data.</div>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── BOWLING CARD — centered, fully themed card grid ─────────────────
    if (isY1Ball || isY2Ball) {
      const inn = (isY1Ball ? 1 : 2) as 1 | 2; const innData = getInnState(inn);
      const bowlTeam = getInnTeam(inn, "bowl"); const batTeam = getInnTeam(inn, "bat");
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "92vw" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* Card wrapper — themed */}
            <div className="animate-slide-up" style={{ 
              background: `linear-gradient(145deg, ${panelBg}, ${theme.headerBg}f0)`, 
              border: panelBorder, 
              borderLeft: panelBorderLeft, 
              borderRadius: panelRadius, 
              overflow: "hidden", 
              boxShadow: panelShadow,
              backdropFilter: "blur(20px)",
              position: "relative"
            }}>
              {/* Premium top accent glow line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${panelAccent}, transparent)` }} />

              {/* Header */}
              <div style={{ background: `linear-gradient(135deg, ${theme.headerBg}ee, ${theme.headerBg}77)`, borderBottom: `1px solid ${panelAccent}20`, padding: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: `1.5px dashed ${panelAccent}40`, animation: "spin 25s linear infinite" }} />
                    <TeamLogo name={bowlTeam} isBatting={false} isBowling={scoringState.inningsNo === inn} accentColor={panelAccent} borderColor={panelAccent} size={68} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 900, letterSpacing: 3, marginBottom: 4, textTransform: "uppercase", opacity: 0.8 }}>Innings {inn} · Live Bowling Figures</div>
                    <div style={{ fontSize: 26, fontWeight: 950, color: panelAccentTx, letterSpacing: 0.5, textShadow: `0 2px 10px rgba(0,0,0,0.5)` }}>{bowlTeam.toUpperCase()} BOWLING</div>
                    <div style={{ fontSize: 11, color: panelSecondary, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>vs {batTeam.toUpperCase()}</span>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: panelSecondary, opacity: 0.5 }} />
                      <span style={{ color: panelAccent }}>{match.matchType.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                {innData && (
                  <div style={{ 
                    background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`, 
                    border: `1px solid ${panelAccent}30`, 
                    borderRadius: 16, 
                    padding: "10px 24px", 
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)`, 
                    textAlign: "right"
                  }}>
                    <div style={{ fontSize: 36, fontWeight: 950, color: panelAccent, lineHeight: 1, textShadow: `0 0 15px ${panelAccent}35` }}>
                      {innData.score}<span style={{ color: panelAccentTx, opacity: 0.6, fontSize: 26, fontWeight: 500 }}>/</span>{innData.wickets}
                    </div>
                    <div style={{ fontSize: 10, color: panelSecondary, fontWeight: 800, marginTop: 4, letterSpacing: 1 }}>({fmtOv(innData.balls, match.ballsPerOver)} OVERS)</div>
                  </div>
                )}
              </div>

              {/* Bowler cards grid */}
              <div className="scroll-vertical" style={{ padding: "28px 24px", maxHeight: "55vh", overflowY: "auto", background: "rgba(0,0,0,0.12)" }}>
                {innData ? (
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(innData.bowlers.length, 4)}, 1fr)`, gap: 20 }}>
                    {innData.bowlers.map((bw, idx) => {
                      const isAct = scoringState.inningsNo === inn && bw.name === scoringState.bowler;
                      const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * match.ballsPerOver).toFixed(2) : "0.00";
                      const isEcoGood = parseFloat(eco) <= 6.0;
                      return (
                        <div key={idx} className="table-row-animated" style={{ 
                          animationDelay: `${idx * 0.06}s`, 
                          background: isAct ? `linear-gradient(180deg, ${panelAccent}18, ${theme.headerBg}b0)` : `linear-gradient(180deg, ${panelBg}66, ${theme.headerBg}d0)`, 
                          border: `2px solid ${isAct ? panelAccent : "rgba(255,255,255,0.06)"}`, 
                          borderRadius: 20, 
                          padding: "24px 20px", 
                          textAlign: "center", 
                          position: "relative", 
                          boxShadow: isAct ? `0 0 25px ${panelAccent}40, inset 0 0 10px ${panelAccent}10` : "none",
                          transition: "transform 0.2s ease, border-color 0.2s ease"
                        }}>
                          {/* Active bowler top glowing border animation */}
                          {isAct && (
                            <div style={{ 
                              position: "absolute", 
                              top: -2, 
                              left: 0, 
                              right: 0, 
                              height: 4, 
                              background: `linear-gradient(90deg, transparent, ${panelAccent}, transparent)`, 
                              borderRadius: "20px 20px 0 0" 
                            }} />
                          )}
                          
                          <div style={{ fontSize: 16, fontWeight: 950, color: isAct ? panelAccent : panelAccentTx, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <span>{bw.name.toUpperCase()}</span>
                            {isAct && <span style={{ fontSize: 13, animation: "livePulse 1s ease infinite" }}>⚡</span>}
                          </div>
                          
                          <div style={{ fontSize: 8.5, color: isAct ? panelAccent : panelSecondary, fontWeight: 900, letterSpacing: 2, marginBottom: 18, textTransform: "uppercase", opacity: 0.8 }}>
                            {isAct ? "● CURRENTLY BOWLING" : "BOWLER"}
                          </div>

                          {/* Wickets circle with dynamic background */}
                          <div style={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: "50%", 
                            background: bw.wickets > 0 ? `linear-gradient(135deg, ${panelAccent}33, ${panelAccent}b0)` : "rgba(255,255,255,0.02)", 
                            border: `3px solid ${bw.wickets > 0 ? panelAccent : "rgba(255,255,255,0.08)"}`, 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            margin: "0 auto 20px", 
                            boxShadow: bw.wickets > 0 ? `0 8px 24px ${panelAccent}30` : "none",
                            position: "relative"
                          }}>
                            {/* Inner spinning ring for high wickets spell */}
                            {bw.wickets >= 3 && (
                              <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1px dashed ${panelAccent}`, animation: "spin 15s linear infinite" }} />
                            )}
                            <div style={{ fontSize: 28, fontWeight: 950, color: bw.wickets > 0 ? "#fff" : panelSecondary, lineHeight: 1 }}>{bw.wickets}</div>
                            <div style={{ fontSize: 8, color: bw.wickets > 0 ? "#fff" : panelSecondary, fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>WKT{bw.wickets !== 1 ? "S" : ""}</div>
                          </div>

                          {/* Stats mini grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[
                              { label: "OVERS", val: fmtOv(bw.ballsBowled, match.ballsPerOver), color: panelAccentTx },
                              { label: "RUNS", val: bw.runsConceded, color: panelAccentTx },
                              { label: "ECONOMY", val: eco, color: isEcoGood ? "#4ade80" : "#fb923c" }
                            ].map((st, si) => (
                              <div key={si} style={{ 
                                background: "rgba(0,0,0,0.2)", 
                                border: "1px solid rgba(255,255,255,0.03)",
                                borderRadius: 10, 
                                padding: "8px 4px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center"
                              }}>
                                <div style={{ fontSize: 6.5, color: panelSecondary, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>{st.label}</div>
                                <div style={{ fontSize: 14, fontWeight: 950, color: st.color }}>{st.val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div style={{ textAlign: "center", color: panelSecondary, padding: 40 }}>No bowling details.</div>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── MATCH SUMMARY — Billboard two-team split ─────────────────────────
    if (isSummary) {
      const inn1 = getInnState(1); const inn2 = getInnState(2);
      const bt1 = getInnTeam(1, "bat"); const bt2 = getInnTeam(2, "bat");
      const topB1 = inn1?.batsmen.slice().sort((a, b) => b.runs - a.runs).slice(0, 2) || [];
      const topB2 = inn2?.batsmen.slice().sort((a, b) => b.runs - a.runs).slice(0, 2) || [];
      const topBw1 = inn1?.bowlers.slice().sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded).slice(0, 2) || [];
      const topBw2 = inn2?.bowlers.slice().sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded).slice(0, 2) || [];
      const bt1IsT1 = bt1 === match.team1Name;
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          {/* Floating print button — hidden on actual print */}
          <button className="no-print" onClick={() => window.print()} style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, background: theme.accent, color: "#000", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 900, fontSize: 12, cursor: "pointer", boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${theme.accent}60`, display: "flex", alignItems: "center", gap: 6, letterSpacing: 1 }}>
            🖨️ Save PDF
          </button>

          <div style={{ position: "relative", zIndex: 1, width: "84vw" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            
            {/* Central match title */}
            <div className="animate-slide-up" style={{ 
              background: `linear-gradient(90deg, rgba(0,0,0,0.95), ${theme.headerBg}f2, rgba(0,0,0,0.95))`, 
              borderTop: `4px solid ${theme.borderColor}`, 
              borderRadius: "24px 24px 0 0", 
              padding: "20px 36px", 
              textAlign: "center",
              boxShadow: "0 4px 30px rgba(0,0,0,0.4)"
            }}>
              <div style={{ fontSize: 9.5, color: theme.textSecondary, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", opacity: 0.8 }}>MATCH SUMMARY · {theme.name.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 950, color: theme.accentText, marginTop: 6, letterSpacing: 0.5 }}>
                {match.team1Name.toUpperCase()} <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 14px", fontWeight: 500 }}>VS</span> {match.team2Name.toUpperCase()}
              </div>
            </div>

            {/* Split dashboard */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 170px 1fr", 
              background: `linear-gradient(185deg, rgba(4,6,20,0.98), ${panelBg}ee)`, 
              border: `2px solid ${theme.borderColor}30`, 
              borderTop: "none", 
              borderRadius: "0 0 24px 24px", 
              overflow: "hidden",
              boxShadow: panelShadow,
              backdropFilter: "blur(20px)"
            }}>
              {/* Innings columns mapping */}
              {[{ label: "INNINGS 1", team: bt1, inn: inn1, topBat: topB1, topBowl: topBw1, isT1: bt1IsT1 }, { label: "INNINGS 2", team: bt2, inn: inn2, topBat: topB2, topBowl: topBw2, isT1: !bt1IsT1 }].map((blk, bi) => (
                <div key={bi} style={{ 
                  padding: "36px 32px", 
                  borderRight: bi === 0 ? `1px solid rgba(255,255,255,0.04)` : "none", 
                  borderLeft: bi === 1 ? `1px solid rgba(255,255,255,0.04)` : "none" 
                }}>
                  <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 900, letterSpacing: 3, marginBottom: 20, opacity: 0.8 }}>{blk.label}</div>
                  
                  {/* Glowing Logo Circle */}
                  <div style={{ display: "flex", justifyContent: bi === 1 ? "flex-end" : "flex-start", marginBottom: 14 }}>
                    <div style={{ position: "relative", display: "inline-flex" }}>
                      <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px dashed ${panelAccent}30`, animation: "spin 30s linear infinite" }} />
                      <TeamLogo
                        name={blk.team}
                        isBatting={scoringState.inningsNo === (bi === 0 ? 1 : 2) && scoringState.battingTeam === (blk.isT1 ? "team1" : "team2") && scoringState.inningsStarted && match.status !== "Completed"}
                        isBowling={scoringState.inningsNo === (bi === 0 ? 1 : 2) && scoringState.bowlingTeam === (blk.isT1 ? "team1" : "team2") && scoringState.inningsStarted && match.status !== "Completed"}
                        accentColor={theme.accent}
                        borderColor={theme.borderColor}
                        size={84}
                      />
                    </div>
                  </div>

                  {blk.inn ? <>
                    <div style={{ 
                      fontSize: 54, 
                      fontWeight: 950, 
                      color: panelAccent, 
                      lineHeight: 1, 
                      marginTop: 18, 
                      marginBottom: 4,
                      textShadow: `0 0 15px ${panelAccent}25`
                    }}>
                      {blk.inn.score}<span style={{ color: panelAccentTx, opacity: 0.6, fontSize: 36, fontWeight: 500 }}>/</span>{blk.inn.wickets}
                    </div>
                    <div style={{ fontSize: 12, color: panelSecondary, fontWeight: 700, marginBottom: 24 }}>
                      ({fmtOv(blk.inn.balls, match.ballsPerOver)} / {match.overs} Overs) · RR <span style={{ color: panelAccent, fontWeight: 900 }}>{calcRR(blk.inn as any)}</span>
                    </div>

                    {/* Top Batsmen list with sleek cards */}
                    {blk.topBat.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>🏏 TOP BATSMEN</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {blk.topBat.map((b, i) => (
                            <div key={i} className="stat-badge" style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center",
                              background: "rgba(255,255,255,0.02)", 
                              border: "1px solid rgba(255,255,255,0.03)", 
                              borderRadius: 10,
                              padding: "8px 12px",
                              fontSize: 13 
                            }}>
                              <span style={{ color: "#fff", fontWeight: 800 }}>{b.name}</span>
                              <span style={{ color: panelAccent, fontWeight: 950 }}>{b.runs} <span style={{ color: panelSecondary, fontSize: 10, fontWeight: 600 }}>({b.balls})</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Bowlers list with sleek cards */}
                    {blk.topBowl.length > 0 && (
                      <div>
                        <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>🎯 TOP BOWLERS</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {blk.topBowl.map((bw, i) => (
                            <div key={i} className="stat-badge" style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center",
                              background: "rgba(255,255,255,0.02)", 
                              border: "1px solid rgba(255,255,255,0.03)", 
                              borderRadius: 10,
                              padding: "8px 12px",
                              fontSize: 13 
                            }}>
                              <span style={{ color: "#fff", fontWeight: 800 }}>{bw.name}</span>
                              <span style={{ color: "#ef4444", fontWeight: 950 }}>{bw.wickets} <span style={{ color: panelSecondary, fontSize: 10, fontWeight: 600 }}>/ {bw.runsConceded}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </> : <div style={{ color: "#475569", fontSize: 14, fontWeight: 800, marginTop: 24, letterSpacing: 1, textTransform: "uppercase" }}>Yet to bat</div>}
                </div>
              ))}

              {/* Center Vs status panel */}
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center", 
                padding: "36px 16px", 
                background: `linear-gradient(180deg, ${panelAccent}08, transparent)`, 
                borderLeft: `1px solid rgba(255,255,255,0.04)`, 
                borderRight: `1px solid rgba(255,255,255,0.04)`,
                position: "relative"
              }}>
                <div style={{ fontSize: 32, color: "rgba(255,255,255,0.05)", fontWeight: 950, marginBottom: 24, letterSpacing: 1 }}>VS</div>
                
                {/* Glowing neon status pill */}
                <div style={{ 
                  background: match.status === "Completed" ? `linear-gradient(135deg, ${panelAccent}30, ${panelAccent}10)` : "rgba(239,68,68,0.12)", 
                  border: `2px solid ${match.status === "Completed" ? panelAccent : "#ef4444"}`, 
                  borderRadius: 14, 
                  padding: "12px 18px", 
                  textAlign: "center", 
                  fontSize: 11, 
                  fontWeight: 950, 
                  color: match.status === "Completed" ? panelAccentTx : "#fca5a5",
                  boxShadow: `0 8px 24px ${match.status === "Completed" ? panelAccent : "#ef4444"}25`,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  minWidth: 110,
                  lineHeight: 1.4
                }}>
                  {match.status === "Completed" ? (
                    <div>
                      <div style={{ fontSize: 14, marginBottom: 2 }}>🏆</div>
                      DONE
                    </div>
                  ) : scoringState.inningsNo === 2 ? (
                    <div>
                      <span style={{ fontSize: 9, opacity: 0.8, display: "block" }}>NEED</span>
                      <span style={{ fontSize: 16, fontWeight: 950, color: "#fff" }}>{Math.max(0, (scoringState.target || 0) - scoringState.score)}</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                      LIVE
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: 24, fontSize: 9.5, color: panelSecondary, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase" }}>{match.overs} OVERS FORMAT</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── FALL OF WICKETS — Horizontal timeline beads ──────────────────────
    if (isFow) {
      const fowList = scoringState.fallOfWickets || [];
      const row1 = fowList.slice(0, 5); const row2 = fowList.slice(5);
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "78vw" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ background: `linear-gradient(90deg,${theme.headerBg},${theme.primaryBg})`, border: `2px solid #ef4444`, borderRadius: "12px 12px 0 0", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 4px 20px ${theme.accent}25` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 32 }}>⚰️</div>
                <div>
                  <div style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 800, letterSpacing: 3, marginBottom: 2 }}>FALL OF WICKETS</div>
                  <div style={{ fontSize: 22, fontWeight: 950, color: theme.accentText }}>{currentBatTeam.toUpperCase()} · INN {scoringState.inningsNo}</div>
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 950, color: theme.accent }}>{fowList.length} / 10</div>
            </div>
            <div style={{ background: theme.primaryBg, border: `2px solid ${theme.borderColor}25`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "36px 32px", boxShadow: "0 20px 40px rgba(0,0,0,0.8)" }}>
              {fowList.length > 0 ? <>
                {/* Timeline row 1 */}
                <div style={{ position: "relative", marginBottom: row2.length > 0 ? 32 : 16 }}>
                  <div style={{ position: "absolute", top: 16, left: "5%", right: "5%", height: 3, background: "linear-gradient(90deg,rgba(239,68,68,0.7),rgba(239,68,68,0.2))", borderRadius: 4 }} />
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${row1.length},1fr)`, gap: 12 }}>
                    {row1.map((f, i) => (
                      <div key={i} className="table-row-animated" style={{ animationDelay: `${i * 0.07}s`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#991b1b,#dc2626)", border: "2px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", boxShadow: "0 0 12px #ef444450", zIndex: 1 }}>{f.wickets}</div>
                        <div style={{ marginTop: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 12px", textAlign: "center", width: "100%" }}>
                          <div style={{ fontSize: 9, color: "#f87171", fontWeight: 800, letterSpacing: 1.5, marginBottom: 3 }}>WKT {f.wickets}</div>
                          <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.batsman}</div>
                          <div style={{ fontSize: 20, fontWeight: 950, color: theme.accentText }}>{f.score}</div>
                          <div style={{ fontSize: 9, color: theme.textSecondary }}>{typeof f.over === "number" ? f.over.toFixed(1) : f.over} Ov</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Row 2 */}
                {row2.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${row2.length},1fr)`, gap: 12, marginBottom: 20 }}>
                  {row2.map((f, i) => (
                    <div key={i} className="table-row-animated" style={{ animationDelay: `${(i + 5) * 0.07}s`, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#f87171", fontWeight: 800, letterSpacing: 1.5, marginBottom: 3 }}>WKT {f.wickets}</div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{f.batsman}</div>
                      <div style={{ fontSize: 20, fontWeight: 950, color: theme.accentText }}>{f.score}</div>
                      <div style={{ fontSize: 9, color: theme.textSecondary }}>{typeof f.over === "number" ? f.over.toFixed(1) : f.over} Ov</div>
                    </div>
                  ))}
                </div>}
                {/* Summary pills */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {fowList.map((f, i) => <span key={i} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 800, color: "#f87171" }}>{f.score}/{f.wickets}</span>)}
                </div>
              </> : <div style={{ textAlign: "center", color: theme.textSecondary, padding: 40 }}>No wickets fallen yet.</div>}
            </div>
          </div>
        </div>
      );
    }

    // ── BOWLER SPOTLIGHT — Centered oval design ──────────────────────────
    if (isBowlerSp) {
      const eco = bowler && bowler.ballsBowled > 0 ? ((bowler.runsConceded / bowler.ballsBowled) * match.ballsPerOver).toFixed(2) : "0.00";
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "fixed", inset: 0, zIndex: 0, background: `radial-gradient(ellipse 60% 50% at 50% 50%,${theme.accent}20,transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, width: "62vw", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ marginBottom: 20 }}>
              <TeamLogo name={currentBowlTeam} isBatting={false} isBowling={true} accentColor={theme.accent} borderColor={theme.borderColor} size={88} />
            </div>
            <div className="scale-in" style={{ background: `linear-gradient(180deg,${theme.headerBg}B0,${theme.primaryBg} 50%)`, border: `2px solid ${theme.borderColor}`, borderTop: `6px solid ${theme.borderColor}`, borderRadius: 20, padding: "40px 48px", textAlign: "center", minWidth: "100%", boxShadow: `0 32px 80px ${theme.accent}25` }}>
              <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 800, letterSpacing: 4, marginBottom: 8 }}>⚡ BOWLING SPOTLIGHT · CURRENT SPELL</div>
              <div style={{ fontSize: 48, fontWeight: 950, color: "#fff", letterSpacing: 1, marginBottom: 4, textShadow: "0 0 30px rgba(239,68,68,0.4)" }}>{scoringState.bowler || "No Bowler"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 28, marginBottom: scoringState.thisOver.length > 0 ? 28 : 0 }}>
                {[{ l: "WICKETS", v: bowler?.wickets ?? 0, c: "#ef4444" }, { l: "RUNS", v: bowler?.runsConceded ?? 0, c: "#fff" }, { l: "OVERS", v: fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver), c: theme.accentText }, { l: "ECONOMY", v: eco, c: parseFloat(eco) < 8 ? "#4ade80" : "#f87171" }].map((st, i) => (
                  <div key={i} style={{ background: i === 0 ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${i === 0 ? "#ef4444" : "rgba(255,255,255,0.08)"}30`, borderRadius: 18, padding: "20px 14px" }}>
                    <div style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>{st.l}</div>
                    <div style={{ fontSize: 34, fontWeight: 950, color: st.c }}>{st.v}</div>
                  </div>
                ))}
              </div>
              {scoringState.thisOver.length > 0 && <>
                <div style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>THIS OVER</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {(() => {
                    const bpo = match.ballsPerOver || 6;
                    const thisOver = scoringState.thisOver || [];
                    const extrasCount = thisOver.filter(isExtraBall).length;
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
      const need = Math.max(0, (scoringState.target || 0) - scoringState.score);
      const bLeft = Math.max(0, match.overs * match.ballsPerOver - scoringState.balls);
      const rrr = bLeft > 0 ? ((need / bLeft) * match.ballsPerOver).toFixed(2) : "0.00";
      const pct = scoringState.target ? Math.min(100, (scoringState.score / scoringState.target) * 100) : 0;
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "68vw" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ background: `linear-gradient(90deg, ${theme.headerBg}, ${theme.primaryBg})`, borderTop: `4px solid ${theme.borderColor}`, borderRadius: "16px 16px 0 0", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 4px 20px ${theme.accent}30` }}>
              <TeamLogo name={currentBatTeam} isBatting={true} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={70} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 800, letterSpacing: 4 }}>MATCH EQUATION</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: theme.accentText, marginTop: 4 }}>CHASING {scoringState.target} RUNS</div>
              </div>
              <TeamLogo name={currentBowlTeam} isBatting={false} isBowling={true} accentColor={theme.accent} borderColor={theme.borderColor} size={70} />
            </div>
            <div style={{ background: theme.primaryBg, border: `2px solid ${theme.borderColor}35`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "40px 56px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.8)" }}>
              {scoringState.target !== null ? <>
                <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 800, letterSpacing: 4, marginBottom: 8 }}>{currentBatTeam.toUpperCase()} REQUIRE</div>
                <div style={{ fontSize: 110, fontWeight: 950, color: theme.accentText, lineHeight: 1, textShadow: `0 0 60px ${theme.accent}50,0 8px 24px rgba(0,0,0,0.8)`, marginBottom: 4 }}>{need}</div>
                <div style={{ fontSize: 18, color: "#94a3b8", fontWeight: 700, marginBottom: 36 }}>runs to win</div>
                {/* Progress bar */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${theme.accent},${theme.borderColor})`, borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: theme.textSecondary, fontWeight: 700 }}>
                    <span>0</span><span style={{ color: theme.accentText, fontWeight: 900 }}>{scoringState.score} scored</span><span>TARGET {scoringState.target}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                  {[{ l: "TARGET", v: scoringState.target, c: theme.accent }, { l: "BALLS LEFT", v: bLeft, c: "#fff" }, { l: "CURR RR", v: calcRR(scoringState), c: "#4ade80" }, { l: "REQ RR", v: rrr, c: parseFloat(rrr) > 12 ? "#ef4444" : parseFloat(rrr) > 9 ? "#f97316" : "#4ade80" }].map((st, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${theme.borderColor}20`, borderRadius: 18, padding: "20px 14px" }}>
                      <div style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>{st.l}</div>
                      <div style={{ fontSize: 28, fontWeight: 950, color: st.c }}>{st.v}</div>
                    </div>
                  ))}
                </div>
              </> : <div style={{ color: theme.textSecondary, fontSize: 16, padding: 40 }}>Target not yet set.</div>}
            </div>
          </div>
        </div>
      );
    }

    // ── PARTNERSHIP — VS battle side panels ─────────────────────────────
    if (isPartner) {
      const pRuns = (striker?.runs || 0) + (nonStriker?.runs || 0);
      const pBalls = (striker?.balls || 0) + (nonStriker?.balls || 0);
      const pSR = pBalls > 0 ? ((pRuns / pBalls) * 100).toFixed(1) : "0.0";
      const stCont = pRuns > 0 ? Math.round(((striker?.runs || 0) / pRuns) * 100) : 50;
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "fixed", inset: 0, zIndex: 0, background: `radial-gradient(ellipse 70% 50% at 50% 50%,${theme.accent}18,transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, width: "75vw" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ background: `linear-gradient(90deg,${theme.headerBg},${theme.primaryBg})`, border: `2px solid ${theme.borderColor}`, borderRadius: "16px 16px 0 0", padding: "18px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 4px 20px ${theme.accent}25` }}>
              <div>
                <div style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 800, letterSpacing: 3, marginBottom: 2 }}>ACTIVE PARTNERSHIP</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{currentBatTeam.toUpperCase()} BATTING</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 700 }}>PARTNERSHIP</div>
                <div style={{ fontSize: 40, fontWeight: 950, color: theme.accent, lineHeight: 1 }}>{pRuns}</div>
                <div style={{ fontSize: 10, color: theme.textSecondary }}>{pBalls} balls · SR {pSR}</div>
              </div>
              <TeamLogo name={currentBatTeam} isBatting={true} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={70} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 1fr", background: theme.primaryBg, border: `2px solid ${theme.borderColor}20`, borderTop: "none", borderRadius: "0 0 16px 16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.8)" }}>
              {/* Striker */}
              <div style={{ padding: "36px 32px", borderRight: "1px solid rgba(74,222,128,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ position: "relative", width: 12, height: 12 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", display: "block", margin: "auto" }} /><span className="striker-dot-ring" /></div>
                  <span style={{ fontSize: 9, color: "#4ade80", fontWeight: 900, letterSpacing: 2 }}>ON STRIKE 🏏</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 950, color: "#fff", marginBottom: 8 }}>{scoringState.striker || "—"}</div>
                <div style={{ fontSize: 64, fontWeight: 950, color: "#4ade80", lineHeight: 1, marginBottom: 4 }}>{striker?.runs ?? 0}</div>
                <div style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>({striker?.balls ?? 0} balls)</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#fbbf24", fontWeight: 900 }}>{striker?.fours ?? 0}×4s</div>
                  <div style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#38bdf8", fontWeight: 900 }}>{striker?.sixes ?? 0}×6s</div>
                </div>
              </div>
              {/* Contribution split */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 8px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.12)", fontWeight: 900, marginBottom: 20 }}>VS</div>
                <div style={{ width: 8, height: 120, background: "rgba(255,255,255,0.06)", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${stCont}%`, background: "linear-gradient(180deg,#4ade80,#16a34a)", borderRadius: 4 }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${100 - stCont}%`, background: "linear-gradient(180deg,#38bdf8,#0284c7)", borderRadius: 4 }} />
                </div>
                <div style={{ marginTop: 12, fontSize: 9, color: theme.textSecondary, fontWeight: 700, textAlign: "center" }}>{stCont}% | {100 - stCont}%</div>
              </div>
              {/* Non-striker */}
              <div style={{ padding: "36px 32px", borderLeft: "1px solid rgba(74,222,128,0.1)", textAlign: "right" }}>
                <div style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>NON-STRIKER</div>
                <div style={{ fontSize: 24, fontWeight: 950, color: "#fff", marginBottom: 8 }}>{scoringState.nonStriker || "—"}</div>
                <div style={{ fontSize: 64, fontWeight: 950, color: theme.accentText, lineHeight: 1, marginBottom: 4 }}>{nonStriker?.runs ?? 0}</div>
                <div style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>({nonStriker?.balls ?? 0} balls)</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#fbbf24", fontWeight: 900 }}>{nonStriker?.fours ?? 0}×4s</div>
                  <div style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#38bdf8", fontWeight: 900 }}>{nonStriker?.sixes ?? 0}×6s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isFullScore) {
      const inn1 = getInnState(1);
      const inn2 = getInnState(2);
      const bt1 = getInnTeam(1, "bat");
      const bt2 = getInnTeam(2, "bat");
      const winnerText = match.status === "Completed"
        ? (scoringState.target !== null
          ? (scoringState.score >= scoringState.target
            ? `${currentBatTeam} won by ${Math.max(0, 10 - scoringState.wickets)} wicket${Math.max(0, 10 - scoringState.wickets) === 1 ? "" : "s"}`
            : `${(scoringState.battingTeam === "team1" ? match.team2Name : match.team1Name)} won by ${Math.max(0, scoringState.target - scoringState.score - 1)} run${Math.max(0, scoringState.target - scoringState.score - 1) === 1 ? "" : "s"}`)
          : "Match completed")
        : match.status;
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          {/* Floating print button — hidden on actual print */}
          <button className="no-print" onClick={() => window.print()} style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, background: theme.accent, color: "#000", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 900, fontSize: 12, cursor: "pointer", boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${theme.accent}60`, display: "flex", alignItems: "center", gap: 6, letterSpacing: 1 }}>
            🖨️ Save PDF
          </button>
          <div style={{ position: "relative", zIndex: 1, width: "96vw", maxWidth: "1480px" }}>

            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ background: `linear-gradient(90deg,rgba(0,0,0,0.96),${theme.headerBg},rgba(0,0,0,0.96))`, borderTop: `4px solid ${theme.borderColor}`, borderRadius: "20px 20px 0 0", padding: "18px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 800, letterSpacing: 4 }}>FULL SCORECARD · {theme.name.toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: theme.accentText, marginTop: 6 }}>{match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 6 }}>{winnerText}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, background: "rgba(7,12,28,0.98)", border: `2px solid ${theme.borderColor}25`, borderTop: "none", borderRadius: "0 0 20px 20px", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.7)" }}>
              {[{ label: `INNINGS 1 · ${bt1}`, inn: inn1 }, { label: `INNINGS 2 · ${bt2}`, inn: inn2 }].map((section, idx) => {
                if (!section.inn) {
                  return (
                    <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${theme.borderColor}18`, borderRadius: 18, padding: "22px", minHeight: "360px" }}>
                      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, color: theme.textSecondary, marginBottom: 18 }}>{section.label.toUpperCase()}</div>
                      <div style={{ color: theme.textSecondary, fontSize: 14, padding: "24px 0" }}>No innings data available.</div>
                    </div>
                  );
                }

                const inn = section.inn;
                return (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${theme.borderColor}18`, borderRadius: 18, padding: "22px", minHeight: "360px" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, color: theme.textSecondary, marginBottom: 18 }}>{section.label.toUpperCase()}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginBottom: 18 }}>
                      <div style={{ color: theme.accentText, fontSize: 28, fontWeight: 900 }}>{inn.score}/{inn.wickets}</div>
                      <div style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 800 }}>{fmtOv(inn.balls, match.ballsPerOver)} / {match.overs} overs</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                      <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.borderColor}18`, borderRadius: 14, padding: "16px" }}>
                        <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>TOP BATSMEN</div>
                        {inn.batsmen.slice(0, 4).map((b, bi) => (
                          <div key={bi} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#fff" }}>
                            <span>{b.name}</span>
                            <span>{b.runs} ({b.balls})</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.borderColor}18`, borderRadius: 14, padding: "16px" }}>
                        <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>TOP BOWLERS</div>
                        {inn.bowlers.slice(0, 4).map((bw, bi) => (
                          <div key={bi} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#fff" }}>
                            <span>{bw.name}</span>
                            <span>{bw.wickets}/{bw.runsConceded}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${theme.borderColor}15`, paddingTop: 16 }}>
                      <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>BATTING</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8, fontSize: 10, textTransform: "uppercase", color: theme.textSecondary, marginBottom: 10 }}>
                        {['Batsman', 'R', 'B', '4s', '6s', 'SR'].map((col) => <div key={col} style={{ fontWeight: 900 }}>{col}</div>)}
                      </div>
                      {inn.batsmen.map((b, bi) => (
                        <div key={bi} style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8, padding: "8px 0", borderBottom: bi < inn.batsmen.length - 1 ? `1px solid ${theme.borderColor}12` : "none", color: "#fff", fontSize: 12 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                          <div>{b.runs}</div>
                          <div>{b.balls}</div>
                          <div>{b.fours}</div>
                          <div>{b.sixes}</div>
                          <div>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: `1px solid ${theme.borderColor}15`, paddingTop: 16, marginTop: 16 }}>
                      <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>BOWLING</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, fontSize: 10, textTransform: "uppercase", color: theme.textSecondary, marginBottom: 10 }}>
                        {['Bowler', 'O', 'R', 'W', 'Eco'].map((col) => <div key={col} style={{ fontWeight: 900 }}>{col}</div>)}
                      </div>
                      {inn.bowlers.map((bw, bi) => {
                        const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * match.ballsPerOver).toFixed(2) : "0.00";
                        return (
                          <div key={bi} style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, padding: "8px 0", borderBottom: bi < inn.bowlers.length - 1 ? `1px solid ${theme.borderColor}12` : "none", color: "#fff", fontSize: 12 }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bw.name}</div>
                            <div>{fmtOv(bw.ballsBowled, match.ballsPerOver)}</div>
                            <div>{bw.runsConceded}</div>
                            <div>{bw.wickets}</div>
                            <div>{eco}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // ── SQUADS — Jersey-numbered two-column ──────────────────────────────
    if (isSquads) {
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "92vw" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ background: `linear-gradient(90deg,${theme.headerBg},${theme.primaryBg})`, border: `2px solid ${theme.borderColor}40`, borderRadius: "16px 16px 0 0", padding: "20px 36px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", boxShadow: `0 4px 20px ${theme.accent}30` }}>
              <TeamLogo name={match.team1Name} isBatting={team1IsBatting} isBowling={!team1IsBatting} accentColor={theme.accent} borderColor={theme.borderColor} size={80} />
              <div style={{ textAlign: "center", padding: "0 24px" }}>
                <div style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 800, letterSpacing: 3, marginBottom: 4 }}>PLAYING SQUADS</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: theme.accentText }}>PLAYING XI</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <TeamLogo name={match.team2Name} isBatting={!team1IsBatting} isBowling={team1IsBatting} accentColor={theme.accent} borderColor={theme.borderColor} size={80} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: theme.primaryBg, border: `2px solid ${theme.borderColor}25`, borderTop: "none", borderRadius: "0 0 16px 16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.8)" }}>
              {[{ name: match.team1Name, players: match.playersTeam1 || [], isBat: team1IsBatting }, { name: match.team2Name, players: match.playersTeam2 || [], isBat: !team1IsBatting }].map((team, ti) => (
                <div key={ti} style={{ padding: "24px 28px", borderRight: ti === 0 ? `1px solid ${theme.borderColor}20` : "none" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: team.isBat ? "#4ade80" : "#f87171", letterSpacing: 2, marginBottom: 16 }}>{team.name.toUpperCase()} · {team.isBat ? "🏏 BATTING" : "🎯 BOWLING"}</div>
                  <div className="scroll-vertical" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                    {team.players.length > 0 ? team.players.map((p, i) => {
                      const isSt = p === scoringState.striker; const isNS = p === scoringState.nonStriker; const isBwl = p === scoringState.bowler;
                      return <div key={i} className="table-row-animated" style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 12, background: isSt ? "rgba(74,222,128,0.08)" : isBwl ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${isSt ? "#4ade80" : isBwl ? "#ef4444" : theme.borderColor}20`, borderRadius: 12, padding: "10px 14px" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${theme.borderColor}20`, border: `1px solid ${theme.borderColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: theme.borderColor, flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isSt ? "#4ade80" : isBwl ? "#fca5a5" : "#fff" }}>{p}</span>
                        {isSt && <span style={{ marginLeft: "auto", fontSize: 12 }} className="bat-swing">🏏</span>}
                        {isNS && !isSt && <span style={{ marginLeft: "auto", fontSize: 12 }}>🏃</span>}
                        {isBwl && <span style={{ marginLeft: "auto", fontSize: 12 }}>⚡</span>}
                      </div>;
                    }) : <div style={{ fontSize: 12, color: theme.textSecondary }}>No players registered.</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ── TOURNAMENT NAME BANNER ─────────────────────────────────────────────
    if (ds === "TOURNAME") {
      const tourName = (match as any).tournamentName || match.team1Name + " vs " + match.team2Name;
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: activeFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "80vw", textAlign: "center" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ background: `linear-gradient(135deg, ${theme.headerBg}, ${theme.primaryBg})`, border: `3px solid ${theme.borderColor}`, borderRadius: 24, padding: "48px 64px", boxShadow: `0 8px 40px ${theme.accent}40` }}>
              <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase", marginBottom: 16 }}>🏏 TOURNAMENT</div>
              <div style={{ fontSize: 44, fontWeight: 950, color: theme.accentText, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: 2, textShadow: `0 0 30px ${theme.accent}60` }}>{tourName}</div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 20 }}>
                <div style={{ background: `${theme.accent}20`, border: `1px solid ${theme.borderColor}`, borderRadius: 12, padding: "10px 28px", fontSize: 16, fontWeight: 900, color: theme.accentText }}>{match.team1Name}</div>
                <div style={{ fontSize: 20, color: theme.textSecondary, alignSelf: "center" }}>vs</div>
                <div style={{ background: `${theme.accent}20`, border: `1px solid ${theme.borderColor}`, borderRadius: 12, padding: "10px 28px", fontSize: 16, fontWeight: 900, color: theme.accentText }}>{match.team2Name}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // ════════════════════ 6. DEFAULT LOWER THIRD ════════════════════
  // ════════════════════ THEME 16: CRIOVERLAY GREEN ════════════════════
  if (themeSlug === "crioverlay-green") {
    const tossWinner = match.tossWonBy === "team1" ? match.team1Name : match.team2Name;
    const tossChoice = match.optedTo;
    const bpo = match.ballsPerOver || 6;
    const striker = scoringState.batsmen.find(b => b.name === scoringState.striker);
    const nonStriker = scoringState.batsmen.find(b => b.name === scoringState.nonStriker);
    const bowler = scoringState.bowlers.find(bw => bw.name === scoringState.bowler);
    const oversBowled = bowler ? `${Math.floor(bowler.ballsBowled / bpo)}.${bowler.ballsBowled % bpo}` : "0.0";
    const currentScore = `${scoringState.score}-${scoringState.wickets}`;
    const currentOvers = `${Math.floor(scoringState.balls / bpo)}.${scoringState.balls % bpo} (${match.overs})`;
    const teamsHeader = `${match.team1Name} v ${match.team2Name}`;
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * bpo - scoringState.balls) : null;
    // Determine top-capsule mode
    let topBarMode = "";
    let animTextContent = "";
    if (currentAnim === "WICKET") { topBarMode = "mode-out"; animTextContent = "WICKET!"; }
    else if (currentAnim === "FREE HIT") { topBarMode = "mode-freehit"; animTextContent = "FREE HIT!"; }
    else if (scoringState.decision === "PENDING") { topBarMode = "mode-pending"; animTextContent = "REVIEW..."; }
    else if (currentAnim === "FOUR") { animTextContent = "FOUR!"; }
    else if (currentAnim === "SIX") { animTextContent = "SIX!"; }
    // Team badge abbreviations
    const abbr = (name: string) => name.slice(0, 3).toUpperCase();
    // Ball colour helpers
    const ballBg = (v: string | undefined) => {
      if (!v) return "rgba(0,0,0,0.7)";
      if (v === "W" || v.startsWith("W+")) return "#dc2626";
      if (v === "4") return "#ca8a04";
      if (v === "6") return "#7c3aed";
      if (isExtraBall(v)) return "#0e7490";
      return "rgba(0,0,0,0.7)";
    };

    const GREEN_CSS = `
      @import url('https://fonts.googleapis.com/css2?family=Teko:wght@600;700&family=Montserrat:wght@700;800;900&display=swap');
      html,body{background:transparent!important;overflow:hidden;}
      *{box-sizing:border-box;margin:0;padding:0;}
      .g-canvas{position:relative;width:100vw;height:100vh;background:transparent;display:flex;flex-direction:column;justify-content:flex-end;padding:20px 16px;overflow:hidden;font-family:'Montserrat',sans-serif;}
      .g-bar{display:flex;align-items:flex-end;justify-content:stretch;width:100%;}
      .g-badge{width:72px;height:72px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#fff;z-index:30;margin-bottom:3px;flex-shrink:0;}
      .g-badge-l{background:radial-gradient(circle,#eab308 0%,#854d0e 70%,#000 100%);margin-right:-16px;}
      .g-badge-r{background:radial-gradient(circle,#b2ff59 0%,#4d7c0f 70%,#000 100%);margin-left:-16px;}
      .g-main-box{display:flex;flex-direction:column;gap:4px;z-index:20;flex:0 0 auto;}
      .g-top-bar{background:linear-gradient(180deg,#b2ff59 0%,#76ff03 50%,#64dd17 100%);color:#000;border-radius:14px;border:2px solid #000;padding:4px 18px;display:flex;align-items:center;justify-content:space-between;width:480px;height:46px;box-shadow:inset 0 2px 0 rgba(255,255,255,0.6);overflow:hidden;position:relative;}
      .g-top-bar.mode-out{background:linear-gradient(180deg,#dc2626 0%,#991b1b 100%);color:#fff;border-color:#ef4444;}
      .g-top-bar.mode-freehit{background:linear-gradient(180deg,#16a34a 0%,#052e16 100%);color:#76ff03;border-color:#22c55e;}
      .g-top-bar.mode-pending{background:linear-gradient(180deg,#d97706 0%,#78350f 100%);color:#fff;border-color:#f59e0b;}
      .g-teams{font-size:15px;font-weight:900;}
      .g-runs{font-size:30px;font-weight:900;font-family:'Teko',sans-serif;letter-spacing:1px;}
      .g-overs{font-size:14px;font-weight:900;}
      .g-anim{width:100%;text-align:center;font-size:22px;font-weight:900;letter-spacing:3px;animation:gBlink 0.6s infinite alternate ease-in-out;}
      @keyframes gBlink{0%{transform:scale(0.88);opacity:0.3;}100%{transform:scale(1.1);opacity:1;}}
      .g-bat-bar{display:flex;gap:4px;width:480px;height:32px;}
      .g-pill{background:linear-gradient(180deg,#0b0f19 0%,#172033 100%);border:1.5px solid #76ff03;border-radius:14px;flex:1;display:flex;align-items:center;justify-content:space-between;padding:0 12px;font-size:13px;color:#fff;font-weight:800;}
      .g-pill.active{background:linear-gradient(180deg,#facc15 0%,#ca8a04 100%);color:#000;border-color:#fff;}
      .g-navy{background:linear-gradient(180deg,#050b14 0%,#0b1324 100%);border:2px solid #1e293b;border-radius:0 16px 16px 0;margin-left:-18px;padding-left:28px;padding-right:14px;min-height:72px;display:flex;align-items:center;gap:14px;z-index:10;color:#fff;flex:1;min-width:0;}
      .g-toss{display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid #1e293b;padding-right:12px;min-width:80px;flex-shrink:0;}
      .g-toss-l{font-size:10px;color:#94a3b8;font-weight:800;letter-spacing:1px;}
      .g-toss-v{font-size:13px;color:#00e5ff;font-weight:900;}
      .g-bowl-sec{flex:1;display:flex;flex-direction:column;justify-content:center;gap:5px;padding:4px 0;min-width:0;}
      .g-bowl-row{background:linear-gradient(180deg,#b2ff59 0%,#76ff03 100%);color:#000;border-radius:10px;padding:3px 10px;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:900;}
      .g-over-row{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:#fff;}
      .g-balls{display:flex;gap:3px;flex-wrap:wrap;flex:1;align-items:center;}
      .g-ball{min-width:18px;height:18px;padding:0 3px;border:1.5px solid #38bdf8;border-radius:4px;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:800;white-space:nowrap;}
    `;

    return (
      <div style={{ position: "relative", width: "100%", height: "100vh", background: "transparent", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 15, overflow: "hidden" }}>
        <style>{GREEN_CSS}</style>
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
        <div className="g-canvas">
          <div className="g-bar">
            {/* Left badge */}
            <div className="g-badge g-badge-l">{abbr(match.team1Name)}</div>

            {/* Main score box */}
            <div className="g-main-box" style={{ position: "relative" }}>
              {scoringState.target !== null && (
                <div style={{
                  position: "absolute",
                  top: "-22px",
                  left: "18px",
                  background: "#000",
                  border: "1.5px solid #76ff03",
                  borderRadius: "6px 6px 0 0",
                  padding: "1px 10px",
                  color: "#76ff03",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  zIndex: 10
                }}>
                  TARGET: {scoringState.target} {need !== null && bLeft !== null && `| NEED ${need} OFF ${bLeft} BALLS`}
                </div>
              )}
              {/* Top green bar */}
              <div className={`g-top-bar${topBarMode ? " " + topBarMode : ""}`}>
                {animTextContent ? (
                  <div className="g-anim" style={{ display: "block" }}>{animTextContent}</div>
                ) : (
                  <>
                    <span className="g-teams">{teamsHeader}</span>
                    <span className="g-runs">{currentScore}</span>
                    <span className="g-overs">{currentOvers}</span>
                  </>
                )}
              </div>

              {/* Batsmen strip */}
              <div className="g-bat-bar">
                <div className="g-pill active">
                  <span>🏏 {scoringState.striker || "STRIKER"}</span>
                  <span>{striker ? `${striker.runs} ${striker.balls}` : "0 0"}</span>
                </div>
                <div className="g-pill">
                  <span>{scoringState.nonStriker || "NON-STRIKER"}</span>
                  <span>{nonStriker ? `${nonStriker.runs} ${nonStriker.balls}` : "0 0"}</span>
                </div>
              </div>
            </div>

            {/* Right navy panel */}
            <div className="g-navy">
              {scoringState.target !== null ? (
                <div className="g-toss">
                  <span className="g-toss-l" style={{ color: "#76ff03" }}>TARGET</span>
                  <span className="g-toss-v" style={{ color: "#fff" }}>{scoringState.target}</span>
                </div>
              ) : (
                <div className="g-toss">
                  <span className="g-toss-l">TOSS</span>
                  <span className="g-toss-v">{abbr(tossWinner)} ({tossChoice === "Bat" ? "BAT" : "BWL"})</span>
                </div>
              )}
              <div className="g-bowl-sec">
                <div className="g-bowl-row">
                  <span>● {(scoringState.bowler || "BOWLER").toUpperCase()}</span>
                  <span>{bowler ? `${bowler.wickets}-${bowler.runsConceded} ${oversBowled}` : "0-0 0.0"}</span>
                </div>
                <div className="g-over-row">
                  <span>THIS OVER</span>
                  <div className="g-balls">
                    {(() => {
                      const extrasCount = (scoringState.thisOver || []).filter(isExtraBall).length;
                      const total = bpo + extrasCount;
                      return Array.from({ length: total }).map((_, i) => {
                        const v = scoringState.thisOver[i];
                        return (
                          <div key={i} className="g-ball" style={{ background: ballBg(v), borderColor: v === "W" || v?.startsWith("W+") ? "#ef4444" : v === "4" ? "#ca8a04" : v === "6" ? "#7c3aed" : "#38bdf8" }}>
                            {v && v.includes("+") ? renderOutcomeText(v, 20) : (v ?? "")}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right badge */}
            <div className="g-badge g-badge-r">{abbr(match.team2Name)}</div>
          </div>
        </div>
      </div>
    );
  }

  if (themeSlug === "asia-cup") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * match.ballsPerOver).toFixed(2) : null;
    const totalFours = (scoringState.batsmen || []).reduce((a, b) => a + (b.fours || 0), 0);
    const totalSixes = (scoringState.batsmen || []).reduce((a, b) => a + (b.sixes || 0), 0);

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#fbbf24", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>Asia Cup Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1280px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))" }}>

            {/* The main scoreboard row */}
            <div style={{ display: "flex", alignItems: "stretch", height: "50px", background: "transparent", overflow: "hidden", borderRadius: "6px 6px 0 0", border: "1.5px solid rgba(255, 255, 255, 0.1)", borderBottom: "none" }}>

              {/* Team 1 Section */}
              <div style={{ display: "flex", alignItems: "center", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", padding: "0 20px", position: "relative", flexShrink: 0, minWidth: "150px" }}>
                <span style={{ color: "#000000", fontWeight: 900, fontSize: "15px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {match.team1Name}
                </span>
                {/* Left decorative splash */}
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "30px", height: "6px", background: "#0ea5e9", borderRadius: "0 4px 0 0" }} />
              </div>

              {/* Blue curved transition left */}
              <div style={{ width: "16px", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", clipPath: "polygon(0 0, 100% 0, 0 100%)", flexShrink: 0 }} />

              {/* Score / Overs Section */}
              <div style={{ background: "linear-gradient(180deg, #0a1128 0%, #001f54 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative", minWidth: "140px", flexShrink: 0, borderLeft: "2px solid #0a2a6b", borderRight: "2px solid #0a2a6b" }}>
                {/* Gold Parentheses decoration */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#f59e0b", fontSize: "20px", fontWeight: "300", fontFamily: "serif" }}>(</span>
                  <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: "900", letterSpacing: "-0.5px" }}>{scoringState.score} - {scoringState.wickets}</span>
                  <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "700", marginLeft: "2px" }}>{fmtOv(scoringState.balls, match.ballsPerOver)} ({scoringState.thisOver.filter(x => x && x !== ".").length})</span>
                  <span style={{ color: "#f59e0b", fontSize: "20px", fontWeight: "300", fontFamily: "serif" }}>)</span>
                </div>
                {/* Group Stage banner — sits below score, no overlap */}
                <div style={{ background: "#0ea5e9", padding: "1px 12px", borderRadius: "3px", fontSize: "8px", fontWeight: "900", color: "#000000", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap", marginTop: "2px" }}>
                  GROUP STAGE
                </div>
              </div>

              {/* Blue curved transition right */}
              <div style={{ width: "16px", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", clipPath: "polygon(100% 0, 100% 100%, 0 100%)", flexShrink: 0 }} />

              {/* Batsmen details */}
              <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 18px", flex: 1, minWidth: "180px" }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#000000", fontSize: "14px" }}>•</span>
                    <span style={{ color: "#000000", fontWeight: "800", fontSize: "13px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", fontSize: "13px", fontWeight: "800", color: "#000000" }}>
                    <span style={{ width: "24px", textAlign: "right" }}>{striker?.runs ?? 0}</span>
                    <span style={{ color: "#64748b", fontWeight: "500", width: "18px", textAlign: "right" }}>{striker?.balls ?? 0}</span>
                  </div>
                </div>
                {/* Non Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "transparent", fontSize: "14px" }}>•</span>
                    <span style={{ color: "#475569", fontWeight: "600", fontSize: "12px" }}>{scoringState.nonStriker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                    <span style={{ width: "24px", textAlign: "right" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "#94a3b8", fontWeight: "500", width: "18px", textAlign: "right" }}>{nonStriker?.balls ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Target / Match Equation Section */}
              {scoringState.target !== null ? (
                <div style={{ background: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)", display: "flex", alignItems: "center", padding: "0 22px", flexShrink: 0, position: "relative" }}>
                  {/* Left curved accent boundary */}
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "4px", background: "#0ea5e9" }} />

                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "8px", fontWeight: "900", color: "#000000", letterSpacing: "0.5px" }}>REQ. RUNS</span>
                      <span style={{ fontSize: "26px", fontWeight: "900", color: "#000000", lineHeight: 1, marginTop: "2px" }}>{need}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "8px", fontWeight: "900", color: "#000000", letterSpacing: "0.5px" }}>BALLS</span>
                      <span style={{ fontSize: "26px", fontWeight: "900", color: "#000000", lineHeight: 1, marginTop: "2px" }}>{bLeft}</span>
                    </div>
                  </div>

                  {/* Right curved accent boundary */}
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "4px", background: "#0ea5e9" }} />
                </div>
              ) : (
                /* Innings 1: Show current run rate */
                <div style={{ background: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", flexShrink: 0 }}>
                  <span style={{ fontSize: "8px", fontWeight: "900", color: "#000000", letterSpacing: "0.5px" }}>RUN RATE</span>
                  <span style={{ fontSize: "24px", fontWeight: "900", color: "#000000", lineHeight: 1, marginTop: "2px" }}>{calcRR(scoringState)}</span>
                </div>
              )}

              {/* Team 2 Section */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", padding: "0 20px", position: "relative", flexShrink: 0, minWidth: "150px" }}>
                <span style={{ color: "#000000", fontWeight: 900, fontSize: "15px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {match.team2Name}
                </span>
                {/* CricScorer/Bat badge */}
                <div style={{ marginLeft: "10px", width: "24px", height: "24px", background: "#475569", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "12px", fontWeight: "bold" }}>
                  🏏
                </div>
              </div>

            </div>

            {/* Bottom blue strip */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(90deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
              border: "1.5px solid rgba(255, 255, 255, 0.1)",
              borderTop: "none",
              borderRadius: "0 0 6px 6px",
              padding: "4px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.3s ease"
            }}>
              {activeNotification ? (
                <div style={{ width: "100%", textAlign: "center", color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff", fontWeight: "950", fontSize: "12px", letterSpacing: "2px", animation: "pulseGlow 1s ease-in-out infinite alternate" }}>
                  {activeNotification}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "1px" }}>
                    FOURS: <span style={{ color: "#34d399" }}>{totalFours}</span> &nbsp;&nbsp;|&nbsp;&nbsp; SIXES: <span style={{ color: "#fbbf24" }}>{totalSixes}</span>
                  </div>
                  {/* This Over strip */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "9px", color: theme.textSecondary, fontWeight: "900", letterSpacing: "1px" }}>THIS OVER:</span>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => (
                        <BallCircle key={i} val={thisOver[i]} ballColors={theme.ballColors} borderColor={theme.borderColor} size={18} />
                      ));
                    })()}
                  </div>
                  {rrr ? (
                    <div style={{ fontSize: "11px", fontWeight: "900", color: "#fbbf24", letterSpacing: "1px" }}>
                      REQUIRED RR: {rrr}
                    </div>
                  ) : <div style={{ width: 10 }} />}
                </>
              )}
            </div>

          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, #0a1128 0%, #001f54 100%)", border: "2px solid #f59e0b", borderRadius: 16, padding: "32px 48px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ color: "#f59e0b", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── CWC 19 / 2nd Theme: Split Blue-Red horizontal bar (matches image) ──
  if (themeSlug === "cwc-19") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      }
      if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine1 = currentBatTeam.toUpperCase();
    let statusLine2 = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : (scoringState.target !== null ? `TARGET - ${scoringState.target}` : "MATCH IN PROGRESS");

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#38bdf8", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>CWC 19 Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.6))" }}>
            <div style={{ display: "flex", alignItems: "stretch", height: "56px", background: "transparent", overflow: "hidden", borderRadius: "8px", border: "1.5px solid rgba(255, 255, 255, 0.15)" }}>

              {/* LEFT HALF: Sky Blue Background */}
              <div style={{ background: "#02b3e4", display: "flex", alignItems: "center", padding: "0 18px", flex: "1 1 0%", minWidth: 0, width: 0, overflow: "hidden" }}>

                {/* Batting Team Logo/Crest in Ring */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.05)", padding: "4px", textAlign: "center" }}>
                    <span style={{ color: "#000000", fontWeight: 900, fontSize: "9px", lineHeight: "1.1", textTransform: "uppercase" }}>
                      {currentBatTeam.split(" ").slice(0, 2).join("\n")}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#000000", fontWeight: 900, fontSize: "16px", lineHeight: 1 }}>{batTeamShort}</span>
                    <span style={{ color: "rgba(0,0,0,0.6)", fontWeight: 700, fontSize: "11px", marginTop: "2px" }}>v {bowlTeamShort}</span>
                  </div>
                </div>

                {/* Score / Overs Area */}
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "32px", minWidth: "120px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ color: "#1e1b4b", fontSize: "30px", fontWeight: "950", lineHeight: 1 }}>{scoringState.score}-{scoringState.wickets}</span>
                    <span style={{ color: "#1e1b4b", fontSize: "14px", fontWeight: "800" }}>{fmtOv(scoringState.balls, match.ballsPerOver)}</span>
                  </div>
                  {scoringState.target !== null && (
                    <span style={{ color: "#000000", fontSize: "11px", fontWeight: "900", marginTop: "2px", letterSpacing: "0.5px" }}>
                      TARGET - {scoringState.target}
                    </span>
                  )}
                </div>

                {/* Separator Line */}
                <div style={{ width: "1.5px", height: "36px", background: "rgba(0,0,0,0.15)", margin: "0 24px" }} />

                {/* Batsmen Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                  {/* Striker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#000000", fontWeight: "800", fontSize: "13px" }}>
                      &gt; {scoringState.striker || "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ color: "#000000", fontWeight: "900", fontSize: "15px" }}>{striker?.runs ?? 0}</span>
                      <span style={{ color: "rgba(0,0,0,0.6)", fontWeight: "700", fontSize: "11px" }}>{striker?.balls ?? 0}</span>
                    </div>
                  </div>
                  {/* Non-Striker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: "700", fontSize: "13px", paddingLeft: "10px" }}>
                      {scoringState.nonStriker || "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: "800", fontSize: "14px" }}>{nonStriker?.runs ?? 0}</span>
                      <span style={{ color: "rgba(0,0,0,0.5)", fontWeight: "600", fontSize: "10px" }}>{nonStriker?.balls ?? 0}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* CENTER TRANSITION: Gradient Background with Status */}
              <div style={{
                background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(90deg, #02b3e4 0%, #000000 35%, #000000 65%, #dc2626 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 24px",
                minWidth: "180px",
                flexShrink: 0,
                transition: "all 0.3s ease"
              }}>
                {activeNotification ? (
                  <span style={{
                    color: getNotificationStyles(activeNotification).textColor,
                    fontSize: "11px",
                    fontWeight: "900",
                    letterSpacing: "0.5px",
                    textAlign: "center",
                    textTransform: "uppercase",
                    animation: "pulseGlow 1s ease-in-out infinite alternate"
                  }}>{activeNotification}</span>
                ) : (
                  <>
                    <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px", textAlign: "center" }}>{statusLine1}</span>
                    <span style={{ color: "#facc15", fontSize: "11px", fontWeight: "900", marginTop: "2px", letterSpacing: "0.5px", textAlign: "center" }}>{statusLine2}</span>
                  </>
                )}
              </div>

              {/* RIGHT HALF: Red Background */}
              <div style={{ background: "#dc2626", display: "flex", alignItems: "center", padding: "0 18px", flex: 1, minWidth: "450px", justifyContent: "space-between" }}>

                {/* Bowler Details & This Over */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, paddingRight: "16px" }}>
                  {/* Bowler Stats */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>
                      {scoringState.bowler || "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginLeft: "auto" }}>
                      <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "16px" }}>{bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}</span>
                      <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "700", fontSize: "11px" }}>{fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver).split(".")[1] || 0}</span>
                    </div>
                  </div>

                  {/* This Over outcomes (Square boxes) */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => {
                        const val = thisOver[i];
                        let cellBg = "rgba(255, 255, 255, 0.08)";
                        let cellColor = "#ffffff";
                        let borderStyle = "1px solid rgba(255,255,255,0.15)";
                        if (val) {
                          borderStyle = "none";
                          if (val === "4" || val === "4s") { cellBg = "#06b6d4"; cellColor = "#000000"; }
                          else if (val === "6" || val === "6s") { cellBg = "#facc15"; cellColor = "#000000"; }
                          else if (val === "W" || val?.startsWith("W+") || val === "Wk") { cellBg = "#f87171"; cellColor = "#ffffff"; }
                          else if (isExtraBall(val)) { cellBg = "#a855f7"; cellColor = "#ffffff"; }
                          else { cellBg = "rgba(0, 0, 0, 0.35)"; cellColor = "#ffffff"; }
                        }
                        return (
                          <div key={i} style={{ width: "20px", height: "20px", background: cellBg, color: cellColor, border: borderStyle, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "7px" : (val && val.length > 1 ? "9px" : "11px")), letterSpacing: val && val.length > 2 ? "-0.5px" : "normal", fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                            {renderOutcomeText(val, 20)}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Bowling Team Logo/Crest wrapper on the right */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "15px", lineHeight: 1 }}>{bowlTeamShort}</span>
                  </div>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", padding: "4px", textAlign: "center" }}>
                    <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "9px", lineHeight: "1.1", textTransform: "uppercase" }}>
                      {currentBowlTeam.split(" ").slice(0, 2).join("\n")}
                    </span>
                  </div>
                  {/* Logo overlay badge */}
                  <div style={{ width: "22px", height: "22px", background: "#475569", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "11px" }}>
                    🏏
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, #0a1128 0%, #001f54 100%)", border: "2px solid #38bdf8", borderRadius: 16, padding: "32px 48px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ color: "#38bdf8", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── CHAMPIONS TROPHY 2025 / 3rd Theme: White pill with green accents (matches image) ──
  if (themeSlug === "champions-trophy-2025") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      }
      if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : (scoringState.target !== null ? `${currentBatTeam.toUpperCase()} WON BY ${scoringState.wickets} WICKETS` : "MATCH IN PROGRESS");

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 28px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#10b981", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>Champions Trophy Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.4))", margin: "0 0 12px" }}>

            {/* Target Display Box (Floating Above Center) */}
            {scoringState.target !== null && (
              <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", background: "#0a1128", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "2px 16px", color: "#ffffff", fontSize: "11px", fontWeight: "900", letterSpacing: "0.5px", zIndex: 2 }}>
                TARGET - {scoringState.target}
              </div>
            )}

            {/* Main horizontal white container */}
            <div style={{ display: "flex", alignItems: "center", background: "#ffffff", height: "66px", borderRadius: "14px", border: "1.5px solid rgba(0,0,0,0.06)", padding: "0 10px", justifyContent: "space-between" }}>

              {/* Batting Team Green Pill */}
              <div style={{ background: "#00cc44", borderRadius: "10px", padding: "0 16px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "140px", border: "2px solid rgba(255,255,255,0.25)" }}>
                <span style={{ color: "#000000", fontWeight: "900", fontSize: "13px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "center" }}>
                  {currentBatTeam}
                </span>
              </div>

              {/* Striker & Non-Striker details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "180px", paddingLeft: "14px", borderRight: "1px solid rgba(0,0,0,0.06)", marginRight: "14px" }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#00cc44", fontWeight: "900", fontSize: "14px" }}>/</span>
                    <span style={{ color: "#0a1128", fontWeight: "800", fontSize: "13px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", fontWeight: "800" }}>
                    <span style={{ color: "#0a1128", fontSize: "14px" }}>{striker?.runs ?? 0}</span>
                    <span style={{ color: "#64748b", fontSize: "10px" }}>{striker?.balls ?? 0}</span>
                  </div>
                </div>
                {/* Non-Striker */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "transparent", fontSize: "14px" }}>/</span>
                  <span style={{ color: "#475569", fontWeight: "600", fontSize: "12px" }}>{scoringState.nonStriker || "—"}</span>
                </div>
              </div>

              {/* Center Dark Indigo Capsule */}
              <div style={{ background: "#0a1128", height: "40px", borderRadius: "26px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "260px", flexShrink: 0, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "16px" }}>
                  {/* Left: CSK V MI */}
                  <span style={{ color: "#00cc44", fontWeight: "900", fontSize: "11px", letterSpacing: "0.5px" }}>
                    {bowlTeamShort} V {batTeamShort}
                  </span>

                  {/* Score box */}
                  <div style={{ background: "#ffffff", borderRadius: "6px", padding: "3px 12px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "66px" }}>
                    <span style={{ color: "#0a1128", fontWeight: "950", fontSize: "18px", lineHeight: 1 }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                  </div>

                  {/* Right: Overs */}
                  <span style={{ color: "#00cc44", fontWeight: "900", fontSize: "11px", letterSpacing: "0.5px" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs} OVERS
                  </span>
                </div>
                {/* Bottom summary text in capsule */}
                <div style={{
                  fontSize: activeNotification ? "10px" : "9px",
                  fontWeight: "900",
                  color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                  background: activeNotification ? getNotificationStyles(activeNotification).bg : "transparent",
                  padding: activeNotification ? "2px 8px" : "0",
                  borderRadius: "4px",
                  letterSpacing: "0.5px",
                  marginTop: "2px",
                  textTransform: "uppercase",
                  animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
                }}>
                  {activeNotification || statusLine}
                </div>
              </div>

              {/* Bowler Details & outcomes */}
              <div style={{ display: "flex", alignItems: "center", flex: 1, paddingLeft: "16px", borderLeft: "1px solid rgba(0,0,0,0.06)", marginLeft: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                  {/* Bowler details */}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#0a1128", fontWeight: "800", fontSize: "13px" }}>
                    <span style={{ textTransform: "uppercase" }}>{scoringState.bowler || "—"}</span>
                    <span>
                      {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}
                      <span style={{ color: "#64748b", fontWeight: "500", fontSize: "10px", marginLeft: "3px" }}>
                        {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver).split(".")[1] || 0}
                      </span>
                    </span>
                  </div>

                  {/* Outcome circles */}
                  <div style={{ display: "flex", gap: "5px" }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => {
                        const val = thisOver[i];
                        let cellBg = "rgba(10, 17, 40, 0.08)";
                        let cellColor = "#ffffff";
                        let borderStyle = "1px solid rgba(10,17,40,0.12)";
                        if (val) {
                          borderStyle = "none";
                          if (val === "4" || val === "4s") { cellBg = "#0ea5e9"; cellColor = "#000000"; }
                          else if (val === "6" || val === "6s") { cellBg = "#00cc44"; cellColor = "#ffffff"; }
                          else if (val === "W" || val?.startsWith("W+") || val === "Wk") { cellBg = "#f87171"; cellColor = "#ffffff"; }
                          else if (isExtraBall(val)) { cellBg = "#c084fc"; cellColor = "#ffffff"; }
                          else { cellBg = "#0a1128"; cellColor = "#ffffff"; }
                        }
                        return (
                          <div key={i} style={{ width: "18px", height: "18px", background: cellBg, color: cellColor, border: borderStyle, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6px" : (val && val.length > 1 ? "8px" : "10px")), letterSpacing: val && val.length > 2 ? "-0.5px" : "normal", fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                            {renderOutcomeText(val, 18)}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Bowling Team Green Pill */}
              <div style={{ background: "#00cc44", borderRadius: "10px", padding: "0 16px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "140px", border: "2px solid rgba(255,255,255,0.25)", marginLeft: "14px" }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "13px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "center" }}>
                  {currentBowlTeam}
                </span>
              </div>

            </div>
          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#ffffff", border: "2px solid #00cc44", borderRadius: 16, padding: "32px 48px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ color: "#00cc44", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── CWC 25 India / 4th Theme: Trapezoid scoreboard with neon highlights (matches image) ──
  if (themeSlug === "cwc-25-india") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      }
      if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : (need !== null && bLeft !== null ? `NEED ${need} RUNS FROM ${bLeft} BALLS` : "MATCH IN PROGRESS");

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#f97316", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>CWC 25 India Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))" }}>
            <div style={{ display: "flex", alignItems: "stretch", height: "54px", background: "transparent", overflow: "hidden" }}>

              {/* Batting Team Trapezoid Name Block (Left End) */}
              <div style={{
                background: "#0c0a23",
                borderTop: "3.5px solid #0ea5e9",
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "140px",
                clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
                flexShrink: 0
              }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "13px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "left", width: "100%", paddingRight: "10px" }}>
                  {currentBatTeam}
                </span>
              </div>

              {/* Batsmen details section */}
              <div style={{
                background: "rgba(12, 10, 35, 0.95)",
                borderTop: "3.5px solid #0ea5e9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 18px",
                flex: 1,
                minWidth: "180px",
                marginLeft: "-15px",
                paddingLeft: "25px"
              }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#0ea5e9", fontSize: "11px" }}>▶</span>
                    <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", fontWeight: "800", color: "#ffffff" }}>
                    <span style={{ fontSize: "14px" }}>{striker?.runs ?? 0}</span>
                    <span style={{ color: "#94a3b8", fontSize: "10px" }}>{striker?.balls ?? 0}</span>
                  </div>
                </div>
                {/* Non-Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "12px" }}>
                    <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "12px" }}>{scoringState.nonStriker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", fontWeight: "600", color: "#94a3b8" }}>
                    <span style={{ fontSize: "13px" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ fontSize: "9px" }}>{nonStriker?.balls ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Center scoreboard display block */}
              <div style={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>

                {/* Batting Team Short Name (e.g. MUM) */}
                <div style={{ background: "#0c0a23", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 14px", borderBottom: "3px solid #0ea5e9", minWidth: "60px" }}>
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "13px", letterSpacing: "0.5px" }}>{batTeamShort}</span>
                </div>

                {/* Score Rhombus Box */}
                <div style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  padding: "0 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "110px",
                  clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)",
                  marginLeft: "-10px",
                  marginRight: "-10px",
                  zIndex: 2
                }}>
                  {/* Score format: Wickets / Runs (like 2/42) */}
                  <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "25px", letterSpacing: "-0.5px" }}>
                    {scoringState.wickets}/{scoringState.score}
                  </span>
                </div>

                {/* Overs Rhombus Box */}
                <div style={{
                  background: "rgba(12, 10, 35, 0.98)",
                  padding: "0 22px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "90px",
                  clipPath: "polygon(14% 0, 100% 0, 86% 100%, 0 100%)"
                }}>
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "16px", lineHeight: 1 }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "8px", fontWeight: "800", letterSpacing: "0.5px", marginTop: "2px" }}>OVERS</span>
                </div>

              </div>

              {/* Bowler Details & outcomes */}
              <div style={{
                background: "rgba(12, 10, 35, 0.95)",
                borderTop: "3.5px solid #facc15",
                display: "flex",
                alignItems: "center",
                flex: 1.1,
                paddingLeft: "16px",
                marginLeft: "-12px",
                paddingRight: "16px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                  {/* Bowler Stats */}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>
                    <span style={{ textTransform: "uppercase" }}>{scoringState.bowler || "—"}</span>
                    <span>
                      {bowler?.wickets ?? 0}/{bowler?.runsConceded ?? 0}
                      <span style={{ color: "#94a3b8", fontWeight: "500", fontSize: "10px", marginLeft: "4px" }}>
                        {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)}
                      </span>
                    </span>
                  </div>

                  {/* Underlined outcome details */}
                  <div style={{ display: "flex", gap: "10px", height: "18px", alignItems: "center" }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => {
                        const val = thisOver[i];
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "12px" }}>
                            <span style={{ color: val ? "#ffffff" : "rgba(255,255,255,0.25)", fontSize: val && val.length > 3 ? "8px" : (val && val.length > 1 ? "10px" : "12px"), fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                              {val || "•"}
                            </span>
                            {val && <div style={{ width: "10px", height: "2px", background: "#ffffff", marginTop: "2px" }} />}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Bowling Team Name Block (Right End) */}
              <div style={{
                background: "#0c0a23",
                borderTop: "3.5px solid #facc15",
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                minWidth: "140px",
                clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
                marginLeft: "-15px",
                flexShrink: 0
              }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "13px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "right", width: "100%" }}>
                  {currentBowlTeam}
                </span>
                {/* Logo badge overlay */}
                <div style={{ marginLeft: "10px", width: "22px", height: "22px", background: "#475569", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "11px", flexShrink: 0 }}>
                  🏏
                </div>
              </div>

            </div>

            {/* Bottom summary status line bar */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(90deg, #0284c7 0%, #0369a1 100%)",
              padding: "4px 20px",
              display: "flex",
              justifyContent: "center",
              borderRadius: "0 0 8px 8px",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderTop: "none",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                fontSize: "11px",
                fontWeight: "900",
                letterSpacing: "1px",
                textTransform: "uppercase",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>
                {activeNotification || statusLine}
              </span>
            </div>

          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#0c0a23", border: "2px solid #0ea5e9", borderRadius: 16, padding: "32px 48px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ color: "#0ea5e9", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── WCL (Fancode) / 5th Theme: FanCode-style rectangular scoreboard (matches image) ──
  if (themeSlug === "wcl-fancode") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      }
      if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#f0abfc", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>WCL Fancode Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))" }}>
            <div style={{ display: "flex", alignItems: "stretch", height: "54px", background: "transparent", overflow: "hidden", border: "1.5px solid rgba(255, 255, 255, 0.1)" }}>

              {/* Left Block: Team Name + Code */}
              <div style={{
                background: "#1f2937",
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                minWidth: "160px",
                position: "relative",
                flexShrink: 0
              }}>
                {/* Cyan bursts decoration on the left */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: "#0ea5e9" }} />
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "4px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>{currentBatTeam}</span>
                    <span style={{ color: "#94a3b8", fontWeight: "800", fontSize: "12px" }}>{batTeamShort}</span>
                  </div>
                  <span style={{ color: "#d1d5db", fontSize: "10px", fontWeight: "600", fontStyle: "italic", marginTop: "2px" }}>v {bowlTeamShort}</span>
                </div>
              </div>

              {/* Score display area */}
              <div style={{ background: "#111827", display: "flex", alignItems: "center", padding: "0 16px", minWidth: "220px", flexShrink: 0 }}>
                {/* Cyan Score Box */}
                <div style={{ background: "#0ea5e9", padding: "6px 14px", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "90px" }}>
                  <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "24px", lineHeight: 1 }}>
                    {scoringState.score}-{scoringState.wickets}
                  </span>
                </div>
                {/* Overs details */}
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "14px", justifyContent: "center" }}>
                  <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "14px" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}
                  </span>
                  {scoringState.target !== null && (
                    <span style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: "900", marginTop: "2px", letterSpacing: "0.5px" }}>
                      TARGET - {scoringState.target}
                    </span>
                  )}
                </div>
              </div>

              {/* Batsmen Area */}
              <div style={{ background: "#0284c7", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 18px", flex: 1.2, minWidth: "200px" }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "4px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#ffffff", fontSize: "12px" }}>🏏</span>
                    <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px", color: "#ffffff", fontWeight: "900", fontSize: "14px" }}>
                    <span>{striker?.runs ?? 0}</span>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: "600" }}>{striker?.balls ?? 0}</span>
                  </div>
                </div>
                {/* Non-Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "16px" }}>
                    <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600", fontSize: "12px" }}>{scoringState.nonStriker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px", color: "rgba(255,255,255,0.8)", fontWeight: "700", fontSize: "13px" }}>
                    <span>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px", fontWeight: "500" }}>{nonStriker?.balls ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Purple/Indigo custom status box in middle */}
              <div style={{
                background: activeNotification ? getNotificationStyles(activeNotification).bg : "#1e3a8a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 16px",
                minWidth: "120px",
                flexShrink: 0,
                transition: "all 0.3s ease"
              }}>
                <span style={{
                  color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#38bdf8",
                  fontWeight: "900",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
                }}>
                  {activeNotification || (need !== null ? `NEED ${need}` : "LIVE")}
                </span>
              </div>

              {/* Bowler Details & outcomes */}
              <div style={{ background: "#1f2937", display: "flex", alignItems: "center", flex: 1, paddingLeft: "16px", paddingRight: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>
                    <span style={{ textTransform: "uppercase" }}>{scoringState.bowler || "—"}</span>
                    <span>
                      {bowler?.wickets ?? 0}/{bowler?.runsConceded ?? 0}
                      <span style={{ color: "#94a3b8", fontWeight: "500", fontSize: "10px", marginLeft: "4px" }}>
                        {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)}
                      </span>
                    </span>
                  </div>
                  {/* Outcome list */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => {
                        const val = thisOver[i];
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", background: val ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)", border: val ? "none" : "1px solid rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                            <span style={{ color: val ? "#ffffff" : "transparent", fontSize: "10px", fontWeight: "900" }}>{val || ""}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Block: Bowling Team Name + Yellow Decoration */}
              <div style={{
                background: "#1f2937",
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                minWidth: "160px",
                position: "relative",
                justifyContent: "flex-end",
                flexShrink: 0
              }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>{currentBowlTeam}</span>
                {/* Yellow bursts decoration on the right */}
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "6px", background: "#facc15" }} />
                {/* Logo badge overlay */}
                <div style={{ marginRight: "10px", marginLeft: "10px", width: "22px", height: "22px", background: "#475569", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "11px", flexShrink: 0 }}>
                  🏏
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#1f2937", border: "2px solid #0ea5e9", borderRadius: 12, padding: "28px 48px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ color: "#0ea5e9", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── T20 WORLD CUP / 6th Theme: Neon purple slash splits with pink score box (matches image) ──
  if (themeSlug === "cwc-23-india") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * match.ballsPerOver).toFixed(2) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      }
      if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#ec4899", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>T20 World Cup Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))" }}>

            {/* Target Display Box (Floating Above Center) */}
            {scoringState.target !== null && (
              <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", background: "#0a1128", border: "1.5px solid #d946ef", borderRadius: "6px", padding: "2px 16px", color: "#ffffff", fontSize: "11px", fontWeight: "900", letterSpacing: "0.5px", zIndex: 2 }}>
                TARGET - {scoringState.target}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "stretch", height: "54px", background: "transparent", overflow: "hidden", border: "1.5px solid rgba(255, 255, 255, 0.15)" }}>

              {/* Far Left Batting Team Pill (Cyan) */}
              <div style={{
                background: "#0ea5e9",
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                minWidth: "130px",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "15px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {currentBatTeam}
                </span>
              </div>

              {/* Slanted Purple Chevron split */}
              <div style={{ width: "14px", background: "#d946ef", transform: "skewX(-15deg)", marginLeft: "-7px", marginRight: "-7px", zIndex: 2 }} />

              {/* Batsmen Area (Dark Blue) */}
              <div style={{
                background: "#080721",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 22px",
                flex: 1,
                minWidth: "180px"
              }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#facc15", fontSize: "12px" }}>🏏</span>
                    <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px", color: "#facc15", fontWeight: "900", fontSize: "14px" }}>
                    <span>{striker?.runs ?? 0}</span>
                    <span style={{ color: "#ffffff", fontSize: "10px", fontWeight: "600" }}>{striker?.balls ?? 0}</span>
                  </div>
                </div>
                {/* Non-Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "16px" }}>
                    <span style={{ color: "#ffffff", fontWeight: "600", fontSize: "12px" }}>{scoringState.nonStriker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px", color: "#facc15", fontWeight: "700", fontSize: "13px" }}>
                    <span>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "#ffffff", fontSize: "9px", fontWeight: "500" }}>{nonStriker?.balls ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Slanted Purple Chevron split */}
              <div style={{ width: "14px", background: "#d946ef", transform: "skewX(-15deg)", marginLeft: "-7px", marginRight: "-7px", zIndex: 2 }} />

              {/* Center White Block (Score & Overs) */}
              <div style={{
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 18px",
                minWidth: "250px",
                flexShrink: 0
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "space-between" }}>
                  {/* Left: bowlTeamShort v batTeamShort */}
                  <span style={{ color: "#080721", fontWeight: "900", fontSize: "13px" }}>
                    {bowlTeamShort} <span style={{ fontWeight: "500", fontSize: "11px", color: "#64748b" }}>v</span> {batTeamShort}
                  </span>

                  {/* Hot Pink score box */}
                  <div style={{ background: "#ec4899", borderRadius: "8px", padding: "4px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "20px", lineHeight: 1 }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                  </div>

                  {/* Right: Overs */}
                  <span style={{ color: "#080721", fontWeight: "900", fontSize: "13px" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}({match.overs})
                  </span>
                </div>

                {/* Bottom line: CRR & RRR */}
                <div style={{ display: "flex", gap: "14px", marginTop: "2px", fontSize: "9px", fontWeight: "900", color: "#080721" }}>
                  <span>CRR: {calcRR(scoringState)}</span>
                  {rrr && <span>RRR: {rrr}</span>}
                </div>
              </div>

              {/* Slanted Purple Chevron split */}
              <div style={{ width: "14px", background: "#d946ef", transform: "skewX(-15deg)", marginLeft: "-7px", marginRight: "-7px", zIndex: 2 }} />

              {/* Bowler Details & outcomes (Dark Blue) */}
              <div style={{
                background: "#080721",
                display: "flex",
                alignItems: "center",
                flex: 1,
                paddingLeft: "16px",
                paddingRight: "16px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                  {/* Bowler figures */}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>
                    <span style={{ textTransform: "uppercase" }}>{scoringState.bowler || "—"}</span>
                    <span>
                      {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}
                      <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "500", fontSize: "10px", marginLeft: "4px" }}>
                        {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)}
                      </span>
                    </span>
                  </div>

                  {/* Outcomes circular circles */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => {
                        const val = thisOver[i];
                        let cellBg = "#080721";
                        let cellColor = "#ffffff";
                        let cellBorder = "1px solid rgba(255, 255, 255, 0.4)";
                        if (val) {
                          if (val === "4" || val === "4s") { cellBg = "#ec4899"; cellColor = "#ffffff"; cellBorder = "none"; }
                          else if (val === "6" || val === "6s") { cellBg = "#0ea5e9"; cellColor = "#ffffff"; cellBorder = "none"; }
                          else if (val === "W" || val?.startsWith("W+") || val === "Wk") { cellBg = "#ef4444"; cellColor = "#ffffff"; cellBorder = "none"; }
                          else if (isExtraBall(val)) { cellBg = "#a78bfa"; cellColor = "#ffffff"; cellBorder = "none"; }
                          else { cellBg = "#1f2937"; cellColor = "#ffffff"; cellBorder = "none"; }
                        } else {
                          cellBg = "rgba(255, 255, 255, 0.05)";
                          cellColor = "transparent";
                          cellBorder = "1px solid rgba(255, 255, 255, 0.15)";
                        }
                        return (
                          <div key={i} style={{ width: "16px", height: "16px", background: cellBg, color: cellColor, border: cellBorder, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "5.5px" : (val && val.length > 1 ? "7px" : "9px")), letterSpacing: val && val.length > 2 ? "-0.5px" : "normal", fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                            {renderOutcomeText(val, 16)}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Slanted Purple Chevron split */}
              <div style={{ width: "14px", background: "#d946ef", transform: "skewX(-15deg)", marginLeft: "-7px", marginRight: "-7px", zIndex: 2 }} />

              {/* Far Right Bowling Team Pill (Yellow) */}
              <div style={{
                background: "#eab308",
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                minWidth: "130px",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <span style={{ color: "#000000", fontWeight: "900", fontSize: "15px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {currentBowlTeam}
                </span>
                {/* CricScorer overlay badge */}
                <div style={{ marginLeft: "10px", width: "22px", height: "22px", background: "#475569", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "11px", flexShrink: 0 }}>
                  🏏
                </div>
              </div>

            </div>
            {activeNotification && (
              <div style={{
                background: getNotificationStyles(activeNotification).bg,
                border: "2px solid #d946ef",
                borderTop: "none",
                borderRadius: "0 0 10px 10px",
                padding: "4px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.3s ease"
              }}>
                <span style={{
                  color: getNotificationStyles(activeNotification).textColor,
                  fontSize: "11px",
                  fontWeight: "900",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  animation: "pulseGlow 1s ease-in-out infinite alternate"
                }}>
                  {activeNotification}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#080721", border: "2px solid #d946ef", borderRadius: 12, padding: "28px 48px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ color: "#d946ef", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── BBL BLACK / 7th Theme: Yellow panels + purple center + pink score (matches image) ──
  if (themeSlug === "bbl-black") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    // Status line below score (e.g. "INDIA WON BY 11 RUNS" or "NEED 22 RUNS FROM 14 BALLS")
    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `NEED ${need} RUNS FROM ${bLeft ?? 0} BALLS`
        : match.status === "Completed"
          ? "MATCH COMPLETED"
          : "MATCH IN PROGRESS";

    // Current over balls display
    const thisOver = scoringState.thisOver || [];
    const bpo = match.ballsPerOver || 6;
    const extrasCount = thisOver.filter(isExtraBall).length;
    const totalBallSlots = bpo + extrasCount;

    // Ball coloring for this scoreboard style
    const getBallStyle = (val?: string): { bg: string; color: string; border?: string } => {
      if (!val) return { bg: "transparent", color: "transparent", border: "2px solid rgba(255,255,255,0.25)" };
      if (val === "W" || val.startsWith("W+")) return { bg: "#1a1a1a", color: "#ffffff", border: "2px solid #ffffff" };
      if (val === "6") return { bg: "#1a1a1a", color: "#ffffff", border: "2px solid #ffffff" };
      if (val === "4") return { bg: "#facc15", color: "#000000" };
      if (isExtraBall(val)) return { bg: "#9333ea", color: "#ffffff" };
      return { bg: "#1a1a1a", color: "#ffffff", border: "2px solid rgba(255,255,255,0.4)" };
    };

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#4ade80", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>BBL Black Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.7))" }}>

            {/* Floating TARGET pill above scoreboard */}
            {scoringState.target !== null && (
              <div style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", background: "#7c3aed", border: "2px solid #a78bfa", borderRadius: "20px", padding: "3px 20px", color: "#ffffff", fontSize: "11px", fontWeight: "900", letterSpacing: "1.5px", zIndex: 10, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(124,58,237,0.5)" }}>
                TARGET - {scoringState.target}
              </div>
            )}

            {/* Main scoreboard row */}
            <div style={{ display: "flex", alignItems: "stretch", height: "56px", overflow: "hidden", borderRadius: "4px" }}>

              {/* LEFT: Batting Team Yellow Panel */}
              <div style={{ background: "linear-gradient(180deg, #facc15 0%, #eab308 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "130px", flexShrink: 0 }}>
                <span style={{ color: "#000000", fontWeight: "900", fontSize: "15px", letterSpacing: "1px", textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
                  {currentBatTeam}
                </span>
              </div>

              {/* BATSMEN SECTION: Dark purple */}
              <div style={{ background: "#1e1254", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 16px", minWidth: "190px", flexShrink: 0, borderLeft: "2px solid #7c3aed" }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#facc15", fontSize: "11px", fontWeight: "900" }}>▶</span>
                    <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginLeft: "10px" }}>
                    <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "15px" }}>{striker?.runs ?? 0}</span>
                    <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: "700", fontSize: "10px" }}>{striker?.balls ?? 0}</span>
                  </div>
                </div>
                {/* Non-Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "14px" }}>
                    <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: "700", fontSize: "12px", textTransform: "uppercase" }}>{scoringState.nonStriker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginLeft: "10px" }}>
                    <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: "13px" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: "600", fontSize: "10px" }}>{nonStriker?.balls ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* CENTER BLOCK: Team matchup + score + overs + status */}
              <div style={{ background: "#0f0a2e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 14px", flexShrink: 0, minWidth: "200px", borderLeft: "2px solid #7c3aed", borderRight: "2px solid #7c3aed" }}>
                {/* Team matchup label */}
                <div style={{ fontSize: "9px", fontWeight: "900", color: "rgba(255,255,255,0.7)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                  {bowlTeamShort} v {batTeamShort}
                </div>
                {/* Hot pink score pill + over */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ background: "#ec4899", borderRadius: "6px", padding: "3px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "20px", lineHeight: 1, letterSpacing: "-0.5px" }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                    {/* Purple P badge */}
                    <div style={{ background: "#7c3aed", borderRadius: "3px", padding: "1px 5px", fontSize: "9px", fontWeight: "900", color: "#ffffff", letterSpacing: "0.5px" }}>P</div>
                  </div>
                  {/* Overs */}
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}({match.overs})
                  </span>
                </div>
                {/* Status bottom line */}
                <div style={{
                  fontSize: activeNotification ? "9px" : "8px",
                  fontWeight: "900",
                  color: activeNotification ? getNotificationStyles(activeNotification).textColor : "rgba(255,255,255,0.65)",
                  background: activeNotification ? getNotificationStyles(activeNotification).bg : "transparent",
                  padding: activeNotification ? "2px 6px" : "0",
                  borderRadius: "3px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                  textAlign: "center",
                  maxWidth: "190px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
                }}>
                  {activeNotification || statusLine}
                </div>
              </div>

              {/* BOWLER SECTION + THIS OVER */}
              <div style={{ background: "#1e1254", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 14px", flex: 1, minWidth: "200px", borderLeft: "2px solid #7c3aed" }}>
                {/* Bowler name + figures */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>
                    {scoringState.bowler || "—"}
                  </span>
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "14px", marginLeft: "8px" }}>
                    {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}
                    <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: "700", fontSize: "10px", marginLeft: "3px" }}>
                      {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver).split(".")[1] || 0}
                    </span>
                  </span>
                </div>
                {/* This over ball circles */}
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  {Array.from({ length: totalBallSlots }).map((_, i) => {
                    const val = thisOver[i];
                    const bs = getBallStyle(val);
                    return (
                      <div key={i} style={{
                        width: "22px", height: "22px",
                        background: bs.bg,
                        color: bs.color,
                        border: bs.border || "none",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: val && val.length > 1 ? "8px" : "10px",
                        fontWeight: "900",
                        flexShrink: 0
                      }}>
                        {val === "." ? "" : val || ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Bowling Team Yellow Panel */}
              <div style={{ background: "linear-gradient(180deg, #facc15 0%, #eab308 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "100px", flexShrink: 0 }}>
                <span style={{ color: "#000000", fontWeight: "900", fontSize: "15px", letterSpacing: "1px", textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
                  {currentBowlTeam}
                </span>
              </div>

            </div>
          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#0f0a2e", border: "2px solid #facc15", borderRadius: 12, padding: "32px 48px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ color: "#facc15", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── CRICFUSION / 8th Theme: White rounded capsule with indigo/red center (matches image) ──
  if (themeSlug === "cricfusion") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `NEED ${need} RUNS FROM ${bLeft ?? 0} BALLS`
        : match.status === "Completed"
          ? "MATCH COMPLETED"
          : "MATCH IN PROGRESS";

    const thisOver = scoringState.thisOver || [];
    const bpo = match.ballsPerOver || 6;
    const extrasCount = thisOver.filter(isExtraBall).length;
    const totalBallSlots = bpo + extrasCount;

    const getBallStyle = (val?: string): { bg: string; color: string; border?: string } => {
      if (!val) return { bg: "transparent", color: "transparent", border: "1px solid rgba(0,0,0,0.15)" };
      if (val === "W" || val?.startsWith("W+") || val === "Wk") return { bg: "#dc2626", color: "#ffffff" };
      if (val === "6" || val === "6s" || val === "4" || val === "4s") return { bg: "#15803d", color: "#ffffff" };
      return { bg: "#ffffff", color: "#000000", border: "1px solid #1a1a1a" };
    };

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#15803d", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>CricFusion Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1280px", position: "relative", zIndex: 1, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))" }}>

            {/* Floating TARGET pill above scoreboard */}
            {scoringState.target !== null && (
              <div style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", background: "#110b38", border: "2px solid #a78bfa", borderRadius: "20px", padding: "3px 20px", color: "#ffffff", fontSize: "11px", fontWeight: "900", letterSpacing: "1.5px", zIndex: 10, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(17,11,56,0.4)" }}>
                TARGET - {scoringState.target}
              </div>
            )}

            {/* Main scoreboard row (White rounded capsule) */}
            <div style={{ display: "flex", alignItems: "center", height: "54px", background: "#ffffff", overflow: "hidden", borderRadius: "9999px", padding: "0 18px", border: "1px solid rgba(0,0,0,0.08)", justifyContent: "space-between" }}>

              {/* LEFT: Batsmen names + stats */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "10px", minWidth: "210px", flexShrink: 0 }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "2px" }}>
                  <span style={{ color: "#dc2626", marginRight: "6px", fontSize: "12px", display: "flex", alignItems: "center" }}>▶</span>
                  <span style={{ color: "#1e1b4b", fontWeight: "900", fontSize: "14px", textTransform: "uppercase", width: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {scoringState.striker || "—"}
                  </span>
                  <span style={{ color: "#1e1b4b", fontWeight: "900", fontSize: "15px", marginLeft: "auto" }}>
                    {striker?.runs ?? 0}
                    <sub style={{ fontSize: "10px", fontWeight: "700", bottom: "0px", marginLeft: "2px", color: "rgba(30,27,75,0.6)" }}>{striker?.balls ?? 0}</sub>
                  </span>
                </div>
                {/* Non-Striker */}
                <div style={{ display: "flex", alignItems: "center", paddingLeft: "14px" }}>
                  <span style={{ color: "rgba(30,27,75,0.75)", fontWeight: "700", fontSize: "13px", textTransform: "uppercase", width: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {scoringState.nonStriker || "—"}
                  </span>
                  <span style={{ color: "rgba(30,27,75,0.75)", fontWeight: "800", fontSize: "14px", marginLeft: "auto" }}>
                    {nonStriker?.runs ?? 0}
                    <sub style={{ fontSize: "9px", fontWeight: "600", bottom: "0px", marginLeft: "2px", color: "rgba(30,27,75,0.45)" }}>{nonStriker?.balls ?? 0}</sub>
                  </span>
                </div>
              </div>

              {/* CENTER BLOCK: Team matchup + score + status (Indigo/Red Capsule) */}
              <div style={{ background: "#110b38", height: "48px", borderRadius: "9999px", display: "flex", alignItems: "stretch", overflow: "hidden", minWidth: "300px", maxWidth: "340px", flex: 1, margin: "0 14px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}>
                {/* Left section of the capsule */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Top Red row */}
                  <div style={{ background: "#d92d20", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 14px", height: "50%" }}>
                    <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {bowlTeamShort} V {batTeamShort}
                    </span>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13px" }}>
                      {scoringState.score} - {scoringState.wickets}
                    </span>
                  </div>
                  {/* Bottom Indigo row */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2px 10px",
                    height: "50%",
                    background: activeNotification ? getNotificationStyles(activeNotification).bg : "transparent",
                    transition: "all 0.3s ease"
                  }}>
                    <span style={{
                      color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                      fontWeight: "900",
                      fontSize: activeNotification ? "11px" : "10px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                      animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
                    }}>
                      {activeNotification || statusLine}
                    </span>
                  </div>
                </div>
                {/* Right section of the capsule (Overs) */}
                <div style={{ background: "#110b38", color: "#ffffff", width: "65px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "900", borderLeft: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
                  {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}
                </div>
              </div>

              {/* RIGHT BLOCK: Bowler & Ball outcomes */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "220px", flexShrink: 0 }}>
                {/* Bowler name + stats */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#1e1b4b", fontWeight: "900", fontSize: "13px", textTransform: "uppercase" }}>
                    {scoringState.bowler || "—"}
                  </span>
                  <span style={{ color: "#1e1b4b", fontWeight: "900", fontSize: "14px", marginLeft: "10px" }}>
                    {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}
                    <sub style={{ fontSize: "9px", fontWeight: "700", bottom: "0px", marginLeft: "1px", color: "rgba(30,27,75,0.6)" }}>
                      {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver).split(".")[1] || 0}
                    </sub>
                  </span>
                </div>
                {/* Ball circles */}
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  {Array.from({ length: totalBallSlots }).map((_, i) => {
                    const val = thisOver[i];
                    const bs = getBallStyle(val);
                    return (
                      <div key={i} style={{
                        width: "20px", height: "20px",
                        background: bs.bg,
                        color: bs.color,
                        border: bs.border || "none",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6.5px" : (val && val.length > 1 ? "8px" : "10px")),
                        letterSpacing: val && val.length > 2 ? "-0.5px" : "normal",
                        fontWeight: "900",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        lineHeight: 1
                      }}>
                        {val === "." ? "" : renderOutcomeText(val, 20)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Watermark brand icon */}
              <div style={{ display: "flex", alignItems: "center", background: "#15803d", padding: "4px 8px", borderRadius: "4px", color: "#ffffff", fontSize: "10px", fontWeight: "900", gap: "3px", marginLeft: "10px", flexShrink: 0, height: "24px" }}>
                <span>🏏</span>
                <span style={{ fontSize: "9px", letterSpacing: "0.5px" }}>CricScorer</span>
              </div>

            </div>
          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#ffffff", border: "2px solid #dc2626", borderRadius: "9999px", padding: "16px 48px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
            <div style={{ color: "#1e1b4b", fontWeight: 950, fontSize: "18px", letterSpacing: "2px" }}>
              🏏 {match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#dc2626", fontSize: "11px", fontWeight: "900", marginTop: "4px", letterSpacing: "2px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── T20 EMERGING ASIA CUP 2024 / 9th Theme: Neon Cyberpunk style ──
  if (themeSlug === "t20-emerging-asia-cup") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * match.ballsPerOver).toFixed(2) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `NEED ${need} RUNS IN ${bLeft} BALLS (RRR: ${rrr})`
        : `CRR: ${calcRR(scoringState)}`;

    const thisOver = scoringState.thisOver || [];
    const bpo = match.ballsPerOver || 6;
    const extrasCount = thisOver.filter(isExtraBall).length;
    const totalBallSlots = bpo + extrasCount;

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#06b6d4", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>T20 Emerging Asia Cup Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1300px", position: "relative", zIndex: 1, filter: "drop-shadow(0 0 15px rgba(6,182,212,0.3))" }}>
            <div style={{ display: "flex", alignItems: "stretch", height: "54px", background: "rgba(8, 12, 28, 0.95)", border: "1.5px solid #0ea5e9", borderRadius: "10px", overflow: "hidden", backdropFilter: "blur(12px)" }}>
              {/* Batting Team Skew panel */}
              <div style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", minWidth: "120px", clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)" }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>{batTeamShort}</span>
              </div>

              {/* Batsmen details */}
              <div style={{ display: "flex", flex: 1, padding: "0 18px", alignItems: "center", gap: "24px" }}>
                {/* Striker */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#0ea5e9", fontSize: "10px" }}>⚡</span>
                    <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <span style={{ color: "#22d3ee", fontWeight: "800", fontSize: "15px", paddingLeft: "14px" }}>
                    {striker?.runs ?? 0} <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px" }}>({striker?.balls ?? 0})</span>
                  </span>
                </div>
                {/* Non Striker */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "12px", paddingLeft: "10px" }}>{scoringState.nonStriker || "—"}</span>
                  <span style={{ color: "#94a3b8", fontWeight: "700", fontSize: "13px", paddingLeft: "10px" }}>
                    {nonStriker?.runs ?? 0} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px" }}>({nonStriker?.balls ?? 0})</span>
                  </span>
                </div>
              </div>

              {/* Center Score Block */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 28px", borderLeft: "1px dashed rgba(14,165,233,0.3)", borderRight: "1px dashed rgba(14,165,233,0.3)", minWidth: "220px" }}>
                <span style={{ color: "#f97316", fontWeight: "950", fontSize: "28px", lineHeight: 1, textShadow: "0 0 10px rgba(249,115,22,0.4)" }}>
                  {scoringState.score}-{scoringState.wickets}
                </span>
                <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: "800", marginTop: "2px" }}>
                  OVERS: {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}
                </span>
              </div>

              {/* Bowler Stats */}
              <div style={{ display: "flex", flex: 1.1, padding: "0 18px", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: "800" }}>CURRENT BOWLER</span>
                  <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>{scoringState.bowler || "—"}</span>
                  <span style={{ color: "#0ea5e9", fontWeight: "800", fontSize: "14px" }}>
                    {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0} <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                  </span>
                </div>
                {/* Outcomes */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      return (
                        <div key={i} style={{
                          width: "18px", height: "18px",
                          borderRadius: "4px",
                          background: ball ? (ball === "W" || ball?.startsWith("W+") ? "#ef4444" : ["4", "6"].includes(ball) ? "#22c55e" : "rgba(255,255,255,0.15)") : "rgba(255,255,255,0.03)",
                          border: ball ? "none" : "1px solid rgba(255,255,255,0.1)",
                          color: ball ? "#ffffff" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ball && ball.includes("+") ? undefined : (ball && ball.length > 3 ? "6.5px" : (ball && ball.length > 1 ? "8px" : "10px")),
                          letterSpacing: ball && ball.length > 2 ? "-0.5px" : "normal",
                          fontWeight: "900",
                          whiteSpace: "nowrap",
                          lineHeight: 1
                        }}>{renderOutcomeText(ball, 18)}</div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Bowling Team Skew Panel */}
              <div style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", minWidth: "120px", clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)" }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>{bowlTeamShort}</span>
              </div>
            </div>
            {/* Bottom Status bar */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "rgba(6, 182, 212, 0.15)",
              border: "1.5px solid #0ea5e9",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "3px 20px",
              display: "flex",
              justifyContent: "center",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#22d3ee",
                fontSize: "10px",
                fontWeight: "900",
                letterSpacing: "1px",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>{activeNotification || statusLine}</span>
            </div>
          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "rgba(8,12,28,0.95)", border: "2px solid #0ea5e9", borderRadius: 12, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#0ea5e9", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#f97316", fontSize: "11px", fontWeight: "900", marginTop: "8px" }}>MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── SA20 / 10th Theme: Yellow, Black and White Skewed Stadium Display ──
  if (themeSlug === "sa20") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `SA20 - BATTING REQUIRE ${need} RUNS IN ${bLeft} BALLS`
        : `INNINGS NO: ${scoringState.inningsNo} - LIVE FROM SOUTH AFRICA`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#facc15", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>SA20 Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1320px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.6))" }}>
            {/* Target pill */}
            {scoringState.target !== null && (
              <div style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", background: "#facc15", color: "#000", borderRadius: "4px", padding: "2px 16px", fontSize: "11px", fontWeight: "900", letterSpacing: "1px", zIndex: 5 }}>
                TARGET: {scoringState.target}
              </div>
            )}

            {/* Scoreboard row */}
            <div style={{ display: "flex", alignItems: "stretch", height: "56px", background: "#111", border: "2px solid #facc15", overflow: "hidden", borderRadius: "6px" }}>
              {/* Batting team logo/badge */}
              <div style={{ background: "#facc15", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", minWidth: "120px", fontWeight: "950", fontSize: "16px", textTransform: "uppercase" }}>
                {batTeamShort}
              </div>

              {/* Batsmen details */}
              <div style={{ display: "flex", flex: 1, padding: "0 18px", alignItems: "center", gap: "20px", borderRight: "1px solid rgba(250,204,21,0.2)" }}>
                {/* Striker */}
                <div>
                  <span style={{ color: "#facc15", fontWeight: "900", fontSize: "13px" }}>▶ {scoringState.striker || "—"}</span>
                  <div style={{ color: "#fff", fontWeight: "900", fontSize: "16px" }}>{striker?.runs ?? 0} <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>({striker?.balls ?? 0})</span></div>
                </div>
                {/* Non Striker */}
                <div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "700", fontSize: "12px" }}>{scoringState.nonStriker || "—"}</span>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800", fontSize: "14px" }}>{nonStriker?.runs ?? 0} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>({nonStriker?.balls ?? 0})</span></div>
                </div>
              </div>

              {/* Center score display */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px", minWidth: "180px", background: "#222" }}>
                <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "28px", lineHeight: 1 }}>
                  {scoringState.score} - {scoringState.wickets}
                </span>
                <span style={{ color: "#facc15", fontSize: "12px", fontWeight: "800", marginTop: "3px" }}>
                  OVERS: {fmtOv(scoringState.balls, match.ballsPerOver)}
                </span>
              </div>

              {/* Bowler Details */}
              <div style={{ display: "flex", flex: 1, padding: "0 18px", alignItems: "center", justifyContent: "space-between", borderLeft: "1px solid rgba(250,204,21,0.2)" }}>
                <div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: "700" }}>BOWLER</span>
                  <div style={{ color: "#fff", fontWeight: "800", fontSize: "14px", textTransform: "uppercase" }}>{scoringState.bowler || "—"}</div>
                  <div style={{ color: "#facc15", fontWeight: "900", fontSize: "14px" }}>
                    {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}
                  </div>
                </div>
                {/* Outcomes */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      return (
                        <div key={i} style={{ width: "20px", height: "20px", borderRadius: "50%", background: ball ? (ball === "W" || ball?.startsWith("W+") ? "#ef4444" : "#000") : "transparent", border: ball ? "1px solid #facc15" : "1px dashed rgba(250,204,21,0.3)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900" }}>
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 20) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Bowling team */}
              <div style={{ background: "#222", color: "#facc15", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", minWidth: "120px", fontWeight: "950", fontSize: "16px", textTransform: "uppercase", borderLeft: "2px solid #facc15" }}>
                {bowlTeamShort}
              </div>
            </div>
            {/* Bottom Status bar */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "#facc15",
              padding: "3px 20px",
              display: "flex",
              justifyContent: "center",
              border: "2px solid #facc15",
              borderTop: "none",
              borderRadius: "0 0 6px 6px",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#000",
                fontSize: "10px",
                fontWeight: "950",
                letterSpacing: "1px",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>{activeNotification || statusLine}</span>
            </div>
          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#111", border: "2px solid #facc15", borderRadius: 8, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#facc15", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#fff", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── JIO CINEMA / 11th Theme: Glassmorphic entertainment card ──
  if (themeSlug === "jiocinema") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `TARGET: ${scoringState.target} | NEED ${need} IN ${bLeft} BALLS`
        : `LIVE STREAMING - CRICPROBD ON JIO CINEMA`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#ec4899", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>Jio Cinema Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1280px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 30px rgba(225,29,72,0.25))" }}>
            {/* Top red glass banner */}
            <div style={{ background: "linear-gradient(90deg, #e11d48 0%, #be123c 100%)", borderRadius: "10px 10px 0 0", padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#ffffff", color: "#be123c", fontWeight: "950", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", letterSpacing: "1px" }}>LIVE</span>
                <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "12px", letterSpacing: "0.5px" }}>{currentBatTeam.toUpperCase()} VS {currentBowlTeam.toUpperCase()}</span>
              </div>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                fontWeight: "900",
                fontSize: "12px",
                background: activeNotification ? getNotificationStyles(activeNotification).bg : "transparent",
                padding: activeNotification ? "2px 8px" : "0",
                borderRadius: "4px",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>{activeNotification || statusLine}</span>
            </div>

            {/* Main glass body */}
            <div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)" }}>
              {/* Left Batsmen */}
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <span style={{ color: "#cbd5e1", fontSize: "12px" }}>🏏 {scoringState.striker || "—"}</span>
                  <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: "900" }}>{striker?.runs ?? 0} <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600" }}>{striker?.balls ?? 0}b</span></div>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "11px" }}>{scoringState.nonStriker || "—"}</span>
                  <div style={{ color: "#cbd5e1", fontSize: "15px", fontWeight: "700" }}>{nonStriker?.runs ?? 0} <span style={{ color: "#64748b", fontSize: "10px" }}>{nonStriker?.balls ?? 0}b</span></div>
                </div>
              </div>

              {/* Center capsule Score */}
              <div style={{ background: "#ffffff", padding: "8px 24px", borderRadius: "50px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                <span style={{ color: "#be123c", fontWeight: "950", fontSize: "24px" }}>{batTeamShort} {scoringState.score}-{scoringState.wickets}</span>
                <div style={{ width: "2px", height: "24px", background: "rgba(0,0,0,0.1)" }} />
                <span style={{ color: "#0f172a", fontWeight: "800", fontSize: "14px" }}>{fmtOv(scoringState.balls, match.ballsPerOver)} OVERS</span>
              </div>

              {/* Right Bowler */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <div>
                  <span style={{ color: "#cbd5e1", fontSize: "12px" }}>⚾ {scoringState.bowler || "—"}</span>
                  <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: "900" }}>{bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0} <span style={{ color: "#94a3b8", fontSize: "11px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span></div>
                </div>
                {/* Outcomes */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      return (
                        <div key={i} style={{ width: "20px", height: "20px", borderRadius: "4px", background: ball ? (ball === "W" || ball?.startsWith("W+") ? "#e11d48" : ["4", "6"].includes(ball) ? "#10b981" : "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "950" }}>
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 20) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "rgba(15, 23, 42, 0.95)", border: "2px solid #e11d48", borderRadius: 12, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#e11d48", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── IPL / 12th Theme: Royal blue and gold broadcast styling ──
  if (themeSlug === "ipl") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `IPL BROADCAST: NEED ${need} RUNS FROM ${bLeft} BALLS`
        : `VIBRANT IPL ACTION LIVE - INNINGS ${scoringState.inningsNo}`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#eab308", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>IPL Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))" }}>
            {/* Top header bar */}
            <div style={{ background: "linear-gradient(90deg, #1e3a8a 0%, #0f172a 100%)", borderTop: "3px solid #eab308", borderLeft: "3.5px solid #eab308", borderRight: "3.5px solid #eab308", borderRadius: "10px 10px 0 0", padding: "6px 20px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11px", letterSpacing: "1px" }}>IPL OFFICIAL BROADCAST</span>
              <span style={{ color: "#eab308", fontWeight: "900", fontSize: "11px", letterSpacing: "1px" }}>{statusLine}</span>
            </div>

            {/* Main Scoreboard panel */}
            <div style={{ display: "flex", alignItems: "stretch", height: "54px", background: "#0c0a23", border: "3.5px solid #eab308", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
              {/* Batting team gold badge */}
              <div style={{ background: "linear-gradient(180deg, #eab308 0%, #ca8a04 100%)", color: "#000", fontWeight: "950", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "120px", clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)" }}>
                {batTeamShort}
              </div>

              {/* Batsmen details */}
              <div style={{ display: "flex", flex: 1, padding: "0 18px", alignItems: "center", gap: "24px", marginLeft: "-10px" }}>
                <div>
                  <span style={{ color: "#eab308", fontWeight: "900", fontSize: "13px" }}>▶ {scoringState.striker || "—"}</span>
                  <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "16px" }}>{striker?.runs ?? 0} <span style={{ color: "#94a3b8", fontSize: "11px" }}>({striker?.balls ?? 0})</span></div>
                </div>
                <div>
                  <span style={{ color: "#cbd5e1", fontWeight: "600", fontSize: "12px", paddingLeft: "10px" }}>{scoringState.nonStriker || "—"}</span>
                  <div style={{ color: "#94a3b8", fontWeight: "700", fontSize: "14px", paddingLeft: "10px" }}>{nonStriker?.runs ?? 0} <span style={{ color: "#64748b", fontSize: "10px" }}>({nonStriker?.balls ?? 0})</span></div>
                </div>
              </div>

              {/* Center Score block */}
              <div style={{ background: "#1e3a8a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px", minWidth: "200px", borderLeft: "2px solid #eab308", borderRight: "2px solid #eab308" }}>
                <span style={{ color: "#eab308", fontWeight: "950", fontSize: "26px", lineHeight: 1 }}>{scoringState.score} - {scoringState.wickets}</span>
                <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: "800", marginTop: "2px" }}>OVERS: {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}</span>
              </div>

              {/* Bowler Details */}
              <div style={{ display: "flex", flex: 1.1, padding: "0 18px", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800" }}>BOWLER</span>
                  <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "14px", textTransform: "uppercase" }}>{scoringState.bowler || "—"}</div>
                  <div style={{ color: "#eab308", fontWeight: "900", fontSize: "14px" }}>
                    {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0} <span style={{ color: "#cbd5e1", fontSize: "10px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                  </div>
                </div>
                {/* Outcomes */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      return (
                        <div key={i} style={{ width: "20px", height: "20px", borderRadius: "50%", background: ball ? (ball === "W" || ball?.startsWith("W+") ? "#ef4444" : "#1e3a8a") : "transparent", border: ball ? "1.5px solid #eab308" : "1px dashed rgba(234,179,8,0.3)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900" }}>
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 20) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Bowling team */}
              <div style={{ background: "linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)", color: "#eab308", fontWeight: "950", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "120px", clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)" }}>
                {bowlTeamShort}
              </div>
            </div>
            {/* Notification / Status bar */}
            {activeNotification && (
              <div style={{
                background: getNotificationStyles(activeNotification).bg,
                border: "2px solid #eab308",
                borderTop: "none",
                borderRadius: "0 0 10px 10px",
                padding: "4px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <span style={{
                  color: getNotificationStyles(activeNotification).textColor,
                  fontSize: "11px",
                  fontWeight: "950",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  animation: "pulseGlow 1s ease-in-out infinite alternate"
                }}>{activeNotification}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#0c0a23", border: "2px solid #eab308", borderRadius: 12, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#eab308", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── WT20 2024 / 13th Theme: Neon pink and slate digital screen ──
  if (themeSlug === "wt20-2024") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `NEED ${need} RUNS IN ${bLeft} BALLS`
        : `WORLD CUP LIVE - GROUP MATCH`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#ec4899", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>WT20 2024 Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1300px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.6))" }}>
            {/* Target floating bubble */}
            {scoringState.target !== null && (
              <div style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", background: "#ec4899", color: "#fff", borderRadius: "10px", padding: "3px 20px", fontSize: "11px", fontWeight: "900", letterSpacing: "1px", zIndex: 5 }}>
                TARGET: {scoringState.target}
              </div>
            )}

            {/* Scoreboard row */}
            <div style={{ display: "flex", alignItems: "stretch", height: "54px", background: "#0c0216", border: "1.5px solid #ec4899", overflow: "hidden", borderRadius: "4px" }}>
              {/* Batting Team Pink Badge */}
              <div style={{ background: "#ec4899", color: "#ffffff", fontWeight: "900", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "120px" }}>
                {batTeamShort}
              </div>

              {/* Slanted chevron split */}
              <div style={{ width: "12px", background: "#a855f7", transform: "skewX(-15deg)", marginLeft: "-6px", marginRight: "-6px", zIndex: 2 }} />

              {/* Batsmen */}
              <div style={{ display: "flex", flex: 1, padding: "0 18px", alignItems: "center", gap: "24px" }}>
                <div>
                  <span style={{ color: "#ec4899", fontWeight: "900", fontSize: "13px" }}>🏏 {scoringState.striker || "—"}</span>
                  <div style={{ color: "#ffffff", fontWeight: "900", fontSize: "16px" }}>{striker?.runs ?? 0} <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>({striker?.balls ?? 0})</span></div>
                </div>
                <div>
                  <span style={{ color: "#cbd5e1", fontWeight: "600", fontSize: "12px", paddingLeft: "10px" }}>{scoringState.nonStriker || "—"}</span>
                  <div style={{ color: "#94a3b8", fontWeight: "700", fontSize: "14px", paddingLeft: "10px" }}>{nonStriker?.runs ?? 0} <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>({nonStriker?.balls ?? 0})</span></div>
                </div>
              </div>

              {/* Slanted chevron split */}
              <div style={{ width: "12px", background: "#a855f7", transform: "skewX(-15deg)", marginLeft: "-6px", marginRight: "-6px", zIndex: 2 }} />

              {/* Center score */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px", minWidth: "220px", background: "rgba(236,72,153,0.15)" }}>
                <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "28px", lineHeight: 1 }}>{scoringState.score} - {scoringState.wickets}</span>
                <span style={{ color: "#ec4899", fontSize: "11px", fontWeight: "900", marginTop: "2px" }}>OVERS: {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}</span>
              </div>

              {/* Slanted chevron split */}
              <div style={{ width: "12px", background: "#a855f7", transform: "skewX(-15deg)", marginLeft: "-6px", marginRight: "-6px", zIndex: 2 }} />

              {/* Bowler Details */}
              <div style={{ display: "flex", flex: 1.1, padding: "0 18px", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: "800" }}>BOWLER</span>
                  <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>{scoringState.bowler || "—"}</div>
                  <div style={{ color: "#ec4899", fontWeight: "900", fontSize: "14px" }}>
                    {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                  </div>
                </div>
                {/* Outcomes */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      return (
                        <div key={i} style={{ width: "18px", height: "18px", borderRadius: "50%", background: ball ? (ball === "W" || ball?.startsWith("W+") ? "#ef4444" : "rgba(168,85,247,0.25)") : "transparent", border: ball ? "1px solid #ec4899" : "1px dashed rgba(236,72,153,0.3)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900" }}>
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 18) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Slanted chevron split */}
              <div style={{ width: "12px", background: "#a855f7", transform: "skewX(-15deg)", marginLeft: "-6px", marginRight: "-6px", zIndex: 2 }} />

              {/* Bowling team */}
              <div style={{ background: "#25023a", color: "#ec4899", fontWeight: "900", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "120px" }}>
                {bowlTeamShort}
              </div>
            </div>
            {/* Bottom Status strip */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "#ec4899",
              padding: "3px 20px",
              display: "flex",
              justifyContent: "center",
              borderRadius: "0 0 4px 4px",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#000",
                fontSize: "10px",
                fontWeight: "950",
                letterSpacing: "1px",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>{activeNotification || statusLine}</span>
            </div>
          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#0c0216", border: "2px solid #ec4899", borderRadius: 8, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#ec4899", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── BBL STAR SPORTS / 14th Theme: Forest green skew TV broadcast banner ──
  if (themeSlug === "bbl-starsports") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `NEED ${need} RUNS TO WIN`
        : `LIVE BROADCAST FROM STAR SPORTS`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#10b981", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>BBL Star Sports Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1280px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            {/* Main banner block */}
            <div style={{ display: "flex", alignItems: "stretch", height: "56px", background: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)", border: "2.5px solid #cbd5e1", overflow: "hidden", borderRadius: "8px" }}>
              {/* Batting team skewed panel */}
              <div style={{ background: "#eab308", color: "#000", fontWeight: "950", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "120px", clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)" }}>
                {batTeamShort}
              </div>

              {/* Batsmen info */}
              <div style={{ display: "flex", flex: 1, padding: "0 18px", alignItems: "center", gap: "24px", marginLeft: "-10px" }}>
                <div>
                  <span style={{ color: "#eab308", fontWeight: "800", fontSize: "13px" }}>▶ {scoringState.striker || "—"}</span>
                  <div style={{ color: "#ffffff", fontWeight: "900", fontSize: "15px" }}>{striker?.runs ?? 0} <span style={{ color: "#94a3b8", fontSize: "10px" }}>({striker?.balls ?? 0})</span></div>
                </div>
                <div>
                  <span style={{ color: "#cbd5e1", fontWeight: "600", fontSize: "12px", paddingLeft: "10px" }}>{scoringState.nonStriker || "—"}</span>
                  <div style={{ color: "#94a3b8", fontWeight: "700", fontSize: "13px", paddingLeft: "10px" }}>{nonStriker?.runs ?? 0} <span style={{ color: "#64748b", fontSize: "9px" }}>({nonStriker?.balls ?? 0})</span></div>
                </div>
              </div>

              {/* Center score */}
              <div style={{ background: "#022c22", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px", minWidth: "200px", borderLeft: "2px solid #cbd5e1", borderRight: "2px solid #cbd5e1" }}>
                <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "26px", lineHeight: 1 }}>{scoringState.score} - {scoringState.wickets}</span>
                <span style={{ color: "#eab308", fontSize: "11px", fontWeight: "800", marginTop: "2px" }}>OVERS: {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}</span>
              </div>

              {/* Bowler Stats */}
              <div style={{ display: "flex", flex: 1.1, padding: "0 18px", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "800" }}>BOWLER</span>
                  <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>{scoringState.bowler || "—"}</div>
                  <div style={{ color: "#eab308", fontWeight: "900", fontSize: "14px" }}>
                    {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}
                  </div>
                </div>
                {/* Outcomes */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      return (
                        <div key={i} style={{ width: "18px", height: "18px", borderRadius: "50%", background: ball ? (ball === "W" || ball?.startsWith("W+") ? "#ef4444" : "rgba(255,255,255,0.1)") : "transparent", border: ball ? "1px solid #cbd5e1" : "1px dashed rgba(203,213,225,0.3)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900" }}>
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 18) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Bowling team */}
              <div style={{ background: "#cbd5e1", color: "#000", fontWeight: "950", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", minWidth: "120px", clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)" }}>
                {bowlTeamShort}
              </div>
            </div>
            {/* Status bottom ribbon */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "#cbd5e1",
              padding: "4px 20px",
              display: "flex",
              justifyContent: "center",
              borderRadius: "0 0 8px 8px",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#064e3b",
                fontSize: "11px",
                fontWeight: "950",
                letterSpacing: "1px",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>{activeNotification || statusLine}</span>
            </div>
          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#022c22", border: "2px solid #cbd5e1", borderRadius: 12, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#eab308", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── IPL 2025 / 15th Theme: Premium luxury purple-magenta glass ──
  if (themeSlug === "ipl-2025") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `IPL 2025: REQUIRE ${need} RUNS IN ${bLeft} BALLS`
        : `IPL 2025 SEASON ACTION LIVE`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#a855f7", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>IPL 2025 Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1380px", position: "relative", zIndex: 1, filter: "drop-shadow(0 8px 24px rgba(251,191,36,0.25))" }}>
            {/* Thin gold top accent line */}
            <div style={{ height: "3px", background: "linear-gradient(90deg, #7c3aed 0%, #fbbf24 30%, #f59e0b 70%, #7c3aed 100%)", borderRadius: "2px 2px 0 0" }} />

            {/* Main bar */}
            <div style={{ display: "flex", alignItems: "stretch", height: "52px", background: "linear-gradient(90deg, #04021a 0%, #0d0a2e 40%, #1a0a3a 60%, #04021a 100%)", overflow: "hidden", borderRadius: "0 0 4px 4px", border: "1px solid rgba(251,191,36,0.2)", borderTop: "none" }}>

              {/* ── LEFT WRAPPER (flex:1): Gold cap + Batsmen ── */}
              <div style={{ display: "flex", alignItems: "stretch", flex: "1 1 0%", minWidth: 0, overflow: "hidden" }}>

                {/* Gold slanted score cap */}
                <div style={{ display: "flex", alignItems: "center", background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", padding: "0 20px 0 16px", clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%)", minWidth: "200px", flexShrink: 0, gap: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <span style={{ color: "#1a0a3a", fontWeight: 900, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>{batTeamShort}</span>
                    <span style={{ color: "#000000", fontWeight: 950, fontSize: "22px", letterSpacing: "-0.5px" }}>{scoringState.score}-{scoringState.wickets}</span>
                  </div>
                  <div style={{ width: "1px", height: "28px", background: "rgba(0,0,0,0.2)", margin: "0 6px" }} />
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <span style={{ color: "rgba(0,0,0,0.6)", fontSize: "9px", fontWeight: "700", textTransform: "uppercase" }}>Overs</span>
                    <span style={{ color: "#1a0a3a", fontSize: "14px", fontWeight: "900" }}>{fmtOv(scoringState.balls, match.ballsPerOver)}</span>
                  </div>
                </div>

                {/* Batsmen */}
                <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "0 20px", gap: "18px", minWidth: 0 }}>
                  {/* Striker */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#fbbf24", fontSize: "8px" }}>▶</span>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                      <span style={{ color: "#fde68a", fontWeight: "800", fontSize: "11px", letterSpacing: "0.3px" }}>{scoringState.striker ? scoringState.striker.split(" ").pop() : "STRIKER"}</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                        <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "16px" }}>{striker?.runs ?? 0}</span>
                        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: "700" }}>({striker?.balls ?? 0})</span>
                      </div>
                    </div>
                  </div>
                  {/* Divider */}
                  <div style={{ width: "1px", height: "22px", background: "rgba(251,191,36,0.15)", flexShrink: 0 }} />
                  {/* Non-Striker */}
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                    <span style={{ color: "rgba(253,230,138,0.55)", fontWeight: "700", fontSize: "11px" }}>{scoringState.nonStriker ? scoringState.nonStriker.split(" ").pop() : "NON-STRIKER"}</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                      <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "800", fontSize: "14px" }}>{nonStriker?.runs ?? 0}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>({nonStriker?.balls ?? 0})</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── CENTER STATUS (fixed 200px, truly centered) ── */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "200px",
                flexShrink: 0,
                background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(180deg, rgba(124,58,237,0.3) 0%, rgba(0,0,0,0) 100%)",
                borderLeft: "1px solid rgba(251,191,36,0.18)",
                borderRight: "1px solid rgba(251,191,36,0.18)",
                transition: "all 0.3s ease"
              }}>
                {activeNotification ? (
                  <span style={{ color: getNotificationStyles(activeNotification).textColor, fontSize: "11px", fontWeight: "950", letterSpacing: "0.5px", textAlign: "center", textTransform: "uppercase", animation: "pulseGlow 1s ease-in-out infinite alternate" }}>{activeNotification}</span>
                ) : scoringState.target !== null ? (
                  <>
                    <span style={{ color: "#fbbf24", fontSize: "10px", fontWeight: "900", letterSpacing: "0.5px" }}>TARGET</span>
                    <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: "950" }}>{scoringState.target}</span>
                    <span style={{ color: "#a78bfa", fontSize: "9px", fontWeight: "800" }}>NEED {need} IN {bLeft}b</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: "rgba(251,191,36,0.5)", fontSize: "8px", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase" }}>IPL 2025</span>
                    <span style={{ color: "#fbbf24", fontSize: "10px", fontWeight: "950", letterSpacing: "1px" }}>LIVE</span>
                  </>
                )}
              </div>

              {/* ── RIGHT WRAPPER (flex:1): Bowler + Over balls + Purple cap ── */}
              <div style={{ display: "flex", alignItems: "stretch", flex: "1 1 0%", minWidth: 0, overflow: "hidden", justifyContent: "flex-end" }}>

                {/* Bowler + over balls */}
                <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "0 20px", gap: "16px", justifyContent: "flex-end", minWidth: 0 }}>
                  {/* Bowler info */}
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, alignItems: "flex-end" }}>
                    <span style={{ color: "rgba(253,230,138,0.6)", fontWeight: "700", fontSize: "11px", letterSpacing: "0.3px" }}>{scoringState.bowler ? scoringState.bowler.split(" ").pop() : "BOWLER"}</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                      <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "16px" }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}</span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                    </div>
                  </div>
                  {/* Over ball dots */}
                  <div style={{ display: "flex", gap: "3px", alignItems: "center", flexShrink: 0 }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => {
                        const val = thisOver[i];
                        let bg = "rgba(255,255,255,0.06)";
                        let color = "#ffffff";
                        let border = "1px solid rgba(251,191,36,0.2)";
                        if (val) {
                          border = "none";
                          if (val === "4" || val === "4s") { bg = "#3b82f6"; color = "#fff"; }
                          else if (val === "6" || val === "6s") { bg = "#fbbf24"; color = "#000"; }
                          else if (val === "W" || val?.startsWith("W+") || val === "Wk") { bg = "#ef4444"; color = "#fff"; }
                          else if (isExtraBall(val)) { bg = "#a855f7"; color = "#fff"; }
                          else { bg = "rgba(255,255,255,0.15)"; color = "#fff"; }
                        }
                        return (
                          <div key={i} style={{ width: "20px", height: "20px", borderRadius: "3px", background: bg, color, border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6px" : (val && val.length > 1 ? "8px" : "11px")), fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                            {renderOutcomeText(val, 20)}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Purple right cap */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)", padding: "0 16px 0 28px", width: "90px", flexShrink: 0, clipPath: "polygon(14px 0, 100% 0, 100% 100%, 0 100%)" }}>
                  <span style={{ color: "#fde68a", fontWeight: 950, fontSize: "15px", letterSpacing: "0.5px" }}>{bowlTeamShort}</span>
                </div>

              </div>

            </div>
          </div>

        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "rgba(24, 10, 48, 0.95)", border: "2px solid #fbbf24", borderRadius: 12, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#fbbf24", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── ALL OTHER THEMES: original lower-third design ────────────────────────
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 28px", fontFamily: activeFont, overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>
      <GroundBG bgUrl={theme.bgUrl} />

      {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#fbbf24", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span style={{ color: "#93c5fd" }}>{theme.name} Theme</span>
        <span style={{ color: "#4b5563", fontSize: 10 }}>| OBS: remove ?preview=true from URL</span>
      </div>}
      {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

      {scoringState.inningsStarted ? (
        <div className="slide-up" style={{ width: "90vw", position: "relative", zIndex: 1 }}>
          {/* Brand bar */}
          <div style={{ background: "linear-gradient(90deg,rgba(5,7,26,0.98),rgba(10,14,46,0.95))", borderTop: `3px solid ${theme.borderColor}`, borderLeft: `3px solid ${theme.borderColor}60`, borderRight: `3px solid ${theme.borderColor}60`, borderRadius: "18px 18px 0 0", padding: "9px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444", display: "inline-block" }} />
              <span style={{ color: theme.accentText, fontWeight: 900, fontSize: 13, letterSpacing: 2 }}>{match.team1Name.toUpperCase()} <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 6px" }}>vs</span> {match.team2Name.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: theme.textSecondary, fontWeight: 700, fontSize: 10, letterSpacing: 1.5 }}>{theme.name.toUpperCase()}</span>
              <span style={{ color: `${theme.borderColor}50` }}>•</span>
              <span style={{ color: theme.accentText, fontWeight: 800, fontSize: 10 }}>INN {scoringState.inningsNo}</span>
            </div>
          </div>

          {/* Main score panel with team logos */}
          <div style={{ backgroundImage: `linear-gradient(rgba(6,8,28,0.95),rgba(8,12,40,0.97)),url(${theme.bgUrl})`, backgroundSize: "cover", backgroundPosition: "center", backdropFilter: "blur(16px)", border: `2px solid ${theme.borderColor}45`, borderTop: "none", overflow: "hidden", boxShadow: `0 12px 40px rgba(0,0,0,0.6)` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "16px 22px", gap: 16 }}>
              {/* Left: Team 1 logo + batsmen or bowler info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <TeamLogo name={match.team1Name} isBatting={team1IsBatting} isBowling={!team1IsBatting} accentColor={theme.accent} borderColor={theme.borderColor} size={54} />
                <div style={{ flex: 1 }}>
                  {team1IsBatting ? <>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", display: "block" }} /><span className="striker-dot-ring" style={{ width: 12, height: 12 }} /></div>
                      <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>{scoringState.striker || "—"}</span>
                      <span style={{ color: theme.accentText, fontWeight: 900, fontSize: 12, marginLeft: 3 }}>{striker?.runs ?? 0}<span style={{ color: theme.textSecondary, fontSize: 9 }}>({striker?.balls ?? 0})</span></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 14 }}>
                      <span style={{ color: theme.textSecondary, fontSize: 11 }}>{scoringState.nonStriker || "—"}</span>
                      <span style={{ color: theme.textSecondary, fontSize: 10, marginLeft: 3 }}>{nonStriker?.runs ?? 0}<span style={{ fontSize: 8 }}>({nonStriker?.balls ?? 0})</span></span>
                    </div>
                  </> : <>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 13, marginBottom: 2 }}>{scoringState.bowler || "—"}</div>
                    <div style={{ color: theme.accentText, fontSize: 11, fontWeight: 800 }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0} <span style={{ color: theme.textSecondary, fontSize: 9 }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span></div>
                  </>}
                </div>
              </div>

              {/* Center: Big score */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px", borderLeft: `1px solid ${theme.borderColor}25`, borderRight: `1px solid ${theme.borderColor}25` }}>
                <div style={{ fontSize: 50, fontWeight: 950, color: theme.scoreText, lineHeight: 1, letterSpacing: -1, textShadow: `0 0 24px ${theme.accent}50` }}>{scoringState.score}-{scoringState.wickets}</div>
                <div style={{ color: theme.textSecondary, fontSize: 10, fontWeight: 800, marginTop: 3, letterSpacing: 1 }}>{fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs} OVR · RR:{calcRR(scoringState)}</div>
                {scoringState.target !== null && <div style={{ marginTop: 5, background: `${theme.accent}22`, border: `1px solid ${theme.accent}50`, borderRadius: 6, padding: "2px 10px", color: theme.accent, fontSize: 9, fontWeight: 900, letterSpacing: 1.5 }}>TGT:{scoringState.target} | NEED:{Math.max(0, scoringState.target - scoringState.score)}</div>}
              </div>

              {/* Right: Team 2 logo + info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "flex-end" }}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  {!team1IsBatting ? <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 4 }}>
                      <span style={{ color: theme.accentText, fontWeight: 900, fontSize: 12 }}>{striker?.runs ?? 0}<span style={{ color: theme.textSecondary, fontSize: 9 }}>({striker?.balls ?? 0})</span></span>
                      <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>{scoringState.striker || "—"}</span>
                      <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", display: "block" }} /><span className="striker-dot-ring" style={{ width: 12, height: 12 }} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, paddingRight: 14 }}>
                      <span style={{ color: theme.textSecondary, fontSize: 10 }}>{nonStriker?.runs ?? 0}<span style={{ fontSize: 8 }}>({nonStriker?.balls ?? 0})</span></span>
                      <span style={{ color: theme.textSecondary, fontSize: 11 }}>{scoringState.nonStriker || "—"}</span>
                    </div>
                  </> : <>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 13, marginBottom: 2 }}>{scoringState.bowler || "—"}</div>
                    <div style={{ color: theme.accentText, fontSize: 11, fontWeight: 800 }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0} <span style={{ color: theme.textSecondary, fontSize: 9 }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span></div>
                  </>}
                </div>
                <TeamLogo name={match.team2Name} isBatting={!team1IsBatting} isBowling={team1IsBatting} accentColor={theme.accent} borderColor={theme.borderColor} size={54} />
              </div>
            </div>

            {/* This over strip */}
            <div style={{
              padding: "8px 22px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderTop: `1px solid ${theme.borderColor}20`,
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "rgba(0,0,0,0.3)",
              transition: "all 0.3s ease"
            }}>
              {activeNotification ? (
                <div style={{ width: "100%", textAlign: "center", color: getNotificationStyles(activeNotification).textColor, fontWeight: 950, fontSize: 13, letterSpacing: 2, animation: "pulseGlow 1s ease-in-out infinite alternate" }}>
                  {activeNotification}
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 800, letterSpacing: 1.5, flexShrink: 0 }}>THIS OVER</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => (
                        <BallCircle key={i} val={scoringState.thisOver[i]} ballColors={theme.ballColors} borderColor={theme.borderColor} size={26} />
                      ));
                    })()}
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: theme.textSecondary }}>CRR: <span style={{ color: theme.accent }}>{calcRR(scoringState)}</span></div>
                    {scoringState.target !== null && <div style={{ fontSize: 10, fontWeight: 800, color: theme.textSecondary }}>RRR: <span style={{ color: "#4ade80" }}>{(((scoringState.target - scoringState.score) / Math.max(1, match.overs * match.ballsPerOver - scoringState.balls)) * match.ballsPerOver).toFixed(2)}</span></div>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Target ticker */}
          {scoringState.target !== null && <div style={{ background: `linear-gradient(90deg,${theme.accent}12,transparent,${theme.accent}12)`, border: `2px solid ${theme.borderColor}25`, borderTop: `1px solid ${theme.borderColor}15`, borderRadius: "0 0 18px 18px", padding: "8px 22px", display: "flex", gap: 20, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
            {[{ l: "CRR", v: calcRR(scoringState), c: theme.accent }, { l: "NEED", v: `${Math.max(0, scoringState.target - scoringState.score)} RUNS`, c: "#f87171" }, { l: "FROM", v: `${Math.max(0, match.overs * match.ballsPerOver - scoringState.balls)} BALLS`, c: theme.accentText }, { l: "RRR", v: (((scoringState.target - scoringState.score) / Math.max(1, match.overs * match.ballsPerOver - scoringState.balls)) * match.ballsPerOver).toFixed(2), c: "#4ade80" }].map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: theme.textSecondary, fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>{it.l}:</span>
                <span style={{ color: it.c, fontWeight: 900, fontSize: 11 }}>{it.v}</span>
                {i < 3 && <span style={{ color: `${theme.borderColor}35`, marginLeft: 8 }}>|</span>}
              </div>
            ))}
          </div>}
        </div>
      ) : (
        /* Match not started */
        <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "linear-gradient(rgba(8,10,28,0.94),rgba(8,10,28,0.97))", border: `2px solid ${theme.borderColor}`, borderRadius: 22, padding: "32px 48px", textAlign: "center", boxShadow: `0 12px 40px rgba(0,0,0,0.6),0 0 24px ${theme.borderColor}20`, width: "90vw" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 24 }}>
            <TeamLogo name={match.team1Name} isBatting={false} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={90} />
            <div style={{ display: "flex", alignItems: "center" }}><span style={{ color: "rgba(255,255,255,0.12)", fontSize: 36, fontWeight: 900 }}>VS</span></div>
            <TeamLogo name={match.team2Name} isBatting={false} isBowling={false} accentColor={theme.accent} borderColor={theme.borderColor} size={90} />
          </div>
          <div style={{ color: theme.accentText, fontWeight: 950, fontSize: 18, letterSpacing: 3 }}>🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}</div>
          <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 700, marginTop: 8, letterSpacing: 3 }}>MATCH NOT STARTED</div>
        </div>
      )}
    </div>
  );
}
