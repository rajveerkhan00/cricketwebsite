"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { toast } from "react-toastify";
import TeamManagerModal, { ISavedTeam } from "../components/TeamManagerModal";
import ScoreboardLinksModal from "../components/ScoreboardLinksModal";

interface MatchItem {
  _id: string;
  tournamentId: {
    _id: string;
    name: string;
    location?: string;
  } | string;
  tournamentName?: string;
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
  playersTeam1?: string[];
  playersTeam2?: string[];
  scoringState?: any;
}

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matches" | "teams">("matches");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedMatchForLinks, setSelectedMatchForLinks] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Live" | "Not Started" | "Completed">("All");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      // Fetch tournaments first to get all user's matches
      const tRes = await fetch("/api/tournaments", { cache: "no-store" });
      const tData = await tRes.json();
      if (!tRes.ok || !tData.tournaments) {
        setMatches([]);
        return;
      }

      const allMatches: MatchItem[] = [];
      for (const t of tData.tournaments) {
        const mRes = await fetch(`/api/matches?tournamentId=${t._id}`, { cache: "no-store" });
        const mData = await mRes.json();
        if (mRes.ok && mData.matches) {
          mData.matches.forEach((m: any) => {
            allMatches.push({
              ...m,
              tournamentName: t.name,
            });
          });
        }
      }

      // Sort by newest created first
      allMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMatches(allMatches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMatches();
    }
  }, [session]);

  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      m.team1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.team2Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tournamentName && m.tournamentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
                <span>🏏</span> Match & Team Management Hub
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Cricket Matches & Saved Squads
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Create and manage your 11-player cricket squads with designated captains, wicket-keepers, and roles. Import them instantly into live scoring!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                <span>👥</span> + Add / Manage Teams
              </button>

              <Link
                href="/tournaments"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow transition active:scale-95"
              >
                <span>🏆</span> Go to Tournaments
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800">
            <button
              onClick={() => setActiveTab("matches")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === "matches"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <span>📋</span> All Matches ({matches.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("teams");
                setIsTeamModalOpen(true);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === "teams"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <span>👥</span> Saved Teams & 11-Player Rosters
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or tournament..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {(["All", "Live", "Not Started", "Completed"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Loading matches & squads...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-3xl flex items-center justify-center mx-auto mb-4 text-amber-600">
              🏏
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Matches Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Create a tournament or add a match to get started with live overlay scoring!
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition active:scale-95 cursor-pointer"
              >
                + Create Squad / Team
              </button>
              <Link
                href="/tournaments"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition active:scale-95"
              >
                Go to Tournaments
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((m) => {
              const isLive = m.status === "Live";
              const isCompleted = m.status === "Completed";
              const score = m.scoringState?.score ?? 0;
              const wickets = m.scoringState?.wickets ?? 0;
              const balls = m.scoringState?.balls ?? 0;
              const oversDone = `${Math.floor(balls / (m.ballsPerOver || 6))}.${balls % (m.ballsPerOver || 6)}`;

              return (
                <div
                  key={m._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Status Top Stripe */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      isLive
                        ? "bg-gradient-to-r from-red-500 to-amber-500 animate-pulse"
                        : isCompleted
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  <div>
                    {/* Card Header: Tournament & Match No */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[180px]">
                        {m.tournamentName || "Tournament"} • Match #{m.matchNo}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isLive
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {/* Teams Clash */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                      {/* Team 1 */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center">
                            {m.team1Name.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-sm text-slate-900 truncate max-w-[160px]">
                            {m.team1Name}
                          </span>
                        </div>
                        {m.playersTeam1 && m.playersTeam1.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                            👥 {m.playersTeam1.length}
                          </span>
                        )}
                      </div>

                      <div className="text-center my-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VS</span>
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-black text-[10px] flex items-center justify-center">
                            {m.team2Name.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-sm text-slate-900 truncate max-w-[160px]">
                            {m.team2Name}
                          </span>
                        </div>
                        {m.playersTeam2 && m.playersTeam2.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                            👥 {m.playersTeam2.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Match Details / Live Figures */}
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-4 px-1">
                      <span>
                        <strong className="text-slate-900">{m.overs}</strong> Overs •{" "}
                        <strong className="text-slate-900">{m.ballsPerOver || 6}</strong> Balls/Over
                      </span>
                      {m.scoringState && (
                        <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {score}/{wickets} ({oversDone} ov)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/matches/${m._id}`}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg text-center shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>🎮</span> Scoring Panel
                      </Link>

                      <Link
                        href={`/matches/${m._id}/overlay`}
                        target="_blank"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-lg text-center shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>📺</span> Overlay
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedMatchForLinks(m)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>🔗</span> Scoreboard Overlay Links
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Team Manager Modal */}
      <TeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setActiveTab("matches");
        }}
      />

      {/* Scoreboard Links Modal */}
      {selectedMatchForLinks && (
        <ScoreboardLinksModal
          isOpen={!!selectedMatchForLinks}
          onClose={() => setSelectedMatchForLinks(null)}
          matchId={selectedMatchForLinks._id}
          showToast={(msg, type) => {
            if (type === "error") toast.error(msg);
            else toast.success(msg);
          }}
          userEmail={session?.user?.email || ""}
        />
      )}

      <Footer />
    </div>
  );
}
