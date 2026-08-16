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
  "ipl-2025": { name: "IPL 2025", primaryBg: "rgba(4,6,35,0.96)", secondaryBg: "rgba(8,12,55,0.85)", accent: "#fbbf24", accentText: "#fde68a", textPrimary: "#ffffff", textSecondary: "#e0e7ff", scoreBg: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(0, 0, 0, 0.5))", scoreText: "#fde68a", borderColor: "#f59e0b", headerBg: "rgba(4,6,28,0.98)", ballColors: { runs: "#4338ca", four: "#fbbf24", six: "#f59e0b", wicket: "#ef4444", extra: "#34d399" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
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
  "ipl": {
    bg: "#0f172a",
    border: "2px solid rgba(245, 158, 11, 0.45)",
    borderLeft: "5px solid #f59e0b",
    accent: "#fbbf24",
    accentText: "#ffffff",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(245, 158, 11, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "ipl-2025": {
    bg: "#1a0f3c",
    border: "2px solid rgba(245, 158, 11, 0.45)",
    borderLeft: "5px solid #f59e0b",
    accent: "#f59e0b",
    accentText: "#ffffff",
    textSecondary: "#e2e8f0",
    shadow: "0 8px 32px rgba(245, 158, 11, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "jiocinema": {
    bg: "#090d16",
    border: "2px solid rgba(206, 23, 65, 0.5)",
    borderLeft: "5px solid #ce1741",
    accent: "#ce1741",
    accentText: "#ffffff",
    textSecondary: "#93c5fd",
    shadow: "0 8px 32px rgba(206, 23, 65, 0.35)",
    radius: "12px",
    font: "'Rubik', sans-serif"
  },
  "geo-cinema": {
    bg: "#090d16",
    border: "2px solid rgba(206, 23, 65, 0.5)",
    borderLeft: "5px solid #ce1741",
    accent: "#ce1741",
    accentText: "#ffffff",
    textSecondary: "#93c5fd",
    shadow: "0 8px 32px rgba(206, 23, 65, 0.35)",
    radius: "12px",
    font: "'Rubik', sans-serif"
  },
  "champions-trophy-2025": {
    bg: "#0a1128",
    border: "2px solid rgba(0, 204, 68, 0.45)",
    borderLeft: "5px solid #00cc44",
    accent: "#00cc44",
    accentText: "#ffffff",
    textSecondary: "#94a3b8",
    shadow: "0 8px 32px rgba(0, 204, 68, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "cricfusion": {
    bg: "#110b38",
    border: "2px solid rgba(220, 38, 38, 0.45)",
    borderLeft: "5px solid #dc2626",
    accent: "#dc2626",
    accentText: "#ffffff",
    textSecondary: "#c084fc",
    shadow: "0 8px 32px rgba(220, 38, 38, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "wcl-fancode": {
    bg: "#081225",
    border: "2px solid rgba(0, 212, 255, 0.45)",
    borderLeft: "5px solid #00d4ff",
    accent: "#00d4ff",
    accentText: "#ffffff",
    textSecondary: "#facc15",
    shadow: "0 8px 32px rgba(0, 212, 255, 0.35)",
    radius: "12px",
    font: "'Outfit', sans-serif"
  },
  "bbl-black": {
    bg: "#0a0814",
    border: "2px solid rgba(74, 222, 128, 0.45)",
    borderLeft: "5px solid #4ade80",
    accent: "#4ade80",
    accentText: "#ffffff",
    textSecondary: "#f5c511",
    shadow: "0 8px 32px rgba(74, 222, 128, 0.35)",
    radius: "10px",
    font: "'Orbitron', sans-serif"
  },
  "wt20-2024": {
    bg: "#0d041c",
    border: "2px solid rgba(124, 58, 237, 0.45)",
    borderLeft: "5px solid #7c3aed",
    accent: "#a78bfa",
    accentText: "#ffffff",
    textSecondary: "#c4b5fd",
    shadow: "0 8px 32px rgba(124, 58, 237, 0.35)",
    radius: "12px",
    font: "'Space Grotesk', sans-serif"
  },
  "sa20": {
    bg: "#04140c",
    border: "2px solid rgba(250, 204, 21, 0.45)",
    borderLeft: "5px solid #facc15",
    accent: "#facc15",
    accentText: "#ffffff",
    textSecondary: "#86efac",
    shadow: "0 8px 32px rgba(250, 204, 21, 0.35)",
    radius: "14px",
    font: "'Rubik', sans-serif"
  },
  "asia-cup": {
    bg: "#0d1e48",
    border: "2px solid rgba(251, 191, 36, 0.45)",
    borderLeft: "5px solid #fbbf24",
    accent: "#fbbf24",
    accentText: "#ffffff",
    textSecondary: "#86efac",
    shadow: "0 8px 32px rgba(251, 191, 36, 0.35)",
    radius: "12px",
    font: "'Space Grotesk', sans-serif"
  },
  "cwc-19": {
    bg: "#030b1c",
    border: "2px solid rgba(56, 189, 248, 0.45)",
    borderLeft: "5px solid #38bdf8",
    accent: "#38bdf8",
    accentText: "#ffffff",
    textSecondary: "#bae6fd",
    shadow: "0 8px 32px rgba(56, 189, 248, 0.35)",
    radius: "12px",
    font: "'Space Grotesk', sans-serif"
  },
  "cwc-23-india": {
    bg: "#080c28",
    border: "2px solid rgba(217, 70, 239, 0.45)",
    borderLeft: "5px solid #d946ef",
    accent: "#d946ef",
    accentText: "#ffffff",
    textSecondary: "#fb923c",
    shadow: "0 8px 32px rgba(217, 70, 239, 0.35)",
    radius: "12px",
    font: "'Space Grotesk', sans-serif"
  },
  "cwc-25-india": {
    bg: "#0c0a23",
    border: "2px solid rgba(251, 146, 60, 0.45)",
    borderLeft: "5px solid #fb923c",
    accent: "#fb923c",
    accentText: "#ffffff",
    textSecondary: "#38bdf8",
    shadow: "0 8px 32px rgba(251, 146, 60, 0.35)",
    radius: "12px",
    font: "'Outfit', sans-serif"
  },
  "t20-emerging-asia-cup": {
    bg: "#0b0f19",
    border: "2px solid rgba(245, 107, 19, 0.45)",
    borderLeft: "5px solid #f56b13",
    accent: "#f56b13",
    accentText: "#ffffff",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(245, 107, 19, 0.35)",
    radius: "12px",
    font: "'Space Grotesk', sans-serif"
  },
  "bbl-starsports": {
    bg: "#031c0a",
    border: "2px solid rgba(220, 38, 38, 0.45)",
    borderLeft: "5px solid #dc2626",
    accent: "#fbbf24",
    accentText: "#ffffff",
    textSecondary: "#fca5a5",
    shadow: "0 8px 32px rgba(220, 38, 38, 0.35)",
    radius: "10px",
    font: "'Orbitron', sans-serif"
  },
  "crioverlay-green": {
    bg: "#050b14",
    border: "2px solid rgba(118, 255, 3, 0.45)",
    borderLeft: "5px solid #76ff03",
    accent: "#76ff03",
    accentText: "#ffffff",
    textSecondary: "#00e5ff",
    shadow: "0 8px 32px rgba(118, 255, 3, 0.35)",
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

    // ── MATCH SUMMARY — Symmetrical 3-Column Broadcast Showcase ───────────
    if (isSummary) {
      const inn1 = getInnState(1);
      const inn2 = getInnState(2);
      const bt1 = getInnTeam(1, "bat");
      const bt2 = getInnTeam(2, "bat");
      const topB1 = inn1?.batsmen.slice().sort((a, b) => b.runs - a.runs || a.balls - b.balls).slice(0, 3) || [];
      const topB2 = inn2?.batsmen.slice().sort((a, b) => b.runs - a.runs || a.balls - b.balls).slice(0, 3) || [];
      const topBw1 = inn1?.bowlers.slice().sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded).slice(0, 3) || [];
      const topBw2 = inn2?.bowlers.slice().sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded).slice(0, 3) || [];
      const bt1IsT1 = bt1 === match.team1Name;

      const bpo = match.ballsPerOver || 6;
      const tossWinner = match.tossWonBy === "team1" ? match.team1Name : match.team2Name;
      const tossChoice = match.optedTo || "Bat";
      const tourName = (match as any).tournamentName || "MATCH SUMMARY";

      // Innings 1 metrics
      const inn1Fours = inn1?.batsmen.reduce((acc, b) => acc + (b.fours || 0), 0) || 0;
      const inn1Sixes = inn1?.batsmen.reduce((acc, b) => acc + (b.sixes || 0), 0) || 0;
      const inn1BoundaryRuns = (inn1Fours * 4) + (inn1Sixes * 6);
      const inn1BatRuns = inn1?.batsmen.reduce((acc, b) => acc + (b.runs || 0), 0) || 0;
      const inn1Extras = inn1 ? Math.max(0, inn1.score - inn1BatRuns) : 0;

      // Innings 2 metrics
      const inn2Fours = inn2?.batsmen.reduce((acc, b) => acc + (b.fours || 0), 0) || 0;
      const inn2Sixes = inn2?.batsmen.reduce((acc, b) => acc + (b.sixes || 0), 0) || 0;
      const inn2BoundaryRuns = (inn2Fours * 4) + (inn2Sixes * 6);
      const inn2BatRuns = inn2?.batsmen.reduce((acc, b) => acc + (b.runs || 0), 0) || 0;
      const inn2Extras = inn2 ? Math.max(0, inn2.score - inn2BatRuns) : 0;

      // Chase calculations
      const runsNeeded = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : 0;
      const totalBalls = match.overs * bpo;
      const ballsRemaining = Math.max(0, totalBalls - scoringState.balls);
      const rrr = ballsRemaining > 0 && scoringState.target !== null ? ((runsNeeded / ballsRemaining) * bpo).toFixed(2) : "0.00";
      const crr = scoringState.balls > 0 ? ((scoringState.score / scoringState.balls) * bpo).toFixed(2) : "0.00";

      const renderInnColumn = (label: string, sublabel: string, team: string, inn: any, topBat: any[], topBowl: any[], isT1: boolean, isRight: boolean, fours: number, sixes: number, boundaryRuns: number, extras: number) => (
        <div style={{
          padding: "26px 24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          {/* Header & Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", display: "inline-flex" }}>
                <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px dashed ${panelAccent}50`, animation: "spin 30s linear infinite" }} />
                <TeamLogo
                  name={team}
                  isBatting={scoringState.inningsNo === (isRight ? 2 : 1) && scoringState.battingTeam === (isT1 ? "team1" : "team2") && scoringState.inningsStarted && match.status !== "Completed"}
                  isBowling={scoringState.inningsNo === (isRight ? 2 : 1) && scoringState.bowlingTeam === (isT1 ? "team1" : "team2") && scoringState.inningsStarted && match.status !== "Completed"}
                  accentColor={theme.accent}
                  borderColor={theme.borderColor}
                  size={72}
                />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 9, color: panelAccent, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase" }}>{label}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: panelSecondary, opacity: 0.6 }} />
                  <span style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 800, letterSpacing: 1.5 }}>{sublabel}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 950, color: "#fff", letterSpacing: 0.5, lineHeight: 1.1 }}>
                  {team.toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{
              padding: "5px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 9.5,
              fontWeight: 800,
              color: panelSecondary,
              textAlign: "right"
            }}>
              {inn ? `${fmtOv(inn.balls, bpo)} / ${match.overs} Ov` : "YET TO BAT"}
            </div>
          </div>

          {inn ? (
            <>
              {/* Hero Score Box */}
              <div style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.04), ${panelBg}99, rgba(0,0,0,0.3))`,
                border: `1.5px solid ${panelAccent}30`,
                borderLeft: `4px solid ${panelAccent}`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: `0 8px 24px rgba(0,0,0,0.3)`
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 46, fontWeight: 950, color: panelAccent, lineHeight: 1, textShadow: `0 0 20px ${panelAccent}40` }}>
                      {inn.score}
                    </span>
                    <span style={{ fontSize: 28, fontWeight: 500, color: panelAccentTx, opacity: 0.6, margin: "0 2px" }}>/</span>
                    <span style={{ fontSize: 36, fontWeight: 950, color: panelAccentTx }}>
                      {inn.wickets}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: panelSecondary, fontWeight: 800, marginTop: 4, letterSpacing: 0.5 }}>
                    {fmtOv(inn.balls, bpo)} / {match.overs} OVERS · RR <span style={{ color: panelAccent, fontWeight: 950 }}>{calcRR(inn as any)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <div style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>💥 {fours}×4s</span>
                    <span style={{ opacity: 0.3 }}>|</span>
                    <span>🚀 {sixes}×6s</span>
                  </div>
                  <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 700 }}>
                    Boundaries: <span style={{ color: panelAccent, fontWeight: 900 }}>{boundaryRuns}</span> · Extras: <span style={{ color: "#fff", fontWeight: 900 }}>{extras}</span>
                  </div>
                </div>
              </div>

              {/* Top Batsmen */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7, padding: "0 2px" }}>
                  <div style={{ fontSize: 8.5, color: panelAccent, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>🏏</span> TOP BATSMEN
                  </div>
                  <div style={{ fontSize: 7.5, color: panelSecondary, fontWeight: 800, letterSpacing: 1 }}>
                    R (B) · 4s/6s · SR
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {topBat.length > 0 ? (
                    topBat.map((b, i) => {
                      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
                      const pct = inn ? Math.min(100, Math.round((b.runs / (inn.score || 1)) * 100)) : 0;
                      return (
                        <div
                          key={i}
                          className="stat-badge"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8
                          }}
                        >
                          <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${pct}%`, background: `linear-gradient(90deg, ${panelAccent}, ${theme.borderColor})`, opacity: 0.8 }} />

                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <div style={{
                              width: 20,
                              height: 20,
                              borderRadius: 5,
                              background: i === 0 ? `${panelAccent}30` : "rgba(255,255,255,0.05)",
                              border: `1px solid ${i === 0 ? panelAccent : "rgba(255,255,255,0.1)"}`,
                              fontSize: 9.5,
                              fontWeight: 950,
                              color: i === 0 ? panelAccent : panelSecondary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}>
                              {i + 1}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ color: "#fff", fontWeight: 900, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {b.name}
                                {b.out ? (
                                  <span style={{ fontSize: 7.5, color: "#f87171", fontWeight: 800, marginLeft: 5, opacity: 0.8 }}>OUT</span>
                                ) : (
                                  <span style={{ fontSize: 7.5, color: "#4ade80", fontWeight: 800, marginLeft: 5, opacity: 0.9 }}>*NOT OUT</span>
                                )}
                              </div>
                              <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 700, marginTop: 1 }}>
                                {b.fours}×4s · {b.sixes}×6s · SR {sr}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ fontSize: 16, fontWeight: 950, color: panelAccent, lineHeight: 1 }}>
                              {b.runs}
                            </span>
                            <span style={{ fontSize: 10.5, color: panelSecondary, fontWeight: 700, marginLeft: 3 }}>
                              ({b.balls})
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: 10.5, color: panelSecondary, textAlign: "center", padding: 10 }}>
                      No batting figures recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* Top Bowlers */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7, padding: "0 2px" }}>
                  <div style={{ fontSize: 8.5, color: panelAccent, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>🎯</span> TOP BOWLERS
                  </div>
                  <div style={{ fontSize: 7.5, color: panelSecondary, fontWeight: 800, letterSpacing: 1 }}>
                    O · R · W · ECON
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {topBowl.length > 0 ? (
                    topBowl.map((bw, i) => {
                      const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * bpo).toFixed(2) : "0.00";
                      const isGreatSpell = bw.wickets >= 2;
                      return (
                        <div
                          key={i}
                          className="stat-badge"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                            border: `1px solid ${isGreatSpell ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)"}`,
                            borderRadius: 10,
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <div style={{
                              width: 20,
                              height: 20,
                              borderRadius: 5,
                              background: bw.wickets > 0 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                              border: `1px solid ${bw.wickets > 0 ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                              fontSize: 9.5,
                              fontWeight: 950,
                              color: bw.wickets > 0 ? "#ef4444" : panelSecondary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}>
                              {i + 1}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ color: "#fff", fontWeight: 900, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {bw.name}
                              </div>
                              <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 700, marginTop: 1 }}>
                                {fmtOv(bw.ballsBowled, bpo)} Ov · Econ <span style={{ color: parseFloat(eco) <= 6.0 ? "#4ade80" : "#fb923c", fontWeight: 800 }}>{eco}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ fontSize: 16, fontWeight: 950, color: "#ef4444", lineHeight: 1 }}>
                              {bw.wickets}
                            </span>
                            <span style={{ fontSize: 11, color: panelSecondary, fontWeight: 700, margin: "0 2px" }}>/</span>
                            <span style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>
                              {bw.runsConceded}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: 10.5, color: panelSecondary, textAlign: "center", padding: 10 }}>
                      No bowling figures recorded.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              minHeight: 260,
              borderRadius: 14,
              background: "rgba(0,0,0,0.25)",
              border: "1.5px dashed rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.6 }}>🏏</div>
              <div style={{ fontSize: 15, fontWeight: 950, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>
                YET TO BAT
              </div>
              <div style={{ fontSize: 10.5, color: panelSecondary, marginTop: 4, maxWidth: 200 }}>
                {team} will commence their innings in the 2nd innings.
              </div>
            </div>
          )}
        </div>
      );

      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden", padding: "20px 0" }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />

          {/* Floating Print / Save PDF button */}
          <button
            className="no-print"
            onClick={() => window.print()}
            style={{
              position: "fixed",
              top: 18,
              right: 22,
              zIndex: 9999,
              background: `linear-gradient(135deg, ${panelAccent}, ${theme.borderColor})`,
              color: "#000",
              border: "none",
              borderRadius: 12,
              padding: "10px 22px",
              fontWeight: 950,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${panelAccent}60`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: 1.5,
              textTransform: "uppercase"
            }}
          >
            🖨️ Save PDF
          </button>

          <div style={{ position: "relative", zIndex: 1, width: "92vw", maxWidth: 1360 }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* ── Top Header Banner (Matches Summary Design System) ── */}
            <div className="animate-slide-up" style={{
              background: `linear-gradient(185deg, rgba(4,6,20,0.99), ${panelBg}f6, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}40`,
              borderBottom: `2px solid ${panelAccent}40`,
              borderRadius: "24px 24px 0 0",
              padding: "18px 32px",
              boxShadow: panelShadow,
              backdropFilter: "blur(24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14
            }}>
              {/* Left: Tournament & Match Details */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${panelAccent}25, rgba(255,255,255,0.04))`,
                  border: `1.5px solid ${panelAccent}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: `0 0 16px ${panelAccent}30`
                }}>
                  🏏
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: panelAccentTx, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.9 }}>
                    {match.matchType.toUpperCase()} · MATCH #{match.matchNo} · {match.overs} OVERS
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5, marginTop: 2, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                    {tourName.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Center: Live / Winner Status Pill */}
              <div style={{
                background: match.status === "Completed"
                  ? `linear-gradient(135deg, ${panelAccent}30, rgba(0,0,0,0.7))`
                  : scoringState.inningsNo === 2
                    ? "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(0,0,0,0.7))"
                    : "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(0,0,0,0.7))",
                border: `1.5px solid ${match.status === "Completed" ? panelAccent : scoringState.inningsNo === 2 ? "#ef4444" : panelAccent}`,
                borderRadius: 999,
                padding: "8px 22px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 0 20px ${match.status === "Completed" ? panelAccent : scoringState.inningsNo === 2 ? "#ef4444" : panelAccent}40`
              }}>
                {match.status === "Completed" ? (
                  <>
                    <span style={{ fontSize: 16 }}>🏆</span>
                    <span style={{ fontSize: 13, fontWeight: 950, color: panelAccentTx, letterSpacing: 1.5, textTransform: "uppercase" }}>
                      {winnerText ? winnerText.toUpperCase() : "MATCH COMPLETED"}
                    </span>
                  </>
                ) : scoringState.inningsNo === 2 ? (
                  <>
                    <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    <span style={{ fontSize: 12, fontWeight: 950, color: "#ffffff", letterSpacing: 1 }}>
                      TARGET: <span style={{ color: panelAccent }}>{scoringState.target}</span> · NEED <span style={{ color: "#ffffff", fontWeight: 950 }}>{runsNeeded}</span> FROM <span style={{ color: "#ffffff" }}>{ballsRemaining}b</span> (RRR: {rrr})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    <span style={{ fontSize: 12, fontWeight: 950, color: "#ffffff", letterSpacing: 1.5 }}>
                      1ST INNINGS IN PROGRESS · CRR {crr}
                    </span>
                  </>
                )}
              </div>

              {/* Right: Broadcast Theme Tag */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.9 }}>
                  OFFICIAL BROADCAST
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 950, color: panelAccent, letterSpacing: 1.2, marginTop: 2, textShadow: `0 0 12px ${panelAccent}40` }}>
                  {theme.name.toUpperCase()}
                </div>
              </div>
            </div>

            {/* ── 3-Column Symmetrical Dashboard Grid (Innings 1 | Center Nerve / Required Runs | Innings 2) ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 180px 1fr",
              background: `linear-gradient(185deg, rgba(2,4,16,0.98), ${panelBg}f2, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}30`,
              borderTop: "none",
              borderRadius: "0 0 24px 24px",
              overflow: "hidden",
              boxShadow: panelShadow,
              backdropFilter: "blur(24px)",
              position: "relative"
            }}>
              {/* 1. LEFT COLUMN: INNINGS 1 */}
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                {renderInnColumn("1ST INNINGS", "BATTED FIRST", bt1, inn1, topB1, topBw1, bt1IsT1, false, inn1Fours, inn1Sixes, inn1BoundaryRuns, inn1Extras)}
              </div>

              {/* 2. CENTER COLUMN: VS, REQUIRED RUNS / STATUS & MATCH PULSE */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "26px 14px 22px",
                position: "relative",
                background: `linear-gradient(180deg, ${panelAccent}08, rgba(0,0,0,0.5) 50%, ${panelAccent}08)`,
                borderRight: "1px solid rgba(255,255,255,0.06)"
              }}>
                {/* Glowing Central VS Emblem */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${panelAccent}25, rgba(0,0,0,0.85))`,
                  border: `2px solid ${panelAccent}`,
                  boxShadow: `0 0 18px ${panelAccent}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 950,
                  color: panelAccentTx,
                  letterSpacing: 1
                }}>
                  VS
                </div>

                {/* Prominent Center Required Runs / Match Status Box */}
                <div style={{
                  width: "100%",
                  background: match.status === "Completed"
                    ? `linear-gradient(135deg, ${panelAccent}25, rgba(0,0,0,0.7))`
                    : scoringState.inningsNo === 2
                      ? "linear-gradient(135deg, rgba(239,68,68,0.22), rgba(0,0,0,0.6))"
                      : "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(0,0,0,0.6))",
                  border: `1.5px solid ${match.status === "Completed" ? panelAccent : scoringState.inningsNo === 2 ? "#ef4444" : theme.borderColor}`,
                  borderRadius: 14,
                  padding: "14px 10px",
                  textAlign: "center",
                  boxShadow: `0 8px 24px ${match.status === "Completed" ? panelAccent : scoringState.inningsNo === 2 ? "#ef4444" : theme.borderColor}25`
                }}>
                  {match.status === "Completed" ? (
                    <div>
                      <div style={{ fontSize: 18, marginBottom: 2 }}>🏆</div>
                      <div style={{ fontSize: 8, color: panelAccent, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>RESULT</div>
                      <div style={{ fontSize: 12, fontWeight: 950, color: "#fff", marginTop: 4, lineHeight: 1.2 }}>
                        {winnerText ? winnerText.toUpperCase() : "COMPLETED"}
                      </div>
                    </div>
                  ) : scoringState.inningsNo === 2 ? (
                    <div>
                      <div style={{ fontSize: 8.5, color: "#fca5a5", fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>NEED</div>
                      <div style={{ fontSize: 34, fontWeight: 950, color: "#fff", lineHeight: 1, textShadow: "0 0 14px rgba(255,255,255,0.4)" }}>
                        {runsNeeded}
                      </div>
                      <div style={{ fontSize: 8, color: panelSecondary, fontWeight: 800, marginTop: 4, letterSpacing: 1 }}>
                        OFF {ballsRemaining} BALLS
                      </div>
                      <div style={{ fontSize: 8, color: panelAccent, fontWeight: 900, marginTop: 3 }}>
                        RRR: {rrr}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 3 }}>
                        <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                        <span style={{ fontSize: 8.5, color: "#fca5a5", fontWeight: 900, letterSpacing: 1.5 }}>LIVE</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 950, color: "#fff", textTransform: "uppercase" }}>
                        INN 1
                      </div>
                      <div style={{ fontSize: 8, color: panelSecondary, fontWeight: 800, marginTop: 3 }}>
                        CRR: {crr}
                      </div>
                    </div>
                  )}
                </div>

                {/* Toss Box */}
                <div style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "8px 6px",
                  textAlign: "center",
                  width: "100%"
                }}>
                  <div style={{ fontSize: 7.5, color: panelAccent, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>
                    🪙 TOSS
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tossWinner}
                  </div>
                  <div style={{ fontSize: 8, color: panelSecondary, fontWeight: 700, marginTop: 1 }}>
                    opted to {tossChoice}
                  </div>
                </div>

                {/* Match Format Tag */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 7.5, color: panelSecondary, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase" }}>
                    FORMAT
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 950, color: panelAccent, marginTop: 1 }}>
                    {match.overs} OVERS
                  </div>
                </div>
              </div>

              {/* 3. RIGHT COLUMN: INNINGS 2 */}
              <div>
                {renderInnColumn("2ND INNINGS", scoringState.target ? `CHASING ${scoringState.target}` : "TARGET CHASE", bt2, inn2, topB2, topBw2, !bt1IsT1, true, inn2Fours, inn2Sixes, inn2BoundaryRuns, inn2Extras)}
              </div>
            </div>

            {/* ── Bottom Spotlight / Man of the Match Ribbon ── */}
            {scoringState.momPlayer && (
              <div className="animate-slide-up" style={{
                marginTop: 12,
                background: `linear-gradient(90deg, rgba(2,4,15,0.95), ${theme.headerBg}ee, rgba(2,4,15,0.95))`,
                border: `1.5px solid ${panelAccent}60`,
                borderRadius: 16,
                padding: "12px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: `0 8px 30px ${panelAccent}25`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <div>
                    <span style={{ fontSize: 9, color: panelSecondary, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>MAN OF THE MATCH: </span>
                    <span style={{ fontSize: 15, color: panelAccent, fontWeight: 950, letterSpacing: 1 }}>{scoringState.momPlayer.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  MATCH IMPACT PLAYER
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── FALL OF WICKETS — Broadcast-Grade Timeline Beads with Exact Theme Palette ──
    if (isFow) {
      const fowList = scoringState.fallOfWickets || [];
      const row1 = fowList.slice(0, 5);
      const row2 = fowList.slice(5);
      const tourName = (match as any).tournamentName || "FALL OF WICKETS";
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden", padding: "20px 0" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "88vw", maxWidth: 1300 }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* Top Header Banner with Theme Palette */}
            <div className="animate-slide-up" style={{
              background: `linear-gradient(185deg, rgba(4,6,20,0.99), ${panelBg}f6, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}40`,
              borderBottom: `2px solid #ef4444`,
              borderRadius: "24px 24px 0 0",
              padding: "18px 32px",
              boxShadow: panelShadow,
              backdropFilter: "blur(24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <TeamLogo
                  name={currentBatTeam}
                  isBatting={true}
                  isBowling={false}
                  accentColor={panelAccent}
                  borderColor={theme.borderColor}
                  size={58}
                />
                <div>
                  <div style={{ fontSize: 9.5, color: "#f87171", fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase" }}>
                    INNINGS {scoringState.inningsNo} · WICKETS TIMELINE
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                    {currentBatTeam.toUpperCase()} FALL OF WICKETS
                  </div>
                </div>
              </div>

              {/* Center Total Wickets Pill */}
              <div style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(0,0,0,0.7))",
                border: "1.5px solid #ef4444",
                borderRadius: 999,
                padding: "8px 22px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 0 20px rgba(239,68,68,0.35)"
              }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <span style={{ fontSize: 16, fontWeight: 950, color: "#ffffff", letterSpacing: 1 }}>
                  {fowList.length} <span style={{ color: "#f87171" }}>/ 10</span> WICKETS DOWN
                </span>
              </div>

              {/* Theme Name Branding */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.9 }}>
                  OFFICIAL BROADCAST
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 950, color: panelAccent, letterSpacing: 1.2, marginTop: 2, textShadow: `0 0 12px ${panelAccent}40` }}>
                  {theme.name.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Main Timeline Card Container */}
            <div style={{
              background: `linear-gradient(185deg, rgba(2,4,16,0.98), ${panelBg}, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}30`,
              borderTop: "none",
              borderRadius: "0 0 24px 24px",
              padding: "36px 32px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)"
            }}>
              {fowList.length > 0 ? (
                <>
                  {/* Timeline Row 1 */}
                  <div style={{ position: "relative", marginBottom: row2.length > 0 ? 36 : 20 }}>
                    <div style={{ position: "absolute", top: 18, left: "4%", right: "4%", height: 3, background: "linear-gradient(90deg, #ef4444, rgba(239,68,68,0.2))", borderRadius: 4 }} />
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${row1.length}, 1fr)`, gap: 14 }}>
                      {row1.map((f: any, i: number) => (
                        <div key={i} className="table-row-animated" style={{ animationDelay: `${i * 0.07}s`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #991b1b, #dc2626)",
                            border: "2.5px solid #ef4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 950,
                            color: "#ffffff",
                            boxShadow: "0 0 16px rgba(239,68,68,0.6)",
                            zIndex: 2
                          }}>
                            {f.wickets}
                          </div>
                          <div style={{
                            marginTop: 12,
                            background: "linear-gradient(145deg, rgba(239,68,68,0.12), rgba(0,0,0,0.6))",
                            border: "1.5px solid rgba(239,68,68,0.3)",
                            borderRadius: 14,
                            padding: "12px 14px",
                            textAlign: "center",
                            width: "100%",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                          }}>
                            <div style={{ fontSize: 8.5, color: "#f87171", fontWeight: 900, letterSpacing: 1.5, marginBottom: 3 }}>
                              WICKET {f.wickets}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 950, color: "#ffffff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {f.batsman}
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 950, color: panelAccent, lineHeight: 1 }}>
                              {f.score}
                            </div>
                            <div style={{ fontSize: 9.5, color: panelSecondary, fontWeight: 700, marginTop: 4 }}>
                              {typeof f.over === "number" ? f.over.toFixed(1) : f.over} OVERS
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Row 2 */}
                  {row2.length > 0 && (
                    <div style={{ position: "relative", marginBottom: 24 }}>
                      <div style={{ position: "absolute", top: 18, left: "4%", right: "4%", height: 3, background: "linear-gradient(90deg, #ef4444, rgba(239,68,68,0.2))", borderRadius: 4 }} />
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${row2.length}, 1fr)`, gap: 14 }}>
                        {row2.map((f: any, i: number) => (
                          <div key={i} className="table-row-animated" style={{ animationDelay: `${(i + 5) * 0.07}s`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #991b1b, #dc2626)",
                              border: "2.5px solid #ef4444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 950,
                              color: "#ffffff",
                              boxShadow: "0 0 16px rgba(239,68,68,0.6)",
                              zIndex: 2
                            }}>
                              {f.wickets}
                            </div>
                            <div style={{
                              marginTop: 12,
                              background: "linear-gradient(145deg, rgba(239,68,68,0.12), rgba(0,0,0,0.6))",
                              border: "1.5px solid rgba(239,68,68,0.3)",
                              borderRadius: 14,
                              padding: "12px 14px",
                              textAlign: "center",
                              width: "100%",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                            }}>
                              <div style={{ fontSize: 8.5, color: "#f87171", fontWeight: 900, letterSpacing: 1.5, marginBottom: 3 }}>
                                WICKET {f.wickets}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 950, color: "#ffffff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {f.batsman}
                              </div>
                              <div style={{ fontSize: 24, fontWeight: 950, color: panelAccent, lineHeight: 1 }}>
                                {f.score}
                              </div>
                              <div style={{ fontSize: 9.5, color: panelSecondary, fontWeight: 700, marginTop: 4 }}>
                                {typeof f.over === "number" ? f.over.toFixed(1) : f.over} OVERS
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary Badges Row */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", borderTop: `1px solid ${theme.borderColor}20`, paddingTop: 20 }}>
                    {fowList.map((f: any, i: number) => (
                      <span key={i} style={{
                        background: "rgba(239,68,68,0.15)",
                        border: "1.5px solid rgba(239,68,68,0.4)",
                        borderRadius: 20,
                        padding: "6px 14px",
                        fontSize: 11.5,
                        fontWeight: 900,
                        color: "#f87171"
                      }}>
                        {f.score}/{f.wickets} <span style={{ color: "#ffffff", opacity: 0.9, fontWeight: 700 }}>({f.batsman}, {typeof f.over === "number" ? f.over.toFixed(1) : f.over} ov)</span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", color: panelSecondary, padding: 60 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🏏</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#ffffff" }}>NO WICKETS FALLEN YET</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>The batting side has not lost any wickets in this innings.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── BOWLER SPOTLIGHT — Centered oval design ──────────────────────────
    if (isBowlerSp) {
      const eco = bowler && bowler.ballsBowled > 0 ? ((bowler.runsConceded / bowler.ballsBowled) * match.ballsPerOver).toFixed(2) : "0.00";
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "fixed", inset: 0, zIndex: 0, background: `radial-gradient(ellipse 60% 50% at 50% 50%,${panelAccent}20,transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, width: "68vw", maxWidth: 960, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}
            <div className="animate-slide-up" style={{ marginBottom: 20 }}>
              <TeamLogo name={currentBowlTeam} isBatting={false} isBowling={true} accentColor={panelAccent} borderColor={theme.borderColor} size={88} />
            </div>
            <div className="scale-in" style={{ background: `linear-gradient(185deg, rgba(2,4,16,0.98), ${panelBg}, rgba(2,4,16,0.99))`, border: `2px solid ${theme.borderColor}`, borderTop: `6px solid ${panelAccent}`, borderRadius: 24, padding: "40px 48px", textAlign: "center", minWidth: "100%", boxShadow: panelShadow }}>
              <div style={{ fontSize: 11, color: panelSecondary, fontWeight: 900, letterSpacing: 4, marginBottom: 8, textTransform: "uppercase" }}>⚡ BOWLING SPOTLIGHT · ACTIVE SPELL</div>
              <div style={{ fontSize: 44, fontWeight: 950, color: "#fff", letterSpacing: 1, marginBottom: 4, textShadow: `0 0 30px ${panelAccent}40` }}>{scoringState.bowler || "No Bowler"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 28, marginBottom: scoringState.thisOver.length > 0 ? 28 : 0 }}>
                {[{ l: "WICKETS", v: bowler?.wickets ?? 0, c: "#ef4444" }, { l: "RUNS", v: bowler?.runsConceded ?? 0, c: "#fff" }, { l: "OVERS", v: fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver), c: panelAccentTx }, { l: "ECONOMY", v: eco, c: parseFloat(eco) < 8 ? "#4ade80" : "#f87171" }].map((st, i) => (
                  <div key={i} style={{ background: i === 0 ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${i === 0 ? "#ef4444" : "rgba(255,255,255,0.08)"}40`, borderRadius: 18, padding: "20px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                    <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>{st.l}</div>
                    <div style={{ fontSize: 34, fontWeight: 950, color: st.c }}>{st.v}</div>
                  </div>
                ))}
              </div>
              {scoringState.thisOver.length > 0 && <>
                <div style={{ fontSize: 9.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>THIS OVER DELIVERIES</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {(() => {
                    const bpo = match.ballsPerOver || 6;
                    const thisOver = scoringState.thisOver || [];
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCircles = bpo + extrasCount;
                    return Array.from({ length: totalCircles }).map((_, i) => (
                      <BallCircle key={i} val={thisOver[i]} ballColors={theme.ballColors} borderColor={theme.borderColor} size={42} />
                    ));
                  })()}
                </div>
              </>}
            </div>
          </div>
        </div>
      );
    }

    // ── TARGET — Broadcast-Grade Chase Equation with Exact Theme Palette ──
    if (isTarget) {
      const need = Math.max(0, (scoringState.target || 0) - scoringState.score);
      const bpo = match.ballsPerOver || 6;
      const bLeft = Math.max(0, match.overs * bpo - scoringState.balls);
      const rrr = bLeft > 0 ? ((need / bLeft) * bpo).toFixed(2) : "0.00";
      const crr = scoringState.balls > 0 ? ((scoringState.score / scoringState.balls) * bpo).toFixed(2) : "0.00";
      const pct = scoringState.target ? Math.min(100, (scoringState.score / scoringState.target) * 100) : 0;
      const tourName = (match as any).tournamentName || "MATCH EQUATION";

      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden", padding: "20px 0" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "84vw", maxWidth: 1180 }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* Top Header Banner with Theme Palette */}
            <div className="animate-slide-up" style={{
              background: `linear-gradient(185deg, rgba(4,6,20,0.99), ${panelBg}f6, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}40`,
              borderBottom: `2px solid ${panelAccent}40`,
              borderRadius: "24px 24px 0 0",
              padding: "18px 36px",
              boxShadow: panelShadow,
              backdropFilter: "blur(24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16
            }}>
              {/* Batting Team Logo & Title */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative", display: "inline-flex" }}>
                  <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px dashed ${panelAccent}50`, animation: "spin 30s linear infinite" }} />
                  <TeamLogo name={currentBatTeam} isBatting={true} isBowling={false} accentColor={panelAccent} borderColor={theme.borderColor} size={64} />
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: panelAccentTx, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase" }}>
                    INNINGS 2 · CHASE EQUATION
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                    {currentBatTeam.toUpperCase()} BATTING
                  </div>
                </div>
              </div>

              {/* Center Match Equation Badge */}
              <div style={{
                background: `linear-gradient(135deg, ${panelAccent}25, rgba(0,0,0,0.7))`,
                border: `1.5px solid ${panelAccent}`,
                borderRadius: 999,
                padding: "8px 24px",
                textAlign: "center",
                boxShadow: `0 0 20px ${panelAccent}30`
              }}>
                <div style={{ fontSize: 13, fontWeight: 950, color: "#ffffff", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  TARGET: <span style={{ color: panelAccent }}>{scoringState.target} RUNS</span>
                </div>
              </div>

              {/* Bowling Team Logo & Title */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
                    BOWLING SIDE
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                    {currentBowlTeam.toUpperCase()}
                  </div>
                </div>
                <TeamLogo name={currentBowlTeam} isBatting={false} isBowling={true} accentColor={panelAccent} borderColor={theme.borderColor} size={64} />
              </div>
            </div>

            {/* Main Target Card Body */}
            <div style={{
              background: `linear-gradient(185deg, rgba(2,4,16,0.98), ${panelBg}, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}30`,
              borderTop: "none",
              borderRadius: "0 0 24px 24px",
              padding: "36px 44px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
              textAlign: "center"
            }}>
              {scoringState.target !== null ? (
                <>
                  <div style={{ fontSize: 13, color: panelSecondary, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>
                    ⚡ {currentBatTeam.toUpperCase()} REQUIRE
                  </div>

                  {/* Giant Number of Runs Needed */}
                  <div style={{
                    fontSize: 104,
                    fontWeight: 950,
                    color: panelAccent,
                    lineHeight: 1,
                    letterSpacing: "-1px",
                    textShadow: `0 0 60px ${panelAccent}50, 0 8px 30px rgba(0,0,0,0.9)`,
                    marginBottom: 4
                  }}>
                    {need}
                  </div>

                  <div style={{ fontSize: 18, color: "#ffffff", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 28 }}>
                    RUNS TO WIN FROM <span style={{ color: panelAccent }}>{bLeft} BALLS</span> (RRR: {rrr})
                  </div>

                  {/* Smooth Animated Chase Progress Bar */}
                  <div style={{ marginBottom: 32, padding: "0 10px" }}>
                    <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${theme.borderColor}, ${panelAccent})`, borderRadius: 6, boxShadow: `0 0 12px ${panelAccent}80` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: panelSecondary, fontWeight: 800 }}>
                      <span>0 RUNS</span>
                      <span style={{ color: "#ffffff", fontWeight: 950 }}>{scoringState.score}/{scoringState.wickets} SCORED ({fmtOv(scoringState.balls, bpo)}/{match.overs} OV)</span>
                      <span style={{ color: panelAccent, fontWeight: 950 }}>TARGET: {scoringState.target}</span>
                    </div>
                  </div>

                  {/* 4-Column Stat Cards Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                    {[
                      { l: "TARGET", v: scoringState.target, c: panelAccent },
                      { l: "BALLS REMAINING", v: bLeft, c: "#ffffff" },
                      { l: "CURRENT RUN RATE", v: crr, c: "#4ade80" },
                      { l: "REQUIRED RUN RATE", v: rrr, c: parseFloat(rrr) > 12 ? "#ef4444" : parseFloat(rrr) > 9 ? "#fb923c" : "#4ade80" }
                    ].map((st, i) => (
                      <div key={i} style={{
                        background: "rgba(0,0,0,0.5)",
                        border: `1.5px solid ${theme.borderColor}25`,
                        borderRadius: 16,
                        padding: "18px 12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                      }}>
                        <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
                          {st.l}
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 950, color: st.c, lineHeight: 1 }}>
                          {st.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active Batters & Bowler Mini Bar */}
                  <div style={{
                    marginTop: 20,
                    background: "rgba(0,0,0,0.4)",
                    border: `1px solid ${theme.borderColor}20`,
                    borderRadius: 12,
                    padding: "10px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 11,
                    color: panelSecondary,
                    fontWeight: 800
                  }}>
                    <div>
                      🏏 STRIKER: <span style={{ color: "#fff", fontWeight: 950 }}>{scoringState.striker || "—"}</span> ({striker?.runs ?? 0} runs)
                    </div>
                    <div>
                      🏃 NON-STRIKER: <span style={{ color: "#fff", fontWeight: 950 }}>{scoringState.nonStriker || "—"}</span> ({nonStriker?.runs ?? 0} runs)
                    </div>
                    <div>
                      🎯 BOWLER: <span style={{ color: "#fff", fontWeight: 950 }}>{scoringState.bowler || "—"}</span> ({bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0})
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: panelSecondary, fontSize: 16, padding: 60 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>TARGET NOT YET SET</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>The first innings is currently in progress.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── PARTNERSHIP — Broadcast-Grade Duel Showcase with Exact Theme Palette ──
    if (isPartner) {
      const pRuns = (striker?.runs || 0) + (nonStriker?.runs || 0);
      const pBalls = (striker?.balls || 0) + (nonStriker?.balls || 0);
      const pSR = pBalls > 0 ? ((pRuns / pBalls) * 100).toFixed(1) : "0.0";
      const stCont = pRuns > 0 ? Math.round(((striker?.runs || 0) / pRuns) * 100) : 50;
      const totalFours = (striker?.fours || 0) + (nonStriker?.fours || 0);
      const totalSixes = (striker?.sixes || 0) + (nonStriker?.sixes || 0);

      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden", padding: "20px 0" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "fixed", inset: 0, zIndex: 0, background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${panelAccent}15, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, width: "88vw", maxWidth: 1240 }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* Top Header Banner with Theme Palette */}
            <div className="animate-slide-up" style={{
              background: `linear-gradient(185deg, rgba(4,6,20,0.99), ${panelBg}f6, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}40`,
              borderBottom: `2px solid ${panelAccent}40`,
              borderRadius: "24px 24px 0 0",
              padding: "18px 36px",
              boxShadow: panelShadow,
              backdropFilter: "blur(24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16
            }}>
              <div>
                <div style={{ fontSize: 9.5, color: panelAccentTx, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase" }}>
                  ACTIVE PARTNERSHIP · INNINGS {scoringState.inningsNo}
                </div>
                <div style={{ fontSize: 22, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                  {currentBatTeam.toUpperCase()} BATTING DUO
                </div>
              </div>

              {/* Center Partnership Hero Pill */}
              <div style={{
                background: `linear-gradient(135deg, ${panelAccent}30, rgba(0,0,0,0.8))`,
                border: `1.5px solid ${panelAccent}`,
                borderRadius: 999,
                padding: "8px 28px",
                textAlign: "center",
                boxShadow: `0 0 24px ${panelAccent}40`
              }}>
                <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
                  CURRENT PARTNERSHIP
                </div>
                <div style={{ fontSize: 28, fontWeight: 950, color: "#ffffff", lineHeight: 1 }}>
                  <span style={{ color: panelAccent }}>{pRuns}</span> <span style={{ fontSize: 14, fontWeight: 800, color: panelSecondary }}>RUNS ({pBalls}b · SR {pSR})</span>
                </div>
              </div>

              {/* Batting Team Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <TeamLogo name={currentBatTeam} isBatting={true} isBowling={false} accentColor={panelAccent} borderColor={theme.borderColor} size={64} />
              </div>
            </div>

            {/* 3-Column VS Duel Container */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 130px 1fr",
              background: `linear-gradient(185deg, rgba(2,4,16,0.98), ${panelBg}, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}30`,
              borderTop: "none",
              borderRadius: "0 0 24px 24px",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)"
            }}>
              {/* Striker Wing */}
              <div style={{ padding: "36px 36px", borderRight: `1px solid ${theme.borderColor}20`, display: "flex", flexDirection: "column", gap: 12, background: `linear-gradient(180deg, ${panelAccent}08, rgba(0,0,0,0.3))` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ position: "relative", width: 12, height: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: panelAccent, boxShadow: `0 0 8px ${panelAccent}`, display: "block", margin: "auto" }} />
                    <span className="striker-dot-ring" style={{ border: `2px solid ${panelAccent}` }} />
                  </div>
                  <span style={{ fontSize: 9.5, color: panelAccent, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
                    ON STRIKE 🏏
                  </span>
                </div>

                <div style={{ fontSize: 26, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                  {scoringState.striker || "—"}
                </div>

                <div style={{ fontSize: 72, fontWeight: 950, color: panelAccent, lineHeight: 1, textShadow: `0 0 30px ${panelAccent}40` }}>
                  {striker?.runs ?? 0}
                </div>

                <div style={{ fontSize: 13, color: panelSecondary, fontWeight: 700 }}>
                  ({striker?.balls ?? 0} balls · SR {striker?.balls ? ((striker.runs / striker.balls) * 100).toFixed(1) : "0.0"})
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <div style={{ background: "rgba(251,191,36,0.15)", border: "1.5px solid rgba(251,191,36,0.4)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#fbbf24", fontWeight: 900 }}>
                    💥 {striker?.fours ?? 0}×4s
                  </div>
                  <div style={{ background: "rgba(56,189,248,0.15)", border: "1.5px solid rgba(56,189,248,0.4)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#38bdf8", fontWeight: 900 }}>
                    🚀 {striker?.sixes ?? 0}×6s
                  </div>
                </div>

                <div style={{ fontSize: 10, color: panelSecondary, fontWeight: 800, marginTop: 6 }}>
                  Contribution: <span style={{ color: panelAccent, fontWeight: 950 }}>{stCont}%</span> of partnership
                </div>
              </div>

              {/* Center VS Meter Column */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 8px", background: "rgba(0,0,0,0.3)" }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${panelAccent}30, rgba(255,255,255,0.06))`,
                  border: `1.5px solid ${panelAccent}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 950,
                  color: "#ffffff",
                  marginBottom: 16,
                  boxShadow: `0 0 16px ${panelAccent}30`
                }}>
                  VS
                </div>

                {/* Vertical Duel Progress Bar */}
                <div style={{ width: 8, height: 140, background: "rgba(255,255,255,0.08)", borderRadius: 4, position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${stCont}%`, background: `linear-gradient(180deg, ${panelAccent}, ${theme.borderColor})`, borderRadius: 4, boxShadow: `0 0 8px ${panelAccent}` }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${100 - stCont}%`, background: `linear-gradient(180deg, #38bdf8, #0284c7)`, borderRadius: 4 }} />
                </div>

                <div style={{ marginTop: 14, fontSize: 10, color: panelSecondary, fontWeight: 900, textAlign: "center" }}>
                  {stCont}% | {100 - stCont}%
                </div>
              </div>

              {/* Non-Striker Wing */}
              <div style={{ padding: "36px 36px", borderLeft: `1px solid ${theme.borderColor}20`, textAlign: "right", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end", background: `linear-gradient(180deg, ${panelAccent}04, rgba(0,0,0,0.3))` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
                    RUNNING END 🏃
                  </span>
                </div>

                <div style={{ fontSize: 26, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                  {scoringState.nonStriker || "—"}
                </div>

                <div style={{ fontSize: 72, fontWeight: 950, color: panelAccentTx, lineHeight: 1, textShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
                  {nonStriker?.runs ?? 0}
                </div>

                <div style={{ fontSize: 13, color: panelSecondary, fontWeight: 700 }}>
                  ({nonStriker?.balls ?? 0} balls · SR {nonStriker?.balls ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(1) : "0.0"})
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <div style={{ background: "rgba(251,191,36,0.15)", border: "1.5px solid rgba(251,191,36,0.4)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#fbbf24", fontWeight: 900 }}>
                    💥 {nonStriker?.fours ?? 0}×4s
                  </div>
                  <div style={{ background: "rgba(56,189,248,0.15)", border: "1.5px solid rgba(56,189,248,0.4)", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#38bdf8", fontWeight: 900 }}>
                    🚀 {nonStriker?.sixes ?? 0}×6s
                  </div>
                </div>

                <div style={{ fontSize: 10, color: panelSecondary, fontWeight: 800, marginTop: 6 }}>
                  Contribution: <span style={{ color: panelAccentTx, fontWeight: 950 }}>{100 - stCont}%</span> of partnership
                </div>
              </div>
            </div>

            {/* Bottom Partnership Summary Footer */}
            <div style={{
              marginTop: 12,
              background: `linear-gradient(90deg, ${panelBg}, rgba(2,4,16,0.98))`,
              border: `1px solid ${panelAccent}40`,
              borderRadius: 14,
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 10.5,
              fontWeight: 800,
              color: panelSecondary
            }}>
              <div>
                💥 TOTAL BOUNDARIES: <span style={{ color: "#ffffff", fontWeight: 950 }}>{totalFours}×4s · {totalSixes}×6s</span> ({(totalFours * 4) + (totalSixes * 6)} runs)
              </div>
              <div style={{ color: panelAccent, fontWeight: 950 }}>
                PARTNERSHIP RUN RATE: {pBalls > 0 ? ((pRuns / pBalls) * (match.ballsPerOver || 6)).toFixed(2) : "0.00"}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── FULL SCORECARD — Broadcast-Grade Dual-Innings Scorecard with Exact Theme Palette ──
    if (isFullScore) {
      const inn1 = getInnState(1);
      const inn2 = getInnState(2);
      const bt1 = getInnTeam(1, "bat");
      const bt2 = getInnTeam(2, "bat");
      const bpo = match.ballsPerOver || 6;
      const tourName = (match as any).tournamentName || "FULL MATCH SCORECARD";

      const renderScorecardInnings = (innNum: 1 | 2, teamName: string, oppName: string, inn: any) => {
        if (!inn) {
          return (
            <div style={{
              background: `linear-gradient(145deg, ${panelBg}e6, ${theme.headerBg}f2)`,
              border: `1.5px solid ${theme.borderColor}25`,
              borderTop: `3px solid ${panelAccent}60`,
              borderRadius: 18,
              padding: "32px 24px",
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: panelShadow
            }}>
              <div style={{ fontSize: 42, marginBottom: 12, opacity: 0.5 }}>🏏</div>
              <div style={{ fontSize: 16, fontWeight: 950, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>
                INNINGS {innNum} · {teamName.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: panelSecondary, marginTop: 6 }}>
                Innings has not commenced yet.
              </div>
            </div>
          );
        }

        const batRuns = inn.batsmen.reduce((acc: number, b: any) => acc + (b.runs || 0), 0);
        const extras = Math.max(0, inn.score - batRuns);
        const fours = inn.batsmen.reduce((acc: number, b: any) => acc + (b.fours || 0), 0);
        const sixes = inn.batsmen.reduce((acc: number, b: any) => acc + (b.sixes || 0), 0);
        const boundaryRuns = (fours * 4) + (sixes * 6);
        const fow = inn.fallOfWickets || [];

        return (
          <div style={{
            background: `linear-gradient(145deg, ${panelBg}f0, ${theme.headerBg}fa)`,
            border: `1.5px solid ${theme.borderColor}35`,
            borderTop: `4px solid ${panelAccent}`,
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow: panelShadow,
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}>
            {/* Innings Header with Team Logo & Hero Score */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative", display: "inline-flex" }}>
                  <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px dashed ${panelAccent}50`, animation: "spin 30s linear infinite" }} />
                  <TeamLogo
                    name={teamName}
                    isBatting={scoringState.inningsNo === innNum && scoringState.inningsStarted && match.status !== "Completed"}
                    isBowling={false}
                    accentColor={panelAccent}
                    borderColor={theme.borderColor}
                    size={64}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 8.5, color: panelAccent, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
                    INNINGS {innNum} · BATTING
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                    {teamName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: panelSecondary, marginTop: 1 }}>
                    vs {oppName.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Score Box */}
              <div style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.04), ${panelBg}99)`,
                border: `1.5px solid ${panelAccent}40`,
                borderRadius: 14,
                padding: "8px 18px",
                textAlign: "right",
                boxShadow: `0 6px 20px rgba(0,0,0,0.3)`
              }}>
                <div style={{ fontSize: 34, fontWeight: 950, color: panelAccent, lineHeight: 1, textShadow: `0 0 15px ${panelAccent}30` }}>
                  {inn.score}<span style={{ color: panelAccentTx, opacity: 0.6, fontSize: 24, fontWeight: 500 }}>/</span>{inn.wickets}
                </div>
                <div style={{ fontSize: 10, color: panelSecondary, fontWeight: 800, marginTop: 3 }}>
                  {fmtOv(inn.balls, bpo)}/{match.overs} OV · RR <span style={{ color: panelAccent, fontWeight: 950 }}>{calcRR(inn as any)}</span>
                </div>
              </div>
            </div>

            {/* Batting Table */}
            <div>
              <div style={{ fontSize: 9, color: panelAccent, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <span>🏏</span> BATTING CARD
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: panelFont, fontSize: "11.5px" }}>
                <thead>
                  <tr style={{ background: `${panelAccent}15`, borderBottom: `1.5px solid ${panelAccent}35` }}>
                    {["BATSMAN", "STATUS", "R", "B", "4s", "6s", "SR"].map((h, i) => (
                      <th key={h} style={{ padding: "8px 10px", fontSize: 8.5, fontWeight: 900, textAlign: i === 0 ? "left" : "center", color: panelSecondary, letterSpacing: 1.5 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inn.batsmen.map((b: any, bi: number) => {
                    const isStriker = scoringState.inningsNo === innNum && b.name === scoringState.striker;
                    const isNonStriker = scoringState.inningsNo === innNum && b.name === scoringState.nonStriker;
                    const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={bi} style={{
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        background: isStriker ? `${panelAccent}14` : isNonStriker ? `${panelAccent}06` : "transparent"
                      }}>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {isStriker && <span style={{ width: 6, height: 6, borderRadius: "50%", background: panelAccent, display: "inline-block", flexShrink: 0, boxShadow: `0 0 6px ${panelAccent}` }} />}
                            <span style={{ fontWeight: 900, color: b.out ? "rgba(255,255,255,0.4)" : "#ffffff" }}>{b.name}</span>
                            {isStriker && <span style={{ fontSize: 11 }}>🏏</span>}
                          </div>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <span style={{
                            background: b.out ? "rgba(239,68,68,0.12)" : `${panelAccent}20`,
                            border: `1px solid ${b.out ? "rgba(239,68,68,0.3)" : `${panelAccent}40`}`,
                            borderRadius: 6,
                            padding: "2px 7px",
                            fontSize: 7.5,
                            fontWeight: 900,
                            color: b.out ? "#f87171" : panelAccent
                          }}>
                            {b.out ? "OUT" : "NOT OUT"}
                          </span>
                        </td>
                        <td style={{ padding: "8px", textAlign: "center", fontWeight: 950, fontSize: 14, color: b.runs >= 50 ? panelAccent : "#ffffff" }}>
                          {b.runs}{b.runs >= 50 ? "⭐" : ""}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center", color: panelSecondary, fontWeight: 700 }}>{b.balls}</td>
                        <td style={{ padding: "8px", textAlign: "center", color: "#fbbf24", fontWeight: 800 }}>{b.fours}</td>
                        <td style={{ padding: "8px", textAlign: "center", color: "#38bdf8", fontWeight: 800 }}>{b.sixes}</td>
                        <td style={{ padding: "8px", textAlign: "center", color: panelAccentTx, fontWeight: 800 }}>{sr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Extras & Boundaries summary */}
              <div style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
                fontSize: 9.5,
                color: panelSecondary,
                fontWeight: 700
              }}>
                <div>
                  Boundaries: <span style={{ color: "#fff", fontWeight: 900 }}>{fours}×4s</span>, <span style={{ color: "#fff", fontWeight: 900 }}>{sixes}×6s</span> ({boundaryRuns} runs)
                </div>
                <div>
                  Extras: <span style={{ color: panelAccent, fontWeight: 900 }}>{extras}</span>
                </div>
              </div>
            </div>

            {/* Bowling Table */}
            <div>
              <div style={{ fontSize: 9, color: panelAccent, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <span>🎯</span> BOWLING FIGURES
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: panelFont, fontSize: "11.5px" }}>
                <thead>
                  <tr style={{ background: `${panelAccent}15`, borderBottom: `1.5px solid ${panelAccent}35` }}>
                    {["BOWLER", "O", "R", "W", "ECON"].map((h, i) => (
                      <th key={h} style={{ padding: "8px 10px", fontSize: 8.5, fontWeight: 900, textAlign: i === 0 ? "left" : "center", color: panelSecondary, letterSpacing: 1.5 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inn.bowlers.map((bw: any, bi: number) => {
                    const isCurrentBowler = scoringState.inningsNo === innNum && bw.name === scoringState.bowler;
                    const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * bpo).toFixed(2) : "0.00";
                    return (
                      <tr key={bi} style={{
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        background: isCurrentBowler ? `${panelAccent}14` : "transparent"
                      }}>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {isCurrentBowler && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />}
                            <span style={{ fontWeight: 900, color: "#ffffff" }}>{bw.name}</span>
                            {isCurrentBowler && <span style={{ fontSize: 11 }}>⚡</span>}
                          </div>
                        </td>
                        <td style={{ padding: "8px", textAlign: "center", color: panelSecondary, fontWeight: 700 }}>{fmtOv(bw.ballsBowled, bpo)}</td>
                        <td style={{ padding: "8px", textAlign: "center", color: "#ffffff", fontWeight: 800 }}>{bw.runsConceded}</td>
                        <td style={{ padding: "8px", textAlign: "center", color: bw.wickets > 0 ? "#f87171" : "#ffffff", fontWeight: 950, fontSize: 13 }}>{bw.wickets}</td>
                        <td style={{ padding: "8px", textAlign: "center", color: parseFloat(eco) <= 6.0 ? "#4ade80" : "#fb923c", fontWeight: 800 }}>{eco}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fall of Wickets */}
            {fow.length > 0 && (
              <div>
                <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                  FALL OF WICKETS
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {fow.map((f: any, fi: number) => (
                    <span key={fi} style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: 8.5,
                      fontWeight: 800,
                      color: "#f87171"
                    }}>
                      {f.score}/{f.wickets} <span style={{ color: "#fff", opacity: 0.8 }}>({f.batsman}, {typeof f.over === "number" ? f.over.toFixed(1) : f.over} ov)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      };

      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden", padding: "20px 0" }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />

          {/* Floating Print / Save PDF button */}
          <button
            className="no-print"
            onClick={() => window.print()}
            style={{
              position: "fixed",
              top: 18,
              right: 22,
              zIndex: 9999,
              background: `linear-gradient(135deg, ${panelAccent}, ${theme.borderColor})`,
              color: "#000000",
              border: "none",
              borderRadius: 12,
              padding: "10px 22px",
              fontWeight: 950,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${panelAccent}60`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: 1.5,
              textTransform: "uppercase"
            }}
          >
            🖨️ Save PDF
          </button>

          <div style={{ position: "relative", zIndex: 1, width: "95vw", maxWidth: 1440 }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* Top Header Banner with Theme Palette */}
            <div className="animate-slide-up" style={{
              background: `linear-gradient(185deg, rgba(4,6,20,0.99), ${panelBg}f6, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}40`,
              borderBottom: `2px solid ${panelAccent}40`,
              borderRadius: "24px 24px 0 0",
              padding: "18px 32px",
              boxShadow: panelShadow,
              backdropFilter: "blur(24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14
            }}>
              {/* Match & Tournament details */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${panelAccent}25, rgba(255,255,255,0.04))`,
                  border: `1.5px solid ${panelAccent}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: `0 0 16px ${panelAccent}30`
                }}>
                  🏏
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: panelAccentTx, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.9 }}>
                    {match.matchType.toUpperCase()} · MATCH #{match.matchNo} · {match.overs} OVERS
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5, marginTop: 2, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                    {tourName.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Match Outcome / Status Pill */}
              <div style={{
                background: match.status === "Completed"
                  ? `linear-gradient(135deg, ${panelAccent}30, rgba(0,0,0,0.7))`
                  : scoringState.inningsNo === 2
                    ? "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(0,0,0,0.7))"
                    : "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(0,0,0,0.7))",
                border: `1.5px solid ${match.status === "Completed" ? panelAccent : scoringState.inningsNo === 2 ? "#ef4444" : panelAccent}`,
                borderRadius: 999,
                padding: "8px 22px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 0 20px ${match.status === "Completed" ? panelAccent : scoringState.inningsNo === 2 ? "#ef4444" : panelAccent}40`
              }}>
                {match.status === "Completed" ? (
                  <>
                    <span style={{ fontSize: 16 }}>🏆</span>
                    <span style={{ fontSize: 13, fontWeight: 950, color: panelAccentTx, letterSpacing: 1.5, textTransform: "uppercase" }}>
                      {winnerText ? winnerText.toUpperCase() : "MATCH COMPLETED"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    <span style={{ fontSize: 12, fontWeight: 950, color: "#ffffff", letterSpacing: 1.5 }}>
                      MATCH IN PROGRESS · INNINGS {scoringState.inningsNo}
                    </span>
                  </>
                )}
              </div>

              {/* Theme Name Branding */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.9 }}>
                  OFFICIAL SCORECARD
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 950, color: panelAccent, letterSpacing: 1.2, marginTop: 2, textShadow: `0 0 12px ${panelAccent}40` }}>
                  {theme.name.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Main Scorecard Dual Columns */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              background: `linear-gradient(185deg, rgba(2,4,16,0.98), ${panelBg}, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}30`,
              borderTop: "none",
              borderRadius: "0 0 24px 24px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)"
            }}>
              {renderScorecardInnings(1, bt1, bt2, inn1)}
              {renderScorecardInnings(2, bt2, bt1, inn2)}
            </div>

            {/* Man of the Match Footer if awarded */}
            {scoringState.momPlayer && (
              <div style={{
                marginTop: 12,
                background: `linear-gradient(90deg, ${panelBg}, rgba(2,4,16,0.98))`,
                border: `1px solid ${panelAccent}40`,
                borderRadius: 14,
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <div>
                    <span style={{ fontSize: 9, color: panelSecondary, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>MAN OF THE MATCH: </span>
                    <span style={{ fontSize: 15, color: panelAccent, fontWeight: 950, letterSpacing: 1 }}>{scoringState.momPlayer.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: panelSecondary, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  MATCH IMPACT PLAYER
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── SQUADS — Broadcast-Grade Playing XI Dual-Column with Exact Theme Palette ──
    if (isSquads) {
      const tourName = (match as any).tournamentName || "OFFICIAL PLAYING XI";
      return (
        <div className="fade-in" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: panelFont, overflow: "hidden", padding: "20px 0" }}>
          <style>{GLOBAL_CSS}</style><GroundBG bgUrl={theme.bgUrl} />
          <div style={{ position: "relative", zIndex: 1, width: "92vw", maxWidth: 1380 }}>
            {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

            {/* Top Header Banner with Theme Palette */}
            <div className="animate-slide-up" style={{
              background: `linear-gradient(185deg, rgba(4,6,20,0.99), ${panelBg}f6, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}40`,
              borderBottom: `2px solid ${panelAccent}40`,
              borderRadius: "24px 24px 0 0",
              padding: "18px 36px",
              boxShadow: panelShadow,
              backdropFilter: "blur(24px)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "center",
              gap: 20
            }}>
              {/* Team 1 Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative", display: "inline-flex" }}>
                  <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px dashed ${panelAccent}50`, animation: "spin 30s linear infinite" }} />
                  <TeamLogo name={match.team1Name} isBatting={team1IsBatting} isBowling={!team1IsBatting} accentColor={panelAccent} borderColor={theme.borderColor} size={70} />
                </div>
              </div>

              {/* Center Match Details */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9.5, color: panelAccentTx, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.9 }}>
                  {match.matchType.toUpperCase()} · MATCH #{match.matchNo} · {match.overs} OVERS
                </div>
                <div style={{ fontSize: 22, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5, marginTop: 2, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                  {tourName.toUpperCase()} · PLAYING XI
                </div>
                <div style={{ fontSize: 11, color: panelSecondary, fontWeight: 800, marginTop: 2 }}>
                  {match.team1Name.toUpperCase()} <span style={{ color: panelAccent }}>VS</span> {match.team2Name.toUpperCase()}
                </div>
              </div>

              {/* Team 2 Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "flex-end" }}>
                <div style={{ position: "relative", display: "inline-flex" }}>
                  <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px dashed ${panelAccent}50`, animation: "spin 30s linear infinite" }} />
                  <TeamLogo name={match.team2Name} isBatting={!team1IsBatting} isBowling={team1IsBatting} accentColor={panelAccent} borderColor={theme.borderColor} size={70} />
                </div>
              </div>
            </div>

            {/* Main Dual Playing XI Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              background: `linear-gradient(185deg, rgba(2,4,16,0.98), ${panelBg}, rgba(2,4,16,0.99))`,
              border: `1.5px solid ${theme.borderColor}30`,
              borderTop: "none",
              borderRadius: "0 0 24px 24px",
              padding: "24px 28px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)"
            }}>
              {[{ name: match.team1Name, players: match.playersTeam1 || [], isBat: team1IsBatting }, { name: match.team2Name, players: match.playersTeam2 || [], isBat: !team1IsBatting }].map((team, ti) => (
                <div key={ti} style={{
                  background: "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.45))",
                  border: `1.5px solid ${theme.borderColor}30`,
                  borderTop: `4px solid ${team.isBat ? panelAccent : "#ef4444"}`,
                  borderRadius: 18,
                  padding: "20px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                }}>
                  {/* Team Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px solid ${theme.borderColor}20`, paddingBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 8.5, color: panelSecondary, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase" }}>
                        {team.isBat ? "CURRENT INNINGS" : "OPPOSING SIDE"}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 950, color: "#ffffff", letterSpacing: 0.5 }}>
                        {team.name.toUpperCase()}
                      </div>
                    </div>
                    <span style={{
                      background: team.isBat ? `${panelAccent}25` : "rgba(239,68,68,0.2)",
                      border: `1.5px solid ${team.isBat ? panelAccent : "#ef4444"}`,
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: 10,
                      fontWeight: 950,
                      color: team.isBat ? panelAccentTx : "#f87171",
                      letterSpacing: 1,
                      textTransform: "uppercase"
                    }}>
                      {team.isBat ? "🏏 BATTING XI" : "🎯 BOWLING XI"}
                    </span>
                  </div>

                  {/* Players Scrollable List */}
                  <div className="scroll-vertical" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "420px", overflowY: "auto", paddingRight: 4 }}>
                    {team.players.length > 0 ? (
                      team.players.map((p: string, i: number) => {
                        const isSt = p === scoringState.striker && team.isBat;
                        const isNS = p === scoringState.nonStriker && team.isBat;
                        const isBwl = p === scoringState.bowler && !team.isBat;
                        return (
                          <div
                            key={i}
                            className="table-row-animated"
                            style={{
                              animationDelay: `${i * 0.03}s`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: isSt ? `${panelAccent}25` : isBwl ? "rgba(239,68,68,0.18)" : isNS ? "rgba(56,189,248,0.12)" : "rgba(0,0,0,0.3)",
                              border: `1.5px solid ${isSt ? panelAccent : isBwl ? "#ef4444" : isNS ? "#38bdf8" : "rgba(255,255,255,0.06)"}`,
                              borderRadius: 12,
                              padding: "9px 14px",
                              boxShadow: isSt || isBwl ? `0 0 14px ${isSt ? panelAccent : "#ef4444"}35` : "none"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: isSt ? `${panelAccent}35` : isBwl ? "rgba(239,68,68,0.3)" : `${theme.borderColor}25`,
                                border: `1.5px solid ${isSt ? panelAccent : isBwl ? "#ef4444" : theme.borderColor + "50"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 950,
                                color: isSt ? panelAccent : isBwl ? "#f87171" : "#ffffff",
                                flexShrink: 0
                              }}>
                                {i + 1}
                              </div>
                              <span style={{ fontSize: 14.5, fontWeight: 900, color: "#ffffff", letterSpacing: 0.3 }}>
                                {p}
                              </span>
                            </div>

                            {/* Active Match Role Badges */}
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {isSt && (
                                <span style={{
                                  background: `${panelAccent}30`,
                                  border: `1px solid ${panelAccent}`,
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: 8.5,
                                  fontWeight: 950,
                                  color: panelAccent,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}>
                                  <span className="bat-swing">🏏</span> ON STRIKE
                                </span>
                              )}
                              {isNS && (
                                <span style={{
                                  background: "rgba(56,189,248,0.2)",
                                  border: "1px solid #38bdf8",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: 8.5,
                                  fontWeight: 950,
                                  color: "#38bdf8",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}>
                                  🏃 NON-STRIKER
                                </span>
                              )}
                              {isBwl && (
                                <span style={{
                                  background: "rgba(239,68,68,0.25)",
                                  border: "1px solid #ef4444",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: 8.5,
                                  fontWeight: 950,
                                  color: "#f87171",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}>
                                  ⚡ BOWLER
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: 12, color: panelSecondary, textAlign: "center", padding: 24 }}>
                        No players registered for this team yet.
                      </div>
                    )}
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
          <div className="slide-up" style={{ width: "94vw", maxWidth: "1060px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>

            {/* The main scoreboard row */}
            <div style={{ display: "flex", alignItems: "stretch", height: "40px", background: "transparent", overflow: "hidden", borderRadius: "6px 6px 0 0", border: "1.5px solid rgba(255, 255, 255, 0.12)", borderBottom: "none" }}>

              {/* Team 1 Section */}
              <div style={{ display: "flex", alignItems: "center", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", padding: "0 14px", position: "relative", flexShrink: 0, minWidth: "115px" }}>
                <span style={{ color: "#000000", fontWeight: 950, fontSize: "12.5px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {match.team1Name}
                </span>
                {/* Left decorative splash */}
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "22px", height: "4px", background: "#0ea5e9", borderRadius: "0 3px 0 0" }} />
              </div>

              {/* Blue curved transition left */}
              <div style={{ width: "12px", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", clipPath: "polygon(0 0, 100% 0, 0 100%)", flexShrink: 0 }} />

              {/* Score / Overs Section */}
              <div style={{ background: "linear-gradient(180deg, #0a1128 0%, #001f54 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 14px", position: "relative", minWidth: "115px", flexShrink: 0, borderLeft: "1.5px solid #0a2a6b", borderRight: "1.5px solid #0a2a6b" }}>
                {/* Gold Parentheses decoration */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", lineHeight: 1 }}>
                  <span style={{ color: "#f59e0b", fontSize: "15px", fontWeight: "300", fontFamily: "serif" }}>(</span>
                  <span style={{ color: "#ffffff", fontSize: "15.5px", fontWeight: "950", letterSpacing: "-0.5px" }}>{scoringState.score} - {scoringState.wickets}</span>
                  <span style={{ color: "#cbd5e1", fontSize: "10px", fontWeight: "700", marginLeft: "2px" }}>{fmtOv(scoringState.balls, match.ballsPerOver)}</span>
                  <span style={{ color: "#f59e0b", fontSize: "15px", fontWeight: "300", fontFamily: "serif" }}>)</span>
                </div>
                {/* Group Stage banner */}
                <div style={{ background: "#0ea5e9", padding: "1px 8px", borderRadius: "2px", fontSize: "6.5px", fontWeight: "950", color: "#000000", letterSpacing: "0.8px", textTransform: "uppercase", whiteSpace: "nowrap", marginTop: "2px" }}>
                  GROUP STAGE
                </div>
              </div>

              {/* Blue curved transition right */}
              <div style={{ width: "12px", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", clipPath: "polygon(100% 0, 100% 100%, 0 100%)", flexShrink: 0 }} />

              {/* Batsmen details */}
              <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 12px", flex: 1, minWidth: "140px" }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <span style={{ color: "#0ea5e9", fontSize: "10px", fontWeight: 900 }}>•</span>
                    <span style={{ color: "#000000", fontWeight: "800", fontSize: "11px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", fontSize: "11.5px", fontWeight: "900", color: "#000000" }}>
                    <span style={{ minWidth: "18px", textAlign: "right" }}>{striker?.runs ?? 0}</span>
                    <span style={{ color: "#64748b", fontWeight: "600", fontSize: "9.5px", minWidth: "14px", textAlign: "right" }}>({striker?.balls ?? 0})</span>
                  </div>
                </div>
                {/* Non Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <span style={{ color: "transparent", fontSize: "10px" }}>•</span>
                    <span style={{ color: "#475569", fontWeight: "600", fontSize: "10px" }}>{scoringState.nonStriker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", fontSize: "10.5px", fontWeight: "700", color: "#475569" }}>
                    <span style={{ minWidth: "18px", textAlign: "right" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "#94a3b8", fontWeight: "500", fontSize: "8.5px", minWidth: "14px", textAlign: "right" }}>({nonStriker?.balls ?? 0})</span>
                  </div>
                </div>
              </div>

              {/* Target / Match Equation Section */}
              {scoringState.target !== null ? (
                <div style={{ background: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)", display: "flex", alignItems: "center", padding: "0 14px", flexShrink: 0, position: "relative" }}>
                  {/* Left curved accent boundary */}
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "#0ea5e9" }} />

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "7px", fontWeight: "950", color: "#000000", letterSpacing: "0.5px" }}>REQ. RUNS</span>
                      <span style={{ fontSize: "17px", fontWeight: "950", color: "#000000", lineHeight: 1, marginTop: "1px" }}>{need}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "7px", fontWeight: "950", color: "#000000", letterSpacing: "0.5px" }}>BALLS</span>
                      <span style={{ fontSize: "17px", fontWeight: "950", color: "#000000", lineHeight: 1, marginTop: "1px" }}>{bLeft}</span>
                    </div>
                  </div>

                  {/* Right curved accent boundary */}
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "3px", background: "#0ea5e9" }} />
                </div>
              ) : (
                /* Innings 1: Show current run rate */
                <div style={{ background: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 14px", flexShrink: 0 }}>
                  <span style={{ fontSize: "7px", fontWeight: "950", color: "#000000", letterSpacing: "0.5px" }}>RUN RATE</span>
                  <span style={{ fontSize: "17px", fontWeight: "950", color: "#000000", lineHeight: 1, marginTop: "1px" }}>{calcRR(scoringState)}</span>
                </div>
              )}

              {/* Team 2 / Bowling Team Section with Bowler info */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)", padding: "0 14px", position: "relative", flexShrink: 0, minWidth: "125px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ color: "#000000", fontWeight: 950, fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {currentBowlTeam || match.team2Name}
                  </span>
                  {/* CricScorer/Bat badge */}
                  <div style={{ width: "16px", height: "16px", background: "#475569", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "8.5px", fontWeight: "bold" }}>
                    🏏
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                  <span style={{ color: "#0284c7", fontSize: "7.5px", fontWeight: 950, letterSpacing: "0.5px" }}>BOWL:</span>
                  <span style={{ color: "#0f172a", fontSize: "9.5px", fontWeight: 800, maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {scoringState.bowler ? scoringState.bowler.split(" ").pop() : "—"}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom blue strip */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(90deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
              border: "1.5px solid rgba(255, 255, 255, 0.12)",
              borderTop: "none",
              borderRadius: "0 0 6px 6px",
              padding: "3px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.3s ease"
            }}>
              {activeNotification ? (
                <div style={{ width: "100%", textAlign: "center", color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff", fontWeight: "950", fontSize: "11px", letterSpacing: "1.5px", animation: "pulseGlow 1s ease-in-out infinite alternate" }}>
                  {activeNotification}
                </div>
              ) : (
                <>
                  {/* Bowler figures strip */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ color: "#38bdf8", fontWeight: 950, fontSize: "8px", letterSpacing: "0.8px" }}>BOWLER:</span>
                    <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "10.5px" }}>{scoringState.bowler || "—"}</span>
                    <span style={{ color: "#fbbf24", fontWeight: 950, fontSize: "11px" }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}</span>
                    <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "8.5px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                  </div>

                  {/* This Over strip */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "8px", color: theme.textSecondary, fontWeight: "900", letterSpacing: "0.8px" }}>THIS OVER:</span>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => (
                        <BallCircle key={i} val={thisOver[i]} ballColors={theme.ballColors} borderColor={theme.borderColor} size={15} />
                      ));
                    })()}
                  </div>

                  {/* Required RR or Boundaries stats */}
                  {rrr ? (
                    <div style={{ fontSize: "9.5px", fontWeight: "900", color: "#fbbf24", letterSpacing: "0.8px" }}>
                      REQ RR: {rrr}
                    </div>
                  ) : (
                    <div style={{ fontSize: "9px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "0.5px" }}>
                      4s: <span style={{ color: "#34d399" }}>{totalFours}</span> &nbsp;|&nbsp; 6s: <span style={{ color: "#fbbf24" }}>{totalSixes}</span>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, #0a1128 0%, #001f54 100%)", border: "2px solid #f59e0b", borderRadius: 14, padding: "28px 40px", textAlign: "center", boxShadow: "0 16px 32px rgba(0,0,0,0.6)" }}>
            <div style={{ color: "#f59e0b", fontWeight: 950, fontSize: "18px", letterSpacing: "2.5px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#cbd5e1", fontSize: "10px", fontWeight: "700", marginTop: "6px", letterSpacing: "2.5px" }}>
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
    const bpo = match.ballsPerOver || 6;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);

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
      : need !== null
        ? `NEED ${need} RUNS FROM ${bLeft ?? 0} BALLS`
        : match.status === "Completed"
          ? "MATCH COMPLETED"
          : `CRR ${crr} • MATCH IN PROGRESS`;

    const thisOver = scoringState.thisOver || [];
    const extrasCount = thisOver.filter(isExtraBall).length;
    const totalBallSlots = bpo + extrasCount;

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
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.35))", margin: "0 0 12px" }}>

            {/* Target Display Box (Floating Above Center) */}
            {scoringState.target !== null && (
              <div style={{
                position: "absolute",
                top: "-22px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #0a1128 0%, #0d1b3e 100%)",
                border: "1.5px solid #00cc44",
                borderRadius: "20px",
                padding: "2px 16px",
                color: "#ffffff",
                fontSize: "10.5px",
                fontWeight: "900",
                letterSpacing: "0.8px",
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.35)"
              }}>
                TARGET: <span style={{ color: "#00cc44" }}>{scoringState.target}</span> {rrr ? `• RRR: ${rrr}` : ""}
              </div>
            )}

            {/* Main horizontal white container with 3-Column Symmetrical Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              background: "#ffffff",
              height: "64px",
              borderRadius: "16px",
              border: "1.5px solid rgba(0,0,0,0.08)",
              padding: "0 14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
              gap: "12px",
              boxSizing: "border-box"
            }}>

              {/* LEFT WING: Batting Team Green Pill + Batsmen */}
              <div style={{ display: "flex", alignItems: "center", minWidth: 0, justifyContent: "flex-start", gap: "10px" }}>
                {/* Batting Team Green Pill */}
                <div style={{
                  background: "linear-gradient(135deg, #00cc44 0%, #059669 100%)",
                  borderRadius: "10px",
                  padding: "0 12px",
                  height: "46px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "105px",
                  maxWidth: "125px",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 2px 8px rgba(0,204,68,0.25)",
                  flexShrink: 0
                }}>
                  <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "12.5px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                    {currentBatTeam}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "8px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", marginTop: "1px" }}>
                    BATTING
                  </span>
                </div>

                {/* Striker & Non-Striker details */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0, gap: "3px" }}>
                  {/* Striker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "21px", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0, flex: 1 }}>
                      <span style={{ color: "#00cc44", fontWeight: "950", fontSize: "13px" }}>/</span>
                      <span style={{ color: "#0a1128", fontWeight: "950", fontSize: "13px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scoringState.striker || "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", fontWeight: "950", flexShrink: 0 }}>
                      <span style={{ color: "#0a1128", fontSize: "14px", lineHeight: 1 }}>{striker?.runs ?? 0}</span>
                      <span style={{ color: "#64748b", fontSize: "10px", fontWeight: "800" }}>({striker?.balls ?? 0})</span>
                    </div>
                  </div>
                  {/* Non-Striker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "20px", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0, flex: 1 }}>
                      <span style={{ color: "transparent", fontSize: "13px", userSelect: "none" }}>/</span>
                      <span style={{ color: "#475569", fontWeight: "750", fontSize: "12.5px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scoringState.nonStriker || "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", fontWeight: "800", flexShrink: 0 }}>
                      <span style={{ color: "#475569", fontSize: "13px", lineHeight: 1 }}>{nonStriker?.runs ?? 0}</span>
                      <span style={{ color: "#94a3b8", fontSize: "9.5px", fontWeight: "700" }}>({nonStriker?.balls ?? 0})</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: "1px", height: "36px", background: "rgba(0,0,0,0.08)", marginLeft: "4px", flexShrink: 0 }} />
              </div>

              {/* CENTER MODULE: Dead-Center Dark Indigo Capsule */}
              <div style={{
                background: "linear-gradient(135deg, #0a1128 0%, #0d1b3e 100%)",
                height: "48px",
                borderRadius: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 18px",
                width: "320px",
                flexShrink: 0,
                boxShadow: "0 4px 16px rgba(10,17,40,0.3), inset 0 1px 1px rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  {/* Left: Bowl V Bat */}
                  <span style={{ color: "#00cc44", fontWeight: "950", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {bowlTeamShort} <span style={{ opacity: 0.8, fontSize: "9px" }}>V</span> {batTeamShort}
                  </span>

                  {/* Score box */}
                  <div style={{ background: "#ffffff", borderRadius: "6px", padding: "2px 10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                    <span style={{ color: "#0a1128", fontWeight: "950", fontSize: "17px", lineHeight: 1, letterSpacing: "0.5px" }}>
                      {scoringState.score} - {scoringState.wickets}
                    </span>
                  </div>

                  {/* Right: Overs */}
                  <span style={{ color: "#00cc44", fontWeight: "950", fontSize: "11px", letterSpacing: "0.5px" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs} OV
                  </span>
                </div>

                {/* Bottom summary text in capsule */}
                <div style={{
                  fontSize: activeNotification ? "10px" : "8.5px",
                  fontWeight: "900",
                  color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                  background: activeNotification ? getNotificationStyles(activeNotification).bg : "transparent",
                  padding: activeNotification ? "2px 8px" : "0",
                  borderRadius: "4px",
                  letterSpacing: "0.5px",
                  marginTop: "2px",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  width: "100%",
                  animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
                }}>
                  {activeNotification || statusLine}
                </div>
              </div>

              {/* RIGHT WING: Bowler Details & outcomes + Bowling Team Green Pill */}
              <div style={{ display: "flex", alignItems: "center", minWidth: 0, justifyContent: "flex-end", gap: "10px" }}>
                {/* Vertical Divider */}
                <div style={{ width: "1px", height: "36px", background: "rgba(0,0,0,0.08)", marginRight: "4px", flexShrink: 0 }} />

                {/* Bowler Details & outcomes */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0, gap: "3px" }}>
                  {/* Bowler details */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#0a1128", fontWeight: "950", fontSize: "13px", height: "21px", gap: "6px" }}>
                    <span style={{ textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {scoringState.bowler || "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", flexShrink: 0 }}>
                      <span style={{ fontSize: "14px" }}>{bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}</span>
                      <span style={{ color: "#64748b", fontWeight: "800", fontSize: "10px", marginLeft: "2px" }}>
                        ({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})
                      </span>
                    </div>
                  </div>

                  {/* Outcome circles */}
                  <div style={{ display: "flex", gap: "4.5px", alignItems: "center", height: "20px" }}>
                    {Array.from({ length: totalBallSlots }).map((_, i) => {
                      const val = thisOver[i];
                      let cellBg = "rgba(10, 17, 40, 0.08)";
                      let cellColor = "#0a1128";
                      let borderStyle = "1px solid rgba(10,17,40,0.12)";
                      if (val) {
                        borderStyle = "none";
                        if (val === "4" || val === "4s") { cellBg = "#0ea5e9"; cellColor = "#ffffff"; }
                        else if (val === "6" || val === "6s") { cellBg = "#00cc44"; cellColor = "#ffffff"; }
                        else if (val === "W" || val?.startsWith("W+") || val === "Wk") { cellBg = "#f87171"; cellColor = "#ffffff"; }
                        else if (isExtraBall(val)) { cellBg = "#c084fc"; cellColor = "#ffffff"; }
                        else { cellBg = "#0a1128"; cellColor = "#ffffff"; }
                      }
                      return (
                        <div key={i} style={{
                          width: "18px",
                          height: "18px",
                          background: cellBg,
                          color: cellColor,
                          border: borderStyle,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6px" : (val && val.length > 1 ? "8px" : "10px")),
                          letterSpacing: val && val.length > 2 ? "-0.5px" : "normal",
                          fontWeight: "950",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          flexShrink: 0
                        }}>
                          {val === "." ? "" : renderOutcomeText(val, 18)}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bowling Team Green Pill */}
                <div style={{
                  background: "linear-gradient(135deg, #00cc44 0%, #059669 100%)",
                  borderRadius: "10px",
                  padding: "0 12px",
                  height: "46px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "105px",
                  maxWidth: "125px",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 2px 8px rgba(0,204,68,0.25)",
                  flexShrink: 0
                }}>
                  <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "12.5px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                    {currentBowlTeam}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "8px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", marginTop: "1px" }}>
                    BOWLING
                  </span>
                </div>
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
          <div className="slide-up" style={{ width: "92vw", maxWidth: "1050px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            <div style={{ display: "flex", alignItems: "stretch", height: "44px", background: "transparent", overflow: "hidden" }}>

              {/* Batting Team Trapezoid Name Block (Left End) */}
              <div style={{
                background: "#0c0a23",
                borderTop: "3px solid #0ea5e9",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "115px",
                clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
                flexShrink: 0
              }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11.5px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "left", width: "100%", paddingRight: "8px" }}>
                  {currentBatTeam}
                </span>
              </div>

              {/* Batsmen details section */}
              <div style={{
                background: "rgba(12, 10, 35, 0.95)",
                borderTop: "3px solid #0ea5e9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 14px",
                flex: 1,
                minWidth: "140px",
                marginLeft: "-12px",
                paddingLeft: "20px"
              }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ color: "#0ea5e9", fontSize: "10px" }}>▶</span>
                    <span style={{ color: "#ffffff", fontWeight: "800", fontSize: "11.5px" }}>{scoringState.striker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px", fontWeight: "800", color: "#ffffff" }}>
                    <span style={{ fontSize: "12.5px" }}>{striker?.runs ?? 0}</span>
                    <span style={{ color: "#94a3b8", fontSize: "9px" }}>{striker?.balls ?? 0}</span>
                  </div>
                </div>
                {/* Non-Striker */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", paddingLeft: "10px" }}>
                    <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "10.5px" }}>{scoringState.nonStriker || "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px", fontWeight: "600", color: "#94a3b8" }}>
                    <span style={{ fontSize: "11.5px" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ fontSize: "8.5px" }}>{nonStriker?.balls ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Center scoreboard display block */}
              <div style={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>

                {/* Batting Team Short Name (e.g. MUM) */}
                <div style={{ background: "#0c0a23", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", borderBottom: "2.5px solid #0ea5e9", minWidth: "48px" }}>
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11.5px", letterSpacing: "0.5px" }}>{batTeamShort}</span>
                </div>

                {/* Score Rhombus Box */}
                <div style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "85px",
                  clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)",
                  marginLeft: "-8px",
                  marginRight: "-8px",
                  zIndex: 2
                }}>
                  {/* Score format: Wickets / Runs (like 2/42) */}
                  <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "20px", letterSpacing: "-0.5px" }}>
                    {scoringState.wickets}/{scoringState.score}
                  </span>
                </div>

                {/* Overs Rhombus Box */}
                <div style={{
                  background: "rgba(12, 10, 35, 0.98)",
                  padding: "0 14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "72px",
                  clipPath: "polygon(14% 0, 100% 0, 86% 100%, 0 100%)"
                }}>
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "13px", lineHeight: 1 }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "7.5px", fontWeight: "800", letterSpacing: "0.5px", marginTop: "1px" }}>OVERS</span>
                </div>

              </div>

              {/* Bowler Details & outcomes */}
              <div style={{
                background: "rgba(12, 10, 35, 0.95)",
                borderTop: "3px solid #facc15",
                display: "flex",
                alignItems: "center",
                flex: 1.1,
                paddingLeft: "12px",
                marginLeft: "-10px",
                paddingRight: "12px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", flex: 1 }}>
                  {/* Bowler Stats */}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: "800", fontSize: "11.5px" }}>
                    <span style={{ textTransform: "uppercase" }}>{scoringState.bowler || "—"}</span>
                    <span>
                      {bowler?.wickets ?? 0}/{bowler?.runsConceded ?? 0}
                      <span style={{ color: "#94a3b8", fontWeight: "500", fontSize: "9px", marginLeft: "4px" }}>
                        {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)}
                      </span>
                    </span>
                  </div>

                  {/* Underlined outcome details */}
                  <div style={{ display: "flex", gap: "7px", height: "14px", alignItems: "center" }}>
                    {(() => {
                      const bpo = match?.ballsPerOver || 6;
                      const thisOver = scoringState.thisOver || [];
                      const extrasCount = thisOver.filter(isExtraBall).length;
                      const totalCirclesCount = bpo + extrasCount;
                      return Array.from({ length: totalCirclesCount }).map((_, i) => {
                        const val = thisOver[i];
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "10px" }}>
                            <span style={{ color: val ? "#ffffff" : "rgba(255,255,255,0.25)", fontSize: val && val.length > 3 ? "7.5px" : (val && val.length > 1 ? "9px" : "11px"), fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                              {val || "•"}
                            </span>
                            {val && <div style={{ width: "8px", height: "1.5px", background: "#ffffff", marginTop: "1px" }} />}
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
                borderTop: "3px solid #facc15",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                minWidth: "115px",
                clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
                marginLeft: "-12px",
                flexShrink: 0
              }}>
                <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11.5px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "right", width: "100%" }}>
                  {currentBowlTeam}
                </span>
                {/* Logo badge overlay */}
                <div style={{ marginLeft: "8px", width: "18px", height: "18px", background: "#475569", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "9.5px", flexShrink: 0 }}>
                  🏏
                </div>
              </div>

            </div>

            {/* Bottom summary status line bar */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(90deg, #0284c7 0%, #0369a1 100%)",
              padding: "3px 16px",
              display: "flex",
              justifyContent: "center",
              borderRadius: "0 0 7px 7px",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderTop: "none",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                fontSize: "9.5px",
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
    const bpo = match.ballsPerOver || 6;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * bpo).toFixed(2) : null;

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
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.55))" }}>
            {/* Floating TARGET pill above center if chasing */}
            {scoringState.target !== null && (
              <div style={{
                position: "absolute",
                top: "-24px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
                border: "1.5px solid #38bdf8",
                borderRadius: "4px",
                padding: "2px 14px",
                color: "#ffffff",
                fontSize: "10.5px",
                fontWeight: "900",
                letterSpacing: "0.8px",
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
              }}>
                TARGET: <span style={{ color: "#38bdf8" }}>{scoringState.target}</span> {rrr ? `• RRR: ${rrr}` : ""}
              </div>
            )}

            {/* Symmetrical 3-Column Scoreboard Bar (Left Wing | DEAD CENTER LIVE HUB | Right Wing) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "stretch",
              height: "58px",
              background: "#111827",
              overflow: "hidden",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "6px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
              boxSizing: "border-box"
            }}>

              {/* LEFT WING: Batting Team + Score + Batsmen */}
              <div style={{ display: "flex", alignItems: "stretch", minWidth: 0, height: "100%" }}>
                {/* Batting Team Badge */}
                <div style={{
                  background: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px 0 16px",
                  minWidth: "130px",
                  position: "relative",
                  flexShrink: 0
                }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5px", background: "#0ea5e9" }} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                      <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13.5px", textTransform: "uppercase" }}>{currentBatTeam}</span>
                      <span style={{ color: "#94a3b8", fontWeight: "850", fontSize: "11px" }}>{batTeamShort}</span>
                    </div>
                    <span style={{ color: "#cbd5e1", fontSize: "9.5px", fontWeight: "700", fontStyle: "italic" }}>v {bowlTeamShort}</span>
                  </div>
                </div>

                {/* Score Box & Overs */}
                <div style={{
                  background: "#111827",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  borderLeft: "1px solid rgba(255,255,255,0.1)",
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                  gap: "10px",
                  flexShrink: 0
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    padding: "5px 12px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "75px",
                    boxShadow: "0 2px 6px rgba(14,165,233,0.4)"
                  }}>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "21px", lineHeight: 1, letterSpacing: "0.5px" }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "13px", lineHeight: 1.1 }}>
                      {fmtOv(scoringState.balls, match.ballsPerOver)}
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>/{match.overs}</span>
                    </span>
                    {scoringState.target !== null && (
                      <span style={{ color: "#38bdf8", fontSize: "8.5px", fontWeight: "900", marginTop: "2px", letterSpacing: "0.5px" }}>
                        TGT: {scoringState.target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Batsmen Area */}
                <div style={{
                  background: "#0284c7",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "0 14px",
                  flex: 1,
                  minWidth: "160px"
                }}>
                  {/* Striker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "2px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0, flex: 1, marginRight: "6px" }}>
                      <span style={{ color: "#ffffff", fontSize: "11px" }}>🏏</span>
                      <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "12.5px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scoringState.striker || "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", color: "#ffffff", fontWeight: "950", fontSize: "13.5px", flexShrink: 0 }}>
                      <span>{striker?.runs ?? 0}</span>
                      <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "9.5px", fontWeight: "700" }}>({striker?.balls ?? 0})</span>
                    </div>
                  </div>
                  {/* Non-Striker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", paddingLeft: "16px", minWidth: 0, flex: 1, marginRight: "6px" }}>
                      <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: "750", fontSize: "12px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scoringState.nonStriker || "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: "12.5px", flexShrink: 0 }}>
                      <span>{nonStriker?.runs ?? 0}</span>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px", fontWeight: "600" }}>({nonStriker?.balls ?? 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER MODULE: DEAD CENTER LIVE STATUS & EVENT HUB */}
              <div style={{
                background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(180deg, #1e3a8a 0%, #172554 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 18px",
                minWidth: "150px",
                borderLeft: "1.5px solid rgba(255,255,255,0.18)",
                borderRight: "1.5px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(30,58,138,0.4)",
                flexShrink: 0,
                transition: "all 0.3s ease",
                zIndex: 2
              }}>
                {activeNotification ? (
                  <span style={{
                    color: getNotificationStyles(activeNotification).textColor,
                    fontWeight: "950",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    textAlign: "center",
                    textTransform: "uppercase",
                    animation: "pulseGlow 1s ease-in-out infinite alternate"
                  }}>
                    {activeNotification}
                  </span>
                ) : scoringState.customInputText ? (
                  <span style={{ color: "#38bdf8", fontWeight: "950", fontSize: "11px", letterSpacing: "0.8px", textTransform: "uppercase", textAlign: "center" }}>
                    {scoringState.customInputText.toUpperCase()}
                  </span>
                ) : need !== null ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <span className="live-dot" style={{ width: "6.5px", height: "6.5px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                      <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "11px", letterSpacing: "1px" }}>
                        NEED {need}
                      </span>
                    </div>
                    <span style={{ color: "#93c5fd", fontSize: "9px", fontWeight: "850", letterSpacing: "0.5px" }}>
                      FROM {bLeft ?? 0}b {rrr ? `(RRR ${rrr})` : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <span className="live-dot" style={{ width: "6.5px", height: "6.5px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                      <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "11.5px", letterSpacing: "1.5px" }}>
                        LIVE
                      </span>
                    </div>
                    <span style={{ color: "#38bdf8", fontSize: "9px", fontWeight: "900", letterSpacing: "0.6px" }}>
                      CRR {calcRR(scoringState)}
                    </span>
                  </>
                )}
              </div>

              {/* RIGHT WING: Bowler Details & Outcomes + Bowling Team */}
              <div style={{ display: "flex", alignItems: "stretch", minWidth: 0, height: "100%", justifyContent: "flex-end" }}>
                {/* Bowler Details & outcomes */}
                <div style={{ background: "#1f2937", display: "flex", alignItems: "center", flex: 1, padding: "0 14px", minWidth: "180px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#ffffff", fontWeight: "900", fontSize: "12.5px" }}>
                      <span style={{ textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scoringState.bowler || "—"}
                      </span>
                      <span style={{ flexShrink: 0, marginLeft: "6px" }}>
                        {bowler?.wickets ?? 0}/{bowler?.runsConceded ?? 0}
                        <span style={{ color: "#94a3b8", fontWeight: "700", fontSize: "9.5px", marginLeft: "4px" }}>
                          ({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})
                        </span>
                      </span>
                    </div>
                    {/* Outcome list */}
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      {(() => {
                        const bpo = match?.ballsPerOver || 6;
                        const thisOver = scoringState.thisOver || [];
                        const extrasCount = thisOver.filter(isExtraBall).length;
                        const totalCirclesCount = bpo + extrasCount;
                        return Array.from({ length: totalCirclesCount }).map((_, i) => {
                          const val = thisOver[i];
                          let cellBg = val ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)";
                          let cellColor = "#ffffff";
                          if (val === "4" || val === "4s" || val === "6" || val === "6s") cellBg = "#0284c7";
                          else if (val === "W" || val?.startsWith("W+") || val === "Wk") cellBg = "#dc2626";
                          else if (isExtraBall(val)) cellBg = "#7c3aed";

                          return (
                            <div key={i} style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "18px",
                              height: "18px",
                              background: cellBg,
                              border: val ? "none" : "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "3px",
                              fontSize: val && val.length > 2 ? "7px" : "9.5px",
                              fontWeight: "950",
                              lineHeight: 1
                            }}>
                              <span style={{ color: val ? cellColor : "transparent" }}>
                                {val === "." ? "" : renderOutcomeText(val, 18)}
                              </span>
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
                  padding: "0 16px 0 14px",
                  minWidth: "130px",
                  position: "relative",
                  justifyContent: "flex-end",
                  borderLeft: "1px solid rgba(255,255,255,0.1)",
                  flexShrink: 0
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "22px", height: "22px", background: "#334155", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: "11px", flexShrink: 0 }}>
                      🏏
                    </div>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13.5px", textTransform: "uppercase" }}>
                      {currentBowlTeam}
                    </span>
                  </div>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "5px", background: "#facc15" }} />
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
                minWidth: "260px",
                flexShrink: 0
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%", gap: "8px" }}>
                  {/* Left: bowlTeamShort v batTeamShort */}
                  <span style={{ color: "#080721", fontWeight: "900", fontSize: "13px", justifySelf: "start", textAlign: "left", whiteSpace: "nowrap" }}>
                    {bowlTeamShort} <span style={{ fontWeight: "500", fontSize: "11px", color: "#64748b" }}>v</span> {batTeamShort}
                  </span>

                  {/* Hot Pink score box */}
                  <div style={{ background: "#ec4899", borderRadius: "8px", padding: "4px 14px", display: "flex", alignItems: "center", justifyContent: "center", justifySelf: "center" }}>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "20px", lineHeight: 1 }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                  </div>

                  {/* Right: Overs */}
                  <span style={{ color: "#080721", fontWeight: "900", fontSize: "13px", justifySelf: "end", textAlign: "right", whiteSpace: "nowrap" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}({match.overs})
                  </span>
                </div>

                {/* Bottom line: CRR & RRR */}
                <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "2px", fontSize: "9px", fontWeight: "900", color: "#080721", width: "100%" }}>
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

  // ── BBL BLACK / 7th Theme: Modern Stadium Broadcast Overlay (Yellow Wings + Dark Purple + Hot Pink Score) ──
  if (themeSlug === "bbl-black") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const bpo = match.ballsPerOver || 6;
    const rrr = bLeft !== null && bLeft > 0 && need !== null ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);

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
      : need !== null && bLeft !== null
        ? `NEED ${need} RUNS OFF ${bLeft} BALLS • REQ RR: ${rrr || "—"}`
        : match.status === "Completed"
          ? "MATCH COMPLETED"
          : "BBL LIVE MATCH";

    const thisOver = scoringState.thisOver || [];

    const getBallStyle = (val?: string): { bg: string; color: string; border?: string; boxShadow?: string } => {
      if (!val) return { bg: "rgba(255,255,255,0.05)", color: "transparent", border: "1px dashed rgba(255,255,255,0.2)" };
      if (val === "W" || val.startsWith("W+")) return { bg: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)", color: "#ffffff", border: "1.5px solid #ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.6)" };
      if (val === "6") return { bg: "linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)", color: "#ffffff", border: "1.5px solid #a855f7", boxShadow: "0 0 8px rgba(168,85,247,0.6)" };
      if (val === "4") return { bg: "linear-gradient(135deg, #fde047 0%, #facc15 100%)", color: "#000000", border: "1.5px solid #facc15", boxShadow: "0 0 6px rgba(250,204,21,0.5)" };
      if (isExtraBall(val)) return { bg: "#7c3aed", color: "#ffffff", border: "1px solid #a78bfa" };
      return { bg: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" };
    };

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 24px" : "0 0 16px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#facc15", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>BBL Black Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "92vw", maxWidth: "1040px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.75))" }}>

            {/* ── FLOATING TARGET / INNINGS EQUATION PILL ── */}
            <div style={{
              position: "absolute",
              top: "-15px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10
            }}>
              {scoringState.target !== null ? (
                <div style={{
                  background: "linear-gradient(90deg, #7c3aed 0%, #9333ea 50%, #ec4899 100%)",
                  borderRadius: "12px",
                  padding: "2px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.5)",
                  color: "#ffffff",
                  whiteSpace: "nowrap"
                }}>
                  <span style={{ fontSize: "9px", fontWeight: "950", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    TARGET: <strong style={{ fontSize: "10.5px", color: "#ffffff" }}>{scoringState.target}</strong>
                  </span>
                  {need !== null && bLeft !== null && (
                    <>
                      <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#ffffff" }} />
                      <span style={{ fontSize: "9px", fontWeight: "900" }}>NEED {need} ({bLeft}b)</span>
                      {rrr && (
                        <span style={{ background: "rgba(0,0,0,0.4)", borderRadius: "6px", padding: "1px 5px", fontSize: "8px", fontWeight: "950" }}>
                          RRR: {rrr}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div style={{
                  background: "linear-gradient(90deg, #7c3aed 0%, #9333ea 100%)",
                  borderRadius: "12px",
                  padding: "2px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 3px 12px rgba(124,58,237,0.45)",
                  color: "#ffffff",
                  whiteSpace: "nowrap"
                }}>
                  <span style={{ fontSize: "9px", fontWeight: "950", letterSpacing: "0.8px" }}>1st INNINGS</span>
                  <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.7)" }} />
                  <span style={{ fontSize: "9px", fontWeight: "900", letterSpacing: "0.5px" }}>CRR: {crr}</span>
                </div>
              )}
            </div>

            {/* ── MAIN SCOREBOARD FRAME ── */}
            <div style={{
              display: "flex",
              alignItems: "stretch",
              height: "46px",
              background: "linear-gradient(135deg, #09051c 0%, #150c38 50%, #09051c 100%)",
              backdropFilter: "blur(14px)",
              border: "1.5px solid rgba(124, 58, 237, 0.6)",
              borderRadius: "14px 14px 0 0",
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
              position: "relative"
            }}>
              {/* Top Accent Gold Laser */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #facc15 0%, #7c3aed 50%, #facc15 100%)",
                boxShadow: "0 0 8px #facc15"
              }} />

              {/* ── LEFT BATTING TEAM BEVELED WING ── */}
              <div style={{
                background: "linear-gradient(135deg, #fde047 0%, #facc15 50%, #eab308 100%)",
                padding: "0 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minWidth: "110px",
                clipPath: "polygon(0 0, 86% 0, 100% 100%, 0 100%)",
                position: "relative",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.25)",
                flexShrink: 0
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#000000" }} />
                  <span style={{ color: "#000000", fontWeight: "950", fontSize: "12.5px", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    {batTeamShort}
                  </span>
                </div>
                <span style={{ color: "rgba(0,0,0,0.75)", fontSize: "7px", fontWeight: "900", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                  BATTING
                </span>
              </div>

              {/* ── BATSMEN DETAILS SECTION ── */}
              <div style={{
                display: "flex",
                flex: 1.1,
                padding: "0 8px",
                alignItems: "center",
                gap: "6px",
                minWidth: "160px"
              }}>
                {/* Striker Active Card */}
                <div style={{
                  background: "rgba(250, 204, 21, 0.12)",
                  border: "1px solid rgba(250, 204, 21, 0.35)",
                  borderRadius: "10px",
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1.1,
                  minWidth: 0,
                  boxShadow: "0 0 8px rgba(250, 204, 21, 0.15)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0, overflow: "hidden" }}>
                    <span style={{ color: "#facc15", fontSize: "9px" }}>⚡</span>
                    <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {scoringState.striker || "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2.5px", marginLeft: "4px", flexShrink: 0 }}>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13px" }}>
                      {striker?.runs ?? 0}
                    </span>
                    <span style={{ color: "#fef08a", fontSize: "8.5px", fontWeight: "800", background: "rgba(250,204,21,0.2)", padding: "1px 3px", borderRadius: "3px" }}>
                      {striker?.balls ?? 0}b
                    </span>
                  </div>
                </div>

                {/* Non-Striker Card */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 0.9,
                  minWidth: 0
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: 0, overflow: "hidden" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px" }}>🏃</span>
                    <span style={{ color: "#cbd5e1", fontWeight: "800", fontSize: "10.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {scoringState.nonStriker || "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2.5px", marginLeft: "4px", flexShrink: 0 }}>
                    <span style={{ color: "#e2e8f0", fontWeight: "850", fontSize: "11.5px" }}>
                      {nonStriker?.runs ?? 0}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "8px" }}>
                      ({nonStriker?.balls ?? 0})
                    </span>
                  </div>
                </div>
              </div>

              {/* ── CENTER BROADCAST SCORE & MATCHUP HUB ── */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "2px 14px",
                minWidth: "150px",
                background: "linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(147, 51, 234, 0.25) 100%)",
                borderLeft: "1px solid rgba(124, 58, 237, 0.4)",
                borderRight: "1px solid rgba(124, 58, 237, 0.4)",
                position: "relative",
                flexShrink: 0,
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.5)"
              }}>
                <div style={{ fontSize: "8.5px", fontWeight: "900", color: "#e0e7ff", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "1px" }}>
                  {bowlTeamShort} v {batTeamShort}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {/* Hot Pink score capsule */}
                  <div style={{
                    background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
                    borderRadius: "6px",
                    padding: "1.5px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 0 8px rgba(236,72,153,0.4)"
                  }}>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "16px", lineHeight: 1, letterSpacing: "-0.5px" }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                    <span style={{ background: "#7c3aed", borderRadius: "3px", padding: "0 3px", fontSize: "7.5px", fontWeight: "950", color: "#ffffff" }}>P</span>
                  </div>
                  {/* Overs */}
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "10.5px", whiteSpace: "nowrap" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}({match.overs})
                  </span>
                </div>
              </div>

              {/* ── BOWLER & LIVE OVER BALLS HUD ── */}
              <div style={{
                display: "flex",
                flex: 1.1,
                padding: "0 8px",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
                minWidth: "170px"
              }}>
                {/* Bowler Details Card */}
                <div style={{
                  background: "rgba(124, 58, 237, 0.15)",
                  border: "1px solid rgba(124, 58, 237, 0.35)",
                  borderRadius: "10px",
                  padding: "3px 8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: "95px",
                  boxShadow: "0 0 8px rgba(124, 58, 237, 0.15)"
                }}>
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {scoringState.bowler || "—"}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{ color: "#facc15", fontWeight: "950", fontSize: "11.5px" }}>
                      {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "8.5px", fontWeight: "700" }}>
                      ({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})
                    </span>
                  </div>
                </div>

                {/* Over Balls Dynamic HUD */}
                <div style={{ display: "flex", gap: "3.5px", alignItems: "center" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const val = thisOver[i];
                      const bs = getBallStyle(val);
                      return (
                        <div key={i} style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: bs.bg,
                          border: bs.border,
                          color: bs.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: val && val.length > 1 ? "7.5px" : "9px",
                          fontWeight: "950",
                          boxShadow: bs.boxShadow || "none"
                        }}>
                          {val === "." ? "•" : (val || "•")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── RIGHT BOWLING TEAM BEVELED WING ── */}
              <div style={{
                background: "linear-gradient(135deg, #fde047 0%, #facc15 50%, #eab308 100%)",
                padding: "0 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minWidth: "110px",
                clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
                position: "relative",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.25)",
                flexShrink: 0
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "#000000", fontWeight: "950", fontSize: "12.5px", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    {bowlTeamShort}
                  </span>
                  <span style={{ fontSize: "10px", opacity: 0.9 }}>🏆</span>
                </div>
                <span style={{ color: "rgba(0,0,0,0.75)", fontSize: "7px", fontWeight: "900", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                  BOWLING
                </span>
              </div>
            </div>

            {/* ── LOWER DYNAMIC STATUS & NOTIFICATION MARQUEE ── */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(90deg, #7c3aed 0%, #9333ea 50%, #7c3aed 100%)",
              padding: "2.5px 18px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "0 0 14px 14px",
              border: "1.5px solid rgba(124, 58, 237, 0.6)",
              borderTop: "none",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.45), 0 0 12px rgba(124,58,237,0.3)",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                fontSize: "9px",
                fontWeight: "950",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>
                {activeNotification || statusLine}
              </span>
            </div>

          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#0f0a2e", border: "2px solid #facc15", borderRadius: 18, padding: "28px 44px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ color: "#facc15", fontWeight: 950, fontSize: "20px", letterSpacing: "3px" }}>
              🏏 {match.team1Name.toUpperCase()} vs {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#ffffff", fontSize: "10.5px", fontWeight: "700", marginTop: "8px", letterSpacing: "3px" }}>
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
    const bpo = match.ballsPerOver || 6;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);

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
          : `CRR ${crr} • MATCH IN PROGRESS`;

    const thisOver = scoringState.thisOver || [];
    const extrasCount = thisOver.filter(isExtraBall).length;
    const totalBallSlots = bpo + extrasCount;

    const getBallStyle = (val?: string): { bg: string; color: string; border?: string; shadow?: string } => {
      if (!val) return { bg: "transparent", color: "transparent", border: "1.5px dashed rgba(0,0,0,0.18)" };
      if (val === "W" || val?.startsWith("W+") || val === "Wk") return { bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#ffffff", shadow: "0 2px 6px rgba(220,38,38,0.4)" };
      if (val === "6" || val === "6s" || val === "4" || val === "4s") return { bg: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)", color: "#ffffff", shadow: "0 2px 6px rgba(21,128,61,0.4)" };
      if (val?.startsWith("Wd") || val?.startsWith("Nb") || val?.startsWith("B") || val?.startsWith("Lb")) return { bg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", color: "#ffffff", shadow: "0 2px 6px rgba(124,58,237,0.35)" };
      return { bg: "#ffffff", color: "#1e1b4b", border: "1.5px solid rgba(30,27,75,0.22)", shadow: "0 1px 4px rgba(0,0,0,0.06)" };
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
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1320px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.28))" }}>

            {/* Floating TARGET pill above scoreboard */}
            {scoringState.target !== null && (
              <div style={{
                position: "absolute",
                top: "-25px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #110b38 0%, #1a1053 100%)",
                border: "1.5px solid #a78bfa",
                borderRadius: "20px",
                padding: "3px 18px",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "900",
                letterSpacing: "1.2px",
                zIndex: 10,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 14px rgba(17,11,56,0.4), 0 0 10px rgba(167,139,250,0.3)"
              }}>
                <span>🎯 TARGET <strong style={{ color: "#ffffff", fontSize: "12px", marginLeft: "3px" }}>{scoringState.target}</strong></span>
                {rrr !== null && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
                    <span style={{ color: "#c4b5fd", fontSize: "10.5px", fontWeight: "800" }}>REQ RR: {rrr}</span>
                  </>
                )}
              </div>
            )}

            {/* Main scoreboard row (Porcelain White Rounded Broadcast Capsule) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              height: "64px",
              background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
              borderRadius: "9999px",
              padding: "0 22px",
              border: "1.5px solid rgba(226, 232, 240, 0.95)",
              boxShadow: "0 10px 30px -4px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)",
              gap: "12px",
              boxSizing: "border-box"
            }}>

              {/* LEFT COLUMN: Batsmen names + stats */}
              <div style={{ display: "flex", alignItems: "center", minWidth: 0, justifyContent: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", maxWidth: "290px", gap: "3px" }}>
                  {/* Striker */}
                  <div style={{ display: "flex", alignItems: "center", height: "23px", gap: "7px" }}>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "7.5px",
                      fontWeight: "900",
                      flexShrink: 0,
                      boxShadow: "0 0 8px rgba(220, 38, 38, 0.55)"
                    }}>
                      ▶
                    </div>
                    <span style={{
                      color: "#1e1b4b",
                      fontWeight: "950",
                      fontSize: "13.5px",
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}>
                      {scoringState.striker || "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                      <span style={{ color: "#1e1b4b", fontWeight: "950", fontSize: "15px", lineHeight: 1 }}>
                        {striker?.runs ?? 0}
                      </span>
                      <span style={{ color: "rgba(30,27,75,0.6)", fontSize: "11px", fontWeight: "800" }}>
                        ({striker?.balls ?? 0})
                      </span>
                    </div>
                  </div>

                  {/* Non-Striker */}
                  <div style={{ display: "flex", alignItems: "center", height: "21px", gap: "7px" }}>
                    <div style={{ width: "16px", flexShrink: 0 }} />
                    <span style={{
                      color: "rgba(30,27,75,0.72)",
                      fontWeight: "750",
                      fontSize: "13px",
                      letterSpacing: "0.2px",
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}>
                      {scoringState.nonStriker || "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                      <span style={{ color: "rgba(30,27,75,0.8)", fontWeight: "850", fontSize: "14px", lineHeight: 1 }}>
                        {nonStriker?.runs ?? 0}
                      </span>
                      <span style={{ color: "rgba(30,27,75,0.45)", fontSize: "10px", fontWeight: "700" }}>
                        ({nonStriker?.balls ?? 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.12), transparent)", marginLeft: "14px", flexShrink: 0 }} />
              </div>

              {/* CENTER COLUMN: Team matchup + score + status (Indigo/Red Capsule) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  background: "linear-gradient(135deg, #110b38 0%, #190f4a 100%)",
                  height: "52px",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "stretch",
                  overflow: "hidden",
                  width: "360px",
                  boxShadow: "0 4px 16px rgba(17,11,56,0.35), inset 0 1px 1px rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  flexShrink: 0
                }}>
                  {/* Left section of the capsule */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    {/* Top Red row */}
                    <div style={{
                      background: "linear-gradient(90deg, #dc2626 0%, #d92d20 50%, #b91c1c 100%)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 14px",
                      height: "27px",
                      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.15)"
                    }}>
                      <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "11.5px", letterSpacing: "1px", textTransform: "uppercase", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                        {bowlTeamShort} <span style={{ opacity: 0.8, fontSize: "9.5px", fontWeight: 800 }}>V</span> {batTeamShort}
                      </span>
                      <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "15px", letterSpacing: "0.5px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                        {scoringState.score} - {scoringState.wickets}
                      </span>
                    </div>
                    {/* Bottom Indigo row */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 10px",
                      height: "25px",
                      background: activeNotification ? getNotificationStyles(activeNotification).bg : "transparent",
                      transition: "all 0.3s ease"
                    }}>
                      <span style={{
                        color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                        fontWeight: "900",
                        fontSize: activeNotification ? "11px" : "10px",
                        letterSpacing: "0.8px",
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
                  {/* Right section of the capsule (Overs Chamber) */}
                  <div style={{
                    background: "#110b38",
                    color: "#ffffff",
                    width: "74px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderLeft: "1.5px solid rgba(255,255,255,0.15)",
                    flexShrink: 0,
                    padding: "0 6px"
                  }}>
                    <span style={{ fontSize: "8px", fontWeight: "900", letterSpacing: "1px", color: "#a78bfa", textTransform: "uppercase", lineHeight: 1, marginBottom: "2px" }}>
                      OVERS
                    </span>
                    <div style={{ fontSize: "13.5px", fontWeight: "950", lineHeight: 1, color: "#ffffff" }}>
                      {fmtOv(scoringState.balls, match.ballsPerOver)}
                      <span style={{ fontSize: "9.5px", opacity: 0.6, fontWeight: 700 }}>/{match.overs}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Bowler + Balls + Logo */}
              <div style={{ display: "flex", alignItems: "center", minWidth: 0, justifyContent: "flex-end", gap: "10px" }}>
                {/* Vertical Divider */}
                <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.12), transparent)", marginRight: "4px", flexShrink: 0 }} />

                {/* Bowler + Balls Box */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0, gap: "3px" }}>
                  {/* Bowler name + stats */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "23px", gap: "6px" }}>
                    <span style={{
                      color: "#1e1b4b",
                      fontWeight: "950",
                      fontSize: "13.5px",
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}>
                      {scoringState.bowler || "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                      <span style={{ color: "#1e1b4b", fontWeight: "950", fontSize: "14.5px" }}>
                        {bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "rgba(30,27,75,0.6)" }}>
                        ({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})
                      </span>
                    </div>
                  </div>

                  {/* Ball circles */}
                  <div style={{ display: "flex", gap: "4px", alignItems: "center", height: "21px", justifyContent: "flex-start" }}>
                    {Array.from({ length: totalBallSlots }).map((_, i) => {
                      const val = thisOver[i];
                      const bs = getBallStyle(val);
                      return (
                        <div key={i} style={{
                          width: "20px",
                          height: "20px",
                          background: bs.bg,
                          color: bs.color,
                          border: bs.border || "none",
                          boxShadow: bs.shadow || "none",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6.5px" : (val && val.length > 1 ? "8px" : "10px")),
                          letterSpacing: val && val.length > 2 ? "-0.5px" : "normal",
                          fontWeight: "950",
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
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "950",
                  letterSpacing: "0.6px",
                  gap: "4px",
                  flexShrink: 0,
                  height: "26px",
                  boxShadow: "0 2px 8px rgba(21,128,61,0.3)"
                }}>
                  <span>🏏</span>
                  <span style={{ fontSize: "9px" }}>CricScorer</span>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Match not started */
          <div className="scale-in" style={{
            position: "relative",
            zIndex: 1,
            background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
            border: "2px solid #dc2626",
            borderRadius: "9999px",
            padding: "18px 52px",
            textAlign: "center",
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)"
          }}>
            <div style={{ color: "#1e1b4b", fontWeight: 950, fontSize: "19px", letterSpacing: "2px" }}>
              🏏 {match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#dc2626", fontSize: "11.5px", fontWeight: "900", marginTop: "4px", letterSpacing: "2.5px" }}>
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
    const bpo = match.ballsPerOver || 6;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);
    const bowlerEcon = bowler && bowler.ballsBowled > 0 ? ((bowler.runsConceded / bowler.ballsBowled) * bpo).toFixed(2) : "0.00";

    const getShortNameLocal = (name: string) => {
      if (!name) return "TEAM";
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);
    const thisOver = scoringState.thisOver || [];
    const extrasCount = thisOver.filter(isExtraBall).length;
    const totalBallSlots = bpo + extrasCount;

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#f97316", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>T20 Emerging Asia Cup Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1300px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.8)) drop-shadow(0 0 18px rgba(249,115,22,0.15))" }}>

            {/* ── TOP TICKER RIBBON ── */}
            <div style={{
              background: "linear-gradient(90deg, #0c0f1d 0%, #1a1020 30%, #200f0a 60%, #0c0f1d 100%)",
              borderTop: "2px solid #f97316",
              borderLeft: "2px solid #f9731660",
              borderRight: "2px solid #f9731660",
              borderBottom: "1px solid rgba(249,115,22,0.2)",
              borderRadius: "14px 14px 0 0",
              padding: "4px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px"
            }}>
              {/* Left: Tournament Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                <div style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "8.5px",
                  letterSpacing: "0.8px",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  boxShadow: "0 2px 6px rgba(249,115,22,0.4)"
                }}>
                  🏏 T20 EAC 2024
                </div>
                <div style={{
                  background: "rgba(14,165,233,0.12)",
                  border: "1px solid rgba(14,165,233,0.35)",
                  padding: "1px 7px",
                  borderRadius: "4px",
                  fontSize: "8.5px",
                  fontWeight: 800,
                  color: "#22d3ee",
                  letterSpacing: "0.5px"
                }}>
                  INN {scoringState.inningsNo}
                </div>
              </div>

              {/* Center: Match Situation */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "10px", flex: 1, overflow: "hidden", whiteSpace: "nowrap",
                fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px"
              }}>
                {scoringState.customInputText ? (
                  <span style={{ color: "#f97316", textTransform: "uppercase" }}>{scoringState.customInputText}</span>
                ) : need !== null && bLeft !== null ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#f97316" }}>TARGET: <strong style={{ color: "#fff", fontSize: "10.5px" }}>{scoringState.target}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
                    <span style={{ color: "#fff" }}>NEED <strong style={{ color: "#f97316", fontSize: "11px" }}>{need}</strong> IN <strong style={{ color: "#fca5a5" }}>{bLeft}</strong> BALLS</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
                    <span style={{ color: "#fca5a5" }}>RRR: <strong>{rrr}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
                    <span style={{ color: "#94a3b8" }}>CRR: <strong>{crr}</strong></span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#fff" }}>1ST INNINGS</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                    <span style={{ color: "#22d3ee" }}>CRR: <strong style={{ color: "#fff" }}>{crr}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                    <span style={{ color: "#94a3b8" }}>OVERS: {match.overs}</span>
                  </div>
                )}
              </div>

              {/* Right: Match info */}
              <div style={{ fontSize: "8px", fontWeight: 800, color: "#64748b", letterSpacing: "0.8px", flexShrink: 0, display: "flex", gap: "5px" }}>
                <span style={{ color: "#f97316" }}>{match.matchType || "T20"}</span>
                <span>#{match.matchNo || 1}</span>
              </div>
            </div>

            {/* ── MAIN SCOREBOARD DECK ── */}
            <div style={{
              display: "flex",
              alignItems: "stretch",
              minHeight: "52px",
              background: "linear-gradient(180deg, rgba(8,12,28,0.98) 0%, rgba(12,8,22,0.98) 100%)",
              border: "1.5px solid rgba(14,165,233,0.35)",
              borderTop: "none",
              borderRadius: activeNotification ? "0" : "0 0 14px 14px",
              overflow: "hidden",
              backdropFilter: "blur(16px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)"
            }}>

              {/* ── BATTING TEAM CAPSULE (left) ── */}
              <div style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 16px 0 14px",
                minWidth: "98px",
                clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "8px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 950, color: "#fff", letterSpacing: "0.5px", lineHeight: 1.1, textTransform: "uppercase" }}>
                    {batTeamShort}
                  </span>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "2px",
                    background: "rgba(0,0,0,0.25)", color: "#bae6fd",
                    padding: "1px 4px", borderRadius: "3px", fontSize: "7px", fontWeight: 900, marginTop: "2px"
                  }}>
                    <span className="bat-swing" style={{ fontSize: "7px" }}>🏏</span>
                    <span>BAT</span>
                  </div>
                </div>
              </div>

              {/* ── BATSMEN SECTION ── */}
              <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 10px", gap: "10px", marginLeft: "-5px", minWidth: 0 }}>
                {/* Striker */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    background: "rgba(14,165,233,0.15)", border: "1.5px solid #0ea5e9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "8px", flexShrink: 0, boxShadow: "0 0 6px rgba(14,165,233,0.3)"
                  }}>
                    <span className="bat-swing">🏏</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                    <span style={{
                      color: "#22d3ee", fontWeight: 900, fontSize: "10.5px",
                      textTransform: "uppercase", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"
                    }}>
                      {scoringState.striker || "Striker"}*
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                      <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "15px" }}>{striker?.runs ?? 0}</span>
                      <span style={{ color: "#94a3b8", fontSize: "9px", fontWeight: 800 }}>({striker?.balls ?? 0})</span>
                      <span style={{ color: "#475569", fontSize: "8px", fontWeight: 700, marginLeft: "2px" }}>
                        4s:{striker?.fours ?? 0} 6s:{striker?.sixes ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: "1px", height: "26px", background: "linear-gradient(180deg, transparent, rgba(14,165,233,0.3), transparent)", flexShrink: 0 }} />

                {/* Non-Striker */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                  <span style={{
                    color: "#94a3b8", fontWeight: 700, fontSize: "10px",
                    textTransform: "uppercase", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"
                  }}>
                    {scoringState.nonStriker || "Non-Striker"}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{ color: "#cbd5e1", fontWeight: 800, fontSize: "12px" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "#64748b", fontSize: "8.5px", fontWeight: 700 }}>({nonStriker?.balls ?? 0})</span>
                  </div>
                </div>
              </div>

              {/* ── CENTER SCORE NUCLEUS ── */}
              <div style={{
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                padding: "0 18px", minWidth: "175px", flexShrink: 0,
                borderLeft: "1.5px solid rgba(249,115,22,0.3)",
                borderRight: "1.5px solid rgba(249,115,22,0.3)",
                background: activeNotification
                  ? getNotificationStyles(activeNotification).bg
                  : "linear-gradient(180deg, rgba(249,115,22,0.08) 0%, transparent 100%)",
                boxShadow: activeNotification
                  ? "0 0 18px rgba(249,115,22,0.5)"
                  : "inset 0 0 20px rgba(249,115,22,0.06)",
                transition: "all 0.3s ease"
              }}>
                {activeNotification ? (
                  <span style={{
                    color: getNotificationStyles(activeNotification).textColor,
                    fontSize: "11px",
                    fontWeight: 950,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    textAlign: "center",
                    animation: "pulseGlow 1s ease-in-out infinite alternate",
                    lineHeight: 1.25,
                    padding: "0 4px"
                  }}>
                    {activeNotification}
                  </span>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1 }}>
                      <span style={{ color: "#f97316", fontWeight: 950, fontSize: "24px", letterSpacing: "-0.5px", textShadow: "0 0 12px rgba(249,115,22,0.4)" }}>
                        {scoringState.score}
                      </span>
                      <span style={{ color: "#fca5a5", fontWeight: 900, fontSize: "18px", margin: "0 1px" }}>-</span>
                      <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "24px", letterSpacing: "-0.5px" }}>
                        {scoringState.wickets}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                      <span style={{ color: "#64748b", fontSize: "8.5px", fontWeight: 800 }}>OVERS:</span>
                      <span style={{ color: "#22d3ee", fontSize: "10px", fontWeight: 950 }}>{fmtOv(scoringState.balls, bpo)}</span>
                      <span style={{ color: "#475569", fontSize: "8.5px" }}>/{match.overs}</span>
                    </div>
                  </>
                )}
              </div>

              {/* ── BOWLER & OVER BALLS ── */}
              <div style={{ display: "flex", flex: 1.1, padding: "0 10px", alignItems: "center", justifyContent: "space-between", gap: "10px", minWidth: 0 }}>
                {/* Bowler */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#0ea5e9", fontSize: "7px", fontWeight: 900, letterSpacing: "0.8px" }}>BOWLER</span>
                    <span style={{ color: "#334155", fontSize: "7px" }}>•</span>
                    <span style={{ color: "#64748b", fontSize: "7.5px", fontWeight: 700 }}>Econ: {bowlerEcon}</span>
                  </div>
                  <div style={{ color: "#ffffff", fontWeight: 900, fontSize: "11px", textTransform: "uppercase", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {scoringState.bowler || "Bowler"}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{ color: "#f97316", fontWeight: 950, fontSize: "13px" }}>
                      {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "8.5px", fontWeight: 700 }}>
                      ({fmtOv(bowler?.ballsBowled ?? 0, bpo)} ov)
                    </span>
                  </div>
                </div>

                {/* Over Ball Badges */}
                <div style={{ display: "flex", gap: "2.5px", alignItems: "center", flexShrink: 0 }}>
                  {Array.from({ length: totalBallSlots }).map((_, i) => {
                    const ball = thisOver[i];
                    let bg = "rgba(255,255,255,0.04)";
                    let color = "#475569";
                    let border = "1px solid rgba(14,165,233,0.2)";
                    let shadow = "none";
                    if (ball) {
                      if (ball === "W" || ball.startsWith("W+")) {
                        bg = "linear-gradient(135deg, #ef4444, #b91c1c)";
                        color = "#fff"; border = "1.5px solid #fca5a5"; shadow = "0 0 7px rgba(239,68,68,0.5)";
                      } else if (ball === "6") {
                        bg = "linear-gradient(135deg, #f97316, #ea580c)";
                        color = "#fff"; border = "1.5px solid #fdba74"; shadow = "0 0 7px rgba(249,115,22,0.5)";
                      } else if (ball === "4") {
                        bg = "linear-gradient(135deg, #0ea5e9, #0284c7)";
                        color = "#fff"; border = "1.5px solid #7dd3fc"; shadow = "0 0 7px rgba(14,165,233,0.5)";
                      } else if (isExtraBall(ball)) {
                        bg = "linear-gradient(135deg, #a855f7, #7c3aed)";
                        color = "#fff"; border = "1.5px solid #c4b5fd"; shadow = "0 0 6px rgba(168,85,247,0.4)";
                      } else {
                        bg = "rgba(255,255,255,0.12)";
                        color = "#fff"; border = "1.5px solid rgba(14,165,233,0.3)";
                      }
                    }
                    return (
                      <div key={i} style={{
                        width: "17px", height: "17px", borderRadius: "5px",
                        background: bg, border, color, boxShadow: shadow,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: ball && ball.includes("+") ? undefined : (ball && ball.length > 2 ? "6px" : "8.5px"),
                        fontWeight: 950, lineHeight: 1, flexShrink: 0
                      }}>
                        {ball && ball.includes("+") ? renderOutcomeText(ball, 17) : (ball || "")}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── BOWLING TEAM CAPSULE (right) ── */}
              <div style={{
                background: "linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 12px 0 18px", minWidth: "88px",
                clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "15px", fontWeight: 950, color: "#fff", letterSpacing: "0.5px", lineHeight: 1.1, textTransform: "uppercase" }}>
                    {bowlTeamShort}
                  </span>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "2px",
                    color: "rgba(255,255,255,0.7)", fontSize: "7px", fontWeight: 900, marginTop: "2px"
                  }}>
                    <span>⚾</span><span>BOWL</span>
                  </div>
                </div>
              </div>

            </div>




























          </div>
        ) : (
          <div className="scale-in" style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(135deg, rgba(8,12,28,0.98) 0%, rgba(15,8,22,0.98) 100%)",
            border: "2px solid #f97316", borderRadius: 16,
            padding: "36px 56px", textAlign: "center", color: "#fff",
            boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 25px rgba(249,115,22,0.2)"
          }}>
            <div style={{
              display: "inline-block", background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff", fontWeight: 950, fontSize: "10px", letterSpacing: "1.5px",
              padding: "3px 10px", borderRadius: "4px", marginBottom: "12px"
            }}>
              🏏 T20 EMERGING ASIA CUP 2024
            </div>
            <div style={{ color: "#ffffff", fontWeight: 950, fontSize: "22px", letterSpacing: "1px" }}>
              {match.team1Name.toUpperCase()} <span style={{ color: "#f97316" }}>VS</span> {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#22d3ee", fontSize: "11px", fontWeight: 800, marginTop: "10px", letterSpacing: "1.5px" }}>
              {match.matchType || "T20"} • MATCH #{match.matchNo || 1} • {match.overs} OVERS
            </div>
            <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, marginTop: "6px" }}>MATCH NOT STARTED</div>
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
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1280px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.7))" }}>

            {/* Target pill */}
            {scoringState.target !== null && (
              <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", background: "#facc15", color: "#000", borderRadius: "4px", padding: "2px 14px", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", zIndex: 5, whiteSpace: "nowrap" }}>
                TARGET: {scoringState.target}
              </div>
            )}

            {/* ── Top status ticker ── */}
            <div style={{
              background: "linear-gradient(90deg, #111 0%, #1a1a00 50%, #111 100%)",
              borderTop: "2px solid #facc15",
              borderLeft: "2px solid #facc15",
              borderRight: "2px solid #facc15",
              borderRadius: "8px 8px 0 0",
              padding: "3px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ color: "#facc15", fontSize: "9px", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                {statusLine}
              </span>
            </div>

            {/* ── Main scoreboard row ── */}
            <div style={{
              display: "flex",
              alignItems: "stretch",
              height: "46px",
              background: "#0e0e0e",
              border: "2px solid #facc15",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              overflow: "hidden",
            }}>

              {/* ── LEFT: Batting team plate ── */}
              <div style={{
                background: "linear-gradient(135deg, #facc15 0%, #eab308 60%, #ca8a04 100%)",
                color: "#000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 16px",
                minWidth: "90px",
                clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
              }}>
                <span style={{ fontWeight: 950, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.1 }}>{batTeamShort}</span>
                <span style={{ fontSize: "7px", fontWeight: 800, letterSpacing: "0.8px", opacity: 0.7, marginTop: "1px" }}>BAT</span>
              </div>

              {/* ── BATSMEN section ── */}
              <div style={{ display: "flex", flex: 1, padding: "0 10px", alignItems: "center", gap: "10px", marginLeft: "-5px", minWidth: 0 }}>
                {/* Striker */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, minWidth: 0 }}>
                  <span style={{ color: "#facc15", fontWeight: 900, fontSize: "10.5px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>▶ {scoringState.striker || "—"}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    <span style={{ color: "#fff", fontWeight: 950, fontSize: "15px" }}>{striker?.runs ?? 0}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", fontWeight: 700 }}>({striker?.balls ?? 0})</span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: "1px", height: "26px", background: "rgba(250,204,21,0.25)", flexShrink: 0 }} />

                {/* Non-Striker */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, minWidth: 0 }}>
                  <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scoringState.nonStriker || "—"}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 800, fontSize: "13px" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "8.5px", fontWeight: 600 }}>({nonStriker?.balls ?? 0})</span>
                  </div>
                </div>
              </div>

              {/* ── CENTER: Score nucleus ── */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 16px",
                minWidth: "155px",
                flexShrink: 0,
                background: activeNotification
                  ? getNotificationStyles(activeNotification).bg
                  : "linear-gradient(180deg, #1a1a00 0%, #0e0e00 100%)",
                borderLeft: "2px solid #facc15",
                borderRight: "2px solid #facc15",
                transition: "all 0.3s ease",
              }}>
                {activeNotification ? (
                  <span style={{
                    color: getNotificationStyles(activeNotification).textColor,
                    fontSize: "11px", fontWeight: 950, letterSpacing: "1.5px",
                    textTransform: "uppercase", textAlign: "center",
                    animation: "pulseGlow 1s ease-in-out infinite alternate",
                    lineHeight: 1.25, padding: "0 4px"
                  }}>
                    {activeNotification}
                  </span>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1 }}>
                      <span style={{ color: "#facc15", fontWeight: 950, fontSize: "22px", letterSpacing: "-0.5px", textShadow: "0 0 10px rgba(250,204,21,0.4)" }}>{scoringState.score}</span>
                      <span style={{ color: "#eab308", fontWeight: 900, fontSize: "16px", margin: "0 1px" }}>-</span>
                      <span style={{ color: "#fff", fontWeight: 950, fontSize: "22px", letterSpacing: "-0.5px" }}>{scoringState.wickets}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                      <span style={{ color: "#64748b", fontSize: "8px", fontWeight: 800 }}>OV:</span>
                      <span style={{ color: "#facc15", fontSize: "9.5px", fontWeight: 950 }}>{fmtOv(scoringState.balls, match.ballsPerOver)}</span>
                      <span style={{ color: "#475569", fontSize: "8px" }}>/{match.overs}</span>
                    </div>
                  </>
                )}
              </div>

              {/* ── BOWLER & OVER BALLS ── */}
              <div style={{ display: "flex", flex: 1.1, padding: "0 10px", alignItems: "center", justifyContent: "space-between", gap: "8px", minWidth: 0 }}>
                {/* Bowler */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, minWidth: 0 }}>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "7.5px", fontWeight: 800, letterSpacing: "0.8px" }}>BOWLER</span>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scoringState.bowler || "—"}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    <span style={{ color: "#facc15", fontWeight: 950, fontSize: "12px" }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}</span>
                    <span style={{ color: "#64748b", fontSize: "8px", fontWeight: 700 }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                  </div>
                </div>

                {/* Over balls */}
                <div style={{ display: "flex", gap: "3px", alignItems: "center", flexShrink: 0 }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCount = bpo + extrasCount;
                    return Array.from({ length: totalCount }).map((_, i) => {
                      const ball = thisOver[i];
                      let bg = "transparent";
                      let color = "rgba(255,255,255,0.3)";
                      let border = "1px dashed rgba(250,204,21,0.25)";
                      let shadow = "none";
                      if (ball) {
                        if (ball === "W" || ball?.startsWith("W+")) { bg = "linear-gradient(135deg,#ef4444,#dc2626)"; color = "#fff"; border = "1.5px solid #fca5a5"; shadow = "0 0 6px rgba(239,68,68,0.5)"; }
                        else if (ball === "6") { bg = "linear-gradient(135deg,#facc15,#eab308)"; color = "#000"; border = "1.5px solid #fef08a"; shadow = "0 0 6px rgba(250,204,21,0.5)"; }
                        else if (ball === "4") { bg = "linear-gradient(135deg,#fde047,#facc15)"; color = "#000"; border = "1.5px solid #fef9c3"; shadow = "0 0 6px rgba(250,204,21,0.4)"; }
                        else if (isExtraBall(ball)) { bg = "rgba(250,204,21,0.2)"; color = "#facc15"; border = "1px solid rgba(250,204,21,0.4)"; }
                        else { bg = "rgba(255,255,255,0.1)"; color = "#fff"; border = "1px solid rgba(250,204,21,0.3)"; }
                      }
                      return (
                        <div key={i} style={{
                          width: "17px", height: "17px", borderRadius: "4px",
                          background: bg, border, color, boxShadow: shadow,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ball && ball.includes("+") ? undefined : (ball && ball.length > 2 ? "6px" : "8.5px"),
                          fontWeight: 950, lineHeight: 1, flexShrink: 0
                        }}>
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 17) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── RIGHT: Bowling team plate ── */}
              <div style={{
                background: "linear-gradient(135deg, #1a1400 0%, #0e0e0e 100%)",
                color: "#facc15",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px",
                minWidth: "90px",
                clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
                borderLeft: "1px solid rgba(250,204,21,0.3)",
              }}>
                <span style={{ fontWeight: 950, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.1 }}>{bowlTeamShort}</span>
                <span style={{ fontSize: "7px", fontWeight: 800, letterSpacing: "0.8px", color: "rgba(250,204,21,0.6)", marginTop: "1px" }}>BOWL</span>
              </div>

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
    const bpo = match.ballsPerOver || 6;
    const rrr = bLeft !== null && bLeft > 0 && need !== null ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);
    const projScore = scoringState.balls > 0 ? Math.round((scoringState.score / scoringState.balls) * (match.overs * bpo)) : 0;
    const strikerSR = striker && striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : "0.0";
    const nonStrikerSR = nonStriker && nonStriker.balls > 0 ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(1) : "0.0";
    const bowlerEcon = bowler && bowler.ballsBowled > 0 ? ((bowler.runsConceded / bowler.ballsBowled) * bpo).toFixed(2) : "0.00";

    const getShortNameLocal = (name: string) => {
      if (!name) return "TEAM";
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);
    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isPreview ? "center" : "flex-end",
        padding: isPreview ? "80px 0 28px" : "0 0 20px",
        fontFamily: "'Outfit', sans-serif",
        overflow: "hidden"
      }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(10px)",
            color: "#fb7185",
            padding: "9px 20px",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 2.5,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            borderBottom: "1px solid rgba(225, 29, 72, 0.3)"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#e11d48", display: "inline-block", boxShadow: "0 0 10px #e11d48" }} />
              PREVIEW MODE
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
            <span style={{ color: "#ffffff" }}>JIO CINEMA BROADCAST SCOREBOARD</span>
          </div>
        )}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{
            width: "96vw",
            maxWidth: "1360px",
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 14px 35px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 20px rgba(225, 29, 72, 0.25))"
          }}>

            {/* ── TOP MATCH SITUATION RIBBON / HEADER BAR ── */}
            <div style={{
              background: "linear-gradient(90deg, #111827 0%, #1e1b4b 25%, #4c0519 50%, #1e1b4b 75%, #111827 100%)",
              borderTop: "2px solid #e11d48",
              borderLeft: "2px solid #be123c",
              borderRight: "2px solid #be123c",
              borderBottom: "1px solid rgba(225, 29, 72, 0.35)",
              borderRadius: "10px 10px 0 0",
              padding: "4px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
              gap: "10px"
            }}>
              {/* Left Badge: JioCinema Live Indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div style={{
                  background: "linear-gradient(135deg, #ff0055 0%, #e11d48 50%, #be123c 100%)",
                  color: "#ffffff",
                  fontWeight: 950,
                  fontSize: "9px",
                  letterSpacing: "1px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  boxShadow: "0 2px 8px rgba(225, 29, 72, 0.5)"
                }}>
                  <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff", display: "inline-block" }} />
                  <span>JIO LIVE</span>
                </div>
                <div style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(225, 29, 72, 0.4)",
                  padding: "1px 7px",
                  borderRadius: "3px",
                  fontSize: "8.5px",
                  fontWeight: 800,
                  color: "#fda4af",
                  letterSpacing: "0.5px"
                }}>
                  INN {scoringState.inningsNo}
                </div>
              </div>

              {/* Center Match Situation Dynamic Ticker */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                flex: 1,
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: "9.5px",
                fontWeight: 800,
                letterSpacing: "0.5px"
              }}>
                {scoringState.customInputText ? (
                  <span style={{ color: "#fda4af", textTransform: "uppercase" }}>{scoringState.customInputText}</span>
                ) : need !== null && bLeft !== null ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#fda4af" }}>TARGET: <strong style={{ color: "#ffffff", fontSize: "12.5px" }}>{scoringState.target}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    <span style={{ color: "#ffffff" }}>NEED <strong style={{ color: "#fb7185", fontSize: "13px" }}>{need}</strong> RUNS FROM <strong style={{ color: "#fda4af" }}>{bLeft}</strong> BALLS</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    <span style={{ color: "#fda4af" }}>RRR: <strong>{rrr}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    <span style={{ color: "#cbd5e1" }}>CRR: <strong>{crr}</strong></span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#ffffff" }}>{currentBatTeam.toUpperCase()} INNINGS</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#fda4af" }}>CRR: <strong style={{ color: "#ffffff" }}>{crr}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#cbd5e1" }}>PROJECTED: <strong style={{ color: "#fb7185" }}>{projScore}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#94a3b8" }}>MAX OVERS: {match.overs}</span>
                  </div>
                )}
              </div>

              {/* Right Badge: Match Info */}
              <div style={{
                fontSize: "8.5px",
                fontWeight: 900,
                color: "#cbd5e1",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flexShrink: 0
              }}>
                <span style={{ color: "#fb7185" }}>{match.matchType || "T20"}</span>
                <span>#{match.matchNo || 1}</span>
              </div>
            </div>

            {/* ── MAIN SCOREBOARD DECK ── */}
            <div style={{
              display: "flex",
              alignItems: "stretch",
              minHeight: "46px",
              background: "linear-gradient(180deg, #0b0f19 0%, #0f172a 50%, #090d16 100%)",
              border: "2px solid #be123c",
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              overflow: "hidden",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)"
            }}>

              {/* ── BATTING TEAM PLATE (Left End) ── */}
              <div style={{
                background: "linear-gradient(135deg, #ff0055 0%, #e11d48 40%, #be123c 75%, #881337 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 18px 0 14px",
                minWidth: "105px",
                clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
                position: "relative",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.3)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "8px" }}>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: 950,
                    letterSpacing: "0.5px",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                    textShadow: "0 1px 3px rgba(0,0,0,0.6)"
                  }}>
                    {batTeamShort}
                  </span>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    background: "#0f172a",
                    color: "#fb7185",
                    padding: "1px 4px",
                    borderRadius: "2px",
                    fontSize: "7px",
                    fontWeight: 900,
                    marginTop: "2px",
                    letterSpacing: "0.5px",
                    border: "1px solid rgba(225, 29, 72, 0.4)"
                  }}>
                    <span className="bat-swing" style={{ fontSize: "7px" }}>🏏</span>
                    <span>BAT</span>
                  </div>
                </div>
              </div>

              {/* ── BATSMEN SECTION ── */}
              <div style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                padding: "0 10px",
                gap: "12px",
                marginLeft: "-6px",
                minWidth: 0
              }}>
                {/* Striker Card */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "rgba(225,29,72,0.2)",
                    border: "1.5px solid #e11d48",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    flexShrink: 0,
                    boxShadow: "0 0 8px rgba(225,29,72,0.4)"
                  }}>
                    <span className="bat-swing">🏏</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px", overflow: "hidden" }}>
                      <span style={{
                        color: "#fda4af",
                        fontWeight: 900,
                        fontSize: "10.5px",
                        letterSpacing: "0.3px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden"
                      }}>
                        {scoringState.striker || "Striker"}*
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "14px" }}>{striker?.runs ?? 0}</span>
                      <span style={{ color: "#94a3b8", fontSize: "9px", fontWeight: 800 }}>({striker?.balls ?? 0})</span>
                      <span style={{ color: "#cbd5e1", fontSize: "8px", fontWeight: 700, marginLeft: "3px" }}>
                        4s:{striker?.fours ?? 0} 6s:{striker?.sixes ?? 0}
                      </span>
                      <span style={{ color: "#fda4af", fontSize: "7.5px", fontWeight: 800, marginLeft: "2px" }}>
                        SR:{strikerSR}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: "1px", height: "26px", background: "linear-gradient(180deg, transparent, rgba(225,29,72,0.4), transparent)", flexShrink: 0 }} />

                {/* Non-Striker Card */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                  <span style={{
                    color: "#cbd5e1",
                    fontWeight: 700,
                    fontSize: "10px",
                    letterSpacing: "0.2px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}>
                    {scoringState.nonStriker || "Non-Striker"}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "12px" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "#64748b", fontSize: "8.5px", fontWeight: 700 }}>({nonStriker?.balls ?? 0})</span>
                    <span style={{ color: "#94a3b8", fontSize: "8px", fontWeight: 600, marginLeft: "3px" }}>
                      4s:{nonStriker?.fours ?? 0} 6s:{nonStriker?.sixes ?? 0}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "7.5px", fontWeight: 700, marginLeft: "2px" }}>
                      SR:{nonStrikerSR}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── CENTER PILL SCORE NUCLEUS (JioCinema Signature 3D White Capsule) ── */}
              <div style={{
                background: activeNotification
                  ? getNotificationStyles(activeNotification).bg
                  : "linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 18px",
                minWidth: "175px",
                flexShrink: 0,
                borderLeft: "2.5px solid #be123c",
                borderRight: "2.5px solid #be123c",
                boxShadow: activeNotification
                  ? "0 0 20px rgba(225,29,72,0.6)"
                  : "0 0 15px rgba(225,29,72,0.2), inset 0 1px 0 rgba(255,255,255,1)",
                position: "relative",
                transition: "all 0.3s ease"
              }}>
                {activeNotification ? (
                  <span style={{
                    color: getNotificationStyles(activeNotification).textColor,
                    fontSize: "11.5px",
                    fontWeight: 950,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    textAlign: "center",
                    animation: "pulseGlow 1s ease-in-out infinite alternate",
                    lineHeight: 1.25,
                    padding: "0 4px"
                  }}>
                    {activeNotification}
                  </span>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1 }}>
                      <span style={{
                        color: "#be123c",
                        fontWeight: 950,
                        fontSize: "20px",
                        letterSpacing: "-0.5px",
                        textShadow: "0 1px 1px rgba(0,0,0,0.1)"
                      }}>
                        {scoringState.score}
                      </span>
                      <span style={{
                        color: "#e11d48",
                        fontWeight: 950,
                        fontSize: "16px",
                        margin: "0 1px"
                      }}>
                        -
                      </span>
                      <span style={{
                        color: "#be123c",
                        fontWeight: 950,
                        fontSize: "20px",
                        letterSpacing: "-0.5px"
                      }}>
                        {scoringState.wickets}
                      </span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "1px"
                    }}>
                      <span style={{
                        color: "#0f172a",
                        fontSize: "9.5px",
                        fontWeight: 900,
                        letterSpacing: "0.5px"
                      }}>
                        OV: <strong style={{ color: "#be123c" }}>{fmtOv(scoringState.balls, match.ballsPerOver)}</strong>/{match.overs}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* ── BOWLER SECTION ── */}
              <div style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                padding: "0 10px",
                gap: "10px",
                minWidth: 0,
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "rgba(225,29,72,0.15)",
                    border: "1.5px solid #be123c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    flexShrink: 0,
                    boxShadow: "0 0 6px rgba(225,29,72,0.3)"
                  }}>
                    <span className="ball-spin">⚾</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                    <span style={{
                      color: "#fda4af",
                      fontWeight: 900,
                      fontSize: "10.5px",
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden"
                    }}>
                      {scoringState.bowler || "Bowler"}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "12.5px" }}>
                        {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: "8.5px", fontWeight: 700 }}>
                        ({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})
                      </span>
                      <span style={{ color: "#fda4af", fontSize: "7.5px", fontWeight: 800, marginLeft: "2px" }}>
                        ECON:{bowlerEcon}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── THIS OVER BALLS STRIP ── */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  background: "rgba(15, 23, 42, 0.7)",
                  padding: "3px 6px",
                  borderRadius: "5px",
                  border: "1px solid rgba(225, 29, 72, 0.3)",
                  flexShrink: 0
                }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = Math.max(bpo, bpo + extrasCount);
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      const isW = ball === "W" || ball?.startsWith("W+");
                      const isBoundary = ball === "4" || ball === "6";
                      return (
                        <div
                          key={i}
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "3px",
                            background: isW
                              ? "linear-gradient(135deg, #ff0055 0%, #be123c 100%)"
                              : isBoundary
                                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                : ball
                                  ? "rgba(255,255,255,0.15)"
                                  : "rgba(255,255,255,0.03)",
                            border: isW
                              ? "1px solid #ff0055"
                              : isBoundary
                                ? "1px solid #34d399"
                                : ball
                                  ? "1px solid rgba(255,255,255,0.25)"
                                  : "1px dashed rgba(255,255,255,0.15)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "8.5px",
                            fontWeight: 950,
                            lineHeight: 1,
                            boxShadow: isW ? "0 0 6px rgba(225,29,72,0.6)" : isBoundary ? "0 0 6px rgba(16,185,129,0.5)" : "none"
                          }}
                        >
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 18) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── BOWLING TEAM MINI-PLATE (Right End) ── */}
              <div style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c0519 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px 0 16px",
                minWidth: "85px",
                clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
                borderLeft: "1px solid rgba(225, 29, 72, 0.4)",
                position: "relative"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginLeft: "4px" }}>
                  <span style={{
                    fontSize: "12.5px",
                    fontWeight: 950,
                    letterSpacing: "0.5px",
                    lineHeight: 1.1,
                    textTransform: "uppercase"
                  }}>
                    {bowlTeamShort}
                  </span>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    color: "#cbd5e1",
                    fontSize: "7px",
                    fontWeight: 900,
                    marginTop: "1px",
                    letterSpacing: "0.5px"
                  }}>
                    <span>⚾</span>
                    <span>BOWL</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="scale-in" style={{
            position: "relative",
            zIndex: 1,
            background: "linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #4c0519 100%)",
            border: "2.5px solid #e11d48",
            borderRadius: 16,
            padding: "36px 56px",
            textAlign: "center",
            color: "#fff",
            boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 25px rgba(225,29,72,0.3)"
          }}>
            <div style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #ff0055 0%, #e11d48 50%, #be123c 100%)",
              color: "#ffffff",
              fontWeight: 950,
              fontSize: "11px",
              letterSpacing: "1.5px",
              padding: "4px 12px",
              borderRadius: "4px",
              marginBottom: "12px",
              textTransform: "uppercase",
              boxShadow: "0 2px 10px rgba(225,29,72,0.5)"
            }}>
              ⚡ JIO CINEMA MATCH PREVIEW
            </div>
            <div style={{ color: "#ffffff", fontWeight: 950, fontSize: "24px", letterSpacing: "1px" }}>
              {match.team1Name.toUpperCase()} <span style={{ color: "#fb7185" }}>VS</span> {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#fda4af", fontSize: "12px", fontWeight: "800", marginTop: "10px", letterSpacing: "1.5px" }}>
              {match.matchType || "T20"} • MATCH #{match.matchNo || 1} • {match.overs} OVERS
            </div>
            <div style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "700", marginTop: "6px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── IPL / 12th Theme: Royal blue and gold broadcast styling ──
  if (themeSlug === "ipl") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const bpo = match.ballsPerOver || 6;
    const rrr = bLeft !== null && bLeft > 0 && need !== null ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);
    const projScore = scoringState.balls > 0 ? Math.round((scoringState.score / scoringState.balls) * (match.overs * bpo)) : 0;
    const strikerSR = striker && striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : "0.0";
    const nonStrikerSR = nonStriker && nonStriker.balls > 0 ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(1) : "0.0";
    const bowlerEcon = bowler && bowler.ballsBowled > 0 ? ((bowler.runsConceded / bowler.ballsBowled) * bpo).toFixed(2) : "0.00";

    const getShortNameLocal = (name: string) => {
      if (!name) return "TEAM";
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#fbbf24", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>IPL Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1360px", position: "relative", zIndex: 1, filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.75)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.18))" }}>

            {/* Top Match Situation Ribbon / Header Bar */}
            <div style={{
              background: "linear-gradient(90deg, #090e29 0%, #0f1c4d 25%, #182b68 50%, #0f1c4d 75%, #090e29 100%)",
              borderTop: "2px solid #fbbf24",
              borderLeft: "2px solid #f59e0b",
              borderRight: "2px solid #f59e0b",
              borderBottom: "1px solid rgba(251, 191, 36, 0.3)",
              borderRadius: "10px 10px 0 0",
              padding: "3px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
              gap: "10px"
            }}>
              {/* Left Badge: TATA IPL Live Indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div style={{
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                  color: "#050714",
                  fontWeight: 950,
                  fontSize: "9px",
                  letterSpacing: "0.8px",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  boxShadow: "0 2px 4px rgba(245,158,11,0.4)"
                }}>
                  <span>⚡</span>
                  <span>LIVE MATCH</span>
                </div>
                <div style={{
                  background: "rgba(15, 23, 42, 0.75)",
                  border: "1px solid rgba(251, 191, 36, 0.35)",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  fontSize: "8.5px",
                  fontWeight: 800,
                  color: "#fde68a",
                  letterSpacing: "0.5px"
                }}>
                  INN {scoringState.inningsNo}
                </div>
              </div>

              {/* Center Match Situation Dynamic Ticker */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                flex: 1,
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: "9.5px",
                fontWeight: 800,
                letterSpacing: "0.5px"
              }}>
                {scoringState.customInputText ? (
                  <span style={{ color: "#fbbf24", textTransform: "uppercase" }}>{scoringState.customInputText}</span>
                ) : need !== null && bLeft !== null ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#fbbf24" }}>TARGET: <strong style={{ color: "#ffffff", fontSize: "12.5px" }}>{scoringState.target}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    <span style={{ color: "#ffffff" }}>NEED <strong style={{ color: "#fbbf24", fontSize: "13px" }}>{need}</strong> RUNS FROM <strong style={{ color: "#fde68a" }}>{bLeft}</strong> BALLS</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    <span style={{ color: "#fde68a" }}>RRR: <strong>{rrr}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    <span style={{ color: "#94a3b8" }}>CRR: <strong>{crr}</strong></span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#ffffff" }}>1st INNINGS ACTION</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#fde68a" }}>CRR: <strong style={{ color: "#ffffff" }}>{crr}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#94a3b8" }}>PROJECTED: <strong style={{ color: "#fbbf24" }}>{projScore}</strong></span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                    <span style={{ color: "#e0e7ff" }}>MAX OVERS: {match.overs}</span>
                  </div>
                )}
              </div>

              {/* Right Badge: Match Info */}
              <div style={{
                fontSize: "8.5px",
                fontWeight: 900,
                color: "#94a3b8",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flexShrink: 0
              }}>
                <span style={{ color: "#fbbf24" }}>{match.matchType || "T20"}</span>
                <span>#{match.matchNo || 1}</span>
              </div>
            </div>

            {/* Main Scoreboard Deck */}
            <div style={{
              display: "flex",
              alignItems: "stretch",
              minHeight: "44px",
              background: "linear-gradient(180deg, #070c24 0%, #0d1538 50%, #06091b 100%)",
              border: "2px solid #f59e0b",
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              overflow: "hidden",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)"
            }}>

              {/* ── BATTING TEAM PLATE (Left End) ── */}
              <div style={{
                background: "linear-gradient(135deg, #fef08a 0%, #fbbf24 35%, #f59e0b 70%, #b45309 100%)",
                color: "#050814",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 16px 0 12px",
                minWidth: "100px",
                clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
                position: "relative",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.25)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "8px" }}>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: 950,
                    letterSpacing: "0.5px",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                    textShadow: "0 1px 2px rgba(255,255,255,0.4)"
                  }}>
                    {batTeamShort}
                  </span>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    background: "#050714",
                    color: "#fbbf24",
                    padding: "1px 3px",
                    borderRadius: "2px",
                    fontSize: "7px",
                    fontWeight: 900,
                    marginTop: "1px",
                    letterSpacing: "0.5px"
                  }}>
                    <span className="bat-swing" style={{ fontSize: "7px" }}>🏏</span>
                    <span>BAT</span>
                  </div>
                </div>
              </div>

              {/* ── BATSMEN SECTION ── */}
              <div style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                padding: "0 10px",
                gap: "10px",
                marginLeft: "-6px",
                minWidth: 0
              }}>
                {/* Striker Card */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "rgba(251,191,36,0.15)",
                    border: "1.5px solid #fbbf24",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8px",
                    flexShrink: 0,
                    boxShadow: "0 0 6px rgba(251,191,36,0.3)"
                  }}>
                    <span className="bat-swing">🏏</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px", overflow: "hidden" }}>
                      <span style={{
                        color: "#fbbf24",
                        fontWeight: 900,
                        fontSize: "10.5px",
                        letterSpacing: "0.3px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden"
                      }}>
                        {scoringState.striker || "Striker"}*
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                      <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "14px" }}>{striker?.runs ?? 0}</span>
                      <span style={{ color: "#94a3b8", fontSize: "9px", fontWeight: 800 }}>({striker?.balls ?? 0})</span>
                      <span style={{ color: "#64748b", fontSize: "8px", fontWeight: 700, marginLeft: "3px" }}>
                        4s:{striker?.fours ?? 0} 6s:{striker?.sixes ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: "1px", height: "26px", background: "linear-gradient(180deg, transparent, rgba(251,191,36,0.3), transparent)", flexShrink: 0 }} />

                {/* Non-Striker Card */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                  <span style={{
                    color: "#cbd5e1",
                    fontWeight: 700,
                    fontSize: "10px",
                    letterSpacing: "0.2px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}>
                    {scoringState.nonStriker || "Non-Striker"}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "12px" }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "#64748b", fontSize: "8.5px", fontWeight: 700 }}>({nonStriker?.balls ?? 0})</span>
                    <span style={{ color: "#475569", fontSize: "8px", fontWeight: 600, marginLeft: "3px" }}>
                      4s:{nonStriker?.fours ?? 0} 6s:{nonStriker?.sixes ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── CENTER SCORE NUCLEUS ── */}
              <div style={{
                background: activeNotification
                  ? getNotificationStyles(activeNotification).bg
                  : "linear-gradient(180deg, #1e3a8a 0%, #172554 45%, #0f172a 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 16px",
                minWidth: "170px",
                flexShrink: 0,
                borderLeft: "2px solid #f59e0b",
                borderRight: "2px solid #f59e0b",
                boxShadow: activeNotification
                  ? "0 0 18px rgba(245,158,11,0.5)"
                  : "inset 0 0 12px rgba(251,191,36,0.12)",
                position: "relative",
                transition: "all 0.3s ease"
              }}>
                {activeNotification ? (
                  <span style={{
                    color: getNotificationStyles(activeNotification).textColor,
                    fontSize: "11px",
                    fontWeight: 950,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    textAlign: "center",
                    animation: "pulseGlow 1s ease-in-out infinite alternate",
                    lineHeight: 1.25,
                    padding: "0 4px"
                  }}>
                    {activeNotification}
                  </span>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1 }}>
                      <span style={{
                        color: "#fef08a",
                        fontWeight: 950,
                        fontSize: "22px",
                        letterSpacing: "-0.5px",
                        textShadow: "0 2px 8px rgba(245,158,11,0.4)"
                      }}>
                        {scoringState.score}
                      </span>
                      <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: "18px", margin: "0 1px" }}>-</span>
                      <span style={{
                        color: "#ffffff",
                        fontWeight: 950,
                        fontSize: "22px",
                        letterSpacing: "-0.5px"
                      }}>
                        {scoringState.wickets}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "8.5px", fontWeight: 800 }}>OVERS:</span>
                      <span style={{ color: "#fbbf24", fontSize: "10px", fontWeight: 950 }}>{fmtOv(scoringState.balls, bpo)}</span>
                      <span style={{ color: "#64748b", fontSize: "8.5px" }}>/{match.overs}</span>
                    </div>
                  </>
                )}
              </div>

              {/* ── BOWLER & THIS OVER DETAILS ── */}
              <div style={{
                display: "flex",
                flex: 1.1,
                padding: "0 10px",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                minWidth: 0
              }}>
                {/* Bowler Details */}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#fbbf24", fontSize: "7px", fontWeight: 900, letterSpacing: "0.8px" }}>BOWLER</span>
                    <span style={{ color: "#64748b", fontSize: "7.5px" }}>•</span>
                    <span style={{ color: "#94a3b8", fontSize: "7.5px", fontWeight: 700 }}>Econ: {bowlerEcon}</span>
                  </div>
                  <div style={{
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2px",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}>
                    {scoringState.bowler || "Bowler"}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{ color: "#fbbf24", fontWeight: 950, fontSize: "12px" }}>
                      {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "8.5px", fontWeight: 700 }}>
                      ({fmtOv(bowler?.ballsBowled ?? 0, bpo)} ov)
                    </span>
                  </div>
                </div>

                {/* Over Ball Badges */}
                <div style={{ display: "flex", gap: "2.5px", alignItems: "center", flexShrink: 0 }}>
                  {(() => {
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      let bg = "rgba(255,255,255,0.05)";
                      let color = "#64748b";
                      let border = "1px solid rgba(251,191,36,0.25)";
                      let shadow = "none";

                      if (ball) {
                        if (ball === "W" || ball.startsWith("W+")) {
                          bg = "linear-gradient(135deg, #ef4444, #dc2626)";
                          color = "#ffffff";
                          border = "1.5px solid #fca5a5";
                          shadow = "0 0 8px rgba(239,68,68,0.5)";
                        } else if (ball === "6") {
                          bg = "linear-gradient(135deg, #f59e0b, #d97706)";
                          color = "#000000";
                          border = "1.5px solid #fef08a";
                          shadow = "0 0 8px rgba(245,158,11,0.5)";
                        } else if (ball === "4") {
                          bg = "linear-gradient(135deg, #fbbf24, #f59e0b)";
                          color = "#000000";
                          border = "1.5px solid #fef08a";
                          shadow = "0 0 8px rgba(251,191,36,0.5)";
                        } else if (isExtraBall(ball)) {
                          bg = "linear-gradient(135deg, #06b6d4, #0891b2)";
                          color = "#ffffff";
                          border = "1.5px solid #67e8f9";
                          shadow = "0 0 6px rgba(6,182,212,0.4)";
                        } else {
                          bg = "linear-gradient(135deg, #1d4ed8, #1e3a8a)";
                          color = "#ffffff";
                          border = "1.5px solid rgba(251,191,36,0.4)";
                        }
                      }

                      return (
                        <div
                          key={i}
                          style={{
                            width: "17px",
                            height: "17px",
                            borderRadius: "4px",
                            background: bg,
                            border,
                            color,
                            boxShadow: shadow,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: ball && ball.includes("+") ? undefined : (ball && ball.length > 2 ? "6px" : "8.5px"),
                            fontWeight: 950,
                            lineHeight: 1,
                            flexShrink: 0
                          }}
                        >
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 22) : (ball || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── BOWLING TEAM PLATE (Right End) ── */}
              <div style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #172554 50%, #0a1128 100%)",
                color: "#fbbf24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 12px 0 18px",
                minWidth: "90px",
                clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
                flexShrink: 0,
                borderLeft: "1px solid rgba(251,191,36,0.3)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: 950,
                    letterSpacing: "0.5px",
                    lineHeight: 1.1,
                    textTransform: "uppercase"
                  }}>
                    {bowlTeamShort}
                  </span>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    color: "#94a3b8",
                    fontSize: "7px",
                    fontWeight: 900,
                    marginTop: "1px",
                    letterSpacing: "0.5px"
                  }}>
                    <span>⚾</span>
                    <span>BOWL</span>
                  </div>
                </div>
              </div>

            </div>



          </div>
        ) : (
          <div className="scale-in" style={{
            position: "relative",
            zIndex: 1,
            background: "linear-gradient(135deg, #090e29 0%, #162756 50%, #090e29 100%)",
            border: "2.5px solid #f59e0b",
            borderRadius: 16,
            padding: "36px 56px",
            textAlign: "center",
            color: "#fff",
            boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 25px rgba(245,158,11,0.25)"
          }}>
            <div style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
              color: "#050714",
              fontWeight: 950,
              fontSize: "11px",
              letterSpacing: "1.5px",
              padding: "4px 12px",
              borderRadius: "4px",
              marginBottom: "12px",
              textTransform: "uppercase"
            }}>
              ⚡ TATA IPL MATCH PREVIEW
            </div>
            <div style={{ color: "#ffffff", fontWeight: 950, fontSize: "24px", letterSpacing: "1px" }}>
              {match.team1Name.toUpperCase()} <span style={{ color: "#fbbf24" }}>VS</span> {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#fde68a", fontSize: "12px", fontWeight: "800", marginTop: "10px", letterSpacing: "1.5px" }}>
              {match.matchType || "T20"} • MATCH #{match.matchNo || 1} • {match.overs} OVERS
            </div>
            <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700", marginTop: "6px" }}>
              MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── WT20 2024 / 13th Theme: Compact High-Voltage ICC T20 World Cup 2024 Broadcast Overlay ──
  if (themeSlug === "wt20-2024") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const bpo = match.ballsPerOver || 6;
    const rrr = bLeft !== null && bLeft > 0 && need !== null ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);

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
      : need !== null && bLeft !== null
        ? `NEED ${need} RUNS OFF ${bLeft} BALLS • REQ RR: ${rrr || "—"}`
        : `LIVE MATCH`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 24px" : "0 0 16px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#ec4899", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>WT20 2024 Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "92vw", maxWidth: "1020px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.7))" }}>

            {/* ── SEAMLESS FLOATING INNINGS / TARGET / CRR EQUATION PILL ── */}
            <div style={{
              position: "absolute",
              top: "-15px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10
            }}>
              {scoringState.target !== null ? (
                <div style={{
                  background: "linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%)",
                  borderRadius: "12px",
                  padding: "2px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 4px 14px rgba(236,72,153,0.45)",
                  color: "#ffffff",
                  whiteSpace: "nowrap"
                }}>
                  <span style={{ fontSize: "9px", fontWeight: "950", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    TARGET: <strong style={{ fontSize: "10.5px", color: "#ffffff" }}>{scoringState.target}</strong>
                  </span>
                  {need !== null && bLeft !== null && (
                    <>
                      <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#ffffff" }} />
                      <span style={{ fontSize: "9px", fontWeight: "900" }}>NEED {need} ({bLeft}b)</span>
                      {rrr && (
                        <span style={{ background: "rgba(0,0,0,0.4)", borderRadius: "6px", padding: "1px 5px", fontSize: "8px", fontWeight: "950" }}>
                          RRR: {rrr}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div style={{
                  background: "linear-gradient(90deg, #ec4899 0%, #a855f7 100%)",
                  borderRadius: "12px",
                  padding: "2px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 3px 12px rgba(236,72,153,0.4)",
                  color: "#ffffff",
                  whiteSpace: "nowrap"
                }}>
                  <span style={{ fontSize: "9px", fontWeight: "950", letterSpacing: "0.8px" }}>1st INNINGS</span>
                  <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.7)" }} />
                  <span style={{ fontSize: "9px", fontWeight: "900", letterSpacing: "0.5px" }}>CRR: {crr}</span>
                </div>
              )}
            </div>

            {/* ── MAIN HIGH-VOLTAGE SCOREBOARD FRAME ── */}
            <div style={{
              display: "flex",
              alignItems: "stretch",
              height: "46px",
              background: "linear-gradient(135deg, rgba(14, 2, 28, 0.98) 0%, rgba(28, 4, 52, 0.98) 50%, rgba(10, 1, 22, 0.98) 100%)",
              backdropFilter: "blur(14px)",
              border: "1.5px solid rgba(236, 72, 153, 0.5)",
              borderRadius: "14px 14px 0 0",
              boxShadow: "0 0 20px rgba(236, 72, 153, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
              position: "relative"
            }}>
              {/* Top Accent Energy Laser */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)",
                boxShadow: "0 0 8px #ec4899"
              }} />

              {/* ── LEFT BATTING TEAM SHIELD ── */}
              <div style={{
                background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #c026d3 100%)",
                padding: "0 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minWidth: "105px",
                clipPath: "polygon(0 0, 86% 0, 100% 100%, 0 100%)",
                position: "relative",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
                flexShrink: 0
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ffffff", boxShadow: "0 0 6px #ffffff" }} />
                  <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "12px", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    {batTeamShort}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "7px", fontWeight: "900", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                  BATTING
                </span>
              </div>

              {/* ── BATSMEN DETAILS SECTION ── */}
              <div style={{
                display: "flex",
                flex: 1.1,
                padding: "0 8px",
                alignItems: "center",
                gap: "6px",
                minWidth: "160px"
              }}>
                {/* Striker Active Card */}
                <div style={{
                  background: "linear-gradient(90deg, rgba(236, 72, 153, 0.18) 0%, rgba(168, 85, 247, 0.1) 100%)",
                  border: "1px solid rgba(236, 72, 153, 0.45)",
                  borderRadius: "10px",
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1.1,
                  minWidth: 0,
                  boxShadow: "0 0 8px rgba(236, 72, 153, 0.15)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0, overflow: "hidden" }}>
                    <span style={{ color: "#ec4899", fontSize: "9px" }}>⚡</span>
                    <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {scoringState.striker || "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2.5px", marginLeft: "4px", flexShrink: 0 }}>
                    <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13px" }}>
                      {striker?.runs ?? 0}
                    </span>
                    <span style={{ color: "#c4b5fd", fontSize: "8.5px", fontWeight: "800", background: "rgba(168,85,247,0.25)", padding: "1px 3px", borderRadius: "3px" }}>
                      {striker?.balls ?? 0}b
                    </span>
                  </div>
                </div>

                {/* Non-Striker Card */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 0.9,
                  minWidth: 0
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: 0, overflow: "hidden" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px" }}>🏃</span>
                    <span style={{ color: "#cbd5e1", fontWeight: "800", fontSize: "10.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {scoringState.nonStriker || "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2.5px", marginLeft: "4px", flexShrink: 0 }}>
                    <span style={{ color: "#e2e8f0", fontWeight: "850", fontSize: "11.5px" }}>
                      {nonStriker?.runs ?? 0}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "8px" }}>
                      ({nonStriker?.balls ?? 0})
                    </span>
                  </div>
                </div>
              </div>

              {/* ── CENTER BROADCAST SCORE & OVERS FORTRESS ── */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "3px 14px 2px",
                minWidth: "125px",
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(168, 85, 247, 0.22) 100%)",
                borderLeft: "1px solid rgba(236, 72, 153, 0.35)",
                borderRight: "1px solid rgba(168, 85, 247, 0.35)",
                position: "relative",
                flexShrink: 0,
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.5)"
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1, marginTop: "2px" }}>
                  <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "19px", lineHeight: 1, letterSpacing: "-0.5px", textShadow: "0 0 8px rgba(255,255,255,0.3)" }}>
                    {scoringState.score}
                  </span>
                  <span style={{ color: "#ec4899", fontWeight: "950", fontSize: "14px", margin: "0 1px", lineHeight: 1 }}>/</span>
                  <span style={{ color: "#f43f5e", fontWeight: "950", fontSize: "17px", lineHeight: 1, textShadow: "0 0 8px rgba(244,63,94,0.5)" }}>
                    {scoringState.wickets}
                  </span>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(0, 0, 0, 0.6)",
                  borderRadius: "8px",
                  padding: "1px 7px",
                  marginTop: "2px",
                  border: "1px solid rgba(236,72,153,0.2)"
                }}>
                  <span style={{ color: "#a855f7", fontSize: "7.5px", fontWeight: "950", letterSpacing: "0.5px" }}>OVER</span>
                  <span style={{ color: "#ffffff", fontSize: "9.5px", fontWeight: "900" }}>
                    {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}
                  </span>
                </div>
              </div>

              {/* ── BOWLER & LIVE OVER BALLS HUD ── */}
              <div style={{
                display: "flex",
                flex: 1.1,
                padding: "0 8px",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
                minWidth: "170px"
              }}>
                {/* Bowler Details Card */}
                <div style={{
                  background: "rgba(168, 85, 247, 0.12)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  borderRadius: "10px",
                  padding: "3px 8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: "95px",
                  boxShadow: "0 0 8px rgba(168, 85, 247, 0.1)"
                }}>
                  <span style={{ color: "#ffffff", fontWeight: "900", fontSize: "11px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {scoringState.bowler || "—"}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{ color: "#ec4899", fontWeight: "950", fontSize: "11.5px" }}>
                      {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "8.5px", fontWeight: "700" }}>
                      ({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})
                    </span>
                  </div>
                </div>

                {/* Over Balls Dynamic HUD */}
                <div style={{ display: "flex", gap: "3.5px", alignItems: "center" }}>
                  {(() => {
                    const bpo = match?.ballsPerOver || 6;
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      const isWicket = ball === "W" || ball?.startsWith("W+");
                      const isFour = ball === "4";
                      const isSix = ball === "6";
                      return (
                        <div key={i} style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: ball
                            ? isWicket
                              ? "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)"
                              : isSix
                                ? "linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)"
                                : isFour
                                  ? "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
                                  : "rgba(168,85,247,0.35)"
                            : "rgba(255,255,255,0.04)",
                          border: ball
                            ? (isWicket ? "1.5px solid #ef4444" : isSix ? "1.5px solid #a855f7" : isFour ? "1.5px solid #ec4899" : "1px solid rgba(236,72,153,0.55)")
                            : "1px dashed rgba(236,72,153,0.25)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "8.5px",
                          fontWeight: "950",
                          boxShadow: ball ? (isWicket ? "0 0 8px rgba(239,68,68,0.7)" : isSix ? "0 0 6px rgba(168,85,247,0.6)" : isFour ? "0 0 6px rgba(236,72,153,0.6)" : "0 0 4px rgba(236,72,153,0.25)") : "none"
                        }}>
                          {ball && ball.includes("+") ? renderOutcomeText(ball, 18) : (ball || "•")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── RIGHT BOWLING TEAM SHIELD ── */}
              <div style={{
                background: "linear-gradient(135deg, #3b0764 0%, #1e0338 100%)",
                borderLeft: "1px solid rgba(168, 85, 247, 0.4)",
                padding: "0 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minWidth: "105px",
                clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
                position: "relative",
                flexShrink: 0
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "#ec4899", fontWeight: "950", fontSize: "12px", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    {bowlTeamShort}
                  </span>
                  <span style={{ fontSize: "10px", opacity: 0.9 }}>🏆</span>
                </div>
                <span style={{ color: "#a855f7", fontSize: "7px", fontWeight: "900", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                  BOWLING
                </span>
              </div>
            </div>

            {/* ── LOWER DYNAMIC STATUS & NOTIFICATION MARQUEE ── */}
            <div style={{
              background: activeNotification ? getNotificationStyles(activeNotification).bg : "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)",
              padding: "2.5px 18px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "0 0 14px 14px",
              border: "1.5px solid rgba(236, 72, 153, 0.5)",
              borderTop: "none",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.45), 0 0 12px rgba(236,72,153,0.25)",
              transition: "all 0.3s ease"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff",
                fontSize: "9px",
                fontWeight: "950",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>
                {activeNotification || statusLine}
              </span>
            </div>

          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, rgba(14, 2, 28, 0.98) 0%, rgba(28, 4, 52, 0.98) 100%)", border: "2px solid #ec4899", borderRadius: 18, padding: "28px 44px", textAlign: "center", color: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,0.65), 0 0 25px rgba(236,72,153,0.35)" }}>
            <div style={{ color: "#ec4899", fontWeight: 950, fontSize: "20px", letterSpacing: "2px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#c4b5fd", fontSize: "10.5px", fontWeight: "800", marginTop: "6px", letterSpacing: "2px" }}>ICC T20 WORLD CUP • MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── BBL STAR SPORTS / 14th Theme: Sleek Compact Stadium Broadcast Overlay ──
  if (themeSlug === "bbl-starsports") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const bpo = match.ballsPerOver || 6;
    const rrr = bLeft !== null && bLeft > 0 && need !== null ? ((need / bLeft) * bpo).toFixed(2) : "0.00";
    const crr = calcRR(scoringState);

    const getShortNameLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    const strikerFours = striker?.fours ?? 0;
    const strikerSixes = striker?.sixes ?? 0;

    const bowlerEcon = bowler && bowler.ballsBowled > 0 ? ((bowler.runsConceded / bowler.ballsBowled) * bpo).toFixed(1) : "0.0";

    let statusLine = scoringState.customInputText
      ? scoringState.customInputText.toUpperCase()
      : need !== null
        ? `TARGET: ${scoringState.target}  ·  NEED ${need} RUNS FROM ${bLeft} BALLS  ·  RRR: ${rrr}`
        : `STAR SPORTS BBL ACTION  ·  1ST INNINGS LIVE  ·  CRR: ${crr}`;

    const thisOver = scoringState.thisOver || [];

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 16px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#eab308", padding: "8px 16px", fontSize: 10.5, fontWeight: 900, letterSpacing: 2, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>BBL Star Sports Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "94vw", maxWidth: "1180px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.75))" }}>
            {/* Top Multi-Stop Neon Laser Accent */}
            <div style={{ height: "2.5px", background: "linear-gradient(90deg, #eab308 0%, #cbd5e1 35%, #064e3b 65%, #eab308 100%)", borderRadius: "12px 12px 0 0", boxShadow: "0 0 8px rgba(234,179,8,0.4)" }} />

            {/* Main Broadcast Capsule Bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "46px",
              padding: "4px 8px",
              background: "linear-gradient(135deg, rgba(1,29,22,0.98) 0%, rgba(2,44,34,0.96) 50%, rgba(1,29,22,0.98) 100%)",
              border: "1.5px solid rgba(203,213,225,0.4)",
              borderTop: "none",
              borderRadius: "0 0 3px 3px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 18px rgba(0,0,0,0.5)",
              backdropFilter: "blur(18px)",
              gap: 8
            }}>

              {/* ── LEFT SECTION: Batting Team Capsule + Batsmen Cards ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "1 1 0%", minWidth: 0 }}>

                {/* Star Sports Gold Curved Batting Pill */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #facc15 0%, #eab308 70%, #ca8a04 100%)",
                  padding: "3px 10px 3px 4px",
                  borderRadius: "999px",
                  flexShrink: 0,
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(234,179,8,0.3), inset 0 1px 0 rgba(255,255,255,0.4)"
                }}>
                  <div style={{ position: "relative", display: "inline-flex", borderRadius: "50%", overflow: "hidden", border: "1.5px solid #000000", flexShrink: 0 }}>
                    <TeamLogo
                      name={currentBatTeam}
                      isBatting={true}
                      isBowling={false}
                      accentColor="#000000"
                      borderColor="#000000"
                      size={26}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, lineHeight: 1 }}>
                    <span style={{ color: "#000000", fontWeight: 950, fontSize: "13.5px", letterSpacing: "0.5px" }}>{batTeamShort}</span>
                    <span style={{ background: "rgba(0,0,0,0.18)", color: "#000000", borderRadius: "3px", padding: "1px 4px", fontSize: "7.5px", fontWeight: 950, letterSpacing: "0.5px" }}>BAT</span>
                  </div>
                </div>

                {/* Striker Rounded Card */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(250,204,21,0.3)",
                  borderRadius: "9px",
                  padding: "3px 8px",
                  minWidth: 0,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
                }}>
                  <div style={{ position: "relative", width: 6, height: 6, flexShrink: 0 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#eab308", boxShadow: "0 0 6px #eab308", display: "block" }} />
                    <span className="striker-dot-ring" style={{ width: 9, height: 9, borderColor: "#eab308" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ color: "#fef08a", fontWeight: 900, fontSize: "11px", letterSpacing: "0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scoringState.striker ? scoringState.striker.split(" ").pop() : "STRIKER"}
                      </span>
                      <span style={{ fontSize: "7.5px", color: "#4ade80", fontWeight: 900 }}>*</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                      <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "14.5px", lineHeight: 1 }}>{striker?.runs ?? 0}</span>
                      <span style={{ color: "#94a3b8", fontSize: "9px", fontWeight: 700 }}>({striker?.balls ?? 0})</span>
                      {(strikerFours > 0 || strikerSixes > 0) && (
                        <span style={{ color: "#facc15", background: "rgba(234,179,8,0.18)", borderRadius: "3px", padding: "0 4px", fontSize: "7.5px", fontWeight: 900, marginLeft: 1 }}>{strikerFours}×4 {strikerSixes}×6</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Non-Striker Rounded Card */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "9px",
                  padding: "3px 8px",
                  minWidth: 0,
                  lineHeight: 1.1
                }}>
                  <span style={{ color: "#cbd5e1", fontWeight: 700, fontSize: "10.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {scoringState.nonStriker ? scoringState.nonStriker.split(" ").pop() : "NON-STRIKER"}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "12.5px", lineHeight: 1 }}>{nonStriker?.runs ?? 0}</span>
                    <span style={{ color: "#64748b", fontSize: "8.5px", fontWeight: 700 }}>({nonStriker?.balls ?? 0})</span>
                  </div>
                </div>

              </div>

              {/* ── CENTER COCKPIT: Compact Curved Score Capsule ── */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "175px",
                flexShrink: 0,
                background: "linear-gradient(180deg, #01150f 0%, #022c22 100%)",
                border: "1.5px solid rgba(203,213,225,0.4)",
                borderRadius: "12px",
                padding: "3px 10px",
                boxShadow: "0 3px 10px rgba(0,0,0,0.5), inset 0 0 10px rgba(234,179,8,0.12)",
                position: "relative"
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, lineHeight: 1 }}>
                  <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "22px", letterSpacing: "-0.5px", textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>
                    {scoringState.score}
                  </span>
                  <span style={{ color: "#eab308", fontSize: "16px", fontWeight: 600, opacity: 0.85, margin: "0 1px" }}>-</span>
                  <span style={{ color: "#facc15", fontWeight: 950, fontSize: "19px" }}>
                    {scoringState.wickets}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: "1.5px" }}>
                  <span style={{ background: "rgba(234,179,8,0.18)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: "999px", color: "#eab308", padding: "0 6px", fontSize: "8.5px", fontWeight: 900, letterSpacing: "0.3px" }}>
                    OV: {fmtOv(scoringState.balls, bpo)}/{match.overs}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", color: "#cbd5e1", padding: "0 6px", fontSize: "8.5px", fontWeight: 800 }}>
                    RR {crr}
                  </span>
                </div>
              </div>

              {/* ── RIGHT SECTION: Bowler Card + Over Discs + Bowling Team Capsule ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7, flex: "1 1 0%", minWidth: 0 }}>

                {/* Bowler Rounded Card */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "9px",
                  padding: "3px 8px",
                  minWidth: 0,
                  lineHeight: 1.1,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ color: "#cbd5e1", fontSize: "7.5px", fontWeight: 800, textTransform: "uppercase" }}>BOWL:</span>
                    <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "10.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {scoringState.bowler ? scoringState.bowler.split(" ").pop() : "BOWLER"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ color: "#eab308", fontWeight: 950, fontSize: "13.5px", lineHeight: 1 }}>
                      {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "9px", fontWeight: 700 }}>
                      ({fmtOv(bowler?.ballsBowled ?? 0, bpo)})
                    </span>
                    <span style={{ color: "#4ade80", background: "rgba(74,222,128,0.15)", borderRadius: "3px", padding: "0 3px", fontSize: "7.5px", fontWeight: 900, marginLeft: 1 }}>
                      E:{bowlerEcon}
                    </span>
                  </div>
                </div>

                {/* Over Balls Rounded Strip */}
                <div style={{
                  display: "flex",
                  gap: "2.5px",
                  alignItems: "center",
                  background: "rgba(0,0,0,0.32)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "9px",
                  padding: "3px 5px",
                  flexShrink: 0
                }}>
                  {(() => {
                    const extrasCount = thisOver.filter(isExtraBall).length;
                    const totalCirclesCount = bpo + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, i) => {
                      const ball = thisOver[i];
                      let bg = "rgba(255,255,255,0.06)";
                      let color = "#ffffff";
                      let border = "1px solid rgba(203,213,225,0.25)";
                      let glow = "none";

                      if (ball) {
                        border = "none";
                        if (ball === "W" || ball?.startsWith("W+") || ball === "Wk") {
                          bg = "linear-gradient(135deg, #ef4444, #991b1b)";
                          color = "#ffffff";
                          glow = "0 0 6px rgba(239,68,68,0.6)";
                        } else if (ball === "6" || ball === "6s") {
                          bg = "linear-gradient(135deg, #facc15, #ca8a04)";
                          color = "#000000";
                          glow = "0 0 6px rgba(250,204,21,0.6)";
                        } else if (ball === "4" || ball === "4s") {
                          bg = "linear-gradient(135deg, #38bdf8, #0284c7)";
                          color = "#ffffff";
                          glow = "0 0 5px rgba(56,189,248,0.5)";
                        } else if (isExtraBall(ball)) {
                          bg = "linear-gradient(135deg, #a855f7, #6b21a8)";
                          color = "#ffffff";
                        } else {
                          bg = "rgba(255,255,255,0.18)";
                          color = "#ffffff";
                        }
                      }

                      return (
                        <div
                          key={i}
                          style={{
                            width: "17px",
                            height: "17px",
                            borderRadius: "5px",
                            background: bg,
                            color,
                            border,
                            boxShadow: glow,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: ball && ball.includes("+") ? undefined : (ball && ball.length > 3 ? "5.5px" : (ball && ball.length > 1 ? "7.5px" : "9.5px")),
                            fontWeight: 950,
                            lineHeight: 1,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {renderOutcomeText(ball, 17)}
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Silver/Platinum Curved Bowling Pill */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 70%, #94a3b8 100%)",
                  padding: "3px 4px 3px 10px",
                  borderRadius: "999px",
                  flexShrink: 0,
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(203,213,225,0.2), inset 0 1px 0 rgba(255,255,255,0.5)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, lineHeight: 1 }}>
                    <span style={{ background: "rgba(2,44,34,0.18)", color: "#022c22", borderRadius: "3px", padding: "1px 4px", fontSize: "7.5px", fontWeight: 950, letterSpacing: "0.5px" }}>BOWL</span>
                    <span style={{ color: "#022c22", fontWeight: 950, fontSize: "13.5px", letterSpacing: "0.5px" }}>{bowlTeamShort}</span>
                  </div>
                  <div style={{ position: "relative", display: "inline-flex", borderRadius: "50%", overflow: "hidden", border: "1.5px solid #022c22", flexShrink: 0 }}>
                    <TeamLogo
                      name={currentBowlTeam}
                      isBatting={false}
                      isBowling={true}
                      accentColor="#022c22"
                      borderColor="#022c22"
                      size={26}
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* ── Status / Chase Broadcast Ribbon (Compact Curved Stadium Shape) ── */}
            <div style={{
              background: activeNotification
                ? getNotificationStyles(activeNotification).bg
                : "linear-gradient(90deg, #011d16 0%, #064e3b 25%, #cbd5e1 50%, #064e3b 75%, #011d16 100%)",
              padding: "3.5px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0 0 12px 12px",
              border: "1.5px solid rgba(203,213,225,0.4)",
              borderTop: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 3px 12px rgba(0,0,0,0.4)"
            }}>
              <span style={{
                color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#011d16",
                fontSize: "9.5px",
                fontWeight: 950,
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                textShadow: activeNotification ? "none" : "0 1px 0 rgba(255,255,255,0.4)",
                animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none"
              }}>
                {activeNotification || statusLine}
              </span>
            </div>
          </div>
        ) : (
          /* Match not started card */
          <div className="scale-in" style={{
            position: "relative",
            zIndex: 1,
            background: "linear-gradient(135deg, #011d16 0%, #022c22 60%, #04362a 100%)",
            border: "2px solid rgba(203,213,225,0.6)",
            borderRadius: 18,
            padding: "28px 42px",
            textAlign: "center",
            boxShadow: "0 14px 32px rgba(0,0,0,0.8), 0 0 20px rgba(234,179,8,0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 28, marginBottom: 16 }}>
              <TeamLogo name={match.team1Name} isBatting={false} isBowling={false} accentColor="#eab308" borderColor="#cbd5e1" size={58} />
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #eab308, #ca8a04)",
                color: "#000",
                fontWeight: 950,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(234,179,8,0.5)"
              }}>
                VS
              </div>
              <TeamLogo name={match.team2Name} isBatting={false} isBowling={false} accentColor="#eab308" borderColor="#cbd5e1" size={58} />
            </div>
            <div style={{ color: "#eab308", fontWeight: 950, fontSize: "18px", letterSpacing: "1px" }}>
              {match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#cbd5e1", fontSize: "10px", fontWeight: 800, marginTop: "6px", letterSpacing: "2px" }}>
              BBL STAR SPORTS LIVE BROADCAST · MATCH NOT STARTED
            </div>
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
