"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
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

  // Start Innings Modal
  const [showStartInningsModal, setShowStartInningsModal] = useState(false);
  const [strikerInput, setStrikerInput] = useState("");
  const [nonStrikerInput, setNonStrikerInput] = useState("");
  const [bowlerInput, setBowlerInput] = useState("");

  // New Bowler Modal
  const [showNewBowlerModal, setShowNewBowlerModal] = useState(false);
  const [newBowlerInput, setNewBowlerInput] = useState("");

  // Dismissal Modal
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState<"Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped">("Bowled");
  const [dismissedBatsman, setDismissedBatsman] = useState("");
  const [newBatsmanInput, setNewBatsmanInput] = useState("");

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
    if (scoringState?.animation && scoringState.animation !== "INNINGS BREAK" && scoringState.animation !== "TOUR BOUNDARIES") {
      const timer = setTimeout(() => {
        setScoringState((prev) => {
          if (!prev) return null;
          const updated = { ...prev, animation: null };
          saveScoringState(updated);
          return updated;
        });
      }, 4000);
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
      history: [],
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
    type: "runs" | "wide" | "noball" | "widenoball" | "wicket" | "bye" | "legbye",
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
      updatedThisOver.push("Wd");
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

      updatedThisOver.push("Nb");
      anim = "FREE HIT";
    } else if (type === "widenoball") {
      // Wide + No Ball: 2 extras (1 wide + 1 noball), ball does NOT count
      currentScore += 2 + runsVal;
      updatedBowlers[bowlerIdx].runsConceded += 2 + runsVal;
      updatedThisOver.push("WNb");
      anim = "FREE HIT";
    } else if (type === "bye" || type === "legbye") {
      currentScore += runsVal;
      // Runs go to extras, not to batsman, but batsman faces ball
      updatedBatsmen[strikerIdx].balls += 1;
      // Bowler does not concede these as earned runs in some formats, but gets the ball count
      updatedBowlers[bowlerIdx].ballsBowled += 1;
      currentBalls += 1;
      updatedThisOver.push(`${runsVal}B`);

      if (runsVal % 2 !== 0) {
        activeStrikerName = scoringState.nonStriker;
        activeNonStrikerName = scoringState.striker;
      }
    } else if (type === "wicket") {
      currentWickets += 1;
      anim = "WICKET";

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
      updatedThisOver.push("W");

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

      // Pre-add new batsman stats
      getOrAddBatsman(wicketNewBatsmanName);
    }

    // Check if over completed
    let isOverEnd = false;
    if (type !== "wide" && type !== "noball" && type !== "widenoball") {
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
        history: [],
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
      openWicketModal();
      resetScoringCheckboxes();
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
        history: [],
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
    recordBall("wicket", 0, dismissedBatsman, newBatsmanInput.trim());
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
    const updated = { ...scoringState, displayScreen: screenName };
    setScoringState(updated);
    saveScoringState(updated);
    showToast(`Display screen updated: ${screenName.toUpperCase()}`);
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
    const updated = { ...scoringState, displayStatsMode: mode };
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0c0f4f] via-[#05072c] to-[#02041c] text-white relative overflow-hidden" suppressHydrationWarning={true}>
        {/* Hex mesh */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="hex-grid-load-m" width="45" height="77.942" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
                <path d="M 45 0 L 22.5 12.99 M 22.5 12.99 L 0 0 M 0 0 L 0 25.98 M 0 25.98 L 22.5 38.97 M 22.5 38.97 L 45 25.98 M 45 25.98 L 45 0 M 0 38.97 L 22.5 51.96 M 22.5 51.96 L 0 64.95 M 0 64.95 L 0 90.93 M 0 90.93 L 22.5 103.92 M 22.5 103.92 L 45 90.93 M 45 90.93 L 45 64.95 L 22.5 51.96" fill="none" stroke="#2d359c" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-grid-load-m)" />
          </svg>
        </div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/15 blur-[130px] pointer-events-none" />
        <div className="flex flex-col items-center gap-3 relative z-10" suppressHydrationWarning={true}>
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" suppressHydrationWarning={true} />
          <p className="text-zinc-400 font-semibold tracking-wider font-space" suppressHydrationWarning={true}>LOADING MATCH SCOREBOARD...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !match) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#0c0f4f] via-[#05072c] to-[#02041c] text-white relative overflow-hidden">
        {/* Hex mesh */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="hex-grid-err-m" width="45" height="77.942" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
                <path d="M 45 0 L 22.5 12.99 M 22.5 12.99 L 0 0 M 0 0 L 0 25.98 M 0 25.98 L 22.5 38.97 M 22.5 38.97 L 45 25.98 M 45 25.98 L 45 0 M 0 38.97 L 22.5 51.96 M 22.5 51.96 L 0 64.95 M 0 64.95 L 0 90.93 M 0 90.93 L 22.5 103.92 M 22.5 103.92 L 45 90.93 M 45 90.93 L 45 64.95 L 22.5 51.96" fill="none" stroke="#2d359c" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-grid-err-m)" />
          </svg>
        </div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/15 blur-[130px] pointer-events-none" />
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl font-bold font-space">{error || "Match not found"}</p>
          <Link href="/tournaments" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-bold transition-all">
            Back to Tournaments
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine current active team batting/bowling labels
  const currentBattingTeamLabel =
    scoringState?.battingTeam === "team1" ? match.team1Name : match.team2Name;
  const currentBowlingTeamLabel =
    scoringState?.battingTeam === "team1" ? match.team2Name : match.team1Name;

  // Roster lists for suggestions
  const battingRoster = scoringState?.battingTeam === "team1" ? match.playersTeam1 : match.playersTeam2;
  const bowlingRoster = scoringState?.battingTeam === "team1" ? match.playersTeam2 : match.playersTeam1;

  // Active batsman stats
  const activeStrikerStats = scoringState?.batsmen.find((b) => b.name === scoringState.striker);
  const activeNonStrikerStats = scoringState?.batsmen.find((b) => b.name === scoringState.nonStriker);
  const activeBowlerStats = scoringState?.bowlers.find((bw) => bw.name === scoringState.bowler);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0c0f4f] via-[#05072c] to-[#02041c] text-white select-none relative overflow-hidden font-sans">
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
          background: rgba(12, 15, 79, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          color: #fff !important;
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
          color: #fff !important;
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
      {/* Hexagonal Mesh Overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="hex-grid-ctrl" width="45" height="77.942" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
              <path d="M 45 0 L 22.5 12.99 M 22.5 12.99 L 0 0 M 0 0 L 0 25.98 M 0 25.98 L 22.5 38.97 M 22.5 38.97 L 45 25.98 M 45 25.98 L 45 0 M 0 38.97 L 22.5 51.96 M 22.5 51.96 L 0 64.95 M 0 64.95 L 0 90.93 M 0 90.93 L 22.5 103.92 M 22.5 103.92 L 45 90.93 M 45 90.93 L 45 64.95 L 22.5 51.96" fill="none" stroke="#2d359c" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex-grid-ctrl)" />
        </svg>
      </div>
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/15 blur-[130px] pointer-events-none" />

      <Header />


      <main className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 md:px-6 z-10 flex flex-col gap-6">
        {/* ── Breadcrumb & Links ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Link href={`/tournaments/${match.tournamentId}`} className="hover:text-amber-400 transition-colors">
              Tournament Details
            </Link>
            <span>/</span>
            <span className="text-zinc-300 font-bold">Match Scoreboard</span>
          </div>
          <button
            onClick={() => setShowScoreboardLinks(true)}
            id="scoreboard-links"
            className="text-cyan-400 hover:text-cyan-300 underline font-bold tracking-wider bg-transparent border-none cursor-pointer text-xs uppercase"
          >
            SCOREBOARD LINKS
          </button>
        </div>

        {/* ── Team VS Banner (Matching Image 1) ─────────────────────────── */}
        <div className="flex items-center justify-center py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg border border-cyan-400/30">
          <h2 className="text-2xl md:text-3xl font-black tracking-widest text-white text-center font-space">
            {match.team1Name.toUpperCase()} <span className="text-zinc-200 text-lg md:text-xl font-medium mx-4">VS</span> {match.team2Name.toUpperCase()}
          </h2>
        </div>

        {/* ── SEND Button (Top Center, Image 1) ─────────────────────────── */}
        {isOwner && (
          <div className="flex justify-center -mt-2">
            <button
              onClick={() => {
                saveScoringState(scoringState);
                showToast("Score state saved and broadcasted!");
              }}
              className="bg-[#ffcc00] hover:bg-amber-400 text-black font-black text-xs tracking-wider px-6 py-1.5 rounded-md active:scale-95 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              SEND
            </button>
          </div>
        )}

        {/* ── Score Board Display (Image 3) ─────────────────────────────── */}
        {scoringState && scoringState.inningsStarted ? (
          <div className="flex flex-col gap-3">
            {/* VS Title banner inside scoreboard */}
            <div className="text-center font-black text-sm text-zinc-400 tracking-wider">
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
              <div className="bg-[#0b0c20]/90 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-center min-h-[120px] shadow-lg">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      {scoringState.striker || "Striker"}
                    </span>
                    <span className="font-bold text-zinc-300">
                      {activeStrikerStats?.runs || 0}{" "}
                      <span className="text-xs text-zinc-500 font-medium font-mono">({activeStrikerStats?.balls || 0})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-zinc-400">
                    <span className="font-bold pl-4">{scoringState.nonStriker || "Non-Striker"}</span>
                    <span className="font-semibold">
                      {activeNonStrikerStats?.runs || 0}{" "}
                      <span className="text-xs text-zinc-600 font-medium font-mono">({activeNonStrikerStats?.balls || 0})</span>
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
                    // Each NB / WD / WNb is a free ball → adds +1 extra circle slot
                    const extrasCount = thisOver.filter(
                      (b) => b && (b === "Nb" || b === "WNb" || b === "Wd")
                    ).length;
                    const totalCirclesCount = ballsPerOver + extrasCount;
                    return Array.from({ length: totalCirclesCount }).map((_, idx) => {
                      const outcome = thisOver[idx];
                      let bgClass = "bg-white/20 border border-white/10"; // empty slot
                      if (outcome) {
                        if (outcome === "W") bgClass = "bg-red-600 text-white border border-red-500";
                        else if (outcome === "6" || outcome === "4") bgClass = "bg-amber-500 text-black";
                        else if (outcome === "Nb") bgClass = "bg-blue-500 text-white";
                        else if (outcome === "WNb") bgClass = "bg-purple-500 text-white";
                        else if (outcome === "Wd") bgClass = "bg-orange-600 text-white";
                        else bgClass = "bg-white text-zinc-800";
                      }
                      return (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${bgClass}`}
                        >
                          {outcome || ""}
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
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-[#0b0c20]/60 gap-4">
            <span className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center border border-zinc-700/60">🏏</span>
            <div className="text-center">
              <p className="font-extrabold text-sm tracking-wider font-space">INNINGS NOT STARTED</p>
              <p className="text-xs text-zinc-500 mt-1">Setup teams and click Start 1st Innings to initialize scoreboard</p>
            </div>
            {isOwner && (
              <button
                onClick={openStartInnings}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg text-xs font-bold transition-all"
              >
                START 1ST INNINGS
              </button>
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
            if (!inn) return <p className="text-xs text-zinc-500 italic">No data for innings {innNo}.</p>;
            return (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                  <span className="font-black text-sm text-emerald-300 uppercase tracking-wider">INN {innNo} — {batTeam}</span>
                  <span className="font-black text-lg text-white">{inn.score}/{inn.wickets} <span className="text-xs text-zinc-400 font-medium">({fmtOv(inn.balls)}/{match.overs} Ov)</span></span>
                </div>
                {/* Batting */}
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-2">🏏 Batting</h4>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-700/60">
                        {["Batsman", "R", "B", "4s", "6s", "SR"].map(h => <th key={h} className="py-1.5 px-2 text-left text-[10px] font-black text-zinc-500 uppercase tracking-wider">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(inn.batsmen || []).map((b: any, i: number) => (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="py-2 px-2 font-bold text-white">{b.name}{b.out ? <span className="ml-2 text-[9px] text-red-400 font-black">OUT</span> : <span className="ml-2 text-[9px] text-green-400 font-black">N/O</span>}</td>
                          <td className="py-2 px-2 font-black text-amber-300">{b.runs}</td>
                          <td className="py-2 px-2 text-zinc-400">{b.balls}</td>
                          <td className="py-2 px-2 text-yellow-400 font-bold">{b.fours}</td>
                          <td className="py-2 px-2 text-sky-400 font-bold">{b.sixes}</td>
                          <td className="py-2 px-2 text-zinc-300">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Bowling */}
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-2">🎯 Bowling — {bowlTeam}</h4>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-700/60">
                        {["Bowler", "O", "R", "W", "Eco"].map(h => <th key={h} className="py-1.5 px-2 text-left text-[10px] font-black text-zinc-500 uppercase tracking-wider">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(inn.bowlers || []).map((bw: any, i: number) => {
                        const eco = bw.ballsBowled > 0 ? ((bw.runsConceded / bw.ballsBowled) * (match.ballsPerOver || 6)).toFixed(2) : "0.00";
                        return (
                          <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                            <td className="py-2 px-2 font-bold text-white">{bw.name}</td>
                            <td className="py-2 px-2 text-zinc-400">{fmtOv(bw.ballsBowled)}</td>
                            <td className="py-2 px-2 text-zinc-300">{bw.runsConceded}</td>
                            <td className="py-2 px-2 font-black text-red-400">{bw.wickets}</td>
                            <td className="py-2 px-2 text-zinc-300">{eco}</td>
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
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 border border-amber-500/40 rounded-2xl p-5 text-center shadow-lg shadow-amber-500/10">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-xs font-black tracking-widest text-amber-400 uppercase mb-1">Match Completed</div>
                <div className="text-xl font-black text-white tracking-wide">{winnerText}</div>
                <div className="flex items-center justify-center gap-6 mt-3 text-sm text-zinc-300">
                  {inn1 && <span className="font-bold">{bat1Team}: <span className="text-amber-300 font-black">{inn1.score}/{inn1.wickets}</span> ({fmtOv(inn1.balls)})</span>}
                  <span className="text-zinc-600">|</span>
                  <span className="font-bold">{bat2Team}: <span className="text-amber-300 font-black">{inn2.score}/{inn2.wickets}</span> ({fmtOv(inn2.balls)})</span>
                </div>
              </div>

              {/* Summary & Download button */}
              <div className="flex flex-col gap-4 bg-[#0a0c2c] border border-zinc-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 flex-wrap gap-2">
                  <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">📋 Export Match Reports</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">PDF Theme Style:</span>
                    <select
                      value={selectedPdfTheme}
                      onChange={(e) => setSelectedPdfTheme(e.target.value)}
                      className="bg-[#121542] border border-zinc-700/60 rounded px-2 py-1 text-xs text-white cursor-pointer focus:outline-none font-bold"
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
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer border border-zinc-700 uppercase"
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
              <div id="match-scorecard-print" className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
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
            <div className="relative w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/10" style={{ background: "linear-gradient(to bottom, #ca32e6 0%, #357ef7 55%, #05ccd9 100%)" }}>
              {/* Colored top header block */}
              <div className="pt-6 pb-2 flex flex-col items-center justify-center">
                <h3 className="text-3xl font-black tracking-wider text-black font-sans uppercase">Controller</h3>
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
                      const target = prompt("Type '1' to retire Striker (" + scoringState.striker + ") or '2' to retire Non-Striker (" + scoringState.nonStriker + "):");
                      if (target !== "1" && target !== "2") return;
                      const newName = prompt("Enter new batsman name:");
                      if (!newName || !newName.trim()) return;

                      const updatedBatsmen = scoringState.batsmen.map(b => ({ ...b }));
                      const activeStriker = scoringState.striker;
                      const activeNonStriker = scoringState.nonStriker;
                      let retiredName = target === "1" ? activeStriker : activeNonStriker;

                      const retIdx = updatedBatsmen.findIndex(b => b.name.toLowerCase() === retiredName.toLowerCase());
                      if (retIdx !== -1) updatedBatsmen[retIdx].out = true;

                      const newIdx = updatedBatsmen.findIndex(b => b.name.toLowerCase() === newName.trim().toLowerCase());
                      if (newIdx === -1) {
                        updatedBatsmen.push({ name: newName.trim(), runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
                      }

                      // Check if new batsman is in team roster, and if not, add it
                      const team = scoringState.battingTeam;
                      let updatedT1 = match.playersTeam1 || [];
                      let updatedT2 = match.playersTeam2 || [];
                      let t1Changed = false;
                      let t2Changed = false;
                      const bName = newName.trim();
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

                      const { history: _, ...stateWithoutHistory } = scoringState;
                      const updated: ScoringState = {
                        ...(scoringState as ScoringState),
                        striker: target === "1" ? bName : activeStriker,
                        nonStriker: target === "2" ? bName : activeNonStriker,
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

                {/* Row 3: 🎯 (2nd innings only) | Tour Name | B1 | B2 */}
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
                    onClick={() => handleUpdateDisplayScreen("TOURNAME")}
                    className={`flex-1 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border border-white/10 bg-blue-700 ${scoringState?.inningsNo !== 2 ? 'ml-0' : ''}`}
                  >
                    Tour
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("B1")}
                    className="w-12 md:w-18 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border border-white/10"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #1e1b4b)" }}
                  >
                    B1
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("B2")}
                    className="w-12 md:w-18 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border border-white/10"
                    style={{ background: "linear-gradient(135deg, #d946ef, #701a75)" }}
                  >
                    B2
                  </button>
                </div>

                {/* Row 4: Bowler | Batting | Bowling | PP+ */}
                <div className="flex justify-between gap-2 md:gap-3 px-2 w-full max-w-[480px] mx-auto">
                  <button
                    onClick={() => handleUpdateDisplayScreen("BOWLER")}
                    className="flex-1 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border border-white/10"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #2563eb)" }}
                  >
                    Bowler
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen(scoringState?.inningsNo === 1 ? "Y1BAT" : "Y2BAT")}
                    className="flex-1 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border border-white/10"
                    style={{ background: "linear-gradient(135deg, #ec4899, #db2777)" }}
                  >
                    Batting
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen(scoringState?.inningsNo === 1 ? "Y1BALL" : "Y2BALL")}
                    className="flex-1 py-1.5 md:py-2 rounded-lg text-white font-extrabold text-[8px] md:text-xs uppercase transition-all active:scale-95 shadow-md border border-white/10"
                    style={{ background: "linear-gradient(135deg, #881337, #4c0519)" }}
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
                    { label: "Wide", checked: isWide, set: (val: boolean) => { resetScoringCheckboxes(); setIsWide(val); } },
                    { label: "No Ball", checked: isNoBall, set: (val: boolean) => { resetScoringCheckboxes(); setIsNoBall(val); } },
                    { label: "Byes", checked: isByes, set: (val: boolean) => { resetScoringCheckboxes(); setIsByes(val); } },
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
                    { label: "Leg Byes", checked: isLegByes, set: (val: boolean) => { resetScoringCheckboxes(); setIsLegByes(val); } },
                    { label: "Wicket", checked: isWicketCheck, set: (val: boolean) => { resetScoringCheckboxes(); setIsWicketCheck(val); }, info: true },
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
                    {[0, 1, 2, 3].map((run) => (
                      <button
                        key={run}
                        onClick={() => handleScoringButton(run)}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-black bg-white/20 hover:bg-white/40 text-black font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
                      >
                        {run}
                      </button>
                    ))}
                  </div>

                  {/* Row 2: 4 5 6 ... */}
                  <div className="grid grid-cols-4 gap-2 md:gap-3 justify-items-center">
                    {[4, 5, 6].map((run) => (
                      <button
                        key={run}
                        onClick={() => handleScoringButton(run)}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-black bg-white/20 hover:bg-white/40 text-black font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
                      >
                        {run}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const runInput = prompt("Enter custom runs:");
                        if (runInput !== null && !isNaN(Number(runInput))) {
                          handleScoringButton(Number(runInput));
                        }
                      }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-black bg-white/20 hover:bg-white/40 text-black font-extrabold text-xl md:text-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
                    >
                      •••
                    </button>
                  </div>

                  {/* Row 3: 1D | ? */}
                  <div className="flex justify-center gap-6 md:gap-8">
                    <button
                      onClick={() => {
                        recordBall("runs", 1);
                        resetScoringCheckboxes();
                      }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-black bg-white/20 hover:bg-white/40 text-black font-extrabold text-xl md:text-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
                    >
                      1D
                    </button>
                    <button
                      onClick={() => {
                        alert(
                          "Scoring Help:\n\n" +
                          "• Check any of the extras (Wide, No Ball, Byes, Leg Byes, Wicket) first, then tap a number (0-6) to record.\n" +
                          "• Tap '1D' to record 1 run Declared.\n" +
                          "• Tap '•••' to record custom runs.\n" +
                          "• Tap '?' to check help details."
                        );
                      }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-black bg-white/20 hover:bg-white/40 text-black font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
                    >
                      ?
                    </button>
                  </div>
                </div>

                {/* Edit Team Roster Panel */}
                <div className="bg-[#121542] border border-zinc-700/40 rounded-xl p-3 md:p-4 flex flex-col gap-3 md:gap-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 md:gap-0">
                    <span className="text-[10px] md:text-xs font-black tracking-wider text-zinc-400 uppercase">Edit Team Roster 🔧</span>
                    <span className="text-[8px] md:text-[10px] text-zinc-500">Comma-separate for bulk add</span>
                  </div>

                  {/* Team 1 add */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="flex-1 flex gap-1 md:gap-2">
                      <input
                        type="text"
                        value={playerInput1}
                        onChange={(e) => setPlayerInput1(e.target.value)}
                        placeholder={`ADD PLAYER TO ${match.team1Name.toUpperCase()}`}
                        className="flex-1 bg-[#07092e] border border-zinc-700/60 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs text-white focus:outline-none focus:border-amber-500"
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
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-[9px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-lg whitespace-nowrap"
                    >
                      {match.team1Name.substring(0, 8).toUpperCase()}... Players ({match.playersTeam1?.length || 0})
                    </button>
                  </div>
                  {showPlayers1 && (
                    <div className="bg-[#07092e] border border-zinc-800 rounded-lg p-2 md:p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2 text-[10px] md:text-xs max-h-[120px] md:max-h-[150px] overflow-y-auto">
                      {match.playersTeam1 && match.playersTeam1.length > 0 ? (
                        match.playersTeam1.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#121542] px-1.5 md:px-2 py-1 rounded border border-zinc-700/40">
                            <span className="truncate text-[10px] md:text-xs">{p}</span>
                            <button onClick={() => handleRemovePlayer("team1", idx)} className="text-red-400 hover:text-red-300 font-bold ml-1 text-sm md:text-base">×</button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-zinc-600 text-[10px] md:text-xs">No players added</div>
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
                        className="flex-1 bg-[#07092e] border border-zinc-700/60 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs text-white focus:outline-none focus:border-amber-500"
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
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-[9px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-lg whitespace-nowrap"
                    >
                      {match.team2Name.substring(0, 8).toUpperCase()}... Players ({match.playersTeam2?.length || 0})
                    </button>
                  </div>
                  {showPlayers2 && (
                    <div className="bg-[#07092e] border border-zinc-800 rounded-lg p-2 md:p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2 text-[10px] md:text-xs max-h-[120px] md:max-h-[150px] overflow-y-auto">
                      {match.playersTeam2 && match.playersTeam2.length > 0 ? (
                        match.playersTeam2.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#121542] px-1.5 md:px-2 py-1 rounded border border-zinc-700/40">
                            <span className="truncate text-[10px] md:text-xs">{p}</span>
                            <button onClick={() => handleRemovePlayer("team2", idx)} className="text-red-400 hover:text-red-300 font-bold ml-1 text-sm md:text-base">×</button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-zinc-600 text-[10px] md:text-xs">No players added</div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Animations Panel */}
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-wider text-zinc-400 uppercase">Animations</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleTriggerAnimation("FREE HIT")}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase"
                >
                  FREE HIT
                </button>
                <button
                  onClick={() => handleTriggerAnimation("HAT-TRICK BALL")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase"
                >
                  HAT-TRICK BALL
                </button>
                <button
                  onClick={() => handleTriggerAnimation("FOUR")}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase"
                >
                  FOUR
                </button>
                <button
                  onClick={() => handleTriggerAnimation("SIX")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase"
                >
                  SIX
                </button>
                <button
                  onClick={() => handleTriggerAnimation("WICKET")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase"
                >
                  WICKET
                </button>
                <button
                  onClick={() => handleTriggerAnimation("TOUR BOUNDARIES")}
                  className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase"
                >
                  TOUR BOUNDARIES
                </button>
                <button
                  onClick={() => handleTriggerAnimation(null)}
                  className="w-8 h-8 bg-red-800 hover:bg-red-900 rounded-full flex items-center justify-center text-white font-extrabold text-xs tracking-wider active:scale-95 transition-all cursor-pointer"
                  title="STOP animation"
                >
                  STOP
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
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-wider text-zinc-400 uppercase">DISPLAY CONTROLLER</h3>

              {/* ── Prominent Summary & Scorecard Broadcast Buttons ── */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">📡 Live Screen — shows on all scoreboards instantly:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateDisplayScreen("SUMMARY")}
                    className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-black tracking-wider transition-all active:scale-95 cursor-pointer border-2 shadow-lg ${
                      scoringState?.displayScreen === "SUMMARY"
                        ? "bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-cyan-500/20"
                        : "bg-gradient-to-br from-cyan-600 to-teal-700 border-cyan-500/40 text-white hover:from-cyan-500 hover:to-teal-600 shadow-cyan-500/10"
                    }`}
                  >
                    <span className="text-xl">📋</span>
                    VIEW SUMMARY
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("FULLSCORE")}
                    className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-black tracking-wider transition-all active:scale-95 cursor-pointer border-2 shadow-lg ${
                      scoringState?.displayScreen === "FULLSCORE"
                        ? "bg-blue-500/30 border-blue-400 text-blue-200 shadow-blue-500/20"
                        : "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500/40 text-white hover:from-blue-500 hover:to-indigo-600 shadow-blue-500/10"
                    }`}
                  >
                    <span className="text-xl">📊</span>
                    VIEW SCORECARD
                  </button>
                  <button
                    onClick={() => handleUpdateDisplayScreen("DEFAULT!")}
                    className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-black tracking-wider bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-zinc-600/50 text-zinc-200 hover:from-zinc-600 hover:to-zinc-700 transition-all active:scale-95 cursor-pointer shadow-lg"
                  >
                    <span className="text-xl">🏏</span>
                    LIVE SCORE
                  </button>
                </div>
              </div>

              <div className="border-t border-zinc-800/60" />

              {/* Small screen buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "DEFAULT!", color: "bg-blue-600", hover: "hover:bg-blue-700", selected: "bg-blue-400/30 border-blue-400 text-blue-300" },
                  { label: "1BAT", color: "bg-purple-600", hover: "hover:bg-purple-700", selected: "bg-purple-400/30 border-purple-400 text-purple-300" },
                  { label: "1BALL", color: "bg-pink-600", hover: "hover:bg-pink-700", selected: "bg-pink-400/30 border-pink-400 text-pink-300" },
                  { label: "2BAT", color: "bg-indigo-600", hover: "hover:bg-indigo-700", selected: "bg-indigo-400/30 border-indigo-400 text-indigo-300" },
                  { label: "2BALL", color: "bg-rose-600", hover: "hover:bg-rose-700", selected: "bg-rose-400/30 border-rose-400 text-rose-300" },
                  { label: "SUMMARY", color: "bg-cyan-600", hover: "hover:bg-cyan-700", selected: "bg-cyan-400/30 border-cyan-400 text-cyan-300" },
                  { label: "FULLSCORE", color: "bg-blue-600", hover: "hover:bg-blue-700", selected: "bg-blue-400/30 border-blue-400 text-blue-300" },
                  { label: "FOW", color: "bg-teal-600", hover: "hover:bg-teal-700", selected: "bg-teal-400/30 border-teal-400 text-teal-300" },
                  { label: "B1", color: "bg-emerald-600", hover: "hover:bg-emerald-700", selected: "bg-emerald-400/30 border-emerald-400 text-emerald-300" },
                  { label: "B2", color: "bg-green-600", hover: "hover:bg-green-700", selected: "bg-green-400/30 border-green-400 text-green-300" },
                  { label: "BOWLER", color: "bg-lime-600", hover: "hover:bg-lime-700", selected: "bg-lime-400/30 border-lime-400 text-lime-300" },
                  { label: "TARGET", color: "bg-orange-600", hover: "hover:bg-orange-700", selected: "bg-orange-400/30 border-orange-400 text-orange-300" },
                  { label: "PARTNERSHIP", color: "bg-amber-600", hover: "hover:bg-amber-700", selected: "bg-amber-400/30 border-amber-400 text-amber-300" },
                  { label: "TEAMS PLAYERS", color: "bg-violet-600", hover: "hover:bg-violet-700", selected: "bg-violet-400/30 border-violet-400 text-violet-300" },
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
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-4 shadow-xl flex items-center gap-4">
              <span className="text-xs font-black tracking-wider text-cyan-400 uppercase">Decision :</span>
              <button
                onClick={() => handleSetDecision("PENDING")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${scoringState?.decision === "PENDING"
                  ? "bg-[#ffcc00] text-black ring-2 ring-amber-400"
                  : "bg-[#ffcc00] hover:bg-amber-500 text-black font-semibold"
                  }`}
              >
                PENDING
              </button>
              <button
                onClick={() => handleSetDecision("OUT")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${scoringState?.decision === "OUT"
                  ? "bg-red-600 text-white ring-2 ring-red-500"
                  : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
              >
                OUT
              </button>
              <button
                onClick={() => handleSetDecision("NOT OUT")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${scoringState?.decision === "NOT OUT"
                  ? "bg-emerald-600 text-white ring-2 ring-emerald-500"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
              >
                NOT OUT
              </button>
              {scoringState?.decision && (
                <button
                  onClick={() => handleSetDecision(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-400 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Custom Input Display */}
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-black tracking-wider text-zinc-400 uppercase min-w-[120px]">Custom Input :</span>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Custom Input (use - for split text to next line)"
                className="flex-1 bg-[#121542] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSendCustomInput}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Display Input
              </button>
            </div>

            {/* Select MOM Player */}
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-black tracking-wider text-zinc-400 uppercase min-w-[120px]">Select MOM Player:</span>
              <select
                value={selectedMom}
                onChange={(e) => setSelectedMom(e.target.value)}
                className="flex-1 bg-[#121542] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
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
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-black tracking-wider text-zinc-400 uppercase min-w-[150px]">Tournament Stats Player:</span>
              <select
                value={selectedStatsPlayer}
                onChange={(e) => setSelectedStatsPlayer(e.target.value)}
                className="flex-1 bg-[#121542] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
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
            </div>

            {/* Tour Stats Controller */}
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-wider text-zinc-500 uppercase">
                TOUR STATS CONTROLLER <span className="text-red-500 font-bold">(ONLY FOR THEME 10 to 15)</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  "POINTS TABLE",
                  "PT (TIED POINT +1)",
                  "TOP BATTERS",
                  "TOP BOWLERS",
                  "TOP 4/6 STRIKERS",
                  "TOP PLAYER OF SERIES",
                ].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleTourStatsController(mode)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-black font-black text-[10px] tracking-wider rounded-lg active:scale-95 shadow-md shadow-orange-500/5 cursor-pointer"
                  >
                    {mode}
                  </button>
                ))}
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
          <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl text-center flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              LIVE SPECTATOR VIEW
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
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
          <div className="relative w-full max-w-md bg-[#0c7081] rounded-3xl shadow-2xl overflow-hidden text-white border border-cyan-400/20">
            <div className="p-7 flex flex-col gap-5">
              {/* Batting Team Header */}
              <div className="text-center">
                <h3 className="text-amber-300 font-extrabold text-xl tracking-wider font-space">
                  {currentBattingTeamLabel || "Batting Team"}
                </h3>
                <p className="text-[11px] text-cyan-100 uppercase tracking-widest font-black mt-1">Striker Setup</p>
              </div>

              {/* Form Input fields */}
              <div className="flex flex-col gap-4">
                {/* Striker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-100">Striker</label>
                  <input
                    type="text"
                    value={strikerInput}
                    onChange={(e) => setStrikerInput(e.target.value)}
                    placeholder="Enter Striker"
                    className="w-full bg-[#135d6b] border border-cyan-400/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white placeholder:text-cyan-200/50"
                  />
                  {/* Suggestions list from added players */}
                  {battingRoster && battingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {battingRoster.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setStrikerInput(p)}
                          className="px-2 py-0.5 bg-[#0e515d] hover:bg-cyan-900 border border-cyan-400/20 text-[10px] rounded text-cyan-100 cursor-pointer"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Non-Striker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-100">Non-Striker</label>
                  <input
                    type="text"
                    value={nonStrikerInput}
                    onChange={(e) => setNonStrikerInput(e.target.value)}
                    placeholder="Enter Non-Striker"
                    className="w-full bg-[#135d6b] border border-cyan-400/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white placeholder:text-cyan-200/50"
                  />
                  {battingRoster && battingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {battingRoster.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setNonStrikerInput(p)}
                          className="px-2 py-0.5 bg-[#0e515d] hover:bg-cyan-900 border border-cyan-400/20 text-[10px] rounded text-cyan-100 cursor-pointer"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bowling Team Header */}
                <div className="text-center pt-2 border-t border-cyan-600/40">
                  <h3 className="text-blue-200 font-extrabold text-lg tracking-wider font-space">
                    {currentBowlingTeamLabel || "Bowling Team"}
                  </h3>
                  <p className="text-[11px] text-cyan-100 uppercase tracking-widest font-black mt-1">Bowler Setup</p>
                </div>

                {/* Bowler */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-100">Bowler</label>
                  <input
                    type="text"
                    value={bowlerInput}
                    onChange={(e) => setBowlerInput(e.target.value)}
                    placeholder="Enter Bowler"
                    className="w-full bg-[#135d6b] border border-cyan-400/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white placeholder:text-cyan-200/50"
                  />
                  {bowlingRoster && bowlingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {bowlingRoster.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setBowlerInput(p)}
                          className="px-2 py-0.5 bg-[#0e515d] hover:bg-cyan-900 border border-cyan-400/20 text-[10px] rounded text-cyan-100 cursor-pointer"
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
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-sm transition-all cursor-pointer"
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
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setShowWicketModal(false)} />
          <div className="relative w-full max-w-sm bg-[#07092e] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-1 bg-red-500 w-full" />
            <div className="p-7 flex flex-col gap-4 text-center">
              <div>
                <h3 className="text-lg font-black tracking-wider text-red-500">Batsman Out!</h3>
                <p className="text-xs text-zinc-400 mt-1">Select dismissal details and replacement</p>
              </div>

              <div className="flex flex-col gap-3 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Dismissed Batsman</label>
                  <select
                    value={dismissedBatsman}
                    onChange={(e) => setDismissedBatsman(e.target.value)}
                    className="w-full bg-[#121542] border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value={scoringState?.striker}>{scoringState?.striker} (Striker)</option>
                    <option value={scoringState?.nonStriker}>{scoringState?.nonStriker} (Non-Striker)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Wicket Type</label>
                  <select
                    value={wicketType}
                    onChange={(e) => setWicketType(e.target.value as any)}
                    className="w-full bg-[#121542] border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Bowled">Bowled</option>
                    <option value="Caught">Caught</option>
                    <option value="LBW">LBW</option>
                    <option value="Run Out">Run Out</option>
                    <option value="Stumped">Stumped</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">New Batsman Name</label>
                  <input
                    type="text"
                    value={newBatsmanInput}
                    onChange={(e) => setNewBatsmanInput(e.target.value)}
                    placeholder="Enter New Batsman name"
                    className="w-full bg-[#121542] border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  {battingRoster && battingRoster.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto">
                      {battingRoster
                        .filter(
                          (p) =>
                            p.toLowerCase() !== scoringState?.striker.toLowerCase() &&
                            p.toLowerCase() !== scoringState?.nonStriker.toLowerCase()
                        )
                        .map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setNewBatsmanInput(p)}
                            className="px-2 py-0.5 bg-[#121542] hover:bg-[#1b1f63] border border-zinc-700/50 text-[10px] rounded text-zinc-300 cursor-pointer"
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
                  onClick={() => setShowWicketModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold rounded-lg text-xs"
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
          <div className="relative w-full max-w-sm bg-gradient-to-br from-[#0c4a6e] to-[#0c7081] rounded-3xl shadow-2xl border border-cyan-400/30 text-white overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-center">
              <h3 className="text-lg font-black tracking-wider font-space uppercase">🏏 Select New Bowler</h3>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Over Complete — Pick next bowler
              </p>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Bowling team label */}
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-200 text-center">
                {currentBowlingTeamLabel} Bowling
              </p>

              {/* Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-cyan-100">Bowler Name</label>
                <input
                  type="text"
                  value={newBowlerInput}
                  onChange={(e) => setNewBowlerInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleNewBowlerSubmit(); }}
                  placeholder="Type or select bowler"
                  autoFocus
                  className="w-full bg-[#083d5a] border border-cyan-400/30 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white placeholder:text-cyan-300/40"
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
                      .filter((p) => p.toLowerCase() !== newBowlerInput.toLowerCase())
                      .map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setNewBowlerInput(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${scoringState.bowlers.some((bw) => bw.name.toLowerCase() === p.toLowerCase())
                            ? "bg-teal-700/60 border-teal-400/40 text-teal-100"
                            : "bg-[#083d5a] hover:bg-[#0c5a7a] border-cyan-400/20 text-cyan-100"
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
                  className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold rounded-xl text-sm active:scale-95 transition-all cursor-pointer"
                >
                  Skip
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
