"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import ScoreboardLinksModal from "../../components/ScoreboardLinksModal";

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

  // Dismissal Modal
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState<"Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped">("Bowled");
  const [dismissedBatsman, setDismissedBatsman] = useState("");
  const [newBatsmanInput, setNewBatsmanInput] = useState("");

  // Custom Input & MOM states
  const [customText, setCustomText] = useState("");
  const [selectedMom, setSelectedMom] = useState("");
  const [selectedStatsPlayer, setSelectedStatsPlayer] = useState("");

  // UI Toast helper
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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
    if (scoringState?.animation && ["FOUR", "SIX", "WICKET"].includes(scoringState.animation)) {
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
    t2Players?: string[]
  ) => {
    try {
      const body: any = {};
      if (state !== undefined) body.scoringState = state;
      if (newStatus !== undefined) body.status = newStatus;
      if (t1Players !== undefined) body.playersTeam1 = t1Players;
      if (t2Players !== undefined) body.playersTeam2 = t2Players;

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

    const { batting, bowling } = getTeamsByToss();

    const initialState: ScoringState = {
      battingTeam: batting,
      bowlingTeam: bowling,
      inningsStarted: true,
      inningsNo: 1,
      striker: strikerInput.trim(),
      nonStriker: nonStrikerInput.trim(),
      bowler: bowlerInput.trim(),
      score: 0,
      wickets: 0,
      balls: 0,
      overs: 0,
      target: null,
      thisOver: [],
      batsmen: [
        { name: strikerInput.trim(), runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
        { name: nonStrikerInput.trim(), runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
      ],
      bowlers: [
        { name: bowlerInput.trim(), runsConceded: 0, ballsBowled: 0, wickets: 0 },
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
    };

    setScoringState(initialState);
    setMatch((prev) => (prev ? { ...prev, status: "Live" } : null));
    saveScoringState(initialState, "Live");
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
      saveScoringState(nextInningsState, "Live");
      showToast("First innings finished! Setting up 2nd innings...");
      // Auto open 2nd innings input
      setStrikerInput("");
      setNonStrikerInput("");
      setBowlerInput("");
      setShowStartInningsModal(true);
    } else {
      setScoringState(nextState);
      saveScoringState(nextState, matchStatus);
      if (matchStatus === "Completed") {
        showToast("Match finished!", "success");
        setMatch((prev) => (prev ? { ...prev, status: "Completed" } : null));
      } else if (isOverEnd) {
        showToast("Over complete! Select new bowler.");
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
    if (!confirm("Are you sure you want to manually archive Innings 1 and transition to Innings 2?")) {
      return;
    }

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
    if (!confirm("Are you sure you want to reset all scoring data? This clears current score state.")) return;
    setScoringState(null);
    setMatch((prev) => (prev ? { ...prev, status: "Not Started" } : null));
    saveScoringState(null, "Not Started");
    showToast("Scoring reset successfully.");
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

  const handleTourStatsController = (mode: string) => {
    if (!scoringState) return;
    const updated = { ...scoringState, displayStatsMode: mode };
    setScoringState(updated);
    saveScoringState(updated);
    showToast(`Displaying stats category: ${mode}`);
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#03041c] text-white" suppressHydrationWarning={true}>
        <div className="flex flex-col items-center gap-3" suppressHydrationWarning={true}>
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" suppressHydrationWarning={true} />
          <p className="text-zinc-400 font-semibold tracking-wider font-space" suppressHydrationWarning={true}>LOADING MATCH SCOREBOARD...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !match) {
    return (
      <div className="flex min-h-screen flex-col bg-[#03041c] text-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
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
    <div className="flex flex-col min-h-screen bg-[#03041c] text-white select-none relative overflow-hidden font-sans">
      {/* Background flows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[55%] rounded-full bg-cyan-600/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[55%] rounded-full bg-indigo-600/5 blur-[130px] pointer-events-none" />

      <Header />

      {/* Floating inline toast notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-xl border text-sm font-semibold shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : toast.type === "error"
                ? "bg-red-500/15 border-red-500/40 text-red-300"
                : "bg-blue-500/15 border-blue-500/40 text-blue-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {toast.message}
          </div>
        </div>
      )}

      {/* Screen Animation Overlay (Specator and Scorer view) */}
      {scoringState?.animation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none">
          <div className="text-center animate-scale-up-fade px-8 py-6 rounded-3xl border border-white/10 bg-[#07092e]/85 shadow-2xl">
            <h2 className="text-6xl font-black font-space tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 animate-pulse">
              ★ {scoringState.animation} ★
            </h2>
            {scoringState.displayScreen !== "default" && (
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-2">
                Screen Mode: {scoringState.displayScreen}
              </p>
            )}
          </div>
        </div>
      )}

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
                  <span>{scoringState.bowler || "Bowler"}</span>
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

        {/* ── Owner / Scorer Admin Panels ─────────────────────────────────── */}
        {isOwner && (
          <div className="flex flex-col gap-6 mt-2">
            {/* Overlay & Innings Master Control */}
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
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
            </div>

            {/* Scoring Input Pad */}
            {scoringState && scoringState.inningsStarted && (
              <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-extrabold tracking-wider text-zinc-400 uppercase">Record Ball Score</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {[0, 1, 2, 3, 4, 6].map((run) => (
                    <button
                      key={run}
                      onClick={() => recordBall("runs", run)}
                      className="flex-1 min-w-[50px] py-3 bg-[#121542] hover:bg-[#1b1f63] border border-zinc-700/50 text-white font-black rounded-xl text-lg hover:border-amber-500 transition-all active:scale-95 cursor-pointer"
                    >
                      {run}
                    </button>
                  ))}
                  <button
                    onClick={() => recordBall("wide")}
                    className="flex-1 min-w-[50px] py-3 bg-[#121542] hover:bg-[#1b1f63] border border-zinc-700/50 text-amber-300 font-extrabold rounded-xl text-base hover:border-amber-500 transition-all active:scale-95 cursor-pointer"
                  >
                    WD
                  </button>
                  <button
                    onClick={() => recordBall("noball")}
                    className="flex-1 min-w-[50px] py-3 bg-[#121542] hover:bg-[#1b1f63] border border-zinc-700/50 text-blue-300 font-extrabold rounded-xl text-base hover:border-amber-500 transition-all active:scale-95 cursor-pointer"
                  >
                    NB
                  </button>
                  <button
                    onClick={() => recordBall("widenoball")}
                    className="flex-1 min-w-[50px] py-3 bg-[#121542] hover:bg-[#1b1f63] border border-zinc-700/50 text-purple-300 font-extrabold rounded-xl text-sm hover:border-amber-500 transition-all active:scale-95 cursor-pointer"
                  >
                    WD+NB
                  </button>
                  <button
                    onClick={() => {
                      const byes = Number(prompt("Enter Bye/Leg-Bye runs (1-4):") || "0");
                      if (byes > 0) recordBall("bye", byes);
                    }}
                    className="flex-1 min-w-[50px] py-3 bg-[#121542] hover:bg-[#1b1f63] border border-zinc-700/50 text-cyan-300 font-extrabold rounded-xl text-sm hover:border-amber-500 transition-all active:scale-95 cursor-pointer"
                  >
                    BYE
                  </button>
                  <button
                    onClick={openWicketModal}
                    className="flex-1 min-w-[50px] py-3 bg-red-600/20 hover:bg-red-600/35 border border-red-500/40 text-red-400 font-extrabold rounded-xl text-base hover:border-red-500 transition-all active:scale-95 cursor-pointer"
                  >
                    WICKET
                  </button>
                </div>
              </div>
            )}

            {/* Controller Panel (Image 1) */}
            <div className="relative bg-[#07092e] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
              {/* Colored top header block */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-6 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-black tracking-wider text-white">Controller</h3>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {/* 5 Controller Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={resetMatchScoring}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs tracking-wider py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Default!
                  </button>
                  <button
                    onClick={() => {
                      const newToss = match.tossWonBy === "team1" ? "team2" : "team1";
                      const newOpt = match.optedTo === "Bat" ? "Bowl" : "Bat";
                      if (confirm(`Change toss to: ${newToss === "team1" ? match.team1Name : match.team2Name} won and chose to ${newOpt}?`)) {
                        setMatch(prev => prev ? { ...prev, tossWonBy: newToss, optedTo: newOpt } : null);
                        saveScoringState(scoringState, undefined, undefined, undefined);
                        showToast("Toss settings updated.");
                      }
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs tracking-wider py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    Change Toss
                  </button>
                  <button
                    onClick={openStartInnings}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-black text-xs tracking-wider py-2.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                  >
                    {scoringState?.inningsStarted ? "Start Innings" : "Start 1st Innings"}
                  </button>
                  <button
                    onClick={() => showToast("Tournament Name display updated!")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs tracking-wider py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Tour Name
                  </button>
                  <button
                    onClick={handleUndo}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-wider py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-red-500/10 cursor-pointer"
                  >
                    UNDO
                  </button>
                </div>

                {/* Edit Team Roster Panel */}
                <div className="bg-[#121542] border border-zinc-700/40 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider text-zinc-400 uppercase">Edit Team Short Name 🔧</span>
                    <span className="text-[10px] text-zinc-500">For Bulk Upload Add , Between Player Name</span>
                  </div>

                  {/* Team 1 add */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={playerInput1}
                        onChange={(e) => setPlayerInput1(e.target.value)}
                        placeholder={`ADD PLAYER TO ${match.team1Name.toUpperCase()}`}
                        className="flex-1 bg-[#07092e] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddPlayer("team1")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 flex items-center justify-center cursor-pointer"
                      >
                        ➕
                      </button>
                    </div>

                    <button
                      onClick={() => setShowPlayers1(!showPlayers1)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      {match.team1Name.substring(0, 10).toUpperCase()}... Players ({match.playersTeam1?.length || 0})
                    </button>
                  </div>

                  {/* Team 1 player roster dropdown list */}
                  {showPlayers1 && (
                    <div className="bg-[#07092e] border border-zinc-800 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs max-h-[150px] overflow-y-auto">
                      {match.playersTeam1 && match.playersTeam1.length > 0 ? (
                        match.playersTeam1.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#121542] px-2 py-1 rounded border border-zinc-700/40">
                            <span className="truncate">{p}</span>
                            <button onClick={() => handleRemovePlayer("team1", idx)} className="text-red-400 hover:text-red-300 font-bold ml-1">×</button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-zinc-600">No players added</div>
                      )}
                    </div>
                  )}

                  {/* Team 2 add */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={playerInput2}
                        onChange={(e) => setPlayerInput2(e.target.value)}
                        placeholder={`ADD PLAYER TO ${match.team2Name.toUpperCase()}`}
                        className="flex-1 bg-[#07092e] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddPlayer("team2")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 flex items-center justify-center cursor-pointer"
                      >
                        ➕
                      </button>
                    </div>

                    <button
                      onClick={() => setShowPlayers2(!showPlayers2)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      {match.team2Name.substring(0, 10).toUpperCase()}... Players ({match.playersTeam2?.length || 0})
                    </button>
                  </div>

                  {/* Team 2 player roster dropdown list */}
                  {showPlayers2 && (
                    <div className="bg-[#07092e] border border-zinc-800 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs max-h-[150px] overflow-y-auto">
                      {match.playersTeam2 && match.playersTeam2.length > 0 ? (
                        match.playersTeam2.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#121542] px-2 py-1 rounded border border-zinc-700/40">
                            <span className="truncate">{p}</span>
                            <button onClick={() => handleRemovePlayer("team2", idx)} className="text-red-400 hover:text-red-300 font-bold ml-1">×</button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-zinc-600">No players added</div>
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
                <button
                  onClick={handleClearAllOverlays}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] tracking-wider rounded-md active:scale-95 cursor-pointer uppercase shadow-md shadow-rose-500/10"
                >
                  CLOSE ALL BANNERS & OVERLAYS ✕
                </button>
              </div>
            </div>

            {/* Display Controller Panel */}
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-wider text-zinc-400 uppercase">DISPLAY CONTROLLER</h3>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  "DEFAULT!",
                  "Y1BAT",
                  "Y1BALL",
                  "Y2BAT",
                  "Y2BALL",
                  "SUMMARY",
                  "FOW",
                  "B1",
                  "B2",
                  "BOWLER",
                  "TARGET",
                  "PARTNERSHIP",
                  "TEAMS PLAYERS",
                ].map((screen) => (
                  <button
                    key={screen}
                    onClick={() => handleUpdateDisplayScreen(screen)}
                    className={`px-3 py-2 text-[10px] font-black tracking-wider rounded-lg active:scale-95 border transition-all cursor-pointer ${
                      scoringState?.displayScreen === screen
                        ? "bg-amber-500/25 border-amber-500 text-amber-300"
                        : "bg-[#121542] hover:bg-[#1b1f63] border-zinc-700/50 text-zinc-300"
                    }`}
                  >
                    {screen}
                  </button>
                ))}
              </div>
            </div>

            {/* Umpire Decision Controller Row */}
            <div className="bg-[#07092e] border border-zinc-800/60 rounded-2xl p-4 shadow-xl flex items-center gap-4">
              <span className="text-xs font-black tracking-wider text-cyan-400 uppercase">Decision :</span>
              <button
                onClick={() => handleSetDecision("PENDING")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
                  scoringState?.decision === "PENDING"
                    ? "bg-[#ffcc00] text-black ring-2 ring-amber-400"
                    : "bg-[#ffcc00] hover:bg-amber-500 text-black font-semibold"
                }`}
              >
                PENDING
              </button>
              <button
                onClick={() => handleSetDecision("OUT")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
                  scoringState?.decision === "OUT"
                    ? "bg-red-600 text-white ring-2 ring-red-500"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                OUT
              </button>
              <button
                onClick={() => handleSetDecision("NOT OUT")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
                  scoringState?.decision === "NOT OUT"
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

      <ScoreboardLinksModal
        isOpen={showScoreboardLinks}
        onClose={() => setShowScoreboardLinks(false)}
        matchId={matchId}
        showToast={showToast}
      />

      <Footer />
    </div>
  );
}
