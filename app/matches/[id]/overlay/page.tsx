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
  "asia-cup": { name: "Asia Cup", primaryBg: "rgba(20,34,72,0.98)", secondaryBg: "rgba(12,21,45,0.95)", accent: "#E58808", accentText: "#FDFDFE", textPrimary: "#FDFDFE", textSecondary: "#cbd5e1", scoreBg: "rgba(229,136,8,0.18)", scoreText: "#E58808", borderColor: "#E58808", headerBg: "rgba(12,21,45,0.99)", ballColors: { runs: "#142248", four: "#E58808", six: "#f59e0b", wicket: "#dc2626", extra: "#7c3aed" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "cwc-19": { name: "CWC 19", primaryBg: "rgba(7,21,43,0.98)", secondaryBg: "rgba(10,30,60,0.95)", accent: "#02B3E4", accentText: "#FFFFFF", textPrimary: "#ffffff", textSecondary: "#bae6fd", scoreBg: "rgba(2,179,228,0.18)", scoreText: "#02B3E4", borderColor: "#02B3E4", headerBg: "rgba(7,21,43,0.99)", ballColors: { runs: "#07152B", four: "#02B3E4", six: "#38bdf8", wicket: "#DC2626", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "champions-trophy-2025": { name: "Champions Trophy 2025", primaryBg: "rgba(10,18,42,0.98)", secondaryBg: "rgba(15,28,64,0.95)", accent: "#03A360", accentText: "#FFFFFF", textPrimary: "#ffffff", textSecondary: "#a7f3d0", scoreBg: "rgba(3,163,96,0.18)", scoreText: "#03A360", borderColor: "#03A360", headerBg: "rgba(10,18,42,0.99)", ballColors: { runs: "#0A122A", four: "#03A360", six: "#34d399", wicket: "#ef4444", extra: "#c084fc" }, bgUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=1920&auto=format&fit=crop" },
  "cwc-25-india": { name: "CWC 25 India", primaryBg: "rgba(20,18,42,0.98)", secondaryBg: "rgba(12,10,28,0.95)", accent: "#0373AF", accentText: "#FFFFFF", textPrimary: "#FFFFFF", textSecondary: "#cbd5e1", scoreBg: "rgba(3,115,175,0.18)", scoreText: "#0373AF", borderColor: "#0373AF", headerBg: "rgba(12,10,28,0.99)", ballColors: { runs: "#14122A", four: "#0373AF", six: "#0284c7", wicket: "#dc2626", extra: "#7c3aed" }, bgUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop" },
  "wcl-fancode": { name: "WCL (Fancode)", primaryBg: "rgba(31,41,55,0.98)", secondaryBg: "rgba(17,24,39,0.95)", accent: "#0284C7", accentText: "#FFFFFF", textPrimary: "#ffffff", textSecondary: "#bae6fd", scoreBg: "rgba(2,132,199,0.18)", scoreText: "#0284C7", borderColor: "#0284C7", headerBg: "rgba(17,24,39,0.99)", ballColors: { runs: "#1F2937", four: "#0284C7", six: "#38bdf8", wicket: "#ef4444", extra: "#c084fc" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "cwc-23-india": { name: "CWC 23 India", primaryBg: "rgba(8,7,33,0.98)", secondaryBg: "rgba(5,4,20,0.95)", accent: "#D946EF", accentText: "#FFFFFF", textPrimary: "#FFFFFF", textSecondary: "#f5d0fe", scoreBg: "rgba(217,70,239,0.18)", scoreText: "#D946EF", borderColor: "#D946EF", headerBg: "rgba(8,7,33,0.99)", ballColors: { runs: "#080721", four: "#D946EF", six: "#e879f9", wicket: "#dc2626", extra: "#7c3aed" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "bbl-black": { name: "BBL Black", primaryBg: "rgba(34,9,90,0.98)", secondaryBg: "rgba(22,5,59,0.95)", accent: "#ec4899", accentText: "#FDFDFE", textPrimary: "#FDFDFE", textSecondary: "#fbcfe8", scoreBg: "rgba(236,72,153,0.18)", scoreText: "#ec4899", borderColor: "#ec4899", headerBg: "rgba(22,5,59,0.99)", ballColors: { runs: "#22095A", four: "#ec4899", six: "#a855f7", wicket: "#ef4444", extra: "#06b6d4" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "cricfusion": { name: "CricFusion Theme", primaryBg: "rgba(18,4,6,0.98)", secondaryBg: "rgba(30,8,11,0.95)", accent: "#CC271F", accentText: "#FFFFFF", textPrimary: "#ffffff", textSecondary: "#fecaca", scoreBg: "rgba(204,39,31,0.18)", scoreText: "#CC271F", borderColor: "#CC271F", headerBg: "rgba(18,4,6,0.99)", ballColors: { runs: "#120406", four: "#CC271F", six: "#ef4444", wicket: "#dc2626", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop" },
  "t20-emerging-asia-cup": { name: "T20 Emerging Asia Cup 2024", primaryBg: "rgba(12,37,96,0.98)", secondaryBg: "rgba(120,16,16,0.95)", accent: "#facc15", accentText: "#FFFFFF", textPrimary: "#ffffff", textSecondary: "#e2e8f0", scoreBg: "rgba(250,204,21,0.18)", scoreText: "#facc15", borderColor: "#16469d", headerBg: "rgba(12,37,96,0.99)", ballColors: { runs: "#16469d", four: "#f59e0b", six: "#3b82f6", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "sa20": { name: "SA20", primaryBg: "rgba(23,23,5,0.98)", secondaryBg: "rgba(35,35,10,0.95)", accent: "#EBB509", accentText: "#171705", textPrimary: "#FFFFFF", textSecondary: "#fef9c3", scoreBg: "rgba(235,181,9,0.18)", scoreText: "#EBB509", borderColor: "#EBB509", headerBg: "rgba(23,23,5,0.99)", ballColors: { runs: "#171705", four: "#EBB509", six: "#fde047", wicket: "#ef4444", extra: "#a78bfa" }, bgUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=1920&auto=format&fit=crop" },
  "jiocinema": { name: "Jio Cinema", primaryBg: "rgba(13,19,34,0.98)", secondaryBg: "rgba(20,28,48,0.95)", accent: "#FDFEFE", accentText: "#0D1322", textPrimary: "#FDFEFE", textSecondary: "#cbd5e1", scoreBg: "rgba(253,254,254,0.18)", scoreText: "#FDFEFE", borderColor: "#FDFEFE", headerBg: "rgba(13,19,34,0.99)", ballColors: { runs: "#0D1322", four: "#FDFEFE", six: "#38bdf8", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop" },
  "ipl": { name: "IPL", primaryBg: "rgba(10,17,46,0.98)", secondaryBg: "rgba(6,11,30,0.95)", accent: "#F3A714", accentText: "#FFFFFF", textPrimary: "#FFFFFF", textSecondary: "#cbd5e1", scoreBg: "rgba(243,167,20,0.18)", scoreText: "#F3A714", borderColor: "#F3A714", headerBg: "rgba(6,11,30,0.99)", ballColors: { runs: "#0A112E", four: "#F3A714", six: "#f59e0b", wicket: "#ef4444", extra: "#c084fc" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "wt20-2024": { name: "WT20 2024", primaryBg: "rgba(20,18,42,0.98)", secondaryBg: "rgba(12,10,28,0.95)", accent: "#0373AF", accentText: "#FFFFFF", textPrimary: "#FFFFFF", textSecondary: "#cbd5e1", scoreBg: "rgba(3,115,175,0.18)", scoreText: "#0373AF", borderColor: "#0373AF", headerBg: "rgba(12,10,28,0.99)", ballColors: { runs: "#14122A", four: "#0373AF", six: "#0284c7", wicket: "#dc2626", extra: "#7c3aed" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
  "bbl-starsports": { name: "BBL Star Sports", primaryBg: "rgba(0,18,72,0.98)", secondaryBg: "rgba(0,31,112,0.92)", accent: "#00a0e9", accentText: "#00a0e9", textPrimary: "#ffffff", textSecondary: "#bae6fd", scoreBg: "rgba(0,160,233,0.15)", scoreText: "#ffffff", borderColor: "#00a0e9", headerBg: "rgba(0,10,38,0.99)", ballColors: { runs: "#0284c7", four: "#facc15", six: "#f97316", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=1920&auto=format&fit=crop" },
  "ipl-2025": { name: "IPL 2025", primaryBg: "rgba(11,11,11,0.98)", secondaryBg: "rgba(18,18,18,0.92)", accent: "#c8e63c", accentText: "#c8e63c", textPrimary: "#ffffff", textSecondary: "#d4d4d8", scoreBg: "linear-gradient(135deg, rgba(200,230,60,0.18), rgba(0, 0, 0, 0.5))", scoreText: "#c8e63c", borderColor: "#c8e63c", headerBg: "rgba(8,8,8,0.99)", ballColors: { runs: "rgba(255,255,255,0.2)", four: "#3b82f6", six: "#c8e63c", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop" },
  "crioverlay-green": { name: "CriOverlay Green", primaryBg: "rgba(9,17,32,0.98)", secondaryBg: "rgba(15,28,52,0.95)", accent: "#74FB05", accentText: "#FFFFFF", textPrimary: "#ffffff", textSecondary: "#bbf7d0", scoreBg: "rgba(116,251,5,0.18)", scoreText: "#74FB05", borderColor: "#74FB05", headerBg: "rgba(9,17,32,0.99)", ballColors: { runs: "#091120", four: "#74FB05", six: "#86efac", wicket: "#ef4444", extra: "#c084fc" }, bgUrl: "" },
  "starsports-t20": { name: "Star Sports T20", primaryBg: "rgba(24,30,48,0.98)", secondaryBg: "rgba(15,20,35,0.95)", accent: "#facc15", accentText: "#000000", textPrimary: "#ffffff", textSecondary: "#e2e8f0", scoreBg: "rgba(2,132,199,0.22)", scoreText: "#ffffff", borderColor: "#0284c7", headerBg: "rgba(15,20,35,0.99)", ballColors: { runs: "#1e2a42", four: "#facc15", six: "#0284c7", wicket: "#ef4444", extra: "#a855f7" }, bgUrl: "https://images.unsplash.com/photo-1540747737956-3787293ac287?q=80&w=1920&auto=format&fit=crop" },
};
const DEFAULT_THEME = THEME_MAP["ipl"];
const THEME_FONTS: Record<string, string> = {
  "asia-cup": "'Outfit', Arial, sans-serif", "cwc-19": "'Space Grotesk', sans-serif",
  "champions-trophy-2025": "'Space Grotesk', sans-serif", "cwc-25-india": "'Outfit', sans-serif",
  "wcl-fancode": "'Outfit', sans-serif", "cwc-23-india": "'Outfit', Arial, sans-serif",
  "bbl-black": "'Outfit', Arial, sans-serif", "cricfusion": "'Outfit', sans-serif",
  "t20-emerging-asia-cup": "'Outfit', Arial, sans-serif", "sa20": "'Rubik', sans-serif",
  "jiocinema": "'Rubik', sans-serif", "ipl": "'Outfit', sans-serif",
  "wt20-2024": "'Outfit', Arial, sans-serif", "bbl-starsports": "'Outfit', Arial, sans-serif",
  "ipl-2025": "'Outfit', sans-serif", "crioverlay-green": "'Outfit', sans-serif",
  "starsports-t20": "'Outfit', Arial, sans-serif",
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
    bg: "#0A112E",
    border: "2px solid #F3A714",
    borderLeft: "5px solid #F3A714",
    accent: "#F3A714",
    accentText: "#FFFFFF",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(243, 167, 20, 0.35)",
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
    bg: "#0D1322",
    border: "2px solid #FDFEFE",
    borderLeft: "5px solid #FDFEFE",
    accent: "#FDFEFE",
    accentText: "#0D1322",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(13, 19, 34, 0.6)",
    radius: "12px",
    font: "'Outfit', sans-serif"
  },
  "geo-cinema": {
    bg: "#0D1322",
    border: "2px solid #FDFEFE",
    borderLeft: "5px solid #FDFEFE",
    accent: "#FDFEFE",
    accentText: "#0D1322",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(13, 19, 34, 0.6)",
    radius: "12px",
    font: "'Outfit', sans-serif"
  },
  "champions-trophy-2025": {
    bg: "#0A122A",
    border: "2px solid #03A360",
    borderLeft: "5px solid #03A360",
    accent: "#03A360",
    accentText: "#FFFFFF",
    textSecondary: "#a7f3d0",
    shadow: "0 8px 32px rgba(3, 163, 96, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "cricfusion": {
    bg: "#120406",
    border: "2px solid #CC271F",
    borderLeft: "5px solid #CC271F",
    accent: "#CC271F",
    accentText: "#FFFFFF",
    textSecondary: "#fecaca",
    shadow: "0 8px 32px rgba(204, 39, 31, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "wcl-fancode": {
    bg: "#1F2937",
    border: "2px solid #0284C7",
    borderLeft: "5px solid #0284C7",
    accent: "#0284C7",
    accentText: "#FFFFFF",
    textSecondary: "#bae6fd",
    shadow: "0 8px 32px rgba(2, 132, 199, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "bbl-black": {
    bg: "#22095A",
    border: "2px solid #ec4899",
    borderLeft: "5px solid #ec4899",
    accent: "#ec4899",
    accentText: "#FDFDFE",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(236, 72, 153, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "wt20-2024": {
    bg: "#14122A",
    border: "2px solid #0373AF",
    borderLeft: "5px solid #0373AF",
    accent: "#0373AF",
    accentText: "#FFFFFF",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(3, 115, 175, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "sa20": {
    bg: "#171705",
    border: "2px solid #EBB509",
    borderLeft: "5px solid #EBB509",
    accent: "#EBB509",
    accentText: "#171705",
    textSecondary: "#fef9c3",
    shadow: "0 8px 32px rgba(235, 181, 9, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "t20-emerging-asia-cup": {
    bg: "#0C2560",
    border: "2px solid #781010",
    borderLeft: "5px solid #781010",
    accent: "#781010",
    accentText: "#FFFFFF",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(120, 16, 16, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "asia-cup": {
    bg: "#142248",
    border: "2px solid #E58808",
    borderLeft: "5px solid #E58808",
    accent: "#E58808",
    accentText: "#FDFDFE",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(229, 136, 8, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "cwc-19": {
    bg: "#07152B",
    border: "2px solid #02B3E4",
    borderLeft: "5px solid #DC2626",
    accent: "#02B3E4",
    accentText: "#FFFFFF",
    textSecondary: "#bae6fd",
    shadow: "0 8px 32px rgba(2, 179, 228, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "cwc-23-india": {
    bg: "#080721",
    border: "2px solid #D946EF",
    borderLeft: "5px solid #D946EF",
    accent: "#D946EF",
    accentText: "#FFFFFF",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(217, 70, 239, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
  },
  "cwc-25-india": {
    bg: "#14122A",
    border: "2px solid #0373AF",
    borderLeft: "5px solid #0373AF",
    accent: "#0373AF",
    accentText: "#FFFFFF",
    textSecondary: "#cbd5e1",
    shadow: "0 8px 32px rgba(3, 115, 175, 0.35)",
    radius: "14px",
    font: "'Outfit', sans-serif"
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
    bg: "#091120",
    border: "2px solid #74FB05",
    borderLeft: "5px solid #74FB05",
    accent: "#74FB05",
    accentText: "#FFFFFF",
    textSecondary: "#bbf7d0",
    shadow: "0 8px 32px rgba(116, 251, 5, 0.4)",
    radius: "14px",
    font: "'Outfit', sans-serif"
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
  @keyframes scoreboardSweepIn {
    0% { transform: translateX(-100%); opacity: 0; }
    60% { transform: translateX(2%); opacity: 1; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes marqueeScrollLTR {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0%); }
  }
  @keyframes sweepShimmer {
    0% { transform: translateX(-150%) skewX(-25deg); }
    100% { transform: translateX(250%) skewX(-25deg); }
  }
  @keyframes bannerTextPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
  .slide-up {
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    zoom: 1.48 !important;
    width: 67vw !important;
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
  playersTeam1: ["Virat Kohli (c)", "Rohit Sharma", "Shubman Gill", "Suryakumar Yadav", "KL Rahul", "Hardik Pandya", "Ravindra Jadeja", "Axar Patel", "Kuldeep Yadav", "Jasprit Bumrah", "Mohammed Siraj"],
  playersTeam2: ["Pat Cummins (c)", "David Warner", "Travis Head", "Mitchell Marsh", "Steve Smith", "Glenn Maxwell", "Josh Inglis", "Marcus Stoinis", "Mitchell Starc", "Adam Zampa", "Josh Hazlewood"],
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
      const interval = setInterval(fetchMatch, 1000);
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

  // Manage animation overlays client-side
  useEffect(() => {
    const anim = match?.scoringState?.animation;
    if (anim) {
      if (anim !== "INNINGS BREAK") {
        setCurrentAnim(anim);
        const duration = anim === "TOUR BOUNDARIES" ? 5000 : 3500;
        const timer = setTimeout(() => {
          setCurrentAnim(null);
        }, duration);
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

  // ── B1M / B2M: compact lower-third batter panel — current match stats only ──
  const isBatterMatchPanel = scoringState.displayScreen && (scoringState.displayScreen.toUpperCase() === "B1M" || scoringState.displayScreen.toUpperCase() === "B2M");
  const batterMatchIsStriker = scoringState.displayScreen?.toUpperCase() === "B1M";
  const batterMatchPlayer = isBatterMatchPanel
    ? (batterMatchIsStriker ? scoringState.striker : scoringState.nonStriker)
    : null;
  const batterMatchLiveBatter = batterMatchPlayer
    ? scoringState.batsmen?.find((b: any) => b.name?.trim().toLowerCase() === batterMatchPlayer?.trim().toLowerCase())
    : null;


  const renderBatterStatsPanel = () => {
    const renderBatterContent = () => {
      if (!isBatterPanel || !batterPanelPlayer) return null;
      // Use real stats if available; fall back to zeros for a player who hasn't batted yet
      const stats = batterPanelStats ?? { runs: 0, avg: "—", sr: "—", hs: "—", fours: 0, sixes: 0, wickets: 0, economy: "—", best: "—", matches: 0 };

      if (themeSlug === "crioverlay-green" || themeSlug === "wcl-fancode" || themeSlug === "cwc-19" || themeSlug === "champions-trophy-2025" || themeSlug === "cricfusion" || themeSlug === "sa20" || themeSlug === "jiocinema" || themeSlug === "geo-cinema" || themeSlug === "bbl-starsports" || themeSlug === "asia-cup" || themeSlug === "t20-emerging-asia-cup" || themeSlug === "cwc-25-india" || themeSlug === "wt20-2024" || themeSlug === "cwc-23-india" || themeSlug === "bbl-black" || themeSlug === "ipl" || themeSlug === "ipl-2025" || themeSlug === "starsports-t20") {
        const matchesCount = stats.matches > 0 ? stats.matches : 1;
        const runsVal = stats.runs ?? 0;
        const foursVal = stats.fours ?? 0;
        const sixesVal = stats.sixes ?? 0;
        const srVal = stats.sr !== "—" ? stats.sr : "0.00";
        const bestVal = stats.hs ?? "—";
        const teamNameVal = currentBatTeam;

        const isCri = themeSlug === "crioverlay-green";
        const isWcl = themeSlug === "wcl-fancode";
        const isCwc19 = themeSlug === "cwc-19";
        const isCt25 = themeSlug === "champions-trophy-2025";
        const isFusion = themeSlug === "cricfusion";
        const isSa20 = themeSlug === "sa20";
        const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
        const isEac = themeSlug === "t20-emerging-asia-cup";
        const isAsia = themeSlug === "asia-cup";
        const isCwc = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
        const isCwc23 = themeSlug === "cwc-23-india";
        const isBblBlack = themeSlug === "bbl-black";
        const isIpl = themeSlug === "ipl";
        const isIpl25 = themeSlug === "ipl-2025";
        const isStarT20 = themeSlug === "starsports-t20";

        const panelBg = isCri ? "#091120" : isWcl ? "#1F2937" : isCwc19 ? "#07152B" : isCt25 ? "#0A122A" : isFusion ? "#120406" : isSa20 ? "#171705" : isGeo ? "#0D1322" : isEac ? "#0C2560" : isIpl ? "#0A112E" : isIpl25 ? "#0c1322" : isStarT20 ? "#18212f" : isBblBlack ? "#22095A" : isCwc23 ? "#080721" : isCwc ? "#14122A" : isAsia ? "#142248" : "#00a0e9";
        const panelBorder = isCri ? "1.5px solid #74FB05" : isWcl ? "1.5px solid #0284C7" : isCwc19 ? "1.5px solid #02B3E4" : isCt25 ? "1.5px solid #03A360" : isFusion ? "1.5px solid #CC271F" : isSa20 ? "1.5px solid #EBB509" : isGeo ? "1.5px solid #FDFEFE" : isEac ? "1.5px solid #781010" : isIpl ? "1.5px solid #F3A714" : isIpl25 ? "1.5px solid #c8e63c" : isStarT20 ? "1.5px solid #0284c7" : isBblBlack ? "1.5px solid #ec4899" : isCwc23 ? "1.5px solid #D946EF" : isCwc ? "1.5px solid #0373AF" : isAsia ? "1.5px solid #E58808" : "1px solid rgba(0, 160, 233, 0.4)";
        const headerTextColor = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#facc15" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#001248";
        const nameTextColor = (isAsia || isCwc || isCwc23 || isBblBlack || isIpl || isIpl25 || isStarT20 || isEac || isGeo || isSa20 || isFusion || isCt25 || isCwc19 || isWcl || isCri) ? "#FFFFFF" : "#000000";
        const batFill = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#0284c7" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#ffffff";
        const ribbonBg = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#DC2626" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#0284c7" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#e60000";
        const ribbonTextColor = isCri ? "#091120" : isIpl25 ? "#091120" : (isWcl || isCwc19 || isCt25 || isFusion || isEac || isBblBlack || isCwc23 || isCwc || isStarT20) ? "#FFFFFF" : isSa20 ? "#171705" : isGeo ? "#0D1322" : isIpl ? "#0A112E" : isAsia ? "#142248" : "#ffffff";
        const rowBorder = isCri ? "2px solid #74FB05" : isWcl ? "2px solid #0284C7" : isCwc19 ? "2px solid #02B3E4" : isCt25 ? "2px solid #03A360" : isFusion ? "2px solid #CC271F" : isSa20 ? "2px solid #EBB509" : isGeo ? "2px solid #FDFEFE" : isEac ? "2px solid #781010" : isIpl ? "2px solid #F3A714" : isIpl25 ? "2px solid #c8e63c" : isStarT20 ? "2px solid #0284c7" : isBblBlack ? "2px solid #ec4899" : isCwc23 ? "2px solid #D946EF" : isCwc ? "2px solid #0373AF" : isAsia ? "2px solid #E58808" : "2px solid #00a0e9";
        const labelTextColor = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#facc15" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#000000";
        const valBoxBg = "#FFFFFF";
        const valTextColor = isCri ? "#091120" : isWcl ? "#1F2937" : isCwc19 ? "#07152B" : isCt25 ? "#0A122A" : isFusion ? "#CC271F" : isSa20 ? "#171705" : isGeo ? "#0D1322" : isEac ? "#0C2560" : isIpl ? "#0A112E" : isIpl25 ? "#091120" : isStarT20 ? "#18212f" : isBblBlack ? "#22095A" : isCwc23 ? "#080721" : isCwc ? "#14122A" : isAsia ? "#142248" : "#000000";

        return (
          <div
            className="animate-slide-up"
            style={{
              position: "fixed",
              left: 28,
              bottom: "128px",
              zIndex: 90,
              width: 390,
              background: panelBg,
              borderRadius: "4px",
              boxShadow: isAsia ? "0 16px 36px rgba(0,0,0,0.9), 0 0 16px rgba(229,136,8,0.25)" : "0 16px 36px rgba(0,0,0,0.85)",
              fontFamily: "'Outfit', Arial, sans-serif",
              overflow: "hidden",
              border: panelBorder
            }}
          >
            {/* 1. Header: THIS TOURNAMENT */}
            <div style={{
              textAlign: "center",
              padding: "10px 0 2px",
              color: headerTextColor,
              fontSize: "11px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              THIS TOURNAMENT
            </div>

            {/* 2. Player Name with White Cricket Bat Icon */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "2px 14px 10px"
            }}>
              {/* Cricket Bat Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(-35deg)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
                <path d="M19.5 2.5L21.5 4.5L13.5 12.5L11.5 10.5L19.5 2.5Z" fill={batFill} />
                <path d="M11.5 10.5L13.5 12.5L5.5 20.5C4.5 21.5 3 21.5 2 20.5C1 19.5 1 18 2 17L10 9L11.5 10.5Z" fill={batFill} />
                <rect x="18" y="1" width="3" height="7" rx="1.5" transform="rotate(45 18 1)" fill={batFill} />
              </svg>

              <span style={{
                color: nameTextColor,
                fontSize: "24px",
                fontWeight: 950,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                lineHeight: 1.1
              }}>
                {batterPanelPlayer.toUpperCase()}
              </span>
            </div>

            {/* 3. Team Ribbon */}
            <div style={{
              background: ribbonBg,
              color: ribbonTextColor,
              padding: "4px 0",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 950,
              letterSpacing: "0.8px",
              textTransform: "uppercase"
            }}>
              ({teamNameVal})
            </div>

            {/* 4. Stats Rows Table */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { label: "MATCHES", val: matchesCount },
                { label: "RUNS", val: runsVal },
                { label: "FOURS", val: foursVal },
                { label: "SIXES", val: sixesVal },
                { label: "STRIKE RATE", val: srVal },
                { label: "BEST", val: bestVal },
              ].map((row, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    height: "36px",
                    borderTop: rowBorder
                  }}
                >
                  {/* Left Label */}
                  <div style={{
                    width: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: labelTextColor,
                    fontWeight: 950,
                    fontSize: "14px",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase"
                  }}>
                    {row.label}
                  </div>

                  {/* Right Value Box */}
                  <div style={{
                    width: "50%",
                    background: valBoxBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: valTextColor,
                    fontWeight: 950,
                    fontSize: "17px",
                    letterSpacing: "0.4px"
                  }}>
                    {row.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (themeSlug === "ipl-2025") {
        return (
          <div
            className="animate-slide-up"
            style={{
              position: "fixed",
              left: 24,
              bottom: 90,
              zIndex: 70,
              width: 380,
              height: 280,
              background: "linear-gradient(135deg, rgba(8, 28, 12, 0.96) 0%, rgba(3, 10, 24, 0.98) 100%)",
              border: "2px solid #a3e635",
              borderTop: "5px solid #a3e635",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 0 20px rgba(163, 230, 53, 0.25)",
              fontFamily: "'Outfit', 'Segoe UI', sans-serif",
              display: "flex"
            }}
          >
            {/* Left Half: Green watermarked block with player avatar & name */}
            <div style={{
              width: "160px",
              background: "linear-gradient(180deg, #3ea30e 0%, #297a08 50%, #1e5a06 100%)",
              borderRadius: "13px 0 0 13px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 8px 10px"
            }}>
              {/* Floral watermarks */}
              <svg style={{ position: "absolute", width: "130px", height: "130px", opacity: 0.25, color: "#ffffff", left: "-25px", top: "-15px", pointerEvents: "none" }} viewBox="0 0 100 100">
                <path d="M50 5 C55 25 75 45 95 50 C75 55 55 75 50 95 C45 75 25 55 5 50 C25 45 45 25 50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <svg style={{ position: "absolute", width: "130px", height: "130px", opacity: 0.25, color: "#ffffff", right: "-25px", bottom: "-15px", pointerEvents: "none" }} viewBox="0 0 100 100">
                <path d="M50 5 C55 25 75 45 95 50 C75 55 55 75 50 95 C45 75 25 55 5 50 C25 45 45 25 50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>

              <div style={{
                background: "rgba(0,0,0,0.35)",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "8.5px",
                fontWeight: 950,
                color: "#ffffff",
                letterSpacing: "1px",
                textTransform: "uppercase",
                position: "relative",
                zIndex: 2
              }}>
                {batterPanelLabel}
              </div>

              <div style={{ position: "relative", zIndex: 2, padding: "10px 0" }}>
                <svg style={{ width: "64px", height: "64px", color: "#ffffff", opacity: 0.8 }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              <div style={{
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 950,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                textAlign: "center",
                position: "relative",
                zIndex: 2,
                lineHeight: 1.1,
                textShadow: "0 2px 6px rgba(0,0,0,0.7)"
              }}>
                {batterPanelPlayer.toUpperCase()}
              </div>
            </div>

            {/* Right Half: 4 Stat Pills */}
            <div style={{
              flex: 1,
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "6px"
            }}>
              {/* 1. Matches */}
              <div style={{
                background: "linear-gradient(135deg, rgba(20, 28, 12, 0.95), rgba(45, 55, 15, 0.9))",
                border: "1px solid rgba(163, 230, 53, 0.3)",
                borderRadius: "9px",
                padding: "4px 10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
              }}>
                <div style={{ fontSize: "8.5px", color: "#d4d4d8", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                  MATCHES
                </div>
                <div style={{ fontSize: "20px", fontWeight: 950, color: "#ffffff", lineHeight: 1.1 }}>
                  {stats.matches}
                </div>
              </div>

              {/* 2. Runs (Solid Neon Lime Pill) */}
              <div style={{
                background: "linear-gradient(90deg, #a3e635 0%, #bef264 100%)",
                borderRadius: "9px",
                padding: "4px 10px",
                boxShadow: "0 4px 12px rgba(163, 230, 53, 0.35)"
              }}>
                <div style={{ fontSize: "8.5px", color: "#030a24", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
                  RUNS
                </div>
                <div style={{ fontSize: "22px", fontWeight: 950, color: "#030a24", lineHeight: 1.1 }}>
                  {stats.runs}
                </div>
              </div>

              {/* 3. Strike Rate */}
              <div style={{
                background: "linear-gradient(135deg, rgba(20, 28, 12, 0.95), rgba(45, 55, 15, 0.9))",
                border: "1px solid rgba(163, 230, 53, 0.3)",
                borderRadius: "9px",
                padding: "4px 10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
              }}>
                <div style={{ fontSize: "8.5px", color: "#d4d4d8", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                  STRIKE RATE
                </div>
                <div style={{ fontSize: "20px", fontWeight: 950, color: "#ffffff", lineHeight: 1.1 }}>
                  {stats.sr}
                </div>
              </div>

              {/* 4. 50s/100s */}
              <div style={{
                background: "linear-gradient(135deg, rgba(20, 28, 12, 0.95), rgba(45, 55, 15, 0.9))",
                border: "1px solid rgba(163, 230, 53, 0.3)",
                borderRadius: "9px",
                padding: "4px 10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
              }}>
                <div style={{ fontSize: "8.5px", color: "#d4d4d8", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                  50S/100S
                </div>
                <div style={{ fontSize: "20px", fontWeight: 950, color: "#ffffff", lineHeight: 1.1 }}>
                  {(stats as any).fifties ?? 0}/{(stats as any).hundreds ?? 0}
                </div>
              </div>
            </div>
          </div>
        );
      }

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
      </>
    );
  };

  const renderBowlerStatsPanel = () => {
    if (!isBowlerPanel || !bowlerPanelPlayer) return null;
    // Use real stats if available; fall back to zeros/defaults for a bowler with no stats yet
    const stats = bowlerPanelStats ?? { wickets: 0, economy: "—", bowlAvg: "—", bowlSr: "—", best: "—", runsConceded: 0, matches: 0 };

    if (themeSlug === "crioverlay-green" || themeSlug === "wcl-fancode" || themeSlug === "cwc-19" || themeSlug === "champions-trophy-2025" || themeSlug === "cricfusion" || themeSlug === "sa20" || themeSlug === "jiocinema" || themeSlug === "geo-cinema" || themeSlug === "bbl-starsports" || themeSlug === "asia-cup" || themeSlug === "t20-emerging-asia-cup" || themeSlug === "cwc-25-india" || themeSlug === "wt20-2024" || themeSlug === "cwc-23-india" || themeSlug === "bbl-black" || themeSlug === "ipl" || themeSlug === "ipl-2025" || themeSlug === "starsports-t20") {
      const liveBowler = scoringState.bowlers?.find(b => b.name?.trim().toLowerCase() === bowlerPanelPlayer?.trim().toLowerCase());
      const bpo = match.ballsPerOver || 6;
      const matchesCount = stats.matches > 0 ? stats.matches : 1;
      const wicketsVal = liveBowler?.wickets ?? stats.wickets ?? 0;
      const ballsBowledVal = liveBowler?.ballsBowled ?? (stats as any).ballsBowled ?? 0;
      const oversVal = fmtOv(ballsBowledVal, bpo);
      const runsConcVal = liveBowler?.runsConceded ?? (stats as any).runsConceded ?? 0;
      const ecoVal = ballsBowledVal > 0 ? ((runsConcVal / ballsBowledVal) * bpo).toFixed(2) : (stats.economy !== "—" ? stats.economy : "0.00");
      const bestVal = `${wicketsVal} - ${runsConcVal} (${Math.floor(ballsBowledVal / bpo)})`;
      const teamNameVal = currentBowlTeam;

      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsia = themeSlug === "asia-cup";
      const isCwc = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const isIpl25 = themeSlug === "ipl-2025";
      const isStarT20 = themeSlug === "starsports-t20";

      const panelBg = isCri ? "#091120" : isWcl ? "#1F2937" : isCwc19 ? "#07152B" : isCt25 ? "#0A122A" : isFusion ? "#120406" : isSa20 ? "#171705" : isGeo ? "#0D1322" : isEac ? "#0C2560" : isIpl ? "#0A112E" : isIpl25 ? "#0c1322" : isStarT20 ? "#18212f" : isBblBlack ? "#22095A" : isCwc23 ? "#080721" : isCwc ? "#14122A" : isAsia ? "#142248" : "#ffc72c";
      const panelBorder = isCri ? "1.5px solid #74FB05" : isWcl ? "1.5px solid #0284C7" : isCwc19 ? "1.5px solid #02B3E4" : isCt25 ? "1.5px solid #03A360" : isFusion ? "1.5px solid #CC271F" : isSa20 ? "1.5px solid #EBB509" : isGeo ? "1.5px solid #FDFEFE" : isEac ? "1.5px solid #781010" : isIpl ? "1.5px solid #F3A714" : isIpl25 ? "1.5px solid #c8e63c" : isStarT20 ? "1.5px solid #0284c7" : isBblBlack ? "1.5px solid #ec4899" : isCwc23 ? "1.5px solid #D946EF" : isCwc ? "1.5px solid #0373AF" : isAsia ? "1.5px solid #E58808" : "1px solid rgba(255, 199, 44, 0.4)";
      const headerTextColor = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#facc15" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#000000";
      const nameTextColor = (isAsia || isCwc || isCwc23 || isBblBlack || isIpl || isIpl25 || isStarT20 || isEac || isGeo || isSa20 || isFusion || isCt25 || isCwc19 || isWcl || isCri) ? "#FFFFFF" : "#000000";
      const ballStroke = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#0284c7" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#000000";
      const ribbonBg = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#DC2626" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#0284c7" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#e60000";
      const ribbonTextColor = isCri ? "#091120" : isIpl25 ? "#091120" : (isWcl || isCwc19 || isCt25 || isFusion || isEac || isBblBlack || isCwc23 || isCwc || isStarT20) ? "#FFFFFF" : isSa20 ? "#171705" : isGeo ? "#0D1322" : isIpl ? "#0A112E" : isAsia ? "#142248" : "#ffffff";
      const rowBorder = isCri ? "2px solid #74FB05" : isWcl ? "2px solid #0284C7" : isCwc19 ? "2px solid #02B3E4" : isCt25 ? "2px solid #03A360" : isFusion ? "2px solid #CC271F" : isSa20 ? "2px solid #EBB509" : isGeo ? "2px solid #FDFEFE" : isEac ? "2px solid #781010" : isIpl ? "2px solid #F3A714" : isIpl25 ? "2px solid #c8e63c" : isStarT20 ? "2px solid #0284c7" : isBblBlack ? "2px solid #ec4899" : isCwc23 ? "2px solid #D946EF" : isCwc ? "2px solid #0373AF" : isAsia ? "2px solid #E58808" : "2px solid #ffc72c";
      const labelTextColor = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#facc15" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc ? "#0373AF" : isAsia ? "#E58808" : "#000000";
      const valBoxBg = "#FFFFFF";
      const valTextColor = isCri ? "#091120" : isWcl ? "#1F2937" : isCwc19 ? "#07152B" : isCt25 ? "#0A122A" : isFusion ? "#CC271F" : isSa20 ? "#171705" : isGeo ? "#0D1322" : isEac ? "#0C2560" : isIpl ? "#0A112E" : isIpl25 ? "#091120" : isStarT20 ? "#18212f" : isBblBlack ? "#22095A" : isCwc23 ? "#080721" : isCwc ? "#14122A" : isAsia ? "#142248" : "#000000";

      return (
        <div
          className="animate-slide-up"
          style={{
            position: "fixed",
            right: 28,
            bottom: "128px",
            zIndex: 90,
            width: 390,
            background: panelBg,
            borderRadius: "4px",
            boxShadow: isAsia ? "0 16px 36px rgba(0,0,0,0.9), 0 0 16px rgba(229,136,8,0.25)" : "0 16px 36px rgba(0,0,0,0.85)",
            fontFamily: "'Outfit', Arial, sans-serif",
            overflow: "hidden",
            border: panelBorder
          }}
        >
          {/* 1. Header: THIS TOURNAMENT */}
          <div style={{
            textAlign: "center",
            padding: "10px 0 2px",
            color: headerTextColor,
            fontSize: "11px",
            fontWeight: 950,
            letterSpacing: "1px",
            textTransform: "uppercase"
          }}>
            THIS TOURNAMENT
          </div>

          {/* 2. Bowler Name with Cricket Ball Icon */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "2px 14px 10px"
          }}>
            {/* Cricket Ball Icon with seam stitches */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={ballStroke} strokeWidth="2" />
              <path d="M6 6 C10 10 14 14 18 18" stroke={ballStroke} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M8 6 L10 8 M10 8 L12 10 M12 10 L14 12 M14 12 L16 14 M16 14 L18 16" stroke={ballStroke} strokeWidth="1.2" strokeLinecap="round" />
            </svg>

            <span style={{
              color: nameTextColor,
              fontSize: "24px",
              fontWeight: 950,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              lineHeight: 1.1
            }}>
              {bowlerPanelPlayer.toUpperCase()}
            </span>
          </div>

          {/* 3. Team Ribbon */}
          <div style={{
            background: ribbonBg,
            color: ribbonTextColor,
            padding: "4px 0",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 950,
            letterSpacing: "0.8px",
            textTransform: "uppercase"
          }}>
            ({teamNameVal})
          </div>

          {/* 4. Stats Rows Table */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { label: "MATCHES", val: matchesCount },
              { label: "WICKET", val: wicketsVal },
              { label: "OVERS BOWLED", val: oversVal },
              { label: "ECONOMY", val: ecoVal },
              { label: "BEST", val: bestVal },
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  height: "36px",
                  borderTop: rowBorder
                }}
              >
                {/* Left Label */}
                <div style={{
                  width: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: labelTextColor,
                  fontWeight: 950,
                  fontSize: "14px",
                  letterSpacing: "0.6px",
                  textTransform: "uppercase"
                }}>
                  {row.label}
                </div>

                {/* Right Value Box */}
                <div style={{
                  width: "50%",
                  background: valBoxBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: valTextColor,
                  fontWeight: 950,
                  fontSize: "17px",
                  letterSpacing: "0.4px"
                }}>
                  {row.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (themeSlug === "ipl-2025") {
      return (
        <div
          className="animate-slide-up"
          style={{
            position: "fixed",
            right: 24,
            bottom: 90,
            zIndex: 70,
            width: 380,
            height: 280,
            background: "linear-gradient(135deg, rgba(8, 28, 12, 0.96) 0%, rgba(3, 10, 24, 0.98) 100%)",
            border: "2px solid #a3e635",
            borderTop: "5px solid #a3e635",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 0 20px rgba(163, 230, 53, 0.25)",
            fontFamily: "'Outfit', 'Segoe UI', sans-serif",
            display: "flex"
          }}
        >
          {/* Left Half: Green watermarked block with player avatar & name */}
          <div style={{
            width: "160px",
            background: "linear-gradient(180deg, #3ea30e 0%, #297a08 50%, #1e5a06 100%)",
            borderRadius: "13px 0 0 13px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 8px 10px"
          }}>
            {/* Floral watermarks */}
            <svg style={{ position: "absolute", width: "130px", height: "130px", opacity: 0.25, color: "#ffffff", left: "-25px", top: "-15px", pointerEvents: "none" }} viewBox="0 0 100 100">
              <path d="M50 5 C55 25 75 45 95 50 C75 55 55 75 50 95 C45 75 25 55 5 50 C25 45 45 25 50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <svg style={{ position: "absolute", width: "130px", height: "130px", opacity: 0.25, color: "#ffffff", right: "-25px", bottom: "-15px", pointerEvents: "none" }} viewBox="0 0 100 100">
              <path d="M50 5 C55 25 75 45 95 50 C75 55 55 75 50 95 C45 75 25 55 5 50 C25 45 45 25 50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>

            <div style={{
              background: "rgba(0,0,0,0.35)",
              borderRadius: "6px",
              padding: "3px 8px",
              fontSize: "8.5px",
              fontWeight: 950,
              color: "#ffffff",
              letterSpacing: "1px",
              textTransform: "uppercase",
              position: "relative",
              zIndex: 2
            }}>
              🎯 ACTIVE BOWLER
            </div>

            <div style={{ position: "relative", zIndex: 2, padding: "10px 0" }}>
              <svg style={{ width: "64px", height: "64px", color: "#ffffff", opacity: 0.8 }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            <div style={{
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 950,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              textAlign: "center",
              position: "relative",
              zIndex: 2,
              lineHeight: 1.1,
              textShadow: "0 2px 6px rgba(0,0,0,0.7)"
            }}>
              {bowlerPanelPlayer.toUpperCase()}
            </div>
          </div>

          {/* Right Half: 4 Stat Pills */}
          <div style={{
            flex: 1,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "6px"
          }}>
            {/* 1. Matches */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 28, 12, 0.95), rgba(45, 55, 15, 0.9))",
              border: "1px solid rgba(163, 230, 53, 0.3)",
              borderRadius: "9px",
              padding: "4px 10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
            }}>
              <div style={{ fontSize: "8.5px", color: "#d4d4d8", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                MATCHES
              </div>
              <div style={{ fontSize: "20px", fontWeight: 950, color: "#ffffff", lineHeight: 1.1 }}>
                {stats.matches}
              </div>
            </div>

            {/* 2. Wickets (Solid Neon Lime Pill) */}
            <div style={{
              background: "linear-gradient(90deg, #a3e635 0%, #bef264 100%)",
              borderRadius: "9px",
              padding: "4px 10px",
              boxShadow: "0 4px 12px rgba(163, 230, 53, 0.35)"
            }}>
              <div style={{ fontSize: "8.5px", color: "#030a24", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
                WICKETS
              </div>
              <div style={{ fontSize: "22px", fontWeight: 950, color: "#030a24", lineHeight: 1.1 }}>
                {stats.wickets ?? 0}
              </div>
            </div>

            {/* 3. Economy */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 28, 12, 0.95), rgba(45, 55, 15, 0.9))",
              border: "1px solid rgba(163, 230, 53, 0.3)",
              borderRadius: "9px",
              padding: "4px 10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
            }}>
              <div style={{ fontSize: "8.5px", color: "#d4d4d8", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                ECONOMY
              </div>
              <div style={{ fontSize: "20px", fontWeight: 950, color: "#ffffff", lineHeight: 1.1 }}>
                {stats.economy}
              </div>
            </div>

            {/* 4. Best Spell */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 28, 12, 0.95), rgba(45, 55, 15, 0.9))",
              border: "1px solid rgba(163, 230, 53, 0.3)",
              borderRadius: "9px",
              padding: "4px 10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
            }}>
              <div style={{ fontSize: "8.5px", color: "#d4d4d8", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                BEST
              </div>
              <div style={{ fontSize: "20px", fontWeight: 950, color: "#ffffff", lineHeight: 1.1 }}>
                {stats.best ?? "—"}
              </div>
            </div>
          </div>
        </div>
      );
    }

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
  const renderBatterMatchPanel = () => {
    if (!isBatterMatchPanel || !batterMatchPlayer) return null;
    const batter = batterMatchLiveBatter;
    const runs = batter?.runs ?? 0;
    const balls = batter?.balls ?? 0;
    const fours = batter?.fours ?? 0;
    const sixes = batter?.sixes ?? 0;
    const sr = balls > 0 ? ((runs / balls) * 100).toFixed(0) : "0";
    const label = batterMatchIsStriker ? "STRIKE BATTER" : "NON STRIKER";
    const teamShort = currentBatTeam;

    // Per-theme colors (same palette as the rest of the panels)
    const isCri = themeSlug === "crioverlay-green";
    const isWcl = themeSlug === "wcl-fancode";
    const isCwc19 = themeSlug === "cwc-19";
    const isCt25 = themeSlug === "champions-trophy-2025";
    const isFusion = themeSlug === "cricfusion";
    const isSa20 = themeSlug === "sa20";
    const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
    const isEac = themeSlug === "t20-emerging-asia-cup";
    const isAsia = themeSlug === "asia-cup";
    const isCwc = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
    const isCwc23 = themeSlug === "cwc-23-india";
    const isBblBlack = themeSlug === "bbl-black";
    const isIpl = themeSlug === "ipl";
    const isIpl25 = themeSlug === "ipl-2025";
    const isBbl = themeSlug === "bbl-starsports";
    const isStarT20 = themeSlug === "starsports-t20";

    const accent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360"
      : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#facc15"
        : isIpl ? "#F3A714" : isIpl25 ? "#c8e63c" : isStarT20 ? "#0284c7" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF"
          : isCwc ? "#0373AF" : isAsia ? "#E58808" : isBbl ? "#00cfff" : "#74FB05";

    const bgPanel = isCri ? "#091120" : isWcl ? "#1F2937" : isCwc19 ? "#07152B" : isCt25 ? "#0A122A"
      : isFusion ? "#120406" : isSa20 ? "#171705" : isGeo ? "#0D1322" : isEac ? "#0C2560"
        : isIpl ? "#0A112E" : isIpl25 ? "#0c1322" : isStarT20 ? "#18212f" : isBblBlack ? "#22095A" : isCwc23 ? "#080721"
          : isCwc ? "#14122A" : isAsia ? "#142248" : isBbl ? "#0a1020" : "#091120";

    const circleBg = isStarT20 ? "#0284c7" : accent;
    const circleText = (isCri || isSa20 || isIpl || isIpl25) ? "#000" : (isGeo || isCt25 || isWcl || isCwc || isStarT20 || isEac || isAsia || isCwc23 || isBblBlack || isFusion || isCwc19 || isBbl) ? "#fff" : "#000";

    return (
      <div
        className="animate-slide-up"
        style={{
          position: "fixed",
          bottom: 140,
          left: 28,
          zIndex: 90,
          display: "flex",
          alignItems: "center",
          gap: 0,
          width: 460,
          background: bgPanel,
          borderRadius: 6,
          overflow: "hidden",
          border: `2px solid ${accent}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 16px ${accent}33`,
          fontFamily: "'Outfit', Arial, sans-serif",
        }}
      >
        {/* Left circle: team abbreviation */}
        <div style={{
          width: 72,
          minWidth: 72,
          height: 72,
          background: circleBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ color: circleText, fontSize: 17, fontWeight: 950, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {teamShort.slice(0, 3).toUpperCase()}
          </span>
        </div>

        {/* Middle: name + label */}
        <div style={{ flex: 1, padding: "0 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 950, letterSpacing: "0.6px", textTransform: "uppercase", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {batterMatchPlayer.toUpperCase()}
          </div>
          <div style={{ color: accent, fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {label}
          </div>
          {/* Bottom stat row: FOURS | SIXES | SR */}
          <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
            {[{ k: "FOURS", v: fours }, { k: "SIXES", v: sixes }, { k: "SR", v: sr }].map(({ k, v }) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: accent, fontSize: 9, fontWeight: 900, letterSpacing: "1px" }}>{k}</span>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 950 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: runs + balls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 18px 0 0", flexShrink: 0 }}>
          <span style={{ color: accent, fontSize: 36, fontWeight: 950, lineHeight: 1 }}>{runs}</span>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 18, fontWeight: 800, marginTop: 10 }}>{balls}</span>
        </div>
      </div>
    );
  };


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
          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}
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

  // ════════════════════ 5. FULL-SCREEN BROADCAST CARDS ════════════════════
  const activeScreen = (screenParam || scoringState.displayScreen || scoringState.displayStatsMode || "").trim().toUpperCase();
  const ds = activeScreen;
  const isFS = ds !== "" && ds !== "DEFAULT!" && ds !== "DEFAULT" && ds !== "MINI" && ds !== "DEFAULT / OFF" && ds !== "OFF" && ds !== "NONE" && ds !== "LIVE SCORE" && ds !== "B1" && ds !== "B2" && ds !== "BOWLER" && ds !== "TOSS" && ds !== "PRE-MATCH" && ds !== "PREMATCH" && ds !== "TOSS / TEAMS" && ds !== "TOSS INFO" && ds !== "TOUR BOUNDARIES" && ds !== "BOUNDARIES" && ds !== "TOURNAMENT BOUNDARIES";
  if (isFS) {
    const isY1Bat = ds === "Y1BAT" || ds === "1BAT" || (ds === "BATTING" && (scoringState.inningsNo === 1 || !scoringState.inningsNo));
    const isY2Bat = ds === "Y2BAT" || ds === "2BAT" || (ds === "BATTING" && scoringState.inningsNo === 2);
    const isY1Ball = ds === "Y1BALL" || ds === "1BALL" || (ds === "BOWLING" && (scoringState.inningsNo === 1 || !scoringState.inningsNo));
    const isY2Ball = ds === "Y2BALL" || ds === "2BALL" || (ds === "BOWLING" && scoringState.inningsNo === 2);
    const isSummary = ds === "SUMMARY" || ds === "VIEW SUMMARY" || ds === "MATCH SUMMARY" || ds === "SUM";
    const isFullScore = ds === "FULLSCORE" || ds === "SCORECARD" || ds === "VIEW SCORECARD" || ds === "FULL SCORE" || ds === "FULL_SCORE" || ds === "CARD";
    const isFow = ds === "FOW" || ds === "FALL OF WICKETS" || ds === "FALLOFWICKETS";
    const isTarget = ds === "TARGET" || ds === "CHASE" || ds === "TARGET_TICKER";
    const isPartner = ds === "PARTNERSHIP" || ds === "PARTNER" || ds === "STAND";
    const isSquads = ds === "TEAMS PLAYERS" || ds === "TEAM1" || ds === "TEAM2" || ds === "SQUADS" || ds === "PLAYINGXI" || ds === "PLAYING XI" || ds === "XI" || ds === "TEAM 1" || ds === "TEAM 2" || ds === "PLAYERS" || ds === "TEAM" || ds === "SQUAD";
    const isPointsTable = ds === "POINTSTABLE" || ds === "POINTS TABLE" || ds === "PT" || ds === "TABLE" || ds === "STANDINGS";
    const isPointsTablePlusOne = ds === "PT+1" || ds === "PT (TIED POINT +1)" || ds === "POINTSTABLE_PLUS1" || ds === "PT PLUS 1";
    const isTopBatters = ds === "TOPBATTERS" || ds === "TOP BATTERS" || ds === "ORANGE CAP" || ds === "TOP RUNS" || ds === "BATTERS";
    const isTopBowlers = ds === "TOPBOWLERS" || ds === "TOP BOWLERS" || ds === "PURPLE CAP" || ds === "TOP WICKETS" || ds === "BOWLERS";
    const isTopStrikers = ds === "TOPSTRIKERS" || ds === "TOP 4/6 STRIKERS" || ds === "STRIKERS" || ds === "TOP 4/6" || ds === "TOP SIXES";
    const isPlayerOfSeries = ds === "PLAYEROFSERIES" || ds === "TOP PLAYER OF SERIES" || ds === "MOS" || ds === "SERIES PLAYER" || ds === "MVP";
    const isTourMatch = ds === "TOUR" || ds === "TOURNAME" || ds === "TOURNAMENT" || ds === "TOURNAMENT MATCH" || ds === "FIXTURE";

    // ── BATTING CARD — Universal Dynamic Modern Layout for all 16 themes ──────────────────────────
    if (isY1Bat || isY2Bat) {
      const inn = (isY1Bat ? 1 : 2) as 1 | 2; const innData = getInnState(inn);
      const batTeam = getInnTeam(inn, "bat"); const bowlTeam = getInnTeam(inn, "bowl");
      const bpo = match.ballsPerOver || 6;

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const batTeamShort = getShortNameLocal(batTeam);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      const isTeam1 = batTeam === match.team1Name;
      const fullTeamRoster: string[] = isTeam1 ? (match.playersTeam1 || []) : (match.playersTeam2 || []);
      const recordedBatsmen = innData?.batsmen || [];

      const recordedNames = new Set(recordedBatsmen.map((b: any) => b.name.toLowerCase().trim()));
      const remainingPlayers = fullTeamRoster.filter(p => !recordedNames.has(p.toLowerCase().trim()));

      interface DisplayBatsmanRow {
        name: string;
        status: string;
        runs?: number;
        balls?: number;
        isNotOut: boolean;
        isOut: boolean;
        isYetToBat: boolean;
      }

      const batsmanRows: DisplayBatsmanRow[] = [
        ...recordedBatsmen.map((b: any) => {
          const isOut = !!b.out;
          const isNotOut = !b.out;
          let dismissalText = isOut ? "OUT" : "NOT OUT";
          if (isOut) {
            if ((b as any).bowler) dismissalText = `b ${(b as any).bowler}`;
            else if ((b as any).outDesc) dismissalText = (b as any).outDesc;
            else if ((b as any).dismissal) dismissalText = (b as any).dismissal;
          }
          return {
            name: b.name,
            status: dismissalText,
            runs: b.runs,
            balls: b.balls,
            isNotOut,
            isOut,
            isYetToBat: false,
          };
        }),
        ...remainingPlayers.map(pName => ({
          name: pName,
          status: "",
          isNotOut: false,
          isOut: false,
          isYetToBat: true,
        }))
      ];

      if (batsmanRows.length === 0) {
        if (scoringState.striker) {
          batsmanRows.push({ name: scoringState.striker, status: "NOT OUT", runs: 0, balls: 0, isNotOut: true, isOut: false, isYetToBat: false });
        }
        if (scoringState.nonStriker && scoringState.nonStriker !== scoringState.striker) {
          batsmanRows.push({ name: scoringState.nonStriker, status: "NOT OUT", runs: 0, balls: 0, isNotOut: true, isOut: false, isYetToBat: false });
        }
      }

      const bBatRuns = innData?.batsmen?.reduce((acc: number, b: any) => acc + (b.runs || 0), 0) || 0;
      const extras = innData ? Math.max(0, innData.score - bBatRuns) : 0;
      const oversText = innData ? fmtOv(innData.balls, bpo) : "0.0";
      const scoreText = innData ? `${innData.score}-${innData.wickets}` : "0-0";

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{batTeamShort}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                {batTeam.toUpperCase()}
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0,
              opacity: 0.85
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{batTeamShort}</span>
            </div>
          </div>

          {/* MAIN BATTING SCORECARD CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "16px 24px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "2px" }}>
              {batsmanRows.length > 0 ? (
                batsmanRows.map((row, idx) => {
                  if (row.isNotOut) {
                    return (
                      <div
                        key={idx}
                        style={{
                          background: `linear-gradient(90deg, ${cardAccent} 0%, ${cardAccent2} 100%)`,
                          borderRadius: "8px",
                          padding: "6px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          margin: "3px 0",
                          boxShadow: `0 2px 8px ${cardAccent}55`
                        }}
                      >
                        <div style={{
                          color: "#030a24",
                          fontSize: "17px",
                          fontWeight: 950,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          minWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {row.name}
                        </div>

                        <div style={{
                          color: "#030a24",
                          fontSize: "14px",
                          fontWeight: 950,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          flex: 1,
                          padding: "0 16px"
                        }}>
                          {row.status || "NOT OUT"}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "28px", flexShrink: 0 }}>
                          <span style={{ color: "#030a24", fontSize: "18px", fontWeight: 950, minWidth: "28px", textAlign: "right" }}>
                            {row.runs ?? 0}
                          </span>
                          <span style={{ color: "#030a24", fontSize: "16px", fontWeight: 900, minWidth: "24px", textAlign: "right" }}>
                            {row.balls ?? 0}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "7px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${cardAccent}33`
                      }}
                    >
                      <div style={{
                        color: "#ffffff",
                        fontSize: "17px",
                        fontWeight: 900,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        minWidth: "220px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {row.name}
                      </div>

                      <div style={{
                        color: "#cbd5e1",
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        flex: 1,
                        padding: "0 16px"
                      }}>
                        {row.status}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "28px", flexShrink: 0 }}>
                        <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 950, minWidth: "28px", textAlign: "right" }}>
                          {row.isYetToBat ? "" : (row.runs ?? 0)}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 700, minWidth: "24px", textAlign: "right" }}>
                          {row.isYetToBat ? "" : (row.balls ?? 0)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "30px", fontWeight: 800 }}>
                  No batting data available yet.
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM PILL: OVERS | SCORE | EXTRAS */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "17px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              OVERS <span style={{ fontWeight: 950 }}>{oversText}</span>
            </div>

            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "28px",
              fontWeight: 950,
              letterSpacing: "1.5px"
            }}>
              {scoreText}
            </div>

            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "17px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              EXTRAS <span style={{ fontWeight: 950 }}>{extras}</span>
            </div>
          </div>
        </div>
      );
    }

    // ── BOWLING CARD — Universal Dynamic Modern Layout for all 16 themes ─────────────────
    if (isY1Ball || isY2Ball) {
      const inn = (isY1Ball ? 1 : 2) as 1 | 2; const innData = getInnState(inn);
      const bowlTeam = getInnTeam(inn, "bowl"); const batTeam = getInnTeam(inn, "bat");
      const bpo = match.ballsPerOver || 6;

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const bowlTeamShort = getShortNameLocal(bowlTeam);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      const bBatRuns = innData?.batsmen?.reduce((acc: number, b: any) => acc + (b.runs || 0), 0) || 0;
      const extras = innData ? Math.max(0, innData.score - bBatRuns) : 0;
      const oversText = innData ? fmtOv(innData.balls, bpo) : "0.0";
      const scoreText = innData ? `${innData.score}-${innData.wickets}` : "0-0";

      const bowlersList = innData?.bowlers || [];
      const fowList = innData?.fallOfWickets || [];

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{bowlTeamShort}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                {bowlTeam.toUpperCase()}
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0,
              opacity: 0.85
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{bowlTeamShort}</span>
            </div>
          </div>

          {/* MAIN BOWLING & FALL OF WICKETS CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "16px 20px 20px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Table Header Strip */}
              <div style={{
                background: "rgba(255, 255, 255, 0.16)",
                borderRadius: "8px",
                padding: "6px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px"
              }}>
                <div style={{ width: "240px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "70px 70px 70px 85px 95px", textAlign: "right", gap: "10px" }}>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900, letterSpacing: "1px" }}>OVERS</span>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900, letterSpacing: "1px" }}>DOTS</span>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900, letterSpacing: "1px" }}>RUNS</span>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900, letterSpacing: "1px" }}>WICKETS</span>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900, letterSpacing: "1px" }}>ECONOMY</span>
                </div>
              </div>

              {/* Bowler Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "16px" }}>
                {bowlersList.length > 0 ? (
                  bowlersList.map((bw: any, idx: number) => {
                    const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * bpo).toFixed(2) : "0.00";
                    const dots = bw.dotBalls ?? bw.dots ?? 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "8px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: `1px solid ${cardAccent}33`
                        }}
                      >
                        <div style={{
                          color: "#ffffff",
                          fontSize: "17px",
                          fontWeight: 900,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          width: "240px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {bw.name}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "70px 70px 70px 85px 95px", textAlign: "right", gap: "10px" }}>
                          <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 900 }}>{fmtOv(bw.ballsBowled, bpo)}</span>
                          <span style={{ color: "#cbd5e1", fontSize: "16px", fontWeight: 800 }}>{dots}</span>
                          <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 900 }}>{bw.runsConceded}</span>
                          <span style={{ color: cardAccent, fontSize: "18px", fontWeight: 950 }}>{bw.wickets}</span>
                          <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 900 }}>{eco}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px", fontWeight: 800 }}>
                    No bowling figures recorded yet.
                  </div>
                )}
              </div>

              {/* Fall of Wickets Strip */}
              {fowList.length > 0 && (
                <div style={{
                  borderTop: `1px solid ${cardAccent}4d`,
                  paddingTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px"
                }}>
                  <div style={{
                    color: cardAccent,
                    fontSize: "13px",
                    fontWeight: 950,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    flexShrink: 0
                  }}>
                    FALL OF WICKETS:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", flex: 1 }}>
                    {fowList.map((f: any, i: number) => (
                      <span key={i} style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900 }}>
                        <span style={{ color: cardAccent }}>{f.score}</span>/{f.wickets}{" "}
                        <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 700 }}>
                          ({f.batsman}, {typeof f.over === "number" ? f.over.toFixed(1) : f.over} ov)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM PILL: OVERS | SCORE | WICKETS */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "17px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              OVERS <span style={{ fontWeight: 950 }}>{oversText}</span>
            </div>

            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "28px",
              fontWeight: 950,
              letterSpacing: "1.5px"
            }}>
              {scoreText}
            </div>

            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "17px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              WICKETS <span style={{ fontWeight: 950 }}>{innData?.wickets || 0}/10</span>
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

      const bpo = match.ballsPerOver || 6;
      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const t1Short = getShortNameLocal(match.team1Name);
      const t2Short = getShortNameLocal(match.team2Name);
      const tossWinnerName = (match as any).tossWonBy === "team1" ? match.team1Name : match.team2Name;
      const tossDecisionText = (match as any).optedTo === "Bat" ? "BAT" : "BOWL";
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";
      const hasInn2 = inn2 && (inn2.balls > 0 || inn2.score > 0 || (inn2.batsmen && inn2.batsmen.length > 0));

      const renderSummaryCard = (teamName: string, innData: any, topBat: any[], topBowl: any[]) => {
        const oversText = innData ? fmtOv(innData.balls, bpo) : "0.0";
        const scoreText = innData ? `${innData.score}-${innData.wickets}` : "0-0";

        return (
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "16px 28px 20px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Inner Header Bar: Team Name, Overs, Score Badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1.5px solid ${cardAccent}66`,
              paddingBottom: "12px",
              marginBottom: "14px",
              position: "relative",
              zIndex: 2
            }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "22px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                textShadow: `0 0 12px ${cardAccent}66`
              }}>
                {teamName.toUpperCase()}
              </div>

              <div style={{
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 900,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                opacity: 0.95
              }}>
                OVERS <span style={{ fontWeight: 950 }}>{oversText}</span>
              </div>

              <div style={{
                background: "#ffffff",
                color: isEac ? "#0C2560" : "#030a24",
                fontSize: "22px",
                fontWeight: 950,
                letterSpacing: "1px",
                padding: "3px 18px",
                borderRadius: "8px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.6)"
              }}>
                {scoreText}
              </div>
            </div>

            {/* Dual Columns: Left Batsmen, Right Bowlers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              position: "relative",
              zIndex: 2
            }}>
              {/* Left: Batsmen list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {topBat.length > 0 ? (
                  topBat.map((b, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 0"
                    }}>
                      <div style={{
                        color: "#ffffff",
                        fontSize: "18px",
                        fontWeight: 900,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {b.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                        <span style={{ color: "#ffffff", fontSize: "19px", fontWeight: 950, minWidth: "26px", textAlign: "right" }}>
                          {b.runs}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 800, minWidth: "22px", textAlign: "right" }}>
                          {b.balls}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 800, padding: "10px 0" }}>
                    YET TO BAT
                  </div>
                )}
              </div>

              {/* Right: Bowlers list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {topBowl.length > 0 ? (
                  topBowl.map((bw, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 0"
                    }}>
                      <div style={{
                        color: "#ffffff",
                        fontSize: "18px",
                        fontWeight: 900,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {bw.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                        <span style={{ color: "#ffffff", fontSize: "19px", fontWeight: 950, minWidth: "46px", textAlign: "right" }}>
                          {bw.wickets}-{bw.runsConceded}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 800, minWidth: "28px", textAlign: "right" }}>
                          {fmtOv(bw.ballsBowled, bpo)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 800, padding: "10px 0" }}>
                    YET TO BOWL
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      };

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{t1Short}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "30px",
                fontWeight: 950,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                MATCH SUMMARY
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{t2Short}</span>
            </div>
          </div>

          {/* MAIN INNINGS SUMMARY CARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", alignItems: "center" }}>
            {renderSummaryCard(bt1, inn1, topB1, topBw1)}
            {hasInn2 && renderSummaryCard(bt2, inn2, topB2, topBw2)}
          </div>

          {/* BOTTOM TOSS / OUTCOME PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "11px 24px",
            textAlign: "center",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)"
          }}>
            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "15px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              {match.status === "Completed" && winnerText
                ? winnerText.toUpperCase()
                : `${tossWinnerName.toUpperCase()} WON THE TOSS AND ELECTED TO ${tossDecisionText.toUpperCase()}`}
            </div>
          </div>
        </div>
      );
    }

    // ── MATCH FULL SCORECARD — Detailed Innings 1 & 2 Scorecard with Universal Dynamic Theme ───────────
    if (isFullScore) {
      const inn1 = getInnState(1);
      const inn2 = getInnState(2);
      const bt1 = getInnTeam(1, "bat");
      const bt2 = getInnTeam(2, "bat");
      const bpo = match.ballsPerOver || 6;
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const t1Short = getShortNameLocal(match.team1Name);
      const t2Short = getShortNameLocal(match.team2Name);
      const tossWinnerName = (match as any).tossWonBy === "team1" ? match.team1Name : match.team2Name;
      const tossDecisionText = (match as any).optedTo === "Bat" ? "BAT" : "BOWL";
      const hasInn2 = inn2 && (inn2.balls > 0 || inn2.score > 0 || (inn2.batsmen && inn2.batsmen.length > 0));

      const renderInningsCard = (teamName: string, innNumber: number, innData: any) => {
        if (!innData) {
          return (
            <div className="animate-slide-up" style={{
              background: bodyBgGrad,
              border: `2px solid ${cardAccent}`,
              borderRadius: "22px",
              padding: "24px",
              boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 20px ${cardAccent}26`,
              width: "min(92vw, 1080px)",
              textAlign: "center",
              color: "#94a3b8"
            }}>
              <div style={{ color: cardTitleAccent, fontSize: "20px", fontWeight: 950, textTransform: "uppercase", marginBottom: "6px" }}>
                {teamName.toUpperCase()} — INNINGS {innNumber}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700 }}>Yet to bat</div>
            </div>
          );
        }

        const oversText = fmtOv(innData.balls, bpo);
        const scoreText = `${innData.score}-${innData.wickets}`;
        const bBatRuns = innData.batsmen?.reduce((acc: number, b: any) => acc + (b.runs || 0), 0) || 0;
        const extras = Math.max(0, innData.score - bBatRuns);
        const batsmenList = innData.batsmen || [];
        const bowlersList = innData.bowlers || [];
        const fowList = innData.fallOfWickets || [];

        return (
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "16px 24px 20px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Inner Header Bar: Team Name, Overs, Score Badge */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1.5px solid ${cardAccent}66`,
                paddingBottom: "10px",
                marginBottom: "12px"
              }}>
                <div style={{
                  color: cardTitleAccent,
                  fontSize: "22px",
                  fontWeight: 950,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  textShadow: `0 0 12px ${cardAccent}66`
                }}>
                  {teamName.toUpperCase()} <span style={{ fontSize: "14px", color: cardAccent2, opacity: 0.9 }}>· INNINGS {innNumber}</span>
                </div>

                <div style={{
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  opacity: 0.95
                }}>
                  OVERS <span style={{ fontWeight: 950 }}>{oversText}</span>
                </div>

                <div style={{
                  background: "#ffffff",
                  color: isEac ? "#0C2560" : "#030a24",
                  fontSize: "20px",
                  fontWeight: 950,
                  letterSpacing: "1px",
                  padding: "3px 16px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.6)"
                }}>
                  {scoreText}
                </div>
              </div>

              {/* BATTING SECTION */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  background: "rgba(255, 255, 255, 0.14)",
                  borderRadius: "8px",
                  padding: "5px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px"
                }}>
                  <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950, letterSpacing: "1px", width: "220px" }}>BATSMAN</span>
                  <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", flex: 1, textAlign: "left", paddingLeft: "10px" }}>DISMISSAL</span>
                  <div style={{ display: "grid", gridTemplateColumns: "45px 45px 40px 40px 65px", textAlign: "right", gap: "8px" }}>
                    <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>R</span>
                    <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>B</span>
                    <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>4s</span>
                    <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>6s</span>
                    <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>SR</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {batsmenList.map((b: any, i: number) => {
                    const isOut = !!b.out;
                    const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
                    let dismissal = isOut ? "out" : "not out";
                    if (isOut) {
                      if (b.bowler) dismissal = `b ${b.bowler}`;
                      else if (b.outDesc) dismissal = b.outDesc;
                      else if (b.dismissal) dismissal = b.dismissal;
                    }

                    return (
                      <div
                        key={i}
                        style={{
                          padding: "6px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: `1px solid ${cardAccent}26`,
                          background: !isOut ? `${cardAccent}14` : "transparent",
                          borderRadius: "4px"
                        }}
                      >
                        <div style={{
                          color: "#ffffff",
                          fontSize: "15px",
                          fontWeight: 900,
                          width: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase"
                        }}>
                          {b.name} {!isOut && <span style={{ color: cardAccent, fontSize: "11px" }}>*</span>}
                        </div>

                        <div style={{
                          color: isOut ? "#94a3b8" : cardAccent,
                          fontSize: "13px",
                          fontWeight: 700,
                          flex: 1,
                          textAlign: "left",
                          paddingLeft: "10px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase"
                        }}>
                          {dismissal}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "45px 45px 40px 40px 65px", textAlign: "right", gap: "8px" }}>
                          <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 950 }}>{b.runs}</span>
                          <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 800 }}>{b.balls}</span>
                          <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 800 }}>{b.fours || 0}</span>
                          <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 800 }}>{b.sixes || 0}</span>
                          <span style={{ color: cardAccent, fontSize: "14px", fontWeight: 900 }}>{sr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 14px",
                  borderTop: `1px solid ${cardAccent}4d`,
                  marginTop: "4px",
                  fontSize: "13px",
                  fontWeight: 900,
                  color: cardAccent2
                }}>
                  <span>EXTRAS</span>
                  <span>{extras}</span>
                </div>
              </div>

              {/* BOWLING SECTION */}
              {bowlersList.length > 0 && (
                <div>
                  <div style={{
                    background: "rgba(255, 255, 255, 0.14)",
                    borderRadius: "8px",
                    padding: "5px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px"
                  }}>
                    <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950, letterSpacing: "1px", width: "240px" }}>BOWLER</span>
                    <div style={{ display: "grid", gridTemplateColumns: "60px 55px 55px 65px 75px", textAlign: "right", gap: "8px" }}>
                      <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>OVERS</span>
                      <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>DOTS</span>
                      <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>RUNS</span>
                      <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>WKTS</span>
                      <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>ECON</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {bowlersList.map((bw: any, i: number) => {
                      const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * bpo).toFixed(2) : "0.00";
                      const dots = bw.dotBalls ?? bw.dots ?? 0;
                      return (
                        <div
                          key={i}
                          style={{
                            padding: "6px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: `1px solid ${cardAccent}26`
                          }}
                        >
                          <div style={{
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: 900,
                            width: "240px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textTransform: "uppercase"
                          }}>
                            {bw.name}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "60px 55px 55px 65px 75px", textAlign: "right", gap: "8px" }}>
                            <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>{fmtOv(bw.ballsBowled, bpo)}</span>
                            <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 800 }}>{dots}</span>
                            <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>{bw.runsConceded}</span>
                            <span style={{ color: cardAccent, fontSize: "15px", fontWeight: 950 }}>{bw.wickets}</span>
                            <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: 900 }}>{eco}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FOW Summary */}
              {fowList.length > 0 && (
                <div style={{ marginTop: "12px", borderTop: `1px solid ${cardAccent}40`, paddingTop: "8px" }}>
                  <div style={{ fontSize: "11px", color: cardAccent, fontWeight: 950, letterSpacing: "1px", marginBottom: "4px" }}>
                    FALL OF WICKETS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {fowList.map((f: any, i: number) => (
                      <span key={i} style={{
                        background: "rgba(255,255,255,0.06)",
                        border: `1px solid ${cardAccent}4d`,
                        borderRadius: "12px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: 900,
                        color: "#ffffff"
                      }}>
                        {f.score}/{f.wickets} <span style={{ color: "#94a3b8", fontWeight: 700 }}>({f.batsman}, {typeof f.over === "number" ? f.over.toFixed(1) : f.over} ov)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      };

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{t1Short}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "28px",
                fontWeight: 950,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                MATCH SCORECARD
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{t2Short}</span>
            </div>
          </div>

          {/* MAIN INNINGS SCORECARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", alignItems: "center" }}>
            {renderInningsCard(bt1, 1, inn1)}
            {hasInn2 && renderInningsCard(bt2, 2, inn2)}
          </div>

          {/* BOTTOM OUTCOME PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "11px 24px",
            textAlign: "center",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)"
          }}>
            <div style={{
              color: isEac ? "#FFFFFF" : "#030a24",
              fontSize: "15px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              {match.status === "Completed" && winnerText
                ? winnerText.toUpperCase()
                : `${tossWinnerName.toUpperCase()} WON THE TOSS AND ELECTED TO ${tossDecisionText.toUpperCase()}`}
            </div>
          </div>
        </div>
      );
    }

    // ── FALL OF WICKETS — Broadcast Timeline Cards with Universal Dynamic Theme ──
    if (isFow) {
      const fowList = scoringState.fallOfWickets || [];
      const row1 = fowList.slice(0, 5);
      const row2 = fowList.slice(5);
      const bpo = match.ballsPerOver || 6;
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const batTeamShort = getShortNameLocal(currentBatTeam);
      const oversText = fmtOv(scoringState.balls, bpo);
      const scoreText = `${scoringState.score}-${scoringState.wickets}`;

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{batTeamShort}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                FALL OF WICKETS
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{batTeamShort}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "24px 32px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              borderBottom: `1px solid ${cardAccent}26`,
              paddingBottom: "12px"
            }}>
              <span style={{ color: cardAccent, fontSize: "15px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
                INNINGS {scoringState.inningsNo} · WICKETS TIMELINE
              </span>
              <span style={{ color: cardAccent2, fontSize: "15px", fontWeight: 950 }}>
                {fowList.length} WICKETS DOWN
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Row 1 (Wickets 1-5) */}
              {row1.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, row1.length)}, 1fr)`, gap: "14px" }}>
                  {row1.map((f: any, i: number) => (
                    <div key={i} style={{
                      background: `${cardAccent}14`,
                      border: `1.5px solid ${cardAccent}66`,
                      borderRadius: "14px",
                      padding: "14px 10px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <div style={{
                        background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
                        color: isEac ? "#FFFFFF" : "#030a24",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 950
                      }}>
                        {f.wickets}
                      </div>
                      <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: 900, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                        {f.batsman}
                      </div>
                      <div style={{ color: cardTitleAccent, fontSize: "24px", fontWeight: 950, lineHeight: 1.1 }}>
                        {f.score}
                      </div>
                      <div style={{ color: cardAccent2, fontSize: "12px", fontWeight: 800 }}>
                        {typeof f.over === "number" ? f.over.toFixed(1) : f.over} OVERS
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px", fontSize: "16px", fontWeight: 800 }}>
                  🏏 No wickets fallen yet in this innings.
                </div>
              )}

              {/* Row 2 (Wickets 6-10) */}
              {row2.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${row2.length}, 1fr)`, gap: "14px" }}>
                  {row2.map((f: any, i: number) => (
                    <div key={i} style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1.5px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "14px",
                      padding: "14px 10px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <div style={{
                        background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
                        color: isEac ? "#FFFFFF" : "#030a24",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 950
                      }}>
                        {f.wickets}
                      </div>
                      <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: 900, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                        {f.batsman}
                      </div>
                      <div style={{ color: cardTitleAccent, fontSize: "24px", fontWeight: 950, lineHeight: 1.1 }}>
                        {f.score}
                      </div>
                      <div style={{ color: cardAccent2, fontSize: "12px", fontWeight: 800 }}>
                        {typeof f.over === "number" ? f.over.toFixed(1) : f.over} OVERS
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ color: "#030a24", fontSize: "17px", fontWeight: 950, textTransform: "uppercase" }}>
              OVERS <span>{oversText}</span>
            </div>
            <div style={{ color: "#030a24", fontSize: "28px", fontWeight: 950 }}>
              {scoreText}
            </div>
            <div style={{ color: "#030a24", fontSize: "17px", fontWeight: 950, textTransform: "uppercase" }}>
              WICKETS <span>{fowList.length}/10</span>
            </div>
          </div>
        </div>
      );
    }


    // ── TARGET — Broadcast-Grade Chase Equation with Exact Theme Palette or IPL 2025 Replica ──
    if (isTarget) {
      const need = Math.max(0, (scoringState.target || 0) - scoringState.score);
      const bpo = match.ballsPerOver || 6;
      const bLeft = Math.max(0, match.overs * bpo - scoringState.balls);
      const rrr = bLeft > 0 ? ((need / bLeft) * bpo).toFixed(2) : "0.00";
      const crr = scoringState.balls > 0 ? ((scoringState.score / scoringState.balls) * bpo).toFixed(2) : "0.00";
      const pct = scoringState.target ? Math.min(100, (scoringState.score / scoringState.target) * 100) : 0;

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const batTeamShort = getShortNameLocal(currentBatTeam);
      const bowlTeamShort = getShortNameLocal(currentBowlTeam);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";
      const oversText = fmtOv(scoringState.balls, bpo);
      const scoreText = `${scoringState.score}-${scoringState.wickets}`;

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{batTeamShort}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                TARGET · {scoringState.target || "—"} RUNS
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{bowlTeamShort}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "24px 32px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden",
            textAlign: "center"
          }}>
            {scoringState.target !== null ? (
              <>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>
                  {currentBatTeam.toUpperCase()} NEED
                </div>

                <div style={{
                  fontSize: "88px",
                  fontWeight: 950,
                  color: cardAccent,
                  lineHeight: 1,
                  letterSpacing: "-1px",
                  textShadow: `0 0 40px ${cardAccent}66`,
                  margin: "6px 0"
                }}>
                  {need}
                </div>

                <div style={{ fontSize: "16px", color: "#ffffff", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
                  RUNS TO WIN FROM <span style={{ color: cardAccent2 }}>{bLeft} BALLS</span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ height: "10px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${cardAccent}, ${cardAccent2})`, borderRadius: "6px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "#94a3b8", fontWeight: 800 }}>
                    <span>0 RUNS</span>
                    <span style={{ color: "#ffffff" }}>{scoringState.score}/{scoringState.wickets} ({oversText}/{match.overs} OV)</span>
                    <span style={{ color: cardAccent }}>TARGET: {scoringState.target}</span>
                  </div>
                </div>

                {/* 4 Stat Boxes */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  {[
                    { l: "TARGET", v: scoringState.target, c: "#ffffff" },
                    { l: "BALLS LEFT", v: bLeft, c: cardAccent2 },
                    { l: "REQ. RUN RATE", v: rrr, c: cardAccent },
                    { l: "CURR. RUN RATE", v: crr, c: cardAccent2 }
                  ].map((st, i) => (
                    <div key={i} style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: `1.5px solid ${cardAccent}4d`,
                      borderRadius: "14px",
                      padding: "14px 10px"
                    }}>
                      <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
                        {st.l}
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: 950, color: st.c, lineHeight: 1 }}>
                        {st.v}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: "40px", color: "#94a3b8", fontSize: "16px", fontWeight: 800 }}>
                🎯 Target not yet set (1st Innings in progress).
              </div>
            )}
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ color: "#030a24", fontSize: "17px", fontWeight: 950, textTransform: "uppercase" }}>
              OVERS <span>{oversText}</span>
            </div>
            <div style={{ color: "#030a24", fontSize: "28px", fontWeight: 950 }}>
              {scoreText}
            </div>
            <div style={{ color: "#030a24", fontSize: "17px", fontWeight: 950, textTransform: "uppercase" }}>
              RRR <span>{rrr}</span>
            </div>
          </div>
        </div>
      );
    }

    // ── PARTNERSHIP — Broadcast-Grade Duel Showcase with Exact Theme Palette or IPL 2025 Replica ──
    if (isPartner) {
      const pRuns = (striker?.runs || 0) + (nonStriker?.runs || 0);
      const pBalls = (striker?.balls || 0) + (nonStriker?.balls || 0);
      const pSR = pBalls > 0 ? ((pRuns / pBalls) * 100).toFixed(1) : "0.0";
      const stCont = pRuns > 0 ? Math.round(((striker?.runs || 0) / pRuns) * 100) : 50;
      const totalFours = (striker?.fours || 0) + (nonStriker?.fours || 0);
      const totalSixes = (striker?.sixes || 0) + (nonStriker?.sixes || 0);
      const bpo = match.ballsPerOver || 6;
      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const batTeamShort = getShortNameLocal(currentBatTeam);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";
      const oversText = fmtOv(scoringState.balls, bpo);
      const scoreText = `${scoringState.score}-${scoringState.wickets}`;

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{batTeamShort}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                CURRENT PARTNERSHIP
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{batTeamShort}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "24px 32px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Center Big Partnership Header */}
            <div style={{
              textAlign: "center",
              marginBottom: "20px",
              borderBottom: `1px solid ${cardAccent}26`,
              paddingBottom: "16px"
            }}>
              <div style={{ color: cardAccent, fontSize: "13px", fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase" }}>
                TOTAL PARTNERSHIP
              </div>
              <div style={{
                fontSize: "58px",
                fontWeight: 950,
                color: "#ffffff",
                lineHeight: 1,
                margin: "4px 0",
                textShadow: `0 0 20px ${cardAccent}66`
              }}>
                {pRuns} <span style={{ fontSize: "24px", color: cardAccent2, fontWeight: 800 }}>RUNS</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 800 }}>
                {pBalls} BALLS · RUN RATE {pSR}
              </div>
            </div>

            {/* Two Batsmen Comparison */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px"
            }}>
              {/* Striker */}
              <div style={{
                background: `${cardAccent}14`,
                border: `1.5px solid ${cardAccent}66`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
                    color: isEac ? "#FFFFFF" : "#030a24",
                    fontSize: "11px",
                    fontWeight: 950,
                    padding: "3px 10px",
                    borderRadius: "6px",
                    letterSpacing: "1px"
                  }}>
                    STRIKER *
                  </span>
                  <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 900 }}>
                    {stCont}% OF RUNS
                  </span>
                </div>
                <div style={{ color: "#ffffff", fontSize: "22px", fontWeight: 950, textTransform: "uppercase" }}>
                  {scoringState.striker || "Striker"}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ color: cardAccent, fontSize: "40px", fontWeight: 950, lineHeight: 1 }}>{striker?.runs || 0}</span>
                  <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 800 }}>({striker?.balls || 0} balls)</span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "6px", color: "#ffffff", fontSize: "13px", fontWeight: 800 }}>
                    {striker?.fours || 0}×4s
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "6px", color: "#ffffff", fontSize: "13px", fontWeight: 800 }}>
                    {striker?.sixes || 0}×6s
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "6px", color: cardAccent2, fontSize: "13px", fontWeight: 900 }}>
                    SR {striker?.balls ? ((striker.runs / striker.balls) * 100).toFixed(1) : "0.0"}
                  </span>
                </div>
              </div>

              {/* Non-Striker */}
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 950,
                    padding: "3px 10px",
                    borderRadius: "6px",
                    letterSpacing: "1px"
                  }}>
                    NON-STRIKER
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 900 }}>
                    {100 - stCont}% OF RUNS
                  </span>
                </div>
                <div style={{ color: "#ffffff", fontSize: "22px", fontWeight: 950, textTransform: "uppercase" }}>
                  {scoringState.nonStriker || "Non-Striker"}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ color: "#ffffff", fontSize: "40px", fontWeight: 950, lineHeight: 1 }}>{nonStriker?.runs || 0}</span>
                  <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 800 }}>({nonStriker?.balls || 0} balls)</span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "6px", color: "#ffffff", fontSize: "13px", fontWeight: 800 }}>
                    {nonStriker?.fours || 0}×4s
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "6px", color: "#ffffff", fontSize: "13px", fontWeight: 800 }}>
                    {nonStriker?.sixes || 0}×6s
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "6px", color: cardAccent2, fontSize: "13px", fontWeight: 900 }}>
                    SR {nonStriker?.balls ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(1) : "0.0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ color: "#030a24", fontSize: "17px", fontWeight: 950, textTransform: "uppercase" }}>
              OVERS <span>{oversText}</span>
            </div>
            <div style={{ color: "#030a24", fontSize: "28px", fontWeight: 950 }}>
              {scoreText}
            </div>
            <div style={{ color: "#030a24", fontSize: "17px", fontWeight: 950, textTransform: "uppercase" }}>
              BOUNDARIES <span>{totalFours}×4s, {totalSixes}×6s</span>
            </div>
          </div>
        </div>
      );
    }

    // ── SQUADS / TEAMS PLAYERS — Universal Dynamic Modern Playing XI for all 16 themes ──
    if (isSquads) {
      const isTeam2 = ds === "TEAM2" || ds === "TEAM 2";
      const isTeam1 = ds === "TEAM1" || ds === "TEAM 1";
      const isBothTeams = !isTeam1 && !isTeam2; // "TEAMS PLAYERS", "TEAMS", "BOTH TEAMS", "PLAYERS", "SQUADS", "PLAYING XI", etc.

      const selectedTeam = isTeam2 ? match.team2Name : isTeam1 ? match.team1Name : currentBatTeam;
      const rawPlayers = selectedTeam === match.team2Name ? (match.playersTeam2 || []) : (match.playersTeam1 || []);

      const players = [...rawPlayers];
      const row1 = players.length > 6 ? players.slice(0, 6) : players;
      const row2 = players.length > 6 ? players.slice(6) : [];

      const team1Players = (match.playersTeam1 && match.playersTeam1.length > 0)
        ? match.playersTeam1
        : ["Virat Kohli (c)", "Rohit Sharma", "Shubman Gill", "Suryakumar Yadav", "KL Rahul", "Hardik Pandya", "Ravindra Jadeja", "Axar Patel", "Kuldeep Yadav", "Jasprit Bumrah", "Mohammed Siraj"];

      const team2Players = (match.playersTeam2 && match.playersTeam2.length > 0)
        ? match.playersTeam2
        : ["Pat Cummins (c)", "David Warner", "Travis Head", "Mitchell Marsh", "Steve Smith", "Glenn Maxwell", "Josh Inglis", "Marcus Stoinis", "Mitchell Starc", "Adam Zampa", "Josh Hazlewood"];

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #a3e635 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #a3e635 0%, #bef264 50%, #a3e635 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const tossWinnerName = (match as any).tossWonBy === "team1" ? match.team1Name : match.team2Name;
      const tossDecisionText = (match as any).optedTo === "Bat" ? "BAT" : "BOWL";
      const tossBannerText = match.tossWonBy
        ? `${tossWinnerName.toUpperCase()} WON THE TOSS AND ELECTED TO ${tossDecisionText}`
        : `🏏 ${match.team1Name.toUpperCase()} VS ${match.team2Name.toUpperCase()} • MATCH IN PROGRESS`;

      const matchSubtitle = (match as any).tournamentStage || match.matchType
        ? `${((match as any).tournamentStage || match.matchType).toUpperCase()} • ${match.overs} OVERS MATCH`
        : "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* ════════════════════ DUAL TEAM TEAMS PLAYERS SCREEN (MATCHING SCREENSHOT 100%) ════════════════════ */}
          {isBothTeams ? (
            <>
              {/* TOP HEADER PILL */}
              <div className="animate-slide-up" style={{
                background: headerBgGrad,
                border: `2px solid ${cardAccent}`,
                borderRadius: "18px",
                padding: "10px 48px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
                width: "min(94vw, 980px)"
              }}>
                <div style={{
                  color: cardTitleAccent,
                  fontSize: "26px",
                  fontWeight: 950,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                  textShadow: `0 0 16px ${cardAccent}80`
                }}>
                  TEAMS
                </div>
                <div style={{
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 900,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginTop: "3px",
                  opacity: 0.92
                }}>
                  {matchSubtitle}
                </div>
              </div>

              {/* MAIN DUAL-COLUMN PLAYING XI BOX CONTAINER */}
              <div className="animate-slide-up" style={{
                background: bodyBgGrad,
                border: `2px solid ${cardAccent}`,
                borderRadius: "22px",
                padding: "20px 24px 22px",
                boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
                width: "min(94vw, 980px)",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Background Floral Watermark Pattern matching screenshot */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  opacity: 0.14,
                  backgroundImage: `radial-gradient(circle at 10% 20%, ${cardAccent} 2px, transparent 3px), radial-gradient(circle at 90% 80%, ${cardAccent} 2px, transparent 3px)`,
                  backgroundSize: "40px 40px"
                }} />

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                  position: "relative",
                  zIndex: 2
                }}>
                  {/* LEFT COLUMN: TEAM 1 */}
                  <div style={{
                    background: "rgba(2, 6, 23, 0.45)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "12px 16px 14px",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)"
                  }}>
                    {/* Team 1 Header Capsule */}
                    <div style={{
                      background: `linear-gradient(180deg, ${cardAccent}35 0%, rgba(0,0,0,0.65) 100%)`,
                      border: `1.5px solid ${cardAccent}77`,
                      borderRadius: "10px",
                      padding: "8px 12px",
                      textAlign: "center",
                      marginBottom: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                    }}>
                      <span style={{
                        color: "#ffffff",
                        fontSize: "13.5px",
                        fontWeight: 950,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase"
                      }}>
                        {match.team1Name}
                      </span>
                    </div>

                    {/* Team 1 Player Rows (11 players) */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {team1Players.slice(0, 11).map((pName, idx) => {
                        const isCaptain = idx === 0 || pName.toLowerCase().includes("(c)");
                        const cleanName = pName.replace(/\s*\([cC]\)\s*/, "").trim();
                        return (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "4.5px 6px",
                              borderBottom: idx < Math.min(team1Players.length, 11) - 1 ? "1px solid rgba(255,255,255,0.08)" : "none"
                            }}
                          >
                            <span style={{
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 900,
                              letterSpacing: "0.5px",
                              textTransform: "uppercase"
                            }}>
                              {cleanName}
                            </span>
                            {isCaptain && (
                              <div style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "4px",
                                background: cardAccent,
                                color: isEac ? "#ffffff" : "#000000",
                                fontSize: "11px",
                                fontWeight: 950,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                                flexShrink: 0
                              }}>
                                c
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: TEAM 2 */}
                  <div style={{
                    background: "rgba(2, 6, 23, 0.45)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "12px 16px 14px",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)"
                  }}>
                    {/* Team 2 Header Capsule */}
                    <div style={{
                      background: `linear-gradient(180deg, ${cardAccent}35 0%, rgba(0,0,0,0.65) 100%)`,
                      border: `1.5px solid ${cardAccent}77`,
                      borderRadius: "10px",
                      padding: "8px 12px",
                      textAlign: "center",
                      marginBottom: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                    }}>
                      <span style={{
                        color: "#ffffff",
                        fontSize: "13.5px",
                        fontWeight: 950,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase"
                      }}>
                        {match.team2Name}
                      </span>
                    </div>

                    {/* Team 2 Player Rows (11 players) */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {team2Players.slice(0, 11).map((pName, idx) => {
                        const isCaptain = idx === 0 || pName.toLowerCase().includes("(c)");
                        const cleanName = pName.replace(/\s*\([cC]\)\s*/, "").trim();
                        return (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "4.5px 6px",
                              borderBottom: idx < Math.min(team2Players.length, 11) - 1 ? "1px solid rgba(255,255,255,0.08)" : "none"
                            }}
                          >
                            <span style={{
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 900,
                              letterSpacing: "0.5px",
                              textTransform: "uppercase"
                            }}>
                              {cleanName}
                            </span>
                            {isCaptain && (
                              <div style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "4px",
                                background: cardAccent,
                                color: isEac ? "#ffffff" : "#000000",
                                fontSize: "11px",
                                fontWeight: 950,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                                flexShrink: 0
                              }}>
                                c
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM TOSS BANNER PILL */}
              <div className="animate-slide-up" style={{
                background: bottomPillBgGrad,
                borderRadius: "16px",
                border: `2px solid ${cardAccent}`,
                padding: "11px 32px",
                textAlign: "center",
                boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 18px ${cardAccent}55`,
                width: "min(94vw, 980px)"
              }}>
                <div style={{
                  color: isEac ? "#ffffff" : "#001a2e",
                  fontSize: "15px",
                  fontWeight: 950,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  lineHeight: 1.2
                }}>
                  {tossBannerText}
                </div>
              </div>
            </>
          ) : (
            /* ════════════════════ SINGLE TEAM PLAYING XI (TEAM 1 or TEAM 2 BUTTON) ════════════════════ */
            <>
              {/* TOP HEADER PILL */}
              <div className="animate-slide-up" style={{
                background: headerBgGrad,
                border: `2px solid ${cardAccent}`,
                borderRadius: "18px",
                padding: "10px 48px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
                width: "min(92vw, 1080px)"
              }}>
                <div style={{
                  color: cardTitleAccent,
                  fontSize: "24px",
                  fontWeight: 950,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                  textShadow: `0 0 16px ${cardAccent}80`
                }}>
                  {selectedTeam.toUpperCase()}
                </div>
                <div style={{
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                  opacity: 0.95
                }}>
                  PLAYING XI
                </div>
              </div>

              {/* MAIN PLAYING XI CARDS CONTAINER */}
              <div className="animate-slide-up" style={{
                background: bodyBgGrad,
                border: `2px solid ${cardAccent}`,
                borderRadius: "22px",
                padding: "28px 32px 24px",
                boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
                width: "min(92vw, 1080px)",
                position: "relative",
                overflow: "hidden"
              }}>
                {players.length === 0 ? (
                  <div style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "14px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    textTransform: "uppercase"
                  }}>
                    No players registered for {selectedTeam} yet.
                  </div>
                ) : (
                  <>
                    {/* Row 1 */}
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "14px",
                      marginBottom: row2.length > 0 ? "14px" : "0",
                      position: "relative",
                      zIndex: 2,
                      flexWrap: "wrap"
                    }}>
                      {row1.map((pName, idx) => {
                        const isCaptain = idx === 0 || pName.toLowerCase().includes("(c)");
                        const cleanName = pName.replace(/\s*\([cC]\)\s*/, "").trim();
                        return (
                          <div
                            key={idx}
                            className="table-row-animated"
                            style={{
                              animationDelay: `${idx * 0.04}s`,
                              background: "linear-gradient(180deg, rgba(8, 24, 60, 0.9) 0%, rgba(3, 10, 30, 0.95) 100%)",
                              border: `1.5px solid ${cardAccent}aa`,
                              borderRadius: "12px 12px 9px 9px",
                              width: "132px",
                              height: "124px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "space-between",
                              position: "relative",
                              overflow: "hidden",
                              boxShadow: "0 6px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)"
                            }}
                          >
                            {/* Captain Badge */}
                            {isCaptain && (
                              <div style={{
                                position: "absolute",
                                top: "6px",
                                right: "6px",
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: "#ea580c",
                                border: "1.5px solid #ffffff",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: 950,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                                zIndex: 3
                              }}>
                                c
                              </div>
                            )}

                            {/* User Silhouette Avatar */}
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "8px" }}>
                              <svg style={{ width: "42px", height: "42px", color: "#94a3b8", opacity: 0.65 }} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>

                            {/* Bottom Name Banner */}
                            <div style={{
                              width: "100%",
                              background: `linear-gradient(180deg, ${cardAccent2} 0%, ${cardAccent} 100%)`,
                              borderRadius: "0 0 7px 7px",
                              padding: "5px 4px",
                              textAlign: "center",
                              boxShadow: "0 -2px 6px rgba(0,0,0,0.3)"
                            }}>
                              <div style={{
                                color: "#001a2e",
                                fontSize: "10.5px",
                                fontWeight: 950,
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                                {cleanName}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 2 (Centered) */}
                    {row2.length > 0 && (
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "14px",
                        position: "relative",
                        zIndex: 2,
                        flexWrap: "wrap"
                      }}>
                        {row2.map((pName, idx) => {
                          const isCaptain = (idx + 6) === 0 || pName.toLowerCase().includes("(c)");
                          const cleanName = pName.replace(/\s*\([cC]\)\s*/, "").trim();
                          return (
                            <div
                              key={idx + 6}
                              className="table-row-animated"
                              style={{
                                animationDelay: `${(idx + 6) * 0.04}s`,
                                background: "linear-gradient(180deg, rgba(8, 24, 60, 0.9) 0%, rgba(3, 10, 30, 0.95) 100%)",
                                border: `1.5px solid ${cardAccent}aa`,
                                borderRadius: "12px 12px 9px 9px",
                                width: "132px",
                                height: "124px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "space-between",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: "0 6px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)"
                              }}
                            >
                              {/* Captain Badge */}
                              {isCaptain && (
                                <div style={{
                                  position: "absolute",
                                  top: "6px",
                                  right: "6px",
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "50%",
                                  background: "#ea580c",
                                  border: "1.5px solid #ffffff",
                                  color: "#ffffff",
                                  fontSize: "10px",
                                  fontWeight: 950,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  lineHeight: 1,
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                                  zIndex: 3
                                }}>
                                  c
                                </div>
                              )}

                              {/* User Silhouette Avatar */}
                              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "8px" }}>
                                <svg style={{ width: "42px", height: "42px", color: "#94a3b8", opacity: 0.65 }} viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>

                              {/* Bottom Name Banner */}
                              <div style={{
                                width: "100%",
                                background: `linear-gradient(180deg, ${cardAccent2} 0%, ${cardAccent} 100%)`,
                                borderRadius: "0 0 7px 7px",
                                padding: "5px 4px",
                                textAlign: "center",
                                boxShadow: "0 -2px 6px rgba(0,0,0,0.3)"
                              }}>
                                <div style={{
                                  color: "#001a2e",
                                  fontSize: "10.5px",
                                  fontWeight: 950,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.3px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}>
                                  {cleanName}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* BOTTOM TOSS BANNER PILL */}
              <div className="animate-slide-up" style={{
                background: bottomPillBgGrad,
                borderRadius: "18px",
                border: `2px solid ${cardAccent}`,
                padding: "12px 36px",
                textAlign: "center",
                boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 18px ${cardAccent}55`,
                width: "min(92vw, 1080px)"
              }}>
                <div style={{
                  color: isEac ? "#ffffff" : "#001a2e",
                  fontSize: "16px",
                  fontWeight: 950,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  lineHeight: 1.2
                }}>
                  {tossBannerText}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // ── POINTS TABLE & PT (TIED POINT +1) — Broadcast-Grade Standings with Exact Theme Palette or IPL 2025 Replica ──
    if (isPointsTable || isPointsTablePlusOne) {
      const isPlusOne = isPointsTablePlusOne;
      const ptList = getPointsTable(match, themeSlug, isPlusOne);

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const t1Short = getShortNameLocal(match.team1Name);
      const t2Short = getShortNameLocal(match.team2Name);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{t1Short}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                {isPlusOne ? "STANDINGS (TIED +1)" : "POINTS TABLE · STANDINGS"}
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{t2Short}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "20px 24px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Header Strip */}
            <div style={{
              background: "rgba(255, 255, 255, 0.14)",
              borderRadius: "8px",
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950, letterSpacing: "1px", width: "40px" }}>POS</span>
              <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", flex: 1, textAlign: "left" }}>TEAM</span>
              <div style={{ display: "grid", gridTemplateColumns: "50px 50px 50px 50px 75px 65px", textAlign: "right", gap: "10px" }}>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>P</span>
                <span style={{ color: cardAccent2, fontSize: "12px", fontWeight: 900 }}>W</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>L</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>T</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>NRR</span>
                <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950 }}>PTS</span>
              </div>
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {ptList.map((tm: any, i: number) => {
                const isTop4 = i < 4;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${cardAccent}26`,
                      background: isTop4 ? `${cardAccent}14` : "transparent",
                      borderRadius: "6px"
                    }}
                  >
                    <div style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: isTop4 ? `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})` : "rgba(255,255,255,0.1)",
                      color: isTop4 ? "#030a24" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: 950,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "14px"
                    }}>
                      {i + 1}
                    </div>

                    <div style={{
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: 950,
                      flex: 1,
                      textAlign: "left",
                      textTransform: "uppercase"
                    }}>
                      {tm.name} {isTop4 && <span style={{ color: cardAccent2, fontSize: "10px", fontWeight: 800 }}>• Q</span>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "50px 50px 50px 50px 75px 65px", textAlign: "right", gap: "10px" }}>
                      <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 800 }}>{tm.p}</span>
                      <span style={{ color: cardAccent2, fontSize: "15px", fontWeight: 900 }}>{tm.w}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "15px", fontWeight: 800 }}>{tm.l}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "15px", fontWeight: 800 }}>{tm.t}</span>
                      <span style={{ color: parseFloat(tm.nrr) >= 0 ? cardAccent2 : "#cbd5e1", fontSize: "14px", fontWeight: 900 }}>
                        {parseFloat(tm.nrr) > 0 ? `+${tm.nrr}` : tm.nrr}
                      </span>
                      <span style={{ color: cardAccent, fontSize: "18px", fontWeight: 950 }}>{tm.pts}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            textAlign: "center"
          }}>
            <div style={{ color: "#030a24", fontSize: "15px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
              TOP 4 TEAMS ADVANCE TO PLAYOFFS · WIN = 2 PTS · {isPlusOne ? "TIE = 2 PTS" : "TIE = 1 PT"}
            </div>
          </div>
        </div>
      );
    }

    // ── TOP BATTERS — Broadcast Leaderboard with Exact Theme Palette ──
    if (isTopBatters) {
      const { battersList } = (() => {
        const matchesToScan = (tournamentMatches && tournamentMatches.length > 0) ? tournamentMatches : [match];
        const batMap: Record<string, any> = {};
        matchesToScan.forEach(m => {
          const ss = m.scoringState;
          if (!ss) return;
          const allInns = [
            { team: ss.battingTeam === "team1" ? m.team1Name : m.team2Name, inn: ss },
            ...(ss.firstInnings ? [{ team: ss.battingTeam === "team1" ? m.team2Name : m.team1Name, inn: ss.firstInnings }] : [])
          ];
          allInns.forEach(({ team, inn }) => {
            inn.batsmen?.forEach((b: BatsmanStats) => {
              if (!b.name) return;
              if (!batMap[b.name]) batMap[b.name] = { name: b.name, team, runs: 0, balls: 0, fours: 0, sixes: 0, innings: 0, notOuts: 0, hs: 0, hsNo: false };
              if (b.balls > 0) {
                batMap[b.name].innings++;
                batMap[b.name].runs += (b.runs || 0);
                batMap[b.name].balls += (b.balls || 0);
                batMap[b.name].fours += (b.fours || 0);
                batMap[b.name].sixes += (b.sixes || 0);
                if (!b.out) batMap[b.name].notOuts++;
                if (b.runs > batMap[b.name].hs || (b.runs === batMap[b.name].hs && !b.out)) {
                  batMap[b.name].hs = b.runs;
                  batMap[b.name].hsNo = !b.out;
                }
              }
            });
          });
        });
        let list = Object.values(batMap).map(b => {
          const dismissals = b.innings - b.notOuts;
          const avg = dismissals > 0 ? (b.runs / dismissals).toFixed(1) : b.innings > 0 ? "N/O" : "0.0";
          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
          return { ...b, avg, sr, hsStr: `${b.hs}${b.hsNo ? "*" : ""}` };
        }).sort((a, b) => b.runs - a.runs || parseFloat(b.sr) - parseFloat(a.sr));

        if (list.length === 0) {
          list = [
            { name: scoringState.striker || "Virat Kohli", team: match.team1Name, runs: 74, balls: 42, fours: 8, sixes: 3, innings: 1, notOuts: 0, hs: 74, hsNo: false, avg: "74.0", sr: "176.2", hsStr: "74" },
            { name: scoringState.nonStriker || "Rohit Sharma", team: match.team1Name, runs: 58, balls: 34, fours: 6, sixes: 2, innings: 1, notOuts: 1, hs: 58, hsNo: true, avg: "58.0", sr: "170.6", hsStr: "58*" },
            { name: "Top Batter", team: match.team2Name, runs: 42, balls: 26, fours: 4, sixes: 2, innings: 1, notOuts: 0, hs: 42, hsNo: false, avg: "42.0", sr: "161.5", hsStr: "42" }
          ];
        }
        return { battersList: list };
      })();

      const leader = battersList[0];
      const rest = battersList.slice(1, 6);
      const tourName = (match as any).tournamentName || "TOURNAMENT LEADERBOARD";

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isCri ? "#FFFFFF" : isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isCri ? "#74FB05" : isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isCri
        ? "linear-gradient(180deg, #091120 0%, #102140 100%)"
        : isWcl
          ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
            : isCt25
              ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
              : isFusion
                ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                    : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isCri
        ? "linear-gradient(180deg, #050b14 0%, #091120 50%, #050b14 100%)"
        : isWcl
          ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
          : isCwc19
            ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
            : isCt25
              ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
              : isFusion
                ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
                : isSa20
                  ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                  : isGeo
                    ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                    : isEac
                      ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                      : isIpl
                        ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                        : isBblBlack
                          ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                          : isCwc23
                            ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                            : isCwc25
                              ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                              : isAsiaCup
                                ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                                : isBblStar
                                  ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                    : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isCri
        ? "linear-gradient(90deg, #74FB05 0%, #86efac 50%, #74FB05 100%)"
        : isWcl
          ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
          : isCwc19
            ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
            : isCt25
              ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
              : isFusion
                ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
                : isSa20
                  ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                  : isGeo
                    ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                    : isEac
                      ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                      : isIpl
                        ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                        : isBblBlack
                          ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                          : isCwc23
                            ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                            : isCwc25
                              ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                              : isAsiaCup
                                ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                                : isBblStar
                                  ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                  : isIpl2025
                                    ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const t1Short = getShortNameLocal(match.team1Name);
      const t2Short = getShortNameLocal(match.team2Name);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";
      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{t1Short}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                ORANGE CAP · TOP RUN SCORERS
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{t2Short}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "20px 24px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Header Strip */}
            <div style={{
              background: "rgba(255, 255, 255, 0.14)",
              borderRadius: "8px",
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950, letterSpacing: "1px", width: "40px" }}>POS</span>
              <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", width: "200px", textAlign: "left" }}>BATSMAN</span>
              <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", flex: 1, textAlign: "left" }}>TEAM</span>
              <div style={{ display: "grid", gridTemplateColumns: "55px 55px 50px 50px 65px 75px", textAlign: "right", gap: "10px" }}>
                <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950 }}>RUNS</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>BALLS</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>4s</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>6s</span>
                <span style={{ color: cardAccent2, fontSize: "12px", fontWeight: 900 }}>H.S.</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>S/R</span>
              </div>
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {battersList.map((b: any, i: number) => {
                const isLeader = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${cardAccent}26`,
                      background: isLeader ? `${cardAccent}14` : "transparent",
                      borderRadius: "6px"
                    }}
                  >
                    <div style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: isLeader ? `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})` : "rgba(255,255,255,0.1)",
                      color: isLeader ? "#030a24" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: 950,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "14px"
                    }}>
                      {i + 1}
                    </div>

                    <div style={{
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: 950,
                      width: "200px",
                      textAlign: "left",
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {b.name} {isLeader && <span style={{ color: cardAccent, fontSize: "11px" }}>👑</span>}
                    </div>

                    <div style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                      fontWeight: 800,
                      flex: 1,
                      textAlign: "left",
                      textTransform: "uppercase"
                    }}>
                      {b.team}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "55px 55px 50px 50px 65px 75px", textAlign: "right", gap: "10px" }}>
                      <span style={{ color: cardAccent, fontSize: "17px", fontWeight: 950 }}>{b.runs}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "15px", fontWeight: 800 }}>{b.balls}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "15px", fontWeight: 800 }}>{b.fours || 0}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "15px", fontWeight: 800 }}>{b.sixes || 0}</span>
                      <span style={{ color: cardAccent2, fontSize: "15px", fontWeight: 900 }}>{b.hsStr}</span>
                      <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>{b.sr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            textAlign: "center"
          }}>
            <div style={{ color: "#030a24", fontSize: "15px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
              LEADING RUN SCORER: {leader?.name.toUpperCase()} ({leader?.runs} RUNS)
            </div>
          </div>
        </div>
      );
    }

    // ── TOP BOWLERS — Broadcast Leaderboard with Exact Theme Palette ──
    if (isTopBowlers) {
      const { bowlersList } = (() => {
        const matchesToScan = (tournamentMatches && tournamentMatches.length > 0) ? tournamentMatches : [match];
        const bowlMap: Record<string, any> = {};
        matchesToScan.forEach(m => {
          const ss = m.scoringState;
          if (!ss) return;
          const allInns = [
            { team: ss.battingTeam === "team1" ? m.team2Name : m.team1Name, inn: ss },
            ...(ss.firstInnings ? [{ team: ss.battingTeam === "team1" ? m.team1Name : m.team2Name, inn: ss.firstInnings }] : [])
          ];
          allInns.forEach(({ team, inn }) => {
            inn.bowlers?.forEach((bw: BowlerStats) => {
              if (!bw.name) return;
              if (!bowlMap[bw.name]) bowlMap[bw.name] = { name: bw.name, team, wickets: 0, runsConceded: 0, ballsBowled: 0, bestW: 0, bestR: 999 };
              if (bw.ballsBowled > 0) {
                bowlMap[bw.name].wickets += (bw.wickets || 0);
                bowlMap[bw.name].runsConceded += (bw.runsConceded || 0);
                bowlMap[bw.name].ballsBowled += (bw.ballsBowled || 0);
                if (bw.wickets > bowlMap[bw.name].bestW || (bw.wickets === bowlMap[bw.name].bestW && bw.runsConceded < bowlMap[bw.name].bestR)) {
                  bowlMap[bw.name].bestW = bw.wickets;
                  bowlMap[bw.name].bestR = bw.runsConceded;
                }
              }
            });
          });
        });
        const bpo = match.ballsPerOver || 6;
        let list = Object.values(bowlMap).map(bw => {
          const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * bpo).toFixed(2) : "0.00";
          const avg = bw.wickets > 0 ? (bw.runsConceded / bw.wickets).toFixed(1) : "—";
          const bestStr = bw.bestW > 0 ? `${bw.bestW}/${bw.bestR}` : "0/0";
          const overs = `${Math.floor(bw.ballsBowled / bpo)}.${bw.ballsBowled % bpo}`;
          return { ...bw, eco, avg, bestStr, overs };
        }).sort((a, b) => b.wickets - a.wickets || parseFloat(a.eco) - parseFloat(b.eco));

        if (list.length === 0) {
          list = [
            { name: scoringState.bowler || "Jasprit Bumrah", team: match.team2Name, wickets: 4, runsConceded: 18, ballsBowled: 24, bestW: 4, bestR: 18, eco: "4.50", avg: "4.5", bestStr: "4/18", overs: "4.0" },
            { name: "Top Bowler 2", team: match.team1Name, wickets: 3, runsConceded: 22, ballsBowled: 24, bestW: 3, bestR: 22, eco: "5.50", avg: "7.3", bestStr: "3/22", overs: "4.0" },
            { name: "Top Bowler 3", team: match.team2Name, wickets: 2, runsConceded: 19, ballsBowled: 18, bestW: 2, bestR: 19, eco: "6.33", avg: "9.5", bestStr: "2/19", overs: "3.0" }
          ];
        }
        return { bowlersList: list };
      })();

      const leader = bowlersList[0];
      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isWcl = themeSlug === "wcl-fancode";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isFusion = themeSlug === "cricfusion";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#CC271F" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isWcl ? "#FFFFFF" : isCwc19 ? "#DC2626" : isCt25 ? "#FFFFFF" : isFusion ? "#FFFFFF" : isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isWcl ? "#0284C7" : isCwc19 ? "#02B3E4" : isCt25 ? "#03A360" : isFusion ? "#FFFFFF" : isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isWcl
        ? "linear-gradient(180deg, #1F2937 0%, #111827 100%)"
        : isCwc19
          ? "linear-gradient(180deg, #07152B 0%, #0d284f 100%)"
          : isCt25
            ? "linear-gradient(180deg, #0A122A 0%, #152248 100%)"
            : isFusion
              ? "linear-gradient(180deg, #120406 0%, #22080c 100%)"
              : isSa20
                ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
                : isGeo
                  ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
                  : isEac
                    ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
                    : isIpl
                      ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
                      : isBblBlack
                        ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                        : isCwc23
                          ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                          : isCwc25
                            ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                            : isAsiaCup
                              ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                              : isBblStar
                                ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                                : isIpl2025
                                  ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                                  : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isWcl
        ? "linear-gradient(180deg, #111827 0%, #1F2937 50%, #111827 100%)"
        : isCwc19
          ? "linear-gradient(180deg, #040c18 0%, #07152B 50%, #040c18 100%)"
          : isCt25
            ? "linear-gradient(180deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)"
            : isFusion
              ? "linear-gradient(180deg, #0a0203 0%, #120406 50%, #0a0203 100%)"
              : isSa20
                ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
                : isGeo
                  ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
                  : isEac
                    ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
                    : isIpl
                      ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
                      : isBblBlack
                        ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                        : isCwc23
                          ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                          : isCwc25
                            ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                            : isAsiaCup
                              ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                              : isBblStar
                                ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                                : isIpl2025
                                  ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                                  : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isWcl
        ? "linear-gradient(90deg, #0284C7 0%, #38bdf8 50%, #0284C7 100%)"
        : isCwc19
          ? "linear-gradient(90deg, #02B3E4 0%, #38bdf8 50%, #02B3E4 100%)"
          : isCt25
            ? "linear-gradient(90deg, #03A360 0%, #34d399 50%, #03A360 100%)"
            : isFusion
              ? "linear-gradient(90deg, #CC271F 0%, #ef4444 50%, #CC271F 100%)"
              : isSa20
                ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
                : isGeo
                  ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
                  : isEac
                    ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
                    : isIpl
                      ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
                      : isBblBlack
                        ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                        : isCwc23
                          ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                          : isCwc25
                            ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                            : isAsiaCup
                              ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                              : isBblStar
                                ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                                : isIpl2025
                                  ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                                  : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const t1Short = getShortNameLocal(match.team1Name);
      const t2Short = getShortNameLocal(match.team2Name);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{t1Short}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                PURPLE CAP · TOP WICKET TAKERS
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{t2Short}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "20px 24px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Header Strip */}
            <div style={{
              background: "rgba(255, 255, 255, 0.14)",
              borderRadius: "8px",
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950, letterSpacing: "1px", width: "40px" }}>POS</span>
              <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", width: "200px", textAlign: "left" }}>BOWLER</span>
              <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", flex: 1, textAlign: "left" }}>TEAM</span>
              <div style={{ display: "grid", gridTemplateColumns: "60px 55px 65px 65px 75px", textAlign: "right", gap: "10px" }}>
                <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950 }}>WKTS</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>OVERS</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>RUNS</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>BEST</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>ECON</span>
              </div>
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {bowlersList.map((bw: any, i: number) => {
                const isLeader = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${cardAccent}26`,
                      background: isLeader ? `${cardAccent}14` : "transparent",
                      borderRadius: "6px"
                    }}
                  >
                    <div style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: isLeader ? `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})` : "rgba(255,255,255,0.1)",
                      color: isLeader ? "#030a24" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: 950,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "14px"
                    }}>
                      {i + 1}
                    </div>

                    <div style={{
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: 950,
                      width: "200px",
                      textAlign: "left",
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {bw.name} {isLeader && <span style={{ color: cardAccent, fontSize: "11px" }}>⚡</span>}
                    </div>

                    <div style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                      fontWeight: 800,
                      flex: 1,
                      textAlign: "left",
                      textTransform: "uppercase"
                    }}>
                      {bw.team}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "60px 55px 65px 65px 75px", textAlign: "right", gap: "10px" }}>
                      <span style={{ color: cardAccent, fontSize: "18px", fontWeight: 950 }}>{bw.wickets}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "15px", fontWeight: 800 }}>{bw.overs}</span>
                      <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 800 }}>{bw.runsConceded}</span>
                      <span style={{ color: cardAccent2, fontSize: "15px", fontWeight: 900 }}>{bw.bestStr}</span>
                      <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>{bw.eco}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            textAlign: "center"
          }}>
            <div style={{ color: "#030a24", fontSize: "15px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
              LEADING WICKET TAKER: {leader?.name.toUpperCase()} ({leader?.wickets} WICKETS · ECON {leader?.eco})
            </div>
          </div>
        </div>
      );
    }

    // ── TOP 4/6 STRIKERS — Broadcast Leaderboard with Exact Theme Palette ──
    if (isTopStrikers) {
      const { strikersList } = (() => {
        const matchesToScan = (tournamentMatches && tournamentMatches.length > 0) ? tournamentMatches : [match];
        const batMap: Record<string, any> = {};
        matchesToScan.forEach(m => {
          const ss = m.scoringState;
          if (!ss) return;
          const allInns = [
            { team: ss.battingTeam === "team1" ? m.team1Name : m.team2Name, inn: ss },
            ...(ss.firstInnings ? [{ team: ss.battingTeam === "team1" ? m.team2Name : m.team1Name, inn: ss.firstInnings }] : [])
          ];
          allInns.forEach(({ team, inn }) => {
            inn.batsmen?.forEach((b: BatsmanStats) => {
              if (!b.name) return;
              if (!batMap[b.name]) batMap[b.name] = { name: b.name, team, runs: 0, balls: 0, fours: 0, sixes: 0 };
              batMap[b.name].runs += (b.runs || 0);
              batMap[b.name].balls += (b.balls || 0);
              batMap[b.name].fours += (b.fours || 0);
              batMap[b.name].sixes += (b.sixes || 0);
            });
          });
        });
        let list = Object.values(batMap).map(b => {
          const boundaryRuns = (b.fours * 4) + (b.sixes * 6);
          const totalBoundaries = b.fours + b.sixes;
          const boundaryPct = b.runs > 0 ? Math.round((boundaryRuns / b.runs) * 100) : 0;
          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
          return { ...b, boundaryRuns, totalBoundaries, boundaryPct, sr };
        }).sort((a, b) => b.sixes - a.sixes || b.fours - a.fours || b.boundaryRuns - a.boundaryRuns);

        if (list.length === 0) {
          list = [
            { name: scoringState.striker || "Top Striker", team: match.team1Name, runs: 68, balls: 32, fours: 7, sixes: 5, boundaryRuns: 58, totalBoundaries: 12, boundaryPct: 85, sr: "212.5" },
            { name: scoringState.nonStriker || "Power Hitter", team: match.team1Name, runs: 44, balls: 20, fours: 4, sixes: 3, boundaryRuns: 34, totalBoundaries: 7, boundaryPct: 77, sr: "220.0" }
          ];
        }
        return { strikersList: list };
      })();

      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isSa20 = themeSlug === "sa20";
      const isGeo = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isAsiaCup = themeSlug === "asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const isIpl = themeSlug === "ipl";
      const cardAccent = isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#781010" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isSa20 ? "#FFFFFF" : isGeo ? "#FFFFFF" : isEac ? "#FFFFFF" : isIpl ? "#FFFFFF" : isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isSa20 ? "#EBB509" : isGeo ? "#FDFEFE" : isEac ? "#FFFFFF" : isIpl ? "#F3A714" : isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isSa20
        ? "linear-gradient(180deg, #171705 0%, #2b2b0a 100%)"
        : isGeo
          ? "linear-gradient(180deg, #0D1322 0%, #172138 100%)"
          : isEac
            ? "linear-gradient(180deg, #0C2560 0%, #153782 100%)"
            : isIpl
              ? "linear-gradient(180deg, #0A112E 0%, #17204f 100%)"
              : isBblBlack
                ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
                : isCwc23
                  ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
                  : isCwc25
                    ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
                    : isAsiaCup
                      ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
                      : isBblStar
                        ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                        : isIpl2025
                          ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                          : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isSa20
        ? "linear-gradient(180deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)"
        : isGeo
          ? "linear-gradient(180deg, #070b14 0%, #0D1322 50%, #070b14 100%)"
          : isEac
            ? "linear-gradient(180deg, #07173e 0%, #0C2560 50%, #07173e 100%)"
            : isIpl
              ? "linear-gradient(180deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)"
              : isBblBlack
                ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
                : isCwc23
                  ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
                  : isCwc25
                    ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
                    : isAsiaCup
                      ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
                      : isBblStar
                        ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                        : isIpl2025
                          ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                          : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isSa20
        ? "linear-gradient(90deg, #EBB509 0%, #facc15 50%, #EBB509 100%)"
        : isGeo
          ? "linear-gradient(90deg, #FDFEFE 0%, #cbd5e1 50%, #FDFEFE 100%)"
          : isEac
            ? "linear-gradient(90deg, #781010 0%, #a81c1c 50%, #781010 100%)"
            : isIpl
              ? "linear-gradient(90deg, #F3A714 0%, #fbbf24 50%, #F3A714 100%)"
              : isBblBlack
                ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
                : isCwc23
                  ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
                  : isCwc25
                    ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
                    : isAsiaCup
                      ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
                      : isBblStar
                        ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                        : isIpl2025
                          ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                          : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const t1Short = getShortNameLocal(match.team1Name);
      const t2Short = getShortNameLocal(match.team2Name);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{t1Short}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                TOP 4s & 6s · MAXIMUM STRIKERS
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{t2Short}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "20px 24px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Header Strip */}
            <div style={{
              background: "rgba(255, 255, 255, 0.14)",
              borderRadius: "8px",
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950, letterSpacing: "1px", width: "40px" }}>POS</span>
              <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", width: "200px", textAlign: "left" }}>BATSMAN</span>
              <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", flex: 1, textAlign: "left" }}>TEAM</span>
              <div style={{ display: "grid", gridTemplateColumns: "55px 55px 75px 80px 75px", textAlign: "right", gap: "10px" }}>
                <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: 900 }}>4s</span>
                <span style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 900 }}>6s</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>BOUNDARIES</span>
                <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950 }}>RUNS</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>S/R</span>
              </div>
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {strikersList.map((st: any, i: number) => {
                const isLeader = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${cardAccent}26`,
                      background: isLeader ? `${cardAccent}14` : "transparent",
                      borderRadius: "6px"
                    }}
                  >
                    <div style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: isLeader ? `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})` : "rgba(255,255,255,0.1)",
                      color: isLeader ? "#030a24" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: 950,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "14px"
                    }}>
                      {i + 1}
                    </div>

                    <div style={{
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: 950,
                      width: "200px",
                      textAlign: "left",
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {st.name} {isLeader && <span style={{ color: cardAccent, fontSize: "11px" }}>🚀</span>}
                    </div>

                    <div style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                      fontWeight: 800,
                      flex: 1,
                      textAlign: "left",
                      textTransform: "uppercase"
                    }}>
                      {st.team}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "55px 55px 75px 80px 75px", textAlign: "right", gap: "10px" }}>
                      <span style={{ color: "#fbbf24", fontSize: "16px", fontWeight: 900 }}>{st.fours}×4s</span>
                      <span style={{ color: "#38bdf8", fontSize: "16px", fontWeight: 950 }}>{st.sixes}×6s</span>
                      <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 800 }}>{st.totalBoundaries}</span>
                      <span style={{ color: cardAccent, fontSize: "17px", fontWeight: 950 }}>{st.boundaryRuns}</span>
                      <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>{st.sr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            textAlign: "center"
          }}>
            <div style={{ color: "#030a24", fontSize: "15px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
              POWER HITTER LEADER: {strikersList[0]?.name.toUpperCase()} ({strikersList[0]?.sixes} SIXES · SR {strikersList[0]?.sr})
            </div>
          </div>
        </div>
      );
    }

    // ── TOP PLAYER OF SERIES — Broadcast MVP Showcase with Exact Theme Palette ──
    if (isPlayerOfSeries) {
      const { mvpList } = (() => {
        const matchesToScan = (tournamentMatches && tournamentMatches.length > 0) ? tournamentMatches : [match];
        const batMap: Record<string, any> = {};
        const bowlMap: Record<string, any> = {};
        matchesToScan.forEach(m => {
          const ss = m.scoringState;
          if (!ss) return;
          const allInns = [
            { team: ss.battingTeam === "team1" ? m.team1Name : m.team2Name, inn: ss },
            ...(ss.firstInnings ? [{ team: ss.battingTeam === "team1" ? m.team2Name : m.team1Name, inn: ss.firstInnings }] : [])
          ];
          allInns.forEach(({ team, inn }) => {
            inn.batsmen?.forEach((b: BatsmanStats) => {
              if (!b.name) return;
              if (!batMap[b.name]) batMap[b.name] = { name: b.name, team, runs: 0, balls: 0, fours: 0, sixes: 0 };
              batMap[b.name].runs += (b.runs || 0);
              batMap[b.name].balls += (b.balls || 0);
              batMap[b.name].fours += (b.fours || 0);
              batMap[b.name].sixes += (b.sixes || 0);
            });
            const bowlTeamName = team === m.team1Name ? m.team2Name : m.team1Name;
            inn.bowlers?.forEach((bw: BowlerStats) => {
              if (!bw.name) return;
              if (!bowlMap[bw.name]) bowlMap[bw.name] = { name: bw.name, team: bowlTeamName, wickets: 0, runsConceded: 0, ballsBowled: 0 };
              bowlMap[bw.name].wickets += (bw.wickets || 0);
              bowlMap[bw.name].runsConceded += (bw.runsConceded || 0);
              bowlMap[bw.name].ballsBowled += (bw.ballsBowled || 0);
            });
          });
        });

        const allNames = Array.from(new Set([...Object.keys(batMap), ...Object.keys(bowlMap), ...(match.playersTeam1 || []), ...(match.playersTeam2 || [])]));
        let list = allNames.map(name => {
          const b = batMap[name] || { name, team: (match.playersTeam1 || []).includes(name) ? match.team1Name : match.team2Name, runs: 0, balls: 0, fours: 0, sixes: 0 };
          const bw = bowlMap[name] || { name, team: b.team, wickets: 0, runsConceded: 0, ballsBowled: 0 };
          const momCount = matchesToScan.filter(m => m.scoringState?.momPlayer === name).length;
          const score = (b.runs * 1) + (b.sixes * 2) + (bw.wickets * 25) + (momCount * 50);
          return {
            name,
            team: b.team || match.team1Name,
            runs: b.runs,
            wickets: bw.wickets,
            momCount,
            score,
            sr: b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0",
            eco: bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * (match.ballsPerOver || 6)).toFixed(2) : "0.00"
          };
        }).sort((a, b) => b.score - a.score || b.runs - a.runs);

        if (list.length === 0) {
          list = [
            { name: scoringState.striker || "Star All-Rounder", team: match.team1Name, runs: 96, wickets: 3, momCount: 2, score: 271, sr: "188.2", eco: "5.50" },
            { name: scoringState.bowler || "Key Match Winner", team: match.team2Name, runs: 42, wickets: 5, momCount: 1, score: 217, sr: "150.0", eco: "4.80" }
          ];
        }
        return { mvpList: list };
      })();

      const leader = mvpList[0];
      const isIpl2025 = themeSlug === "ipl-2025";
      const isBblStar = themeSlug === "bbl-starsports";
      const isAsiaCup = themeSlug === "asia-cup" || themeSlug === "t20-emerging-asia-cup";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isBblBlack = themeSlug === "bbl-black";
      const cardAccent = isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#a3e635" : (theme.accent || "#fbbf24");
      const cardAccent2 = isBblBlack ? "#FDFDFE" : isCwc23 ? "#FFFFFF" : isCwc25 ? "#FFFFFF" : isAsiaCup ? "#FDFDFE" : isBblStar ? "#ffc72c" : isIpl2025 ? "#bef264" : (theme.accentText || theme.accent);
      const cardTitleAccent = isBblBlack ? "#ec4899" : isCwc23 ? "#D946EF" : isCwc25 ? "#0373AF" : isAsiaCup ? "#E58808" : isBblStar ? "#00a0e9" : isIpl2025 ? "#c8e63c" : (theme.accent || "#fbbf24");
      const headerBgGrad = isBblBlack
        ? "linear-gradient(180deg, #22095A 0%, #310f7d 100%)"
        : isCwc23
          ? "linear-gradient(180deg, #080721 0%, #150f38 100%)"
          : isCwc25
            ? "linear-gradient(180deg, #14122A 0%, #1e1a40 100%)"
            : isAsiaCup
              ? "linear-gradient(180deg, #142248 0%, #1c3066 100%)"
              : isBblStar
                ? "linear-gradient(180deg, #001248 0%, #001f70 100%)"
                : isIpl2025
                  ? "linear-gradient(180deg, rgba(8, 28, 12, 0.95) 0%, rgba(18, 55, 24, 0.92) 50%, rgba(8, 28, 12, 0.95) 100%)"
                  : `linear-gradient(180deg, ${theme.headerBg || "rgba(10,15,30,0.98)"} 0%, ${theme.primaryBg || "rgba(15,25,50,0.95)"} 100%)`;
      const bodyBgGrad = isBblBlack
        ? "linear-gradient(180deg, #16053b 0%, #22095A 50%, #16053b 100%)"
        : isCwc23
          ? "linear-gradient(180deg, #050414 0%, #080721 50%, #050414 100%)"
          : isCwc25
            ? "linear-gradient(180deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)"
            : isAsiaCup
              ? "linear-gradient(180deg, #0c152d 0%, #142248 50%, #0c152d 100%)"
              : isBblStar
                ? "linear-gradient(180deg, #000c36 0%, #00144e 50%, #000c36 100%)"
                : isIpl2025
                  ? "linear-gradient(180deg, #040e32 0%, #030a24 50%, #02071d 100%)"
                  : `linear-gradient(180deg, ${theme.primaryBg || "rgba(10,15,35,0.98)"} 0%, ${theme.secondaryBg || "rgba(5,8,20,0.98)"} 100%)`;
      const bottomPillBgGrad = isBblBlack
        ? "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)"
        : isCwc23
          ? "linear-gradient(90deg, #D946EF 0%, #e879f9 50%, #D946EF 100%)"
          : isCwc25
            ? "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)"
            : isAsiaCup
              ? "linear-gradient(90deg, #E58808 0%, #f59e0b 50%, #E58808 100%)"
              : isBblStar
                ? "linear-gradient(90deg, #00a0e9 0%, #38bdf8 50%, #00a0e9 100%)"
                : isIpl2025
                  ? "linear-gradient(90deg, #9ae62e 0%, #bef264 50%, #9ae62e 100%)"
                  : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentText || theme.accent} 50%, ${theme.accent} 100%)`;
      const fontStyle = THEME_FONTS[themeSlug] || panelFont;

      const getShortNameLocal = (name: string) => {
        if (!name) return "IPL";
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 3).toUpperCase();
      };

      const t1Short = getShortNameLocal(match.team1Name);
      const t2Short = getShortNameLocal(match.team2Name);
      const tourTitle = (match as any).tournamentName || "HARYAN SUPER LEAGUE (2ND EDITION) JUNIOR";

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStyle,
          overflow: "hidden",
          padding: "20px 0",
          gap: "14px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />



          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          {/* TOP HEADER PILL */}
          <div className="animate-slide-up" style={{
            background: headerBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "10px 24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${cardAccent}40`,
            width: "min(92vw, 1080px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})`,
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#030a24", fontSize: "17px", fontWeight: 950 }}>{t1Short}</span>
            </div>

            <div style={{ textAlign: "center", flex: 1, padding: "0 14px" }}>
              <div style={{
                color: cardTitleAccent,
                fontSize: "26px",
                fontWeight: 950,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: `0 0 16px ${cardAccent}80`
              }}>
                PLAYER OF THE TOURNAMENT · MVP
              </div>
              <div style={{
                color: cardAccent2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: "3px"
              }}>
                {tourTitle}
              </div>
            </div>

            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              flexShrink: 0
            }}>
              <span style={{ color: "#ffffff", fontSize: "17px", fontWeight: 950 }}>{t2Short}</span>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="animate-slide-up" style={{
            background: bodyBgGrad,
            border: `2px solid ${cardAccent}`,
            borderRadius: "22px",
            padding: "20px 24px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 24px ${cardAccent}33`,
            width: "min(92vw, 1080px)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Header Strip */}
            <div style={{
              background: "rgba(255, 255, 255, 0.14)",
              borderRadius: "8px",
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950, letterSpacing: "1px", width: "40px" }}>POS</span>
              <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", width: "200px", textAlign: "left" }}>PLAYER</span>
              <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", flex: 1, textAlign: "left" }}>TEAM</span>
              <div style={{ display: "grid", gridTemplateColumns: "60px 60px 60px 85px", textAlign: "right", gap: "10px" }}>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>RUNS</span>
                <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>WKTS</span>
                <span style={{ color: cardAccent2, fontSize: "12px", fontWeight: 900 }}>MOM</span>
                <span style={{ color: cardAccent, fontSize: "12px", fontWeight: 950 }}>IMPACT PTS</span>
              </div>
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {mvpList.map((mv: any, i: number) => {
                const isLeader = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${cardAccent}26`,
                      background: isLeader ? `${cardAccent}14` : "transparent",
                      borderRadius: "6px"
                    }}
                  >
                    <div style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: isLeader ? `linear-gradient(135deg, ${cardAccent}, ${cardAccent2})` : "rgba(255,255,255,0.1)",
                      color: isLeader ? "#030a24" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: 950,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "14px"
                    }}>
                      {i + 1}
                    </div>

                    <div style={{
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: 950,
                      width: "200px",
                      textAlign: "left",
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {mv.name} {isLeader && <span style={{ color: cardAccent, fontSize: "11px" }}>⭐</span>}
                    </div>

                    <div style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                      fontWeight: 800,
                      flex: 1,
                      textAlign: "left",
                      textTransform: "uppercase"
                    }}>
                      {mv.team}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "60px 60px 60px 85px", textAlign: "right", gap: "10px" }}>
                      <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 800 }}>{mv.runs}</span>
                      <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 800 }}>{mv.wickets}</span>
                      <span style={{ color: cardAccent2, fontSize: "15px", fontWeight: 900 }}>{mv.momCount}×⭐</span>
                      <span style={{ color: cardAccent, fontSize: "18px", fontWeight: 950 }}>{mv.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM PILL */}
          <div className="animate-slide-up" style={{
            background: bottomPillBgGrad,
            borderRadius: "20px",
            padding: "10px 28px",
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 18px ${cardAccent}55`,
            width: "min(92vw, 1080px)",
            textAlign: "center"
          }}>
            <div style={{ color: "#030a24", fontSize: "15px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase" }}>
              PLAYER OF SERIES LEADER: {leader?.name.toUpperCase()} ({leader?.score} IMPACT POINTS)
            </div>
          </div>
        </div>
      );
    }

    // ── TOURNAMENT NAME & TEAMS MATCHUP BANNER (ALL THEMES) ────────────────
    if (isTourMatch) {
      const getShortNameLocal = (name: string) => {
        const words = (name || "").trim().split(/\s+/).filter(Boolean);
        if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
        return (name || "").slice(0, 3).toUpperCase();
      };
      const tourTitle = (match as any).tournamentName || "TOURNAMENT CHAMPIONSHIP";
      const team1 = match.team1Name || "TEAM A";
      const team2 = match.team2Name || "TEAM B";
      const t1Short = getShortNameLocal(team1);
      const t2Short = getShortNameLocal(team2);
      const stageText = (match as any).stage || (match as any).tournamentStage || (match as any).round || (match.matchNo ? `MATCH #${match.matchNo}` : "FIXTURE");
      const venueText = (match as any).venue || (match as any).ground || "OFFICIAL VENUE";
      const tossWinner = match.tossWonBy === "team1" ? team1 : match.tossWonBy === "team2" ? team2 : null;
      const tossDecision = match.optedTo === "Bat" ? "BAT FIRST" : match.optedTo === "Bowl" ? "BOWL FIRST" : null;
      const tossText = tossWinner && tossDecision ? `TOSS: ${tossWinner.toUpperCase()} OPTED TO ${tossDecision}` : `${match.overs} OVERS PER SIDE`;

      // ── Theme-specific styling tokens ──
      const isIpl2025 = themeSlug === "ipl-2025" || themeSlug === "ipl";
      const isBbl = themeSlug === "bbl-starsports" || themeSlug === "bbl-black";
      const isJio = themeSlug === "jiocinema" || themeSlug === "geo-cinema";
      const isEac = themeSlug === "t20-emerging-asia-cup";
      const isCwc23 = themeSlug === "cwc-23-india";
      const isCwc25 = themeSlug === "cwc-25-india" || themeSlug === "wt20-2024";
      const isCwc19 = themeSlug === "cwc-19";
      const isCt25 = themeSlug === "champions-trophy-2025";
      const isSa20 = themeSlug === "sa20";
      const isFusion = themeSlug === "cricfusion";
      const isCri = themeSlug === "crioverlay-green";
      const isWcl = themeSlug === "wcl-fancode";
      const isAsia = themeSlug === "asia-cup";

      const cardBg = isIpl2025
        ? "linear-gradient(135deg, rgba(10, 17, 40, 0.96) 0%, rgba(16, 31, 66, 0.98) 100%)"
        : isBbl
          ? "linear-gradient(135deg, rgba(12, 6, 26, 0.97) 0%, rgba(26, 11, 48, 0.98) 100%)"
          : isJio
            ? "linear-gradient(135deg, rgba(11, 17, 32, 0.97) 0%, rgba(18, 28, 48, 0.98) 100%)"
            : isEac
              ? "linear-gradient(135deg, rgba(12, 37, 96, 0.98) 0%, rgba(8, 23, 61, 0.98) 100%)"
              : isCwc23
                ? "linear-gradient(135deg, rgba(8, 7, 33, 0.98) 0%, rgba(21, 13, 58, 0.98) 100%)"
                : isCwc25
                  ? "linear-gradient(135deg, rgba(14, 19, 40, 0.98) 0%, rgba(24, 20, 56, 0.98) 100%)"
                  : isCt25
                    ? "linear-gradient(135deg, rgba(10, 18, 42, 0.98) 0%, rgba(6, 43, 27, 0.98) 100%)"
                    : isSa20
                      ? "linear-gradient(135deg, rgba(23, 23, 5, 0.98) 0%, rgba(41, 36, 8, 0.98) 100%)"
                      : isFusion
                        ? "linear-gradient(135deg, rgba(18, 4, 6, 0.98) 0%, rgba(46, 9, 11, 0.98) 100%)"
                        : isCri
                          ? "linear-gradient(135deg, rgba(9, 17, 32, 0.98) 0%, rgba(5, 26, 20, 0.98) 100%)"
                          : isWcl
                            ? "linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%)"
                            : isAsia
                              ? "linear-gradient(135deg, rgba(20, 34, 72, 0.98) 0%, rgba(11, 21, 48, 0.98) 100%)"
                              : `linear-gradient(135deg, ${theme.headerBg}, ${theme.primaryBg})`;

      const cardBorder = isIpl2025 ? "2.5px solid #38bdf8"
        : isBbl ? "2.5px solid #ec4899"
          : isJio ? "2.5px solid #e11d48"
            : isEac ? "2.5px solid #facc15"
              : isCwc23 ? "2.5px solid #d946ef"
                : isCwc25 ? "2.5px solid #00e5ff"
                  : isCt25 ? "2.5px solid #03a360"
                    : isSa20 ? "2.5px solid #ebb509"
                      : isFusion ? "2.5px solid #cc271f"
                        : isCri ? "2.5px solid #74fb05"
                          : isWcl ? "2.5px solid #0284c7"
                            : isAsia ? "2.5px solid #e58808"
                              : `2.5px solid ${theme.borderColor}`;

      const cardShadow = isIpl2025 ? "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(56,189,248,0.25)"
        : isBbl ? "0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(236,72,153,0.3)"
          : isJio ? "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(225,29,72,0.25)"
            : isEac ? "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(250,204,21,0.25)"
              : isCwc23 ? "0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(217,70,239,0.3)"
                : `0 25px 60px rgba(0,0,0,0.8), 0 0 30px ${theme.accent}30`;

      const primaryAccent = isIpl2025 ? "#facc15"
        : isBbl ? "#ec4899"
          : isJio ? "#e11d48"
            : isEac ? "#facc15"
              : isCwc23 ? "#d946ef"
                : isCwc25 ? "#00e5ff"
                  : isCt25 ? "#03a360"
                    : isSa20 ? "#ebb509"
                      : isFusion ? "#cc271f"
                        : isCri ? "#74fb05"
                          : isWcl ? "#0284c7"
                            : isAsia ? "#e58808"
                              : theme.accent;

      const secondaryAccent = isIpl2025 ? "#38bdf8"
        : isBbl ? "#06b6d4"
          : isJio ? "#ffffff"
            : isEac ? "#781010"
              : isCwc23 ? "#0ea5e9"
                : isCwc25 ? "#ff007f"
                  : isCt25 ? "#f59e0b"
                    : isSa20 ? "#ffffff"
                      : isFusion ? "#f97316"
                        : isCri ? "#38bdf8"
                          : isWcl ? "#38bdf8"
                            : isAsia ? "#facc15"
                              : theme.textSecondary;

      const team1Grad = isJio ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
        : isEac ? "linear-gradient(135deg, #0c2560 0%, #16469d 100%)"
          : isCwc23 ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
            : isBbl ? "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)"
              : `linear-gradient(135deg, ${theme.primaryBg}, ${theme.headerBg})`;

      const team2Grad = isJio ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
        : isEac ? "linear-gradient(135deg, #781010 0%, #991b1b 100%)"
          : isCwc23 ? "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)"
            : isBbl ? "linear-gradient(135deg, #be185d 0%, #831843 100%)"
              : `linear-gradient(135deg, ${theme.secondaryBg}, ${theme.headerBg})`;

      return (
        <div className="fade-in" style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: activeFont,
          overflow: "hidden",
          padding: "24px 20px"
        }}>
          <style>{GLOBAL_CSS}</style>
          <GroundBG bgUrl={theme.bgUrl} />
          {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

          <div className="animate-slide-up" style={{
            position: "relative",
            zIndex: 10,
            width: "min(94vw, 980px)",
            background: cardBg,
            border: cardBorder,
            borderRadius: "24px",
            padding: "36px 40px",
            boxShadow: cardShadow,
            backdropFilter: "blur(16px)",
            textAlign: "center",
            overflow: "hidden"
          }}>
            {/* Top Glow Ambient Strip */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "2px",
              background: `linear-gradient(90deg, transparent, ${primaryAccent}, transparent)`
            }} />

            {/* ── 1. TOURNAMENT HEADER STRIP ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "26px" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 20px",
                background: "rgba(255, 255, 255, 0.08)",
                border: `1px solid ${primaryAccent}55`,
                borderRadius: "30px",
                marginBottom: "12px",
                boxShadow: `0 4px 15px rgba(0,0,0,0.3)`
              }}>
                <span style={{ fontSize: "14px" }}>🏆</span>
                <span style={{
                  color: primaryAccent,
                  fontSize: "12px",
                  fontWeight: 950,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase"
                }}>
                  {stageText}
                </span>
              </div>

              <div style={{
                color: "#ffffff",
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 950,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                lineHeight: 1.15,
                textShadow: `0 2px 20px ${primaryAccent}80, 0 4px 10px rgba(0,0,0,0.8)`
              }}>
                {tourTitle}
              </div>
            </div>

            {/* ── 2. MATCHUP FIXTURE (TEAM 1 VS TEAM 2) ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: "24px",
              margin: "30px 0 28px"
            }}>
              {/* Team 1 Box */}
              <div style={{
                background: team1Grad,
                border: `1.5px solid rgba(255,255,255,0.18)`,
                borderRadius: "18px",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                transition: "transform 0.3s ease"
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
                  border: `2px solid ${primaryAccent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 950,
                  color: "#ffffff",
                  boxShadow: `0 0 16px ${primaryAccent}55`
                }}>
                  {t1Short}
                </div>
                <div style={{
                  color: "#ffffff",
                  fontSize: "clamp(18px, 2.4vw, 26px)",
                  fontWeight: 950,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  textAlign: "center",
                  wordBreak: "break-word"
                }}>
                  {team1}
                </div>
              </div>

              {/* Central VS Emblem */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                flexShrink: 0
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${primaryAccent} 0%, ${secondaryAccent} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isJio || isEac || isSa20 ? "#000000" : "#ffffff",
                  fontWeight: 950,
                  fontSize: "20px",
                  letterSpacing: "1px",
                  boxShadow: `0 0 25px ${primaryAccent}99, 0 6px 14px rgba(0,0,0,0.6)`,
                  border: "2px solid #ffffff"
                }}>
                  VS
                </div>
                <span style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "2px",
                  textTransform: "uppercase"
                }}>
                  MATCH
                </span>
              </div>

              {/* Team 2 Box */}
              <div style={{
                background: team2Grad,
                border: `1.5px solid rgba(255,255,255,0.18)`,
                borderRadius: "18px",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                transition: "transform 0.3s ease"
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
                  border: `2px solid ${secondaryAccent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 950,
                  color: "#ffffff",
                  boxShadow: `0 0 16px ${secondaryAccent}55`
                }}>
                  {t2Short}
                </div>
                <div style={{
                  color: "#ffffff",
                  fontSize: "clamp(18px, 2.4vw, 26px)",
                  fontWeight: 950,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  textAlign: "center",
                  wordBreak: "break-word"
                }}>
                  {team2}
                </div>
              </div>
            </div>

            {/* ── 3. BOTTOM METADATA BAR ── */}
            <div style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: primaryAccent, fontSize: "14px" }}>📍</span>
                <span style={{ color: "#ffffff", fontSize: "12.5px", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {venueText}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  background: primaryAccent,
                  color: isJio || isEac || isSa20 ? "#000000" : "#ffffff",
                  fontSize: "10.5px",
                  fontWeight: 950,
                  letterSpacing: "1px",
                  padding: "3px 12px",
                  borderRadius: "20px",
                  textTransform: "uppercase"
                }}>
                  {tossText}
                </span>
              </div>
            </div>

          </div>
        </div>
      );
    }
  }

  // ════════════════════ SCOREBOARD PRE-MATCH / TOSS RIBBON (ALL 16 THEMES) ════════════════════
  const renderScoreboardPreMatchRibbon = (
    currentThemeSlug: string,
    currentMatch: any
  ) => {
    const isGreenTheme = currentThemeSlug === "crioverlay-green";
    const tossWinnerName = currentMatch?.tossWonBy === "team1" ? currentMatch?.team1Name : currentMatch?.team2Name;
    const tossDecisionText = currentMatch?.optedTo === "Bat" ? "BAT" : "BOWL";
    const hasToss = !!currentMatch?.tossWonBy;

    // Themed Colors Palette for All 16 Themes
    let barBg = "linear-gradient(90deg, rgba(8, 24, 60, 0.95) 0%, rgba(3, 10, 30, 0.98) 50%, rgba(8, 24, 60, 0.95) 100%)";
    let barBorder = "#38bdf8";
    let barShadow = "0 8px 30px rgba(0,0,0,0.7), 0 0 20px rgba(56, 189, 248, 0.35)";
    let team1Color = "#ffffff";
    let team2Color = "#ffffff";
    let pillBg = "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)";
    let pillTextColor = "#ffffff";
    let pillBorder = "1.5px solid #ffffff";
    let pillShadow = "0 0 16px rgba(56, 189, 248, 0.6)";

    if (currentThemeSlug === "crioverlay-green") {
      barBg = "linear-gradient(90deg, #050b14 0%, #091120 50%, #050b14 100%)";
      barBorder = "#74fb05";
      barShadow = "0 8px 32px rgba(0,0,0,0.8), 0 0 24px rgba(116, 251, 5, 0.4)";
      team1Color = "#b2ff59";
      team2Color = "#b2ff59";
      pillBg = "linear-gradient(180deg, #b2ff59 0%, #76ff03 50%, #64dd17 100%)";
      pillTextColor = "#000000";
      pillBorder = "2px solid #000000";
      pillShadow = "0 0 20px rgba(116, 251, 5, 0.75)";
    } else if (currentThemeSlug === "asia-cup") {
      barBg = "linear-gradient(90deg, #0c152d 0%, #142248 50%, #0c152d 100%)";
      barBorder = "#E58808";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(229, 136, 8, 0.4)";
      team1Color = "#FDFDFE";
      team2Color = "#FDFDFE";
      pillBg = "linear-gradient(180deg, #E58808 0%, #ca8a04 100%)";
      pillTextColor = "#142248";
      pillBorder = "1.5px solid #FDFDFE";
      pillShadow = "0 0 16px rgba(229, 136, 8, 0.6)";
    } else if (currentThemeSlug === "cwc-19") {
      barBg = "linear-gradient(90deg, #040c18 0%, #07152B 50%, #040c18 100%)";
      barBorder = "#02B3E4";
      team1Color = "#02B3E4";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #02B3E4 0%, #0284c7 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(2, 179, 228, 0.6)";
    } else if (currentThemeSlug === "champions-trophy-2025") {
      barBg = "linear-gradient(90deg, #060c1c 0%, #0A122A 50%, #060c1c 100%)";
      barBorder = "#03A360";
      team1Color = "#34d399";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #03A360 0%, #10b981 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(3, 163, 96, 0.6)";
    } else if (currentThemeSlug === "cwc-25-india" || currentThemeSlug === "wt20-2024") {
      barBg = "linear-gradient(90deg, #0d0c1c 0%, #14122A 50%, #0d0c1c 100%)";
      barBorder = "#0373AF";
      team1Color = "#38bdf8";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #0373AF 0%, #0284c7 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(3, 115, 175, 0.6)";
    } else if (currentThemeSlug === "wcl-fancode") {
      barBg = "linear-gradient(90deg, #111827 0%, #1F2937 50%, #111827 100%)";
      barBorder = "#0284C7";
      team1Color = "#38bdf8";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #0284C7 0%, #38bdf8 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(2, 132, 199, 0.6)";
    } else if (currentThemeSlug === "cwc-23-india") {
      barBg = "linear-gradient(90deg, #050414 0%, #080721 50%, #050414 100%)";
      barBorder = "#D946EF";
      team1Color = "#f5d0fe";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #D946EF 0%, #c026d3 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(217, 70, 239, 0.6)";
    } else if (currentThemeSlug === "bbl-black") {
      barBg = "linear-gradient(90deg, #16053b 0%, #22095A 50%, #16053b 100%)";
      barBorder = "#ec4899";
      team1Color = "#f472b6";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #ec4899 0%, #db2777 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(236, 72, 153, 0.6)";
    } else if (currentThemeSlug === "cricfusion") {
      barBg = "linear-gradient(90deg, #0a0203 0%, #120406 50%, #0a0203 100%)";
      barBorder = "#CC271F";
      team1Color = "#f87171";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #CC271F 0%, #ef4444 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(204, 39, 31, 0.6)";
    } else if (currentThemeSlug === "t20-emerging-asia-cup") {
      barBg = "linear-gradient(90deg, #07173e 0%, #0C2560 50%, #07173e 100%)";
      barBorder = "#facc15";
      team1Color = "#fde047";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #facc15 0%, #eab308 100%)";
      pillTextColor = "#000000";
      pillBorder = "1.5px solid #000000";
      pillShadow = "0 0 16px rgba(250, 204, 21, 0.6)";
    } else if (currentThemeSlug === "sa20") {
      barBg = "linear-gradient(90deg, #0e0e03 0%, #171705 50%, #0e0e03 100%)";
      barBorder = "#EBB509";
      team1Color = "#fde047";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #EBB509 0%, #ca8a04 100%)";
      pillTextColor = "#171705";
      pillBorder = "1.5px solid #171705";
      pillShadow = "0 0 16px rgba(235, 181, 9, 0.6)";
    } else if (currentThemeSlug === "jiocinema" || currentThemeSlug === "geo-cinema") {
      barBg = "linear-gradient(90deg, #070b14 0%, #0D1322 50%, #070b14 100%)";
      barBorder = "#db2777";
      team1Color = "#f472b6";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #db2777 0%, #be185d 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(219, 39, 119, 0.6)";
    } else if (currentThemeSlug === "ipl") {
      barBg = "linear-gradient(90deg, #060b1e 0%, #0A112E 50%, #060b1e 100%)";
      barBorder = "#F3A714";
      team1Color = "#fbbf24";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #F3A714 0%, #d97706 100%)";
      pillTextColor = "#000000";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(243, 167, 20, 0.6)";
    } else if (currentThemeSlug === "bbl-starsports") {
      barBg = "linear-gradient(90deg, #000c36 0%, #00144e 50%, #000c36 100%)";
      barBorder = "#00a0e9";
      team1Color = "#38bdf8";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #00a0e9 0%, #0284c7 100%)";
      pillTextColor = "#ffffff";
      pillBorder = "1.5px solid #ffffff";
      pillShadow = "0 0 16px rgba(0, 160, 233, 0.6)";
    } else if (currentThemeSlug === "ipl-2025") {
      barBg = "linear-gradient(90deg, #040e32 0%, #030a24 50%, #02071d 100%)";
      barBorder = "#c8e63c";
      team1Color = "#bef264";
      team2Color = "#ffffff";
      pillBg = "linear-gradient(180deg, #c8e63c 0%, #a3e635 100%)";
      pillTextColor = "#000000";
      pillBorder = "1.5px solid #000000";
      pillShadow = "0 0 16px rgba(200, 230, 60, 0.6)";
    }

    if (isGreenTheme) {
      const abbr = (name: string) => (name || "").slice(0, 3).toUpperCase();
      return (
        <div style={{ display: "flex", alignItems: "flex-end", width: "100%", position: "relative" }}>
          {/* Left badge */}
          <div className="g-badge g-badge-l">{abbr(currentMatch?.team1Name || "T1")}</div>

          {/* Main pre-match banner matching full scoreboard width */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "76px",
            background: barBg,
            borderRadius: "18px",
            border: `3px solid ${barBorder}`,
            boxShadow: barShadow,
            padding: "8px 24px",
            position: "relative",
            zIndex: 20,
            overflow: "hidden",
            minWidth: 0
          }}>
            {/* Team 1 Left */}
            <div style={{
              flex: 1,
              textAlign: "left",
              color: team1Color,
              fontSize: "20px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase",
              paddingLeft: "10px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {currentMatch?.team1Name}
            </div>

            {/* Center Elevated Toss Pill */}
            <div style={{
              background: pillBg,
              color: pillTextColor,
              border: pillBorder,
              borderRadius: "16px",
              padding: "8px 28px",
              textAlign: "center",
              boxShadow: pillShadow,
              margin: "0 12px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {hasToss ? (
                <>
                  <span style={{ fontSize: "13px", fontWeight: 950, letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: 1.15 }}>
                    {tossWinnerName.toUpperCase()} WON THE TOSS
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 950, letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: 1.15 }}>
                    AND ELECTED TO {tossDecisionText}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: "13px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase", lineHeight: 1.15 }}>
                    MATCH NOT STARTED
                  </span>
                  <span style={{ fontSize: "11.5px", fontWeight: 900, letterSpacing: "0.8px", textTransform: "uppercase", opacity: 0.9, lineHeight: 1.15 }}>
                    {currentMatch?.overs} OVERS MATCH
                  </span>
                </>
              )}
            </div>

            {/* Team 2 Right */}
            <div style={{
              flex: 1,
              textAlign: "right",
              color: team2Color,
              fontSize: "20px",
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase",
              paddingRight: "10px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {currentMatch?.team2Name}
            </div>
          </div>

          {/* Right badge */}
          <div className="g-badge g-badge-r">{abbr(currentMatch?.team2Name || "T2")}</div>
        </div>
      );
    }

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "48px",
        minHeight: "48px",
        background: barBg,
        borderRadius: "8px",
        border: `2px solid ${barBorder}`,
        boxShadow: barShadow,
        padding: "4px 20px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Team 1 Left */}
        <div style={{
          flex: 1,
          textAlign: "left",
          color: team1Color,
          fontSize: "14px",
          fontWeight: 950,
          letterSpacing: "1px",
          textTransform: "uppercase",
          paddingLeft: "8px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {currentMatch?.team1Name}
        </div>

        {/* Center Elevated Toss Pill */}
        <div style={{
          background: pillBg,
          color: pillTextColor,
          border: pillBorder,
          borderRadius: "14px",
          padding: "5px 22px",
          textAlign: "center",
          boxShadow: pillShadow,
          margin: "0 12px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {hasToss ? (
            <>
              <span style={{ fontSize: "11px", fontWeight: 950, letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: 1.15 }}>
                {tossWinnerName.toUpperCase()} WON THE TOSS
              </span>
              <span style={{ fontSize: "11px", fontWeight: 950, letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: 1.15 }}>
                AND ELECTED TO {tossDecisionText}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "11px", fontWeight: 950, letterSpacing: "1px", textTransform: "uppercase", lineHeight: 1.15 }}>
                MATCH NOT STARTED
              </span>
              <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.8px", textTransform: "uppercase", opacity: 0.9, lineHeight: 1.15 }}>
                {currentMatch?.overs} OVERS MATCH
              </span>
            </>
          )}
        </div>

        {/* Team 2 Right */}
        <div style={{
          flex: 1,
          textAlign: "right",
          color: team2Color,
          fontSize: "14px",
          fontWeight: 950,
          letterSpacing: "1px",
          textTransform: "uppercase",
          paddingRight: "8px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {currentMatch?.team2Name}
        </div>
      </div>
    );
  };

  // ════════════════════ SCOREBOARD TOURNAMENT BOUNDARIES RIBBON (ALL 16 THEMES) ════════════════════
  const renderScoreboardTourBoundariesRibbon = (
    currentThemeSlug: string,
    currentMatch: any,
    currentTournamentMatches: any[]
  ) => {
    const isGreenTheme = currentThemeSlug === "crioverlay-green";

    // Aggregate boundaries (4s and 6s) hit by ALL teams across ALL matches in this tournament
    let tourTotalFours = 0;
    let tourTotalSixes = 0;

    const allMatchesMap = new Map<string, any>();
    if (currentTournamentMatches && currentTournamentMatches.length > 0) {
      currentTournamentMatches.forEach(m => {
        if (m._id) allMatchesMap.set(m._id.toString(), m);
      });
    }
    if (currentMatch?._id) {
      allMatchesMap.set(currentMatch._id.toString(), currentMatch);
    } else if (allMatchesMap.size === 0 && currentMatch) {
      allMatchesMap.set("current", currentMatch);
    }

    const matchesList = Array.from(allMatchesMap.values());
    matchesList.forEach((m: any) => {
      // 1st or current innings batsmen from whichever team was batting
      if (m.scoringState?.batsmen && Array.isArray(m.scoringState.batsmen)) {
        m.scoringState.batsmen.forEach((b: any) => {
          tourTotalFours += Number(b.fours || 0);
          tourTotalSixes += Number(b.sixes || 0);
        });
      }
      // Archived first innings batsmen (when in 2nd innings or completed match)
      if (m.scoringState?.firstInnings?.batsmen && Array.isArray(m.scoringState.firstInnings.batsmen)) {
        m.scoringState.firstInnings.batsmen.forEach((b: any) => {
          tourTotalFours += Number(b.fours || 0);
          tourTotalSixes += Number(b.sixes || 0);
        });
      }
      // Archived second innings batsmen if present
      if (m.scoringState?.secondInnings?.batsmen && Array.isArray(m.scoringState.secondInnings.batsmen)) {
        m.scoringState.secondInnings.batsmen.forEach((b: any) => {
          tourTotalFours += Number(b.fours || 0);
          tourTotalSixes += Number(b.sixes || 0);
        });
      }
    });

    const tourTotalBoundaries = tourTotalFours + tourTotalSixes;

    // Themed Colors Palette for All 16 Themes
    let accentColor = "#38bdf8";
    let circleBg = "#050b14";
    let circleBorder = "#38bdf8";
    let circleShadow = "0 0 18px rgba(56, 189, 248, 0.6)";
    let circleTextColor = "#ffffff";
    let barBg = "linear-gradient(90deg, #050b14 0%, #0d1a30 100%)";
    let barBorder = "1.5px solid rgba(56, 189, 248, 0.4)";
    let barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.25)";
    let subtitleColor = "#94a3b8";

    if (currentThemeSlug === "crioverlay-green") {
      accentColor = "#74fb05";
      circleBg = "#050b14";
      circleBorder = "#74fb05";
      circleShadow = "0 0 20px #74fb05, inset 0 0 10px rgba(116, 251, 5, 0.3)";
      circleTextColor = "#74fb05";
      barBg = "linear-gradient(90deg, #050b14 0%, #091120 50%, #050b14 100%)";
      barBorder = "1.5px solid rgba(116, 251, 5, 0.4)";
      barShadow = "0 8px 32px rgba(0,0,0,0.8), 0 0 24px rgba(116, 251, 5, 0.4)";
      subtitleColor = "#94a3b8";
    } else if (currentThemeSlug === "asia-cup") {
      accentColor = "#E58808";
      circleBg = "#0c152d";
      circleBorder = "#E58808";
      circleShadow = "0 0 18px rgba(229, 136, 8, 0.6)";
      circleTextColor = "#FDFDFE";
      barBg = "linear-gradient(90deg, #0c152d 0%, #142248 100%)";
      barBorder = "1.5px solid #E58808";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(229, 136, 8, 0.4)";
      subtitleColor = "#cbd5e1";
    } else if (currentThemeSlug === "cwc-19") {
      accentColor = "#02B3E4";
      circleBg = "#040c18";
      circleBorder = "#02B3E4";
      circleShadow = "0 0 18px rgba(2, 179, 228, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #040c18 0%, #07152B 100%)";
      barBorder = "1.5px solid #02B3E4";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(2, 179, 228, 0.4)";
      subtitleColor = "#94a3b8";
    } else if (currentThemeSlug === "champions-trophy-2025") {
      accentColor = "#03A360";
      circleBg = "#060c1c";
      circleBorder = "#03A360";
      circleShadow = "0 0 18px rgba(3, 163, 96, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #060c1c 0%, #0A122A 100%)";
      barBorder = "1.5px solid #03A360";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(3, 163, 96, 0.4)";
      subtitleColor = "#94a3b8";
    } else if (currentThemeSlug === "cwc-25-india" || currentThemeSlug === "wt20-2024") {
      accentColor = "#0373AF";
      circleBg = "#0d0c1c";
      circleBorder = "#0373AF";
      circleShadow = "0 0 18px rgba(3, 115, 175, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #0d0c1c 0%, #14122A 100%)";
      barBorder = "1.5px solid #0373AF";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(3, 115, 175, 0.4)";
      subtitleColor = "#94a3b8";
    } else if (currentThemeSlug === "wcl-fancode") {
      accentColor = "#0284C7";
      circleBg = "#111827";
      circleBorder = "#0284C7";
      circleShadow = "0 0 18px rgba(2, 132, 199, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #111827 0%, #1F2937 100%)";
      barBorder = "1.5px solid #0284C7";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(2, 132, 199, 0.4)";
      subtitleColor = "#94a3b8";
    } else if (currentThemeSlug === "cwc-23-india") {
      accentColor = "#D946EF";
      circleBg = "#050414";
      circleBorder = "#D946EF";
      circleShadow = "0 0 18px rgba(217, 70, 239, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #050414 0%, #080721 100%)";
      barBorder = "1.5px solid #D946EF";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(217, 70, 239, 0.4)";
      subtitleColor = "#f5d0fe";
    } else if (currentThemeSlug === "bbl-black") {
      accentColor = "#ec4899";
      circleBg = "#16053b";
      circleBorder = "#ec4899";
      circleShadow = "0 0 18px rgba(236, 72, 153, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #16053b 0%, #22095A 100%)";
      barBorder = "1.5px solid #ec4899";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(236, 72, 153, 0.4)";
      subtitleColor = "#f472b6";
    } else if (currentThemeSlug === "cricfusion") {
      accentColor = "#CC271F";
      circleBg = "#0a0203";
      circleBorder = "#CC271F";
      circleShadow = "0 0 18px rgba(204, 39, 31, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #0a0203 0%, #120406 100%)";
      barBorder = "1.5px solid #CC271F";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(204, 39, 31, 0.4)";
      subtitleColor = "#f87171";
    } else if (currentThemeSlug === "t20-emerging-asia-cup") {
      accentColor = "#facc15";
      circleBg = "#07173e";
      circleBorder = "#facc15";
      circleShadow = "0 0 18px rgba(250, 204, 21, 0.6)";
      circleTextColor = "#facc15";
      barBg = "linear-gradient(90deg, #07173e 0%, #0C2560 100%)";
      barBorder = "1.5px solid #facc15";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(250, 204, 21, 0.4)";
      subtitleColor = "#fde047";
    } else if (currentThemeSlug === "sa20") {
      accentColor = "#EBB509";
      circleBg = "#0e0e03";
      circleBorder = "#EBB509";
      circleShadow = "0 0 18px rgba(235, 181, 9, 0.6)";
      circleTextColor = "#EBB509";
      barBg = "linear-gradient(90deg, #0e0e03 0%, #171705 100%)";
      barBorder = "1.5px solid #EBB509";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(235, 181, 9, 0.4)";
      subtitleColor = "#fde047";
    } else if (currentThemeSlug === "jiocinema" || currentThemeSlug === "geo-cinema") {
      accentColor = "#db2777";
      circleBg = "#070b14";
      circleBorder = "#db2777";
      circleShadow = "0 0 18px rgba(219, 39, 119, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #070b14 0%, #0D1322 100%)";
      barBorder = "1.5px solid #db2777";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(219, 39, 119, 0.4)";
      subtitleColor = "#f472b6";
    } else if (currentThemeSlug === "ipl") {
      accentColor = "#F3A714";
      circleBg = "#060b1e";
      circleBorder = "#F3A714";
      circleShadow = "0 0 18px rgba(243, 167, 20, 0.6)";
      circleTextColor = "#fbbf24";
      barBg = "linear-gradient(90deg, #060b1e 0%, #0A112E 100%)";
      barBorder = "1.5px solid #F3A714";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(243, 167, 20, 0.4)";
      subtitleColor = "#cbd5e1";
    } else if (currentThemeSlug === "bbl-starsports") {
      accentColor = "#00a0e9";
      circleBg = "#000c36";
      circleBorder = "#00a0e9";
      circleShadow = "0 0 18px rgba(0, 160, 233, 0.6)";
      circleTextColor = "#ffffff";
      barBg = "linear-gradient(90deg, #000c36 0%, #00144e 100%)";
      barBorder = "1.5px solid #00a0e9";
      barShadow = "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 160, 233, 0.4)";
      subtitleColor = "#94a3b8";
    } else if (currentThemeSlug === "ipl-2025") {
      accentColor = "#c8e63c";
      circleBg = "#040e32";
      circleBorder = "#c8e63c";
      circleShadow = "0 0 20px #c8e63c, inset 0 0 10px rgba(200, 230, 60, 0.3)";
      circleTextColor = "#c8e63c";
      barBg = "linear-gradient(90deg, #040e32 0%, #030a24 50%, #02071d 100%)";
      barBorder = "1.5px solid #c8e63c";
      barShadow = "0 8px 32px rgba(0,0,0,0.8), 0 0 24px rgba(200, 230, 60, 0.4)";
      subtitleColor = "#bef264";
    }

    const teamCrestText = (() => {
      const str = currentMatch?.tournamentName || "TOUR";
      const words = str.trim().split(/\s+/).filter(Boolean);
      if (words.length === 1) return str.slice(0, 4).toUpperCase();
      return words.map((w: string) => w[0]).join("").slice(0, 4).toUpperCase();
    })();

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        position: "relative",
        zIndex: 20,
        padding: "4px 0"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 10
        }}>
          {/* Left glowing circle crest matching screenshot */}
          <div style={{
            width: isGreenTheme ? "76px" : "52px",
            height: isGreenTheme ? "76px" : "52px",
            borderRadius: "50%",
            background: circleBg,
            border: isGreenTheme ? `3.5px solid ${circleBorder}` : `3px solid ${circleBorder}`,
            boxShadow: circleShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 12,
            marginRight: isGreenTheme ? "-20px" : "-14px",
            flexShrink: 0
          }}>
            <span style={{
              color: circleTextColor,
              fontSize: isGreenTheme ? "15px" : "12px",
              fontWeight: 950,
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              {teamCrestText}
            </span>
          </div>

          {/* Main Horizontal Rounded Box matching screenshot */}
          <div style={{
            background: barBg,
            border: barBorder,
            borderRadius: isGreenTheme ? "18px" : "10px",
            boxShadow: barShadow,
            padding: isGreenTheme ? "8px 24px 8px 34px" : "5px 18px 5px 28px",
            minHeight: isGreenTheme ? "80px" : "auto",
            minWidth: isGreenTheme ? "520px" : "360px",
            maxWidth: isGreenTheme ? "680px" : "500px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: isGreenTheme ? "4px" : "2px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Top row: Name & Boundaries score */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{
                  color: accentColor,
                  fontSize: isGreenTheme ? "16px" : "13.5px",
                  fontWeight: 950,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  lineHeight: 1.1
                }}>
                  TOURNAMENT BOUNDARIES
                </span>
                <span style={{
                  color: subtitleColor,
                  fontSize: isGreenTheme ? "10px" : "8.5px",
                  fontWeight: 800,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  marginTop: "1px",
                  opacity: 0.9
                }}>
                  {currentMatch?.tournamentName ? `${currentMatch.tournamentName} • ALL TEAMS (4s & 6s)` : "ALL TEAMS COMBINED • 4s & 6s"}
                </span>
              </div>

              {/* Right side: Highlight Number */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexShrink: 0 }}>
                <span style={{
                  color: accentColor,
                  fontSize: isGreenTheme ? "26px" : "18px",
                  fontWeight: 950,
                  lineHeight: 1,
                  fontFamily: isGreenTheme ? "'Teko', sans-serif" : undefined
                }}>
                  {tourTotalBoundaries}
                </span>
                <span style={{
                  color: "#cbd5e1",
                  fontSize: isGreenTheme ? "11px" : "9px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  BOUNDARIES
                </span>
              </div>
            </div>

            {/* Bottom row: FOURS X | SIXES Y | TOTAL Z */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: isGreenTheme ? "14px" : "10px",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: isGreenTheme ? "5px" : "3px",
              marginTop: isGreenTheme ? "3px" : "2px",
              fontSize: isGreenTheme ? "12px" : "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              <div style={{ color: subtitleColor }}>
                FOURS <span style={{ color: accentColor, fontWeight: 950, marginLeft: "4px" }}>{tourTotalFours}</span>
              </div>
              <span style={{ opacity: 0.35, color: "#ffffff" }}>|</span>
              <div style={{ color: subtitleColor }}>
                SIXES <span style={{ color: accentColor, fontWeight: 950, marginLeft: "4px" }}>{tourTotalSixes}</span>
              </div>
              <span style={{ opacity: 0.35, color: "#ffffff" }}>|</span>
              <div style={{ color: subtitleColor }}>
                TOTAL <span style={{ color: "#ffffff", fontWeight: 950, marginLeft: "4px" }}>{tourTotalBoundaries}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════ SCOREBOARD MARQUEE TICKER ANIMATION (ALL 16 THEMES) ════════════════════
  const renderScoreboardMarqueeRibbon = (
    currentThemeSlug: string,
    currentScoringState: any,
    currentMatch: any,
    batTeam: string,
    bowlTeam: string,
    bowlerObj: any
  ) => {
    const anim = (currentScoringState.animation || (currentScoringState.decision === "OUT" ? "OUT" : currentScoringState.decision === "NOT OUT" ? "NOT OUT" : currentScoringState.decision === "PENDING" ? "REVIEW" : null) || "").trim().toUpperCase();

    const isTourBoundaries = anim === "TOUR BOUNDARIES" || anim === "BOUNDARIES" || ds === "TOUR BOUNDARIES" || ds === "BOUNDARIES" || ds === "TOURNAMENT BOUNDARIES";
    if (isTourBoundaries) {
      return renderScoreboardTourBoundariesRibbon(currentThemeSlug, currentMatch, tournamentMatches);
    }

    const isMatchNotStarted = ds === "TOSS" || ds === "PRE-MATCH" || ds === "PREMATCH" || ds === "TOSS / TEAMS" || ds === "TOSS INFO" || currentMatch?.status === "Not Started" || (!currentScoringState?.inningsStarted && (currentScoringState?.balls === 0 || !currentScoringState?.balls) && (currentScoringState?.score === 0 || !currentScoringState?.score));
    if (!anim) {
      if (isMatchNotStarted) {
        return renderScoreboardPreMatchRibbon(currentThemeSlug, currentMatch);
      }
      return null;
    }

    if (currentThemeSlug === "asia-cup" || currentThemeSlug === "t20-emerging-asia-cup" || currentThemeSlug === "ipl-2025" || currentThemeSlug === "bbl-starsports" || currentThemeSlug === "cwc-25-india" || currentThemeSlug === "wt20-2024" || currentThemeSlug === "bbl-black" || currentThemeSlug === "wcl-fancode" || currentThemeSlug === "crioverlay-green" || currentThemeSlug === "jiocinema" || currentThemeSlug === "cwc-23-india" || currentThemeSlug === "starsports-t20") {
      if (isMatchNotStarted) return renderScoreboardPreMatchRibbon(currentThemeSlug, currentMatch);
      return null;
    }

    let marqueeWord = anim;
    if (anim === "FOUR" || anim === "4" || anim === "4S" || anim === "FOUR!") marqueeWord = "FOUR";
    else if (anim === "SIX" || anim === "6" || anim === "6S" || anim === "SIX!") marqueeWord = "SIX";
    else if (anim === "WICKET" || anim === "OUT" || anim === "W" || anim === "WICKET!") marqueeWord = anim === "OUT" ? "OUT" : "WICKET";
    else if (anim === "NOT OUT" || anim === "NOT_OUT" || anim === "NOTOUT") marqueeWord = "NOT OUT";
    else if (anim === "FREE HIT" || anim === "FREE_HIT" || anim === "FREEHIT") marqueeWord = "FREE HIT";
    else if (anim === "HAT-TRICK BALL" || anim === "HAT-TRICK" || anim === "HATTRICK") marqueeWord = "HAT-TRICK";
    else if (anim === "POWERPLAY" || anim === "PP") marqueeWord = "POWERPLAY";
    else if (anim === "REVIEW" || anim === "PENDING" || anim === "DRS") marqueeWord = "DRS REVIEW";

    const marqueeRepeated = Array(12).fill(marqueeWord).join("       ");

    // Theme-tailored Color Palettes for each of the 16 scoreboards
    let ribbonBg = "linear-gradient(90deg, #38bdf8 0%, #7dd3fc 20%, #38bdf8 50%, #7dd3fc 80%, #38bdf8 100%)";
    let ribbonBorder = "#0284c7";
    let ribbonShadow = "0 0 25px rgba(2, 179, 228, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
    let textStroke = "1.5px #0284c7";
    let textShadow = "0 0 16px rgba(2, 132, 199, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
    let scoreBoxBg = "linear-gradient(180deg, #07152b 0%, #0c2042 100%)";
    let scoreBoxBorder = "#02b3e4";
    let bowlerBoxBg = "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)";
    let bowlerBoxBorder = "#d97706";
    let bowlerTextColor = "#000000";
    let batCrestBorder = "#0284c7";
    let batCrestBg = "#0284c7";
    let bowlCrestBorder = "#dc2626";
    let bowlCrestBg = "#dc2626";

    if (currentThemeSlug === "crioverlay-green") {
      ribbonBg = "linear-gradient(90deg, #74fb05 0%, #a3e635 25%, #74fb05 50%, #a3e635 75%, #74fb05 100%)";
      ribbonBorder = "#74fb05";
      ribbonShadow = "0 8px 32px rgba(116, 251, 5, 0.45), inset 0 0 20px rgba(255,255,255,0.4)";
      textStroke = "2.5px #091120";
      textShadow = "0 0 20px rgba(9, 17, 32, 0.9), 0 4px 10px rgba(0,0,0,0.6)";
      scoreBoxBg = "linear-gradient(180deg, #091120 0%, #13223f 100%)";
      scoreBoxBorder = "#74fb05";
      bowlerBoxBg = "linear-gradient(180deg, #091120 0%, #13223f 100%)";
      bowlerBoxBorder = "#74fb05";
      bowlerTextColor = "#ffffff";
      batCrestBorder = "#ffffff";
      batCrestBg = "radial-gradient(circle, #eab308 0%, #854d0e 70%, #000 100%)";
      bowlCrestBorder = "#ffffff";
      bowlCrestBg = "radial-gradient(circle, #b2ff59 0%, #4d7c0f 70%, #000 100%)";
    } else if (currentThemeSlug === "champions-trophy-2025") {
      ribbonBg = "linear-gradient(90deg, #03a360 0%, #10b981 25%, #059669 50%, #10b981 75%, #03a360 100%)";
      ribbonBorder = "#03a360";
      ribbonShadow = "0 0 25px rgba(3, 163, 96, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #0a122a";
      textShadow = "0 0 16px rgba(10, 18, 42, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #0a122a 0%, #14224d 100%)";
      scoreBoxBorder = "#03a360";
      bowlerBoxBg = "linear-gradient(180deg, #0a122a 0%, #14224d 100%)";
      bowlerBoxBorder = "#03a360";
      bowlerTextColor = "#ffffff";
      batCrestBorder = "#03a360";
      batCrestBg = "#03a360";
      bowlCrestBorder = "#03a360";
      bowlCrestBg = "#0a122a";
    } else if (currentThemeSlug === "wcl-fancode") {
      ribbonBg = "linear-gradient(90deg, #0284c7 0%, #38bdf8 25%, #0369a1 50%, #38bdf8 75%, #0284c7 100%)";
      ribbonBorder = "#0284c7";
      ribbonShadow = "0 0 25px rgba(2, 132, 199, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #1f2937";
      textShadow = "0 0 16px rgba(31, 41, 55, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #1f2937 0%, #111827 100%)";
      scoreBoxBorder = "#0284c7";
      bowlerBoxBg = "linear-gradient(180deg, #1f2937 0%, #111827 100%)";
      bowlerBoxBorder = "#0284c7";
      bowlerTextColor = "#ffffff";
      batCrestBorder = "#0284c7";
      batCrestBg = "#0284c7";
      bowlCrestBorder = "#0284c7";
      bowlCrestBg = "#1f2937";
    } else if (currentThemeSlug === "asia-cup" || currentThemeSlug === "t20-emerging-asia-cup") {
      ribbonBg = "linear-gradient(90deg, #0047ab 0%, #3b82f6 25%, #f59e0b 50%, #3b82f6 75%, #0047ab 100%)";
      ribbonBorder = "#f59e0b";
      ribbonShadow = "0 0 25px rgba(245, 158, 11, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #0047ab";
      textShadow = "0 0 16px rgba(0, 71, 171, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
      scoreBoxBorder = "#f59e0b";
      bowlerBoxBg = "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)";
      bowlerBoxBorder = "#b45309";
      bowlerTextColor = "#000000";
      batCrestBorder = "#0047ab";
      batCrestBg = "#0047ab";
      bowlCrestBorder = "#f59e0b";
      bowlCrestBg = "#f59e0b";
    } else if (currentThemeSlug === "cwc-25-india" || currentThemeSlug === "wt20-2024") {
      ribbonBg = "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 25%, #f97316 50%, #3b82f6 75%, #1e3a8a 100%)";
      ribbonBorder = "#f97316";
      ribbonShadow = "0 0 25px rgba(249, 115, 22, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #1e3a8a";
      textShadow = "0 0 16px rgba(30, 58, 138, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)";
      scoreBoxBorder = "#f97316";
      bowlerBoxBg = "linear-gradient(180deg, #f97316 0%, #ea580c 100%)";
      bowlerBoxBorder = "#c2410c";
      bowlerTextColor = "#ffffff";
      batCrestBorder = "#3b82f6";
      batCrestBg = "#1e3a8a";
      bowlCrestBorder = "#f97316";
      bowlCrestBg = "#ea580c";
    } else if (currentThemeSlug === "cwc-23-india") {
      ribbonBg = "linear-gradient(90deg, #1e1b4b 0%, #e11d48 30%, #f59e0b 70%, #1e1b4b 100%)";
      ribbonBorder = "#f59e0b";
      ribbonShadow = "0 0 25px rgba(245, 158, 11, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #1e1b4b";
      textShadow = "0 0 16px rgba(30, 27, 75, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)";
      scoreBoxBorder = "#f59e0b";
      bowlerBoxBg = "linear-gradient(180deg, #e11d48 0%, #be123c 100%)";
      bowlerBoxBorder = "#9f1239";
      bowlerTextColor = "#ffffff";
      batCrestBorder = "#f59e0b";
      batCrestBg = "#1e1b4b";
      bowlCrestBorder = "#e11d48";
      bowlCrestBg = "#be123c";
    } else if (currentThemeSlug === "bbl-black") {
      ribbonBg = "linear-gradient(90deg, #0f172a 0%, #0284c7 35%, #facc15 70%, #0f172a 100%)";
      ribbonBorder = "#38bdf8";
      ribbonShadow = "0 0 25px rgba(56, 189, 248, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #0f172a";
      textShadow = "0 0 16px rgba(15, 23, 42, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #0f172a 0%, #020617 100%)";
      scoreBoxBorder = "#38bdf8";
      bowlerBoxBg = "linear-gradient(180deg, #facc15 0%, #eab308 100%)";
      bowlerBoxBorder = "#ca8a04";
      bowlerTextColor = "#000000";
      batCrestBorder = "#38bdf8";
      batCrestBg = "#0f172a";
      bowlCrestBorder = "#facc15";
      bowlCrestBg = "#facc15";
    } else if (currentThemeSlug === "cricfusion") {
      ribbonBg = "linear-gradient(90deg, #6366f1 0%, #a855f7 30%, #ec4899 70%, #6366f1 100%)";
      ribbonBorder = "#ec4899";
      ribbonShadow = "0 0 25px rgba(236, 72, 153, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #312e81";
      textShadow = "0 0 16px rgba(49, 46, 129, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)";
      scoreBoxBorder = "#ec4899";
      bowlerBoxBg = "linear-gradient(180deg, #ec4899 0%, #db2777 100%)";
      bowlerBoxBorder = "#be185d";
      bowlerTextColor = "#ffffff";
      batCrestBorder = "#6366f1";
      batCrestBg = "#6366f1";
      bowlCrestBorder = "#ec4899";
      bowlCrestBg = "#db2777";
    } else if (currentThemeSlug === "sa20") {
      ribbonBg = "linear-gradient(90deg, #047857 0%, #10b981 30%, #eab308 70%, #047857 100%)";
      ribbonBorder = "#eab308";
      ribbonShadow = "0 0 25px rgba(234, 179, 8, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #047857";
      textShadow = "0 0 16px rgba(4, 120, 87, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
      scoreBoxBorder = "#eab308";
      bowlerBoxBg = "linear-gradient(180deg, #eab308 0%, #ca8a04 100%)";
      bowlerBoxBorder = "#a16207";
      bowlerTextColor = "#000000";
      batCrestBorder = "#047857";
      batCrestBg = "#047857";
      bowlCrestBorder = "#eab308";
      bowlCrestBg = "#ca8a04";
    } else if (currentThemeSlug === "jiocinema" || currentThemeSlug === "geo-cinema") {
      ribbonBg = "linear-gradient(90deg, #be185d 0%, #db2777 30%, #0284c7 70%, #be185d 100%)";
      ribbonBorder = "#db2777";
      ribbonShadow = "0 0 25px rgba(219, 39, 119, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #831843";
      textShadow = "0 0 16px rgba(131, 24, 67, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
      scoreBoxBorder = "#db2777";
      bowlerBoxBg = "linear-gradient(180deg, #db2777 0%, #be185d 100%)";
      bowlerBoxBorder = "#9d174d";
      bowlerTextColor = "#ffffff";
      batCrestBorder = "#db2777";
      batCrestBg = "#db2777";
      bowlCrestBorder = "#0284c7";
      bowlCrestBg = "#0284c7";
    } else if (currentThemeSlug === "ipl" || currentThemeSlug === "ipl-2025" || currentThemeSlug === "bbl-starsports") {
      ribbonBg = "linear-gradient(90deg, #1e40af 0%, #3b82f6 30%, #f59e0b 70%, #1e40af 100%)";
      ribbonBorder = "#f59e0b";
      ribbonShadow = "0 0 25px rgba(245, 158, 11, 0.6), inset 0 0 15px rgba(255,255,255,0.4)";
      textStroke = "1.5px #1e40af";
      textShadow = "0 0 16px rgba(30, 64, 175, 0.8), 0 2px 4px rgba(0,0,0,0.3)";
      scoreBoxBg = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
      scoreBoxBorder = "#f59e0b";
      bowlerBoxBg = "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)";
      bowlerBoxBorder = "#b45309";
      bowlerTextColor = "#000000";
      batCrestBorder = "#3b82f6";
      batCrestBg = "#1e40af";
      bowlCrestBorder = "#f59e0b";
      bowlCrestBg = "#f59e0b";
    }

    const getShortLocal = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortLocal(batTeam);
    const bowlTeamShort = getShortLocal(bowlTeam);

    const isGreenTheme = currentThemeSlug === "crioverlay-green";
    const ribbonHeight = isGreenTheme ? "80px" : "62px";
    const marqueeFontSize = isGreenTheme ? "52px" : "44px";
    const badgeSize = isGreenTheme ? "68px" : "46px";

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: ribbonHeight,
        background: ribbonBg,
        overflow: "hidden",
        borderRadius: isGreenTheme ? "16px" : "8px",
        border: isGreenTheme ? `3px solid ${ribbonBorder}` : `2px solid ${ribbonBorder}`,
        position: "relative",
        padding: "0 14px",
        boxShadow: ribbonShadow,
        width: "100%",
      }}>
        {/* Inline CSS Keyframes ensure the ticker runs in every environment */}
        <style>{`
          @keyframes marqueeScrollLTR {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
        `}</style>

        {/* Continuous Left-to-Right Scrolling Marquee Ticker */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "200%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          animation: "marqueeScrollLTR 6.5s linear infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}>
          <span style={{
            fontSize: marqueeFontSize,
            fontWeight: "950",
            letterSpacing: isGreenTheme ? "10px" : "8px",
            color: "#FFFFFF",
            WebkitTextStroke: textStroke,
            textShadow: textShadow,
            paddingRight: "80px",
            textTransform: "uppercase",
            display: "inline-block",
          }}>
            {marqueeRepeated}
          </span>
          <span style={{
            fontSize: marqueeFontSize,
            fontWeight: "950",
            letterSpacing: isGreenTheme ? "10px" : "8px",
            color: "#FFFFFF",
            WebkitTextStroke: textStroke,
            textShadow: textShadow,
            paddingRight: "80px",
            textTransform: "uppercase",
            display: "inline-block",
          }}>
            {marqueeRepeated}
          </span>
        </div>

        {/* Left Floating Score Box */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 5 }}>
          {/* Team Crest Ring */}
          <div style={{ width: badgeSize, height: badgeSize, borderRadius: "50%", border: isGreenTheme ? "3px solid #ffffff" : `3px solid ${batCrestBorder}`, display: "flex", alignItems: "center", justifyContent: "center", background: batCrestBg, padding: "3px", textAlign: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.4)" }}>
            <span style={{ color: "#FFFFFF", fontWeight: 900, fontSize: isGreenTheme ? "11px" : "8.5px", lineHeight: "1.1", textTransform: "uppercase" }}>
              {batTeam.split(" ").slice(0, 2).join("\n")}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#FFFFFF", fontWeight: 950, fontSize: isGreenTheme ? "18px" : "16px", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{batTeamShort}</span>
            <span style={{ color: isGreenTheme ? "#74fb05" : "rgba(255,255,255,0.85)", fontWeight: 800, fontSize: isGreenTheme ? "12px" : "10.5px", marginTop: "2px", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>v {bowlTeamShort}</span>
          </div>

          {/* Dark Score Container with Gold/Green Brackets */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: scoreBoxBg,
            padding: isGreenTheme ? "4px 18px" : "3px 14px",
            borderRadius: isGreenTheme ? "10px" : "6px",
            border: isGreenTheme ? `2px solid ${scoreBoxBorder}` : `1.5px solid ${scoreBoxBorder}`,
            boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
            marginLeft: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ color: isGreenTheme ? "#74fb05" : "#facc15", fontSize: isGreenTheme ? "20px" : "17px", fontWeight: "900" }}>(</span>
              <span style={{ color: "#FFFFFF", fontSize: isGreenTheme ? "28px" : "24px", fontWeight: "950", lineHeight: 1, letterSpacing: "-0.5px", fontFamily: isGreenTheme ? "'Teko', sans-serif" : undefined }}>{currentScoringState.score} - {currentScoringState.wickets}</span>
              <span style={{ color: isGreenTheme ? "#74fb05" : "#38bdf8", fontSize: isGreenTheme ? "15px" : "13px", fontWeight: "800" }}>{fmtOv(currentScoringState.balls, currentMatch.ballsPerOver)}</span>
              <span style={{ color: isGreenTheme ? "#74fb05" : "#facc15", fontSize: isGreenTheme ? "20px" : "17px", fontWeight: "900" }}>)</span>
            </div>
            <span style={{ color: isGreenTheme ? "#74fb05" : "#facc15", fontSize: isGreenTheme ? "10.5px" : "9.5px", fontWeight: "900", marginTop: "1px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {currentScoringState.target !== null ? `TARGET - ${currentScoringState.target}` : (currentScoringState.customInputText || "MATCH IN PROGRESS")}
            </span>
          </div>
        </div>

        {/* Right Floating Bowler Box */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 5 }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            padding: isGreenTheme ? "5px 16px" : "4px 14px",
            background: bowlerBoxBg,
            borderRadius: isGreenTheme ? "10px" : "6px",
            border: isGreenTheme ? `2px solid ${bowlerBoxBorder}` : `1.5px solid ${bowlerBoxBorder}`,
            boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: isGreenTheme ? "#74fb05" : bowlerTextColor, fontWeight: "900", fontSize: isGreenTheme ? "14px" : "12.5px", textTransform: "uppercase" }}>
                {currentScoringState.bowler || "—"}
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginLeft: "auto" }}>
                <span style={{ color: bowlerTextColor, fontWeight: "950", fontSize: isGreenTheme ? "17px" : "15px" }}>{bowlerObj?.wickets ?? 0}-{bowlerObj?.runsConceded ?? 0}</span>
                <span style={{ color: isGreenTheme ? "#94a3b8" : (bowlerTextColor === "#000000" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"), fontWeight: "700", fontSize: "10.5px" }}>({fmtOv(bowlerObj?.ballsBowled ?? 0, currentMatch.ballsPerOver)})</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: isGreenTheme ? "#94a3b8" : bowlerTextColor, fontWeight: "900", fontSize: "8.5px", letterSpacing: "0.5px", textTransform: "uppercase" }}>OVER:</span>
              {(() => {
                const bpo = currentMatch?.ballsPerOver || 6;
                const thisOver = currentScoringState.thisOver || [];
                const extrasCount = thisOver.filter(isExtraBall).length;
                const totalCirclesCount = bpo + extrasCount;
                return Array.from({ length: totalCirclesCount }).map((_, i) => {
                  const val = thisOver[i];
                  let cellBg = bowlerTextColor === "#000000" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)";
                  let cellColor = bowlerTextColor;
                  let borderStyle = isGreenTheme ? "1px solid #74fb05" : "1px solid rgba(0,0,0,0.2)";
                  if (val) {
                    borderStyle = "none";
                    if (val === "4" || val === "4s") { cellBg = isGreenTheme ? "#74fb05" : "#0284c7"; cellColor = isGreenTheme ? "#091120" : "#ffffff"; }
                    else if (val === "6" || val === "6s") { cellBg = "#7c3aed"; cellColor = "#ffffff"; }
                    else if (val === "W" || val?.startsWith("W+") || val === "Wk") { cellBg = "#dc2626"; cellColor = "#ffffff"; }
                    else if (isExtraBall(val)) { cellBg = "#9333ea"; cellColor = "#ffffff"; }
                    else { cellBg = "rgba(0, 0, 0, 0.4)"; cellColor = "#ffffff"; }
                  }
                  return (
                    <div key={i} style={{ width: isGreenTheme ? "19px" : "17px", height: isGreenTheme ? "19px" : "17px", background: cellBg, color: cellColor, border: borderStyle, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6.5px" : (val && val.length > 1 ? "8px" : "10px")), letterSpacing: val && val.length > 2 ? "-0.5px" : "normal", fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                      {renderOutcomeText(val, isGreenTheme ? 19 : 17)}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Bowling Team Logo & Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: badgeSize, height: badgeSize, borderRadius: "50%", border: isGreenTheme ? "3px solid #ffffff" : `3px solid ${bowlCrestBorder}`, display: "flex", alignItems: "center", justifyContent: "center", background: bowlCrestBg, padding: "3px", textAlign: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.4)" }}>
              <span style={{ color: "#FFFFFF", fontWeight: 900, fontSize: isGreenTheme ? "11px" : "8.5px", lineHeight: "1.1", textTransform: "uppercase" }}>
                {bowlTeam.split(" ").slice(0, 2).join("\n")}
              </span>
            </div>
            <div style={{ width: isGreenTheme ? "28px" : "24px", height: isGreenTheme ? "28px" : "24px", background: "#091120", border: "1.5px solid #74fb05", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#74fb05", fontSize: "13px", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
              🏏
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      .g-canvas{position:relative;width:100vw;height:100vh;background:transparent;display:flex;flex-direction:column;justify-content:flex-end;padding:0 16px 10px;overflow:hidden;font-family:'Montserrat',sans-serif;}
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
      <div style={{ position: "relative", width: "100%", height: "100vh", background: "transparent", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 0, overflow: "hidden" }}>
        <style>{GREEN_CSS}</style>
        <style>{GLOBAL_CSS}</style>
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}
        <div className="g-canvas">
          {renderScoreboardMarqueeRibbon("crioverlay-green", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
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
                {/* Top green bar — LTR marquee animation behind teams/score/overs */}
                {(() => {
                  const animRaw = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "REVIEW" : null) || "").trim().toUpperCase();
                  let animWord = "";
                  let marqueeTextColor = "#000000";
                  let marqueeTextStroke = "1px #76ff03";
                  let marqueeTextShadow = "0 0 10px rgba(255,255,255,0.6)";
                  let modeClass = "";
                  if (animRaw) {
                    if (animRaw === "FOUR" || animRaw === "4" || animRaw === "4S" || animRaw === "FOUR!") {
                      animWord = "FOUR";
                      modeClass = "";
                      marqueeTextColor = "#000000";
                      marqueeTextStroke = "1.2px #ca8a04";
                      marqueeTextShadow = "0 0 14px rgba(202,138,4,0.95), 0 0 20px rgba(234,179,8,0.6)";
                    } else if (animRaw === "SIX" || animRaw === "6" || animRaw === "6S" || animRaw === "SIX!") {
                      animWord = "SIX";
                      modeClass = "";
                      marqueeTextColor = "#000000";
                      marqueeTextStroke = "1.2px #7c3aed";
                      marqueeTextShadow = "0 0 14px rgba(124,58,237,0.95), 0 0 24px rgba(168,85,247,0.6)";
                    } else if (animRaw === "WICKET" || animRaw === "W" || animRaw === "WICKET!" || animRaw === "OUT") {
                      animWord = animRaw === "OUT" ? "OUT" : "WICKET";
                      modeClass = "mode-out";
                      marqueeTextColor = "#ffffff";
                      marqueeTextStroke = "1.2px #7f1d1d";
                      marqueeTextShadow = "0 0 14px rgba(239,68,68,0.95), 0 0 24px rgba(220,38,38,0.6)";
                    } else if (animRaw === "NOT OUT" || animRaw === "NOT_OUT" || animRaw === "NOTOUT") {
                      animWord = "NOT OUT";
                      modeClass = "mode-freehit";
                      marqueeTextColor = "#b2ff59";
                      marqueeTextStroke = "1.2px #064e3b";
                      marqueeTextShadow = "0 0 14px rgba(16,185,129,0.95), 0 0 24px rgba(52,211,153,0.6)";
                    } else if (animRaw === "FREE HIT" || animRaw === "FREE_HIT" || animRaw === "FREEHIT") {
                      animWord = "FREE HIT";
                      modeClass = "mode-freehit";
                      marqueeTextColor = "#b2ff59";
                      marqueeTextStroke = "1.2px #047857";
                      marqueeTextShadow = "0 0 14px rgba(52,211,153,0.95), 0 0 24px rgba(110,231,183,0.6)";
                    } else if (animRaw === "HAT-TRICK BALL" || animRaw === "HAT-TRICK" || animRaw === "HATTRICK") {
                      animWord = "HAT-TRICK";
                      modeClass = "";
                      marqueeTextColor = "#ffffff";
                      marqueeTextStroke = "1.2px #6b21a8";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.95), 0 0 24px rgba(192,132,252,0.6)";
                    } else if (animRaw === "REVIEW" || animRaw === "PENDING" || animRaw === "DRS") {
                      animWord = "DRS REVIEW";
                      modeClass = "mode-pending";
                      marqueeTextColor = "#ffffff";
                      marqueeTextStroke = "1.2px #92400e";
                      marqueeTextShadow = "0 0 14px rgba(245,158,11,0.95), 0 0 24px rgba(251,191,36,0.6)";
                    } else if (animRaw === "NO BALL" || animRaw === "NO-BALL" || animRaw === "NOBALL" || animRaw === "Nb") {
                      animWord = "NO BALL";
                      modeClass = "";
                      marqueeTextColor = "#ffffff";
                      marqueeTextStroke = "1.2px #4c1d95";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.95), 0 0 24px rgba(196,181,253,0.6)";
                    } else {
                      animWord = animRaw;
                    }
                  }
                  const marqueeRepeated = animWord ? Array(20).fill(animWord).join("       ") : "";

                  return (
                    <div className={`g-top-bar${modeClass ? " " + modeClass : ""}`} style={{ position: "relative", overflow: "hidden" }}>
                      <style>{`
                        @keyframes criGreenMarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>

                      {/* LTR Scrolling Marquee Layer (zIndex: 1, behind score info) */}
                      {animWord && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 1,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: "200%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            animation: "criGreenMarqueeLTR 6s linear infinite"
                          }}>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "22px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "22px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                          </div>
                        </div>
                      )}

                      {/* Teams / Score / Overs — always visible on top (zIndex: 5) */}
                      <span className="g-teams" style={{ position: "relative", zIndex: 5, whiteSpace: "nowrap" }}>{teamsHeader}</span>
                      <span className="g-runs" style={{ position: "relative", zIndex: 5, whiteSpace: "nowrap" }}>{currentScore}</span>
                      <span className="g-overs" style={{ position: "relative", zIndex: 5, whiteSpace: "nowrap" }}>{currentOvers}</span>
                    </div>
                  );
                })()}

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
          )}
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
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 6px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#fbbf24", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>Asia Cup Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "94vw", maxWidth: "1060px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            {renderScoreboardMarqueeRibbon("asia-cup", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
                {/* The main scoreboard row */}
                <div style={{ display: "flex", alignItems: "stretch", height: "40px", background: "transparent", overflow: "hidden", borderRadius: "6px 6px 0 0", border: "1.5px solid rgba(229, 136, 8, 0.35)", borderBottom: "none" }}>

                  {/* Team 1 Section */}
                  <div style={{ display: "flex", alignItems: "center", background: "#FDFDFE", padding: "0 14px", position: "relative", flexShrink: 0, minWidth: "115px" }}>
                    <span style={{ color: "#142248", fontWeight: 950, fontSize: "12.5px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {match.team1Name}
                    </span>
                    {/* Left decorative splash */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: "22px", height: "4px", background: "#E58808", borderRadius: "0 3px 0 0" }} />
                  </div>

                  {/* Blue curved transition left */}
                  <div style={{ width: "12px", background: "#FDFDFE", clipPath: "polygon(0 0, 100% 0, 0 100%)", flexShrink: 0 }} />

                  {/* Score / Overs Section */}
                  <div style={{ background: "linear-gradient(180deg, #142248 0%, #0c152d 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 14px", position: "relative", minWidth: "115px", flexShrink: 0, borderLeft: "1.5px solid #E58808", borderRight: "1.5px solid #E58808" }}>
                    {/* Gold Parentheses decoration */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", lineHeight: 1 }}>
                      <span style={{ color: "#E58808", fontSize: "15px", fontWeight: "900" }}>(</span>
                      <span style={{ color: "#FDFDFE", fontSize: "15.5px", fontWeight: "950", letterSpacing: "-0.5px" }}>{scoringState.score} - {scoringState.wickets}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "10px", fontWeight: "700", marginLeft: "2px" }}>{fmtOv(scoringState.balls, match.ballsPerOver)}</span>
                      <span style={{ color: "#E58808", fontSize: "15px", fontWeight: "900" }}>)</span>
                    </div>
                    {/* Group Stage banner */}
                    <div style={{ background: "#E58808", padding: "1px 8px", borderRadius: "2px", fontSize: "6.5px", fontWeight: "950", color: "#142248", letterSpacing: "0.8px", textTransform: "uppercase", whiteSpace: "nowrap", marginTop: "2px" }}>
                      GROUP STAGE
                    </div>
                  </div>

                  {/* Blue curved transition right */}
                  <div style={{ width: "12px", background: "#FDFDFE", clipPath: "polygon(100% 0, 100% 100%, 0 100%)", flexShrink: 0 }} />

                  {/* Batsmen details */}
                  <div style={{ background: "#FDFDFE", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 12px", flex: 1, minWidth: "140px" }}>
                    {/* Striker */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <span style={{ color: "#E58808", fontSize: "10px", fontWeight: 900 }}>•</span>
                        <span style={{ color: "#142248", fontWeight: "900", fontSize: "11px" }}>{scoringState.striker || "—"}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", fontSize: "11.5px", fontWeight: "900", color: "#142248" }}>
                        <span style={{ minWidth: "18px", textAlign: "right" }}>{striker?.runs ?? 0}</span>
                        <span style={{ color: "#64748b", fontWeight: "600", fontSize: "9.5px", minWidth: "14px", textAlign: "right" }}>({striker?.balls ?? 0})</span>
                      </div>
                    </div>
                    {/* Non Striker */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <span style={{ color: "transparent", fontSize: "10px" }}>•</span>
                        <span style={{ color: "#475569", fontWeight: "700", fontSize: "10px" }}>{scoringState.nonStriker || "—"}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", fontSize: "10.5px", fontWeight: "700", color: "#475569" }}>
                        <span style={{ minWidth: "18px", textAlign: "right" }}>{nonStriker?.runs ?? 0}</span>
                        <span style={{ color: "#94a3b8", fontWeight: "500", fontSize: "8.5px", minWidth: "14px", textAlign: "right" }}>({nonStriker?.balls ?? 0})</span>
                      </div>
                    </div>
                  </div>

                  {/* Target / Match Equation Section */}
                  {scoringState.target !== null ? (
                    <div style={{ background: "linear-gradient(180deg, #E58808 0%, #c97300 100%)", display: "flex", alignItems: "center", padding: "0 14px", flexShrink: 0, position: "relative" }}>
                      {/* Left curved accent boundary */}
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "#142248" }} />

                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <span style={{ fontSize: "7px", fontWeight: "950", color: "#142248", letterSpacing: "0.5px" }}>REQ. RUNS</span>
                          <span style={{ fontSize: "17px", fontWeight: "950", color: "#142248", lineHeight: 1, marginTop: "1px" }}>{need}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <span style={{ fontSize: "7px", fontWeight: "950", color: "#142248", letterSpacing: "0.5px" }}>BALLS</span>
                          <span style={{ fontSize: "17px", fontWeight: "950", color: "#142248", lineHeight: 1, marginTop: "1px" }}>{bLeft}</span>
                        </div>
                      </div>

                      {/* Right curved accent boundary */}
                      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "3px", background: "#142248" }} />
                    </div>
                  ) : (
                    /* Innings 1: Show current run rate */
                    <div style={{ background: "linear-gradient(180deg, #E58808 0%, #c97300 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 14px", flexShrink: 0 }}>
                      <span style={{ fontSize: "7px", fontWeight: "950", color: "#142248", letterSpacing: "0.5px" }}>RUN RATE</span>
                      <span style={{ fontSize: "17px", fontWeight: "950", color: "#142248", lineHeight: 1, marginTop: "1px" }}>{calcRR(scoringState)}</span>
                    </div>
                  )}

                  {/* Team 2 / Bowling Team Section with Bowler info */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", background: "#FDFDFE", padding: "0 14px", position: "relative", flexShrink: 0, minWidth: "125px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ color: "#142248", fontWeight: 950, fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        {currentBowlTeam || match.team2Name}
                      </span>
                      {/* CricScorer/Bat badge */}
                      <div style={{ width: "16px", height: "16px", background: "#142248", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", color: "#E58808", fontSize: "8.5px", fontWeight: "bold" }}>
                        🏏
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                      <span style={{ color: "#E58808", fontSize: "7.5px", fontWeight: 950, letterSpacing: "0.5px" }}>BOWL:</span>
                      <span style={{ color: "#142248", fontSize: "9.5px", fontWeight: 800, maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scoringState.bowler ? scoringState.bowler.split(" ").pop() : "—"}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Bottom blue strip with embedded LTR marquee animation */}
                {(() => {
                  const animRaw = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "REVIEW" : null) || "").trim().toUpperCase();
                  let animWord = "";
                  let marqueeTextColor = "#FDFDFE";
                  let marqueeTextStroke = "1px #142248";
                  let marqueeTextShadow = "0 0 8px rgba(253,253,254,0.6)";
                  let barBg = "linear-gradient(90deg, #142248 0%, #1c3066 50%, #142248 100%)";
                  if (animRaw) {
                    if (animRaw === "FOUR" || animRaw === "4" || animRaw === "4S" || animRaw === "FOUR!") { animWord = "FOUR"; barBg = "linear-gradient(90deg, #7c2d12 0%, #142248 20%, #1c3066 50%, #142248 80%, #7c2d12 100%)"; marqueeTextColor = "#fde68a"; marqueeTextStroke = "1.2px #b45309"; marqueeTextShadow = "0 0 12px rgba(229,136,8,0.9), 0 0 20px rgba(250,204,21,0.5)"; }
                    else if (animRaw === "SIX" || animRaw === "6" || animRaw === "6S" || animRaw === "SIX!") { animWord = "SIX"; barBg = "linear-gradient(90deg, #78350f 0%, #142248 20%, #1c3066 50%, #142248 80%, #78350f 100%)"; marqueeTextColor = "#fbbf24"; marqueeTextStroke = "1.2px #92400e"; marqueeTextShadow = "0 0 14px rgba(251,191,36,0.9), 0 0 24px rgba(245,158,11,0.6)"; }
                    else if (animRaw === "WICKET" || animRaw === "W" || animRaw === "WICKET!" || animRaw === "OUT") { animWord = animRaw === "OUT" ? "OUT" : "WICKET"; barBg = "linear-gradient(90deg, #7f1d1d 0%, #142248 20%, #1c3066 50%, #142248 80%, #7f1d1d 100%)"; marqueeTextColor = "#fecaca"; marqueeTextStroke = "1.2px #991b1b"; marqueeTextShadow = "0 0 14px rgba(239,68,68,0.9), 0 0 24px rgba(220,38,38,0.6)"; }
                    else if (animRaw === "NOT OUT" || animRaw === "NOT_OUT" || animRaw === "NOTOUT") { animWord = "NOT OUT"; barBg = "linear-gradient(90deg, #064e3b 0%, #142248 20%, #1c3066 50%, #142248 80%, #064e3b 100%)"; marqueeTextColor = "#a7f3d0"; marqueeTextStroke = "1.2px #065f46"; marqueeTextShadow = "0 0 14px rgba(16,185,129,0.9), 0 0 24px rgba(52,211,153,0.5)"; }
                    else if (animRaw === "FREE HIT" || animRaw === "FREE_HIT" || animRaw === "FREEHIT") { animWord = "FREE HIT"; barBg = "linear-gradient(90deg, #064e3b 0%, #142248 20%, #1c3066 50%, #142248 80%, #064e3b 100%)"; marqueeTextColor = "#6ee7b7"; marqueeTextStroke = "1.2px #047857"; marqueeTextShadow = "0 0 14px rgba(52,211,153,0.9), 0 0 24px rgba(110,231,183,0.5)"; }
                    else if (animRaw === "HAT-TRICK BALL" || animRaw === "HAT-TRICK" || animRaw === "HATTRICK") { animWord = "HAT-TRICK"; barBg = "linear-gradient(90deg, #581c87 0%, #142248 20%, #1c3066 50%, #142248 80%, #581c87 100%)"; marqueeTextColor = "#e9d5ff"; marqueeTextStroke = "1.2px #6b21a8"; marqueeTextShadow = "0 0 14px rgba(168,85,247,0.9), 0 0 24px rgba(216,180,254,0.5)"; }
                    else if (animRaw === "REVIEW" || animRaw === "PENDING" || animRaw === "DRS") { animWord = "DRS REVIEW"; barBg = "linear-gradient(90deg, #78350f 0%, #142248 20%, #1c3066 50%, #142248 80%, #78350f 100%)"; marqueeTextColor = "#fde68a"; marqueeTextStroke = "1.2px #92400e"; marqueeTextShadow = "0 0 14px rgba(245,158,11,0.9), 0 0 24px rgba(251,191,36,0.5)"; }
                    else if (animRaw === "POWERPLAY" || animRaw === "PP") { animWord = "POWERPLAY"; }
                    else if (animRaw === "INNINGS BREAK") { animWord = "INNINGS BREAK"; }
                    else { animWord = animRaw; }
                  }
                  const marqueeRepeated = animWord ? Array(16).fill(animWord).join("       ") : "";

                  return (
                    <div style={{
                      background: barBg,
                      border: "1.5px solid rgba(229, 136, 8, 0.35)",
                      borderTop: "none",
                      borderRadius: "0 0 6px 6px",
                      padding: "3px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "24px",
                    }}>
                      {/* Inline @keyframes ensure LTR marquee runs in all environments */}
                      <style>{`
                        @keyframes asiaCupMarqueeLTR {
                          0% { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>

                      {/* LTR Scrolling Marquee Layer */}
                      {animWord && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 1,
                          overflow: "hidden",
                        }}>
                          <div style={{
                            width: "200%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            animation: "asiaCupMarqueeLTR 5.5s linear infinite",
                          }}>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "15px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.92,
                            }}>{marqueeRepeated}</span>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "15px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.92,
                            }}>{marqueeRepeated}</span>
                          </div>
                        </div>
                      )}

                      {/* Bowler figures strip */}
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", position: "relative", zIndex: 5, flexShrink: 0 }}>
                        <span style={{ color: "#E58808", fontWeight: 950, fontSize: "8px", letterSpacing: "0.8px" }}>BOWLER:</span>
                        <span style={{ color: "#FDFDFE", fontWeight: 900, fontSize: "10.5px" }}>{scoringState.bowler || "—"}</span>
                        <span style={{ color: "#E58808", fontWeight: 950, fontSize: "11px" }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}</span>
                        <span style={{ color: "#cbd5e1", fontWeight: 600, fontSize: "8.5px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                      </div>

                      {/* This Over strip */}
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", position: "relative", zIndex: 5, flexShrink: 0 }}>
                        <span style={{ fontSize: "8px", color: "#E58808", fontWeight: "900", letterSpacing: "0.8px" }}>THIS OVER:</span>
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
                      <div style={{ position: "relative", zIndex: 5, flexShrink: 0 }}>
                        {rrr ? (
                          <div style={{ fontSize: "9.5px", fontWeight: "900", color: "#E58808", letterSpacing: "0.8px" }}>
                            REQ RR: {rrr}
                          </div>
                        ) : (
                          <div style={{ fontSize: "9px", fontWeight: "800", color: "#FDFDFE", letterSpacing: "0.5px" }}>
                            4s: <span style={{ color: "#E58808" }}>{totalFours}</span> &nbsp;|&nbsp; 6s: <span style={{ color: "#E58808" }}>{totalSixes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

          </div>
        ) : (
          /* Match not started */
          <div className="slide-up" style={{ width: "94vw", maxWidth: "1060px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            {renderScoreboardPreMatchRibbon("asia-cup", match)}
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

    const activeAnim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "REVIEW" : null) || "").trim().toUpperCase();

    let marqueeWord = activeAnim;
    let animBarBg = "linear-gradient(90deg, #02b3e4 0%, #38bdf8 25%, #0284c7 50%, #38bdf8 75%, #02b3e4 100%)";
    let animTextStroke = "1.5px #0284c7";
    let animTextShadow = "0 0 15px rgba(2, 179, 228, 0.8), 0 2px 5px rgba(0,0,0,0.5)";

    if (activeAnim === "FOUR" || activeAnim === "4" || activeAnim === "4S" || activeAnim === "FOUR!") {
      marqueeWord = "FOUR";
      animBarBg = "linear-gradient(90deg, #02b3e4 0%, #0284c7 40%, #0369a1 70%, #02b3e4 100%)";
      animTextStroke = "1.5px #0284c7";
      animTextShadow = "0 0 18px rgba(2, 179, 228, 0.9), 0 0 30px #ffffff";
    } else if (activeAnim === "SIX" || activeAnim === "6" || activeAnim === "6S" || activeAnim === "SIX!") {
      marqueeWord = "SIX";
      animBarBg = "linear-gradient(90deg, #02b3e4 0%, #1e1b4b 30%, #4c0519 70%, #dc2626 100%)";
      animTextStroke = "1.5px #facc15";
      animTextShadow = "0 0 18px rgba(250, 204, 21, 0.9), 0 0 30px #ffffff";
    } else if (activeAnim === "WICKET" || activeAnim === "OUT" || activeAnim === "W" || activeAnim === "WICKET!") {
      marqueeWord = activeAnim === "OUT" ? "OUT" : "WICKET";
      animBarBg = "linear-gradient(90deg, #02b3e4 0%, #38bdf8 30%, #38bdf8 70%, #02b3e4 100%)";
      animTextStroke = "1.5px #0284c7";
      animTextShadow = "0 0 16px rgba(2, 179, 228, 0.8), 0 2px 6px rgba(0,0,0,0.5)";
    } else if (activeAnim === "NOT OUT" || activeAnim === "NOT_OUT" || activeAnim === "NOTOUT") {
      marqueeWord = "NOT OUT";
      animBarBg = "linear-gradient(90deg, #059669 0%, #10b981 40%, #059669 100%)";
      animTextStroke = "1.5px #064e3b";
      animTextShadow = "0 0 18px rgba(16, 185, 129, 0.9), 0 0 30px #ffffff";
    } else if (activeAnim === "FREE HIT" || activeAnim === "FREE_HIT" || activeAnim === "FREEHIT") {
      marqueeWord = "FREE HIT";
      animBarBg = "linear-gradient(90deg, #02b3e4 0%, #14b8a6 50%, #02b3e4 100%)";
      animTextStroke = "1.5px #0d9488";
      animTextShadow = "0 0 18px rgba(20, 184, 166, 0.9), 0 0 30px #ffffff";
    } else if (activeAnim === "HAT-TRICK BALL" || activeAnim === "HAT-TRICK" || activeAnim === "HATTRICK") {
      marqueeWord = "HAT-TRICK";
      animBarBg = "linear-gradient(90deg, #7c3aed 0%, #9333ea 50%, #dc2626 100%)";
      animTextStroke = "1.5px #6b21a8";
      animTextShadow = "0 0 18px rgba(168, 85, 247, 0.9), 0 0 30px #ffffff";
    } else if (activeAnim === "POWERPLAY" || activeAnim === "PP") {
      marqueeWord = "POWERPLAY";
      animBarBg = "linear-gradient(90deg, #02b3e4 0%, #0284c7 50%, #0369a1 100%)";
      animTextStroke = "1.5px #0284c7";
      animTextShadow = "0 0 18px rgba(2, 179, 228, 0.9), 0 0 30px #ffffff";
    } else if (activeAnim === "TOUR BOUNDARIES" || activeAnim === "BOUNDARIES") {
      marqueeWord = "BOUNDARIES";
      animBarBg = "linear-gradient(90deg, #d946ef 0%, #a21caf 50%, #02b3e4 100%)";
      animTextStroke = "1.5px #86198f";
      animTextShadow = "0 0 18px rgba(217, 70, 239, 0.9), 0 0 30px #ffffff";
    } else if (activeAnim === "REVIEW" || activeAnim === "PENDING" || activeAnim === "DRS") {
      marqueeWord = "DRS REVIEW";
      animBarBg = "linear-gradient(90deg, #0284c7 0%, #f59e0b 50%, #07152b 100%)";
      animTextStroke = "1.5px #d97706";
      animTextShadow = "0 0 18px rgba(245, 158, 11, 0.9), 0 0 30px #ffffff";
    }

    const marqueeRepeated = Array(12).fill(marqueeWord).join("       ");

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#38bdf8", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>CWC 19 Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.6))" }}>
            {activeAnim ? (
              /* ─── ANIMATION MODE: Exactly matches reference image ─── */
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "56px",
                background: "linear-gradient(90deg, #38bdf8 0%, #7dd3fc 20%, #38bdf8 50%, #7dd3fc 80%, #38bdf8 100%)",
                overflow: "hidden",
                borderRadius: "8px",
                border: "2px solid #0284c7",
                position: "relative",
                padding: "0 14px",
                boxShadow: "0 0 25px rgba(2, 179, 228, 0.6), inset 0 0 15px rgba(255,255,255,0.4)",
              }}>
                {/* Continuous Left-to-Right Scrolling Marquee Ticker */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "200%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  animation: "marqueeScrollLTR 6.5s linear infinite",
                  pointerEvents: "none",
                  zIndex: 1,
                }}>
                  <span style={{
                    fontSize: "42px",
                    fontWeight: "950",
                    letterSpacing: "8px",
                    color: "#FFFFFF",
                    WebkitTextStroke: "1.5px #0284c7",
                    textShadow: "0 0 16px rgba(2, 132, 199, 0.8), 0 2px 4px rgba(0,0,0,0.3)",
                    paddingRight: "80px",
                    textTransform: "uppercase",
                    display: "inline-block",
                  }}>
                    {marqueeRepeated}
                  </span>
                  <span style={{
                    fontSize: "42px",
                    fontWeight: "950",
                    letterSpacing: "8px",
                    color: "#FFFFFF",
                    WebkitTextStroke: "1.5px #0284c7",
                    textShadow: "0 0 16px rgba(2, 132, 199, 0.8), 0 2px 4px rgba(0,0,0,0.3)",
                    paddingRight: "80px",
                    textTransform: "uppercase",
                    display: "inline-block",
                  }}>
                    {marqueeRepeated}
                  </span>
                </div>

                {/* Left Floating Score Box (Matching Reference Image) */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 5 }}>
                  {/* Team Crest Ring */}
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "3px solid #0284c7", display: "flex", alignItems: "center", justifyContent: "center", background: "#0284c7", padding: "3px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                    <span style={{ color: "#FFFFFF", fontWeight: 900, fontSize: "8.5px", lineHeight: "1.1", textTransform: "uppercase" }}>
                      {currentBatTeam.split(" ").slice(0, 2).join("\n")}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#000000", fontWeight: 950, fontSize: "16px", lineHeight: 1 }}>{batTeamShort}</span>
                    <span style={{ color: "rgba(0,0,0,0.65)", fontWeight: 800, fontSize: "10.5px", marginTop: "2px" }}>v {bowlTeamShort}</span>
                  </div>

                  {/* Dark Navy Score Container with Gold Brackets */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "linear-gradient(180deg, #07152b 0%, #0c2042 100%)",
                    padding: "3px 14px",
                    borderRadius: "6px",
                    border: "1.5px solid #02b3e4",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    marginLeft: "8px",
                  }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span style={{ color: "#facc15", fontSize: "17px", fontWeight: "900" }}>(</span>
                      <span style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: "950", lineHeight: 1, letterSpacing: "-0.5px" }}>{scoringState.score} - {scoringState.wickets}</span>
                      <span style={{ color: "#38bdf8", fontSize: "13px", fontWeight: "800" }}>{fmtOv(scoringState.balls, match.ballsPerOver)}</span>
                      <span style={{ color: "#facc15", fontSize: "17px", fontWeight: "900" }}>)</span>
                    </div>
                    <span style={{ color: "#facc15", fontSize: "9.5px", fontWeight: "900", marginTop: "1px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {scoringState.target !== null ? `TARGET - ${scoringState.target}` : (scoringState.customInputText || "MATCH IN PROGRESS")}
                    </span>
                  </div>
                </div>

                {/* Right Floating Bowler Box (Matching Reference Image) */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 5 }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    padding: "4px 14px",
                    background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
                    borderRadius: "6px",
                    border: "1.5px solid #d97706",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#000000", fontWeight: "900", fontSize: "12.5px", textTransform: "uppercase" }}>
                        {scoringState.bowler || "—"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginLeft: "auto" }}>
                        <span style={{ color: "#000000", fontWeight: "950", fontSize: "15px" }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}</span>
                        <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: "700", fontSize: "10.5px" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: "#000000", fontWeight: "900", fontSize: "8.5px", letterSpacing: "0.5px", textTransform: "uppercase" }}>OVER:</span>
                      {(() => {
                        const bpo = match?.ballsPerOver || 6;
                        const thisOver = scoringState.thisOver || [];
                        const extrasCount = thisOver.filter(isExtraBall).length;
                        const totalCirclesCount = bpo + extrasCount;
                        return Array.from({ length: totalCirclesCount }).map((_, i) => {
                          const val = thisOver[i];
                          let cellBg = "rgba(0,0,0,0.15)";
                          let cellColor = "#000000";
                          let borderStyle = "1px solid rgba(0,0,0,0.2)";
                          if (val) {
                            borderStyle = "none";
                            if (val === "4" || val === "4s") { cellBg = "#0284c7"; cellColor = "#ffffff"; }
                            else if (val === "6" || val === "6s") { cellBg = "#7c3aed"; cellColor = "#ffffff"; }
                            else if (val === "W" || val?.startsWith("W+") || val === "Wk") { cellBg = "#dc2626"; cellColor = "#ffffff"; }
                            else if (isExtraBall(val)) { cellBg = "#9333ea"; cellColor = "#ffffff"; }
                            else { cellBg = "rgba(0, 0, 0, 0.4)"; cellColor = "#ffffff"; }
                          }
                          return (
                            <div key={i} style={{ width: "17px", height: "17px", background: cellBg, color: cellColor, border: borderStyle, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6.5px" : (val && val.length > 1 ? "8px" : "10px")), letterSpacing: val && val.length > 2 ? "-0.5px" : "normal", fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                              {renderOutcomeText(val, 17)}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Bowling Team Logo & CricScorer Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "3px solid #dc2626", display: "flex", alignItems: "center", justifyContent: "center", background: "#dc2626", padding: "3px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                      <span style={{ color: "#FFFFFF", fontWeight: 900, fontSize: "8.5px", lineHeight: "1.1", textTransform: "uppercase" }}>
                        {currentBowlTeam.split(" ").slice(0, 2).join("\n")}
                      </span>
                    </div>
                    <div style={{ width: "24px", height: "24px", background: "#07152b", border: "1.5px solid #02b3e4", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#facc15", fontSize: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                      🏏
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ─── NORMAL SCOREBOARD MODE: Perfectly aligned 3-segment layout ─── */
              <div style={{
                display: "flex",
                alignItems: "center",
                height: "56px",
                background: "transparent",
                overflow: "hidden",
                borderRadius: "10px",
                boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
                boxSizing: "border-box"
              }}>

                {/* LEFT SEGMENT: Sky Blue — batting side badge + score/overs + batsmen */}
                <div style={{
                  background: "linear-gradient(90deg, #02b3e4 0%, #08b6e6 100%)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  flex: "1 1 38%",
                  minWidth: 0,
                  height: "100%",
                  boxSizing: "border-box",
                  gap: "12px"
                }}>
                  {/* Team badge + short name */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.08)", textAlign: "center", flexShrink: 0
                    }}>
                      <span style={{
                        color: "#000000", fontWeight: 950, fontSize: "10px",
                        lineHeight: "1.1", textTransform: "uppercase"
                      }}>
                        {batTeamShort}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                      <span style={{ color: "#000000", fontWeight: 950, fontSize: "15px", lineHeight: 1 }}>
                        {batTeamShort}
                      </span>
                      <span style={{
                        color: "rgba(0,0,0,0.7)", fontWeight: 800, fontSize: "10px",
                        marginTop: "3px"
                      }}>BATTING</span>
                    </div>
                  </div>

                  {/* Score + Overs (large, vertically centered) */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexShrink: 0, paddingRight: "14px", borderRight: "1.5px solid rgba(0,0,0,0.15)" }}>
                    <span style={{
                      color: "#1e1b4b", fontSize: "28px", fontWeight: 950,
                      lineHeight: 1, letterSpacing: "-0.5px"
                    }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                    <span style={{
                      color: "#1e1b4b", fontSize: "14px", fontWeight: 800,
                      paddingTop: "3px"
                    }}>
                      {fmtOv(scoringState.balls, match.ballsPerOver)}
                    </span>
                  </div>

                  {/* Striker & Non-Striker */}
                  <div style={{
                    display: "flex", flexDirection: "column", gap: "2px",
                    minWidth: 0, flex: 1, justifyContent: "center", paddingLeft: "14px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                      <span style={{
                        color: "#000000", fontWeight: 800, fontSize: "12px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        ▶ {scoringState.striker || "—"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                        <span style={{ color: "#000000", fontWeight: 900, fontSize: "14px", lineHeight: 1 }}>
                          {striker?.runs ?? 0}
                        </span>
                        <span style={{ color: "rgba(0,0,0,0.6)", fontWeight: 700, fontSize: "10px" }}>
                          {striker?.balls ?? 0}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                      <span style={{
                        color: "rgba(0,0,0,0.7)", fontWeight: 700, fontSize: "11px",
                        paddingLeft: "12px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {scoringState.nonStriker || "—"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                        <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: 800, fontSize: "13px", lineHeight: 1 }}>
                          {nonStriker?.runs ?? 0}
                        </span>
                        <span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600, fontSize: "9px" }}>
                          {nonStriker?.balls ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CENTER SEGMENT: Black gradient — BOTH TEAM NAMES + status line, perfectly centered */}
                <div style={{
                  background: "linear-gradient(90deg, #02b3e4 0%, #000000 22%, #000000 78%, #dc2626 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 18px",
                  width: "220px",
                  flexShrink: 0,
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Top — BOTH TEAM NAMES perfectly centered */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "8px", whiteSpace: "nowrap"
                  }}>
                    <span style={{
                      color: "#ffffff", fontSize: "12px", fontWeight: 950,
                      letterSpacing: "0.5px"
                    }}>
                      {batTeamShort}
                    </span>
                    <span style={{
                      color: "#94a3b8", fontSize: "10px", fontWeight: 900,
                      letterSpacing: "1.5px"
                    }}>
                      vs
                    </span>
                    <span style={{
                      color: "#ffffff", fontSize: "12px", fontWeight: 950,
                      letterSpacing: "0.5px"
                    }}>
                      {bowlTeamShort}
                    </span>
                  </div>
                  {/* Bottom — status line (target/custom/in-progress) */}
                  <span style={{
                    color: "#facc15", fontSize: "10.5px", fontWeight: 900,
                    marginTop: "4px", letterSpacing: "0.5px", textAlign: "center",
                    whiteSpace: "nowrap"
                  }}>
                    {scoringState.target !== null
                      ? `TARGET — ${scoringState.target}${need !== null ? `  •  NEED ${need}` : ""}`
                      : (scoringState.customInputText || "MATCH IN PROGRESS")}
                  </span>
                </div>

                {/* RIGHT SEGMENT: Red — bowler + this-over pills + bowling side badge */}
                <div style={{
                  background: "linear-gradient(90deg, #e11d48 0%, #dc2626 100%)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  flex: "1 1 38%",
                  minWidth: 0,
                  height: "100%",
                  boxSizing: "border-box",
                  gap: "12px",
                  justifyContent: "space-between"
                }}>
                  {/* Bowler + This-Over pills (left part of right segment) */}
                  <div style={{
                    display: "flex", flexDirection: "column", gap: "3px",
                    minWidth: 0, flex: 1, justifyContent: "center"
                  }}>
                    {/* Bowler stats row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        color: "#ffffff", fontWeight: 800, fontSize: "12px",
                        textTransform: "uppercase",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {scoringState.bowler || "—"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginLeft: "auto", flexShrink: 0 }}>
                        <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "15px", lineHeight: 1 }}>
                          {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                        </span>
                        <span style={{
                          color: "rgba(255,255,255,0.8)", fontWeight: 800, fontSize: "11px"
                        }}>
                          {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)}
                        </span>
                      </div>
                    </div>
                    {/* This Over squares */}
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      {(() => {
                        const bpo = match?.ballsPerOver || 6;
                        const thisOver = scoringState.thisOver || [];
                        const extrasCount = thisOver.filter(isExtraBall).length;
                        const totalSlots = bpo + extrasCount;
                        return Array.from({ length: totalSlots }).map((_, i) => {
                          const val = thisOver[i];
                          let cellBg = "rgba(255, 255, 255, 0.08)";
                          let cellColor = "#ffffff";
                          let borderStyle = "1px solid rgba(255,255,255,0.25)";
                          if (val) {
                            borderStyle = "none";
                            if (val === "4" || val === "4s") { cellBg = "#06b6d4"; cellColor = "#000000"; }
                            else if (val === "6" || val === "6s") { cellBg = "#facc15"; cellColor = "#000000"; }
                            else if (val === "W" || val?.startsWith("W+") || val === "Wk") { cellBg = "#fecaca"; cellColor = "#7f1d1d"; }
                            else if (isExtraBall(val)) { cellBg = "#c084fc"; cellColor = "#ffffff"; }
                            else { cellBg = "rgba(0, 0, 0, 0.4)"; cellColor = "#ffffff"; }
                          }
                          return (
                            <div key={i} style={{
                              width: "20px", height: "20px", background: cellBg, color: cellColor,
                              border: borderStyle, borderRadius: "4px",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: val && val.includes("+")
                                ? undefined
                                : (val && val.length > 3 ? "7px" : (val && val.length > 1 ? "9px" : "11px")),
                              letterSpacing: val && val.length > 2 ? "-0.5px" : "normal",
                              fontWeight: 950, lineHeight: 1, whiteSpace: "nowrap", flexShrink: 0
                            }}>
                              {renderOutcomeText(val, 20)}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Bowling team badge (right side of right segment) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1 }}>
                      <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "15px", lineHeight: 1 }}>
                        {bowlTeamShort}
                      </span>
                      <span style={{
                        color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: "10px",
                        marginTop: "3px"
                      }}>BOWLING</span>
                    </div>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.18)", textAlign: "center", flexShrink: 0
                    }}>
                      <span style={{
                        color: "#ffffff", fontWeight: 950, fontSize: "10px",
                        lineHeight: "1.1", textTransform: "uppercase"
                      }}>
                        {bowlTeamShort}
                      </span>
                    </div>
                    {/* Overlay theme badge */}
                    <div style={{
                      width: "24px", height: "24px", background: "#475569",
                      borderRadius: "5px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fbbf24", fontSize: "11px",
                      border: "1px solid rgba(255,255,255,0.25)", flexShrink: 0
                    }}>
                      🏏
                    </div>
                  </div>
                </div>

              </div>
            )}
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

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 6px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#10b981", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>Champions Trophy Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.35))", margin: "0" }}>
            <>
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

                {/* CENTER MODULE: Dead-Center Dark Indigo Capsule with inline CT25 animation */}
                {(() => {
                  const ct25Anim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "DRS REVIEW" : null) || "").trim().toUpperCase();
                  let ct25Word = ct25Anim;
                  if (ct25Anim === "FOUR" || ct25Anim === "4" || ct25Anim === "4S" || ct25Anim === "FOUR!") ct25Word = "FOUR!";
                  else if (ct25Anim === "SIX" || ct25Anim === "6" || ct25Anim === "6S" || ct25Anim === "SIX!") ct25Word = "SIX!";
                  else if (ct25Anim === "WICKET" || ct25Anim === "W" || ct25Anim === "WICKET!") ct25Word = "WICKET!";
                  else if (ct25Anim === "OUT") ct25Word = "OUT!";
                  else if (ct25Anim === "NOT OUT" || ct25Anim === "NOT_OUT" || ct25Anim === "NOTOUT") ct25Word = "NOT OUT!";
                  else if (ct25Anim === "FREE HIT" || ct25Anim === "FREE_HIT" || ct25Anim === "FREEHIT") ct25Word = "FREE HIT!";
                  else if (ct25Anim === "NO BALL" || ct25Anim === "NB" || ct25Anim === "NOBALL") ct25Word = "NO BALL!";
                  else if (ct25Anim === "HAT-TRICK" || ct25Anim === "HATTRICK" || ct25Anim === "HAT TRICK") ct25Word = "HAT-TRICK!";
                  else if (ct25Anim === "REVIEW" || ct25Anim === "DRS" || ct25Anim === "PENDING") ct25Word = "DRS REVIEW";

                  // Per-event color palette matching CT2025 design
                  let animBg = "linear-gradient(135deg, #00cc44 0%, #059669 100%)";
                  let animTextColor = "#ffffff";
                  let animBorder = "#00cc44";
                  if (ct25Word === "WICKET!" || ct25Word === "OUT!") { animBg = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"; animBorder = "#ef4444"; }
                  else if (ct25Word === "FOUR!") { animBg = "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)"; animBorder = "#38bdf8"; }
                  else if (ct25Word === "SIX!") { animBg = "linear-gradient(135deg, #00cc44 0%, #059669 100%)"; animBorder = "#34d399"; }
                  else if (ct25Word === "NOT OUT!") { animBg = "linear-gradient(135deg, #16a34a 0%, #14532d 100%)"; animBorder = "#22c55e"; }
                  else if (ct25Word === "FREE HIT!") { animBg = "linear-gradient(135deg, #f97316 0%, #c2410c 100%)"; animBorder = "#fb923c"; }
                  else if (ct25Word === "NO BALL!") { animBg = "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)"; animBorder = "#a78bfa"; }
                  else if (ct25Word === "HAT-TRICK!") { animBg = "linear-gradient(135deg, #db2777 0%, #9d174d 100%)"; animBorder = "#f472b6"; }
                  else if (ct25Word === "DRS REVIEW") { animBg = "linear-gradient(135deg, #d97706 0%, #78350f 100%)"; animBorder = "#fbbf24"; }

                  const ct25Repeated = Array(18).fill(ct25Word).join("   •   ");

                  if (ct25Anim) {
                    return (
                      <div style={{
                        background: animBg,
                        height: "48px",
                        borderRadius: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "320px",
                        flexShrink: 0,
                        overflow: "hidden",
                        position: "relative",
                        border: `1.5px solid ${animBorder}`,
                        boxShadow: `0 4px 20px ${animBorder}60`,
                      }}>
                        <style>{`
                            @keyframes ct25MarqueeLTR {
                              0% { transform: translateX(-50%); }
                              100% { transform: translateX(0%); }
                            }
                          `}</style>
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "200%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          animation: "ct25MarqueeLTR 5s linear infinite",
                          pointerEvents: "none",
                        }}>
                          <span style={{
                            fontSize: "17px",
                            fontWeight: "950",
                            letterSpacing: "2px",
                            color: animTextColor,
                            textTransform: "uppercase",
                            display: "inline-block",
                            paddingRight: "40px",
                            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                          }}>
                            {ct25Repeated}
                          </span>
                          <span style={{
                            fontSize: "17px",
                            fontWeight: "950",
                            letterSpacing: "2px",
                            color: animTextColor,
                            textTransform: "uppercase",
                            display: "inline-block",
                            paddingRight: "40px",
                            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                          }}>
                            {ct25Repeated}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
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
                  );
                })()}

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
            </>

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

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#0373AF", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>CWC 25 India Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "92vw", maxWidth: "1050px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            {renderScoreboardMarqueeRibbon("cwc-25-india", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
                <div style={{ display: "flex", alignItems: "stretch", height: "44px", background: "transparent", overflow: "hidden" }}>

                  {/* Batting Team Trapezoid Name Block (Left End) */}
                  <div style={{
                    background: "#14122A",
                    borderTop: "3px solid #0373AF",
                    padding: "0 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "115px",
                    clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
                    flexShrink: 0
                  }}>
                    <span style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "11.5px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "left", width: "100%", paddingRight: "8px" }}>
                      {currentBatTeam}
                    </span>
                  </div>

                  {/* Batsmen details section */}
                  <div style={{
                    background: "rgba(20, 18, 42, 0.96)",
                    borderTop: "3px solid #0373AF",
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
                        <span style={{ color: "#0373AF", fontSize: "10px" }}>▶</span>
                        <span style={{ color: "#FFFFFF", fontWeight: "800", fontSize: "11.5px" }}>{scoringState.striker || "—"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px", fontWeight: "800", color: "#FFFFFF" }}>
                        <span style={{ fontSize: "12.5px" }}>{striker?.runs ?? 0}</span>
                        <span style={{ color: "#cbd5e1", fontSize: "9px" }}>{striker?.balls ?? 0}</span>
                      </div>
                    </div>
                    {/* Non-Striker */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", paddingLeft: "10px" }}>
                        <span style={{ color: "#cbd5e1", fontWeight: "600", fontSize: "10.5px" }}>{scoringState.nonStriker || "—"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px", fontWeight: "600", color: "#cbd5e1" }}>
                        <span style={{ fontSize: "11.5px" }}>{nonStriker?.runs ?? 0}</span>
                        <span style={{ fontSize: "8.5px" }}>{nonStriker?.balls ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center scoreboard display block */}
                  <div style={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>

                    {/* Batting Team Short Name (e.g. MUM) */}
                    <div style={{ background: "#14122A", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", borderBottom: "2.5px solid #0373AF", minWidth: "48px" }}>
                      <span style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "11.5px", letterSpacing: "0.5px" }}>{batTeamShort}</span>
                    </div>

                    {/* Score Rhombus Box */}
                    <div style={{
                      background: "linear-gradient(135deg, #0373AF 0%, #025380 100%)",
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
                      <span style={{ color: "#FFFFFF", fontWeight: "950", fontSize: "17.5px", letterSpacing: "-0.5px" }}>
                        {scoringState.score} - {scoringState.wickets}
                      </span>
                    </div>

                    {/* Overs Trapezoid Box */}
                    <div style={{
                      background: "rgba(20, 18, 42, 0.98)",
                      padding: "0 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "72px",
                      clipPath: "polygon(14% 0, 100% 0, 86% 100%, 0 100%)"
                    }}>
                      <span style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "13px", lineHeight: 1 }}>
                        {fmtOv(scoringState.balls, match.ballsPerOver)}/{match.overs}
                      </span>
                      <span style={{ color: "#cbd5e1", fontSize: "7.5px", fontWeight: "800", letterSpacing: "0.5px", marginTop: "1px" }}>OVERS</span>
                    </div>

                  </div>

                  {/* Bowler Details & outcomes */}
                  <div style={{
                    background: "rgba(20, 18, 42, 0.96)",
                    borderTop: "3px solid #0373AF",
                    display: "flex",
                    alignItems: "center",
                    flex: 1.1,
                    paddingLeft: "12px",
                    marginLeft: "-10px",
                    paddingRight: "12px"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", flex: 1 }}>
                      {/* Bowler Stats */}
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#FFFFFF", fontWeight: "800", fontSize: "11.5px" }}>
                        <span style={{ textTransform: "uppercase" }}>{scoringState.bowler || "—"}</span>
                        <span>
                          {bowler?.wickets ?? 0}/{bowler?.runsConceded ?? 0}
                          <span style={{ color: "#cbd5e1", fontWeight: "500", fontSize: "9px", marginLeft: "4px" }}>
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
                                <span style={{ color: val ? "#FFFFFF" : "rgba(255,255,255,0.25)", fontSize: val && val.length > 3 ? "7.5px" : (val && val.length > 1 ? "9px" : "11px"), fontWeight: "900", lineHeight: 1, whiteSpace: "nowrap" }}>
                                  {val || "•"}
                                </span>
                                {val && <div style={{ width: "8px", height: "1.5px", background: "#0373AF", marginTop: "1px" }} />}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Bowling Team Name Block (Right End) */}
                  <div style={{
                    background: "#14122A",
                    borderTop: "3px solid #0373AF",
                    padding: "0 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    minWidth: "115px",
                    clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
                    marginLeft: "-12px",
                    flexShrink: 0
                  }}>
                    <span style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "11.5px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "right", width: "100%" }}>
                      {currentBowlTeam}
                    </span>
                    {/* Logo badge overlay */}
                    <div style={{ marginLeft: "8px", width: "18px", height: "18px", background: "#14122A", border: "1px solid #0373AF", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0373AF", fontSize: "9.5px", flexShrink: 0 }}>
                      🏏
                    </div>
                  </div>

                </div>

                {/* Bottom summary status line bar with embedded LTR marquee */}
                {(() => {
                  const animRaw = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "REVIEW" : null) || "").trim().toUpperCase();
                  let animWord = "";
                  let marqueeTextColor = "#ffffff";
                  let marqueeTextStroke = "1px #14122A";
                  let marqueeTextShadow = "0 0 8px rgba(255,255,255,0.55)";
                  let barBg = "linear-gradient(90deg, #14122A 0%, #0373AF 50%, #14122A 100%)";
                  if (animRaw) {
                    if (animRaw === "FOUR" || animRaw === "4" || animRaw === "4S" || animRaw === "FOUR!") {
                      animWord = "FOUR";
                      barBg = "linear-gradient(90deg, #78350f 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #78350f 100%)";
                      marqueeTextColor = "#fde047";
                      marqueeTextStroke = "1.2px #854d0e";
                      marqueeTextShadow = "0 0 12px rgba(250,204,21,0.9), 0 0 20px rgba(234,179,8,0.55)";
                    } else if (animRaw === "SIX" || animRaw === "6" || animRaw === "6S" || animRaw === "SIX!") {
                      animWord = "SIX";
                      barBg = "linear-gradient(90deg, #7c2d12 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #7c2d12 100%)";
                      marqueeTextColor = "#fdba74";
                      marqueeTextStroke = "1.2px #9a3412";
                      marqueeTextShadow = "0 0 14px rgba(249,115,22,0.95), 0 0 24px rgba(234,88,12,0.6)";
                    } else if (animRaw === "WICKET" || animRaw === "W" || animRaw === "WICKET!" || animRaw === "OUT") {
                      animWord = animRaw === "OUT" ? "OUT" : "WICKET";
                      barBg = "linear-gradient(90deg, #7f1d1d 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #7f1d1d 100%)";
                      marqueeTextColor = "#fecaca";
                      marqueeTextStroke = "1.2px #991b1b";
                      marqueeTextShadow = "0 0 14px rgba(239,68,68,0.95), 0 0 24px rgba(220,38,38,0.6)";
                    } else if (animRaw === "NOT OUT" || animRaw === "NOT_OUT" || animRaw === "NOTOUT") {
                      animWord = "NOT OUT";
                      barBg = "linear-gradient(90deg, #064e3b 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #064e3b 100%)";
                      marqueeTextColor = "#a7f3d0";
                      marqueeTextStroke = "1.2px #065f46";
                      marqueeTextShadow = "0 0 14px rgba(16,185,129,0.9), 0 0 24px rgba(52,211,153,0.55)";
                    } else if (animRaw === "FREE HIT" || animRaw === "FREE_HIT" || animRaw === "FREEHIT") {
                      animWord = "FREE HIT";
                      barBg = "linear-gradient(90deg, #064e3b 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #064e3b 100%)";
                      marqueeTextColor = "#6ee7b7";
                      marqueeTextStroke = "1.2px #047857";
                      marqueeTextShadow = "0 0 14px rgba(52,211,153,0.9), 0 0 24px rgba(110,231,183,0.55)";
                    } else if (animRaw === "HAT-TRICK BALL" || animRaw === "HAT-TRICK" || animRaw === "HATTRICK") {
                      animWord = "HAT-TRICK";
                      barBg = "linear-gradient(90deg, #581c87 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #581c87 100%)";
                      marqueeTextColor = "#e9d5ff";
                      marqueeTextStroke = "1.2px #6b21a8";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.95), 0 0 24px rgba(192,132,252,0.55)";
                    } else if (animRaw === "REVIEW" || animRaw === "PENDING" || animRaw === "DRS") {
                      animWord = "DRS REVIEW";
                      barBg = "linear-gradient(90deg, #78350f 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #78350f 100%)";
                      marqueeTextColor = "#fde68a";
                      marqueeTextStroke = "1.2px #92400e";
                      marqueeTextShadow = "0 0 14px rgba(245,158,11,0.9), 0 0 24px rgba(251,191,36,0.55)";
                    } else if (animRaw === "NO BALL" || animRaw === "NO-BALL" || animRaw === "NOBALL" || animRaw === "Nb") {
                      animWord = "NO BALL";
                      barBg = "linear-gradient(90deg, #4c1d95 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #4c1d95 100%)";
                      marqueeTextColor = "#ddd6fe";
                      marqueeTextStroke = "1.2px #5b21b6";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.9), 0 0 24px rgba(196,181,253,0.5)";
                    } else if (animRaw === "POWERPLAY" || animRaw === "PP") {
                      animWord = "POWERPLAY";
                    } else if (animRaw === "INNINGS BREAK") {
                      animWord = "INNINGS BREAK";
                    } else {
                      animWord = animRaw;
                    }
                  }
                  const marqueeRepeated = animWord ? Array(22).fill(animWord).join("       ") : "";

                  return (
                    <div style={{
                      background: barBg,
                      padding: "3px 16px",
                      display: "flex",
                      justifyContent: "center",
                      borderRadius: "0 0 7px 7px",
                      border: "1.5px solid #0373AF",
                      borderTop: "none",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      height: "22px",
                      alignItems: "center",
                      boxSizing: "border-box"
                    }}>
                      <style>{`
                        @keyframes cwc25IndiaMarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>

                      {/* LTR Scrolling Marquee Layer (behind status text) */}
                      {animWord && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 1,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: "200%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            animation: "cwc25IndiaMarqueeLTR 6s linear infinite"
                          }}>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "12.5px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "12.5px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                          </div>
                        </div>
                      )}

                      {/* Status text (always on top, zIndex 5) */}
                      <span style={{
                        color: "#FFFFFF",
                        fontSize: "9.5px",
                        fontWeight: "900",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        position: "relative",
                        zIndex: 5,
                        whiteSpace: "nowrap"
                      }}>
                        {statusLine}
                      </span>
                    </div>
                  );
                })()}
              </>
            )}

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
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.55))" }}>
            {renderScoreboardMarqueeRibbon("wcl-fancode", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
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
              </>
            )}
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

    // ── CWC 23 India inline animation vars ────────────────────────────────
    const cwc23Anim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "DRS REVIEW" : null) || "").trim().toUpperCase();
    let cwc23Word = cwc23Anim;
    if (cwc23Anim === "FOUR" || cwc23Anim === "4" || cwc23Anim === "4S" || cwc23Anim === "FOUR!") cwc23Word = "FOUR!";
    else if (cwc23Anim === "SIX" || cwc23Anim === "6" || cwc23Anim === "6S" || cwc23Anim === "SIX!") cwc23Word = "SIX!";
    else if (cwc23Anim === "WICKET" || cwc23Anim === "W" || cwc23Anim === "WICKET!") cwc23Word = "WICKET!";
    else if (cwc23Anim === "OUT") cwc23Word = "OUT!";
    else if (cwc23Anim === "NOT OUT" || cwc23Anim === "NOT_OUT" || cwc23Anim === "NOTOUT") cwc23Word = "NOT OUT!";
    else if (cwc23Anim === "FREE HIT" || cwc23Anim === "FREE_HIT" || cwc23Anim === "FREEHIT") cwc23Word = "FREE HIT!";
    else if (cwc23Anim === "NO BALL" || cwc23Anim === "NB" || cwc23Anim === "NOBALL") cwc23Word = "NO BALL!";
    else if (cwc23Anim === "HAT-TRICK" || cwc23Anim === "HATTRICK" || cwc23Anim === "HAT TRICK") cwc23Word = "HAT-TRICK!";
    else if (cwc23Anim === "REVIEW" || cwc23Anim === "DRS" || cwc23Anim === "PENDING") cwc23Word = "DRS REVIEW";

    let cwc23AnimBg = "linear-gradient(135deg, #d946ef 0%, #ec4899 100%)";
    let cwc23AnimColor = "#ffffff";
    if (cwc23Word === "WICKET!" || cwc23Word === "OUT!") { cwc23AnimBg = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"; cwc23AnimColor = "#ffffff"; }
    else if (cwc23Word === "FOUR!") { cwc23AnimBg = "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"; cwc23AnimColor = "#ffffff"; }
    else if (cwc23Word === "SIX!") { cwc23AnimBg = "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"; cwc23AnimColor = "#ffffff"; }
    else if (cwc23Word === "NOT OUT!") { cwc23AnimBg = "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"; cwc23AnimColor = "#ffffff"; }
    else if (cwc23Word === "FREE HIT!") { cwc23AnimBg = "linear-gradient(135deg, #f97316 0%, #c2410c 100%)"; cwc23AnimColor = "#ffffff"; }
    else if (cwc23Word === "NO BALL!") { cwc23AnimBg = "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"; cwc23AnimColor = "#ffffff"; }
    else if (cwc23Word === "HAT-TRICK!") { cwc23AnimBg = "linear-gradient(135deg, #e11d48 0%, #be123c 100%)"; cwc23AnimColor = "#ffffff"; }
    else if (cwc23Word === "DRS REVIEW") { cwc23AnimBg = "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)"; cwc23AnimColor = "#ffffff"; }
    const cwc23Repeated = Array(18).fill(cwc23Word || " ").join("   •   ");

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#ec4899", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>T20 World Cup Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1340px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))" }}>
            {renderScoreboardMarqueeRibbon("cwc-23-india", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
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

                  {/* Center White Block (Score & Overs) OR Inline LTR Marquee Animation */}
                  {cwc23Anim ? (
                    <div style={{
                      background: cwc23AnimBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0",
                      minWidth: "260px",
                      width: "260px",
                      height: "100%",
                      flexShrink: 0,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)"
                    }}>
                      <style>{`
                        @keyframes cwc23MarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "200%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                        animation: "cwc23MarqueeLTR 3.5s linear infinite",
                        pointerEvents: "none"
                      }}>
                        <span style={{
                          fontSize: "13px",
                          fontWeight: "950",
                          letterSpacing: "2.5px",
                          color: cwc23AnimColor,
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "35px",
                          textShadow: "0 1px 4px rgba(0,0,0,0.4)"
                        }}>
                          {cwc23Repeated}
                        </span>
                        <span style={{
                          fontSize: "13px",
                          fontWeight: "950",
                          letterSpacing: "2.5px",
                          color: cwc23AnimColor,
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "35px",
                          textShadow: "0 1px 4px rgba(0,0,0,0.4)"
                        }}>
                          {cwc23Repeated}
                        </span>
                      </div>
                    </div>
                  ) : (
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
                  )}

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
                {activeNotification && !cwc23Anim && (
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
              </>
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

  // ── BBL BLACK — 100% Exact Match to Screenshot (White Glowing End Pills + Deep Indigo Body + White Center Capsule with Split Double Pill) ──
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

    const thisOver = scoringState.thisOver || [];
    const batsmanRuns = (scoringState.batsmen || []).reduce((acc, b) => acc + (b.runs || 0), 0);
    const extras = (scoringState as any).extras ?? Math.max(0, scoringState.score - batsmanRuns);

    // ── BBL Black inline animation vars ───────────────────────────────────
    const bblAnim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "DRS REVIEW" : null) || "").trim().toUpperCase();
    let bblWord = bblAnim;
    if (bblAnim === "FOUR" || bblAnim === "4" || bblAnim === "4S" || bblAnim === "FOUR!") bblWord = "FOUR!";
    else if (bblAnim === "SIX" || bblAnim === "6" || bblAnim === "6S" || bblAnim === "SIX!") bblWord = "SIX!";
    else if (bblAnim === "WICKET" || bblAnim === "W" || bblAnim === "WICKET!") bblWord = "WICKET!";
    else if (bblAnim === "OUT") bblWord = "OUT!";
    else if (bblAnim === "NOT OUT" || bblAnim === "NOT_OUT" || bblAnim === "NOTOUT") bblWord = "NOT OUT!";
    else if (bblAnim === "FREE HIT" || bblAnim === "FREE_HIT" || bblAnim === "FREEHIT") bblWord = "FREE HIT!";
    else if (bblAnim === "NO BALL" || bblAnim === "NB" || bblAnim === "NOBALL") bblWord = "NO BALL!";
    else if (bblAnim === "HAT-TRICK" || bblAnim === "HATTRICK" || bblAnim === "HAT TRICK") bblWord = "HAT-TRICK!";
    else if (bblAnim === "REVIEW" || bblAnim === "DRS" || bblAnim === "PENDING") bblWord = "DRS REVIEW";

    let bblAnimBg = "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)";
    let bblAnimBorder = "#a855f7";
    if (bblWord === "WICKET!" || bblWord === "OUT!") { bblAnimBg = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"; bblAnimBorder = "#ef4444"; }
    else if (bblWord === "FOUR!") { bblAnimBg = "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"; bblAnimBorder = "#f472b6"; }
    else if (bblWord === "SIX!") { bblAnimBg = "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"; bblAnimBorder = "#c084fc"; }
    else if (bblWord === "NOT OUT!") { bblAnimBg = "linear-gradient(135deg, #16a34a 0%, #14532d 100%)"; bblAnimBorder = "#4ade80"; }
    else if (bblWord === "FREE HIT!") { bblAnimBg = "linear-gradient(135deg, #f97316 0%, #c2410c 100%)"; bblAnimBorder = "#fb923c"; }
    else if (bblWord === "NO BALL!") { bblAnimBg = "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"; bblAnimBorder = "#22d3ee"; }
    else if (bblWord === "HAT-TRICK!") { bblAnimBg = "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)"; bblAnimBorder = "#f0abfc"; }
    else if (bblWord === "DRS REVIEW") { bblAnimBg = "linear-gradient(135deg, #d97706 0%, #78350f 100%)"; bblAnimBorder = "#fbbf24"; }
    const bblRepeated = Array(18).fill(bblWord || " ").join("   •   ");

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 24px" : "0 0 16px", fontFamily: "'Outfit', Arial, sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#ec4899", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>BBL Black Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1120px", position: "relative", zIndex: 1, filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.75))" }}>
            {renderScoreboardMarqueeRibbon("bbl-black", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
                {/* ── MAIN HORIZONTAL SCOREBOARD DECK ── */}
                <div style={{
                  display: "flex",
                  alignItems: "stretch",
                  height: "48px",
                  background: "linear-gradient(180deg, #22095A 0%, #17043d 100%)",
                  borderRadius: "24px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                  border: "1.5px solid rgba(236, 72, 153, 0.4)",
                  position: "relative",
                  overflow: "visible"
                }}>

                  {/* ── LEFT WHITE BATTING TEAM PILL ── */}
                  <div style={{
                    background: "linear-gradient(180deg, #FDFDFE 0%, #f1f5f9 100%)",
                    borderRadius: "24px",
                    padding: "0 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "135px",
                    maxWidth: "180px",
                    borderRight: "3.5px solid #ec4899",
                    boxShadow: "4px 0 16px rgba(236, 72, 153, 0.75), inset 0 1px 0 rgba(255,255,255,1)",
                    flexShrink: 0,
                    zIndex: 2,
                    marginRight: "-4px"
                  }}>
                    <span style={{
                      color: "#22095A",
                      fontWeight: "950",
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textAlign: "center"
                    }}>
                      {currentBatTeam}
                    </span>
                  </div>

                  {/* ── BATSMEN SECTION (STRIKER & NON-STRIKER) ── */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    flex: 1.1,
                    padding: "2px 14px 2px 16px",
                    minWidth: "160px"
                  }}>
                    {/* Striker Row */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "2px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.16)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0, overflow: "hidden" }}>
                        <span style={{
                          color: "#ffffff",
                          fontWeight: "900",
                          fontSize: "12.5px",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {scoringState.striker || "—"}
                        </span>
                        <span style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", transform: "rotate(-10deg)" }}>🏏</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", flexShrink: 0, marginLeft: "6px" }}>
                        <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13.5px", lineHeight: 1 }}>
                          {striker?.runs ?? 0}
                        </span>
                        <span style={{ color: "#cbd5e1", fontWeight: "700", fontSize: "10.5px", lineHeight: 1 }}>
                          {striker?.balls ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Non-Striker Row */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "2px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" }}>
                        <span style={{
                          color: "#ffffff",
                          fontWeight: "900",
                          fontSize: "12.5px",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {scoringState.nonStriker || "—"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", flexShrink: 0, marginLeft: "6px" }}>
                        <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13.5px", lineHeight: 1 }}>
                          {nonStriker?.runs ?? 0}
                        </span>
                        <span style={{ color: "#cbd5e1", fontWeight: "700", fontSize: "10.5px", lineHeight: 1 }}>
                          {nonStriker?.balls ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── CENTER: Animation OR Score Capsule ── */}
                  {bblAnim ? (
                    /* LTR Marquee Animation Capsule — same size as score pill */
                    <div style={{
                      background: bblAnimBg,
                      borderRadius: "24px",
                      minWidth: "175px",
                      width: "175px",
                      height: "100%",
                      border: `2.5px solid ${bblAnimBorder}`,
                      boxShadow: `0 0 20px ${bblAnimBorder}80, inset 0 1px 1px rgba(255,255,255,0.2)`,
                      position: "relative",
                      zIndex: 3,
                      flexShrink: 0,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <style>{`
                        @keyframes bblMarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "200%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                        animation: "bblMarqueeLTR 4.5s linear infinite",
                        pointerEvents: "none",
                      }}>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: "950",
                          letterSpacing: "2px",
                          color: "#ffffff",
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "30px",
                          textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                        }}>
                          {bblRepeated}
                        </span>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: "950",
                          letterSpacing: "2px",
                          color: "#ffffff",
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "30px",
                          textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                        }}>
                          {bblRepeated}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Normal Score Capsule */
                    <div style={{
                      background: "#ffffff",
                      borderRadius: "24px",
                      padding: "3px 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "175px",
                      border: "2.5px solid #ec4899",
                      boxShadow: "0 0 16px rgba(236, 72, 153, 0.7), inset 0 1px 1px rgba(255,255,255,1)",
                      position: "relative",
                      zIndex: 3,
                      flexShrink: 0
                    }}>
                      {/* Top Section: Team Abbreviations & Score Pill */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}>
                        {/* Matchup: FX v HG */}
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                          <span style={{ color: "#22095A", fontWeight: "950", fontSize: "11.5px", letterSpacing: "0.5px" }}>
                            {batTeamShort}
                          </span>
                          <span style={{ color: "#94a3b8", fontWeight: "800", fontSize: "9.5px", margin: "0 1px" }}>
                            v
                          </span>
                          <span style={{ color: "#ec4899", fontWeight: "950", fontSize: "11.5px", letterSpacing: "0.5px" }}>
                            {bowlTeamShort}
                          </span>
                        </div>

                        {/* Two-Tone Split Score Capsule */}
                        <div style={{
                          display: "flex",
                          alignItems: "stretch",
                          borderRadius: "14px",
                          overflow: "hidden",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
                        }}>
                          {/* Dark Purple Score Part: 0-0 */}
                          <div style={{
                            background: "#22095A",
                            color: "#FDFDFE",
                            padding: "2px 8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <span style={{ fontWeight: "950", fontSize: "13.5px", lineHeight: 1, letterSpacing: "-0.3px" }}>
                              {scoringState.score}-{scoringState.wickets}
                            </span>
                          </div>

                          {/* Hot Pink Overs Part: 0.0 (5) */}
                          <div style={{
                            background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                            color: "#FDFDFE",
                            padding: "2px 7px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px"
                          }}>
                            <span style={{ fontWeight: "950", fontSize: "12px", lineHeight: 1 }}>
                              {fmtOv(scoringState.balls, match.ballsPerOver)}
                            </span>
                            <span style={{ fontWeight: "850", fontSize: "9.5px", lineHeight: 1, opacity: 0.9 }}>
                              ({match.overs})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: EXTRAS: 0 */}
                      <div style={{
                        fontSize: "8px",
                        fontWeight: "950",
                        color: "#22095A",
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                        marginTop: "2px"
                      }}>
                        {scoringState.target !== null
                          ? `TARGET: ${scoringState.target} • NEED ${need ?? 0} (${bLeft ?? 0}b)`
                          : `EXTRAS: ${extras}`}
                      </div>
                    </div>
                  )}

                  {/* ── BOWLER SECTION (HAROON & FIGURES) ── */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    flex: 1.1,
                    padding: "2px 16px 2px 14px",
                    minWidth: "160px"
                  }}>
                    {/* Bowler Row */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "2px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.16)"
                    }}>
                      <span style={{
                        color: "#ffffff",
                        fontWeight: "900",
                        fontSize: "12.5px",
                        letterSpacing: "0.3px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {scoringState.bowler || "—"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "5px", flexShrink: 0, marginLeft: "6px" }}>
                        <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "13.5px", lineHeight: 1 }}>
                          {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                        </span>
                        <span style={{ color: "#cbd5e1", fontWeight: "700", fontSize: "10.5px", lineHeight: 1 }}>
                          {fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)}
                        </span>
                      </div>
                    </div>

                    {/* This Over Balls or Econ */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "2px",
                      height: "16px"
                    }}>
                      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                        {(() => {
                          const bpoLocal = match?.ballsPerOver || 6;
                          const extrasCount = thisOver.filter(isExtraBall).length;
                          const totalCirclesCount = Math.max(bpoLocal, bpoLocal + extrasCount);
                          return Array.from({ length: totalCirclesCount }).map((_, i) => {
                            const val = thisOver[i];
                            const isWicket = val === "W" || val?.startsWith("W+");
                            const isFour = val === "4";
                            const isSix = val === "6";
                            return (
                              <div key={i} style={{
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                background: val
                                  ? (isWicket ? "#ef4444" : isSix ? "#a855f7" : isFour ? "#ec4899" : "rgba(255,255,255,0.2)")
                                  : "rgba(255,255,255,0.06)",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: val && val.length > 1 ? "6.5px" : "8px",
                                fontWeight: "950",
                                lineHeight: 1
                              }}>
                                {val === "." ? "" : renderOutcomeText(val, 14)}
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <span style={{ color: "#cbd5e1", fontSize: "8.5px", fontWeight: "800" }}>
                        CRR: {crr}
                      </span>
                    </div>
                  </div>

                  {/* ── RIGHT WHITE BOWLING TEAM PILL ── */}
                  <div style={{
                    background: "linear-gradient(180deg, #FDFDFE 0%, #f1f5f9 100%)",
                    borderRadius: "24px",
                    padding: "0 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "135px",
                    maxWidth: "180px",
                    borderLeft: "3.5px solid #ec4899",
                    boxShadow: "-4px 0 16px rgba(236, 72, 153, 0.75), inset 0 1px 0 rgba(255,255,255,1)",
                    flexShrink: 0,
                    zIndex: 2,
                    marginLeft: "-4px"
                  }}>
                    <span style={{
                      color: "#22095A",
                      fontWeight: "950",
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textAlign: "center"
                    }}>
                      {currentBowlTeam}
                    </span>
                  </div>

                </div>

                {/* ── OPTIONAL NOTIFICATION POPUP (hidden when inline animation is active) ── */}
                {activeNotification && !bblAnim && (
                  <div style={{
                    background: getNotificationStyles(activeNotification).bg,
                    border: "2px solid #ec4899",
                    borderTop: "none",
                    borderRadius: "0 0 14px 14px",
                    padding: "3px 20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "-2px",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.45)",
                    transition: "all 0.3s ease"
                  }}>
                    <span style={{
                      color: getNotificationStyles(activeNotification).textColor,
                      fontSize: "10px",
                      fontWeight: "950",
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      animation: "pulseGlow 1s ease-in-out infinite alternate"
                    }}>
                      {activeNotification}
                    </span>
                  </div>
                )}
              </>
            )}

          </div>
        ) : (
          /* Match Not Started Card */
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, #1e084e 0%, #0f0326 100%)", border: "2.5px solid #ec4899", borderRadius: 18, padding: "28px 44px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.7), 0 0 20px rgba(236,72,153,0.4)" }}>
            <div style={{ color: "#ffffff", fontWeight: 950, fontSize: "20px", letterSpacing: "2px" }}>
              🏏 {match.team1Name.toUpperCase()} <span style={{ color: "#ec4899" }}>vs</span> {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#fbcfe8", fontSize: "10.5px", fontWeight: "800", marginTop: "8px", letterSpacing: "2px" }}>
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
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1320px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.28))" }}>
            {(() => {
              // ── Inline CricFusion event animation (LTR marquee) ──
              const cfAnim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "DRS REVIEW" : null) || "").trim().toUpperCase();
              let cfWord = cfAnim;
              if (cfAnim === "FOUR" || cfAnim === "4" || cfAnim === "4S" || cfAnim === "FOUR!") cfWord = "FOUR!";
              else if (cfAnim === "SIX" || cfAnim === "6" || cfAnim === "6S" || cfAnim === "SIX!") cfWord = "SIX!";
              else if (cfAnim === "WICKET" || cfAnim === "W" || cfAnim === "WICKET!") cfWord = "WICKET!";
              else if (cfAnim === "OUT") cfWord = "OUT!";
              else if (cfAnim === "NOT OUT" || cfAnim === "NOT_OUT" || cfAnim === "NOTOUT") cfWord = "NOT OUT!";
              else if (cfAnim === "FREE HIT" || cfAnim === "FREE_HIT" || cfAnim === "FREEHIT") cfWord = "FREE HIT!";
              else if (cfAnim === "NO BALL" || cfAnim === "NB" || cfAnim === "NOBALL") cfWord = "NO BALL!";
              else if (cfAnim === "HAT-TRICK" || cfAnim === "HATTRICK" || cfAnim === "HAT TRICK") cfWord = "HAT-TRICK!";
              else if (cfAnim === "REVIEW" || cfAnim === "DRS" || cfAnim === "PENDING") cfWord = "DRS REVIEW";

              let cfAnimBg = "linear-gradient(135deg, #22c55e 0%, #15803d 100%)";
              let cfAnimBorder = "#22c55e";
              if (cfWord === "WICKET!" || cfWord === "OUT!") { cfAnimBg = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"; cfAnimBorder = "#ef4444"; }
              else if (cfWord === "FOUR!") { cfAnimBg = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"; cfAnimBorder = "#60a5fa"; }
              else if (cfWord === "SIX!") { cfAnimBg = "linear-gradient(135deg, #22c55e 0%, #15803d 100%)"; cfAnimBorder = "#4ade80"; }
              else if (cfWord === "NOT OUT!") { cfAnimBg = "linear-gradient(135deg, #16a34a 0%, #14532d 100%)"; cfAnimBorder = "#22c55e"; }
              else if (cfWord === "FREE HIT!") { cfAnimBg = "linear-gradient(135deg, #f97316 0%, #c2410c 100%)"; cfAnimBorder = "#fb923c"; }
              else if (cfWord === "NO BALL!") { cfAnimBg = "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)"; cfAnimBorder = "#a78bfa"; }
              else if (cfWord === "HAT-TRICK!") { cfAnimBg = "linear-gradient(135deg, #db2777 0%, #9d174d 100%)"; cfAnimBorder = "#f472b6"; }
              else if (cfWord === "DRS REVIEW") { cfAnimBg = "linear-gradient(135deg, #d97706 0%, #78350f 100%)"; cfAnimBorder = "#fbbf24"; }

              const cfRepeated = Array(18).fill(cfWord).join("   •   ");

              if (cfAnim) {
                return (
                  <>
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

                      {/* CENTER COLUMN: Indigo/Red Capsule OR inline LTR animation */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {cfAnim ? (
                          /* Animation marquee capsule */
                          <div style={{
                            background: cfAnimBg,
                            height: "52px",
                            borderRadius: "9999px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "360px",
                            flexShrink: 0,
                            overflow: "hidden",
                            position: "relative",
                            border: `1.5px solid ${cfAnimBorder}`,
                            boxShadow: `0 4px 20px ${cfAnimBorder}60`,
                          }}>
                            <style>{`
                          @keyframes cfMarqueeLTR {
                            0% { transform: translateX(-50%); }
                            100% { transform: translateX(0%); }
                          }
                        `}</style>
                            <div style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "200%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              whiteSpace: "nowrap",
                              animation: "cfMarqueeLTR 5s linear infinite",
                              pointerEvents: "none",
                            }}>
                              <span style={{
                                fontSize: "18px",
                                fontWeight: "950",
                                letterSpacing: "2.5px",
                                color: "#ffffff",
                                textTransform: "uppercase",
                                display: "inline-block",
                                paddingRight: "40px",
                                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                              }}>
                                {cfRepeated}
                              </span>
                              <span style={{
                                fontSize: "18px",
                                fontWeight: "950",
                                letterSpacing: "2.5px",
                                color: "#ffffff",
                                textTransform: "uppercase",
                                display: "inline-block",
                                paddingRight: "40px",
                                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                              }}>
                                {cfRepeated}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Normal indigo/red capsule */
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
                        )}
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
                  </>
                );
              }
              // No animation — render the normal scoreboard
              return (
                <>
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
                  {/* Main scoreboard row */}
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
                    {/* LEFT COLUMN */}
                    <div style={{ display: "flex", alignItems: "center", minWidth: 0, justifyContent: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", maxWidth: "290px", gap: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", height: "23px", gap: "7px" }}>
                          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "7.5px", fontWeight: "900", flexShrink: 0, boxShadow: "0 0 8px rgba(220, 38, 38, 0.55)" }}>▶</div>
                          <span style={{ color: "#1e1b4b", fontWeight: "950", fontSize: "13.5px", letterSpacing: "0.3px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{scoringState.striker || "—"}</span>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                            <span style={{ color: "#1e1b4b", fontWeight: "950", fontSize: "15px", lineHeight: 1 }}>{striker?.runs ?? 0}</span>
                            <span style={{ color: "rgba(30,27,75,0.6)", fontSize: "11px", fontWeight: "800" }}>({striker?.balls ?? 0})</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", height: "21px", gap: "7px" }}>
                          <div style={{ width: "16px", flexShrink: 0 }} />
                          <span style={{ color: "rgba(30,27,75,0.72)", fontWeight: "750", fontSize: "13px", letterSpacing: "0.2px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{scoringState.nonStriker || "—"}</span>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                            <span style={{ color: "rgba(30,27,75,0.8)", fontWeight: "850", fontSize: "14px", lineHeight: 1 }}>{nonStriker?.runs ?? 0}</span>
                            <span style={{ color: "rgba(30,27,75,0.45)", fontSize: "10px", fontWeight: "700" }}>({nonStriker?.balls ?? 0})</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.12), transparent)", marginLeft: "14px", flexShrink: 0 }} />
                    </div>
                    {/* CENTER COLUMN: Normal indigo/red capsule */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ background: "linear-gradient(135deg, #110b38 0%, #190f4a 100%)", height: "52px", borderRadius: "9999px", display: "flex", alignItems: "stretch", overflow: "hidden", width: "360px", boxShadow: "0 4px 16px rgba(17,11,56,0.35), inset 0 1px 1px rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.12)", flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                          <div style={{ background: "linear-gradient(90deg, #dc2626 0%, #d92d20 50%, #b91c1c 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 14px", height: "27px", boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.15)" }}>
                            <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "11.5px", letterSpacing: "1px", textTransform: "uppercase", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{bowlTeamShort} <span style={{ opacity: 0.8, fontSize: "9.5px", fontWeight: 800 }}>V</span> {batTeamShort}</span>
                            <span style={{ color: "#ffffff", fontWeight: "950", fontSize: "15px", letterSpacing: "0.5px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{scoringState.score} - {scoringState.wickets}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", height: "25px", background: activeNotification ? getNotificationStyles(activeNotification).bg : "transparent", transition: "all 0.3s ease" }}>
                            <span style={{ color: activeNotification ? getNotificationStyles(activeNotification).textColor : "#ffffff", fontWeight: "900", fontSize: activeNotification ? "11px" : "10px", letterSpacing: "0.8px", textTransform: "uppercase", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", animation: activeNotification ? "pulseGlow 1s ease-in-out infinite alternate" : "none" }}>{activeNotification || statusLine}</span>
                          </div>
                        </div>
                        <div style={{ background: "#110b38", color: "#ffffff", width: "74px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1.5px solid rgba(255,255,255,0.15)", flexShrink: 0, padding: "0 6px" }}>
                          <span style={{ fontSize: "8px", fontWeight: "900", letterSpacing: "1px", color: "#a78bfa", textTransform: "uppercase", lineHeight: 1, marginBottom: "2px" }}>OVERS</span>
                          <div style={{ fontSize: "13.5px", fontWeight: "950", lineHeight: 1, color: "#ffffff" }}>{fmtOv(scoringState.balls, match.ballsPerOver)}<span style={{ fontSize: "9.5px", opacity: 0.6, fontWeight: 700 }}>/{match.overs}</span></div>
                        </div>
                      </div>
                    </div>
                    {/* RIGHT COLUMN */}
                    <div style={{ display: "flex", alignItems: "center", minWidth: 0, justifyContent: "flex-end", gap: "10px" }}>
                      <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.12), transparent)", marginRight: "4px", flexShrink: 0 }} />
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0, gap: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "23px", gap: "6px" }}>
                          <span style={{ color: "#1e1b4b", fontWeight: "950", fontSize: "13.5px", letterSpacing: "0.3px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{scoringState.bowler || "—"}</span>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                            <span style={{ color: "#1e1b4b", fontWeight: "950", fontSize: "14.5px" }}>{bowler?.wickets ?? 0} - {bowler?.runsConceded ?? 0}</span>
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "rgba(30,27,75,0.6)" }}>({fmtOv(bowler?.ballsBowled ?? 0, match.ballsPerOver)})</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", height: "21px", justifyContent: "flex-start" }}>
                          {Array.from({ length: totalBallSlots }).map((_, i) => {
                            const val = thisOver[i];
                            const bs = getBallStyle(val);
                            return (
                              <div key={i} style={{ width: "20px", height: "20px", background: bs.bg, color: bs.color, border: bs.border || "none", boxShadow: bs.shadow || "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: val && val.includes("+") ? undefined : (val && val.length > 3 ? "6.5px" : (val && val.length > 1 ? "8px" : "10px")), letterSpacing: val && val.length > 2 ? "-0.5px" : "normal", fontWeight: "950", flexShrink: 0, whiteSpace: "nowrap", lineHeight: 1 }}>
                                {val === "." ? "" : renderOutcomeText(val, 20)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "4px 10px", borderRadius: "9999px", color: "#ffffff", fontSize: "10px", fontWeight: "950", letterSpacing: "0.6px", gap: "4px", flexShrink: 0, height: "26px", boxShadow: "0 2px 8px rgba(21,128,61,0.3)" }}>
                        <span>🏘️</span><span style={{ fontSize: "9px" }}>CricScorer</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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

  // ── T20 EMERGING ASIA CUP 2024 / Exact Replica from Broadcast Screenshot ──
  if (themeSlug === "t20-emerging-asia-cup") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const bpo = match.ballsPerOver || 6;
    const rrr = (need !== null && bLeft !== null && bLeft > 0) ? ((need / bLeft) * bpo).toFixed(2) : null;
    const crr = calcRR(scoringState);
    const bowlerEcon = bowler && bowler.ballsBowled > 0 ? ((bowler.runsConceded / bowler.ballsBowled) * bpo).toFixed(2) : "0.00";

    const thisOver = scoringState.thisOver || [];
    const extrasCount = thisOver.filter(isExtraBall).length;
    const totalBallSlots = Math.max(bpo, bpo + extrasCount);

    const diamondBgBlue = `
      repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px),
      linear-gradient(180deg, #16469d 0%, #0e337e 100%)
    `;

    const diamondBgRed = `
      repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px),
      linear-gradient(180deg, #b81c1c 0%, #8e1414 100%)
    `;

    const diamondBgWhite = `
      repeating-linear-gradient(45deg, rgba(0,0,0,0.035) 0, rgba(0,0,0,0.035) 1px, transparent 1px, transparent 10px),
      repeating-linear-gradient(-45deg, rgba(0,0,0,0.035) 0, rgba(0,0,0,0.035) 1px, transparent 1px, transparent 10px),
      linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)
    `;

    // ── T20 Emerging Asia Cup inline animation vars ───────────────────────
    const eacAnim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "DRS REVIEW" : null) || "").trim().toUpperCase();
    let eacWord = eacAnim;
    if (eacAnim === "FOUR" || eacAnim === "4" || eacAnim === "4S" || eacAnim === "FOUR!") eacWord = "FOUR!";
    else if (eacAnim === "SIX" || eacAnim === "6" || eacAnim === "6S" || eacAnim === "SIX!") eacWord = "SIX!";
    else if (eacAnim === "WICKET" || eacAnim === "W" || eacAnim === "WICKET!") eacWord = "WICKET!";
    else if (eacAnim === "OUT") eacWord = "OUT!";
    else if (eacAnim === "NOT OUT" || eacAnim === "NOT_OUT" || eacAnim === "NOTOUT") eacWord = "NOT OUT!";
    else if (eacAnim === "FREE HIT" || eacAnim === "FREE_HIT" || eacAnim === "FREEHIT") eacWord = "FREE HIT!";
    else if (eacAnim === "NO BALL" || eacAnim === "NB" || eacAnim === "NOBALL") eacWord = "NO BALL!";
    else if (eacAnim === "HAT-TRICK" || eacAnim === "HATTRICK" || eacAnim === "HAT TRICK") eacWord = "HAT-TRICK!";
    else if (eacAnim === "REVIEW" || eacAnim === "DRS" || eacAnim === "PENDING") eacWord = "DRS REVIEW";

    let eacAnimBg = "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)";
    let eacAnimColor = "#ffffff";
    let eacAnimBorder = "#3b82f6";
    if (eacWord === "WICKET!" || eacWord === "OUT!") { eacAnimBg = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"; eacAnimColor = "#ffffff"; eacAnimBorder = "#ef4444"; }
    else if (eacWord === "FOUR!") { eacAnimBg = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"; eacAnimColor = "#000000"; eacAnimBorder = "#fbbf24"; }
    else if (eacWord === "SIX!") { eacAnimBg = "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"; eacAnimColor = "#ffffff"; eacAnimBorder = "#60a5fa"; }
    else if (eacWord === "NOT OUT!") { eacAnimBg = "linear-gradient(135deg, #16a34a 0%, #14532d 100%)"; eacAnimColor = "#ffffff"; eacAnimBorder = "#4ade80"; }
    else if (eacWord === "FREE HIT!") { eacAnimBg = "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)"; eacAnimColor = "#ffffff"; eacAnimBorder = "#fb923c"; }
    else if (eacWord === "NO BALL!") { eacAnimBg = "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"; eacAnimColor = "#ffffff"; eacAnimBorder = "#22d3ee"; }
    else if (eacWord === "HAT-TRICK!") { eacAnimBg = "linear-gradient(135deg, #d97706 0%, #dc2626 100%)"; eacAnimColor = "#ffffff"; eacAnimBorder = "#facc15"; }
    else if (eacWord === "DRS REVIEW") { eacAnimBg = "linear-gradient(135deg, #d97706 0%, #78350f 100%)"; eacAnimColor = "#ffffff"; eacAnimBorder = "#fbbf24"; }
    const eacRepeated = Array(18).fill(eacWord || " ").join("   •   ");

    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isPreview ? "center" : "flex-end", padding: isPreview ? "80px 0 28px" : "0 0 20px", fontFamily: "'Outfit', Arial, sans-serif", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#facc15", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>T20 Emerging Asia Cup 2024 Theme</span>
          </div>
        )}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1350px", position: "relative", zIndex: 1, filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.75))" }}>
            {renderScoreboardMarqueeRibbon("t20-emerging-asia-cup", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
                {/* Floating TARGET Capsule (Only in 2nd Innings) */}
                {scoringState.target !== null && (
                  <div style={{
                    position: "absolute",
                    top: "-26px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #0e337e 0%, #16469d 50%, #0e337e 100%)",
                    border: "1.5px solid #facc15",
                    borderRadius: "14px",
                    padding: "2px 16px",
                    color: "#ffffff",
                    fontSize: "10.5px",
                    fontWeight: "900",
                    letterSpacing: "1px",
                    zIndex: 10,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                  }}>
                    <span>🎯 TARGET <strong style={{ color: "#facc15", fontSize: "11.5px", marginLeft: "2px" }}>{scoringState.target}</strong></span>
                    {need !== null && bLeft !== null && (
                      <>
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
                        <span>NEED <strong style={{ color: "#facc15" }}>{need}</strong> IN <strong style={{ color: "#ffffff" }}>{bLeft}</strong> B</span>
                      </>
                    )}
                    {rrr !== null && (
                      <>
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
                        <span style={{ color: "#93c5fd" }}>REQ RR: {rrr}</span>
                      </>
                    )}
                  </div>
                )}

                {/* ── MAIN HORIZONTAL SCOREBOARD BAR (Exact Screenshot Layout) ── */}
                <div style={{
                  display: "flex",
                  alignItems: "stretch",
                  height: "48px",
                  background: "#0a193d",
                  borderRadius: "0px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                  boxSizing: "border-box"
                }}>

                  {/* ── LEFT HALF (Symmetric flex:1 container) ── */}
                  <div style={{ display: "flex", flex: 1, alignItems: "stretch", minWidth: 0 }}>
                    {/* ── 1. BATTING TEAM BLOCK (Solid Deep Blue) ── */}
                    <div style={{
                      background: "#0c2560",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 16px",
                      minWidth: "110px",
                      borderRight: "1px solid rgba(255,255,255,0.15)",
                      flexShrink: 0
                    }}>
                      <span style={{
                        color: "#ffffff",
                        fontWeight: 950,
                        fontSize: "12px",
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        textAlign: "center"
                      }}>
                        {currentBatTeam || "TEAM A"}
                      </span>
                    </div>

                    {/* ── 2. TEAM SCORE & OVERS (Patterned Royal Blue) ── */}
                    <div style={{
                      background: diamondBgBlue,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 14px",
                      minWidth: "110px",
                      borderRight: "1px solid rgba(255,255,255,0.15)",
                      flexShrink: 0,
                      lineHeight: 1
                    }}>
                      <div style={{
                        color: "#facc15",
                        fontWeight: 950,
                        fontSize: "20px",
                        letterSpacing: "-0.5px",
                        textShadow: "0 1px 4px rgba(0,0,0,0.5)"
                      }}>
                        {scoringState.score}-{scoringState.wickets}
                      </div>
                      <div style={{
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "8.5px",
                        letterSpacing: "0.5px",
                        marginTop: "3px",
                        textTransform: "uppercase"
                      }}>
                        OVERS {fmtOv(scoringState.balls, bpo)}
                      </div>
                    </div>

                    {/* ── 3. BATSMEN SECTION (Patterned Royal Blue) ── */}
                    <div style={{
                      background: diamondBgBlue,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      padding: "2px 14px",
                      flex: 1,
                      minWidth: 0,
                      gap: "3px",
                      borderRight: "1px solid rgba(255,255,255,0.15)"
                    }}>
                      {/* Non-Striker / Batsman 1 */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", minWidth: 0 }}>
                        <div style={{
                          color: "#ffffff",
                          fontWeight: 900,
                          fontSize: "11.5px",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minWidth: 0
                        }}>
                          {scoringState.nonStriker || "Non-Striker"}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "5px", flexShrink: 0 }}>
                          <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "12.5px" }}>{nonStriker?.runs ?? 0}</span>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: "9px" }}>{nonStriker?.balls ?? 0}</span>
                        </div>
                      </div>

                      {/* Striker / Batsman 2 with Orange Arrow Indicator */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: 0, overflow: "hidden" }}>
                          <span style={{ color: "#f59e0b", fontSize: "9px", fontWeight: 950, flexShrink: 0, lineHeight: 1 }}>▶</span>
                          <span style={{
                            color: "#ffffff",
                            fontWeight: 900,
                            fontSize: "11.5px",
                            letterSpacing: "0.3px",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {scoringState.striker || "Striker"}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "5px", flexShrink: 0 }}>
                          <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "12.5px" }}>{striker?.runs ?? 0}</span>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: "9px" }}>{striker?.balls ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── 4. CENTER INFO SECTION (Silver-White Block, Perfectly Centered & Animated) ── */}
                  {eacAnim ? (
                    <div style={{
                      background: eacAnimBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0",
                      minWidth: "155px",
                      width: "155px",
                      height: "100%",
                      borderRight: `1.5px solid ${eacAnimBorder}`,
                      borderLeft: `1.5px solid ${eacAnimBorder}`,
                      boxShadow: `0 0 14px ${eacAnimBorder}80, inset 0 1px 1px rgba(255,255,255,0.3)`,
                      flexShrink: 0,
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <style>{`
                        @keyframes eacMarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "200%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                        animation: "eacMarqueeLTR 3.5s linear infinite",
                        pointerEvents: "none"
                      }}>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: "950",
                          letterSpacing: "2px",
                          color: eacAnimColor,
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "30px",
                          textShadow: "0 1px 3px rgba(0,0,0,0.5)"
                        }}>
                          {eacRepeated}
                        </span>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: "950",
                          letterSpacing: "2px",
                          color: eacAnimColor,
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "30px",
                          textShadow: "0 1px 3px rgba(0,0,0,0.5)"
                        }}>
                          {eacRepeated}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: diamondBgWhite,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 18px",
                      minWidth: "155px",
                      borderRight: "1px solid rgba(0,0,0,0.1)",
                      borderLeft: "1px solid rgba(0,0,0,0.1)",
                      flexShrink: 0
                    }}>
                      {activeNotification ? (
                        <span style={{
                          color: "#dc2626",
                          fontWeight: 950,
                          fontSize: "13px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          animation: "pulseGlow 1s ease-in-out infinite alternate",
                          textAlign: "center"
                        }}>
                          {activeNotification}
                        </span>
                      ) : scoringState.customInputText ? (
                        <span style={{ color: "#0c2560", fontWeight: 950, fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "center" }}>
                          {scoringState.customInputText}
                        </span>
                      ) : (
                        <span style={{
                          color: "#0c2560",
                          fontWeight: 950,
                          fontSize: "14.5px",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          textAlign: "center"
                        }}>
                          CRR: {crr}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── RIGHT HALF (Symmetric flex:1 container) ── */}
                  <div style={{ display: "flex", flex: 1, alignItems: "stretch", minWidth: 0 }}>
                    {/* ── 5. BOWLER & OVER BALLS (Patterned Crimson Red) ── */}
                    <div style={{
                      background: diamondBgRed,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      padding: "2px 14px",
                      flex: 1,
                      minWidth: 0,
                      gap: "3px",
                      borderRight: "1px solid rgba(255,255,255,0.15)"
                    }}>
                      {/* Bowler Name & Figures */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", minWidth: 0 }}>
                        <div style={{
                          color: "#ffffff",
                          fontWeight: 900,
                          fontSize: "11.5px",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minWidth: 0
                        }}>
                          {scoringState.bowler || "Bowler"}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "3px", flexShrink: 0 }}>
                          <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "12.5px" }}>
                            {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "9.5px", fontWeight: 700 }}>
                            ({fmtOv(bowler?.ballsBowled ?? 0, bpo)})
                          </span>
                        </div>
                      </div>

                      {/* Over Ball Outcome Badges */}
                      <div style={{ display: "flex", gap: "3px", alignItems: "center", flexShrink: 0 }}>
                        {Array.from({ length: totalBallSlots }).map((_, i) => {
                          const ball = thisOver[i];
                          let bg = "rgba(255,255,255,0.08)";
                          let color = "#ffffff";
                          let border = "1px solid rgba(255,255,255,0.2)";
                          let shadow = "none";

                          if (ball) {
                            if (ball === "W" || ball.startsWith("W+")) {
                              bg = "#ef4444";
                              color = "#ffffff";
                              border = "none";
                              shadow = "0 1px 4px rgba(0,0,0,0.3)";
                            } else if (ball === "6") {
                              bg = "#3b82f6";
                              color = "#ffffff";
                              border = "none";
                              shadow = "0 1px 4px rgba(0,0,0,0.3)";
                            } else if (ball === "4") {
                              bg = "#f59e0b";
                              color = "#000000";
                              border = "none";
                              shadow = "0 1px 4px rgba(0,0,0,0.3)";
                            } else if (isExtraBall(ball)) {
                              bg = "#a855f7";
                              color = "#ffffff";
                              border = "none";
                              shadow = "0 1px 4px rgba(0,0,0,0.3)";
                            } else {
                              bg = "#ffffff";
                              color = "#0f172a";
                              border = "none";
                              shadow = "0 1px 4px rgba(0,0,0,0.25)";
                            }
                          }

                          return (
                            <div
                              key={i}
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
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
                              {ball && ball.includes("+") ? renderOutcomeText(ball, 16) : (ball || "")}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── 6. BOWLING TEAM BLOCK (Solid Crimson Red) ── */}
                    <div style={{
                      background: "#781010",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 16px",
                      minWidth: "110px",
                      flexShrink: 0
                    }}>
                      <span style={{
                        color: "#ffffff",
                        fontWeight: 950,
                        fontSize: "12px",
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        textAlign: "center"
                      }}>
                        {currentBowlTeam || "TEAM B"}
                      </span>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        ) : (
          <div className="scale-in" style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(135deg, #0c2560 0%, #16469d 100%)",
            border: "2px solid #facc15", borderRadius: "8px",
            padding: "16px 42px", textAlign: "center",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)"
          }}>
            <div style={{ color: "#ffffff", fontWeight: 950, fontSize: "18px", letterSpacing: "1.5px" }}>
              🏏 {match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#facc15", fontSize: "11px", fontWeight: "900", marginTop: "4px", letterSpacing: "2px" }}>
              MATCH NOT STARTED
            </div>
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
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "95vw", maxWidth: "1280px", position: "relative", zIndex: 1, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.7))" }}>
            {renderScoreboardMarqueeRibbon("sa20", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
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
              </>
            )}
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

    // ── Jio Cinema inline animation vars ──────────────────────────────────
    const jioAnim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "DRS REVIEW" : null) || "").trim().toUpperCase();
    let jioWord = jioAnim;
    if (jioAnim === "FOUR" || jioAnim === "4" || jioAnim === "4S" || jioAnim === "FOUR!") jioWord = "FOUR!";
    else if (jioAnim === "SIX" || jioAnim === "6" || jioAnim === "6S" || jioAnim === "SIX!") jioWord = "SIX!";
    else if (jioAnim === "WICKET" || jioAnim === "W" || jioAnim === "WICKET!") jioWord = "WICKET!";
    else if (jioAnim === "OUT") jioWord = "OUT!";
    else if (jioAnim === "NOT OUT" || jioAnim === "NOT_OUT" || jioAnim === "NOTOUT") jioWord = "NOT OUT!";
    else if (jioAnim === "FREE HIT" || jioAnim === "FREE_HIT" || jioAnim === "FREEHIT") jioWord = "FREE HIT!";
    else if (jioAnim === "NO BALL" || jioAnim === "NB" || jioAnim === "NOBALL") jioWord = "NO BALL!";
    else if (jioAnim === "HAT-TRICK" || jioAnim === "HATTRICK" || jioAnim === "HAT TRICK") jioWord = "HAT-TRICK!";
    else if (jioAnim === "REVIEW" || jioAnim === "DRS" || jioAnim === "PENDING") jioWord = "DRS REVIEW";

    let jioAnimColor = "#e11d48";
    let jioAnimGlow = "rgba(225,29,72,0.7)";
    if (jioWord === "WICKET!" || jioWord === "OUT!") { jioAnimColor = "#ef4444"; jioAnimGlow = "rgba(239,68,68,0.7)"; }
    else if (jioWord === "FOUR!") { jioAnimColor = "#fb7185"; jioAnimGlow = "rgba(251,113,133,0.7)"; }
    else if (jioWord === "SIX!") { jioAnimColor = "#818cf8"; jioAnimGlow = "rgba(129,140,248,0.7)"; }
    else if (jioWord === "NOT OUT!") { jioAnimColor = "#4ade80"; jioAnimGlow = "rgba(74,222,128,0.7)"; }
    else if (jioWord === "FREE HIT!") { jioAnimColor = "#fb923c"; jioAnimGlow = "rgba(251,146,60,0.7)"; }
    else if (jioWord === "NO BALL!") { jioAnimColor = "#22d3ee"; jioAnimGlow = "rgba(34,211,238,0.7)"; }
    else if (jioWord === "HAT-TRICK!") { jioAnimColor = "#f0abfc"; jioAnimGlow = "rgba(240,171,252,0.7)"; }
    else if (jioWord === "DRS REVIEW") { jioAnimColor = "#fbbf24"; jioAnimGlow = "rgba(251,191,36,0.7)"; }
    const jioRepeated = Array(18).fill(jioWord || " ").join("   •   ");

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
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{
            width: "96vw",
            maxWidth: "1360px",
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 14px 35px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 20px rgba(225, 29, 72, 0.25))"
          }}>
            {renderScoreboardMarqueeRibbon("jiocinema", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
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

                  {/* Center: Animation marquee OR normal match stats */}
                  {jioAnim ? (
                    <div style={{
                      flex: 1,
                      overflow: "hidden",
                      position: "relative",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                    }}>
                      <style>{`
                        @keyframes jioMarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "200%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                        animation: "jioMarqueeLTR 4s linear infinite",
                        pointerEvents: "none",
                      }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "950",
                          letterSpacing: "2.5px",
                          color: jioAnimColor,
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "40px",
                          textShadow: `0 0 12px ${jioAnimGlow}, 0 1px 4px rgba(0,0,0,0.6)`,
                        }}>
                          {jioRepeated}
                        </span>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "950",
                          letterSpacing: "2.5px",
                          color: jioAnimColor,
                          textTransform: "uppercase",
                          display: "inline-block",
                          paddingRight: "40px",
                          textShadow: `0 0 12px ${jioAnimGlow}, 0 1px 4px rgba(0,0,0,0.6)`,
                        }}>
                          {jioRepeated}
                        </span>
                      </div>
                    </div>
                  ) : (
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
                  )}

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
                    background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 18px",
                    minWidth: "175px",
                    flexShrink: 0,
                    borderLeft: "2.5px solid #be123c",
                    borderRight: "2.5px solid #be123c",
                    boxShadow: "0 0 15px rgba(225,29,72,0.2), inset 0 1px 0 rgba(255,255,255,1)",
                    position: "relative",
                    transition: "all 0.3s ease"
                  }}>
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
              </>
            )}

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
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1360px", position: "relative", zIndex: 1, filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.75)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.18))" }}>
            {renderScoreboardMarqueeRibbon("ipl", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
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
              </>
            )}

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

        {isPreview && <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", color: "#0373AF", padding: "9px 20px", fontSize: 11, fontWeight: 900, letterSpacing: 2.5, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />PREVIEW MODE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span><span>WT20 2024 Theme</span>
        </div>}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "92vw", maxWidth: "1020px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.7))" }}>
            {renderScoreboardMarqueeRibbon("wt20-2024", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
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
                      background: "linear-gradient(90deg, #14122A 0%, #0373AF 50%, #0284c7 100%)",
                      borderRadius: "12px",
                      padding: "2px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      boxShadow: "0 4px 14px rgba(3,115,175,0.45)",
                      color: "#FFFFFF",
                      border: "1px solid #0373AF",
                      whiteSpace: "nowrap"
                    }}>
                      <span style={{ fontSize: "9px", fontWeight: "950", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                        TARGET: <strong style={{ fontSize: "10.5px", color: "#FFFFFF" }}>{scoringState.target}</strong>
                      </span>
                      {need !== null && bLeft !== null && (
                        <>
                          <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#FFFFFF" }} />
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
                      background: "linear-gradient(90deg, #0373AF 0%, #0284c7 100%)",
                      borderRadius: "12px",
                      padding: "2px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 3px 12px rgba(3,115,175,0.4)",
                      color: "#FFFFFF",
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
                  background: "linear-gradient(135deg, rgba(20, 18, 42, 0.98) 0%, rgba(12, 10, 28, 0.98) 50%, rgba(20, 18, 42, 0.98) 100%)",
                  backdropFilter: "blur(14px)",
                  border: "1.5px solid #0373AF",
                  borderRadius: "14px 14px 0 0",
                  boxShadow: "0 0 20px rgba(3, 115, 175, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
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
                    background: "linear-gradient(90deg, #0373AF 0%, #0284c7 50%, #0373AF 100%)",
                    boxShadow: "0 0 8px #0373AF"
                  }} />

                  {/* ── LEFT BATTING TEAM SHIELD ── */}
                  <div style={{
                    background: "linear-gradient(135deg, #0373AF 0%, #025380 100%)",
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
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 0 6px #FFFFFF" }} />
                      <span style={{ color: "#FFFFFF", fontWeight: "950", fontSize: "12px", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
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
                      background: "rgba(3, 115, 175, 0.18)",
                      border: "1px solid #0373AF",
                      borderRadius: "10px",
                      padding: "3px 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flex: 1.1,
                      minWidth: 0,
                      boxShadow: "0 0 8px rgba(3, 115, 175, 0.15)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0, overflow: "hidden" }}>
                        <span style={{ color: "#0373AF", fontSize: "9px" }}>⚡</span>
                        <span style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {scoringState.striker || "—"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "2.5px", marginLeft: "4px", flexShrink: 0 }}>
                        <span style={{ color: "#FFFFFF", fontWeight: "950", fontSize: "13px" }}>
                          {striker?.runs ?? 0}
                        </span>
                        <span style={{ color: "#FFFFFF", fontSize: "8.5px", fontWeight: "800", background: "rgba(3,115,175,0.4)", padding: "1px 3px", borderRadius: "3px" }}>
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
                        <span style={{ color: "#FFFFFF", fontWeight: "850", fontSize: "11.5px" }}>
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
                    background: "linear-gradient(135deg, rgba(3, 115, 175, 0.25) 0%, rgba(20, 18, 42, 0.6) 100%)",
                    borderLeft: "1px solid #0373AF",
                    borderRight: "1px solid #0373AF",
                    position: "relative",
                    flexShrink: 0,
                    boxShadow: "inset 0 0 12px rgba(0,0,0,0.5)"
                  }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1, marginTop: "2px" }}>
                      <span style={{ color: "#FFFFFF", fontWeight: "950", fontSize: "19px", lineHeight: 1, letterSpacing: "-0.5px", textShadow: "0 0 8px rgba(255,255,255,0.3)" }}>
                        {scoringState.score}
                      </span>
                      <span style={{ color: "#0373AF", fontWeight: "950", fontSize: "14px", margin: "0 1px", lineHeight: 1 }}>/</span>
                      <span style={{ color: "#0373AF", fontWeight: "950", fontSize: "17px", lineHeight: 1, textShadow: "0 0 8px rgba(3,115,175,0.5)" }}>
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
                      border: "1px solid rgba(3,115,175,0.3)"
                    }}>
                      <span style={{ color: "#0373AF", fontSize: "7.5px", fontWeight: "950", letterSpacing: "0.5px" }}>OVER</span>
                      <span style={{ color: "#FFFFFF", fontSize: "9.5px", fontWeight: "900" }}>
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
                      background: "rgba(3, 115, 175, 0.15)",
                      border: "1px solid #0373AF",
                      borderRadius: "10px",
                      padding: "3px 8px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      minWidth: "95px",
                      boxShadow: "0 0 8px rgba(3, 115, 175, 0.1)"
                    }}>
                      <span style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "11px", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {scoringState.bowler || "—"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                        <span style={{ color: "#0373AF", fontWeight: "950", fontSize: "11.5px" }}>
                          {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                        </span>
                        <span style={{ color: "#cbd5e1", fontSize: "8.5px", fontWeight: "700" }}>
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
                                    ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                                    : isFour
                                      ? "linear-gradient(135deg, #0373AF 0%, #025380 100%)"
                                      : "rgba(3,115,175,0.35)"
                                : "rgba(255,255,255,0.04)",
                              border: ball
                                ? (isWicket ? "1.5px solid #ef4444" : isSix ? "1.5px solid #0284c7" : isFour ? "1.5px solid #0373AF" : "1px solid rgba(3,115,175,0.55)")
                                : "1px dashed rgba(3,115,175,0.25)",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "8.5px",
                              fontWeight: "950",
                              boxShadow: ball ? (isWicket ? "0 0 8px rgba(239,68,68,0.7)" : isSix ? "0 0 6px rgba(2,132,199,0.6)" : isFour ? "0 0 6px rgba(3,115,175,0.6)" : "0 0 4px rgba(3,115,175,0.25)") : "none"
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
                    background: "linear-gradient(135deg, #14122A 0%, #0373AF 100%)",
                    borderLeft: "1px solid #0373AF",
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
                      <span style={{ color: "#FFFFFF", fontWeight: "950", fontSize: "12px", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                        {bowlTeamShort}
                      </span>
                      <span style={{ fontSize: "10px", opacity: 0.9 }}>🏆</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "7px", fontWeight: "900", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                      BOWLING
                    </span>
                  </div>
                </div>

                {/* ── LOWER DYNAMIC STATUS & EMBEDDED LTR MARQUEE ── */}
                {(() => {
                  const animRaw = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "REVIEW" : null) || "").trim().toUpperCase();
                  let animWord = "";
                  let marqueeTextColor = "#ffffff";
                  let marqueeTextStroke = "1px #14122A";
                  let marqueeTextShadow = "0 0 8px rgba(255,255,255,0.55)";
                  let barBg = "linear-gradient(90deg, #14122A 0%, #0373AF 50%, #14122A 100%)";
                  if (animRaw) {
                    if (animRaw === "FOUR" || animRaw === "4" || animRaw === "4S" || animRaw === "FOUR!") {
                      animWord = "FOUR";
                      barBg = "linear-gradient(90deg, #78350f 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #78350f 100%)";
                      marqueeTextColor = "#fde047";
                      marqueeTextStroke = "1.2px #854d0e";
                      marqueeTextShadow = "0 0 12px rgba(250,204,21,0.9), 0 0 20px rgba(234,179,8,0.55)";
                    } else if (animRaw === "SIX" || animRaw === "6" || animRaw === "6S" || animRaw === "SIX!") {
                      animWord = "SIX";
                      barBg = "linear-gradient(90deg, #7c2d12 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #7c2d12 100%)";
                      marqueeTextColor = "#fdba74";
                      marqueeTextStroke = "1.2px #9a3412";
                      marqueeTextShadow = "0 0 14px rgba(249,115,22,0.95), 0 0 24px rgba(234,88,12,0.6)";
                    } else if (animRaw === "WICKET" || animRaw === "W" || animRaw === "WICKET!" || animRaw === "OUT") {
                      animWord = animRaw === "OUT" ? "OUT" : "WICKET";
                      barBg = "linear-gradient(90deg, #7f1d1d 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #7f1d1d 100%)";
                      marqueeTextColor = "#fecaca";
                      marqueeTextStroke = "1.2px #991b1b";
                      marqueeTextShadow = "0 0 14px rgba(239,68,68,0.95), 0 0 24px rgba(220,38,38,0.6)";
                    } else if (animRaw === "NOT OUT" || animRaw === "NOT_OUT" || animRaw === "NOTOUT") {
                      animWord = "NOT OUT";
                      barBg = "linear-gradient(90deg, #064e3b 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #064e3b 100%)";
                      marqueeTextColor = "#a7f3d0";
                      marqueeTextStroke = "1.2px #065f46";
                      marqueeTextShadow = "0 0 14px rgba(16,185,129,0.9), 0 0 24px rgba(52,211,153,0.55)";
                    } else if (animRaw === "FREE HIT" || animRaw === "FREE_HIT" || animRaw === "FREEHIT") {
                      animWord = "FREE HIT";
                      barBg = "linear-gradient(90deg, #064e3b 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #064e3b 100%)";
                      marqueeTextColor = "#6ee7b7";
                      marqueeTextStroke = "1.2px #047857";
                      marqueeTextShadow = "0 0 14px rgba(52,211,153,0.9), 0 0 24px rgba(110,231,183,0.55)";
                    } else if (animRaw === "HAT-TRICK BALL" || animRaw === "HAT-TRICK" || animRaw === "HATTRICK") {
                      animWord = "HAT-TRICK";
                      barBg = "linear-gradient(90deg, #581c87 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #581c87 100%)";
                      marqueeTextColor = "#e9d5ff";
                      marqueeTextStroke = "1.2px #6b21a8";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.95), 0 0 24px rgba(192,132,252,0.55)";
                    } else if (animRaw === "REVIEW" || animRaw === "PENDING" || animRaw === "DRS") {
                      animWord = "DRS REVIEW";
                      barBg = "linear-gradient(90deg, #78350f 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #78350f 100%)";
                      marqueeTextColor = "#fde68a";
                      marqueeTextStroke = "1.2px #92400e";
                      marqueeTextShadow = "0 0 14px rgba(245,158,11,0.9), 0 0 24px rgba(251,191,36,0.55)";
                    } else if (animRaw === "NO BALL" || animRaw === "NO-BALL" || animRaw === "NOBALL" || animRaw === "Nb") {
                      animWord = "NO BALL";
                      barBg = "linear-gradient(90deg, #4c1d95 0%, #0373AF 35%, #025380 50%, #0373AF 65%, #4c1d95 100%)";
                      marqueeTextColor = "#ddd6fe";
                      marqueeTextStroke = "1.2px #5b21b6";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.9), 0 0 24px rgba(196,181,253,0.5)";
                    } else if (animRaw === "POWERPLAY" || animRaw === "PP") {
                      animWord = "POWERPLAY";
                    } else if (animRaw === "INNINGS BREAK") {
                      animWord = "INNINGS BREAK";
                    } else {
                      animWord = animRaw;
                    }
                  }
                  const marqueeRepeated = animWord ? Array(22).fill(animWord).join("       ") : "";

                  return (
                    <div style={{
                      background: barBg,
                      padding: "2.5px 18px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "0 0 14px 14px",
                      border: "1.5px solid #0373AF",
                      borderTop: "none",
                      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.45), 0 0 12px rgba(3,115,175,0.25)",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      height: "20px",
                      boxSizing: "border-box"
                    }}>
                      <style>{`
                        @keyframes wt20MarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>

                      {/* LTR Scrolling Marquee Layer (behind status text, zIndex 1) */}
                      {animWord && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 1,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: "200%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            animation: "wt20MarqueeLTR 6s linear infinite"
                          }}>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "12px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "12px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                          </div>
                        </div>
                      )}

                      {/* Status text (always on top, zIndex 5) */}
                      <span style={{
                        color: "#FFFFFF",
                        fontSize: "9px",
                        fontWeight: "950",
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                        position: "relative",
                        zIndex: 5,
                        whiteSpace: "nowrap"
                      }}>
                        {statusLine}
                      </span>
                    </div>
                  );
                })()}
              </>
            )}

          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#14122A", border: "2px solid #0373AF", borderRadius: 18, padding: "28px 44px", textAlign: "center", color: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,0.65), 0 0 25px rgba(3,115,175,0.35)" }}>
            <div style={{ color: "#0373AF", fontWeight: 950, fontSize: "20px", letterSpacing: "2px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#cbd5e1", fontSize: "10.5px", fontWeight: "800", marginTop: "6px", letterSpacing: "2px" }}>ICC T20 WORLD CUP • MATCH NOT STARTED</div>
          </div>
        )}
      </div>
    );
  }

  // ── BBL STAR SPORTS — 100% Exact Match to Broadcast Reference Image ──
  if (themeSlug === "bbl-starsports") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const bpo = match.ballsPerOver || 6;
    const rrr = bLeft !== null && bLeft > 0 && need !== null ? ((need / bLeft) * bpo).toFixed(2) : "0.00";
    const crr = calcRR(scoringState);

    const totalFours = (scoringState.batsmen || []).reduce((a, b) => a + (b.fours || 0), 0);
    const totalSixes = (scoringState.batsmen || []).reduce((a, b) => a + (b.sixes || 0), 0);

    const stageTitle = (match as any).stage || (match as any).tournamentStage || "GROUP STAGE";
    const oversText = `${fmtOv(scoringState.balls, bpo)} (${match.overs})`;

    return (
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isPreview ? "center" : "flex-end",
        padding: isPreview ? "80px 0 28px" : "0 0 16px",
        fontFamily: "'Outfit', Arial, sans-serif",
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
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(8px)",
            color: "#00a0e9",
            padding: "8px 16px",
            fontSize: 10.5,
            fontWeight: 900,
            letterSpacing: 2,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              PREVIEW MODE
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
            <span>BBL Star Sports Theme</span>
          </div>
        )}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{
            width: "96vw",
            maxWidth: "1120px",
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.9))"
          }}>
            {renderScoreboardMarqueeRibbon("bbl-starsports", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
                {/* ── TOP MAIN SCOREBOARD ROW (Exact 44px Height) ── */}
                <div style={{
                  display: "flex",
                  alignItems: "stretch",
                  height: "44px",
                  background: "#ffffff",
                  borderRadius: "4px 4px 0 0",
                  overflow: "hidden"
                }}>

                  {/* 1. LEFT: Batting Team Name */}
                  <div style={{
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 18px",
                    flexShrink: 0,
                    minWidth: "140px"
                  }}>
                    <span style={{
                      color: "#000000",
                      fontWeight: 900,
                      fontSize: "15px",
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap"
                    }}>
                      {currentBatTeam}
                    </span>
                  </div>

                  {/* 2. CENTER-LEFT: Navy Score Capsule with Yellow Horns and Cyan Bottom Banner */}
                  <div style={{
                    background: "linear-gradient(180deg, #001248 0%, #001f70 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "3px 14px 0",
                    minWidth: "170px",
                    flexShrink: 0,
                    position: "relative",
                    borderLeft: "2px solid #000c36",
                    borderRight: "2px solid #000c36"
                  }}>
                    {/* Left Cyan Corner Accent */}
                    <div style={{ position: "absolute", left: "-1px", bottom: "13px", width: "4px", height: "14px", background: "#00a0e9", clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />

                    {/* Score and Overs Row with Gold Curved Horns */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "1px",
                      width: "100%"
                    }}>
                      {/* Left Yellow Horn */}
                      <svg width="6" height="22" viewBox="0 0 6 22" fill="none">
                        <path d="M5 2 C1 7 1 15 5 20" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>

                      {/* Main Score */}
                      <span style={{
                        color: "#ffffff",
                        fontSize: "20px",
                        fontWeight: 950,
                        letterSpacing: "-0.5px",
                        lineHeight: 1
                      }}>
                        {scoringState.score} - {scoringState.wickets}
                      </span>

                      {/* Overs */}
                      <span style={{
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 900,
                        opacity: 0.95,
                        marginLeft: "2px",
                        lineHeight: 1
                      }}>
                        {oversText}
                      </span>

                      {/* Right Yellow Horn */}
                      <svg width="6" height="22" viewBox="0 0 6 22" fill="none">
                        <path d="M1 2 C5 7 5 15 1 20" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* Right Cyan Corner Accent */}
                    <div style={{ position: "absolute", right: "-1px", bottom: "13px", width: "4px", height: "14px", background: "#00a0e9", clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />

                    {/* Bottom Cyan Banner */}
                    <div style={{
                      background: "#00a0e9",
                      width: "calc(100% + 28px)",
                      margin: "0 -14px",
                      height: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <span style={{
                        color: "#001248",
                        fontSize: "8px",
                        fontWeight: 950,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        lineHeight: 1
                      }}>
                        {stageTitle}
                      </span>
                    </div>
                  </div>

                  {/* 3. MIDDLE: 2-Row Batsmen Details on Pure White Background */}
                  <div style={{
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "2px 18px",
                    flex: 1,
                    minWidth: "175px",
                    gap: "1px"
                  }}>
                    {/* Row 1: Non-Striker */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        <span style={{
                          color: "#000000",
                          fontWeight: 900,
                          fontSize: "13px",
                          letterSpacing: "0.2px"
                        }}>
                          {scoringState.nonStriker || "Player W"}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexShrink: 0,
                        marginLeft: "10px"
                      }}>
                        <span style={{
                          color: "#000000",
                          fontWeight: 950,
                          fontSize: "14px",
                          minWidth: "18px",
                          textAlign: "right",
                          lineHeight: 1
                        }}>
                          {nonStriker?.runs ?? 0}
                        </span>
                        <span style={{
                          color: "#000000",
                          fontWeight: 900,
                          fontSize: "12.5px",
                          minWidth: "16px",
                          textAlign: "right",
                          lineHeight: 1
                        }}>
                          {nonStriker?.balls ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Striker with Black Dot Indicator */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#000000",
                          display: "inline-block",
                          flexShrink: 0
                        }} />
                        <span style={{
                          color: "#000000",
                          fontWeight: 950,
                          fontSize: "13px",
                          letterSpacing: "0.2px"
                        }}>
                          {scoringState.striker || "Player Z"}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexShrink: 0,
                        marginLeft: "10px"
                      }}>
                        <span style={{
                          color: "#000000",
                          fontWeight: 950,
                          fontSize: "14px",
                          minWidth: "18px",
                          textAlign: "right",
                          lineHeight: 1
                        }}>
                          {striker?.runs ?? 0}
                        </span>
                        <span style={{
                          color: "#000000",
                          fontWeight: 900,
                          fontSize: "12.5px",
                          minWidth: "16px",
                          textAlign: "right",
                          lineHeight: 1
                        }}>
                          {striker?.balls ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. YELLOW STAT BLOCK (REQ RUNS / BALLS or CRR / BOWLER) Flanked by Cyan Waves */}
                  <div style={{
                    background: "#ffc72c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 20px",
                    position: "relative",
                    flexShrink: 0,
                    minWidth: "165px"
                  }}>
                    {/* Left Cyan Wave Swoosh */}
                    <svg style={{ position: "absolute", left: "-1px", top: 0, bottom: 0, height: "100%", width: "12px" }} viewBox="0 0 12 44" fill="none" preserveAspectRatio="none">
                      <path d="M0 0 C7 11 7 33 0 44 L4 44 C11 33 11 11 4 0 Z" fill="#00a0e9" />
                    </svg>

                    {scoringState.target !== null ? (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "26px",
                        zIndex: 2
                      }}>
                        {/* Req Runs */}
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          lineHeight: 1
                        }}>
                          <span style={{
                            color: "#000000",
                            fontSize: "8px",
                            fontWeight: 900,
                            letterSpacing: "0.4px",
                            textTransform: "uppercase",
                            marginBottom: "2px"
                          }}>
                            REQ. RUNS
                          </span>
                          <span style={{
                            color: "#000000",
                            fontSize: "20px",
                            fontWeight: 950,
                            lineHeight: 1
                          }}>
                            {need}
                          </span>
                        </div>

                        {/* Balls Left */}
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          lineHeight: 1
                        }}>
                          <span style={{
                            color: "#000000",
                            fontSize: "8px",
                            fontWeight: 900,
                            letterSpacing: "0.4px",
                            textTransform: "uppercase",
                            marginBottom: "2px"
                          }}>
                            BALLS
                          </span>
                          <span style={{
                            color: "#000000",
                            fontSize: "20px",
                            fontWeight: 950,
                            lineHeight: 1
                          }}>
                            {bLeft}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* 1st Innings: CRR and Overs */
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "26px",
                        zIndex: 2
                      }}>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          lineHeight: 1
                        }}>
                          <span style={{
                            color: "#000000",
                            fontSize: "8px",
                            fontWeight: 900,
                            letterSpacing: "0.4px",
                            textTransform: "uppercase",
                            marginBottom: "2px"
                          }}>
                            CRR
                          </span>
                          <span style={{
                            color: "#000000",
                            fontSize: "20px",
                            fontWeight: 950,
                            lineHeight: 1
                          }}>
                            {crr}
                          </span>
                        </div>

                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          lineHeight: 1
                        }}>
                          <span style={{
                            color: "#000000",
                            fontSize: "8px",
                            fontWeight: 900,
                            letterSpacing: "0.4px",
                            textTransform: "uppercase",
                            marginBottom: "2px"
                          }}>
                            OVERS
                          </span>
                          <span style={{
                            color: "#000000",
                            fontSize: "20px",
                            fontWeight: 950,
                            lineHeight: 1
                          }}>
                            {match.overs}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Right Cyan Wave Swoosh */}
                    <svg style={{ position: "absolute", right: "-1px", top: 0, bottom: 0, height: "100%", width: "12px" }} viewBox="0 0 12 44" fill="none" preserveAspectRatio="none">
                      <path d="M12 0 C5 11 5 33 12 44 L8 44 C1 33 1 11 8 0 Z" fill="#00a0e9" />
                    </svg>
                  </div>

                  {/* 5. RIGHT: 2-Row Active Bowler Details & Bowling Team Badge on Pure White Background */}
                  <div style={{
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "2px 14px 2px 16px",
                    flex: 1,
                    minWidth: "175px",
                    position: "relative"
                  }}>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: "1px",
                      minWidth: 0,
                      flex: 1
                    }}>
                      {/* Row 1: Bowler Name + Spell Figures */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          <span style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#dc2626",
                            display: "inline-block",
                            flexShrink: 0
                          }} />
                          <span style={{
                            color: "#000000",
                            fontWeight: 950,
                            fontSize: "13px",
                            letterSpacing: "0.2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {scoringState.bowler || "Bowler"}
                          </span>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "3px",
                          flexShrink: 0
                        }}>
                          <span style={{
                            color: "#000000",
                            fontWeight: 950,
                            fontSize: "14px",
                            lineHeight: 1
                          }}>
                            {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                          </span>
                          <span style={{
                            color: "#000000",
                            fontWeight: 900,
                            fontSize: "11px",
                            lineHeight: 1
                          }}>
                            ({fmtOv(bowler?.ballsBowled ?? 0, bpo)})
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Team Name + Economy */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <span style={{
                          color: "#475569",
                          fontSize: "10.5px",
                          fontWeight: 900,
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {currentBowlTeam}
                        </span>
                        <span style={{
                          color: "#00a0e9",
                          fontSize: "10px",
                          fontWeight: 950,
                          letterSpacing: "0.3px"
                        }}>
                          ECO: {(bowler?.ballsBowled ?? 0) > 0 ? (((bowler?.runsConceded ?? 0) / (bowler?.ballsBowled ?? 1)) * bpo).toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </div>

                    {/* Watermark / Logo on Right */}
                    <div style={{
                      background: "rgba(0, 18, 72, 0.08)",
                      border: "1px solid rgba(0, 18, 72, 0.15)",
                      borderRadius: "3px",
                      padding: "2px 5px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "8px",
                      lineHeight: 1,
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: "9px" }}>🏏</span>
                      <span style={{ fontSize: "6px", fontWeight: 950, color: "#001248", letterSpacing: "0.2px" }}>
                        BBL
                      </span>
                    </div>
                  </div>

                </div>

                {/* ── BOTTOM BLUE STRIP WITH EMBEDDED LTR MARQUEE + BOWLER/STATS ── */}
                {(() => {
                  const animRaw = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "REVIEW" : null) || "").trim().toUpperCase();
                  let animWord = "";
                  let marqueeTextColor = "#ffffff";
                  let marqueeTextStroke = "1px #001248";
                  let marqueeTextShadow = "0 0 8px rgba(255,255,255,0.55)";
                  let barBg = "linear-gradient(90deg, #001248 0%, #00227a 50%, #001248 100%)";
                  if (animRaw) {
                    if (animRaw === "FOUR" || animRaw === "4" || animRaw === "4S" || animRaw === "FOUR!") {
                      animWord = "FOUR";
                      barBg = "linear-gradient(90deg, #78350f 0%, #001248 20%, #00227a 50%, #001248 80%, #78350f 100%)";
                      marqueeTextColor = "#fde047";
                      marqueeTextStroke = "1.2px #854d0e";
                      marqueeTextShadow = "0 0 12px rgba(250,204,21,0.9), 0 0 20px rgba(234,179,8,0.55)";
                    } else if (animRaw === "SIX" || animRaw === "6" || animRaw === "6S" || animRaw === "SIX!") {
                      animWord = "SIX";
                      barBg = "linear-gradient(90deg, #7c2d12 0%, #001248 20%, #00227a 50%, #001248 80%, #7c2d12 100%)";
                      marqueeTextColor = "#fdba74";
                      marqueeTextStroke = "1.2px #9a3412";
                      marqueeTextShadow = "0 0 14px rgba(249,115,22,0.95), 0 0 24px rgba(234,88,12,0.6)";
                    } else if (animRaw === "WICKET" || animRaw === "W" || animRaw === "WICKET!" || animRaw === "OUT") {
                      animWord = animRaw === "OUT" ? "OUT" : "WICKET";
                      barBg = "linear-gradient(90deg, #7f1d1d 0%, #001248 20%, #00227a 50%, #001248 80%, #7f1d1d 100%)";
                      marqueeTextColor = "#fecaca";
                      marqueeTextStroke = "1.2px #991b1b";
                      marqueeTextShadow = "0 0 14px rgba(239,68,68,0.95), 0 0 24px rgba(220,38,38,0.6)";
                    } else if (animRaw === "NOT OUT" || animRaw === "NOT_OUT" || animRaw === "NOTOUT") {
                      animWord = "NOT OUT";
                      barBg = "linear-gradient(90deg, #064e3b 0%, #001248 20%, #00227a 50%, #001248 80%, #064e3b 100%)";
                      marqueeTextColor = "#a7f3d0";
                      marqueeTextStroke = "1.2px #065f46";
                      marqueeTextShadow = "0 0 14px rgba(16,185,129,0.9), 0 0 24px rgba(52,211,153,0.55)";
                    } else if (animRaw === "FREE HIT" || animRaw === "FREE_HIT" || animRaw === "FREEHIT") {
                      animWord = "FREE HIT";
                      barBg = "linear-gradient(90deg, #064e3b 0%, #001248 20%, #00227a 50%, #001248 80%, #064e3b 100%)";
                      marqueeTextColor = "#6ee7b7";
                      marqueeTextStroke = "1.2px #047857";
                      marqueeTextShadow = "0 0 14px rgba(52,211,153,0.9), 0 0 24px rgba(110,231,183,0.55)";
                    } else if (animRaw === "HAT-TRICK BALL" || animRaw === "HAT-TRICK" || animRaw === "HATTRICK") {
                      animWord = "HAT-TRICK";
                      barBg = "linear-gradient(90deg, #581c87 0%, #001248 20%, #00227a 50%, #001248 80%, #581c87 100%)";
                      marqueeTextColor = "#e9d5ff";
                      marqueeTextStroke = "1.2px #6b21a8";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.95), 0 0 24px rgba(192,132,252,0.55)";
                    } else if (animRaw === "REVIEW" || animRaw === "PENDING" || animRaw === "DRS") {
                      animWord = "DRS REVIEW";
                      barBg = "linear-gradient(90deg, #78350f 0%, #001248 20%, #00227a 50%, #001248 80%, #78350f 100%)";
                      marqueeTextColor = "#fde68a";
                      marqueeTextStroke = "1.2px #92400e";
                      marqueeTextShadow = "0 0 14px rgba(245,158,11,0.9), 0 0 24px rgba(251,191,36,0.55)";
                    } else if (animRaw === "NO BALL" || animRaw === "NO-BALL" || animRaw === "NOBALL" || animRaw === "Nb") {
                      animWord = "NO BALL";
                      barBg = "linear-gradient(90deg, #4c1d95 0%, #001248 20%, #00227a 50%, #001248 80%, #4c1d95 100%)";
                      marqueeTextColor = "#ddd6fe";
                      marqueeTextStroke = "1.2px #5b21b6";
                      marqueeTextShadow = "0 0 14px rgba(168,85,247,0.9), 0 0 24px rgba(196,181,253,0.5)";
                    } else if (animRaw === "POWERPLAY" || animRaw === "PP") {
                      animWord = "POWERPLAY";
                    } else if (animRaw === "INNINGS BREAK") {
                      animWord = "INNINGS BREAK";
                    } else {
                      animWord = animRaw;
                    }
                  }
                  const marqueeRepeated = animWord ? Array(18).fill(animWord).join("       ") : "";

                  return (
                    <div style={{
                      background: barBg,
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                      overflow: "hidden",
                      borderTop: "1.5px solid #00a0e9",
                      borderRadius: "0 0 4px 4px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                      padding: "0 46px"
                    }}>
                      {/* Inline @keyframes for perfect LTR marquee loop */}
                      <style>{`
                        @keyframes bblStarMarqueeLTR {
                          0%   { transform: translateX(-50%); }
                          100% { transform: translateX(0%); }
                        }
                      `}</style>

                      {/* LTR Scrolling Marquee Layer (behind stats, zIndex 1) */}
                      {animWord && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 1,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: "200%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            animation: "bblStarMarqueeLTR 6s linear infinite"
                          }}>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "13px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                            <span style={{
                              display: "inline-block",
                              paddingRight: "60px",
                              fontWeight: "950",
                              fontSize: "13px",
                              letterSpacing: "4px",
                              color: marqueeTextColor,
                              WebkitTextStroke: marqueeTextStroke,
                              textShadow: marqueeTextShadow,
                              textTransform: "uppercase",
                              opacity: 0.94
                            }}>{marqueeRepeated}</span>
                          </div>
                        </div>
                      )}

                      {/* Left Cyan Grass / Flame Graphic Watermark */}
                      <div style={{
                        position: "absolute",
                        left: "2px",
                        bottom: 0,
                        display: "flex",
                        opacity: 0.9,
                        zIndex: 3
                      }}>
                        <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
                          <path d="M0 18 C2 10 5 4 9 1 C7 7 11 11 14 18 C16 10 21 5 26 0 C22 7 24 13 26 18 C28 11 31 7 36 3 C32 9 34 14 36 18 Z" fill="#00a0e9" />
                        </svg>
                      </div>

                      {/* Left: Bowler Details (always on top, zIndex 5) */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 900,
                        letterSpacing: "0.5px",
                        position: "relative",
                        zIndex: 5,
                        flexShrink: 0
                      }}>
                        <span style={{ color: "#ffc72c" }}>●</span>
                        <span style={{ color: "#bae6fd", textTransform: "uppercase" }}>BOWLER:</span>
                        <strong style={{ color: "#ffffff" }}>{scoringState.bowler || "Bowler"}</strong>
                        <span style={{ color: "#facc15", fontWeight: 950, marginLeft: "2px" }}>
                          {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}
                        </span>
                        <span style={{ color: "#bae6fd", fontSize: "9.5px" }}>
                          ({fmtOv(bowler?.ballsBowled ?? 0, bpo)} ov)
                        </span>
                      </div>

                      {/* Separator */}
                      <span style={{ opacity: 0.5, color: "#ffffff", position: "relative", zIndex: 5, flexShrink: 0 }}>|</span>

                      {/* Right: Fours / Sixes Stats (always on top, zIndex 5) */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 900,
                        letterSpacing: "0.4px",
                        position: "relative",
                        zIndex: 5,
                        flexShrink: 0
                      }}>
                        <span>
                          Fours <strong style={{ color: "#ffffff" }}>{totalFours}</strong>
                        </span>
                        <span style={{ opacity: 0.45 }}>•</span>
                        <span>
                          Sixes <strong style={{ color: "#ffffff" }}>{totalSixes}</strong>
                        </span>
                      </div>

                      {/* Right Cyan Grass / Flame Graphic Watermark */}
                      <div style={{
                        position: "absolute",
                        right: "2px",
                        bottom: 0,
                        display: "flex",
                        opacity: 0.9,
                        transform: "scaleX(-1)",
                        zIndex: 3
                      }}>
                        <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
                          <path d="M0 18 C2 10 5 4 9 1 C7 7 11 11 14 18 C16 10 21 5 26 0 C22 7 24 13 26 18 C28 11 31 7 36 3 C32 9 34 14 36 18 Z" fill="#00a0e9" />
                        </svg>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

          </div>
        ) : (
          <div className="scale-in" style={{
            position: "relative",
            zIndex: 1,
            background: "linear-gradient(180deg, #001248 0%, #001f70 100%)",
            border: "2px solid #00a0e9",
            borderRadius: 14,
            padding: "32px 52px",
            textAlign: "center",
            boxShadow: "0 16px 36px rgba(0,0,0,0.7)"
          }}>
            <div style={{ color: "#facc15", fontWeight: 950, fontSize: "22px", letterSpacing: "1.5px" }}>
              🏏 {match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#00a0e9", fontSize: "11px", fontWeight: 900, marginTop: "8px", letterSpacing: "2px" }}>
              BBL STAR SPORTS • MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── STAR SPORTS T20 — 13th Theme: Exact match to broadcast reference screenshot ──
  if (themeSlug === "starsports-t20") {
    const bpo = match.ballsPerOver || 6;
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;
    const rrr = bLeft !== null && bLeft > 0 && need !== null ? ((need / bLeft) * bpo).toFixed(2) : "0.00";
    const crr = calcRR(scoringState);
    const oversText = fmtOv(scoringState.balls, bpo);
    const getShortNameLocal = (name: string) => {
      const words = (name || "").trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return (name || "").slice(0, 3).toUpperCase();
    };
    const batShort = getShortNameLocal(currentBatTeam);
    const bowlShort = getShortNameLocal(currentBowlTeam);
    const thisOver = scoringState.thisOver || [];
    const target = scoringState.target;

    // Animation state
    const ssAnim = (scoringState.animation || (scoringState.decision === "OUT" ? "OUT" : scoringState.decision === "NOT OUT" ? "NOT OUT" : scoringState.decision === "PENDING" ? "DRS REVIEW" : null) || "").trim().toUpperCase();
    let ssWord = ssAnim;
    if (ssAnim === "FOUR" || ssAnim === "4" || ssAnim === "4S" || ssAnim === "FOUR!") ssWord = "FOUR!";
    else if (ssAnim === "SIX" || ssAnim === "6" || ssAnim === "6S" || ssAnim === "SIX!") ssWord = "SIX!";
    else if (ssAnim === "WICKET" || ssAnim === "W" || ssAnim === "WICKET!") ssWord = "WICKET!";
    else if (ssAnim === "OUT") ssWord = "OUT!";
    else if (ssAnim === "NOT OUT" || ssAnim === "NOT_OUT" || ssAnim === "NOTOUT") ssWord = "NOT OUT!";
    else if (ssAnim === "FREE HIT" || ssAnim === "FREE_HIT" || ssAnim === "FREEHIT") ssWord = "FREE HIT!";
    else if (ssAnim === "NO BALL" || ssAnim === "NB" || ssAnim === "NOBALL") ssWord = "NO BALL!";
    else if (ssAnim === "HAT-TRICK" || ssAnim === "HATTRICK" || ssAnim === "HAT TRICK") ssWord = "HAT-TRICK!";
    else if (ssAnim === "REVIEW" || ssAnim === "DRS" || ssAnim === "PENDING") ssWord = "DRS REVIEW";
    let ssAnimColor = "#facc15";
    if (ssWord === "WICKET!" || ssWord === "OUT!") ssAnimColor = "#ef4444";
    else if (ssWord === "SIX!") ssAnimColor = "#34d399";
    else if (ssWord === "FREE HIT!") ssAnimColor = "#6ee7b7";
    else if (ssWord === "NOT OUT!") ssAnimColor = "#4ade80";
    else if (ssWord === "NO BALL!") ssAnimColor = "#c084fc";
    else if (ssWord === "DRS REVIEW") ssAnimColor = "#fde68a";
    else if (ssWord === "HAT-TRICK!") ssAnimColor = "#e879f9";
    const ssRepeated = Array(16).fill(ssWord || " ").join("     ");

    return (
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isPreview ? "center" : "flex-end",
        padding: isPreview ? "80px 0 28px" : "0 0 16px",
        fontFamily: "'Outfit', Arial, sans-serif",
        overflow: "hidden"
      }}>
        <style>{GLOBAL_CSS}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(8px)",
            color: "#facc15",
            padding: "8px 16px",
            fontSize: 10.5, fontWeight: 900, letterSpacing: 2, zIndex: 999,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              PREVIEW MODE
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
            <span>Star Sports T20 Theme</span>
          </div>
        )}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{ width: "96vw", maxWidth: "1120px", position: "relative", zIndex: 1, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.85))" }}>
            {renderScoreboardMarqueeRibbon("starsports-t20", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <>
                {/* ── MAIN SCOREBOARD ROW ── */}
                <div style={{ display: "flex", alignItems: "stretch", height: "46px", borderRadius: "5px 5px 0 0", overflow: "hidden" }}>

                  {/* 1. LEFT DARK TEAM PILL */}
                  <div style={{
                    background: "linear-gradient(135deg, #18212f 0%, #1e2a42 100%)",
                    display: "flex", flexDirection: "column", alignItems: "flex-start",
                    justifyContent: "center", padding: "0 14px 0 12px",
                    flexShrink: 0, minWidth: "120px", position: "relative", overflow: "hidden"
                  }}>
                    {/* Diagonal cyan spark stripes */}
                    <svg style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "28px", opacity: 0.9 }} viewBox="0 0 28 46" fill="none" preserveAspectRatio="none">
                      <path d="M28 0 L14 0 L0 46 L14 46 Z" fill="#0284c7" opacity="0.7" />
                      <path d="M28 0 L20 0 L6 46 L20 46 Z" fill="#38bdf8" opacity="0.35" />
                    </svg>
                    <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "14px", letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1, zIndex: 1 }}>{currentBatTeam.length > 10 ? batShort : currentBatTeam.toUpperCase()}</span>
                    <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "9.5px", letterSpacing: "0.3px", textTransform: "uppercase", lineHeight: 1, marginTop: "2px", zIndex: 1 }}>v {currentBowlTeam.length > 8 ? bowlShort : currentBowlTeam.toUpperCase()}</span>
                  </div>

                  {/* 2. BLUE SCORE BLOCK */}
                  <div style={{
                    background: "linear-gradient(180deg, #0369a1 0%, #0284c7 60%, #0ea5e9 100%)",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "2px 16px",
                    flexShrink: 0, minWidth: "110px",
                    borderLeft: "2px solid #0369a1", borderRight: "2px solid #0369a1"
                  }}>
                    <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "22px", lineHeight: 1, letterSpacing: "-0.5px" }}>
                      {scoringState.score}-{scoringState.wickets}
                    </span>
                    <span style={{ color: "#e0f2fe", fontWeight: 800, fontSize: "9.5px", letterSpacing: "0.3px", marginTop: "2px" }}>
                      {oversText} OV{target !== null ? ` • TGT ${target}` : ` • ${match.overs} OV`}
                    </span>
                  </div>

                  {/* 3. WHITE BATSMEN SECTION */}
                  <div style={{
                    background: "#ffffff", display: "flex", flexDirection: "column",
                    justifyContent: "center", padding: "2px 14px", flex: 1, minWidth: "160px", gap: "1px"
                  }}>
                    {/* Non-striker */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#94a3b8", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "#1e293b", fontWeight: 800, fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scoringState.nonStriker || "Player B"}</span>
                      </div>
                      <span style={{ color: "#1e293b", fontWeight: 950, fontSize: "13px", flexShrink: 0, marginLeft: "8px" }}>
                        {nonStriker?.runs ?? 0}<span style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}> {nonStriker?.balls ?? 0}</span>
                      </span>
                    </div>
                    {/* Striker */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#0284c7", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "#0c1a2e", fontWeight: 950, fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scoringState.striker || "Player A"}</span>
                      </div>
                      <span style={{ color: "#0c1a2e", fontWeight: 950, fontSize: "13px", flexShrink: 0, marginLeft: "8px" }}>
                        {striker?.runs ?? 0}<span style={{ color: "#475569", fontWeight: 700, fontSize: "11px" }}> {striker?.balls ?? 0}</span>
                      </span>
                    </div>
                  </div>

                  {/* 4. YELLOW CRR/RRR BLOCK */}
                  <div style={{
                    background: "#facc15",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "2px 16px",
                    flexShrink: 0, minWidth: "100px", gap: "2px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", lineHeight: 1 }}>
                      <span style={{ color: "#1c1400", fontWeight: 800, fontSize: "9px", letterSpacing: "0.3px", textTransform: "uppercase" }}>CRR:</span>
                      <span style={{ color: "#1c1400", fontWeight: 950, fontSize: "13px" }}>{crr}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", lineHeight: 1 }}>
                      <span style={{ color: "#1c1400", fontWeight: 800, fontSize: "9px", letterSpacing: "0.3px", textTransform: "uppercase" }}>RRR:</span>
                      <span style={{ color: "#1c1400", fontWeight: 950, fontSize: "13px" }}>{target !== null ? rrr : "—"}</span>
                    </div>
                  </div>

                  {/* 5. WHITE BOWLER SECTION */}
                  <div style={{
                    background: "#ffffff", display: "flex", flexDirection: "column",
                    justifyContent: "center", padding: "2px 12px", flex: 1, minWidth: "160px"
                  }}>
                    {/* Bowler name + figures */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#dc2626", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ color: "#1e293b", fontWeight: 950, fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scoringState.bowler || "Bowler"}</span>
                      </div>
                      <span style={{ color: "#1e293b", fontWeight: 950, fontSize: "13px", flexShrink: 0, marginLeft: "8px" }}>
                        {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}<span style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}> {fmtOv(bowler?.ballsBowled ?? 0, bpo)}</span>
                      </span>
                    </div>
                    {/* This over balls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                      {thisOver.length > 0 ? thisOver.slice(-6).map((ball, i) => {
                        const bv = ball.toUpperCase();
                        const isW = bv === "W" || bv === "WICKET" || bv === "OUT";
                        const is4 = bv === "4" || bv === "FOUR";
                        const is6 = bv === "6" || bv === "SIX";
                        const isNb = bv === "NB" || bv === "NO BALL";
                        const isWide = bv === "WD" || bv === "WIDE";
                        const isDot = bv === "0" || bv === "DOT";
                        const bg = isW ? "#dc2626" : is4 ? "#0284c7" : is6 ? "#16a34a" : isNb ? "#7c3aed" : isWide ? "#0891b2" : isDot ? "#374151" : "#475569";
                        const label = isW ? "W" : is4 ? "4" : is6 ? "6" : isNb ? "NB" : isWide ? "Wd" : isDot ? "•" : ball;
                        return (
                          <span key={i} style={{
                            width: "16px", height: "16px", borderRadius: "50%",
                            background: bg, display: "inline-flex", alignItems: "center", justifyContent: "center",
                            color: "#ffffff", fontSize: "8px", fontWeight: 900, flexShrink: 0
                          }}>{label}</span>
                        );
                      }) : <span style={{ color: "#94a3b8", fontSize: "9px", fontStyle: "italic" }}>This over</span>}
                    </div>
                  </div>

                  {/* 6. RIGHT DARK TEAM PILL */}
                  <div style={{
                    background: "linear-gradient(225deg, #18212f 0%, #1e2a42 100%)",
                    display: "flex", flexDirection: "column", alignItems: "flex-end",
                    justifyContent: "center", padding: "0 12px 0 24px",
                    flexShrink: 0, minWidth: "100px", position: "relative", overflow: "hidden"
                  }}>
                    {/* Diagonal cyan spark stripes (mirrored) */}
                    <svg style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "28px", opacity: 0.9 }} viewBox="0 0 28 46" fill="none" preserveAspectRatio="none">
                      <path d="M0 0 L14 0 L28 46 L14 46 Z" fill="#0284c7" opacity="0.7" />
                      <path d="M0 0 L8 0 L22 46 L8 46 Z" fill="#38bdf8" opacity="0.35" />
                    </svg>
                    <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1, zIndex: 1, textAlign: "right" }}>{currentBowlTeam.length > 10 ? bowlShort : currentBowlTeam.toUpperCase()}</span>
                  </div>

                </div>{/* end main row */}

                {/* ── BOTTOM NAVY STRIP ── */}
                <div style={{
                  background: "linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                  height: "18px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", position: "relative",
                  overflow: "hidden", borderTop: "1.5px solid #0284c7",
                  borderRadius: "0 0 5px 5px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                  padding: "0 44px"
                }}>
                  <style>{`
                    @keyframes ssT20MarqueeLTR {
                      0%   { transform: translateX(-50%); }
                      100% { transform: translateX(0%); }
                    }
                  `}</style>

                  {/* LTR Marquee for animation events */}
                  {ssWord && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
                      <div style={{ width: "200%", flexShrink: 0, display: "flex", alignItems: "center", animation: "ssT20MarqueeLTR 5.5s linear infinite" }}>
                        <span style={{ display: "inline-block", paddingRight: "60px", fontWeight: 950, fontSize: "12.5px", letterSpacing: "4px", color: ssAnimColor, textTransform: "uppercase", textShadow: `0 0 14px ${ssAnimColor}cc`, opacity: 0.96 }}>{ssRepeated}</span>
                        <span style={{ display: "inline-block", paddingRight: "60px", fontWeight: 950, fontSize: "12.5px", letterSpacing: "4px", color: ssAnimColor, textTransform: "uppercase", textShadow: `0 0 14px ${ssAnimColor}cc`, opacity: 0.96 }}>{ssRepeated}</span>
                      </div>
                    </div>
                  )}

                  {/* Left cyan chevron watermark */}
                  <div style={{ position: "absolute", left: 2, bottom: 0, opacity: 0.9, zIndex: 3 }}>
                    <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
                      <path d="M0 18 C2 10 5 4 9 1 C7 7 11 11 14 18 C16 10 21 5 26 0 C22 7 24 13 26 18 C28 11 31 7 36 3 C32 9 34 14 36 18 Z" fill="#0284c7" />
                    </svg>
                  </div>

                  {/* Left: Fours/Sixes */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#ffffff", fontSize: "10.5px", fontWeight: 900, letterSpacing: "0.4px", position: "relative", zIndex: 5, flexShrink: 0 }}>
                    <span style={{ color: "#facc15" }}>●</span>
                    <span style={{ color: "#bae6fd" }}>BOWLING:</span>
                    <strong style={{ color: "#ffffff" }}>{scoringState.bowler || "Bowler"}</strong>
                    <span style={{ color: "#facc15", fontWeight: 950, marginLeft: 2 }}>{bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}</span>
                    <span style={{ color: "#bae6fd", fontSize: "9.5px" }}>({fmtOv(bowler?.ballsBowled ?? 0, bpo)} ov)</span>
                  </div>

                  <span style={{ opacity: 0.4, color: "#ffffff", position: "relative", zIndex: 5, flexShrink: 0 }}>|</span>

                  {/* Right: Target info or fours/sixes */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#ffffff", fontSize: "10.5px", fontWeight: 900, letterSpacing: "0.4px", position: "relative", zIndex: 5, flexShrink: 0 }}>
                    {target !== null ? (
                      <>
                        <span style={{ color: "#bae6fd" }}>NEED:</span>
                        <strong style={{ color: "#f87171" }}>{need} runs</strong>
                        <span style={{ opacity: 0.4 }}>from</span>
                        <strong style={{ color: "#facc15" }}>{bLeft} balls</strong>
                      </>
                    ) : (
                      <>
                        <span>Fours <strong style={{ color: "#facc15" }}>{(scoringState.batsmen || []).reduce((a, b) => a + (b.fours || 0), 0)}</strong></span>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>Sixes <strong style={{ color: "#34d399" }}>{(scoringState.batsmen || []).reduce((a, b) => a + (b.sixes || 0), 0)}</strong></span>
                      </>
                    )}
                  </div>

                  {/* Right cyan chevron watermark */}
                  <div style={{ position: "absolute", right: 2, bottom: 0, opacity: 0.9, transform: "scaleX(-1)", zIndex: 3 }}>
                    <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
                      <path d="M0 18 C2 10 5 4 9 1 C7 7 11 11 14 18 C16 10 21 5 26 0 C22 7 24 13 26 18 C28 11 31 7 36 3 C32 9 34 14 36 18 Z" fill="#0284c7" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="scale-in" style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
            border: "2px solid #0284c7", borderRadius: 14, padding: "32px 52px",
            textAlign: "center", boxShadow: "0 16px 36px rgba(0,0,0,0.7)"
          }}>
            <div style={{ color: "#facc15", fontWeight: 950, fontSize: "22px", letterSpacing: "1.5px" }}>
              🏏 {match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}
            </div>
            <div style={{ color: "#0284c7", fontSize: "11px", fontWeight: 900, marginTop: "8px", letterSpacing: "2px" }}>
              STAR SPORTS T20 • MATCH NOT STARTED
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── IPL 2025 / 15th Theme: 100% Exact Replica of Broadcast Scoreboard Image (Compact Height) ──
  if (themeSlug === "ipl-2025") {
    const need = scoringState.target !== null ? Math.max(0, scoringState.target - scoringState.score) : null;
    const bLeft = scoringState.target !== null ? Math.max(0, match.overs * match.ballsPerOver - scoringState.balls) : null;

    const getShortNameLocal = (name: string) => {
      if (!name) return "TEAM";
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
      return name.slice(0, 3).toUpperCase();
    };

    const batTeamShort = getShortNameLocal(currentBatTeam);
    const bowlTeamShort = getShortNameLocal(currentBowlTeam);

    const tossWinner = (match as any).tossWonBy === "team1" ? match.team1Name : match.team2Name;
    const tossWinnerShort = getShortNameLocal(tossWinner);
    const tossDecision = (match as any).optedTo === "Bat" ? "BAT" : "BOWL";

    const thisOver = scoringState.thisOver || [];
    const bpo = match.ballsPerOver || 6;

    const isWicketNotification = activeNotification && (
      activeNotification.toUpperCase().includes("WICKET") ||
      activeNotification.toUpperCase().includes("OUT") ||
      activeNotification.toUpperCase().includes("BOWLED") ||
      activeNotification.toUpperCase().includes("LBW") ||
      activeNotification.toUpperCase().includes("CAUGHT")
    );

    return (
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isPreview ? "center" : "flex-end",
        padding: isPreview ? "80px 0 20px" : "0 0 16px",
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
        overflow: "hidden"
      }}>
        <style>{`
          ${GLOBAL_CSS}
          @keyframes iplZoomInOut {
            0% { transform: scale(0.88); opacity: 0.88; }
            50% { transform: scale(1.14); opacity: 1; }
            100% { transform: scale(0.92); opacity: 0.92; }
          }
          @keyframes iplBowlerMarqueeLTR {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
        `}</style>
        <GroundBG bgUrl={theme.bgUrl} />

        {isPreview && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.94)",
            backdropFilter: "blur(8px)",
            color: "#a3e635",
            padding: "9px 20px",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 2.5,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#a3e635", display: "inline-block", boxShadow: "0 0 8px #a3e635" }} />
              PREVIEW MODE
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
            <span>IPL 2025 Broadcast Theme</span>
          </div>
        )}
        {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

        {scoringState.inningsStarted ? (
          <div className="slide-up" style={{
            width: "96vw",
            maxWidth: "1240px",
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.95))"
          }}>
            {renderScoreboardMarqueeRibbon("ipl-2025", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
              <div style={{
                display: "flex",
                alignItems: "center",
                height: "48px",
                background: "linear-gradient(90deg, #01061c 0%, #030d30 20%, #041038 50%, #030d30 80%, #01061c 100%)",
                borderRadius: "11px",
                padding: "0",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 6px 24px rgba(0,0,0,0.8)",
                position: "relative"
              }}>

                {/* ── FAR LEFT: Batting Team Gold Floral Tab ── */}
                <div style={{
                  width: "52px",
                  height: "100%",
                  background: "linear-gradient(135deg, #eab308 0%, #ca8a04 45%, #1e1b4b 95%)",
                  borderRadius: "11px 0 0 11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  {/* Flower watermark outline */}
                  <svg style={{ position: "absolute", width: "32px", height: "32px", opacity: 0.35, color: "#ffffff" }} viewBox="0 0 100 100">
                    <path d="M50 5 C55 25 75 45 95 50 C75 55 55 75 50 95 C45 75 25 55 5 50 C25 45 45 25 50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                    <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="50" cy="50" r="6" fill="currentColor" />
                  </svg>
                  <span style={{
                    color: "#ffffff",
                    fontWeight: 950,
                    fontSize: "12.5px",
                    letterSpacing: "0.5px",
                    position: "relative",
                    zIndex: 2,
                    textShadow: "0 1px 3px rgba(0,0,0,0.6)"
                  }}>
                    {batTeamShort}
                  </span>
                </div>

                {/* ── LEFT-CENTER: Two-Tier Score + Batsmen Unit ── */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "2px 6px 2px 5px",
                  gap: "2px",
                  flexShrink: 0
                }}>

                  {/* ── TOP TIER: Vivid Neon Lime Green Pill OR Animated Event Banner (SIX/FOUR/WICKET etc.) ── */}
                  {activeNotification ? (
                    <div style={{
                      background: isWicketNotification
                        ? "linear-gradient(180deg, #2d060a 0%, #4a0d14 55%, #2d060a 100%)"
                        : "linear-gradient(180deg, #05200a 0%, #0d3812 55%, #05200a 100%)",
                      borderRadius: "7px",
                      height: "21px",
                      padding: "0 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "290px",
                      boxShadow: isWicketNotification
                        ? "0 0 12px rgba(239, 68, 68, 0.45), inset 0 0 8px rgba(239, 68, 68, 0.25)"
                        : "0 0 12px rgba(163, 230, 53, 0.45), inset 0 0 8px rgba(163, 230, 53, 0.25)",
                      border: isWicketNotification ? "1.2px solid #f87171" : "1.2px solid #a3e635",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      {/* Watermark repeated text in background */}
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        color: isWicketNotification ? "rgba(248, 113, 113, 0.18)" : "rgba(163, 230, 53, 0.18)",
                        fontSize: "14px",
                        fontWeight: 950,
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                        userSelect: "none"
                      }}>
                        <span>{activeNotification}</span>
                        <span>{activeNotification}</span>
                        <span>{activeNotification}</span>
                      </div>

                      {/* Center animated glowing event text */}
                      <span style={{
                        color: isWicketNotification ? "#fca5a5" : "#bef264",
                        fontSize: "13px",
                        fontWeight: 950,
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        position: "relative",
                        zIndex: 2,
                        textShadow: isWicketNotification
                          ? "0 0 8px rgba(239, 68, 68, 0.8), 0 0 16px rgba(239, 68, 68, 0.5)"
                          : "0 0 8px rgba(163, 230, 53, 0.8), 0 0 16px rgba(163, 230, 53, 0.5)",
                        animation: "iplZoomInOut 1s ease-in-out infinite alternate"
                      }}>
                        {activeNotification}
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      background: "linear-gradient(180deg, #b4f210 0%, #99e300 55%, #82c800 100%)",
                      borderRadius: "7px",
                      height: "21px",
                      padding: "0 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minWidth: "290px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
                      border: "1px solid #c4ff20"
                    }}>
                      {/* Team Matchup (BCH v RCC) */}
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <span style={{ color: "#001e30", fontWeight: 950, fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                          {bowlTeamShort}
                        </span>
                        <span style={{ color: "#001e30", fontWeight: 800, fontSize: "8px", opacity: 0.85 }}>
                          v
                        </span>
                        <span style={{ color: "#001e30", fontWeight: 950, fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                          {batTeamShort}
                        </span>
                      </div>

                      {/* Main Score (0-0) */}
                      <div style={{
                        color: "#001a2e",
                        fontWeight: 950,
                        fontSize: "17px",
                        letterSpacing: "-0.5px",
                        lineHeight: 1,
                        padding: "0 8px"
                      }}>
                        {scoringState.score}-{scoringState.wickets}
                      </div>

                      {/* Overs (0.0(20)) */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                        <span style={{ color: "#001a2e", fontWeight: 950, fontSize: "12px", letterSpacing: "-0.2px" }}>
                          {fmtOv(scoringState.balls, bpo)}
                        </span>
                        <span style={{ color: "#001a2e", fontWeight: 900, fontSize: "9.5px", opacity: 0.9 }}>
                          ({match.overs})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── BOTTOM TIER: Two Golden Batsmen Capsules Side-by-Side ── */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>

                    {/* Striker Capsule */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "linear-gradient(180deg, rgba(25,28,5,0.9) 0%, rgba(65,62,10,0.75) 50%, rgba(20,22,5,0.9) 100%)",
                      border: "1.2px solid #a3e635",
                      borderRadius: "7px",
                      padding: "1px 7px 1px 5px",
                      height: "17px",
                      flex: 1,
                      minWidth: "142px",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0, overflow: "hidden" }}>
                        <span style={{ color: "#facc15", fontSize: "9px", lineHeight: 1, flexShrink: 0 }}>🏏</span>
                        <span style={{
                          color: "#ffffff",
                          fontWeight: 950,
                          fontSize: "9.5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {(scoringState.striker || "STRIKER").split(" ").pop()}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, marginLeft: "4px" }}>
                        <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "10.5px", lineHeight: 1 }}>
                          {striker?.runs ?? 0}
                        </span>
                        <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "9.5px", opacity: 0.95, lineHeight: 1 }}>
                          {striker?.balls ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Non-Striker Capsule */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "linear-gradient(180deg, rgba(25,28,5,0.9) 0%, rgba(65,62,10,0.75) 50%, rgba(20,22,5,0.9) 100%)",
                      border: "1.2px solid #a3e635",
                      borderRadius: "7px",
                      padding: "1px 7px 1px 6px",
                      height: "17px",
                      flex: 1,
                      minWidth: "142px",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)"
                    }}>
                      <span style={{
                        color: "#ffffff",
                        fontWeight: 950,
                        fontSize: "9.5px",
                        textTransform: "uppercase",
                        letterSpacing: "0.2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {(scoringState.nonStriker || "NON-STRIKER").split(" ").pop()}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, marginLeft: "4px" }}>
                        <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "10.5px", lineHeight: 1 }}>
                          {nonStriker?.runs ?? 0}
                        </span>
                        <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "9.5px", opacity: 0.95, lineHeight: 1 }}>
                          {nonStriker?.balls ?? 0}
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* ── CENTER: TOSS Block ── */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 10px",
                  minWidth: "80px",
                  flexShrink: 0,
                  borderRight: "1px solid rgba(56, 189, 248, 0.25)",
                  height: "36px"
                }}>
                  <span style={{
                    color: "#facc15",
                    fontWeight: 950,
                    fontSize: "7.5px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    lineHeight: 1
                  }}>
                    TOSS
                  </span>
                  <span style={{
                    color: "#a3e635",
                    fontWeight: 950,
                    fontSize: "9.5px",
                    marginTop: "2px",
                    textAlign: "center",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                    letterSpacing: "0.2px"
                  }}>
                    {tossWinnerShort} ({tossDecision})
                  </span>
                </div>

                {/* ── RIGHT: Bowler Pill (Top) + THIS OVER Boxes (Bottom) ── */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  flex: 1,
                  padding: "2px 8px 2px 10px",
                  gap: "2px",
                  minWidth: 0
                }}>

                  {/* Top Bowler Capsule (with embedded LTR marquee for active events) */}
                  {(() => {
                    const anim = scoringState.animation?.toUpperCase?.() || "";
                    const dec = (scoringState.decision || "").toUpperCase();
                    let animWord: string | null = null;
                    let mqColor = "#bef264";
                    let mqStroke = "#4d7c0f";
                    let mqGlow = "rgba(163,230,53,0.8)";
                    let pillBg: string | null = null;
                    let pillBorder: string | null = null;
                    let pillShadow: string | null = null;

                    if (anim === "FOUR" || anim === "4" || anim === "4S") {
                      animWord = "FOUR"; mqColor = "#fde047"; mqStroke = "#a16207"; mqGlow = "rgba(250,204,21,0.85)";
                      pillBg = "linear-gradient(180deg, rgba(60,48,8,0.94) 0%, rgba(120,94,18,0.9) 50%, rgba(60,48,8,0.94) 100%)";
                      pillBorder = "1.2px solid #facc15";
                      pillShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px rgba(250,204,21,0.28)";
                    } else if (anim === "SIX" || anim === "6" || anim === "6S") {
                      animWord = "SIX"; mqColor = "#bef264"; mqStroke = "#4d7c0f"; mqGlow = "rgba(163,230,53,0.9)";
                      pillBg = "linear-gradient(180deg, rgba(20,52,18,0.94) 0%, rgba(52,120,34,0.9) 50%, rgba(20,52,18,0.94) 100%)";
                      pillBorder = "1.2px solid #bef264";
                      pillShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 14px rgba(163,230,53,0.38)";
                    } else if (anim === "WICKET" || dec === "OUT" || anim === "OUT") {
                      animWord = (dec === "OUT") ? "OUT" : (animWord = anim || "WICKET");
                      mqColor = "#fecaca"; mqStroke = "#991b1b"; mqGlow = "rgba(239,68,68,0.85)";
                      pillBg = "linear-gradient(180deg, rgba(60,10,15,0.94) 0%, rgba(120,22,28,0.9) 50%, rgba(60,10,15,0.94) 100%)";
                      pillBorder = "1.2px solid #f87171";
                      pillShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 14px rgba(239,68,68,0.38)";
                    } else if (dec === "NOT OUT") {
                      animWord = "NOT OUT"; mqColor = "#a7f3d0"; mqStroke = "#065f46"; mqGlow = "rgba(16,185,129,0.8)";
                      pillBg = "linear-gradient(180deg, rgba(6,40,28,0.94) 0%, rgba(8,94,70,0.9) 50%, rgba(6,40,28,0.94) 100%)";
                      pillBorder = "1.2px solid #6ee7b7";
                      pillShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px rgba(16,185,129,0.32)";
                    } else if (anim === "FREE HIT") {
                      animWord = "FREE HIT"; mqColor = "#6ee7b7"; mqStroke = "#047857"; mqGlow = "rgba(16,185,129,0.85)";
                      pillBg = "linear-gradient(180deg, rgba(6,40,28,0.94) 0%, rgba(8,94,70,0.9) 50%, rgba(6,40,28,0.94) 100%)";
                      pillBorder = "1.2px solid #34d399";
                      pillShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px rgba(16,185,129,0.32)";
                    } else if (anim === "HAT-TRICK BALL" || anim === "HAT-TRICK") {
                      animWord = "HAT-TRICK"; mqColor = "#e9d5ff"; mqStroke = "#6b21a8"; mqGlow = "rgba(168,85,247,0.85)";
                      pillBg = "linear-gradient(180deg, rgba(38,14,58,0.94) 0%, rgba(88,28,135,0.9) 50%, rgba(38,14,58,0.94) 100%)";
                      pillBorder = "1.2px solid #c084fc";
                      pillShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 14px rgba(168,85,247,0.36)";
                    } else if (dec === "PENDING" || anim === "REVIEW" || anim === "DRS") {
                      animWord = dec === "PENDING" ? "DRS REVIEW" : (anim || "REVIEW");
                      mqColor = "#fde68a"; mqStroke = "#92400e"; mqGlow = "rgba(245,158,11,0.85)";
                      pillBg = "linear-gradient(180deg, rgba(56,34,8,0.94) 0%, rgba(120,72,16,0.9) 50%, rgba(56,34,8,0.94) 100%)";
                      pillBorder = "1.2px solid #fbbf24";
                      pillShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px rgba(245,158,11,0.32)";
                    } else if (anim && anim !== "NORMAL" && anim !== "TOUR BOUNDARIES") {
                      animWord = anim.replace(/!/g, "").trim();
                    }

                    return (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: pillBg || "linear-gradient(180deg, rgba(8,24,14,0.92) 0%, rgba(20,52,28,0.85) 50%, rgba(8,24,14,0.92) 100%)",
                        border: pillBorder || "1.2px solid #a3e635",
                        borderRadius: "7px",
                        height: "20px",
                        padding: "0 8px 0 6px",
                        boxShadow: pillShadow || "inset 0 1px 0 rgba(255,255,255,0.15)",
                        position: "relative",
                        overflow: "hidden"
                      }}>
                        {animWord && (
                          <>
                            <div aria-hidden style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              width: "200%",
                              zIndex: 1,
                              animation: "iplBowlerMarqueeLTR 5.2s linear infinite"
                            }}>
                              {[0, 1].map(seg => (
                                <div key={seg} style={{
                                  width: "50%",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "22px",
                                  paddingLeft: "18px",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap"
                                }}>
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <span key={i} style={{
                                      color: mqColor,
                                      fontWeight: 950,
                                      fontSize: "12px",
                                      letterSpacing: "3px",
                                      textTransform: "uppercase",
                                      WebkitTextStroke: `0.5px ${mqStroke}`,
                                      textShadow: `0 0 6px ${mqGlow}, 0 0 12px ${mqGlow}`,
                                      opacity: 0.92,
                                      flexShrink: 0
                                    }}>
                                      {animWord}
                                    </span>
                                  ))}
                                </div>
                              ))}
                            </div>
                            <div aria-hidden style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(90deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.0) 8%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.0) 92%, rgba(0,0,0,0.0) 100%)",
                              zIndex: 2,
                              pointerEvents: "none"
                            }} />
                          </>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0, overflow: "hidden", position: "relative", zIndex: 5 }}>
                          <span style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: "#ffffff",
                            display: "inline-block",
                            flexShrink: 0
                          }} />
                          <span style={{
                            color: "#ffffff",
                            fontWeight: 950,
                            fontSize: "9.5px",
                            textTransform: "uppercase",
                            letterSpacing: "0.2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {(scoringState.bowler || "BOWLER").toUpperCase()}
                          </span>
                        </div>

                        <div style={{
                          color: "#ffffff",
                          fontWeight: 950,
                          fontSize: "10.5px",
                          letterSpacing: "0.3px",
                          flexShrink: 0,
                          marginLeft: "6px",
                          position: "relative",
                          zIndex: 5
                        }}>
                          {bowler?.wickets ?? 0}-{bowler?.runsConceded ?? 0}&nbsp;&nbsp;{fmtOv(bowler?.ballsBowled ?? 0, bpo)}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bottom THIS OVER + 6 Outline Boxes */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{
                      color: "#ffffff",
                      fontWeight: 950,
                      fontSize: "8px",
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                      flexShrink: 0
                    }}>
                      THIS OVER
                    </span>

                    <div style={{ display: "flex", gap: "2.5px", alignItems: "center" }}>
                      {(() => {
                        const extrasCount = thisOver.filter(isExtraBall).length;
                        const totalCount = bpo + extrasCount;
                        return Array.from({ length: totalCount }).map((_, i) => {
                          const val = thisOver[i];
                          let bg = "transparent";
                          let color = "#ffffff";
                          let border = "1.2px solid #38bdf8";

                          if (val) {
                            if (val === "4" || val === "4s") {
                              bg = "#3b82f6"; color = "#ffffff"; border = "1.2px solid #60a5fa";
                            } else if (val === "6" || val === "6s") {
                              bg = "#a3e635"; color = "#000000"; border = "1.2px solid #bef264";
                            } else if (val === "W" || val?.startsWith("W+") || val === "Wk") {
                              bg = "#ef4444"; color = "#ffffff"; border = "1.2px solid #f87171";
                            } else if (isExtraBall(val)) {
                              bg = "#a855f7"; color = "#ffffff"; border = "1.2px solid #c084fc";
                            } else {
                              bg = "rgba(56, 189, 248, 0.25)"; color = "#ffffff"; border = "1.2px solid #38bdf8";
                            }
                          }

                          return (
                            <div
                              key={i}
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "2.5px",
                                background: bg,
                                color,
                                border,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: val && val.includes("+") ? undefined : (val && val.length > 2 ? "5px" : "7px"),
                                fontWeight: 950,
                                lineHeight: 1,
                                flexShrink: 0,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {val && (val.includes("+") ? renderOutcomeText(val, 12) : val)}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>

                {/* ── FAR RIGHT: Bowling Team Lime-Green Floral Tab ── */}
                <div style={{
                  width: "52px",
                  height: "100%",
                  background: "linear-gradient(135deg, #1e1b4b 0%, #4d7c0f 40%, #84cc16 100%)",
                  borderRadius: "0 11px 11px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  {/* Flower watermark outline */}
                  <svg style={{ position: "absolute", width: "32px", height: "32px", opacity: 0.35, color: "#ffffff" }} viewBox="0 0 100 100">
                    <path d="M50 5 C55 25 75 45 95 50 C75 55 55 75 50 95 C45 75 25 55 5 50 C25 45 45 25 50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                    <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="50" cy="50" r="6" fill="currentColor" />
                  </svg>
                  <span style={{
                    color: "#ffffff",
                    fontWeight: 950,
                    fontSize: "12.5px",
                    letterSpacing: "0.5px",
                    position: "relative",
                    zIndex: 2,
                    textShadow: "0 1px 3px rgba(0,0,0,0.6)"
                  }}>
                    {bowlTeamShort}
                  </span>
                </div>

              </div>
            )}
          </div>
        ) : (
          <div className="scale-in" style={{ position: "relative", zIndex: 1, background: "#030d30", border: "2px solid #a3e635", borderRadius: 14, padding: "32px 48px", textAlign: "center", color: "#fff" }}>
            <div style={{ color: "#a3e635", fontWeight: 950, fontSize: "20px" }}>{match.team1Name.toUpperCase()} VS {match.team2Name.toUpperCase()}</div>
            <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>MATCH NOT STARTED</div>
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
      {renderCustomOverlay()}{renderMom()}{renderBatterStatsPanel()}{renderBatterMatchPanel()}

      {scoringState.inningsStarted ? (
        <div className="slide-up" style={{ width: "90vw", position: "relative", zIndex: 1 }}>
          {renderScoreboardMarqueeRibbon("default", scoringState, match, currentBatTeam, currentBowlTeam, bowler) || (
            <>
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
            </>
          )}
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
