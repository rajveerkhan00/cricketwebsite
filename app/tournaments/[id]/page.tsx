"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tournament {
  _id: string;
  name: string;
  location: string;
  createdAt: string;
}

interface Match {
  _id: string;
  tournamentId: string;
  team1Name: string;
  team2Name: string;
  overs: number;
  matchNo: number;
  tossWonBy: "team1" | "team2";
  optedTo: "Bat" | "Bowl";
  matchTied: boolean;
  ballsPerOver: number;
  matchType: string;
  status: string;
  createdAt: string;
}

const MATCH_TYPES = [
  "Group Stage",
  "Super Over",
  "Quarter Final",
  "Qualifier 1",
  "Qualifier 2",
  "Eliminator",
  "Semi Final",
  "Final",
];

const BALLS_PER_OVER_OPTIONS = [4, 5, 6, 8];

// ─── Default form state ───────────────────────────────────────────────────────
const defaultForm = {
  team1Name: "",
  team2Name: "",
  overs: 0,
  matchNo: 0,
  tossWonBy: "" as "team1" | "team2" | "",
  optedTo: "Bat" as "Bat" | "Bowl",
  matchTied: false,
  ballsPerOver: 6,
  matchType: "Group Stage",
};

// ─── Create / Edit Match Modal ────────────────────────────────────────────────
function MatchModal({
  mode,
  initial,
  team1Label,
  team2Label,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  mode: "create" | "edit";
  initial?: typeof defaultForm;
  team1Label?: string;
  team2Label?: string;
  onClose: () => void;
  onSubmit: (form: typeof defaultForm) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<typeof defaultForm>(initial ?? defaultForm);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (key: keyof typeof defaultForm, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Derive the actual team name for toss label
  const tossTeam1Label = form.team1Name || team1Label || "Team 1";
  const tossTeam2Label = form.team2Name || team2Label || "Team 2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden my-8">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="p-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-1">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-white font-space tracking-wide">
              {mode === "create" ? "Create Match" : "Edit Match"}
            </h2>
            <p className="text-xs text-zinc-400">
              {mode === "create" ? "Set up a new match for this tournament" : "Update the match details"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl p-3 text-center font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Team 1 Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Team 1 Name</label>
              <input
                ref={firstRef}
                type="text"
                value={form.team1Name}
                onChange={(e) => set("team1Name", e.target.value)}
                placeholder="Enter Team 1 Name"
                className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-zinc-600"
                required
                disabled={loading}
              />
            </div>

            {/* Team 2 Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Team 2 Name</label>
              <input
                type="text"
                value={form.team2Name}
                onChange={(e) => set("team2Name", e.target.value)}
                placeholder="Enter Team 2 Name"
                className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-zinc-600"
                required
                disabled={loading}
              />
            </div>

            {/* Overs & Match No — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Overs</label>
                <input
                  type="number"
                  value={form.overs === 0 ? "" : form.overs}
                  onChange={(e) => set("overs", Number(e.target.value))}
                  placeholder="0"
                  min={1}
                  className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-zinc-600"
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Match No.</label>
                <input
                  type="number"
                  value={form.matchNo === 0 ? "" : form.matchNo}
                  onChange={(e) => set("matchNo", Number(e.target.value))}
                  placeholder="0"
                  min={1}
                  className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-zinc-600"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Toss Won By */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Toss Won By?</label>
              <div className="flex gap-3">
                {(["team1", "team2"] as const).map((val) => (
                  <label
                    key={val}
                    className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                      form.tossWonBy === val
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
                        : "bg-[#121542] border-zinc-700/60 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tossWonBy"
                      value={val}
                      checked={form.tossWonBy === val}
                      onChange={() => set("tossWonBy", val)}
                      className="accent-amber-500"
                      disabled={loading}
                    />
                    {val === "team1"
                      ? tossTeam1Label || "Team 1"
                      : tossTeam2Label || "Team 2"}
                  </label>
                ))}
              </div>
            </div>

            {/* Opted To */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Opted To?</label>
              <div className="flex gap-3">
                {(["Bat", "Bowl"] as const).map((val) => (
                  <label
                    key={val}
                    className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                      form.optedTo === val
                        ? "bg-blue-500/15 border-blue-500/50 text-blue-300"
                        : "bg-[#121542] border-zinc-700/60 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="optedTo"
                      value={val}
                      checked={form.optedTo === val}
                      onChange={() => set("optedTo", val)}
                      className="accent-blue-500"
                      disabled={loading}
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>

            {/* Match Tied */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Match Tied?</label>
              <div className="flex gap-3">
                {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
                  <label
                    key={label}
                    className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                      form.matchTied === value
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                        : "bg-[#121542] border-zinc-700/60 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="matchTied"
                      checked={form.matchTied === value}
                      onChange={() => set("matchTied", value)}
                      className="accent-emerald-500"
                      disabled={loading}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Balls Per Over & Match Type — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Balls Per Over</label>
                <select
                  value={form.ballsPerOver}
                  onChange={(e) => set("ballsPerOver", Number(e.target.value))}
                  className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer"
                  disabled={loading}
                >
                  {BALLS_PER_OVER_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Match Type</label>
                <select
                  value={form.matchType}
                  onChange={(e) => set("matchType", e.target.value)}
                  className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer"
                  disabled={loading}
                >
                  {MATCH_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold py-3 rounded-lg text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === "create" ? "CREATING..." : "SAVING..."}
                  </>
                ) : (
                  mode === "create" ? "ADD MATCH" : "SAVE CHANGES"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-300 font-bold rounded-lg text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
  matchLabel,
  onConfirm,
  onClose,
  loading,
}: {
  matchLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="p-7 flex flex-col items-center gap-5 text-center">
          <div className="w-13 h-13 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center p-3">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-space">Delete Match?</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Delete <span className="text-white font-bold">"{matchLabel}"</span>?<br />This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 active:scale-95 text-white font-bold py-2.5 rounded-lg text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : "DELETE"}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-300 font-bold py-2.5 rounded-lg text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Match Status Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "Live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        LIVE
      </span>
    );
  }
  if (status === "Completed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        ✓ COMPLETED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
      NOT STARTED
    </span>
  );
}

// ─── Match Type Badge ─────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const color =
    type === "Final" ? "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300" :
    type.includes("Semi") ? "from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-300" :
    type.includes("Quarter") || type.includes("Qualifier") || type === "Eliminator"
      ? "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300" :
    "from-zinc-500/10 to-zinc-600/10 border-zinc-600/30 text-zinc-400";

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r border ${color}`}>
      {type}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TourPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const tournamentId = params?.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !tournamentId) return;
    loadPage();
  }, [status, tournamentId]);

  const loadPage = async () => {
    setPageLoading(true);
    setFetchError(null);
    try {
      // Fetch tournament details
      const tRes = await fetch("/api/tournaments");
      const tData = await tRes.json();
      if (!tRes.ok) throw new Error(tData.error || "Failed to load tournament.");
      const found = tData.tournaments.find((t: Tournament) => t._id === tournamentId);
      if (!found) throw new Error("Tournament not found or you don't have access.");
      setTournament(found);

      // Fetch matches
      await loadMatches();
    } catch (err: any) {
      setFetchError(err.message || "Failed to load page.");
    } finally {
      setPageLoading(false);
    }
  };

  const loadMatches = async () => {
    const mRes = await fetch(`/api/matches?tournamentId=${tournamentId}`);
    const mData = await mRes.json();
    if (!mRes.ok) throw new Error(mData.error || "Failed to load matches.");
    setMatches(mData.matches);
  };

  // Create match
  const handleCreate = async (form: typeof defaultForm) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tournamentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create match.");
      setMatches((prev) => [...prev, data.match].sort((a, b) => a.matchNo - b.matchNo));
      setShowCreate(false);
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setModalLoading(false);
    }
  };

  // Edit match
  const handleEdit = async (form: typeof defaultForm) => {
    if (!editTarget) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch(`/api/matches/${editTarget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update match.");
      setMatches((prev) =>
        prev.map((m) => (m._id === editTarget._id ? data.match : m)).sort((a, b) => a.matchNo - b.matchNo)
      );
      setEditTarget(null);
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setModalLoading(false);
    }
  };

  // Delete match
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/matches/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete match.");
      setMatches((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setModalLoading(false);
    }
  };

  // Build toss description for the match card
  const getTossDesc = (match: Match) => {
    const winner = match.tossWonBy === "team1" ? match.team1Name : match.team2Name;
    return `${winner} win toss and chose to ${match.optedTo}`;
  };

  // Build initial form for editing
  const buildEditForm = (match: Match): typeof defaultForm => ({
    team1Name: match.team1Name,
    team2Name: match.team2Name,
    overs: match.overs,
    matchNo: match.matchNo,
    tossWonBy: match.tossWonBy,
    optedTo: match.optedTo,
    matchTied: match.matchTied,
    ballsPerOver: match.ballsPerOver,
    matchType: match.matchType,
  });

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading" || status === "unauthenticated" || pageLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#03041c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-semibold tracking-wider font-space animate-pulse">
            LOADING TOURNAMENT...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-[#03041c] text-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-bold font-space text-lg">Something went wrong</p>
            <p className="text-zinc-400 text-sm mt-1">{fetchError}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadPage} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm cursor-pointer">Retry</button>
            <Link href="/tournaments" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold rounded-lg text-sm">← Back</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#03041c] text-white font-sans select-none relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-amber-600/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-blue-600/5 blur-[130px] pointer-events-none" />

      <Header />

      <main className="flex-1 py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-10 font-outfit z-10">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/tournaments" className="hover:text-amber-400 transition-colors font-semibold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Tournaments
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300 font-semibold truncate max-w-[200px]">{tournament?.name}</span>
        </div>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full w-fit border border-amber-500/20">
              Tournament
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-space">
              {tournament?.name}
            </h1>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{tournament?.location}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-6 bg-[#07092e] border border-zinc-800/60 rounded-xl p-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Matches</span>
              <span className="text-2xl font-black font-space text-amber-400">{matches.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Live</span>
              <span className="text-2xl font-black font-space text-red-400">{matches.filter(m => m.status === "Live").length}</span>
            </div>
            <div className="w-[1px] h-8 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Completed</span>
              <span className="text-2xl font-black font-space text-emerald-400">{matches.filter(m => m.status === "Completed").length}</span>
            </div>
          </div>
        </div>

        {/* ── Controls Bar ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="font-semibold">
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          </div>
          <button
            onClick={() => { setShowCreate(true); setModalError(null); }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold text-xs tracking-wider px-5 py-2.5 rounded-lg shadow-md shadow-amber-500/10 transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            CREATE MATCH
          </button>
        </div>

        {/* ── Empty State ──────────────────────────────────────────────────── */}
        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-[#07092e]/30 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-zinc-300 font-bold tracking-wider font-space text-base">NO MATCHES YET</p>
              <p className="text-zinc-500 text-xs text-center max-w-xs">
                Create your first match to start managing this tournament.
              </p>
            </div>
            <button
              onClick={() => { setShowCreate(true); setModalError(null); }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold text-sm tracking-wider px-6 py-3 rounded-xl shadow-md shadow-amber-500/10 transition-all duration-200 cursor-pointer"
            >
              + CREATE FIRST MATCH
            </button>
          </div>
        )}

        {/* ── Match List ───────────────────────────────────────────────────── */}
        {matches.length > 0 && (
          <div className="flex flex-col gap-3">
            {matches.map((match, index) => (
              <div
                key={match._id}
                className="group relative flex flex-col sm:flex-row sm:items-center gap-4 bg-[#07092e] border border-zinc-800/60 rounded-2xl px-5 py-4 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
              >
                {/* Left gradient accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Match Number Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#121542] border border-zinc-700/60 flex items-center justify-center ml-1">
                  <span className="text-amber-400 font-black font-space text-sm">#{match.matchNo}</span>
                </div>

                {/* Match Info */}
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  {/* Team names */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-white font-space group-hover:text-amber-400 transition-colors">
                      {match.team1Name.toUpperCase()}
                      <span className="text-zinc-500 font-normal mx-2">vs</span>
                      {match.team2Name.toUpperCase()}
                    </h3>
                    <TypeBadge type={match.matchType} />
                  </div>

                  {/* Toss & match details row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-semibold">
                    <span className="text-zinc-300">{getTossDesc(match).toUpperCase()}</span>
                    <span className="text-zinc-700">•</span>
                    <span>Overs: <span className="text-zinc-200">{match.overs}</span></span>
                    <span className="text-zinc-700">•</span>
                    <span>{match.ballsPerOver} balls/over</span>
                    {match.matchTied && (
                      <>
                        <span className="text-zinc-700">•</span>
                        <span className="text-amber-400">TIED</span>
                      </>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={match.status} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
                  {/* MATCH PAGE */}
                  <Link
                    href={`/matches/${match._id}`}
                    className="flex items-center gap-1.5 bg-[#121542] hover:bg-[#191e6a] border border-zinc-700/60 text-zinc-200 hover:text-white font-bold text-xs tracking-wider px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    MATCH PAGE
                  </Link>

                  {/* Edit */}
                  <button
                    onClick={() => { setEditTarget(match); setModalError(null); }}
                    title="Edit match"
                    className="w-9 h-9 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => { setDeleteTarget(match); setModalError(null); }}
                    title="Delete match"
                    className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showCreate && (
        <MatchModal
          mode="create"
          onClose={() => { setShowCreate(false); setModalError(null); }}
          onSubmit={handleCreate}
          loading={modalLoading}
          error={modalError}
        />
      )}

      {editTarget && (
        <MatchModal
          mode="edit"
          initial={buildEditForm(editTarget)}
          onClose={() => { setEditTarget(null); setModalError(null); }}
          onSubmit={handleEdit}
          loading={modalLoading}
          error={modalError}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          matchLabel={`${deleteTarget.team1Name} vs ${deleteTarget.team2Name}`}
          onConfirm={handleDelete}
          onClose={() => { setDeleteTarget(null); setModalError(null); }}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
