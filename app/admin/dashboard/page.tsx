"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  restricted: boolean;
  createdAt: string;
}

interface PricingTierRecord {
  _id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  featured: boolean;
  order: number;
  planType?: "basic" | "professional" | "enterprise" | null;
}

interface ScoreboardThemeRecord {
  _id: string;
  themeId: number;
  name: string;
  slug: string;
  price: number;
  badge?: string;
}

interface PaymentRecord {
  _id: string;
  email: string;
  senderNumber: string;
  trxId: string;
  itemName: string;
  itemPrice: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  matchId?: string;
}


// ── Create User Modal ──────────────────────────────────────────────────────────
function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create user.");
      } else {
        toast.success(`User "${name}" created successfully!`);
        onCreated();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#07092e] border border-zinc-700/60 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white font-space">Create New User</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
function DeleteConfirmModal({
  user,
  onClose,
  onDeleted,
}: {
  user: UserRecord;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete user.");
      } else {
        toast.success(`User "${user.name}" deleted successfully.`);
        onDeleted();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-space">Delete User?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              This will permanently delete <span className="text-white font-semibold">{user.name}</span>.
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit User Modal ───────────────────────────────────────────────────────────
function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: UserRecord;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">(user.role);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update user.");
      } else {
        toast.success(`User "${name}" updated successfully!`);
        onUpdated();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#07092e] border border-zinc-700/60 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-space">Edit User</h2>
              <p className="text-[11px] text-zinc-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
              New Password
              <span className="normal-case font-normal text-zinc-600 tracking-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all duration-200"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Create Pricing Modal ───────────────────────────────────────────────────────
function CreatePricingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState("0");
  const [planType, setPlanType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const features = featuresText.split("\n").map(f => f.trim()).filter(Boolean);
      const res = await fetch("/api/admin/pricing-tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          period,
          description,
          features,
          buttonText,
          featured,
          order: Number(order) || 0,
          planType: planType || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create plan.");
      } else {
        toast.success(`Plan "${name}" created successfully!`);
        onCreated();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#07092e] border border-zinc-700/60 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white font-space">Create Pricing Plan</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Name</label>
              <input
                type="text"
                placeholder="e.g. Pro Plan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Price String</label>
              <input
                type="text"
                placeholder="e.g. PKR 4,999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Period</label>
              <input
                type="text"
                placeholder="e.g. per month or forever"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Button Text</label>
              <input
                type="text"
                placeholder="e.g. Choose Pro"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Order (for sorting)</label>
              <input
                type="number"
                placeholder="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 text-amber-500 focus:ring-amber-500 bg-[#0d0f3a]"
              />
              <label htmlFor="featured-checkbox" className="text-xs font-semibold tracking-wider text-zinc-400 uppercase cursor-pointer">
                Featured / Popular Plan
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Type (Automatic 15 Scoreboard Unlock)</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">None (Per-Theme / Custom)</option>
              <option value="basic">Basic (1 Day Unlock)</option>
              <option value="professional">Professional (1 Week Unlock)</option>
              <option value="enterprise">Enterprise (1 Month Unlock)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Description</label>
            <textarea
              placeholder="Enter plan brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Features (One per line)
            </label>
            <textarea
              placeholder="Standard Cricket Score Overlay&#10;Manual Score Inputs&#10;OBS Integrations"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              required
              rows={4}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Pricing Modal ─────────────────────────────────────────────────────────
function EditPricingModal({
  tier,
  onClose,
  onUpdated,
}: {
  tier: PricingTierRecord;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(tier.name);
  const [price, setPrice] = useState(tier.price);
  const [period, setPeriod] = useState(tier.period);
  const [description, setDescription] = useState(tier.description);
  const [featuresText, setFeaturesText] = useState(tier.features.join("\n"));
  const [buttonText, setButtonText] = useState(tier.buttonText);
  const [featured, setFeatured] = useState(tier.featured);
  const [order, setOrder] = useState(String(tier.order || 0));
  const [planType, setPlanType] = useState(tier.planType || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const features = featuresText.split("\n").map(f => f.trim()).filter(Boolean);
      const res = await fetch(`/api/admin/pricing-tiers/${tier._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          period,
          description,
          features,
          buttonText,
          featured,
          order: Number(order) || 0,
          planType: planType || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update plan.");
      } else {
        toast.success(`Plan "${name}" updated successfully!`);
        onUpdated();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#07092e] border border-zinc-700/60 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white font-space">Edit Pricing Plan</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Price String</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Period</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="edit-featured-checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 text-blue-500 focus:ring-blue-500 bg-[#0d0f3a]"
              />
              <label htmlFor="edit-featured-checkbox" className="text-xs font-semibold tracking-wider text-zinc-400 uppercase cursor-pointer">
                Featured / Popular Plan
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Type (Automatic 15 Scoreboard Unlock)</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">None (Per-Theme / Custom)</option>
              <option value="basic">Basic (1 Day Unlock)</option>
              <option value="professional">Professional (1 Week Unlock)</option>
              <option value="enterprise">Enterprise (1 Month Unlock)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center justify-between">
              Features (One per line)
            </label>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              required
              rows={4}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Pricing Confirm Modal ───────────────────────────────────────────────
function DeletePricingConfirmModal({
  tier,
  onClose,
  onDeleted,
}: {
  tier: PricingTierRecord;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pricing-tiers/${tier._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete plan.");
      } else {
        toast.success(`Plan "${tier.name}" deleted successfully.`);
        onDeleted();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-space">Delete Pricing Plan?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              This will permanently delete the pricing plan <span className="text-white font-semibold">{tier.name}</span>.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create Scoreboard Theme Modal ──────────────────────────────────────────────
function CreateScoreboardThemeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [themeId, setThemeId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scoreboard-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: Number(themeId),
          name,
          slug,
          price: Number(price),
          badge: badge || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create theme.");
      } else {
        toast.success(`Theme "${name}" created successfully!`);
        onCreated();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#07092e] border border-zinc-700/60 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white font-space">Create Scoreboard Theme</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme ID (Unique No.)</label>
              <input
                type="number"
                placeholder="e.g. 16"
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme Name</label>
              <input
                type="text"
                placeholder="e.g. IPL 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme Slug</label>
            <input
              type="text"
              placeholder="e.g. ipl-2026"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Price (PKR/day)</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Badge (Optional)</label>
              <input
                type="text"
                placeholder="e.g. NEW"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center"
            >
              {loading ? "Creating..." : "Create Theme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Scoreboard Theme Modal ────────────────────────────────────────────────
function EditScoreboardThemeModal({
  theme,
  onClose,
  onUpdated,
}: {
  theme: ScoreboardThemeRecord;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [themeId, setThemeId] = useState(String(theme.themeId));
  const [name, setName] = useState(theme.name);
  const [slug, setSlug] = useState(theme.slug);
  const [price, setPrice] = useState(String(theme.price));
  const [badge, setBadge] = useState(theme.badge || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/scoreboard-themes/${theme._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: Number(themeId),
          name,
          slug,
          price: Number(price),
          badge: badge || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update theme.");
      } else {
        toast.success(`Theme "${name}" updated successfully!`);
        onUpdated();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#07092e] border border-zinc-700/60 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white font-space">Edit Scoreboard Theme</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme ID (Unique No.)</label>
              <input
                type="number"
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Price (PKR/day)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Scoreboard Theme Confirm Modal ──────────────────────────────────────
function DeleteScoreboardThemeConfirmModal({
  theme,
  onClose,
  onDeleted,
}: {
  theme: ScoreboardThemeRecord;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/scoreboard-themes/${theme._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete theme.");
      } else {
        toast.success(`Theme "${theme.name}" deleted successfully.`);
        onDeleted();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-space">Delete Scoreboard Theme?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              This will permanently delete the theme <span className="text-white font-semibold">{theme.name}</span>.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Send Custom Email Modal ───────────────────────────────────────────────────
function SendCustomEmailModal({
  payment,
  onClose,
}: {
  payment: PaymentRecord;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("CricOverlay Account Credentials");
  const [body, setBody] = useState(
    `Hello,\n\nThank you for your payment. Your transaction has been verified!\n\nHere are your account credentials:\nEmail: ${payment.email}\nPassword: \n\nYou can log in at: ${window.location.origin}/login\n\nRegards,\nCricOverlay Team`
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${payment._id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to send email.");
      } else {
        toast.success(`Credentials sent successfully to ${payment.email}!`);
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#07092e] border border-zinc-700/60 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-space">Send Credentials / Email</h2>
              <p className="text-[11px] text-zinc-500">To: {payment.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center justify-between">
              Email Body Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Payment Confirm Modal ──────────────────────────────────────────────
function DeletePaymentConfirmModal({
  payment,
  onClose,
  onDeleted,
}: {
  payment: PaymentRecord;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${payment._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete payment log.");
      } else {
        toast.success(`Payment log deleted successfully.`);
        onDeleted();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-7 shadow-2xl shadow-black/60 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-space">Delete Transaction Log?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Delete the payment log for <span className="text-white font-semibold">{payment.email}</span> (TRX ID: {payment.trxId})?
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<"users" | "pricing" | "scoreboard" | "payments">("users");

  // Users Tab states
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [restrictingId, setRestrictingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false);

  // Pricing Tab states
  const [pricingTiers, setPricingTiers] = useState<PricingTierRecord[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [showCreatePricingModal, setShowCreatePricingModal] = useState(false);
  const [editPricingTarget, setEditPricingTarget] = useState<PricingTierRecord | null>(null);
  const [deletePricingTarget, setDeletePricingTarget] = useState<PricingTierRecord | null>(null);

  // Scoreboard Tab states
  const [scoreboardThemes, setScoreboardThemes] = useState<ScoreboardThemeRecord[]>([]);
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);
  const [showCreateScoreboardModal, setShowCreateScoreboardModal] = useState(false);
  const [editScoreboardTarget, setEditScoreboardTarget] = useState<ScoreboardThemeRecord | null>(null);
  const [deleteScoreboardTarget, setDeleteScoreboardTarget] = useState<ScoreboardThemeRecord | null>(null);

  // Payments Tab states
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [deletePaymentTarget, setDeletePaymentTarget] = useState<PaymentRecord | null>(null);
  const [emailTarget, setEmailTarget] = useState<PaymentRecord | null>(null);
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState("");
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

  // Client-side guard (middleware handles server-side)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [session, status, router]);

  // Data fetching functions
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchPricingTiers = useCallback(async () => {
    setLoadingPricing(true);
    try {
      const res = await fetch("/api/pricing-tiers");
      if (!res.ok) throw new Error("Failed to load plans");
      const data = await res.json();
      setPricingTiers(data.tiers || []);
    } catch {
      toast.error("Failed to load pricing plans.");
    } finally {
      setLoadingPricing(false);
    }
  }, []);

  const fetchScoreboardThemes = useCallback(async () => {
    setLoadingScoreboard(true);
    try {
      const res = await fetch("/api/scoreboard-themes");
      if (!res.ok) throw new Error("Failed to load themes");
      const data = await res.json();
      setScoreboardThemes(data.themes || []);
    } catch {
      toast.error("Failed to load scoreboard themes.");
    } finally {
      setLoadingScoreboard(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch("/api/admin/payments");
      if (!res.ok) throw new Error("Failed to load payments");
      const data = await res.json();
      setPayments(data.payments || []);
    } catch {
      toast.error("Failed to load payments.");
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  // Fetch logic based on active tab
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "admin") {
      if (activeTab === "users" && !hasFetchedUsers) {
        fetchUsers();
        setHasFetchedUsers(true);
      } else if (activeTab === "pricing") {
        fetchPricingTiers();
      } else if (activeTab === "scoreboard") {
        fetchScoreboardThemes();
      } else if (activeTab === "payments") {
        fetchPayments();
      }
    }
  }, [status, session, activeTab, fetchUsers, fetchPricingTiers, fetchScoreboardThemes, fetchPayments, hasFetchedUsers]);

  // Restrict User Toggle
  const handleToggleRestrict = async (user: UserRecord) => {
    setRestrictingId(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restricted: !user.restricted }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update user.");
      } else {
        toast.success(
          user.restricted
            ? `User "${user.name}" has been unrestricted.`
            : `User "${user.name}" has been restricted.`
        );
        fetchUsers();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setRestrictingId(null);
    }
  };

  // Payment Status / Delete Handlers
  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: "approved" | "rejected") => {
    setUpdatingPaymentId(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update payment status.");
      } else {
        toast.success(`Payment status updated to ${newStatus}.`);
        fetchPayments();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  // Filter payments based on query
  const filteredPayments = payments.filter(
    (p) =>
      p.email.toLowerCase().includes(paymentsSearchQuery.toLowerCase()) ||
      p.trxId.toLowerCase().includes(paymentsSearchQuery.toLowerCase()) ||
      p.itemName.toLowerCase().includes(paymentsSearchQuery.toLowerCase())
  );

  const totalPayments = payments.length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const approvedPayments = payments.filter((p) => p.status === "approved").length;

  // Filter users based on query
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = users.length;
  const totalRestricted = users.filter((u) => u.restricted).length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#03041c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-400 font-outfit text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03041c] font-outfit select-none">
      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[40%] h-[40%] rounded-full bg-red-600/5 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[160px] pointer-events-none" />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-[#05072c] border-r border-white/5 flex flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <div>
              <span className="text-white font-extrabold text-base tracking-tight font-space">
                Crick<span className="text-amber-500">pro</span>BD
              </span>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wider">ADMIN PANEL</p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav with dynamic tabs */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
              activeTab === "users"
                ? "bg-white/5 text-white"
                : "text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer"
            }`}
          >
            <svg className={`w-4 h-4 ${activeTab === "users" ? "text-amber-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
              activeTab === "pricing"
                ? "bg-white/5 text-white"
                : "text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer"
            }`}
          >
            <svg className={`w-4 h-4 ${activeTab === "pricing" ? "text-amber-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pricing Page Content
          </button>

          <button
            onClick={() => setActiveTab("scoreboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
              activeTab === "scoreboard"
                ? "bg-white/5 text-white"
                : "text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer"
            }`}
          >
            <svg className={`w-4 h-4 ${activeTab === "scoreboard" ? "text-amber-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Scoreboard Pricing
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
              activeTab === "payments"
                ? "bg-white/5 text-white"
                : "text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer"
            }`}
          >
            <svg className={`w-4 h-4 ${activeTab === "payments" ? "text-amber-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            JazzCash Payments
          </button>

          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Main Website
          </Link>
        </nav>

        {/* Admin profile / Sign Out */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{session?.user?.name}</p>
              <p className="text-zinc-500 text-[10px] truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 p-8 min-h-screen">
        {/* ── USER MANAGEMENT TAB ────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-extrabold text-white font-space tracking-tight">User Management</h1>
                <p className="text-zinc-500 text-sm mt-1">Manage registered users — create, restrict, or remove access</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create User
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              {[
                {
                  label: "Total Users",
                  value: totalUsers,
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                  color: "from-blue-500 to-indigo-600",
                  glow: "shadow-blue-500/20",
                },
                {
                  label: "Restricted",
                  value: totalRestricted,
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ),
                  color: "from-red-500 to-rose-600",
                  glow: "shadow-red-500/20",
                },
                {
                  label: "Admins",
                  value: totalAdmins,
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                  ),
                  color: "from-amber-500 to-orange-600",
                  glow: "shadow-amber-500/20",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#07092e] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.glow} flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">{stat.label}</p>
                    <p className="text-white text-2xl font-extrabold font-space">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Users Table Container */}
            <div className="bg-[#07092e] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-bold font-space text-sm">All Users</h2>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 placeholder:text-zinc-600 w-56"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">User</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Role</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Status</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Joined</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-zinc-500 text-sm">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16">
                          <span className="text-zinc-500 text-sm">No users found.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isCurrentAdmin = user._id === (session?.user as any)?.id;
                        return (
                          <tr key={user._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-semibold">{user.name}</p>
                                  <p className="text-zinc-500 text-xs">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                                user.role === "admin"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {user.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                                user.restricted
                                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.restricted ? "bg-red-400" : "bg-emerald-400"}`} />
                                {user.restricted ? "RESTRICTED" : "ACTIVE"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-zinc-500 text-xs">
                                {new Date(user.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditTarget(user)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleRestrict(user)}
                                  disabled={isCurrentAdmin || restrictingId === user._id}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                    isCurrentAdmin
                                      ? "opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-500"
                                      : user.restricted
                                      ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20"
                                      : "bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/20"
                                  }`}
                                >
                                  {user.restricted ? "Unrestrict" : "Restrict"}
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(user)}
                                  disabled={isCurrentAdmin}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                    isCurrentAdmin
                                      ? "opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-500"
                                      : "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20"
                                  }`}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── PRICING TAB ───────────────────────────────────────────────────────── */}
        {activeTab === "pricing" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-extrabold text-white font-space tracking-tight">Pricing Page Content</h1>
                <p className="text-zinc-500 text-sm mt-1">Configure pricing tiers, features list, and price tags dynamically</p>
              </div>
              <button
                onClick={() => setShowCreatePricingModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Plan
              </button>
            </div>

            {/* Pricing Plans Table */}
            <div className="bg-[#07092e] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-bold font-space text-sm">All Active Pricing Tiers</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase w-12 text-center">Sort</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Plan Name</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Price Tag</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Period</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase w-20 text-center">Featured</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Features Count</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPricing ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-zinc-500 text-sm">Loading pricing plans...</span>
                          </div>
                        </td>
                      </tr>
                    ) : pricingTiers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <span className="text-zinc-500 text-sm">No pricing plans found.</span>
                        </td>
                      </tr>
                    ) : (
                      pricingTiers.map((tier) => (
                        <tr key={tier._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-zinc-400 font-bold text-center text-sm">
                            {tier.order}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-semibold">{tier.name}</p>
                              {tier.planType && (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                                  {tier.planType}
                                </span>
                              )}
                            </div>
                            <p className="text-zinc-500 text-[11px] truncate max-w-xs">{tier.description}</p>
                          </td>
                          <td className="px-6 py-4 font-mono font-extrabold text-amber-400 text-sm">
                            {tier.price}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs">
                            {tier.period}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {tier.featured ? (
                              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                                Yes
                              </span>
                            ) : (
                              <span className="text-zinc-600 text-xs font-semibold">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs font-semibold">
                            {tier.features?.length || 0} features
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditPricingTarget(tier)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 cursor-pointer"
                              >
                                Edit Plan
                              </button>
                              <button
                                onClick={() => setDeletePricingTarget(tier)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── SCOREBOARD PRICING TAB ────────────────────────────────────────────── */}
        {activeTab === "scoreboard" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-extrabold text-white font-space tracking-tight">Scoreboard Theme Pricing</h1>
                <p className="text-zinc-500 text-sm mt-1">Manage overlay themes, daily pricing rates, and promo badges</p>
              </div>
              <button
                onClick={() => setShowCreateScoreboardModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Theme
              </button>
            </div>

            {/* Scoreboard Themes Table */}
            <div className="bg-[#07092e] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-bold font-space text-sm">All Scoreboard Themes</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase w-16 text-center">ID</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Theme Name</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Url Slug</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Price (per day)</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Badge</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingScoreboard ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-zinc-500 text-sm">Loading themes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : scoreboardThemes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16">
                          <span className="text-zinc-500 text-sm">No themes found.</span>
                        </td>
                      </tr>
                    ) : (
                      scoreboardThemes.map((theme) => (
                        <tr key={theme._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-zinc-400 font-bold text-center text-sm">
                            {theme.themeId}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white text-sm">
                            {theme.name}
                          </td>
                          <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                            {theme.slug}
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-extrabold text-sm">
                            PKR {theme.price}
                          </td>
                          <td className="px-6 py-4">
                            {theme.badge ? (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                                {theme.badge}</span>
                            ) : (
                              <span className="text-zinc-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditScoreboardTarget(theme)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 cursor-pointer"
                              >
                                Edit Theme
                              </button>
                              <button
                                onClick={() => setDeleteScoreboardTarget(theme)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── JAZZCASH PAYMENTS TAB ────────────────────────────────────────────── */}
        {activeTab === "payments" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-extrabold text-white font-space tracking-tight">JazzCash Payments Logs</h1>
                <p className="text-zinc-500 text-sm mt-1">Verify manual transactions and send account login details to users</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  label: "Total Transactions",
                  value: totalPayments,
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ),
                  color: "from-blue-500 to-indigo-600",
                  glow: "shadow-blue-500/20",
                },
                {
                  label: "Pending Verification",
                  value: pendingPayments,
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  color: "from-amber-500 to-orange-600",
                  glow: "shadow-amber-500/20",
                },
                {
                  label: "Approved Payments",
                  value: approvedPayments,
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  color: "from-emerald-500 to-teal-600",
                  glow: "shadow-emerald-500/20",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#07092e] border border-white/5 rounded-2xl p-5 flex items-center gap-4 animate-scale-up-fade">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.glow} flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">{stat.label}</p>
                    <p className="text-white text-2xl font-extrabold font-space">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payments Table Container */}
            <div className="bg-[#07092e] border border-white/5 rounded-2xl overflow-hidden animate-scale-up-fade">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-bold font-space text-sm">All Payments Logs</h2>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search email, trx id, product..."
                    value={paymentsSearchQuery}
                    onChange={(e) => setPaymentsSearchQuery(e.target.value)}
                    className="bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 placeholder:text-zinc-600 w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">User Email</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">JazzCash Number</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Transaction ID</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Plan / Item</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Amount</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Status</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Submitted</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPayments ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-zinc-500 text-sm">Loading transactions...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16">
                          <span className="text-zinc-500 text-sm">No transactions found.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => {
                        let expiryText = "";
                        let isActive = false;
                        if (payment.status === "approved") {
                          const itemNameLower = payment.itemName.toLowerCase();
                          let duration = 24 * 60 * 60 * 1000; // default 24h
                          if (itemNameLower.includes("enterprise")) {
                            duration = 30 * 24 * 60 * 60 * 1000; // 30 days
                          } else if (itemNameLower.includes("professional") || itemNameLower.includes("pro")) {
                            duration = 7 * 24 * 60 * 60 * 1000; // 7 days
                          } else if (itemNameLower.includes("basic") || itemNameLower.includes("starter")) {
                            duration = 24 * 60 * 60 * 1000; // 1 day
                          }
                          const expiryDate = new Date(new Date(payment.updatedAt || payment.createdAt).getTime() + duration);
                          const remainingMs = expiryDate.getTime() - Date.now();
                          if (remainingMs > 0) {
                            const days = Math.floor(remainingMs / (24 * 3600 * 1000));
                            const hours = Math.floor((remainingMs % (24 * 3600 * 1000)) / (3600 * 1000));
                            const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
                            expiryText = days > 0 ? `${days}d ${hours}h left` : `${hours}h ${mins}m left`;
                            isActive = true;
                          } else {
                            expiryText = "Expired";
                          }
                        }

                        return (
                          <tr key={payment._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-sm">
                                  {payment.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-semibold">{payment.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-zinc-300 font-mono text-xs">
                              {payment.senderNumber}
                            </td>
                            <td className="px-6 py-4 text-[#ffb612] font-mono text-xs font-bold">
                              {payment.trxId}
                            </td>
                            <td className="px-6 py-4 text-zinc-300 font-semibold text-xs">
                              <div>{payment.itemName}</div>
                              {payment.matchId && (
                                <div className="mt-1">
                                  <a
                                    href={`/matches/${payment.matchId}/overlay`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-amber-400 hover:underline text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20"
                                  >
                                    View Scoreboard Overlay
                                  </a>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-emerald-400 font-extrabold text-sm">
                              {payment.itemPrice}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide w-fit ${
                                  payment.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : payment.status === "rejected"
                                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    payment.status === "approved" ? "bg-emerald-400" : payment.status === "rejected" ? "bg-red-400" : "bg-amber-400"
                                  }`} />
                                  {payment.status.toUpperCase()}
                                </span>
                                {expiryText && (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded w-fit ${
                                    isActive ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-zinc-500 bg-zinc-800"
                                  }`}>
                                    {expiryText}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-zinc-500 text-xs">
                              {new Date(payment.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {payment.status !== "approved" && (
                                  <button
                                    onClick={() => handleUpdatePaymentStatus(payment._id, "approved")}
                                    disabled={updatingPaymentId === payment._id}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                {payment.status !== "rejected" && (
                                  <button
                                    onClick={() => handleUpdatePaymentStatus(payment._id, "rejected")}
                                    disabled={updatingPaymentId === payment._id}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 cursor-pointer"
                                  >
                                    {payment.status === "approved" ? "Revoke / Reject" : "Reject"}
                                  </button>
                                )}
                                <button
                                  onClick={() => setEmailTarget(payment)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 cursor-pointer"
                                >
                                  Send Email
                                </button>
                                <button
                                  onClick={() => setDeletePaymentTarget(payment)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/50 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MODALS RENDERING ──────────────────────────────────────────────────── */}
      {/* Payments Modals */}
      {emailTarget && (
        <SendCustomEmailModal payment={emailTarget} onClose={() => setEmailTarget(null)} />
      )}
      {deletePaymentTarget && (
        <DeletePaymentConfirmModal payment={deletePaymentTarget} onClose={() => setDeletePaymentTarget(null)} onDeleted={fetchPayments} />
      )}
      {/* Users Modals */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onCreated={fetchUsers} />
      )}
      {editTarget && (
        <EditUserModal user={editTarget} onClose={() => setEditTarget(null)} onUpdated={fetchUsers} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={fetchUsers} />
      )}

      {/* Pricing Modals */}
      {showCreatePricingModal && (
        <CreatePricingModal onClose={() => setShowCreatePricingModal(false)} onCreated={fetchPricingTiers} />
      )}
      {editPricingTarget && (
        <EditPricingModal tier={editPricingTarget} onClose={() => setEditPricingTarget(null)} onUpdated={fetchPricingTiers} />
      )}
      {deletePricingTarget && (
        <DeletePricingConfirmModal tier={deletePricingTarget} onClose={() => setDeletePricingTarget(null)} onDeleted={fetchPricingTiers} />
      )}

      {/* Scoreboard Themes Modals */}
      {showCreateScoreboardModal && (
        <CreateScoreboardThemeModal onClose={() => setShowCreateScoreboardModal(false)} onCreated={fetchScoreboardThemes} />
      )}
      {editScoreboardTarget && (
        <EditScoreboardThemeModal theme={editScoreboardTarget} onClose={() => setEditScoreboardTarget(null)} onUpdated={fetchScoreboardThemes} />
      )}
      {deleteScoreboardTarget && (
        <DeleteScoreboardThemeConfirmModal theme={deleteScoreboardTarget} onClose={() => setDeleteScoreboardTarget(null)} onDeleted={fetchScoreboardThemes} />
      )}
    </div>
  );
}
