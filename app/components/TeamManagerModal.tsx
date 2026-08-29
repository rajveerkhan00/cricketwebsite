"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export interface IPlayerForm {
  name: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isWicketKeeper: boolean;
  role: "Batsman" | "Fast Bowler" | "Spin Bowler" | "Bowler" | "All Rounder" | "Wicket Keeper Batsman";
}

export interface ISavedTeam {
  _id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  players: IPlayerForm[];
  createdAt?: string;
  updatedAt?: string;
}

const PLAYER_ROLES = [
  "Batsman",
  "Fast Bowler",
  "Spin Bowler",
  "All Rounder",
  "Wicket Keeper Batsman",
  "Bowler",
] as const;

export default function TeamManagerModal({
  isOpen,
  onClose,
  onTeamSelected,
  targetSlot,
}: {
  isOpen: boolean;
  onClose: () => void;
  onTeamSelected?: (team: ISavedTeam, slot?: "team1" | "team2") => void;
  targetSlot?: "team1" | "team2";
}) {
  const [teams, setTeams] = useState<ISavedTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  // Form states
  const [teamName, setTeamName] = useState("");
  const [shortName, setShortName] = useState("");
  const [players, setPlayers] = useState<IPlayerForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teams", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.teams) {
        setTeams(data.teams);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      setView("list");
      setEditingTeamId(null);
    }
  }, [isOpen]);

  const initEmptyPlayers = (): IPlayerForm[] => {
    return Array.from({ length: 11 }, (_, i) => ({
      name: "",
      isCaptain: i === 0,
      isViceCaptain: i === 1,
      isWicketKeeper: i === 2,
      role: i < 5 ? "Batsman" : i < 7 ? "All Rounder" : "Fast Bowler",
    }));
  };

  const handleOpenNewTeam = () => {
    setEditingTeamId(null);
    setTeamName("");
    setShortName("");
    setPlayers(initEmptyPlayers());
    setView("form");
  };

  const handleOpenEditTeam = (team: ISavedTeam) => {
    setEditingTeamId(team._id);
    setTeamName(team.name);
    setShortName(team.shortName || "");
    
    // Ensure at least 11 rows exist
    const teamPlayers = Array.isArray(team.players) ? [...team.players] : [];
    while (teamPlayers.length < 11) {
      teamPlayers.push({
        name: "",
        isCaptain: false,
        isViceCaptain: false,
        isWicketKeeper: false,
        role: "Batsman",
      });
    }
    setPlayers(teamPlayers);
    setView("form");
  };

  const handlePlayerChange = (index: number, field: keyof IPlayerForm, val: any) => {
    setPlayers((prev) => {
      const next = [...prev];
      const current = { ...next[index], [field]: val };

      // Enforce single captain if captain is toggled on
      if (field === "isCaptain" && val === true) {
        next.forEach((p, idx) => {
          if (idx !== index) p.isCaptain = false;
        });
      }
      // Enforce single vice-captain
      if (field === "isViceCaptain" && val === true) {
        next.forEach((p, idx) => {
          if (idx !== index) p.isViceCaptain = false;
        });
      }

      next[index] = current;
      return next;
    });
  };

  const handleAddPlayerRow = () => {
    setPlayers((prev) => [
      ...prev,
      {
        name: "",
        isCaptain: false,
        isViceCaptain: false,
        isWicketKeeper: false,
        role: "Batsman",
      },
    ]);
  };

  const handleRemovePlayerRow = (index: number) => {
    setPlayers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error("Please enter a team name.");
      return;
    }

    const validPlayers = players.filter((p) => p.name.trim().length > 0);
    if (validPlayers.length === 0) {
      toast.error("Please add at least 1 player name.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: teamName.trim(),
        shortName: shortName.trim(),
        players: validPlayers,
      };

      const url = editingTeamId ? `/api/teams/${editingTeamId}` : "/api/teams";
      const method = editingTeamId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save team");
      }

      toast.success(editingTeamId ? "Team updated successfully!" : "Team created successfully!");
      fetchTeams();
      setView("list");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete team");
      }
      toast.success("Team deleted.");
      setDeleteConfirmId(null);
      fetchTeams();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete team");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-400">
              🏏
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                {view === "list" ? "Team Manager" : editingTeamId ? "Edit Team Squad" : "Create New Team Squad"}
                {targetSlot && (
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Importing to {targetSlot === "team1" ? "Team 1" : "Team 2"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {view === "list"
                  ? "Manage your saved 11-player squads and import them directly into matches."
                  : "Specify player names, designations ((C), (VC), (WK)) and playing roles."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view === "list" && (
              <button
                type="button"
                onClick={handleOpenNewTeam}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>+</span> Add Team
              </button>
            )}
            {view === "form" && (
              <button
                type="button"
                onClick={() => setView("list")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 transition cursor-pointer"
              >
                ← Back to List
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {view === "list" ? (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm font-semibold">Loading your saved teams...</p>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-3xl flex items-center justify-center mx-auto mb-4 text-amber-600">
                    👥
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No Saved Teams Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                    Create your 11-member cricket squads with captains, vice captains, and player roles once, then import them into any match with one click!
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenNewTeam}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    + Create Your First Team
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team) => {
                    const captain = team.players.find((p) => p.isCaptain);
                    const vc = team.players.find((p) => p.isViceCaptain);
                    const wk = team.players.find((p) => p.isWicketKeeper);

                    return (
                      <div
                        key={team._id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Top banner accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm border border-slate-700 shadow-sm flex-shrink-0">
                                {team.shortName || team.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-amber-600 transition">
                                  {team.name}
                                </h4>
                                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                                  {team.players.length} Players Squad
                                </span>
                              </div>
                            </div>

                            {onTeamSelected && (
                              <button
                                type="button"
                                onClick={() => {
                                  onTeamSelected(team, targetSlot);
                                  onClose();
                                  toast.success(`Imported ${team.name} (${team.players.length} players)!`);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
                              >
                                <span>📥</span> Select
                              </button>
                            )}
                          </div>

                          {/* Key Roles Highlights */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {captain && (
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                👑 (C): {captain.name}
                              </span>
                            )}
                            {vc && (
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                                🛡️ (VC): {vc.name}
                              </span>
                            )}
                            {wk && (
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                🧤 (WK): {wk.name}
                              </span>
                            )}
                          </div>

                          {/* Squad Names Preview */}
                          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-3 max-h-24 overflow-y-auto">
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {team.players.map((p, i) => (
                                <span key={i} className="inline-block mr-2 mb-1">
                                  <span className="font-semibold text-slate-800">{p.name}</span>
                                  {p.isCaptain && <span className="text-amber-600 font-bold ml-0.5">(C)</span>}
                                  {p.isViceCaptain && <span className="text-purple-600 font-bold ml-0.5">(VC)</span>}
                                  {p.isWicketKeeper && <span className="text-blue-600 font-bold ml-0.5">(WK)</span>}
                                  {i < team.players.length - 1 && <span className="text-slate-300 ml-1.5">•</span>}
                                </span>
                              ))}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditTeam(team)}
                              className="text-slate-600 hover:text-amber-600 font-bold flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-amber-50 transition cursor-pointer"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(team._id)}
                              className="text-slate-500 hover:text-red-600 font-bold flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                            >
                              🗑️ Delete
                            </button>
                          </div>

                          {deleteConfirmId === team._id && (
                            <div className="flex items-center gap-1.5 animate-fadeIn">
                              <span className="text-[11px] font-bold text-red-600">Delete team?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTeam(team._id)}
                                className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Team Form View */
            <form onSubmit={handleSaveTeam} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Team Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Lahore Qalandars, Ahmad 11, etc."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Short Code / Abbr
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. LQ, A11"
                    maxLength={5}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm uppercase focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Player Roster Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                      👥 Squad Members ({players.filter((p) => p.name.trim()).length} Filled)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Fill up to 11+ players. Designate Captain (C), Vice-Captain (VC), and Wicket Keeper (WK).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPlayerRow}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-300 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>+</span> Add Player Row
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {players.map((player, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-wrap items-center gap-2 p-2.5 rounded-lg border transition ${
                        player.isCaptain
                          ? "bg-amber-50/70 border-amber-200"
                          : player.isViceCaptain
                          ? "bg-purple-50/70 border-purple-200"
                          : player.isWicketKeeper
                          ? "bg-blue-50/70 border-blue-200"
                          : "bg-slate-50/70 border-slate-200"
                      }`}
                    >
                      {/* Player Index */}
                      <span className="w-6 text-center font-black text-xs text-slate-400">
                        {idx + 1}.
                      </span>

                      {/* Player Name */}
                      <div className="flex-1 min-w-[160px]">
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerChange(idx, "name", e.target.value)}
                          placeholder={`Player ${idx + 1} Name`}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Playing Role */}
                      <div className="w-[140px]">
                        <select
                          value={player.role}
                          onChange={(e) => handlePlayerChange(idx, "role", e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-800 rounded-md px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-amber-500"
                        >
                          {PLAYER_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Role Designations Toggles */}
                      <div className="flex items-center gap-1">
                        {/* Captain */}
                        <button
                          type="button"
                          onClick={() => handlePlayerChange(idx, "isCaptain", !player.isCaptain)}
                          title="Captain (C)"
                          className={`text-[11px] font-black px-2 py-1 rounded transition cursor-pointer ${
                            player.isCaptain
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-white text-slate-500 border border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          C
                        </button>

                        {/* Vice Captain */}
                        <button
                          type="button"
                          onClick={() => handlePlayerChange(idx, "isViceCaptain", !player.isViceCaptain)}
                          title="Vice Captain (VC)"
                          className={`text-[11px] font-black px-2 py-1 rounded transition cursor-pointer ${
                            player.isViceCaptain
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-white text-slate-500 border border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          VC
                        </button>

                        {/* Wicket Keeper */}
                        <button
                          type="button"
                          onClick={() => handlePlayerChange(idx, "isWicketKeeper", !player.isWicketKeeper)}
                          title="Wicket Keeper (WK)"
                          className={`text-[11px] font-black px-2 py-1 rounded transition cursor-pointer ${
                            player.isWicketKeeper
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-white text-slate-500 border border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          WK
                        </button>
                      </div>

                      {/* Remove Row Button */}
                      {players.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayerRow(idx)}
                          className="w-7 h-7 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                          title="Remove player"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving Team..." : editingTeamId ? "Update Team" : "Save Team"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
