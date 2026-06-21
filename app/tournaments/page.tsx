"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

interface Tournament {
  _id: string;
  name: string;
  location: string;
  createdAt: string;
}

// ─── Modal Component ─────────────────────────────────────────────────────────
function TournamentModal({
  mode,
  initial,
  onClose,
  onSubmit,
  loading,
}: {
  mode: "create" | "edit";
  initial?: { name: string; location: string };
  onClose: () => void;
  onSubmit: (name: string, location: string) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, location);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-md bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in">
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
              {mode === "create" ? (
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-white font-space tracking-wide">
              {mode === "create" ? "Create Tournament" : "Edit Tournament"}
            </h2>
            <p className="text-xs text-zinc-400">
              {mode === "create"
                ? "Set up a new tournament for your cricket league"
                : "Update your tournament details"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Tournament Name
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. KSL Premier League"
                className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-zinc-600"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Tournament Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                className="w-full bg-[#121542] border border-zinc-700/60 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-zinc-600"
                required
                disabled={loading}
              />
            </div>

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
                  mode === "create" ? "ADD TOURNAMENT" : "SAVE CHANGES"
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
  name,
  onConfirm,
  onClose,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="p-7 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-space">Delete Tournament?</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">"{name}"</span>?<br />This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 active:scale-95 text-white font-bold py-2.5 rounded-lg text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : "DELETE"}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Tournaments() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Tournament | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch tournaments
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchTournaments();
  }, [status]);

  const fetchTournaments = async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch.");
      setTournaments(data.tournaments);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load tournaments.");
    } finally {
      setFetchLoading(false);
    }
  };

  // Create
  const handleCreate = async (name: string, location: string) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create.");
      setTournaments((prev) => [data.tournament, ...prev]);
      setShowCreate(false);
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setModalLoading(false);
    }
  };

  // Edit
  const handleEdit = async (name: string, location: string) => {
    if (!editTarget) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch(`/api/tournaments/${editTarget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update.");
      setTournaments((prev) =>
        prev.map((t) => (t._id === editTarget._id ? data.tournament : t))
      );
      setEditTarget(null);
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setModalLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setTournaments((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ─── Loading / Auth Gate ───────────────────────────────────────────────────
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#03041c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-semibold tracking-wider font-space animate-pulse">
            LOADING TOURNAMENTS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#03041c] text-white font-sans select-none relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      <Header />

      <main className="flex-1 py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-10 font-outfit z-10">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full w-fit border border-amber-500/20">
              CrickproBD Arena
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-space">
              My <span className="text-amber-500">Tournaments</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Create and manage your cricket tournaments. Each tournament is private to your account.
            </p>
          </div>

          {/* Stats panel */}
          <div className="hidden lg:flex items-center gap-6 bg-[#07092e] border border-zinc-800/60 rounded-xl p-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total</span>
              <span className="text-2xl font-black font-space text-amber-400">{tournaments.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Logged In As</span>
              <span className="text-sm font-bold text-white truncate max-w-[140px]">{session?.user?.name}</span>
            </div>
          </div>
        </div>

        {/* ── Controls Bar ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-semibold">
              {fetchLoading ? "Loading..." : `${tournaments.length} tournament${tournaments.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <button
            onClick={() => { setShowCreate(true); setModalError(null); }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold text-xs tracking-wider px-5 py-2.5 rounded-lg shadow-md shadow-amber-500/10 transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            CREATE TOURNAMENT
          </button>
        </div>

        {/* ── Error State ──────────────────────────────────────────────────── */}
        {fetchError && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl p-4 font-semibold">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fetchError}
            <button onClick={fetchTournaments} className="ml-auto underline text-xs cursor-pointer">Retry</button>
          </div>
        )}

        {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
        {fetchLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#07092e] border border-zinc-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Empty State ──────────────────────────────────────────────────── */}
        {!fetchLoading && !fetchError && tournaments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-[#07092e]/30 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-zinc-300 font-bold tracking-wider font-space text-base">NO TOURNAMENTS YET</p>
              <p className="text-zinc-500 text-xs text-center max-w-xs">
                Create your first tournament to get started managing your cricket league.
              </p>
            </div>
            <button
              onClick={() => { setShowCreate(true); setModalError(null); }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold text-sm tracking-wider px-6 py-3 rounded-xl shadow-md shadow-amber-500/10 transition-all duration-200 cursor-pointer"
            >
              + CREATE YOUR FIRST TOURNAMENT
            </button>
          </div>
        )}

        {/* ── Tournament List ──────────────────────────────────────────────── */}
        {!fetchLoading && !fetchError && tournaments.length > 0 && (
          <div className="flex flex-col gap-3">
            {tournaments.map((tournament, index) => (
              <div
                key={tournament._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#07092e] border border-zinc-800/60 rounded-2xl px-5 py-4 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 relative overflow-hidden"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Left accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Tournament Info */}
                <div className="flex items-center gap-4 min-w-0 pl-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white font-space truncate group-hover:text-amber-400 transition-colors">
                      {tournament.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <svg className="w-3 h-3 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-zinc-400 truncate">{tournament.location}</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-xs text-zinc-500">{formatDate(tournament.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
                  {/* TOUR PAGE */}
                  <Link
                    href={`/tournaments/${tournament._id}`}
                    className="flex items-center gap-1.5 bg-[#121542] hover:bg-[#191e6a] border border-zinc-700/60 text-zinc-200 hover:text-white font-bold text-xs tracking-wider px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    TOUR PAGE
                  </Link>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditTarget(tournament);
                      setModalError(null);
                    }}
                    title="Edit tournament"
                    className="w-9 h-9 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      setDeleteTarget(tournament);
                      setModalError(null);
                    }}
                    title="Delete tournament"
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
        <TournamentModal
          mode="create"
          onClose={() => { setShowCreate(false); setModalError(null); }}
          onSubmit={handleCreate}
          loading={modalLoading}
        />
      )}

      {editTarget && (
        <TournamentModal
          mode="edit"
          initial={{ name: editTarget.name, location: editTarget.location }}
          onClose={() => { setEditTarget(null); setModalError(null); }}
          onSubmit={handleEdit}
          loading={modalLoading}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => { setDeleteTarget(null); setModalError(null); }}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
