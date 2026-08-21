"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import StorageIndicator from "../../components/StorageIndicator";
import ScoreboardLinksModal from "../../components/ScoreboardLinksModal";
import { toast } from "react-toastify";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  playersTeam1: string[];
  playersTeam2: string[];
  scoringState: ScoringState | null;
}

interface BatsmanStats {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
}

interface BowlerStats {
  name: string;
  runsConceded: number;
  ballsBowled: number;
  wickets: number;
}

interface FallOfWicket {
  score: number;
  wickets: number;
  over: number;
  batsman: string;
}

interface ScoringState {
  battingTeam: "team1" | "team2";
  bowlingTeam: "team1" | "team2";
  inningsStarted: boolean;
  inningsNo: 1 | 2;
  striker: string;
  nonStriker: string;
  bowler: string;
  score: number;
  wickets: number;
  balls: number;
  overs: number;
  target: number | null;
  thisOver: string[];
  batsmen: BatsmanStats[];
  bowlers: BowlerStats[];
  fallOfWickets: FallOfWicket[];
  animation: string | null;
  displayScreen: string;
  customInputText: string;
  momPlayer: string;
  tournamentStatsPlayer: string;
  decision: "PENDING" | "OUT" | "NOT OUT" | null;
  displayStatsMode: string | null;
  teamColors?: { team1: string; team2: string };
  history: Omit<ScoringState, "history">[];
  firstInnings?: {
    score: number;
    wickets: number;
    balls: number;
    overs: number;
    batsmen: BatsmanStats[];
    bowlers: BowlerStats[];
    fallOfWickets: FallOfWicket[];
  };
}

export default function MatchScoringPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [scoringState, setScoringState] = useState<ScoringState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScoreboardLinks, setShowScoreboardLinks] = useState(false);
  const [selectedPdfTheme, setSelectedPdfTheme] = useState("asia-cup");

  // Form states for adding players
  const [playerInput1, setPlayerInput1] = useState("");
  const [playerInput2, setPlayerInput2] = useState("");
  const [showPlayers1, setShowPlayers1] = useState(false);
  const [showPlayers2, setShowPlayers2] = useState(false);

  // Inline player editing
  const [editingPlayer, setEditingPlayer] = useState<{ team: "team1" | "team2"; idx: number } | null>(null);
  const [editPlayerValue, setEditPlayerValue] = useState("");

  // Start Innings Modal
  const [showStartInningsModal, setShowStartInningsModal] = useState(false);
  const [strikerInput, setStrikerInput] = useState("");
  const [nonStrikerInput, setNonStrikerInput] = useState("");
  const [bowlerInput, setBowlerInput] = useState("");

  // New Bowler Modal
  const [showNewBowlerModal, setShowNewBowlerModal] = useState(false);
  const [newBowlerInput, setNewBowlerInput] = useState("");

  // Retire Batter Modal
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retireTarget, setRetireTarget] = useState<"1" | "2">("1"); // "1" = Striker, "2" = Non-Striker
  const [retireNewBatsmanInput, setRetireNewBatsmanInput] = useState("");

  // Custom Runs Modal
  const [showCustomRunsModal, setShowCustomRunsModal] = useState(false);
  const [customRunsInput, setCustomRunsInput] = useState("");


  // Dismissal Modal
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState<"Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped">("Bowled");
  const [dismissedBatsman, setDismissedBatsman] = useState("");
  const [newBatsmanInput, setNewBatsmanInput] = useState("");
  const [wicketRuns, setWicketRuns] = useState(0);

  // Change Toss Modal
  const [showChangeTossModal, setShowChangeTossModal] = useState(false);
  const [tossWonByInput, setTossWonByInput] = useState<"team1" | "team2">("team1");
  const [optedToInput, setOptedToInput] = useState<"Bat" | "Bowl">("Bat");

  // Custom Input & MOM states
  const [customText, setCustomText] = useState("");
  const [selectedMom, setSelectedMom] = useState("");
  const [selectedStatsPlayer, setSelectedStatsPlayer] = useState("");

  // Scoring checkbox states for the new Controller
  const [isWide, setIsWide] = useState(false);
  const [isNoBall, setIsNoBall] = useState(false);
  const [isByes, setIsByes] = useState(false);
  const [isLegByes, setIsLegByes] = useState(false);
  const [isWicketCheck, setIsWicketCheck] = useState(false);

  const [activeScoringButton, setActiveScoringButton] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    const toastId = toast.info(
      <div className="flex flex-col gap-2 p-1 text-left">
        <p className="font-semibold text-xs text-white leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss(toastId);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3 py-1.5 rounded active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold text-[10px] px-3 py-1.5 rounded active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const isOwner = session?.user && match && (session.user as any).id === match.userId;

  // Fetch match details
  const fetchMatch = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load match.");
      setMatch(data.match);
      if (data.match.scoringState) {
        setScoringState(data.match.scoringState);
        const ownerCheck = session?.user && data.match && (session.user as any).id === data.match.userId;
        if (ownerCheck && data.match.scoringState.inningsStarted && !data.match.scoringState.bowler) {
          setShowNewBowlerModal(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMatch(true);
    }
  }, [matchId]);

  // Auto-send match to scoreboard on controller load
  useEffect(() => {
    if (isOwner && matchId) {
      fetch("/api/matches/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      }).catch(err => console.error("Auto-linking match failed:", err));
    }
  }, [isOwner, matchId]);

  // Spectator Polling
  useEffect(() => {
    if (!matchId) return;
    // Don't poll if the logged-in user is the owner (they make the edits)
    if (isOwner) return;

    const interval = setInterval(() => {
      fetchMatch();
    }, 4000);

    return () => clearInterval(interval);
  }, [matchId, isOwner]);

  // Automatically clear standard overlay animations after a timeout
  useEffect(() => {
    if (scoringState?.animation && scoringState.animation !== "INNINGS BREAK") {
      const duration = scoringState.animation === "TOUR BOUNDARIES" ? 5500 : 4000;
      const timer = setTimeout(() => {
        setScoringState((prev) => {
          if (!prev) return null;
          const updated = { ...prev, animation: null };
          saveScoringState(updated);
          return updated;
        });
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [scoringState?.animation]);

  // Put scoring state / player rosters back to database
  const saveScoringState = async (
    state: ScoringState | null,
    newStatus?: "Not Started" | "Live" | "Completed",
    t1Players?: string[],
    t2Players?: string[],
    tossWonBy?: "team1" | "team2",
    optedTo?: "Bat" | "Bowl"
  ) => {
    try {
      const body: any = {};
      if (state !== undefined) body.scoringState = state;
      if (newStatus !== undefined) body.status = newStatus;
      if (t1Players !== undefined) body.playersTeam1 = t1Players;
      if (t2Players !== undefined) body.playersTeam2 = t2Players;
      if (tossWonBy !== undefined) body.tossWonBy = tossWonBy;
      if (optedTo !== undefined) body.optedTo = optedTo;

      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update match.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to sync to database.", "error");
    }
  };

  // Add players
  const handleAddPlayer = (team: "team1" | "team2") => {
    if (!match) return;
    const input = team === "team1" ? playerInput1 : playerInput2;
    if (!input.trim()) return;

    // Support comma-separated bulk list
    const names = input
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    const currentRoster = team === "team1" ? match.playersTeam1 || [] : match.playersTeam2 || [];
    const updatedRoster = [...currentRoster, ...names];

    setMatch((prev) => {
      if (!prev) return null;
      return team === "team1"
        ? { ...prev, playersTeam1: updatedRoster }
        : { ...prev, playersTeam2: updatedRoster };
    });

    if (team === "team1") {
      setPlayerInput1("");
      saveScoringState(scoringState, undefined, updatedRoster, undefined);
    } else {
      setPlayerInput2("");
      saveScoringState(scoringState, undefined, undefined, updatedRoster);
    }

    showToast(`Added ${names.length} player(s) successfully!`);
  };

  // Remove player
  const handleRemovePlayer = (team: "team1" | "team2", index: number) => {
    if (!match) return;
    const currentRoster = team === "team1" ? match.playersTeam1 || [] : match.playersTeam2 || [];
    const updatedRoster = currentRoster.filter((_, i) => i !== index);

    setMatch((prev) => {
      if (!prev) return null;
      return team === "team1"
        ? { ...prev, playersTeam1: updatedRoster }
        : { ...prev, playersTeam2: updatedRoster };
    });

    if (team === "team1") {
      saveScoringState(scoringState, undefined, updatedRoster, undefined);
    } else {
      saveScoringState(scoringState, undefined, undefined, updatedRoster);
    }
    showToast("Player removed.");
  };

  // Rename player (save inline edit)
  const handleEditPlayer = (team: "team1" | "team2", index: number, newName: string) => {
    if (!match || !newName.trim()) return;
    const trimmed = newName.trim();
    const currentRoster = team === "team1" ? match.playersTeam1 || [] : match.playersTeam2 || [];
    const oldName = currentRoster[index];
    const updatedRoster = currentRoster.map((p, i) => (i === index ? trimmed : p));

    // Also update live scoring state references if any
    let updatedScoringState = scoringState;
    if (scoringState && oldName) {
      const s = { ...scoringState };
      if (s.striker === oldName) s.striker = trimmed;
      if (s.nonStriker === oldName) s.nonStriker = trimmed;
      if (s.bowler === oldName) s.bowler = trimmed;
      s.batsmen = s.batsmen.map((b) => b.name === oldName ? { ...b, name: trimmed } : b);
      s.bowlers = s.bowlers.map((bw) => bw.name === oldName ? { ...bw, name: trimmed } : bw);
      updatedScoringState = s;
      setScoringState(s);
    }

    setMatch((prev) => {
      if (!prev) return null;
      return team === "team1"
        ? { ...prev, playersTeam1: updatedRoster }
        : { ...prev, playersTeam2: updatedRoster };
    });

    if (team === "team1") {
      saveScoringState(updatedScoringState, undefined, updatedRoster, undefined);
    } else {
      saveScoringState(updatedScoringState, undefined, undefined, updatedRoster);
    }

    setEditingPlayer(null);
    setEditPlayerValue("");
    showToast(`Player renamed to "${trimmed}".`);
  };

  // Get Batting & Bowling Team names based on toss
  const getTeamsByToss = (): {
    batting: "team1" | "team2";
    bowling: "team1" | "team2";
    batName: string;
    bowlName: string;
  } => {
    if (!match) return { batting: "team1", bowling: "team2", batName: "", bowlName: "" };
    // Determine who bats first
    // Toss Won By: team1 / team2
    // Opted To: Bat / Bowl
    let battingFirst: "team1" | "team2" = "team1";
    if (match.tossWonBy === "team1") {
      battingFirst = match.optedTo === "Bat" ? "team1" : "team2";
    } else {
      battingFirst = match.optedTo === "Bat" ? "team2" : "team1";
    }

    const bowlingFirst = battingFirst === "team1" ? "team2" : "team1";
    const batName = battingFirst === "team1" ? match.team1Name : match.team2Name;
    const bowlName = battingFirst === "team1" ? match.team2Name : match.team1Name;

    return {
      batting: battingFirst,
      bowling: bowlingFirst,
      batName,
      bowlName,
    };
  };

  // Change Toss Handlers
  const openChangeTossModal = () => {
    if (!match) return;
    setTossWonByInput(match.tossWonBy || "team1");
    setOptedToInput(match.optedTo || "Bat");
    setShowChangeTossModal(true);
  };

  const handleChangeTossSubmit = async () => {
    if (!match) return;
    try {
      const updatedMatch = {
        ...match,
        tossWonBy: tossWonByInput,
        optedTo: optedToInput,
      };
      setMatch(updatedMatch);

      // If match hasn't started yet, adjust batting/bowling team based on new toss
      let updatedScoringState = scoringState;
      if (scoringState && !scoringState.inningsStarted && scoringState.balls === 0 && scoringState.score === 0) {
        let battingFirst: "team1" | "team2" = "team1";
        if (tossWonByInput === "team1") {
          battingFirst = optedToInput === "Bat" ? "team1" : "team2";
        } else {
          battingFirst = optedToInput === "Bat" ? "team2" : "team1";
        }
        const bowlingFirst = battingFirst === "team1" ? "team2" : "team1";
        updatedScoringState = {
          ...scoringState,
          battingTeam: battingFirst,
          bowlingTeam: bowlingFirst,
        };
        setScoringState(updatedScoringState);
      }

      await saveScoringState(updatedScoringState, undefined, undefined, undefined, tossWonByInput, optedToInput);
      setShowChangeTossModal(false);
      const winnerName = tossWonByInput === "team1" ? match.team1Name : match.team2Name;
      showToast(`Toss updated: ${winnerName} won the toss and elected to ${optedToInput}!`);
    } catch (err: any) {
      showToast(err.message || "Failed to update toss", "error");
    }
  };

  // Initialize Innings Modal
  const openStartInnings = () => {
    if (!match) return;
    const { batName, bowlName } = getTeamsByToss();
    setStrikerInput("");
    setNonStrikerInput("");
    setBowlerInput("");
    setShowStartInningsModal(true);
  };

  // Submit Start 1st Innings
  const handleStartInningsSubmit = () => {
    if (!match) return;
    if (!strikerInput.trim() || !nonStrikerInput.trim() || !bowlerInput.trim()) {
      showToast("Please enter Striker, Non-Striker, and Bowler names.", "error");
      return;
    }
    if (strikerInput.trim().toLowerCase() === nonStrikerInput.trim().toLowerCase()) {
      showToast("Striker and Non-Striker cannot be the same person.", "error");
      return;
    }

    const isSecondInnings = scoringState && (scoringState.inningsNo === 2 || !!scoringState.firstInnings);

    let batting: "team1" | "team2";
    let bowling: "team1" | "team2";

    if (isSecondInnings) {
      batting = scoringState.battingTeam;
      bowling = scoringState.bowlingTeam;
    } else {
      const teams = getTeamsByToss();
      batting = teams.batting;
      bowling = teams.bowling;
    }

    const sName = strikerInput.trim();
    const nsName = nonStrikerInput.trim();
    const bName = bowlerInput.trim();

    let updatedT1 = match.playersTeam1 || [];
    let updatedT2 = match.playersTeam2 || [];
    let t1Changed = false;
    let t2Changed = false;

    // Batting team additions
    if (batting === "team1") {
      if (!updatedT1.some(p => p.toLowerCase() === sName.toLowerCase())) {
        updatedT1 = [...updatedT1, sName];
        t1Changed = true;
      }
      if (!updatedT1.some(p => p.toLowerCase() === nsName.toLowerCase())) {
        updatedT1 = [...updatedT1, nsName];
        t1Changed = true;
      }
    } else {
      if (!updatedT2.some(p => p.toLowerCase() === sName.toLowerCase())) {
        updatedT2 = [...updatedT2, sName];
        t2Changed = true;
      }
      if (!updatedT2.some(p => p.toLowerCase() === nsName.toLowerCase())) {
        updatedT2 = [...updatedT2, nsName];
        t2Changed = true;
      }
    }

    // Bowling team additions
    if (bowling === "team1") {
      if (!updatedT1.some(p => p.toLowerCase() === bName.toLowerCase())) {
        updatedT1 = [...updatedT1, bName];
        t1Changed = true;
      }
    } else {
      if (!updatedT2.some(p => p.toLowerCase() === bName.toLowerCase())) {
        updatedT2 = [...updatedT2, bName];
        t2Changed = true;
      }
    }

    const stateWithoutHistory = scoringState ? (() => {
      const { history: _, ...rest } = scoringState;
      return rest;
    })() : null;

    const initialState: ScoringState = {
      battingTeam: batting,
      bowlingTeam: bowling,
      inningsStarted: true,
      inningsNo: isSecondInnings ? 2 : 1,
      striker: sName,
      nonStriker: nsName,
      bowler: bName,
      score: 0,
      wickets: 0,
      balls: 0,
      overs: 0,
      target: isSecondInnings ? (scoringState.target || 0) : null,
      thisOver: [],
      batsmen: [
        { name: sName, runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
        { name: nsName, runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
      ],
      bowlers: [
        { name: bName, runsConceded: 0, ballsBowled: 0, wickets: 0 },
      ],
      fallOfWickets: [],
      animation: null,
      displayScreen: "default",
      customInputText: "",
      momPlayer: "",
      tournamentStatsPlayer: "",
      decision: null,
      displayStatsMode: null,
      history: isSecondInnings && scoringState && stateWithoutHistory ? [...(scoringState.history || []), stateWithoutHistory] : [],
      firstInnings: isSecondInnings ? scoringState.firstInnings : undefined,
    };

    setScoringState(initialState);
    setMatch((prev) => prev ? { ...prev, playersTeam1: updatedT1, playersTeam2: updatedT2, status: "Live" } : null);
    saveScoringState(initialState, "Live", t1Changed ? updatedT1 : undefined, t2Changed ? updatedT2 : undefined);
    setShowStartInningsModal(false);
    showToast("Innings started successfully!");
  };

  // Record outcome of a ball
  const recordBall = (
    type: "runs" | "wide" | "noball" | "widenoball" | "wicket" | "bye" | "legbye" | "wicketnoball" | "wicketwide" | "wicketbye" | "wicketlegbye" | "custom_byes",
    runsVal = 0,
    wicketDismissedName = "",
    wicketNewBatsmanName = ""
  ) => {
    if (!match || !scoringState) return;

    // Create history snapshot for undo
    const { history, ...currentWithoutHistory } = scoringState;
    const newHistory = [...(scoringState.history || []), currentWithoutHistory].slice(-15);

    // Deep copy stats lists
    const updatedBatsmen = scoringState.batsmen.map((b) => ({ ...b }));
    const updatedBowlers = scoringState.bowlers.map((bw) => ({ ...bw }));
    const updatedFow = [...scoringState.fallOfWickets];
    const updatedThisOver = [...scoringState.thisOver];

    let currentScore = scoringState.score;
    let currentWickets = scoringState.wickets;
    let currentBalls = scoringState.balls;
    let currentOvers = scoringState.overs;
    let activeStrikerName = scoringState.striker;
    let activeNonStrikerName = scoringState.nonStriker;
    let activeBowlerName = scoringState.bowler;
    let anim: string | null = null;

    // Helper to find or insert batsman in stats
    const getOrAddBatsman = (name: string) => {
      let bIdx = updatedBatsmen.findIndex((b) => b.name.toLowerCase() === name.toLowerCase());
      if (bIdx === -1) {
        updatedBatsmen.push({ name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
        bIdx = updatedBatsmen.length - 1;
      }
      return bIdx;
    };

    // Helper to find or insert bowler in stats
    const getOrAddBowler = (name: string) => {
      let bwIdx = updatedBowlers.findIndex((bw) => bw.name.toLowerCase() === name.toLowerCase());
      if (bwIdx === -1) {
        updatedBowlers.push({ name, runsConceded: 0, ballsBowled: 0, wickets: 0 });
        bwIdx = updatedBowlers.length - 1;
      }
      return bwIdx;
    };

    const strikerIdx = getOrAddBatsman(activeStrikerName);
    const bowlerIdx = getOrAddBowler(activeBowlerName);

    let updatedT1 = match.playersTeam1 || [];
    let updatedT2 = match.playersTeam2 || [];
    let t1Changed = false;
    let t2Changed = false;

    if (type === "wicket" && wicketNewBatsmanName.trim()) {
      const newBatName = wicketNewBatsmanName.trim();
      const team = scoringState.battingTeam;
      if (team === "team1") {
        if (!updatedT1.some(p => p.toLowerCase() === newBatName.toLowerCase())) {
          updatedT1 = [...updatedT1, newBatName];
          t1Changed = true;
        }
      } else {
        if (!updatedT2.some(p => p.toLowerCase() === newBatName.toLowerCase())) {
          updatedT2 = [...updatedT2, newBatName];
          t2Changed = true;
        }
      }
    }

    if (type === "runs") {
      currentScore += runsVal;
      // Batsman runs and balls
      updatedBatsmen[strikerIdx].runs += runsVal;
      updatedBatsmen[strikerIdx].balls += 1;
      if (runsVal === 4) {
        updatedBatsmen[strikerIdx].fours += 1;
        anim = "FOUR";
      }
      if (runsVal === 6) {
        updatedBatsmen[strikerIdx].sixes += 1;
        anim = "SIX";
      }

      // Bowler conceded
      updatedBowlers[bowlerIdx].runsConceded += runsVal;
      updatedBowlers[bowlerIdx].ballsBowled += 1;

      // Ball counts
      currentBalls += 1;
      updatedThisOver.push(runsVal.toString());

      // Strike swap on odd runs
      if (runsVal % 2 !== 0) {
        activeStrikerName = scoringState.nonStriker;
        activeNonStrikerName = scoringState.striker;
      }
    } else if (type === "wide") {
      currentScore += 1 + runsVal; // Wide counts as +1 extra, plus any runs run
      updatedBowlers[bowlerIdx].runsConceded += 1 + runsVal;
      updatedThisOver.push(runsVal > 0 ? `Wd+${runsVal}` : "Wd");
      if (runsVal % 2 !== 0) {
        activeStrikerName = scoringState.nonStriker;
        activeNonStrikerName = scoringState.striker;
      }
      // Ball does not count towards bowler overs
    } else if (type === "noball") {
      currentScore += 1 + runsVal; // No ball counts as +1, plus runs scored by batsman
      updatedBowlers[bowlerIdx].runsConceded += 1 + runsVal;

      if (runsVal > 0) {
        updatedBatsmen[strikerIdx].runs += runsVal;
        updatedBatsmen[strikerIdx].balls += 1;
        if (runsVal === 4) updatedBatsmen[strikerIdx].fours += 1;
        if (runsVal === 6) updatedBatsmen[strikerIdx].sixes += 1;
      }

      updatedThisOver.push(runsVal > 0 ? `Nb+${runsVal}` : "Nb");
      if (runsVal % 2 !== 0) {
        activeStrikerName = scoringState.nonStriker;
        activeNonStrikerName = scoringState.striker;
      }
      anim = "FREE HIT";
    } else if (type === "widenoball") {
      // Wide + No Ball: 2 extras (1 wide + 1 noball), ball does NOT count
      currentScore += 2 + runsVal;
      updatedBowlers[bowlerIdx].runsConceded += 2 + runsVal;
      updatedThisOver.push(runsVal > 0 ? `WNb+${runsVal}` : "WNb");
      if (runsVal % 2 !== 0) {
        activeStrikerName = scoringState.nonStriker;
        activeNonStrikerName = scoringState.striker;
      }
      anim = "FREE HIT";
    } else if (type === "custom_byes") {
      currentScore += runsVal;
      // Runs go to extras, not to batsman, and batsman does NOT face ball (no increase)
      // Bowler does not concede these, and does NOT get ball count (no increase)
      // currentBalls is NOT increased

      if (runsVal % 2 !== 0) {
        activeStrikerName = scoringState.nonStriker;
        activeNonStrikerName = scoringState.striker;
      }
    } else if (type === "bye" || type === "legbye") {
      currentScore += runsVal;
      // Runs go to extras, not to batsman, but batsman faces ball
      updatedBatsmen[strikerIdx].balls += 1;
      // Bowler does not concede these as earned runs in some formats, but gets the ball count
      updatedBowlers[bowlerIdx].ballsBowled += 1;
      currentBalls += 1;
      updatedThisOver.push(type === "legbye" ? `${runsVal}Lb` : `${runsVal}B`);

      if (runsVal % 2 !== 0) {
        activeStrikerName = scoringState.nonStriker;
        activeNonStrikerName = scoringState.striker;
      }
    } else if (type === "wicket") {
      currentWickets += 1;
      anim = "WICKET";

      // Add any runs scored on the wicket ball
      if (runsVal > 0) {
        currentScore += runsVal;
        updatedBowlers[bowlerIdx].runsConceded += runsVal;
        // Runs on a wicket delivery credit to the dismissed batsman (run-out scenario)
        // or to the striker — we credit the striker (common for run-outs, last-ball runs)
      }

      // Mark the dismissed batsman as out
      const dismissedIdx = getOrAddBatsman(wicketDismissedName);
      updatedBatsmen[dismissedIdx].out = true;
      updatedBatsmen[dismissedIdx].balls += 1; // faced the wicket ball

      // Bowler stats
      updatedBowlers[bowlerIdx].ballsBowled += 1;
      if (wicketType !== "Run Out") {
        updatedBowlers[bowlerIdx].wickets += 1;
      }

      currentBalls += 1;
      // Record wicket+runs in thisOver so scoreboards can display W+1, W+2 etc.
      updatedThisOver.push(runsVal > 0 ? `W+${runsVal}` : "W");

      // Record Fall of Wickets
      const displayOver = Math.floor(currentBalls / match.ballsPerOver) + (currentBalls % match.ballsPerOver) / 10;
      updatedFow.push({
        score: currentScore,
        wickets: currentWickets,
        over: displayOver,
        batsman: wicketDismissedName,
      });

      // Replace dismissed batsman with the new batsman
      if (wicketDismissedName.toLowerCase() === activeStrikerName.toLowerCase()) {
        activeStrikerName = wicketNewBatsmanName;
      } else {
        activeNonStrikerName = wicketNewBatsmanName;
      }

      // Swap strike on odd runs (e.g. 1 run before wicket)
      if (runsVal % 2 !== 0) {
        // After swap above, the non-striker became the new striker — correct for odd runs
        const tmp = activeStrikerName;
        activeStrikerName = activeNonStrikerName;
        activeNonStrikerName = tmp;
      }

      // Pre-add new batsman stats
      getOrAddBatsman(wicketNewBatsmanName);
    } else if (type === "wicketnoball") {
      // Wicket on a No Ball — usually a run-out. NB does NOT count as legal delivery.
      currentWickets += 1;
      anim = "WICKET";
      currentScore += 1 + runsVal;
      updatedBowlers[bowlerIdx].runsConceded += 1 + runsVal;
      const dnIdx = getOrAddBatsman(wicketDismissedName);
      updatedBatsmen[dnIdx].out = true;
      updatedBatsmen[dnIdx].balls += 1;
      // Wicket on NB is NEVER credited to the bowler
      updatedThisOver.push(runsVal > 0 ? `W+Nb+${runsVal}` : "W+Nb");
      updatedFow.push({ score: currentScore, wickets: currentWickets, over: Math.floor(currentBalls / match.ballsPerOver) + (currentBalls % match.ballsPerOver) / 10, batsman: wicketDismissedName });
      if (wicketDismissedName.toLowerCase() === activeStrikerName.toLowerCase()) activeStrikerName = wicketNewBatsmanName;
      else activeNonStrikerName = wicketNewBatsmanName;
      if (runsVal % 2 !== 0) { const t = activeStrikerName; activeStrikerName = activeNonStrikerName; activeNonStrikerName = t; }
      getOrAddBatsman(wicketNewBatsmanName);
    } else if (type === "wicketwide") {
      // Wicket on a Wide — usually a run-out stumping/wide. Wide does NOT count as legal delivery.
      currentWickets += 1;
      anim = "WICKET";
      currentScore += 1 + runsVal;
      updatedBowlers[bowlerIdx].runsConceded += 1 + runsVal;
      const dwIdx = getOrAddBatsman(wicketDismissedName);
      updatedBatsmen[dwIdx].out = true;
      updatedThisOver.push(runsVal > 0 ? `W+Wd+${runsVal}` : "W+Wd");
      updatedFow.push({ score: currentScore, wickets: currentWickets, over: Math.floor(currentBalls / match.ballsPerOver) + (currentBalls % match.ballsPerOver) / 10, batsman: wicketDismissedName });
      if (wicketDismissedName.toLowerCase() === activeStrikerName.toLowerCase()) activeStrikerName = wicketNewBatsmanName;
      else activeNonStrikerName = wicketNewBatsmanName;
      if (runsVal % 2 !== 0) { const t = activeStrikerName; activeStrikerName = activeNonStrikerName; activeNonStrikerName = t; }
      getOrAddBatsman(wicketNewBatsmanName);
    } else if (type === "wicketbye") {
      // Wicket + Byes — legal delivery; byes credited as extras
      currentWickets += 1;
      anim = "WICKET";
      currentScore += runsVal;
      updatedBowlers[bowlerIdx].ballsBowled += 1;
      currentBalls += 1;
      const dbIdx = getOrAddBatsman(wicketDismissedName);
      updatedBatsmen[dbIdx].out = true;
      updatedBatsmen[dbIdx].balls += 1;
      if (wicketType !== "Run Out") updatedBowlers[bowlerIdx].wickets += 1;
      updatedThisOver.push(runsVal > 0 ? `W+By+${runsVal}` : "W+By");
      updatedFow.push({ score: currentScore, wickets: currentWickets, over: Math.floor(currentBalls / match.ballsPerOver) + (currentBalls % match.ballsPerOver) / 10, batsman: wicketDismissedName });
      if (wicketDismissedName.toLowerCase() === activeStrikerName.toLowerCase()) activeStrikerName = wicketNewBatsmanName;
      else activeNonStrikerName = wicketNewBatsmanName;
      if (runsVal % 2 !== 0) { const t = activeStrikerName; activeStrikerName = activeNonStrikerName; activeNonStrikerName = t; }
      getOrAddBatsman(wicketNewBatsmanName);
    } else if (type === "wicketlegbye") {
      // Wicket + Leg Byes — legal delivery; leg-byes credited as extras
      currentWickets += 1;
      anim = "WICKET";
      currentScore += runsVal;
      updatedBowlers[bowlerIdx].ballsBowled += 1;
      currentBalls += 1;
      const dlIdx = getOrAddBatsman(wicketDismissedName);
      updatedBatsmen[dlIdx].out = true;
      updatedBatsmen[dlIdx].balls += 1;
      if (wicketType !== "Run Out") updatedBowlers[bowlerIdx].wickets += 1;
      updatedThisOver.push(runsVal > 0 ? `W+Lb+${runsVal}` : "W+Lb");
      updatedFow.push({ score: currentScore, wickets: currentWickets, over: Math.floor(currentBalls / match.ballsPerOver) + (currentBalls % match.ballsPerOver) / 10, batsman: wicketDismissedName });
      if (wicketDismissedName.toLowerCase() === activeStrikerName.toLowerCase()) activeStrikerName = wicketNewBatsmanName;
      else activeNonStrikerName = wicketNewBatsmanName;
      if (runsVal % 2 !== 0) { const t = activeStrikerName; activeStrikerName = activeNonStrikerName; activeNonStrikerName = t; }
      getOrAddBatsman(wicketNewBatsmanName);
    }

    // Check if over completed
    let isOverEnd = false;
    if (
      type !== "wide" &&
      type !== "noball" &&
      type !== "widenoball" &&
      type !== "wicketnoball" &&
      type !== "wicketwide" &&
      type !== "custom_byes"
    ) {
      if (currentBalls % match.ballsPerOver === 0) {
        isOverEnd = true;
        currentOvers = Math.floor(currentBalls / match.ballsPerOver);
        // Swap batting strike at end of over
        const temp = activeStrikerName;
        activeStrikerName = activeNonStrikerName;
        activeNonStrikerName = temp;
        // Reset bowler for next over selection
        activeBowlerName = "";
        updatedThisOver.length = 0; // Clear over circles
      }
    }

    // Check Innings End Conditions
    const totalBallsInInnings = match.overs * match.ballsPerOver;
    let isInningsEnd = false;
    let matchStatus: "Live" | "Completed" = "Live";

    const nextState: ScoringState = {
      ...scoringState,
      score: currentScore,
      wickets: currentWickets,
      balls: currentBalls,
      overs: currentOvers,
      striker: activeStrikerName,
      nonStriker: activeNonStrikerName,
      bowler: activeBowlerName,
      batsmen: updatedBatsmen,
      bowlers: updatedBowlers,
      fallOfWickets: updatedFow,
      thisOver: updatedThisOver,
      animation: anim,
      history: newHistory,
    };

    if (scoringState.inningsNo === 1) {
      if (currentWickets === 10 || currentBalls === totalBallsInInnings) {
        isInningsEnd = true;
      }
    } else {
      // 2nd innings
      const targetVal = scoringState.target || 0;
      if (currentScore >= targetVal) {
        // Chased successfully
        matchStatus = "Completed";
      } else if (currentWickets === 10 || currentBalls === totalBallsInInnings) {
        // Failed to chase
        matchStatus = "Completed";
      }
    }

    if (isInningsEnd) {
      // Transition to 2nd innings
      const secondInningsBatting = scoringState.battingTeam === "team1" ? "team2" : "team1";
      const secondInningsBowling = scoringState.battingTeam === "team1" ? "team1" : "team2";

      const { history: _, ...nextStateWithoutHistory } = nextState;

      const nextInningsState: ScoringState = {
        battingTeam: secondInningsBatting,
        bowlingTeam: secondInningsBowling,
        inningsStarted: true,
        inningsNo: 2,
        striker: "", // Will prompt
        nonStriker: "",
        bowler: "",
        score: 0,
        wickets: 0,
        balls: 0,
        overs: 0,
        target: currentScore + 1,
        thisOver: [],
        batsmen: [],
        bowlers: [],
        fallOfWickets: [],
        animation: "INNINGS BREAK",
        displayScreen: "default",
        customInputText: "",
        momPlayer: "",
        tournamentStatsPlayer: "",
        decision: null,
        displayStatsMode: null,
        history: [...newHistory, nextStateWithoutHistory],
        firstInnings: {
          score: currentScore,
          wickets: currentWickets,
          balls: currentBalls,
          overs: currentOvers,
          batsmen: updatedBatsmen,
          bowlers: updatedBowlers,
          fallOfWickets: updatedFow,
        },
      };

      setScoringState(nextInningsState);
      saveScoringState(nextInningsState, "Live", t1Changed ? updatedT1 : undefined, t2Changed ? updatedT2 : undefined);
      showToast("First innings finished! Setting up 2nd innings...");
      // Auto open 2nd innings input
      setStrikerInput("");
      setNonStrikerInput("");
      setBowlerInput("");
      setShowStartInningsModal(true);
    } else {
      setScoringState(nextState);
      saveScoringState(nextState, matchStatus, t1Changed ? updatedT1 : undefined, t2Changed ? updatedT2 : undefined);
      if (t1Changed || t2Changed) {
        setMatch((prev) => prev ? { ...prev, playersTeam1: updatedT1, playersTeam2: updatedT2 } : null);
      }
      if (matchStatus === "Completed") {
        showToast("Match finished!", "success");
        setMatch((prev) => (prev ? { ...prev, status: "Completed", playersTeam1: t1Changed ? updatedT1 : prev.playersTeam1, playersTeam2: t2Changed ? updatedT2 : prev.playersTeam2 } : null));
      } else if (isOverEnd) {
        showToast("Over complete! Select new bowler.");
        setNewBowlerInput("");
        setShowNewBowlerModal(true);
      }
    }
  };

  // Handle Undo
  const handleUndo = () => {
    if (!scoringState || !scoringState.history || scoringState.history.length === 0) {
      showToast("No history to UNDO.", "info");
      return;
    }

    const prevHistory = [...scoringState.history];
    const prev = prevHistory.pop()!;

    const restoredState: ScoringState = {
      ...prev,
      history: prevHistory,
    };

    setScoringState(restoredState);
    saveScoringState(restoredState, "Live");
    setMatch((prev) => (prev ? { ...prev, status: "Live" } : null));

    // Close startup modal if we restored 1st innings or break state
    if (restoredState.inningsNo === 1 || restoredState.animation === "INNINGS BREAK" || !restoredState.inningsStarted) {
      setShowStartInningsModal(false);
    }

    showToast("Last action undone.");
  };

  // Swap striker and non-striker
  const handleSwapBatter = () => {
    if (!scoringState) return;
    const updated = {
      ...scoringState,
      striker: scoringState.nonStriker,
      nonStriker: scoringState.striker,
    };
    setScoringState(updated);
    saveScoringState(updated);
    showToast("Batters swapped strike.");
  };

  // Reset scoring checkboxes
  const resetScoringCheckboxes = () => {
    setIsWide(false);
    setIsNoBall(false);
    setIsByes(false);
    setIsLegByes(false);
    setIsWicketCheck(false);
  };

  // Handle scoring button press using checkbox modifiers
  const handleScoringButton = (runs: number) => {
    if (!scoringState || !scoringState.inningsStarted) return;
    if (!scoringState.bowler) {
      showToast("Select a bowler first!", "error");
      return;
    }
    if (isWicketCheck) {
      setWicketRuns(runs);
      openWicketModal();
      return;
    }
    let ballType: "runs" | "wide" | "noball" | "widenoball" | "bye" | "legbye" = "runs";
    if (isWide && isNoBall) ballType = "widenoball";
    else if (isWide) ballType = "wide";
    else if (isNoBall) ballType = "noball";
    else if (isByes) ballType = "bye";
    else if (isLegByes) ballType = "legbye";
    recordBall(ballType, runs);
    resetScoringCheckboxes();
  };

  // Manually archive Innings 1 and transition to Innings 2
  const handleArchiveInnings1 = () => {
    if (!scoringState) {
      showToast("No active scoring state to archive.", "error");
      return;
    }
    if (scoringState.inningsNo !== 1) {
      showToast("You can only archive Innings 1.", "error");
      return;
    }
    showConfirm("Are you sure you want to manually archive Innings 1 and transition to Innings 2?", () => {
      const secondInningsBatting = scoringState.battingTeam === "team1" ? "team2" : "team1";
      const secondInningsBowling = scoringState.battingTeam === "team1" ? "team1" : "team2";

      const { history: currentHistory, ...stateWithoutHistory } = scoringState;

      const nextInningsState: ScoringState = {
        battingTeam: secondInningsBatting,
        bowlingTeam: secondInningsBowling,
        inningsStarted: true,
        inningsNo: 2,
        striker: "",
        nonStriker: "",
        bowler: "",
        score: 0,
        wickets: 0,
        balls: 0,
        overs: 0,
        target: scoringState.score + 1,
        thisOver: [],
        batsmen: [],
        bowlers: [],
        fallOfWickets: [],
        animation: "INNINGS BREAK",
        displayScreen: "default",
        customInputText: "",
        momPlayer: "",
        tournamentStatsPlayer: "",
        decision: null,
        displayStatsMode: null,
        history: [...(currentHistory || []), stateWithoutHistory],
        firstInnings: {
          score: scoringState.score,
          wickets: scoringState.wickets,
          balls: scoringState.balls,
          overs: scoringState.overs,
          batsmen: scoringState.batsmen,
          bowlers: scoringState.bowlers,
          fallOfWickets: scoringState.fallOfWickets || [],
        },
      };

      setScoringState(nextInningsState);
      saveScoringState(nextInningsState, "Live");
      showToast("First innings manually archived! Setting up 2nd innings...");

      // Open Innings Setup modal
      setStrikerInput("");
      setNonStrikerInput("");
      setBowlerInput("");
      setShowStartInningsModal(true);
    });
  };

  // Handle Wicket click
  const openWicketModal = () => {
    if (!scoringState) return;
    setDismissedBatsman(scoringState.striker);
    setNewBatsmanInput("");
    setWicketType("Bowled");
    setShowWicketModal(true);
  };

  // Submit wicket outcome
  const handleWicketSubmit = () => {
    if (!newBatsmanInput.trim()) {
      showToast("Please enter a new batsman.", "error");
      return;
    }
    setShowWicketModal(false);
    // Determine the ball type based on which extra checkboxes are also active
    let type: "wicket" | "wicketnoball" | "wicketwide" | "wicketbye" | "wicketlegbye" = "wicket";
    if (isNoBall) type = "wicketnoball";
    else if (isWide) type = "wicketwide";
    else if (isByes) type = "wicketbye";
    else if (isLegByes) type = "wicketlegbye";
    recordBall(type, wicketRuns, dismissedBatsman, newBatsmanInput.trim());
    setWicketRuns(0);
    resetScoringCheckboxes();
  };

  // Reset Scoring State (Default! button)
  const resetMatchScoring = () => {
    showConfirm("Are you sure you want to reset all scoring data? This clears current score state.", () => {
      setScoringState(null);
      setMatch((prev) => (prev ? { ...prev, status: "Not Started" } : null));
      saveScoringState(null, "Not Started");
      showToast("Scoring reset successfully.");
    });
  };

  // Update spectator displays / animations
  const handleTriggerAnimation = (anim: string | null) => {
    if (!scoringState) return;
    const updated = { ...scoringState, animation: anim };
    setScoringState(updated);
    saveScoringState(updated);
    if (anim) showToast(`Triggered ${anim} animation`);
  };

  const handleClearAllOverlays = () => {
    if (!scoringState) return;
    const updated = {
      ...scoringState,
      animation: null,
      decision: null,
      customInputText: "",
      momPlayer: "",
      tournamentStatsPlayer: "",
      displayStatsMode: null,
      displayScreen: "default",
    };
    setScoringState(updated);
    saveScoringState(updated);
    showToast("Cleared all overlays and reset to default scoreboard!");
  };

  const handleUpdateDisplayScreen = (screenName: string) => {
    if (!scoringState) return;
    const isAlreadyActive = scoringState.displayScreen?.toUpperCase() === screenName.toUpperCase();
    const targetScreen = isAlreadyActive ? "default" : screenName;
    const updated = { ...scoringState, displayScreen: targetScreen };
    setScoringState(updated);
    saveScoringState(updated);
    showToast(isAlreadyActive ? "Screen turned off (Showing default)" : `Display screen updated: ${screenName.toUpperCase()}`);
  };

  const handleNewBowlerSubmit = () => {
    if (!newBowlerInput.trim()) {
      showToast("Please enter or select a bowler name.", "error");
      return;
    }
    if (!scoringState || !match) return;

    const bName = newBowlerInput.trim();
    const team = scoringState.bowlingTeam;

    let updatedT1 = match.playersTeam1 || [];
    let updatedT2 = match.playersTeam2 || [];
    let t1Changed = false;
    let t2Changed = false;

    if (team === "team1") {
      if (!updatedT1.some(p => p.toLowerCase() === bName.toLowerCase())) {
        updatedT1 = [...updatedT1, bName];
        t1Changed = true;
      }
    } else {
      if (!updatedT2.some(p => p.toLowerCase() === bName.toLowerCase())) {
        updatedT2 = [...updatedT2, bName];
        t2Changed = true;
      }
    }

    if (t1Changed || t2Changed) {
      setMatch(prev => prev ? { ...prev, playersTeam1: updatedT1, playersTeam2: updatedT2 } : null);
    }

    const updated = {
      ...scoringState,
      bowler: bName,
    };

    setScoringState(updated);
    saveScoringState(updated, undefined, t1Changed ? updatedT1 : undefined, t2Changed ? updatedT2 : undefined);
    setShowNewBowlerModal(false);
    showToast(`Bowler updated to ${bName}`);
  };

  const handleCustomRunsSubmit = () => {
    const val = Number(customRunsInput.trim());
    if (isNaN(val) || customRunsInput.trim() === "") {
      showToast("Please enter a valid number.", "error");
      return;
    }
    if (val < 0) {
      showToast("Runs cannot be negative.", "error");
      return;
    }
    if (!scoringState || !scoringState.inningsStarted) return;
    if (!scoringState.bowler) {
      showToast("Select a bowler first!", "error");
      return;
    }
    recordBall("custom_byes", val);
    resetScoringCheckboxes();
    setShowCustomRunsModal(false);
    setCustomRunsInput("");
  };

  const handleRetireBatterSubmit = () => {
    if (!scoringState || !match) return;
    if (retireTarget !== "1" && retireTarget !== "2") return;
    const newName = retireNewBatsmanInput.trim();
    if (!newName) {
      showToast("Please enter a batsman name.", "error");
      return;
    }

    const updatedBatsmen = scoringState.batsmen.map(b => ({ ...b }));
    const activeStriker = scoringState.striker;
    const activeNonStriker = scoringState.nonStriker;
    let retiredName = retireTarget === "1" ? activeStriker : activeNonStriker;

    // Check if new batsman is already on the field
    if (newName.toLowerCase() === activeStriker.toLowerCase() || newName.toLowerCase() === activeNonStriker.toLowerCase()) {
      showToast("Batter is already on the field.", "error");
      return;
    }

    const retIdx = updatedBatsmen.findIndex(b => b.name.toLowerCase() === retiredName.toLowerCase());
    if (retIdx !== -1) updatedBatsmen[retIdx].out = true;

    const newIdx = updatedBatsmen.findIndex(b => b.name.toLowerCase() === newName.toLowerCase());
    if (newIdx === -1) {
      updatedBatsmen.push({ name: newName, runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
    }

    // Check if new batsman is in team roster, and if not, add it
    const team = scoringState.battingTeam;
    let updatedT1 = match.playersTeam1 || [];
    let updatedT2 = match.playersTeam2 || [];
    let t1Changed = false;
    let t2Changed = false;
    if (team === "team1") {
      if (!updatedT1.some(p => p.toLowerCase() === newName.toLowerCase())) {
        updatedT1 = [...updatedT1, newName];
        t1Changed = true;
      }
    } else {
      if (!updatedT2.some(p => p.toLowerCase() === newName.toLowerCase())) {
        updatedT2 = [...updatedT2, newName];
        t2Changed = true;
      }
    }

    if (t1Changed || t2Changed) {
      setMatch(prev => prev ? { ...prev, playersTeam1: updatedT1, playersTeam2: updatedT2 } : null);
    }

    const { history: _, ...stateWithoutHistory } = scoringState;
    const updated: ScoringState = {
      ...(scoringState as ScoringState),
      striker: retireTarget === "1" ? newName : activeStriker,
      nonStriker: retireTarget === "2" ? newName : activeNonStriker,
      batsmen: updatedBatsmen,
      history: [...(scoringState.history || []), stateWithoutHistory]
    };
    setScoringState(updated);
    saveScoringState(
      updated,
      undefined,
      t1Changed ? updatedT1 : undefined,
      t2Changed ? updatedT2 : undefined
    );
    showToast(retiredName + " retired.");
    setShowRetireModal(false);
    setRetireNewBatsmanInput("");
  };

  const handleSendCustomInput = () => {
    if (!scoringState) return;
    const updated = { ...scoringState, customInputText: customText };
    setScoringState(updated);
    saveScoringState(updated);
    showToast("Display message updated.");
  };

  const handleDisplayMom = () => {
    if (!scoringState) return;
    const updated = { ...scoringState, momPlayer: selectedMom };
    setScoringState(updated);
    saveScoringState(updated);
    showToast(`Displaying MOM: ${selectedMom}`);
  };

  const handleDisplayPlayerStats = () => {
    if (!scoringState) return;
    const updated = { ...scoringState, tournamentStatsPlayer: selectedStatsPlayer };
    setScoringState(updated);
    saveScoringState(updated);
    showToast(`Displaying Stats: ${selectedStatsPlayer}`);
  };

  const handleTourStatsController = (mode: string | null) => {
    if (!scoringState) return;
    const targetScreen = mode || "default";
    const updated = {
      ...scoringState,
      displayStatsMode: mode,
      displayScreen: targetScreen
    };
    setScoringState(updated);
    saveScoringState(updated);
    if (mode) {
      showToast(`Displaying stats category: ${mode}`);
    } else {
      showToast("Tour stats off. Showing default scoreboard.");
    }
  };

  const handleSetDecision = (decisionVal: "PENDING" | "OUT" | "NOT OUT" | null) => {
    if (!scoringState) return;
    const updated = { ...scoringState, decision: decisionVal };
    setScoringState(updated);
    saveScoringState(updated);
    if (decisionVal) showToast(`Umpire Decision: ${decisionVal}`);
  };

  // UI calculations
  const formatOvers = (ballsCount: number, ballsPerOver = 6) => {
    const ov = Math.floor(ballsCount / ballsPerOver);
    const bl = ballsCount % ballsPerOver;
    return `${ov}.${bl}`;
  };

  const calculateRunRate = () => {
    if (!scoringState || scoringState.balls === 0) return "0.00";
    const oversCount = scoringState.balls / (match?.ballsPerOver || 6);
    return (scoringState.score / oversCount).toFixed(2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-slate-900 relative overflow-hidden" suppressHydrationWarning={true}>
        <div className="flex flex-col items-center gap-3 relative z-10" suppressHydrationWarning={true}>
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" suppressHydrationWarning={true} />
          <p className="text-slate-500 font-semibold tracking-wider font-space" suppressHydrationWarning={true}>LOADING MATCH SCOREBOARD...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !match) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-slate-900 relative overflow-hidden">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl font-bold font-space text-slate-900">{error || "Match not found"}</p>
          <Link href="/tournaments" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-bold text-white transition-all">
            Back to Tournaments
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine current active team batting/bowling keys
  const battingTeamKey = scoringState
    ? scoringState.battingTeam
    : getTeamsByToss().batting;
  const bowlingTeamKey = scoringState
    ? scoringState.bowlingTeam
    : getTeamsByToss().bowling;

  // Determine current active team batting/bowling labels
  const currentBattingTeamLabel =
    battingTeamKey === "team1" ? match.team1Name : match.team2Name;
  const currentBowlingTeamLabel =
    bowlingTeamKey === "team1" ? match.team1Name : match.team2Name;

  // Roster lists for suggestions
  const battingRoster = battingTeamKey === "team1" ? match.playersTeam1 : match.playersTeam2;
  const bowlingRoster = bowlingTeamKey === "team1" ? match.playersTeam1 : match.playersTeam2;


  // Active batsman stats
  const activeStrikerStats = scoringState?.batsmen.find((b) => b.name === scoringState.striker);
  const activeNonStrikerStats = scoringState?.batsmen.find((b) => b.name === scoringState.nonStriker);
  const activeBowlerStats = scoringState?.bowlers.find((bw) => bw.name === scoringState.bowler);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 select-none font-sans">
      <style>{`
        /* Super small, professional top-right notifications for controller page */
        .Toastify__toast-container {
          top: 12px !important;
          right: 12px !important;
          left: auto !important;
          transform: none !important;
          width: 220px !important;
          padding: 0 !important;
        }
        .Toastify__toast {
          min-height: auto !important;
          border-radius: 6px !important;
          padding: 6px 10px !important;
          margin-bottom: 6px !important;
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          color: #000 !important;
          font-family: inherit !important;
        }
        .Toastify__toast--success {
          border-left: 3px solid #10b981 !important;
        }
        .Toastify__toast--error {
          border-left: 3px solid #f43f5e !important;
        }
        .Toastify__toast--info {
          border-left: 3px solid #06b6d4 !important;
        }
        .Toastify__toast-body {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
          line-height: 1.3 !important;
        }
        .Toastify__toast-icon {
          width: 12px !important;
          height: 12px !important;
          margin-right: 6px !important;
          flex-shrink: 0 !important;
        }
        .Toastify__close-button {
          align-self: center !important;
          opacity: 0.6 !important;
          color: #000 !important;
          padding: 0 !important;
          width: 10px !important;
          height: 10px !important;
          margin-left: 4px !important;
        }
        .Toastify__close-button > svg {
          width: 8px !important;
          height: 8px !important;
        }
        .Toastify__progress-bar {
          height: 1.5px !important;
        }
        .Toastify__progress-bar--success {
          background: #10b981 !important;
        }
        .Toastify__progress-bar--error {
          background: #f43f5e !important;
        }
        .Toastify__progress-bar--info {
          background: #06b6d4 !important;
        }
      `}</style>

      <Header />

      {/* ── SCOREBOARD LINKS Bar – right below header ───────────────────── */}
      <div className="w-full bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold flex-wrap">
            <Link href={`/tournaments/${match.tournamentId}`} className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tournaments
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-bold truncate max-w-[200px]">{match.team1Name} vs {match.team2Name}</span>
          </div>
          <button
            onClick={() => setShowScoreboardLinks(true)}
            id="scoreboard-links"
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-bold text-[10px] md:text-xs tracking-wider px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all duration-200 cursor-pointer shadow-sm shadow-cyan-500/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            SCOREBOARD LINKS
          </button>
        </div>
      </div>


      <main className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 md:px-6 z-10 flex flex-col gap-6">
        {/* Storage Indicator */}
        <div className="flex justify-start">
          <StorageIndicator />
        </div>

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold border-b border-slate-200 pb-3">
          <Link href={`/tournaments/${match.tournamentId}`} className="hover:text-amber-500 transition-colors">
            Tournament Details
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Match Scoreboard</span>
        </div>

        {/* ── Team VS Banner (Matching Image 1) ─────────────────────────── */}
        <div className="flex items-center justify-center py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg border border-cyan-400/30">
          <h2 className="text-2xl md:text-3xl font-black tracking-widest text-white text-center font-space">
            {match.team1Name.toUpperCase()} <span className="text-zinc-200 text-lg md:text-xl font-medium mx-4">VS</span> {match.team2Name.toUpperCase()}
          </h2>
        </div>

        {/* ── Action Buttons (SEND & CHANGE TOSS) ─────────────────────────── */}
        {isOwner && (
          <div className="flex items-center justify-center gap-3 -mt-2">
            <button
              onClick={() => {
                saveScoringState(scoringState);
                showToast("Score state saved and broadcasted!");
              }}
              className="bg-[#ffcc00] hover:bg-amber-400 text-black font-black text-xs tracking-wider px-6 py-1.5 rounded-md active:scale-95 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              SEND
            </button>
            <button
              onClick={openChangeTossModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs tracking-wider px-4 py-1.5 rounded-md active:scale-95 shadow-md shadow-emerald-600/10 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🪙</span> CHANGE TOSS
            </button>
          </div>
        )}

        {/* ── Score Board Display (Image 3) ─────────────────────────────── */}
        {scoringState && scoringState.inningsStarted ? (
          <div className="flex flex-col gap-3">
            {/* VS Title banner inside scoreboard */}
            <div className="text-center font-black text-sm text-slate-500 tracking-wider">
              {currentBowlingTeamLabel.toUpperCase()} VS {currentBattingTeamLabel.toUpperCase()}
            </div>

            {/* Run Rate Banner */}
            <div className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-1.5 text-center font-bold tracking-widest text-sm text-white rounded-md uppercase">
              RUN RATE: {calculateRunRate()}{" "}
              {scoringState.target !== null && ` | TARGET: ${scoringState.target}`}
            </div>

            {/* Grid 3 boxes layout matching Image 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Left Box: Batsmen stats */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center min-h-[120px] shadow-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold flex items-center gap-1.5 text-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      {scoringState.striker || "Striker"}
                    </span>
                    <span className="font-bold text-slate-900">
                      {activeStrikerStats?.runs || 0}{" "}
                      <span className="text-xs text-slate-400 font-medium font-mono">({activeStrikerStats?.balls || 0})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="font-bold pl-4">{scoringState.nonStriker || "Non-Striker"}</span>
                    <span className="font-semibold text-slate-800">
                      {activeNonStrikerStats?.runs || 0}{" "}
                      <span className="text-xs text-slate-400 font-medium font-mono">({activeNonStrikerStats?.balls || 0})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Box: Score & Overs (Blue background) */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[120px] shadow-lg text-white border border-blue-500/20">
                <span className="text-3xl font-black font-space tracking-tight">
                  {scoringState.score} - {scoringState.wickets}
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-blue-200 mt-1">
                  {formatOvers(scoringState.balls, match.ballsPerOver)}/{match.overs} OVR
                </span>
              </div>

              {/* Right Box: Bowler & Over balls (Teal gradient background) */}
              <div className="bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl p-4 flex flex-col justify-between min-h-[120px] shadow-lg text-white border border-cyan-400/20">
                <div className="flex justify-between items-center text-sm font-black">
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-amber-200 transition-colors"
                    onClick={() => {
                      setNewBowlerInput(scoringState.bowler);
                      setShowNewBowlerModal(true);
                    }}
                    title="Change Bowler"
                  >
                    <span>{scoringState.bowler || "Bowler"}</span>
                    <span className="text-[10px] opacity-70">✏️</span>
                  </div>
                  <span>
                    {activeBowlerStats?.wickets || 0} - {activeBowlerStats?.runsConceded || 0}
                  </span>
                </div>

                {/* Over balls display (Image 3 circles) */}
                <div className="flex items-center gap-1.5 mt-2 justify-center flex-wrap">
                  {(() => {
                    const ballsPerOver = match?.ballsPerOver || 6;
                    const thisOver = scoringState.thisOver || [];
                    const extrasCount = thisOver.filter(
                      (b) => b && (b.includes("Nb") || b.includes("WNb") || b.includes("Wd"))
                    ).length;
                    const totalCirclesCount = ballsPerOver + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, idx) => {
                      const outcome = thisOver[idx];
                      let bgClass = "bg-white/20 border border-white/10"; // empty slot
                      if (outcome) {
                        if (outcome === "W" || outcome.startsWith("W+")) bgClass = "bg-red-600 text-white border border-red-500";
                        else if (outcome === "6" || outcome === "4") bgClass = "bg-amber-500 text-black";
                        else if (outcome.startsWith("Nb")) bgClass = "bg-blue-500 text-white";
                        else if (outcome.startsWith("WNb")) bgClass = "bg-purple-500 text-white";
                        else if (outcome.startsWith("Wd")) bgClass = "bg-orange-600 text-white";
                        else bgClass = "bg-white text-zinc-800";
                      }
                      const getControllerStyle = (text: string) => {
                        if (!text) return { fontSize: "11px", letterSpacing: "normal" };
                        if (text.length >= 5) return { fontSize: "6.5px", letterSpacing: "-0.8px" };
                        if (text.length === 4) return { fontSize: "7.5px", letterSpacing: "-0.6px" };
                        if (text.length === 3) return { fontSize: "8.5px", letterSpacing: "-0.4px" };
                        if (text.length === 2) return { fontSize: "9.5px", letterSpacing: "normal" };
                        return { fontSize: "11px", letterSpacing: "normal" };
                      };
                      const styleObj = getControllerStyle(outcome || "");
                      // Render W+N or W+Nb or W+Nb+2 as stacked two-line text
                      const renderBallText = (val: string) => {
                        if (val && val.includes("+")) {
                          const parts = val.split("+");
                          const top = parts[0];
                          const bottom = parts.slice(1).join("+");
                          return (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 0.95 }}>
                              <span style={{ fontSize: "7px", fontWeight: 900 }}>{top}</span>
                              <span style={{ fontSize: "5.5px", fontWeight: 900 }}>{bottom}</span>
                            </div>
                          );
                        }
                        return val || "";
                      };
                      return (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shadow-inner ${bgClass}`}
                          style={{
                            fontSize: outcome?.includes("+") ? undefined : styleObj.fontSize,
                            letterSpacing: outcome?.includes("+") ? undefined : styleObj.letterSpacing,
                            lineHeight: 1,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {renderBallText(outcome || "")}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* SEND Button (Bottom of Scoreboard, Image 3) */}
            {isOwner && (
              <div className="flex justify-center mt-1">
                <button
                  onClick={() => {
                    saveScoringState(scoringState);
                    showToast("Score synchronized with display!");
                  }}
                  className="bg-[#ffcc00] hover:bg-amber-400 text-black font-black text-xs tracking-wider px-6 py-1.5 rounded-md active:scale-95 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                >
                  SEND
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50 gap-4">
            <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">🏏</span>
            <div className="text-center">
              <p className="font-extrabold text-sm tracking-wider font-space text-slate-800">INNINGS NOT STARTED</p>
              <p className="text-xs text-slate-500 mt-1">Setup teams and click Start 1st Innings to initialize scoreboard</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
                <span>🪙</span>
                <span>Toss: <strong>{match.tossWonBy === "team1" ? match.team1Name : match.team2Name}</strong> won the toss & elected to <strong>{match.optedTo}</strong></span>
              </div>
            </div>
            {isOwner && (
              <div className="flex items-center gap-3">
                <button
                  onClick={openChangeTossModal}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>🪙</span> CHANGE TOSS
                </button>
                <button
                  onClick={openStartInnings}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-xs font-bold text-white transition-all cursor-pointer active:scale-95 shadow-md shadow-orange-500/20"
                >
                  START 1ST INNINGS
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MATCH COMPLETED — Summary, Scorecard & PDF ──────────────── */}
        {match.status === "Completed" && scoringState && (() => {
          const inn1 = scoringState.firstInnings;
          const inn2 = { score: scoringState.score, wickets: scoringState.wickets, balls: scoringState.balls, batsmen: scoringState.batsmen, bowlers: scoringState.bowlers, fallOfWickets: scoringState.fallOfWickets };
          const bat1Team = scoringState.battingTeam === "team1" ? match.team2Name : match.team1Name; // inn1 batting team
          const bat2Team = scoringState.battingTeam === "team1" ? match.team1Name : match.team2Name; // inn2 batting team
          const fmtOv = (b: number) => `${Math.floor(b / (match.ballsPerOver || 6))}.${b % (match.ballsPerOver || 6)}`;
          const winnerText = scoringState.target !== null
            ? (scoringState.score >= scoringState.target
              ? `${bat2Team} won by ${Math.max(0, 10 - scoringState.wickets)} wicket${Math.max(0, 10 - scoringState.wickets) === 1 ? "" : "s"}`
              : `${bat1Team} won by ${Math.max(0, scoringState.target - scoringState.score - 1)} run${Math.max(0, scoringState.target - scoringState.score - 1) === 1 ? "" : "s"}`)
            : "Match Completed";

          const handleDownloadPDF = () => {
            const printContent = document.getElementById("match-scorecard-print");
            if (!printContent) return;
            const win = window.open("", "_blank", "width=900,height=700");
            if (!win) return;
            win.document.write(`
              <html><head><title>Scorecard - ${match.team1Name} vs ${match.team2Name}</title>
              <style>
                body{font-family:Arial,sans-serif;color:#111;background:#fff;padding:24px;font-size:13px}
                h1{font-size:20px;font-weight:900;margin-bottom:4px}
                h2{font-size:14px;font-weight:800;margin:20px 0 8px;text-transform:uppercase;border-bottom:2px solid #333;padding-bottom:4px}
                h3{font-size:12px;font-weight:800;margin:12px 0 4px;color:#555}
                table{width:100%;border-collapse:collapse;margin-bottom:8px}
                th{text-align:left;font-size:10px;font-weight:800;padding:6px 8px;background:#f1f5f9;text-transform:uppercase;letter-spacing:1px}
                td{padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:12px}
                .winner{background:#d1fae5;padding:8px 16px;border-radius:6px;font-weight:900;font-size:15px;display:inline-block;margin-bottom:16px}
                .score-big{font-size:22px;font-weight:900}
                .inn-header{background:#0f172a;color:#fff;padding:8px 12px;border-radius:4px;margin-bottom:8px}
                @media print{body{padding:12px}}
              </style></head><body>
              ${printContent.innerHTML}
              </body></html>`);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); }, 500);
          };

          const InningsTable = ({ inn, batTeam, bowlTeam, innNo }: { inn: any, batTeam: string, bowlTeam: string, innNo: number }) => {
            if (!inn) return <p className="text-xs text-slate-500 italic">No data for innings {innNo}.</p>;
            return (
              <div className="flex flex-col gap-4 text-slate-900">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  <span className="font-black text-sm text-emerald-800 uppercase tracking-wider">INN {innNo} — {batTeam}</span>
                  <span className="font-black text-lg text-emerald-900">{inn.score}/{inn.wickets} <span className="text-xs text-slate-500 font-medium">({fmtOv(inn.balls)}/{match.overs} Ov)</span></span>
                </div>
                {/* Batting */}
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">🏏 Batting</h4>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["Batsman", "R", "B", "4s", "6s", "SR"].map(h => <th key={h} className="py-1.5 px-2 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(inn.batsmen || []).map((b: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-2 font-bold text-slate-900">{b.name}{b.out ? <span className="ml-2 text-[9px] text-red-600 font-black">OUT</span> : <span className="ml-2 text-[9px] text-green-600 font-black">N/O</span>}</td>
                          <td className="py-2 px-2 font-black text-amber-600">{b.runs}</td>
                          <td className="py-2 px-2 text-slate-600">{b.balls}</td>
                          <td className="py-2 px-2 text-amber-600 font-bold">{b.fours}</td>
                          <td className="py-2 px-2 text-sky-600 font-bold">{b.sixes}</td>
                          <td className="py-2 px-2 text-slate-700">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Bowling */}
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">🎯 Bowling — {bowlTeam}</h4>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["Bowler", "O", "R", "W", "Eco"].map(h => <th key={h} className="py-1.5 px-2 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(inn.bowlers || []).map((bw: any, i: number) => {
                        const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * (match.ballsPerOver || 6)).toFixed(2) : "0.00";
                        return (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-2 font-bold text-slate-900">{bw.name}</td>
                            <td className="py-2 px-2 text-slate-600">{fmtOv(bw.ballsBowled)}</td>
                            <td className="py-2 px-2 text-slate-600">{bw.runsConceded}</td>
                            <td className="py-2 px-2 font-black text-red-600">{bw.wickets}</td>
                            <td className="py-2 px-2 text-slate-700">{eco}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          };

          return (
            <div className="flex flex-col gap-4 mt-2">
              {/* Trophy Banner */}
              <div className="relative overflow-hidden bg-amber-50/50 border border-amber-200 rounded-2xl p-5 text-center shadow-md">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-xs font-black tracking-widest text-amber-600 uppercase mb-1">Match Completed</div>
                <div className="text-xl font-black text-slate-900 tracking-wide">{winnerText}</div>
                <div className="flex items-center justify-center gap-6 mt-3 text-sm text-slate-700">
                  {inn1 && <span className="font-bold">{bat1Team}: <span className="text-amber-600 font-black">{inn1.score}/{inn1.wickets}</span> ({fmtOv(inn1.balls)})</span>}
                  <span className="text-slate-300">|</span>
                  <span className="font-bold">{bat2Team}: <span className="text-amber-600 font-black">{inn2.score}/{inn2.wickets}</span> ({fmtOv(inn2.balls)})</span>
                </div>
              </div>

              {/* Summary & Download button */}
              <div className="flex flex-col gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                  <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase">📋 Export Match Reports</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PDF Theme Style:</span>
                    <select
                      value={selectedPdfTheme}
                      onChange={(e) => setSelectedPdfTheme(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 cursor-pointer focus:outline-none font-bold"
                    >
                      <option value="asia-cup">Asia Cup</option>
                      <option value="cwc-19">CWC 19</option>
                      <option value="champions-trophy-2025">Champions Trophy 2025</option>
                      <option value="cwc-25-india">CWC 25 India</option>
                      <option value="wcl-fancode">WCL (Fancode)</option>
                      <option value="cwc-23-india">CWC 23 India</option>
                      <option value="ipl">IPL</option>
                      <option value="t20-wc-2024">T20 World Cup 2024</option>
                      <option value="legends-league-2024">Legends League 2024</option>
                      <option value="asia-cup-2023">Asia Cup 2023</option>
                      <option value="ct-17">Champions Trophy 2017</option>
                      <option value="cwc-2011">CWC 2011</option>
                      <option value="wt20-2024">WT20 2024</option>
                      <option value="bbl-starsports">BBL (Star Sports)</option>
                      <option value="ipl-2025">IPL 2025</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3.5">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer border border-slate-300 uppercase"
                  >
                    ⬇️ Plain PDF
                  </button>
                  <button
                    onClick={() => {
                      const origin = window.location.origin;
                      const url = `${origin}/matches/${matchId}/overlay?theme=${selectedPdfTheme}&screen=SUMMARY&print=true`;
                      window.open(url, "_blank", "width=1280,height=720");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-md uppercase"
                  >
                    📄 Graphical Summary PDF
                  </button>
                  <button
                    onClick={() => {
                      const origin = window.location.origin;
                      const url = `${origin}/matches/${matchId}/overlay?theme=${selectedPdfTheme}&screen=FULLSCORE&print=true`;
                      window.open(url, "_blank", "width=1280,height=720");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-md uppercase"
                  >
                    📊 Graphical Scorecard PDF
                  </button>
                </div>
              </div>


              {/* Scorecard — printable target */}
              <div id="match-scorecard-print" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-6">
                {/* Print-only header (hidden on screen) */}
                <div className="hidden print:block text-center mb-4">
                  <h1 className="text-2xl font-black">{match.team1Name} vs {match.team2Name}</h1>
                  <p className="text-sm font-bold text-gray-600">{winnerText}</p>
                </div>
                <InningsTable inn={inn1} batTeam={bat1Team} bowlTeam={bat2Team} innNo={1} />
                <div className="border-t border-zinc-700/50" />
                <InningsTable inn={inn2} batTeam={bat2Team} bowlTeam={bat1Team} innNo={2} />
              </div>
            </div>
          );
        })()}

        {/* ── Owner / Scorer Admin Panels ─────────────────────────────────── */}
        {isOwner && (
          <div className="flex flex-col gap-6 mt-2">
            {/* Overlay & Innings Master Control */}
            {/* <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold tracking-wider text-zinc-400 uppercase">Overlay & Innings Master Control</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Quick master overrides for overlays and match transitions.</p>
                </div>
                {scoringState && scoringState.inningsNo === 1 && scoringState.inningsStarted && (
                  <button
                    onClick={handleArchiveInnings1}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs tracking-wider rounded-lg active:scale-95 transition-all shadow-md shadow-purple-500/20 cursor-pointer uppercase"
                  >
                    MANUALLY ARCHIVE INNINGS 1 📥
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleClearAllOverlays}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-widest rounded-xl active:scale-95 cursor-pointer uppercase shadow-lg shadow-red-500/20 transition-all border border-red-500/30 flex items-center justify-center gap-2"
                >
                  <span>CLOSE ALL BANNERS & OVERLAYS ✕</span>
                </button>
              </div>
            </div> */}

            {/* ── Unified Cricket Controller ─────────────────────────────────── */}
            <div className="relative w-full rounded-[32px] overflow-hidden bg-white border border-slate-200 shadow-xl">
              {/* Colored top header block */}
              <div className="pt-6 pb-2 flex flex-col items-center justify-center border-b border-slate-100">
                <h3 className="text-3xl font-black tracking-wider text-slate-800 font-sans uppercase">Controller</h3>
              </div>

              <div className="p-4 flex flex-col gap-4">

                {/* Row 1: SWAP BATTER | RETIRE BATTER */}
                <div className="flex justify-around gap-2 md:gap-4 px-2 w-full max-w-[480px] mx-auto">
                  <button
                    onClick={handleSwapBatter}
                    className="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-full text-white font-extrabold text-[10px] md:text-sm uppercase tracking-wider flex items-center justify-center gap-1 md:gap-2 transition-all active:scale-95 shadow-md border border-white/20"
                    style={{ background: "linear-gradient(90deg, #ca3ee6, #ea580c)" }}
                  >
                    ⇄ SWAP
                  </button>
                  <button
                    onClick={() => {
                      if (!scoringState || !match) return;
                      setRetireTarget("1");
                      setRetireNewBatsmanInput("");
                      setShowRetireModal(true);
                    }}
                    className="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-full text-black font-extrabold text-[10px] md:text-sm uppercase tracking-wider transition-all active:scale-95 shadow-md border border-black/10"
                    style={{ background: "linear-gradient(90deg, #6ee7b7, #bef264)" }}
                  >
                    RETIRE
                  </button>
                </div>

                {/* Row 2: CHANGE BOWLER | Default | Mini-Score */}
                <div className="flex justify-between gap-2 md:gap-3 px-2 w-full max-w-[480px] mx-auto">
                  <button
                    onClick={() => { setNewBowlerInput(""); setShowNewBowlerModal(true); }}
                    className="flex-1 py-2 md:py-2.5 px-1 md:px-3 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md border border-white/20"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}
                  >
                    CHANGE BOWLER
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("default")}
                    className="w-16 md:w-24 py-2 md:py-2.5 rounded-lg text-white font-extrabold text-[10px] md:text-sm transition-all active:scale-95 shadow-md border border-white/20"
                    style={{ backgroundColor: "#00e600" }}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("MINI")}
                    className="w-20 md:w-28 py-2 md:py-2.5 rounded-lg text-white font-extrabold text-[8px] md:text-xs transition-all active:scale-95 shadow-md border border-white/20"
                    style={{ background: "linear-gradient(135deg, #0f1035, #1e1b4b)" }}
                  >
                    Mini
                  </button>
                </div>

                {/* Row 3: 🎯 (2nd innings only) | Tour Name | B1 | B2 | BOWLER */}
                <div className="flex justify-between gap-2 md:gap-3 px-2 w-full max-w-[480px] mx-auto">
                  {scoringState?.inningsNo === 2 && (
                    <button
                      onClick={() => handleUpdateDisplayScreen("TARGET")}
                      className="w-10 md:w-14 h-8 md:h-10 rounded-lg text-black font-black text-base md:text-xl flex items-center justify-center transition-all active:scale-95 shadow-md border border-black/10 bg-yellow-400"
                    >
                      🎯
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateDisplayScreen("TOUR")}
                    className={`flex-1 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border ${scoringState?.displayScreen?.toUpperCase() === "TOUR" || scoringState?.displayScreen?.toUpperCase() === "TOURNAME" || scoringState?.displayScreen?.toUpperCase() === "TOUR BOUNDARIES"
                        ? "bg-blue-500/40 border-blue-300 ring-2 ring-blue-400 shadow-blue-500/30"
                        : "border-white/10 bg-blue-700 hover:bg-blue-600"
                      } ${scoringState?.inningsNo !== 2 ? 'ml-0' : ''}`}
                  >
                    Tour
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("B1")}
                    className={`w-12 md:w-18 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border ${scoringState?.displayScreen?.toUpperCase() === "B1"
                        ? "bg-teal-500/40 border-teal-300 ring-2 ring-teal-400 shadow-teal-500/30"
                        : "border-white/10"
                      }`}
                    style={{ background: scoringState?.displayScreen?.toUpperCase() === "B1" ? "linear-gradient(135deg, #0d9488, #115e59)" : "linear-gradient(135deg, #14b8a6, #1e1b4b)" }}
                  >
                    B1
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("B2")}
                    className={`w-12 md:w-18 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border ${scoringState?.displayScreen?.toUpperCase() === "B2"
                        ? "bg-fuchsia-500/40 border-fuchsia-300 ring-2 ring-fuchsia-400 shadow-fuchsia-500/30"
                        : "border-white/10"
                      }`}
                    style={{ background: scoringState?.displayScreen?.toUpperCase() === "B2" ? "linear-gradient(135deg, #c026d3, #86198f)" : "linear-gradient(135deg, #d946ef, #701a75)" }}
                  >
                    B2
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("BOWLER")}
                    className={`w-12 md:w-18 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border ${scoringState?.displayScreen?.toUpperCase() === "BOWLER"
                        ? "bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400 shadow-cyan-500/30"
                        : "border-white/10"
                      }`}
                    style={{ background: scoringState?.displayScreen?.toUpperCase() === "BOWLER" ? "linear-gradient(135deg, #0284c7, #0369a1)" : "linear-gradient(135deg, #06b6d4, #2563eb)" }}
                  >
                    BOWLER
                  </button>
                </div>

                {/* Row 4: Batting | Bowling | PP+ */}
                <div className="flex justify-between gap-2 md:gap-3 px-2 w-full max-w-[480px] mx-auto">
                  <button
                    onClick={() => handleUpdateDisplayScreen(scoringState?.inningsNo === 1 ? "Y1BAT" : "Y2BAT")}
                    className={`flex-1 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border ${scoringState?.displayScreen?.toUpperCase() === "Y1BAT" || scoringState?.displayScreen?.toUpperCase() === "Y2BAT" || scoringState?.displayScreen?.toUpperCase() === "1BAT" || scoringState?.displayScreen?.toUpperCase() === "2BAT"
                        ? "bg-pink-500/40 border-pink-300 ring-2 ring-pink-400 shadow-pink-500/30"
                        : "border-white/10"
                      }`}
                    style={{ background: (scoringState?.displayScreen?.toUpperCase() === "Y1BAT" || scoringState?.displayScreen?.toUpperCase() === "Y2BAT" || scoringState?.displayScreen?.toUpperCase() === "1BAT" || scoringState?.displayScreen?.toUpperCase() === "2BAT") ? "linear-gradient(135deg, #be185d, #9d174d)" : "linear-gradient(135deg, #ec4899, #db2777)" }}
                  >
                    Batting
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen(scoringState?.inningsNo === 1 ? "Y1BALL" : "Y2BALL")}
                    className={`flex-1 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border ${scoringState?.displayScreen?.toUpperCase() === "Y1BALL" || scoringState?.displayScreen?.toUpperCase() === "Y2BALL" || scoringState?.displayScreen?.toUpperCase() === "1BALL" || scoringState?.displayScreen?.toUpperCase() === "2BALL"
                        ? "bg-rose-900 border-rose-400 ring-2 ring-rose-400 shadow-rose-500/30"
                        : "border-white/10"
                      }`}
                    style={{ background: (scoringState?.displayScreen?.toUpperCase() === "Y1BALL" || scoringState?.displayScreen?.toUpperCase() === "Y2BALL" || scoringState?.displayScreen?.toUpperCase() === "1BALL" || scoringState?.displayScreen?.toUpperCase() === "2BALL") ? "linear-gradient(135deg, #701a75, #4a044e)" : "linear-gradient(135deg, #881337, #4c0519)" }}
                  >
                    Bowling
                  </button>
                  <button
                    onClick={() => handleTriggerAnimation("POWERPLAY")}
                    className="w-12 md:w-16 py-1.5 md:py-2 rounded-lg text-black font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border border-black/10 bg-yellow-400"
                  >
                    PP+
                  </button>
                </div>

                {/* Row 5: END INNING (innings-aware) | UNDO */}
                <div className="flex justify-between gap-2 md:gap-4 px-2 w-full max-w-[480px] mx-auto">
                  {scoringState?.inningsNo === 1 ? (
                    <button
                      onClick={handleArchiveInnings1}
                      className="flex-1 py-2 md:py-2.5 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md border border-white/10"
                      style={{ backgroundColor: "#701a75" }}
                    >
                      END INN 1
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!scoringState) return;
                        showConfirm("End Inning 2 and complete the match?", () => {
                          const { history: _, ...stateWithoutHistory } = scoringState;
                          const updated: ScoringState = {
                            ...(scoringState as ScoringState),
                            history: [...(scoringState.history || []), stateWithoutHistory]
                          };
                          setScoringState(updated);
                          setMatch(prev => prev ? { ...prev, status: "Completed" } : null);
                          saveScoringState(updated, "Completed");
                          showToast("Inning 2 ended!");
                        });
                      }}
                      className="flex-1 py-2 md:py-2.5 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md border border-white/10"
                      style={{ backgroundColor: "#701a75" }}
                    >
                      END INN 2
                    </button>
                  )}
                  <button
                    onClick={handleUndo}
                    className="w-24 md:w-32 py-2 md:py-2.5 rounded-lg text-white font-extrabold text-[10px] md:text-sm uppercase tracking-wider transition-all active:scale-95 shadow-md border border-white/10 bg-red-600"
                  >
                    UNDO
                  </button>
                </div>

                <div className="border-t border-black/20 my-1" />

                {/* No-bowler warning */}
                {scoringState && scoringState.inningsStarted && !scoringState.bowler && (
                  <div
                    className="flex items-center gap-3 bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-3 cursor-pointer"
                    onClick={() => { setNewBowlerInput(""); setShowNewBowlerModal(true); }}
                  >
                    <span className="text-amber-400 text-lg">⚠️</span>
                    <div>
                      <p className="text-amber-300 font-black text-xs uppercase tracking-wider">No Bowler Selected</p>
                      <p className="text-amber-200/70 text-[10px]">Tap here to select the bowler before scoring</p>
                    </div>
                  </div>
                )}

                {/* Checkboxes Row 1: Wide | No Ball | Byes */}
                <div className="flex items-center justify-around py-2 px-2 bg-transparent text-black">
                  {[
                    {
                      label: "Wide", checked: isWide, set: (val: boolean) => {
                        // Wide and NoBall are mutually exclusive; Byes/LegByes also off when Wide
                        if (val) { setIsNoBall(false); setIsByes(false); setIsLegByes(false); }
                        setIsWide(val);
                      }
                    },
                    {
                      label: "No Ball", checked: isNoBall, set: (val: boolean) => {
                        if (val) { setIsWide(false); setIsByes(false); setIsLegByes(false); }
                        setIsNoBall(val);
                      }
                    },
                    {
                      label: "Byes", checked: isByes, set: (val: boolean) => {
                        if (val) { setIsWide(false); setIsNoBall(false); setIsLegByes(false); }
                        setIsByes(val);
                      }
                    },
                  ].map(({ label, checked, set }) => (
                    <label key={label} className="flex items-center gap-1 md:gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => set(e.target.checked)}
                        className="w-4 h-4 md:w-6 md:h-6 rounded border-2 border-black bg-white text-black cursor-pointer accent-black"
                      />
                      <span className="text-black font-extrabold text-sm md:text-lg tracking-wide">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Checkboxes Row 2: Leg Byes | Wicket */}
                <div className="flex items-center justify-center gap-8 md:gap-12 py-2 px-2 bg-transparent text-black">
                  {[
                    {
                      label: "Leg Byes", checked: isLegByes, set: (val: boolean) => {
                        if (val) { setIsWide(false); setIsNoBall(false); setIsByes(false); }
                        setIsLegByes(val);
                      }
                    },
                    {
                      label: "Wicket", checked: isWicketCheck, set: (val: boolean) => {
                        // Wicket can be combined with Wide/NoBall/Byes/LegByes
                        setIsWicketCheck(val);
                      }, info: true
                    },
                  ].map(({ label, checked, set, info }) => (
                    <label key={label} className="flex items-center gap-1 md:gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => set(e.target.checked)}
                        className="w-4 h-4 md:w-6 md:h-6 rounded border-2 border-black bg-white text-black cursor-pointer accent-black"
                      />
                      <span className="text-black font-extrabold text-sm md:text-lg tracking-wide flex items-center gap-1">
                        {label}
                        {info && (
                          <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-yellow-400 text-blue-800 flex items-center justify-center font-bold text-[8px] md:text-xs shadow-sm border border-yellow-300">
                            i
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Number Pad */}
                <div className={`flex flex-col gap-3 md:gap-4 mt-2 max-w-xs mx-auto w-full ${scoringState?.inningsStarted && !scoringState?.bowler ? "opacity-40 pointer-events-none" : ""
                  }`}>
                  {/* Row 1: 0 1 2 3 */}
                  <div className="grid grid-cols-4 gap-2 md:gap-3 justify-items-center">
                    {[0, 1, 2, 3].map((run) => {
                      const btnKey = `btn-${run}`;
                      const isActive = activeScoringButton === btnKey;
                      return (
                        <button
                          key={run}
                          type="button"
                          onClick={() => {
                            setActiveScoringButton(btnKey);
                            handleScoringButton(run);
                          }}
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-slate-900 ${isActive
                            ? "bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-600 text-amber-800 shadow-[0_0_18px_rgba(245,158,11,0.45)]"
                            : "bg-slate-50 hover:bg-gradient-to-br hover:from-amber-100 hover:to-yellow-50 hover:border-amber-600 hover:text-amber-800 hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] text-slate-900"
                            } font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-lg shadow-slate-400/20 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] active:bg-slate-900 active:text-white active:border-slate-700 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] active:shadow-none cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-50 focus-visible:ring-4 focus-visible:ring-amber-300/60`}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          {run}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row 2: 4 5 6 ... */}
                  <div className="grid grid-cols-4 gap-2 md:gap-3 justify-items-center">
                    {[4, 5, 6].map((run) => {
                      const btnKey = `btn-${run}`;
                      const isActive = activeScoringButton === btnKey;
                      return (
                        <button
                          key={run}
                          type="button"
                          onClick={() => {
                            setActiveScoringButton(btnKey);
                            handleScoringButton(run);
                          }}
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-slate-900 ${isActive
                            ? "bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-600 text-amber-800 shadow-[0_0_18px_rgba(245,158,11,0.45)]"
                            : "bg-slate-50 hover:bg-gradient-to-br hover:from-amber-100 hover:to-yellow-50 hover:border-amber-600 hover:text-amber-800 hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] text-slate-900"
                            } font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-lg shadow-slate-400/20 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] active:bg-slate-900 active:text-white active:border-slate-700 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] active:shadow-none cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-50 focus-visible:ring-4 focus-visible:ring-amber-300/60`}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          {run}
                        </button>
                      );
                    })}
                    {(() => {
                      const btnKey = "btn-custom";
                      const isActive = activeScoringButton === btnKey;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveScoringButton(btnKey);
                            setCustomRunsInput("");
                            setShowCustomRunsModal(true);
                          }}
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-slate-900 ${isActive
                            ? "bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-600 text-amber-800 shadow-[0_0_18px_rgba(245,158,11,0.45)]"
                            : "bg-slate-50 hover:bg-gradient-to-br hover:from-amber-100 hover:to-yellow-50 hover:border-amber-600 hover:text-amber-800 hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] text-slate-900"
                            } font-extrabold text-xl md:text-2xl flex items-center justify-center shadow-lg shadow-slate-400/20 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] active:bg-slate-900 active:text-white active:border-slate-700 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] active:shadow-none cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-50 focus-visible:ring-4 focus-visible:ring-amber-300/60`}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          •••
                        </button>
                      );
                    })()}
                  </div>

                  {/* Row 3: 1D | ? */}
                  <div className="flex justify-center gap-6 md:gap-8">
                    {(() => {
                      const btnKey = "btn-1d";
                      const isActive = activeScoringButton === btnKey;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveScoringButton(btnKey);
                            recordBall("runs", 1);
                            resetScoringCheckboxes();
                          }}
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-slate-900 ${isActive
                            ? "bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-600 text-amber-800 shadow-[0_0_18px_rgba(245,158,11,0.45)]"
                            : "bg-slate-50 hover:bg-gradient-to-br hover:from-amber-100 hover:to-yellow-50 hover:border-amber-600 hover:text-amber-800 hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] text-slate-900"
                            } font-extrabold text-xl md:text-2xl flex items-center justify-center shadow-lg shadow-slate-400/20 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] active:bg-slate-900 active:text-white active:border-slate-700 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] active:shadow-none cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-50 focus-visible:ring-4 focus-visible:ring-amber-300/60`}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          1D
                        </button>
                      );
                    })()}
                    {(() => {
                      const btnKey = "btn-help";
                      const isActive = activeScoringButton === btnKey;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveScoringButton(btnKey);
                            alert(
                              "Scoring Help:\n\n" +
                              "• Check any of the extras (Wide, No Ball, Byes, Leg Byes, Wicket) first, then tap a number (0-6) to record.\n" +
                              "• Tap '1D' to record 1 run Declared.\n" +
                              "• Tap '•••' to record custom runs.\n" +
                              "• Tap '?' to check help details."
                            );
                          }}
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-slate-900 ${isActive
                            ? "bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-600 text-amber-800 shadow-[0_0_18px_rgba(245,158,11,0.45)]"
                            : "bg-slate-50 hover:bg-gradient-to-br hover:from-amber-100 hover:to-yellow-50 hover:border-amber-600 hover:text-amber-800 hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] text-slate-900"
                            } font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-lg shadow-slate-400/20 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] active:bg-slate-900 active:text-white active:border-slate-700 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] active:shadow-none cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-50 focus-visible:ring-4 focus-visible:ring-amber-300/60`}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          ?
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Edit Team Roster Panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 flex flex-col gap-3 md:gap-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 md:gap-0">
                    <span className="text-[10px] md:text-xs font-black tracking-wider text-slate-700 uppercase">Edit Team Roster 🔧</span>
                    <span className="text-[8px] md:text-[10px] text-slate-400">Comma-separate for bulk add</span>
                  </div>

                  {/* Team 1 add */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="flex-1 flex gap-1 md:gap-2">
                      <input
                        type="text"
                        value={playerInput1}
                        onChange={(e) => setPlayerInput1(e.target.value)}
                        placeholder={`ADD PLAYER TO ${match.team1Name.toUpperCase()}`}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddPlayer("team1")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2 md:px-3 flex items-center justify-center cursor-pointer text-sm md:text-base"
                      >
                        ➕
                      </button>
                    </div>
                    <button
                      onClick={() => setShowPlayers1(!showPlayers1)}
                      className="bg-slate-200 border border-slate-300 text-slate-800 font-bold text-[9px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-lg whitespace-nowrap hover:bg-slate-300"
                    >
                      {match.team1Name.substring(0, 8).toUpperCase()}... Players ({match.playersTeam1?.length || 0})
                    </button>
                  </div>
                  {showPlayers1 && (
                    <div className="bg-white border border-slate-200 rounded-lg p-2 md:p-3 flex flex-col gap-1.5 text-[10px] md:text-xs max-h-[180px] overflow-y-auto">
                      {match.playersTeam1 && match.playersTeam1.length > 0 ? (
                        match.playersTeam1.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded border border-slate-200">
                            {editingPlayer?.team === "team1" && editingPlayer?.idx === idx ? (
                              <>
                                <input
                                  autoFocus
                                  type="text"
                                  value={editPlayerValue}
                                  onChange={(e) => setEditPlayerValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleEditPlayer("team1", idx, editPlayerValue);
                                    if (e.key === "Escape") { setEditingPlayer(null); setEditPlayerValue(""); }
                                  }}
                                  className="flex-1 min-w-0 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-900 text-[10px] focus:outline-none focus:border-amber-500"
                                />
                                <button
                                  onClick={() => handleEditPlayer("team1", idx, editPlayerValue)}
                                  className="text-emerald-400 hover:text-emerald-300 font-black text-xs px-1 cursor-pointer flex-shrink-0"
                                  title="Save"
                                >✓</button>
                                <button
                                  onClick={() => { setEditingPlayer(null); setEditPlayerValue(""); }}
                                  className="text-zinc-500 hover:text-zinc-300 font-bold text-xs px-0.5 cursor-pointer flex-shrink-0"
                                  title="Cancel"
                                >✕</button>
                              </>
                            ) : (
                              <>
                                <span className="flex-1 truncate text-[10px] md:text-xs text-slate-800">{p}</span>
                                <button
                                  onClick={() => { setEditingPlayer({ team: "team1", idx }); setEditPlayerValue(p); }}
                                  className="text-amber-400 hover:text-amber-300 font-bold ml-1 text-xs cursor-pointer flex-shrink-0"
                                  title="Edit player name"
                                >✏️</button>
                                <button
                                  onClick={() => handleRemovePlayer("team1", idx)}
                                  className="text-red-400 hover:text-red-300 font-bold ml-0.5 text-sm cursor-pointer flex-shrink-0"
                                  title="Remove player"
                                >×</button>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 text-[10px] md:text-xs py-2">No players added</div>
                      )}
                    </div>
                  )}

                  {/* Team 2 add */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="flex-1 flex gap-1 md:gap-2">
                      <input
                        type="text"
                        value={playerInput2}
                        onChange={(e) => setPlayerInput2(e.target.value)}
                        placeholder={`ADD PLAYER TO ${match.team2Name.toUpperCase()}`}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddPlayer("team2")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2 md:px-3 flex items-center justify-center cursor-pointer text-sm md:text-base"
                      >
                        ➕
                      </button>
                    </div>
                    <button
                      onClick={() => setShowPlayers2(!showPlayers2)}
                      className="bg-slate-200 border border-slate-300 text-slate-800 font-bold text-[9px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-lg whitespace-nowrap hover:bg-slate-300"
                    >
                      {match.team2Name.substring(0, 8).toUpperCase()}... Players ({match.playersTeam2?.length || 0})
                    </button>
                  </div>
                  {showPlayers2 && (
                    <div className="bg-white border border-slate-200 rounded-lg p-2 md:p-3 flex flex-col gap-1.5 text-[10px] md:text-xs max-h-[180px] overflow-y-auto">
                      {match.playersTeam2 && match.playersTeam2.length > 0 ? (
                        match.playersTeam2.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded border border-slate-200">
                            {editingPlayer?.team === "team2" && editingPlayer?.idx === idx ? (
                              <>
                                <input
                                  autoFocus
                                  type="text"
                                  value={editPlayerValue}
                                  onChange={(e) => setEditPlayerValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleEditPlayer("team2", idx, editPlayerValue);
                                    if (e.key === "Escape") { setEditingPlayer(null); setEditPlayerValue(""); }
                                  }}
                                  className="flex-1 min-w-0 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-900 text-[10px] focus:outline-none focus:border-amber-500"
                                />
                                <button
                                  onClick={() => handleEditPlayer("team2", idx, editPlayerValue)}
                                  className="text-emerald-400 hover:text-emerald-300 font-black text-xs px-1 cursor-pointer flex-shrink-0"
                                  title="Save"
                                >✓</button>
                                <button
                                  onClick={() => { setEditingPlayer(null); setEditPlayerValue(""); }}
                                  className="text-zinc-500 hover:text-zinc-300 font-bold text-xs px-0.5 cursor-pointer flex-shrink-0"
                                  title="Cancel"
                                >✕</button>
                              </>
                            ) : (
                              <>
                                <span className="flex-1 truncate text-[10px] md:text-xs text-slate-800">{p}</span>
                                <button
                                  onClick={() => { setEditingPlayer({ team: "team2", idx }); setEditPlayerValue(p); }}
                                  className="text-amber-400 hover:text-amber-300 font-bold ml-1 text-xs cursor-pointer flex-shrink-0"
                                  title="Edit player name"
                                >✏️</button>
                                <button
                                  onClick={() => handleRemovePlayer("team2", idx)}
                                  className="text-red-400 hover:text-red-300 font-bold ml-0.5 text-sm cursor-pointer flex-shrink-0"
                                  title="Remove player"
                                >×</button>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 text-[10px] md:text-xs py-2">No players added</div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Animations Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-wider text-slate-700 uppercase">Animations</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleTriggerAnimation("FOUR")}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  FOUR
                </button>
                <button
                  onClick={() => handleTriggerAnimation("SIX")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  SIX
                </button>
                <button
                  onClick={() => handleTriggerAnimation("WICKET")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  WICKET / OUT
                </button>
                <button
                  onClick={() => handleTriggerAnimation("NOT OUT")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  NOT OUT
                </button>
                <button
                  onClick={() => handleTriggerAnimation("FREE HIT")}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  FREE HIT
                </button>
                <button
                  onClick={() => handleTriggerAnimation("POWERPLAY")}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  POWERPLAY
                </button>
                <button
                  onClick={() => handleTriggerAnimation("HAT-TRICK BALL")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  HAT-TRICK BALL
                </button>
                <button
                  onClick={() => handleTriggerAnimation("TOUR BOUNDARIES")}
                  className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  TOUR BOUNDARIES
                </button>
                <button
                  onClick={() => handleTriggerAnimation("REVIEW")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  DRS REVIEW
                </button>
                <button
                  onClick={() => handleTriggerAnimation(null)}
                  className="px-3.5 py-2 bg-red-800 hover:bg-red-900 rounded-md flex items-center justify-center text-white font-black text-[10px] tracking-wider active:scale-95 transition-all cursor-pointer uppercase shadow-sm"
                  title="STOP animation"
                >
                  🛑 STOP
                </button>
                {/* <button
                  onClick={handleClearAllOverlays}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-md shadow-rose-500/10"
                >
                  CLOSE ALL BANNERS & OVERLAYS ✕
                </button> */}
              </div>
            </div>

            {/* Display Controller Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-wider text-slate-700 uppercase">DISPLAY CONTROLLER</h3>

              {/* ── Prominent Summary & Scorecard Broadcast Buttons ── */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">📡 Live Screen — shows on all scoreboards instantly:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
                  <button
                    onClick={() => handleUpdateDisplayScreen("TOSS")}
                    className={`flex flex-col items-center justify-center gap-1 py-2 md:py-3 rounded-xl text-[9px] md:text-xs font-black tracking-wider transition-all active:scale-95 cursor-pointer border-2 shadow-lg ${scoringState?.displayScreen === "TOSS"
                        ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-emerald-500/20"
                        : "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-500/40 text-white hover:from-emerald-500 hover:to-teal-600 shadow-emerald-500/10"
                      }`}
                  >
                    <span className="text-sm md:text-xl">🪙</span>
                    TOSS / PRE-MATCH
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("SUMMARY")}
                    className={`flex flex-col items-center justify-center gap-1 py-2 md:py-3 rounded-xl text-[9px] md:text-xs font-black tracking-wider transition-all active:scale-95 cursor-pointer border-2 shadow-lg ${scoringState?.displayScreen === "SUMMARY"
                        ? "bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-cyan-500/20"
                        : "bg-gradient-to-br from-cyan-600 to-teal-700 border-cyan-500/40 text-white hover:from-cyan-500 hover:to-teal-600 shadow-cyan-500/10"
                      }`}
                  >
                    <span className="text-sm md:text-xl">📋</span>
                    VIEW SUMMARY
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("FULLSCORE")}
                    className={`flex flex-col items-center justify-center gap-1 py-2 md:py-3 rounded-xl text-[9px] md:text-xs font-black tracking-wider transition-all active:scale-95 cursor-pointer border-2 shadow-lg ${scoringState?.displayScreen === "FULLSCORE"
                        ? "bg-blue-500/30 border-blue-400 text-blue-200 shadow-blue-500/20"
                        : "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500/40 text-white hover:from-blue-500 hover:to-indigo-600 shadow-blue-500/10"
                      }`}
                  >
                    <span className="text-sm md:text-xl">📊</span>
                    VIEW SCORECARD
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("DEFAULT!")}
                    className="flex flex-col items-center justify-center gap-1 py-2 md:py-3 rounded-xl text-[9px] md:text-xs font-black tracking-wider bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-zinc-600/50 text-zinc-200 hover:from-zinc-600 hover:to-zinc-700 transition-all active:scale-95 cursor-pointer shadow-lg"
                  >
                    <span className="text-sm md:text-xl">🏏</span>
                    LIVE SCORE
                  </button>
                </div>
              </div>


              <div className="border-t border-slate-200" />

              {/* Small screen buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "DEFAULT!", color: "bg-blue-600", hover: "hover:bg-blue-700", selected: "bg-blue-400/30 border-blue-400 text-blue-300" },
                  { label: "TOSS", color: "bg-emerald-600", hover: "hover:bg-emerald-700", selected: "bg-emerald-400/30 border-emerald-400 text-emerald-300" },
                  { label: "1BAT", color: "bg-purple-600", hover: "hover:bg-purple-700", selected: "bg-purple-400/30 border-purple-400 text-purple-300" },
                  { label: "1BALL", color: "bg-pink-600", hover: "hover:bg-pink-700", selected: "bg-pink-400/30 border-pink-400 text-pink-300" },
                  { label: "2BAT", color: "bg-indigo-600", hover: "hover:bg-indigo-700", selected: "bg-indigo-400/30 border-indigo-400 text-indigo-300" },
                  { label: "2BALL", color: "bg-rose-600", hover: "hover:bg-rose-700", selected: "bg-rose-400/30 border-rose-400 text-rose-300" },
                  { label: "SUMMARY", color: "bg-cyan-600", hover: "hover:bg-cyan-700", selected: "bg-cyan-400/30 border-cyan-400 text-cyan-300" },
                  { label: "FULLSCORE", color: "bg-blue-600", hover: "hover:bg-blue-700", selected: "bg-blue-400/30 border-blue-400 text-blue-300" },
                  { label: "FOW", color: "bg-teal-600", hover: "hover:bg-teal-700", selected: "bg-teal-400/30 border-teal-400 text-teal-300" },
                  { label: "B1M", color: "bg-emerald-600", hover: "hover:bg-emerald-700", selected: "bg-emerald-400/30 border-emerald-400 text-emerald-300" },
                  { label: "B2M", color: "bg-green-600", hover: "hover:bg-green-700", selected: "bg-green-400/30 border-green-400 text-green-300" },
                  { label: "BOWLER", color: "bg-lime-600", hover: "hover:bg-lime-700", selected: "bg-lime-400/30 border-lime-400 text-lime-300" },
                  { label: "TARGET", color: "bg-orange-600", hover: "hover:bg-orange-700", selected: "bg-orange-400/30 border-orange-400 text-orange-300" },
                  { label: "PARTNERSHIP", color: "bg-amber-600", hover: "hover:bg-amber-700", selected: "bg-amber-400/30 border-amber-400 text-amber-300" },
                  { label: "TEAM 1", color: "bg-violet-600", hover: "hover:bg-violet-700", selected: "bg-violet-400/30 border-violet-400 text-violet-300" },
                  { label: "TEAM 2", color: "bg-fuchsia-600", hover: "hover:bg-fuchsia-700", selected: "bg-fuchsia-400/30 border-fuchsia-400 text-fuchsia-300" },
                  { label: "TEAMS PLAYERS", color: "bg-purple-600", hover: "hover:bg-purple-700", selected: "bg-purple-400/30 border-purple-400 text-purple-300" },
                  { label: "TOUR", color: "bg-fuchsia-600", hover: "hover:bg-fuchsia-700", selected: "bg-fuchsia-400/30 border-fuchsia-400 text-fuchsia-300" },
                ].map((screen) => (
                  <button
                    key={screen.label}
                    onClick={() => handleUpdateDisplayScreen(screen.label)}
                    className={`px-3 py-2 text-[10px] font-black tracking-wider rounded-lg active:scale-95 border transition-all cursor-pointer ${scoringState?.displayScreen === screen.label
                      ? screen.selected
                      : `${screen.color} ${screen.hover} border-zinc-700/50 text-white`
                      }`}
                  >
                    {screen.label === "FULLSCORE" ? "SCORECARD" : screen.label}
                  </button>
                ))}
              </div>
            </div>


            {/* Umpire Decision Controller Row */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-xs font-black tracking-wider text-slate-800 uppercase">Decision :</span>
              <button
                onClick={() => handleSetDecision("PENDING")}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold active:scale-95 transition-all cursor-pointer ${scoringState?.decision === "PENDING"
                  ? "bg-[#ffcc00] text-black ring-2 ring-amber-400"
                  : "bg-[#ffcc00] hover:bg-amber-500 text-black font-semibold"
                  }`}
              >
                PENDING
              </button>
              <button
                onClick={() => handleSetDecision("OUT")}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold active:scale-95 transition-all cursor-pointer ${scoringState?.decision === "OUT"
                  ? "bg-red-600 text-white ring-2 ring-red-500"
                  : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
              >
                OUT
              </button>
              <button
                onClick={() => handleSetDecision("NOT OUT")}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold active:scale-95 transition-all cursor-pointer ${scoringState?.decision === "NOT OUT"
                  ? "bg-emerald-600 text-white ring-2 ring-emerald-500"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
              >
                NOT OUT
              </button>
              {scoringState?.decision && (
                <button
                  onClick={() => handleSetDecision(null)}
                  className="text-[10px] md:text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>


            {/* Custom Input Display */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-black tracking-wider text-slate-700 uppercase min-w-[120px]">Custom Input :</span>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Custom Input (use - for split text to next line)"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSendCustomInput}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Display Input
              </button>
              <button
                onClick={() => {
                  setCustomText("");
                  if (scoringState) {
                    const updated = { ...scoringState, customInputText: "" };
                    setScoringState(updated);
                    saveScoringState(updated);
                  }
                  showToast("Custom input cleared.");
                }}
                className="bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Default / Off
              </button>
            </div>

            {/* Select MOM Player */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-black tracking-wider text-slate-700 uppercase min-w-[120px]">Select MOM Player:</span>
              <select
                value={selectedMom}
                onChange={(e) => setSelectedMom(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
              >
                <option value="">Select MOM Player</option>
                {[...(match.playersTeam1 || []), ...(match.playersTeam2 || [])].map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDisplayMom}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Display MOM
              </button>
              <button
                onClick={() => {
                  setSelectedMom("");
                  if (scoringState) {
                    const updated = { ...scoringState, momPlayer: "" };
                    setScoringState(updated);
                    saveScoringState(updated);
                  }
                  showToast("MOM display cleared.");
                }}
                className="bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Default / Off
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMom(match.team1Name + " MVP");
                    showToast("Selected Team 1 MVP");
                  }}
                  className="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                >
                  MVP_M1
                </button>
                <button
                  onClick={() => {
                    setSelectedMom(match.team2Name + " MVP");
                    showToast("Selected Team 2 MVP");
                  }}
                  className="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                >
                  MVP_M2
                </button>
              </div>
            </div>

            {/* Tournament Stats Player */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-black tracking-wider text-slate-700 uppercase min-w-[150px]">Tournament Stats Player:</span>
              <select
                value={selectedStatsPlayer}
                onChange={(e) => setSelectedStatsPlayer(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
              >
                <option value="">Select Player</option>
                {[...(match.playersTeam1 || []), ...(match.playersTeam2 || [])].map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDisplayPlayerStats}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Display Player Stats
              </button>
              <button
                onClick={() => {
                  setSelectedStatsPlayer("");
                  if (scoringState) {
                    const updated = { ...scoringState, tournamentStatsPlayer: "" };
                    setScoringState(updated);
                    saveScoringState(updated);
                  }
                  showToast("Player stats display cleared.");
                }}
                className="bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Default / Off
              </button>
            </div>

            {/* Tour Stats Controller */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase">
                TOUR STATS CONTROLLER <span className="text-red-600 font-bold">(ONLY FOR THEME 10 to 15)</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  "POINTS TABLE",
                  "PT (TIED POINT +1)",
                  "TOP BATTERS",
                  "TOP BOWLERS",
                  "TOP 4/6 STRIKERS",
                  "TOP PLAYER OF SERIES",
                ].map((mode) => {
                  const isActive = scoringState?.displayScreen === mode || scoringState?.displayStatsMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleTourStatsController(mode)}
                      className={`px-4 py-2 text-black font-black text-[10px] tracking-wider rounded-lg active:scale-95 transition-all cursor-pointer ${isActive
                          ? "bg-amber-400 ring-2 ring-amber-500 shadow-lg shadow-amber-500/20 scale-105"
                          : "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-orange-500/5"
                        }`}
                    >
                      {mode}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleTourStatsController(null)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-[10px] tracking-wider rounded-lg active:scale-95 shadow-md shadow-rose-500/10 cursor-pointer uppercase"
                >
                  DEFAULT / OFF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Spectator read-only info section ─────────────────────────────── */}
        {!isOwner && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm text-center flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              LIVE SPECTATOR VIEW
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This scoreboard is viewing in live spectator mode. Roster additions, ball outcomes, and display triggers will synchronize automatically in real-time as the match referee scores the game.
            </p>
          </div>
        )}
      </main>

      {/* ── Start Innings Modal (Image 2) ─────────────────────────────── */}
      {showStartInningsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setShowStartInningsModal(false)} />

          {/* Dialog Body */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800">
            <div className="p-7 flex flex-col gap-5">
              {/* Batting Team Header */}
              <div className="text-center">
                <h3 className="text-amber-600 font-extrabold text-xl tracking-wider font-space">
                  {currentBattingTeamLabel || "Batting Team"}
                </h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black mt-1">Striker Setup</p>
              </div>

              {/* Form Input fields */}
              <div className="flex flex-col gap-4">
                {/* Striker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">Striker</label>
                  <input
                    type="text"
                    value={strikerInput}
                    onChange={(e) => setStrikerInput(e.target.value)}
                    placeholder="Enter Striker"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-400"
                  />
                  {/* Suggestions list from added players */}
                  {battingRoster && battingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {battingRoster
                        .filter((p) => {
                          const matchesSearch = strikerInput.trim() === "" || p.toLowerCase().includes(strikerInput.toLowerCase().trim());
                          const notSelectedInOther = nonStrikerInput.trim() === "" || p.toLowerCase() !== nonStrikerInput.toLowerCase().trim();
                          return matchesSearch && notSelectedInOther;
                        })
                        .map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setStrikerInput(p)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] rounded text-slate-700 cursor-pointer font-bold"
                          >
                            {p}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Non-Striker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">Non-Striker</label>
                  <input
                    type="text"
                    value={nonStrikerInput}
                    onChange={(e) => setNonStrikerInput(e.target.value)}
                    placeholder="Enter Non-Striker"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-400"
                  />
                  {battingRoster && battingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {battingRoster
                        .filter((p) => {
                          const matchesSearch = nonStrikerInput.trim() === "" || p.toLowerCase().includes(nonStrikerInput.toLowerCase().trim());
                          const notSelectedInOther = strikerInput.trim() === "" || p.toLowerCase() !== strikerInput.toLowerCase().trim();
                          return matchesSearch && notSelectedInOther;
                        })
                        .map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setNonStrikerInput(p)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] rounded text-slate-700 cursor-pointer font-bold"
                          >
                            {p}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Bowling Team Header */}
                <div className="text-center pt-2 border-t border-slate-200">
                  <h3 className="text-blue-600 font-extrabold text-lg tracking-wider font-space">
                    {currentBowlingTeamLabel || "Bowling Team"}
                  </h3>
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black mt-1">Bowler Setup</p>
                </div>

                {/* Bowler */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">Bowler</label>
                  <input
                    type="text"
                    value={bowlerInput}
                    onChange={(e) => setBowlerInput(e.target.value)}
                    placeholder="Enter Bowler"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-400"
                  />
                  {bowlingRoster && bowlingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {bowlingRoster
                        .filter((p) => bowlerInput.trim() === "" || p.toLowerCase().includes(bowlerInput.toLowerCase().trim()))
                        .map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setBowlerInput(p)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] rounded text-slate-700 cursor-pointer font-bold"
                          >
                            {p}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Action buttons (Image 2) */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleStartInningsSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-lg text-sm transition-all cursor-pointer"
                >
                  Start Innings
                </button>
                <button
                  onClick={() => setShowStartInningsModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-extrabold rounded-lg text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dismissal / Wicket replacement modal ─────────────────────── */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => { setShowWicketModal(false); setWicketRuns(0); resetScoringCheckboxes(); }} />
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-1 bg-red-500 w-full" />
            <div className="p-7 flex flex-col gap-4 text-center">
              <div>
                <h3 className="text-lg font-black tracking-wider text-red-600">Batsman Out!</h3>
                <p className="text-xs text-slate-500 mt-1">Select dismissal details and replacement</p>
                {/* Show active modifiers badge */}
                {(wicketRuns > 0 || isNoBall || isWide || isByes || isLegByes) && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 rounded-full px-3 py-1 text-xs font-black flex-wrap justify-center">
                    <span className="text-red-600 font-black">WICKET</span>
                    {isNoBall && <span className="bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">+ No Ball</span>}
                    {isWide && <span className="bg-orange-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">+ Wide</span>}
                    {isByes && <span className="bg-purple-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">+ Byes</span>}
                    {isLegByes && <span className="bg-purple-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">+ Leg Byes</span>}
                    {wicketRuns > 0 && <span className="bg-emerald-600 text-white rounded-full px-1.5 py-0.5 text-[10px]">+ {wicketRuns} run{wicketRuns !== 1 ? "s" : ""}</span>}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Dismissed Batsman</label>
                  <select
                    value={dismissedBatsman}
                    onChange={(e) => setDismissedBatsman(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold"
                  >
                    <option value={scoringState?.striker}>{scoringState?.striker} (Striker)</option>
                    <option value={scoringState?.nonStriker}>{scoringState?.nonStriker} (Non-Striker)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Wicket Type</label>
                  <select
                    value={wicketType}
                    onChange={(e) => setWicketType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold"
                  >
                    <option value="Bowled">Bowled</option>
                    <option value="Caught">Caught</option>
                    <option value="LBW">LBW</option>
                    <option value="Run Out">Run Out</option>
                    <option value="Stumped">Stumped</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">New Batsman Name</label>
                  <input
                    type="text"
                    value={newBatsmanInput}
                    onChange={(e) => setNewBatsmanInput(e.target.value)}
                    placeholder="Enter New Batsman name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  {battingRoster && battingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {battingRoster
                        .filter((p) => {
                          const matchesSearch = newBatsmanInput.trim() === "" || p.toLowerCase().includes(newBatsmanInput.toLowerCase().trim());
                          const isStriker = p.toLowerCase() === scoringState?.striker?.toLowerCase();
                          const isNonStriker = p.toLowerCase() === scoringState?.nonStriker?.toLowerCase();
                          const isAlreadyOut = scoringState?.batsmen?.some(b => b.name.toLowerCase() === p.toLowerCase() && b.out);
                          return matchesSearch && !isStriker && !isNonStriker && !isAlreadyOut;
                        })
                        .map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setNewBatsmanInput(p)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] rounded text-slate-700 cursor-pointer font-bold"
                          >
                            {p}
                          </button>
                        ))}
                    </div>
                  )}

                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleWicketSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-2 rounded-lg text-xs cursor-pointer"
                >
                  Confirm Out
                </button>
                <button
                  onClick={() => { setShowWicketModal(false); setWicketRuns(0); resetScoringCheckboxes(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-extrabold rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Bowler Modal (shows after every over completes) ──────── */}
      {showNewBowlerModal && scoringState && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewBowlerModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-center">
              <h3 className="text-lg font-black tracking-wider font-space uppercase text-white">🏏 Select New Bowler</h3>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Over Complete — Pick next bowler
              </p>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Bowling team label */}
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">
                {currentBowlingTeamLabel} Bowling
              </p>

              {/* Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">Bowler Name</label>
                <input
                  type="text"
                  value={newBowlerInput}
                  onChange={(e) => setNewBowlerInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleNewBowlerSubmit(); }}
                  placeholder="Type or select bowler"
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-400"
                />
              </div>

              {/* Quick-pick from bowling roster */}
              {bowlingRoster && bowlingRoster.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    Quick Pick — {currentBowlingTeamLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto">
                    {bowlingRoster
                      .filter((p) => {
                        const matchesSearch = newBowlerInput.trim() === "" || p.toLowerCase().includes(newBowlerInput.toLowerCase().trim());
                        return matchesSearch && p.toLowerCase() !== newBowlerInput.toLowerCase();
                      })
                      .map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setNewBowlerInput(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${scoringState.bowlers.some((bw) => bw.name.toLowerCase() === p.toLowerCase())
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                            }`}
                        >
                          {p}
                          {scoringState.bowlers.some((bw) => bw.name.toLowerCase() === p.toLowerCase()) && (
                            <span className="ml-1 opacity-60 text-[8px]">prev</span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}


              {/* Action buttons */}
              <div className="flex gap-3 mt-1">
                <button
                  onClick={handleNewBowlerSubmit}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl text-sm tracking-wider active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  ✓ Confirm Bowler
                </button>
                <button
                  onClick={() => setShowNewBowlerModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm active:scale-95 transition-all cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Retire Batter Modal ──────── */}
      {showRetireModal && scoringState && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRetireModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-center">
              <h3 className="text-lg font-black tracking-wider font-space uppercase text-white">🔄 Retire Batter</h3>
              <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Select batter to retire & enter replacement
              </p>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Select Batter to Retire */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">Select Batter to Retire</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRetireTarget("1")}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${retireTarget === "1"
                        ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/25"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    <span className="block text-[9px] uppercase opacity-75">Striker</span>
                    <span className="truncate block mt-0.5">{scoringState.striker}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRetireTarget("2")}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${retireTarget === "2"
                        ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/25"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    <span className="block text-[9px] uppercase opacity-75">Non-Striker</span>
                    <span className="truncate block mt-0.5">{scoringState.nonStriker}</span>
                  </button>
                </div>
              </div>

              {/* Input for New Batsman */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">New Batsman Name</label>
                <input
                  type="text"
                  value={retireNewBatsmanInput}
                  onChange={(e) => setRetireNewBatsmanInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRetireBatterSubmit(); }}
                  placeholder="Type or select new batsman"
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-400"
                />
              </div>

              {/* Quick-pick from batting roster */}
              {battingRoster && battingRoster.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                    Quick Pick — {scoringState.battingTeam === "team1" ? match.team1Name : match.team2Name}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto">
                    {battingRoster
                      .filter((p) => {
                        const matchesSearch = retireNewBatsmanInput.trim() === "" || p.toLowerCase().includes(retireNewBatsmanInput.toLowerCase().trim());
                        const isStriker = p.toLowerCase() === scoringState.striker.toLowerCase();
                        const isNonStriker = p.toLowerCase() === scoringState.nonStriker.toLowerCase();
                        const isAlreadyOut = scoringState.batsmen?.some(b => b.name.toLowerCase() === p.toLowerCase() && b.out);
                        return matchesSearch && !isStriker && !isNonStriker && !isAlreadyOut && p.toLowerCase() !== retireNewBatsmanInput.toLowerCase();
                      })
                      .map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRetireNewBatsmanInput(p)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800 transition-all cursor-pointer"
                        >
                          {p}
                        </button>
                      ))}
                  </div>
                </div>
              )}


              {/* Action buttons */}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={handleRetireBatterSubmit}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 rounded-xl text-sm tracking-wider active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  ✓ Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowRetireModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Runs Modal ──────── */}
      {showCustomRunsModal && scoringState && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCustomRunsModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-center">
              <h3 className="text-lg font-black tracking-wider font-space uppercase text-white">➕ Custom Byes</h3>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Add runs directly to scoreboard (does not count as ball)
              </p>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Input for Custom Runs */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">Enter Runs</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customRunsInput}
                  onChange={(e) => setCustomRunsInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCustomRunsSubmit(); }}
                  placeholder="e.g. 4"
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-400"
                />
              </div>

              {/* Quick-pick number pad */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  Quick Pick
                </span>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCustomRunsInput(num.toString())}
                      className="flex-1 min-w-[40px] py-2 rounded-lg text-xs font-bold border bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800 transition-all cursor-pointer text-center"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={handleCustomRunsSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-sm tracking-wider active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  ✓ Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomRunsModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Toss Modal ──────────────────────────────────────────────── */}
      {showChangeTossModal && match && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm tracking-wider uppercase font-space flex items-center gap-2">
                  <span>🪙</span> UPDATE MATCH TOSS
                </h3>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  Select which team won the toss and their decision
                </p>
              </div>
              <button
                onClick={() => setShowChangeTossModal(false)}
                className="text-white/80 hover:text-white font-bold text-xl leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Toss Winner Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Toss Won By
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTossWonByInput("team1")}
                    className={`p-3.5 rounded-xl border text-xs font-black transition-all cursor-pointer text-center ${tossWonByInput === "team1"
                        ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    <span className="block text-[10px] uppercase opacity-75">Team 1</span>
                    <span className="truncate block mt-1 text-sm">{match.team1Name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTossWonByInput("team2")}
                    className={`p-3.5 rounded-xl border text-xs font-black transition-all cursor-pointer text-center ${tossWonByInput === "team2"
                        ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    <span className="block text-[10px] uppercase opacity-75">Team 2</span>
                    <span className="truncate block mt-1 text-sm">{match.team2Name}</span>
                  </button>
                </div>
              </div>

              {/* Opted To Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Elected To
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOptedToInput("Bat")}
                    className={`py-3 px-4 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${optedToInput === "Bat"
                        ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    <span>🏏</span>
                    <span>BAT FIRST</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptedToInput("Bowl")}
                    className={`py-3 px-4 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${optedToInput === "Bowl"
                        ? "bg-cyan-600 border-cyan-700 text-white shadow-md shadow-cyan-600/25 ring-2 ring-cyan-400/40"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    <span>⚾</span>
                    <span>BOWL FIRST</span>
                  </button>
                </div>
              </div>

              {/* Preview Banner */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mb-0.5">Scoreboard Toss Preview</span>
                <span className="text-xs font-black text-slate-800 uppercase">
                  {(tossWonByInput === "team1" ? match.team1Name : match.team2Name).toUpperCase()} WON THE TOSS AND ELECTED TO {optedToInput.toUpperCase()}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={handleChangeTossSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-sm tracking-wider active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  ✓ Save Toss
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangeTossModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ScoreboardLinksModal
        isOpen={showScoreboardLinks}
        onClose={() => setShowScoreboardLinks(false)}
        matchId={matchId}
        showToast={showToast}
        userEmail={session?.user?.email || ""}
      />

      <Footer />
    </div>
  );
}
