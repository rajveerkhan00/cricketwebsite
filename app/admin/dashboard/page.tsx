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
  status: "pending" | "approved" | "rejected";
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

interface ScoreboardAccessRecord {
  _id: string;
  email: string;
  userName?: string;
  userImage?: string | null;
  themeSlug: string;
  themeName?: string;
  trxId?: string;
  grantedBy?: string;
  durationLabel?: string;
  note?: string;
  grantedAt: string;
  expiresAt: string;
  status: "active" | "revoked";
  effectiveStatus: "active" | "expired" | "revoked";
  remainingMs: number;
  createdAt: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up-fade overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-space">Create New User</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-space">Delete User?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              This will permanently delete <span className="text-white font-semibold">{user.name}</span>.
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2.5 sm:gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
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
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(user.status || "approved");
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
        body: JSON.stringify({ name, email, password: password || undefined, role, status }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up-fade overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-space">Edit User</h2>
              <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
              New Password
              <span className="normal-case font-normal text-zinc-500 text-[10px]">(optional)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 pr-12 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-1"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "pending" | "approved" | "rejected")}
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="pending">Pending (Awaiting Approval)</option>
              <option value="approved">Approved (Active)</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200"
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
        toast.success(`Pricing plan "${name}" created successfully!`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up-fade overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-space">Create Pricing Plan</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Name</label>
              <input
                type="text"
                placeholder="e.g. Starter Plan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
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
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Period</label>
              <input
                type="text"
                placeholder="e.g. per month or 24 Hours"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
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
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Order (for sorting)</label>
              <input
                type="number"
                placeholder="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 sm:pt-4">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 text-amber-500 focus:ring-amber-500 bg-[#0d0f3a]"
              />
              <label htmlFor="featured-checkbox" className="text-xs font-semibold tracking-wider text-zinc-300 uppercase cursor-pointer">
                Featured / Popular Plan
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Type (Automatic Unlock)</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none"
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
              rows={3}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up-fade overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-space">Edit Pricing Plan</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Price String</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Period</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 sm:pt-4">
              <input
                type="checkbox"
                id="edit-featured-checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 text-blue-500 focus:ring-blue-500 bg-[#0d0f3a]"
              />
              <label htmlFor="edit-featured-checkbox" className="text-xs font-semibold tracking-wider text-zinc-300 uppercase cursor-pointer">
                Featured / Popular Plan
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plan Type (Automatic Unlock)</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Features (One per line)
            </label>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              required
              rows={3}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center shadow-lg shadow-blue-500/20"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-space">Delete Pricing Plan?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              This will permanently delete the pricing plan <span className="text-white font-semibold">{tier.name}</span>.
            </p>
          </div>
          <div className="flex gap-2.5 sm:gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up-fade overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-space">Create Scoreboard Theme</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme ID (No.)</label>
              <input
                type="number"
                placeholder="e.g. 16"
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Price (PKR/day)</label>
              <input
                type="number"
                placeholder="0 = FREE"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Badge (Optional)</label>
              <input
                type="text"
                placeholder="e.g. NEW or PRO"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up-fade overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-space">Edit Scoreboard Theme</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme ID (No.)</label>
              <input
                type="number"
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Theme Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
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
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Price (PKR/day)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center shadow-lg shadow-blue-500/20"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-space">Delete Theme?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              This will permanently delete <span className="text-white font-semibold">{theme.name}</span>.
            </p>
          </div>
          <div className="flex gap-2.5 sm:gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center"
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
  const [subject, setSubject] = useState("CriOverlay SafePay Order & Account Credentials");
  const [body, setBody] = useState(
    `Hello,\n\nThank you for your SafePay payment. Your transaction has been verified!\n\nHere are your account credentials:\nEmail: ${payment.email}\nPassword: \n\nYou can log in at: ${typeof window !== "undefined" ? window.location.origin : ""}/login\n\nRegards,\nCriOverlay Team`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-[#07092e] border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up-fade overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D09C] to-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-space">Send Credentials / Email</h2>
              <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">To: {payment.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00D09C] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Email Body Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={7}
              disabled={loading}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00D09C]"
            />
          </div>

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#00D09C] to-teal-600 hover:from-[#00b887] hover:to-teal-700 text-slate-950 font-black py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00D09C]/20"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-space">Delete SafePay Log?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              This will permanently delete transaction <span className="text-[#00D09C] font-mono font-semibold">{payment.trxId}</span> for <span className="text-white font-semibold">{payment.email}</span>.
            </p>
          </div>
          <div className="flex gap-2.5 sm:gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Grant Scoreboard Access Modal ─────────────────────────────────────────────
function GrantScoreboardAccessModal({
  users,
  themes,
  prefillEmail,
  loadingThemes,
  onClose,
  onGranted,
}: {
  users: UserRecord[];
  themes: ScoreboardThemeRecord[];
  prefillEmail?: string;
  loadingThemes?: boolean;
  onClose: () => void;
  onGranted: () => void;
}) {
  const [localThemes, setLocalThemes] = useState<ScoreboardThemeRecord[]>(themes || []);
  const [isLoadingThemes, setIsLoadingThemes] = useState<boolean>(loadingThemes || false);
  const [email, setEmail] = useState(prefillEmail || "");
  const [userSearch, setUserSearch] = useState(prefillEmail || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unlockType, setUnlockType] = useState<"all" | "specific">("all");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [durationKey, setDurationKey] = useState<string>("7d");
  const [customExpiry, setCustomExpiry] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (themes && themes.length > 0) {
      setLocalThemes(themes);
    } else {
      setIsLoadingThemes(true);
      fetch("/api/scoreboard-themes")
        .then((res) => res.json())
        .then((data) => {
          if (data?.themes?.length > 0) setLocalThemes(data.themes);
        })
        .catch((err) => console.error("Error loading themes:", err))
        .finally(() => setIsLoadingThemes(false));
    }
  }, [themes]);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
      setUserSearch(prefillEmail);
    }
  }, [prefillEmail]);

  const durationOptions = [
    { key: "1h", label: "1 Hour", desc: "Quick test", ms: 1 * 60 * 60 * 1000 },
    { key: "24h", label: "1 Day (24h)", desc: "Daily pass", ms: 24 * 60 * 60 * 1000 },
    { key: "3d", label: "3 Days", desc: "Weekend pass", ms: 3 * 24 * 60 * 60 * 1000 },
    { key: "7d", label: "7 Days (1 Wk)", desc: "Standard pass", ms: 7 * 24 * 60 * 60 * 1000 },
    { key: "14d", label: "14 Days", desc: "Bi-weekly", ms: 14 * 24 * 60 * 60 * 1000 },
    { key: "30d", label: "30 Days (1 Mo)", desc: "Monthly pass", ms: 30 * 24 * 60 * 60 * 1000 },
    { key: "90d", label: "90 Days (3 Mos)", desc: "Quarterly", ms: 90 * 24 * 60 * 60 * 1000 },
    { key: "365d", label: "1 Year", desc: "Annual pass", ms: 365 * 24 * 60 * 60 * 1000 },
    { key: "lifetime", label: "Lifetime (10 Yrs)", desc: "Permanent VIP", ms: 3650 * 24 * 60 * 60 * 1000 },
    { key: "custom", label: "Custom Date", desc: "Set exact time", ms: 0 },
  ];

  const filteredUserOptions = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSelectUser = (u: UserRecord) => {
    setEmail(u.email);
    setUserSearch(u.email);
    setIsDropdownOpen(false);
  };

  const handleToggleSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSelectAllThemes = () => {
    setSelectedSlugs(localThemes.map((t) => t.slug));
  };

  const handleClearThemes = () => {
    setSelectedSlugs([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = (email || userSearch).toLowerCase().trim();
    if (!finalEmail) {
      toast.error("Please provide or select a user email.");
      return;
    }

    if (unlockType === "specific" && selectedSlugs.length === 0) {
      toast.error("Please select at least one scoreboard to unlock.");
      return;
    }

    const selectedOption = durationOptions.find((d) => d.key === durationKey);
    let durationMs = selectedOption ? selectedOption.ms : 7 * 24 * 60 * 60 * 1000;
    let durationLabel = selectedOption ? selectedOption.label : "Custom";

    if (durationKey === "custom") {
      if (!customExpiry) {
        toast.error("Please select a valid custom expiry date & time.");
        return;
      }
      durationLabel = `Custom until ${new Date(customExpiry).toLocaleDateString()}`;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/scoreboard-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: finalEmail,
          unlockType,
          themeSlugs: unlockType === "specific" ? selectedSlugs : ["all-themes"],
          durationMs: durationKey !== "custom" ? durationMs : undefined,
          expiresAt: durationKey === "custom" ? new Date(customExpiry).toISOString() : undefined,
          durationLabel,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to grant scoreboard access.");
      } else {
        toast.success(data.message || `Scoreboard access granted to ${finalEmail}!`);
        onGranted();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#07092e] border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/90 animate-scale-up-fade overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-slate-950 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-space flex items-center gap-2">
                Grant Scoreboard Access
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Tool
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Unlock all scoreboards or specific overlays for any user for a chosen duration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 scrollbar-thin">
          {/* 1. Target User */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase flex items-center justify-between">
              <span>Target User Email *</span>
              <span className="text-[11px] text-zinc-500 normal-case">Pick from registered users or type new email</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setEmail(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="search user name or enter user@example.com..."
                required
                className="w-full bg-[#0d0f3a] border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setUserSearch("");
                    setEmail("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* User autocomplete dropdown */}
            {isDropdownOpen && filteredUserOptions.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 z-30 bg-[#0d0f3a] border border-zinc-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-white/5">
                {filteredUserOptions.slice(0, 8).map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-amber-500/10 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{u.name}</p>
                      <p className="text-[11px] text-zinc-400">{u.email}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Unlock Scope (All vs Specific) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Unlock Scope *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Unlock ALL */}
              <button
                type="button"
                onClick={() => setUnlockType("all")}
                className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  unlockType === "all"
                    ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-500/10"
                    : "bg-[#0d0f3a] border-zinc-800 hover:border-zinc-700 opacity-75 hover:opacity-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  unlockType === "all" ? "bg-amber-500 text-slate-950" : "bg-white/5 text-zinc-400"
                }`}>
                  <span className="text-base">🌐</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">Unlock ALL Scoreboards</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30 uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Grants global VIP access to every current and future theme across the entire platform.
                  </p>
                </div>
              </button>

              {/* Option B: Specific Themes */}
              <button
                type="button"
                onClick={() => setUnlockType("specific")}
                className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  unlockType === "specific"
                    ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-500/10"
                    : "bg-[#0d0f3a] border-zinc-800 hover:border-zinc-700 opacity-75 hover:opacity-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  unlockType === "specific" ? "bg-amber-500 text-slate-950" : "bg-white/5 text-zinc-400"
                }`}>
                  <span className="text-base">🎯</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Specific Scoreboard(s)</span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pick exact scoreboards/overlays from the list (e.g. IPL, PSL, World Cup).
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Specific Themes Selector (If specific is selected) */}
          {unlockType === "specific" && (
            <div className="bg-[#05072c] border border-zinc-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Select Scoreboards ({selectedSlugs.length} chosen)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllThemes}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearThemes}
                    className="text-[11px] font-bold text-zinc-400 hover:text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                {isLoadingThemes ? (
                  <div className="col-span-2 flex items-center justify-center gap-2 py-6 text-zinc-400">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-xs">Loading scoreboards...</span>
                  </div>
                ) : localThemes.length === 0 ? (
                  <p className="text-xs text-zinc-500 col-span-2 py-3 text-center">No themes found in database. Add themes in the Scoreboard Themes tab first.</p>
                ) : (
                  localThemes.map((theme) => {
                    const isSelected = selectedSlugs.includes(theme.slug);
                    return (
                      <div
                        key={theme._id}
                        onClick={() => handleToggleSlug(theme.slug)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400/80 text-white"
                            : "bg-[#0d0f3a] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-zinc-700 text-amber-500 focus:ring-0 pointer-events-none"
                          />
                          <span className="truncate">{theme.name}</span>
                        </div>
                        {theme.badge && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-white/10 text-amber-300 flex-shrink-0">
                            {theme.badge}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 4. Duration Presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Access Duration / Expiration Time *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {durationOptions.map((opt) => {
                const isSelected = durationKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDurationKey(opt.key)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20"
                        : "bg-[#0d0f3a] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-white/5"
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{opt.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isSelected ? "text-slate-900" : "text-zinc-500"}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input */}
            {durationKey === "custom" && (
              <div className="mt-2 p-3 bg-[#05072c] border border-amber-500/40 rounded-xl flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-amber-400">Choose Custom Expiration Date & Time:</label>
                <input
                  type="datetime-local"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  required
                  className="w-full bg-[#0d0f3a] border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* 5. Optional Admin Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Admin Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. VIP tournament sponsorship, manual SafePay payment, discord trial"
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex gap-2.5 sm:gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Granting Access...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Confirm & Unlock Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Extend Scoreboard Access Modal ────────────────────────────────────────────
function ExtendScoreboardAccessModal({
  access,
  themes,
  loadingThemes,
  onClose,
  onExtended,
}: {
  access: ScoreboardAccessRecord;
  themes: ScoreboardThemeRecord[];
  loadingThemes?: boolean;
  onClose: () => void;
  onExtended: () => void;
}) {
  const [localThemes, setLocalThemes] = useState<ScoreboardThemeRecord[]>(themes || []);
  const [isLoadingThemes, setIsLoadingThemes] = useState<boolean>(loadingThemes || false);

  const isInitiallyAll = access.themeSlug === "all-themes";
  const [unlockType, setUnlockType] = useState<"all" | "specific">(isInitiallyAll ? "all" : "specific");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(isInitiallyAll ? [] : [access.themeSlug]);
  const [extendPreset, setExtendPreset] = useState<string>("7d");
  const [customDate, setCustomDate] = useState<string>("");
  const [note, setNote] = useState<string>(access.note || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (themes && themes.length > 0) {
      setLocalThemes(themes);
    } else {
      setIsLoadingThemes(true);
      fetch("/api/scoreboard-themes")
        .then((res) => res.json())
        .then((data) => {
          if (data?.themes?.length > 0) {
            setLocalThemes(data.themes);
          }
        })
        .catch((err) => console.error("Error loading themes:", err))
        .finally(() => setIsLoadingThemes(false));
    }
  }, [themes]);

  const presets = [
    { key: "1h", label: "+1 Hour", desc: "Quick test", ms: 1 * 60 * 60 * 1000 },
    { key: "1d", label: "+1 Day", desc: "Daily pass", ms: 24 * 60 * 60 * 1000 },
    { key: "3d", label: "+3 Days", desc: "Weekend pass", ms: 3 * 24 * 60 * 60 * 1000 },
    { key: "7d", label: "+7 Days", desc: "1 Week", ms: 7 * 24 * 60 * 60 * 1000 },
    { key: "14d", label: "+14 Days", desc: "2 Weeks", ms: 14 * 24 * 60 * 60 * 1000 },
    { key: "30d", label: "+30 Days", desc: "1 Month", ms: 30 * 24 * 60 * 60 * 1000 },
    { key: "90d", label: "+90 Days", desc: "3 Months", ms: 90 * 24 * 60 * 60 * 1000 },
    { key: "365d", label: "+1 Year", desc: "Annual pass", ms: 365 * 24 * 60 * 60 * 1000 },
    { key: "lifetime", label: "Lifetime", desc: "10 Years VIP", ms: 3650 * 24 * 60 * 60 * 1000 },
    { key: "custom", label: "Custom Date", desc: "Exact date/time", ms: 0 },
  ];

  const handleToggleSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSelectAllThemes = () => {
    setSelectedSlugs(localThemes.map((t) => t.slug));
  };

  const handleClearThemes = () => {
    setSelectedSlugs([]);
  };

  // Calculate live preview of new expiry date
  const now = Date.now();
  const currentExpiryMs = new Date(access.expiresAt).getTime();
  const baseMs = currentExpiryMs > now ? currentExpiryMs : now;
  const selectedPresetObj = presets.find((p) => p.key === extendPreset);
  let previewNewExpiry: Date | null = null;
  if (extendPreset === "custom") {
    if (customDate) previewNewExpiry = new Date(customDate);
  } else if (selectedPresetObj && selectedPresetObj.ms > 0) {
    previewNewExpiry = new Date(baseMs + selectedPresetObj.ms);
  }

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (unlockType === "specific" && selectedSlugs.length === 0) {
      toast.error("Please select at least one scoreboard to unlock for this user.");
      return;
    }

    if (extendPreset === "custom" && !customDate) {
      toast.error("Please select a valid custom expiry date & time.");
      return;
    }

    setLoading(true);
    try {
      const selected = presets.find((p) => p.key === extendPreset);
      const additionalMs = selected && selected.ms > 0 ? selected.ms : undefined;
      const newExpiresAt = extendPreset === "custom" && customDate ? new Date(customDate).toISOString() : undefined;
      const durationLabel = selected ? selected.label : "Custom Expiry";

      const res = await fetch(`/api/admin/scoreboard-access/${access._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extend",
          unlockType,
          themeSlugs: unlockType === "specific" ? selectedSlugs : ["all-themes"],
          additionalMs,
          newExpiresAt,
          durationLabel,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update access.");
      } else {
        toast.success(`Access updated & saved for ${access.email}!`);
        onExtended();
        onClose();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#07092e] border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/90 animate-scale-up-fade overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-slate-950 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-space flex items-center gap-2">
                Manage & Extend Access
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {access.status.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Update unlocked scoreboards (all or specific) and extend duration for <span className="text-white font-semibold">{access.email}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleExtend} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 scrollbar-thin">
          {/* Current Status Overview */}
          <div className="p-3.5 bg-[#0d0f3a] rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                {access.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{access.userName || access.email}</p>
                <p className="text-zinc-400 text-[11px]">{access.email}</p>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-0.5 text-zinc-400">
              <span>Current Expiry:</span>
              <span className="text-amber-400 font-mono font-bold text-xs">
                {new Date(access.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                {new Date(access.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* 1. Scoreboard Scope (All vs Specific) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Select Scoreboard Access Scope *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Unlock ALL */}
              <button
                type="button"
                onClick={() => setUnlockType("all")}
                className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  unlockType === "all"
                    ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-500/10"
                    : "bg-[#0d0f3a] border-zinc-800 hover:border-zinc-700 opacity-75 hover:opacity-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  unlockType === "all" ? "bg-amber-500 text-slate-950" : "bg-white/5 text-zinc-400"
                }`}>
                  <span className="text-base">🌐</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">Unlock ALL Scoreboards</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30 uppercase">
                      VIP
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Grants global access to every current and future scoreboard overlay across the entire platform.
                  </p>
                </div>
              </button>

              {/* Option B: Specific Themes */}
              <button
                type="button"
                onClick={() => setUnlockType("specific")}
                className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  unlockType === "specific"
                    ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-500/10"
                    : "bg-[#0d0f3a] border-zinc-800 hover:border-zinc-700 opacity-75 hover:opacity-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  unlockType === "specific" ? "bg-amber-500 text-slate-950" : "bg-white/5 text-zinc-400"
                }`}>
                  <span className="text-base">🎯</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">Specific Scoreboard(s)</span>
                    {selectedSlugs.length > 0 && (
                      <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                        {selectedSlugs.length} chosen
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pick exact scoreboards to unlock (e.g. Asia Cup, IPL, PSL, CricFusion, BBL).
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Specific Themes Selector (If specific is selected) */}
          {unlockType === "specific" && (
            <div className="bg-[#05072c] border border-zinc-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Select Scoreboards ({selectedSlugs.length} chosen)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllThemes}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearThemes}
                    className="text-[11px] font-bold text-zinc-400 hover:text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                {isLoadingThemes ? (
                  <div className="col-span-2 flex items-center justify-center gap-2 py-6 text-zinc-400">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-xs">Loading scoreboards...</span>
                  </div>
                ) : localThemes.length === 0 ? (
                  <p className="text-xs text-zinc-500 col-span-2 py-3 text-center">
                    No themes found in database.
                  </p>
                ) : (
                  localThemes.map((theme) => {
                    const isSelected = selectedSlugs.includes(theme.slug);
                    return (
                      <div
                        key={theme._id}
                        onClick={() => handleToggleSlug(theme.slug)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400/80 text-white shadow-sm shadow-amber-500/10"
                            : "bg-[#0d0f3a] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-zinc-700 text-amber-500 focus:ring-0 pointer-events-none"
                          />
                          <span className="truncate">{theme.name}</span>
                        </div>
                        {theme.badge && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-white/10 text-amber-300 flex-shrink-0">
                            {theme.badge}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 2. Duration / Extension Presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Extension Time / New Duration *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {presets.map((opt) => {
                const isSelected = extendPreset === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setExtendPreset(opt.key)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20"
                        : "bg-[#0d0f3a] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-white/5"
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{opt.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isSelected ? "text-slate-900" : "text-zinc-500"}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input */}
            {extendPreset === "custom" && (
              <div className="mt-1 p-3 bg-[#05072c] border border-amber-500/40 rounded-xl flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-amber-400">Choose Custom Expiration Date & Time:</label>
                <input
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  required
                  className="w-full bg-[#0d0f3a] border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* Live Preview of New Resulting Expiration */}
            {previewNewExpiry && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">➔ Resulting Expiry:</span>
                  <span className="text-white font-mono font-bold">
                    {previewNewExpiry.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                    {previewNewExpiry.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                  Active
                </span>
              </div>
            )}
          </div>

          {/* 3. Optional Admin Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Admin Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Extended for annual promotion or support request"
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-orange-600 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save & Apply Access</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Scoreboard Access Confirm Modal ─────────────────────────────────────
function DeleteAccessConfirmModal({
  access,
  onClose,
  onDeleted,
}: {
  access: ScoreboardAccessRecord;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/scoreboard-access/${access._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete access record.");
      } else {
        toast.success(`Access record deleted for ${access.email}.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-[#07092e] border border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 animate-scale-up-fade">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-space">Delete Access Record?</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Permanently remove scoreboard access ({access.themeSlug === "all-themes" ? "ALL Scoreboards" : access.themeName || access.themeSlug}) for <span className="text-white font-semibold">{access.email}</span>.
            </p>
          </div>
          <div className="flex gap-2.5 w-full mt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white py-2.5 rounded-lg text-xs sm:text-sm font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-center"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ADMIN DASHBOARD COMPONENT ───────────────────────────────────────────
export default function AdminDashboard() {

  const { data: session, status } = useSession();
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<"users" | "access" | "scoreboard" | "pricing" | "payments">("users");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Users Tab states
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [restrictingId, setRestrictingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false);

  // Scoreboard Access states (Manual Unlocks)
  const [accesses, setAccesses] = useState<ScoreboardAccessRecord[]>([]);
  const [loadingAccesses, setLoadingAccesses] = useState(false);
  const [accessSearchQuery, setAccessSearchQuery] = useState("");
  const [accessFilterType, setAccessFilterType] = useState<"all" | "global" | "specific">("all");
  const [accessFilterStatus, setAccessFilterStatus] = useState<"all" | "active" | "expired" | "revoked">("all");
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantPrefillEmail, setGrantPrefillEmail] = useState<string>("");
  const [extendTarget, setExtendTarget] = useState<ScoreboardAccessRecord | null>(null);
  const [deleteAccessTarget, setDeleteAccessTarget] = useState<ScoreboardAccessRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
  const [inlinePrices, setInlinePrices] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
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

  const fetchAccesses = useCallback(async () => {
    setLoadingAccesses(true);
    try {
      const res = await fetch("/api/admin/scoreboard-access");
      if (!res.ok) throw new Error("Failed to load accesses");
      const data = await res.json();
      setAccesses(data.accesses || []);
    } catch {
      toast.error("Failed to load scoreboard access records.");
    } finally {
      setLoadingAccesses(false);
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

  const toggleFreeStatus = async (theme: ScoreboardThemeRecord) => {
    const isCurrentlyFree = theme.price <= 0;
    const newPrice = isCurrentlyFree ? 150 : 0;
    const newBadge = isCurrentlyFree ? "" : "FREE";
    try {
      const res = await fetch(`/api/admin/scoreboard-themes/${theme._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: theme.themeId,
          name: theme.name,
          slug: theme.slug,
          price: newPrice,
          badge: newBadge || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Theme "${theme.name}" is now ${isCurrentlyFree ? `PAID (PKR 150/day)` : "FREE"}!`);
        setInlinePrices(prev => { const n = {...prev}; delete n[theme._id]; return n; });
        fetchScoreboardThemes();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update status.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const saveInlinePrice = async (theme: ScoreboardThemeRecord) => {
    const rawPrice = inlinePrices[theme._id];
    const newPrice = Number(rawPrice);
    if (isNaN(newPrice) || newPrice < 0) { toast.error("Enter a valid price (0 = free)."); return; }
    setSavingPriceId(theme._id);
    try {
      const res = await fetch(`/api/admin/scoreboard-themes/${theme._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: theme.themeId,
          name: theme.name,
          slug: theme.slug,
          price: newPrice,
          badge: newPrice <= 0 ? "FREE" : (theme.badge && theme.badge !== "FREE" ? theme.badge : undefined),
        }),
      });
      if (res.ok) {
        toast.success(`Price updated → PKR ${newPrice <= 0 ? "FREE" : newPrice}`);
        setInlinePrices(prev => { const n = {...prev}; delete n[theme._id]; return n; });
        fetchScoreboardThemes();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update price.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingPriceId(null);
    }
  };

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
      } else if (activeTab === "access") {
        fetchAccesses();
        if (users.length === 0) fetchUsers();
        if (scoreboardThemes.length === 0) fetchScoreboardThemes();
      } else if (activeTab === "pricing") {
        fetchPricingTiers();
      } else if (activeTab === "scoreboard") {
        fetchScoreboardThemes();
      } else if (activeTab === "payments") {
        fetchPayments();
      }
    }
  }, [status, session, activeTab, fetchUsers, fetchAccesses, fetchPricingTiers, fetchScoreboardThemes, fetchPayments, hasFetchedUsers, users.length, scoreboardThemes.length]);

  // Pre-load themes and users whenever Grant or Extend modal opens (so the picker is always populated)
  useEffect(() => {
    if ((showGrantModal || extendTarget) && status === "authenticated" && (session?.user as any)?.role === "admin") {
      if (scoreboardThemes.length === 0) fetchScoreboardThemes();
      if (users.length === 0) fetchUsers();
    }
  }, [showGrantModal, extendTarget, status, session, scoreboardThemes.length, users.length, fetchScoreboardThemes, fetchUsers]);

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

  // Status Change (approve / reject / pending)
  const handleStatusChange = async (user: UserRecord, newStatus: "pending" | "approved" | "rejected") => {
    setUpdatingStatusId(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update status.");
      } else {
        toast.success(`Status for "${user.name}" updated to ${newStatus.toUpperCase()}.`);
        fetchUsers();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Toggle/Revoke Access for a Scoreboard Access Record
  const handleToggleRevokeAccess = async (access: ScoreboardAccessRecord) => {
    setActionLoadingId(access._id);
    const isRevoked = access.status === "revoked";
    const action = isRevoked ? "reactivate" : "revoke";
    try {
      const res = await fetch(`/api/admin/scoreboard-access/${access._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          additionalMs: isRevoked ? 7 * 24 * 60 * 60 * 1000 : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update access status.");
      } else {
        toast.success(isRevoked ? `Access reactivated for ${access.email} (+7 days)!` : `Access revoked for ${access.email}.`);
        fetchAccesses();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Payment Status Change (approve / reject)
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
        toast.success(`Payment marked as ${newStatus.toUpperCase()}!`);
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
  const totalPending = users.filter((u) => u.status === "pending").length;
  const totalRestricted = users.filter((u) => u.restricted || u.status === "rejected").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  // Scoreboard Access calculations and filters
  const nowMs = Date.now();
  const activeAccessesCount = accesses.filter((a) => a.status === "active" && new Date(a.expiresAt).getTime() > nowMs).length;
  const globalAccessesCount = accesses.filter((a) => a.themeSlug === "all-themes" && a.status === "active" && new Date(a.expiresAt).getTime() > nowMs).length;
  const specificAccessesCount = accesses.filter((a) => a.themeSlug !== "all-themes" && a.status === "active" && new Date(a.expiresAt).getTime() > nowMs).length;
  const uniqueLicensedUsers = new Set(
    accesses
      .filter((a) => a.status === "active" && new Date(a.expiresAt).getTime() > nowMs)
      .map((a) => a.email.toLowerCase())
  ).size;

  const filteredAccesses = accesses.filter((a) => {
    const matchesSearch =
      a.email.toLowerCase().includes(accessSearchQuery.toLowerCase()) ||
      (a.userName && a.userName.toLowerCase().includes(accessSearchQuery.toLowerCase())) ||
      (a.themeName && a.themeName.toLowerCase().includes(accessSearchQuery.toLowerCase())) ||
      (a.themeSlug && a.themeSlug.toLowerCase().includes(accessSearchQuery.toLowerCase())) ||
      (a.note && a.note.toLowerCase().includes(accessSearchQuery.toLowerCase()));

    const isGlobal = a.themeSlug === "all-themes";
    const matchesType =
      accessFilterType === "all" ||
      (accessFilterType === "global" && isGlobal) ||
      (accessFilterType === "specific" && !isGlobal);

    const isExpired = new Date(a.expiresAt).getTime() <= nowMs;
    const effectiveStatus = a.status === "revoked" ? "revoked" : isExpired ? "expired" : "active";
    const matchesStatus =
      accessFilterStatus === "all" ||
      accessFilterStatus === effectiveStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleTabSelect = (tab: "users" | "access" | "pricing" | "scoreboard" | "payments") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#03041c] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#03041c] font-outfit select-none text-zinc-100 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-0 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-red-600/5 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-amber-500/5 blur-[140px] pointer-events-none" />

      {/* ── MOBILE TOPBAR (Visible only on < lg screens) ────────────────────── */}
      <header className="sticky top-0 z-40 lg:hidden flex items-center justify-between px-3.5 sm:px-4 py-3 bg-[#05072c]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <span className="text-white font-extrabold text-sm tracking-tight font-space">
              Crick<span className="text-amber-500">pro</span>BD
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {activeTab === "users" ? "Users" : activeTab === "access" ? "Access" : activeTab === "pricing" ? "Pricing" : activeTab === "scoreboard" ? "Scoreboard" : "Payments"}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
        </div>
      </header>

      {/* ── MOBILE BACKDROP OVERLAY ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* ── SIDEBAR (Persistent on Desktop w-64, Drawer on Mobile) ─────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 sm:w-64 bg-[#05072c] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl shadow-black/80" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo & Close header */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 group">
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

          {/* Close button inside drawer for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-3 sm:p-4 flex flex-col gap-1.5 overflow-y-auto">
          {/* 1. User Management */}
          <button
            onClick={() => handleTabSelect("users")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left cursor-pointer ${
              activeTab === "users"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${activeTab === "users" ? "text-amber-400" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>User Management</span>
            {totalPending > 0 && (
              <span className="ml-auto bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {totalPending}
              </span>
            )}
          </button>

          {/* 2. Scoreboard Access (Manual Unlocks) */}
          <button
            onClick={() => handleTabSelect("access")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left cursor-pointer ${
              activeTab === "access"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${activeTab === "access" ? "text-amber-400" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>Scoreboard Access</span>
            {activeAccessesCount > 0 && (
              <span className="ml-auto bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/30">
                {activeAccessesCount}
              </span>
            )}
          </button>

          {/* 3. Scoreboard Pricing */}
          <button
            onClick={() => handleTabSelect("scoreboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left cursor-pointer ${
              activeTab === "scoreboard"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${activeTab === "scoreboard" ? "text-amber-400" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Scoreboard Themes</span>
          </button>

          {/* 4. Pricing Plans */}
          <button
            onClick={() => handleTabSelect("pricing")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left cursor-pointer ${
              activeTab === "pricing"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${activeTab === "pricing" ? "text-amber-400" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pricing Plans</span>
          </button>

          {/* 5. SafePay Payments */}
          <button
            onClick={() => handleTabSelect("payments")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left cursor-pointer ${
              activeTab === "payments"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${activeTab === "payments" ? "text-amber-400" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>SafePay Payments</span>
            {pendingPayments > 0 && (
              <span className="ml-auto bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingPayments}
              </span>
            )}
          </button>


          <div className="my-2 border-t border-white/5" />

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all duration-200"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Main Website</span>
          </Link>
        </nav>

        {/* Admin profile / Sign Out */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-bold truncate">{session?.user?.name}</p>
              <p className="text-zinc-500 text-[10px] truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WRAPPER (padding-left on desktop ensures 0 overflow) ── */}
      <div className="lg:pl-64 w-full min-h-screen flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto p-3.5 sm:p-5 md:p-6 lg:p-8 min-w-0">
          {/* ── USER MANAGEMENT TAB ──────────────────────────────────────── */}
          {activeTab === "users" && (
            <div className="space-y-5 sm:space-y-7 animate-scale-up-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-space tracking-tight">User Management</h1>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">Manage registered users — create, restrict, or modify access</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create User</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {[
                  {
                    label: "Total Users",
                    value: totalUsers,
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ),
                    color: "from-blue-500 to-indigo-600",
                    glow: "shadow-blue-500/20",
                  },
                  {
                    label: "Pending Approval",
                    value: totalPending,
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    color: "from-amber-500 to-orange-600",
                    glow: "shadow-amber-500/20",
                  },
                  {
                    label: "Restricted / Rejected",
                    value: totalRestricted,
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                    ),
                    color: "from-emerald-500 to-teal-600",
                    glow: "shadow-emerald-500/20",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4.5 flex items-center gap-2.5 sm:gap-3.5 shadow-lg shadow-black/20">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.glow} flex-shrink-0`}>
                      {stat.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate">{stat.label}</p>
                      <p className="text-white text-lg sm:text-2xl font-extrabold font-space truncate">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Users Table Container */}
              <div className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-black/30 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 sm:px-6 py-3.5 sm:py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-bold font-space text-sm">All Users</h2>
                    <span className="text-xs text-zinc-500 font-semibold">({filteredUsers.length})</span>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder:text-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto w-full scrollbar-thin">
                  <table className="w-full text-left min-w-[650px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">User</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Role</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Status</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Joined</th>
                        <th className="text-right px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={5} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-zinc-400 text-sm">Loading users...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-16">
                            <span className="text-zinc-400 text-sm">No users found.</span>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const isCurrentAdmin = user._id === (session?.user as any)?.id;
                          return (
                            <tr key={user._id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 max-w-[160px] sm:max-w-xs">
                                    <p className="text-white text-xs sm:text-sm font-semibold truncate">{user.name}</p>
                                    <p className="text-zinc-400 text-[11px] truncate">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide ${
                                  user.role === "admin"
                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}>
                                  {user.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  {user.status === "approved" && (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide w-fit ${
                                      user.restricted
                                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${user.restricted ? "bg-red-400" : "bg-emerald-400"}`} />
                                      {user.restricted ? "RESTRICTED" : "APPROVED"}
                                    </span>
                                  )}
                                  {user.status === "pending" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide w-fit bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                      PENDING APPROVAL
                                    </span>
                                  )}
                                  {user.status === "rejected" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide w-fit bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                      REJECTED
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <span className="text-zinc-400 text-xs">
                                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
                                  {user.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(user, "approved")}
                                        disabled={isCurrentAdmin || updatingStatusId === user._id}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                          isCurrentAdmin || updatingStatusId === user._id
                                            ? "opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-500"
                                            : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20"
                                        }`}
                                      >
                                        {updatingStatusId === user._id ? "..." : "Approve"}
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(user, "rejected")}
                                        disabled={isCurrentAdmin || updatingStatusId === user._id}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                          isCurrentAdmin || updatingStatusId === user._id
                                            ? "opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-500"
                                            : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20"
                                        }`}
                                      >
                                        {updatingStatusId === user._id ? "..." : "Reject"}
                                      </button>
                                    </>
                                  )}
                                  {user.status !== "pending" && (
                                    <button
                                      onClick={() => handleStatusChange(user, "pending")}
                                      disabled={isCurrentAdmin || updatingStatusId === user._id}
                                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                        isCurrentAdmin || updatingStatusId === user._id
                                          ? "opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-500"
                                          : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20"
                                        }`}
                                    >
                                      {updatingStatusId === user._id ? "..." : "Set Pending"}
                                    </button>
                                  )}
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
                                    {user.restricted ? "Unblock" : "Block"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setGrantPrefillEmail(user.email);
                                      setShowGrantModal(true);
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 cursor-pointer"
                                  >
                                    🔓 Unlock
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
            </div>
          )}

          {/* ── SCOREBOARD ACCESS TAB ─────────────────────────────────────── */}
          {activeTab === "access" && (
            <div className="space-y-5 sm:space-y-7 animate-scale-up-fade">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white font-space tracking-tight">Scoreboard Access</h1>
                    <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Manual Unlocks</span>
                  </div>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">Grant, extend, or revoke scoreboard access for specific users</p>
                </div>
                <button
                  onClick={() => { setGrantPrefillEmail(""); setShowGrantModal(true); }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Grant Access</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {[
                  { label: "Active Passes", value: activeAccessesCount, color: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
                  { label: "Licensed Users", value: uniqueLicensedUsers, color: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/20" },
                  { label: "Global (All Boards)", value: globalAccessesCount, color: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/20" },
                  { label: "Per-Theme Specific", value: specificAccessesCount, color: "from-purple-500 to-violet-600", glow: "shadow-purple-500/20" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5 shadow-lg shadow-black/20">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.glow} flex-shrink-0`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate">{stat.label}</p>
                      <p className="text-white text-lg sm:text-2xl font-extrabold font-space">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters + Table */}
              <div className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-black/30 w-full">
                {/* Table header with search + filters */}
                <div className="flex flex-col gap-3 px-3.5 sm:px-6 py-3.5 sm:py-4 border-b border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-white font-bold font-space text-sm">Access Records</h2>
                      <span className="text-xs text-zinc-500 font-semibold">({filteredAccesses.length})</span>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search email, theme..."
                        value={accessSearchQuery}
                        onChange={(e) => setAccessSearchQuery(e.target.value)}
                        className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder:text-zinc-600 transition-colors"
                      />
                    </div>
                  </div>
                  {/* Filter Chips */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex gap-1.5">
                      {(["all", "global", "specific"] as const).map((t) => (
                        <button key={t} onClick={() => setAccessFilterType(t)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${ accessFilterType === t ? "bg-amber-500 text-slate-950" : "bg-white/5 text-zinc-400 hover:text-white border border-white/10" }`}>{t === "all" ? "All Types" : t === "global" ? "🌐 Global" : "🎯 Specific"}</button>
                      ))}
                    </div>
                    <div className="w-px bg-white/10 hidden sm:block" />
                    <div className="flex gap-1.5">
                      {(["all", "active", "expired", "revoked"] as const).map((s) => (
                        <button key={s} onClick={() => setAccessFilterStatus(s)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${ accessFilterStatus === s ? (s === "active" ? "bg-emerald-500 text-white" : s === "expired" ? "bg-zinc-500 text-white" : s === "revoked" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950") : "bg-white/5 text-zinc-400 hover:text-white border border-white/10" }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full scrollbar-thin">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">User</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Scoreboard</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Duration</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Expires</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Status</th>
                        <th className="text-right px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingAccesses ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-zinc-400 text-sm">Loading access records...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredAccesses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                              </div>
                              <p className="text-zinc-400 text-sm">No access records found.</p>
                              <button onClick={() => { setGrantPrefillEmail(""); setShowGrantModal(true); }} className="px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer">Grant First Access</button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAccesses.map((access) => {
                          const isExpired = new Date(access.expiresAt).getTime() <= Date.now();
                          const effectiveStatus = access.status === "revoked" ? "revoked" : isExpired ? "expired" : "active";
                          const remainingMs = new Date(access.expiresAt).getTime() - Date.now();
                          const daysLeft = Math.floor(remainingMs / (24 * 3600 * 1000));
                          const hoursLeft = Math.floor((remainingMs % (24 * 3600 * 1000)) / (3600 * 1000));
                          const timeLeftStr = effectiveStatus === "active" ? (daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h left` : `${hoursLeft}h left`) : "";
                          const isGlobal = access.themeSlug === "all-themes";
                          return (
                            <tr key={access._id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/80 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xs flex-shrink-0">
                                    {access.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[140px] sm:max-w-[200px]">{access.userName || access.email}</p>
                                    <p className="text-zinc-400 text-[11px] truncate max-w-[140px] sm:max-w-[200px]">{access.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                {isGlobal ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    🌐 ALL Scoreboards
                                  </span>
                                ) : (
                                  <div>
                                    <p className="text-white text-xs font-semibold">{access.themeName || access.themeSlug}</p>
                                    <p className="text-zinc-500 font-mono text-[10px]">{access.themeSlug}</p>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <p className="text-zinc-300 text-xs font-semibold">{access.durationLabel || "—"}</p>
                                {access.note && <p className="text-zinc-500 text-[10px] truncate max-w-[120px]">{access.note}</p>}
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <p className="text-zinc-300 text-xs">{new Date(access.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                {timeLeftStr && <p className="text-amber-400 text-[10px] font-semibold">{timeLeftStr}</p>}
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                                  effectiveStatus === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  effectiveStatus === "expired" ? "bg-zinc-800 text-zinc-400 border border-zinc-700" :
                                  "bg-red-500/15 text-red-400 border border-red-500/30"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${ effectiveStatus === "active" ? "bg-emerald-400" : effectiveStatus === "expired" ? "bg-zinc-500" : "bg-red-400" }`} />
                                  {effectiveStatus.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                  <button
                                    onClick={() => setExtendTarget(access)}
                                    disabled={actionLoadingId === access._id}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 cursor-pointer"
                                  >
                                    Extend
                                  </button>
                                  <button
                                    onClick={() => handleToggleRevokeAccess(access)}
                                    disabled={actionLoadingId === access._id}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${ access.status === "revoked" ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20" : "bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/20" }`}
                                  >
                                    {actionLoadingId === access._id ? "..." : access.status === "revoked" ? "Reactivate" : "Revoke"}
                                  </button>
                                  <button
                                    onClick={() => setDeleteAccessTarget(access)}
                                    disabled={actionLoadingId === access._id}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 cursor-pointer"
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
            </div>
          )}

          {/* ── PRICING TAB ──────────────────────────────────────────────── */}
          {activeTab === "pricing" && (
            <div className="space-y-5 sm:space-y-7 animate-scale-up-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-space tracking-tight">Pricing Page Content</h1>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">Configure pricing tiers, features list, and price tags dynamically</p>
                </div>
                <button
                  onClick={() => setShowCreatePricingModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Plan</span>
                </button>
              </div>

              {/* Pricing Plans Table */}
              <div className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-black/30 w-full">
                <div className="flex items-center justify-between px-3.5 sm:px-6 py-3.5 sm:py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-bold font-space text-sm">All Active Pricing Tiers</h2>
                    <span className="text-xs text-zinc-500 font-semibold">({pricingTiers.length})</span>
                  </div>
                </div>

                <div className="overflow-x-auto w-full scrollbar-thin">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase w-12 text-center">Sort</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Plan Name</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Price Tag</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Period</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase w-20 text-center">Featured</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Features Count</th>
                        <th className="text-right px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingPricing ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-zinc-400 text-sm">Loading pricing plans...</span>
                            </div>
                          </td>
                        </tr>
                      ) : pricingTiers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16">
                            <span className="text-zinc-400 text-sm">No pricing plans found.</span>
                          </td>
                        </tr>
                      ) : (
                        pricingTiers.map((tier) => (
                          <tr key={tier._id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-zinc-400 font-bold text-center text-xs sm:text-sm">
                              {tier.order}
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                              <div className="flex items-center gap-2">
                                <p className="text-white text-xs sm:text-sm font-semibold">{tier.name}</p>
                                {tier.planType && (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                                    {tier.planType}
                                  </span>
                                )}
                              </div>
                              <p className="text-zinc-400 text-[11px] truncate max-w-xs">{tier.description}</p>
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-mono font-extrabold text-amber-400 text-xs sm:text-sm whitespace-nowrap">
                              {tier.price}
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-zinc-400 text-xs whitespace-nowrap">
                              {tier.period}
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-center whitespace-nowrap">
                              {tier.featured ? (
                                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                                  Yes
                                </span>
                              ) : (
                                <span className="text-zinc-600 text-xs font-semibold">—</span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-zinc-400 text-xs font-semibold whitespace-nowrap">
                              {tier.features?.length || 0} features
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                <button
                                  onClick={() => setEditPricingTarget(tier)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 cursor-pointer"
                                >
                                  Edit
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
            </div>
          )}

          {/* ── SCOREBOARD PRICING TAB ────────────────────────────────────── */}
          {activeTab === "scoreboard" && (
            <div className="space-y-5 sm:space-y-7 animate-scale-up-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-space tracking-tight">Scoreboard Theme Pricing</h1>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">Manage overlay themes, daily pricing rates, and promo badges</p>
                </div>
                <button
                  onClick={() => setShowCreateScoreboardModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Theme</span>
                </button>
              </div>

              {/* Scoreboard Themes Table */}
              <div className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-black/30 w-full">
                <div className="flex items-center justify-between px-3.5 sm:px-6 py-3.5 sm:py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-bold font-space text-sm">All Scoreboard Themes</h2>
                    <span className="text-xs text-zinc-500 font-semibold">({scoreboardThemes.length})</span>
                  </div>
                </div>

                <div className="overflow-x-auto w-full scrollbar-thin">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase w-16 text-center">ID</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Theme Name</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Url Slug</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Price (per day)</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Badge</th>
                        <th className="text-right px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingScoreboard ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-zinc-400 text-sm">Loading themes...</span>
                            </div>
                          </td>
                        </tr>
                      ) : scoreboardThemes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16">
                            <span className="text-zinc-400 text-sm">No themes found.</span>
                          </td>
                        </tr>
                      ) : (
                        scoreboardThemes.map((theme) => (
                          <tr key={theme._id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-zinc-400 font-bold text-center text-xs sm:text-sm">
                              {theme.themeId}
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-semibold text-white text-xs sm:text-sm">
                              {theme.name}
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-zinc-400 font-mono text-xs">
                              {theme.slug}
                            </td>
                            {/* Price column with inline edit */}
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {theme.price <= 0 ? (
                                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-black">FREE</span>
                                ) : (
                                  <span className="text-amber-400 font-extrabold text-xs sm:text-sm">PKR {theme.price}</span>
                                )}
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Set price"
                                  value={inlinePrices[theme._id] ?? ""}
                                  onChange={(e) => setInlinePrices(prev => ({ ...prev, [theme._id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === "Enter" && saveInlinePrice(theme)}
                                  className="w-16 sm:w-20 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                {inlinePrices[theme._id] !== undefined && (
                                  <button
                                    onClick={() => saveInlinePrice(theme)}
                                    disabled={savingPriceId === theme._id}
                                    className="px-2 py-1 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 cursor-pointer disabled:opacity-50 transition-colors"
                                  >
                                    {savingPriceId === theme._id ? "..." : "Save"}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                              {theme.badge ? (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                                  {theme.badge}
                                </span>
                              ) : (
                                <span className="text-zinc-600 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                {/* Free / Paid toggle pill */}
                                <button
                                  onClick={() => toggleFreeStatus(theme)}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                                    theme.price <= 0
                                      ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/30"
                                      : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30"
                                  }`}
                                >
                                  <span>{theme.price <= 0 ? "🔒" : "✅"}</span>
                                  <span>{theme.price <= 0 ? "Paid" : "Free"}</span>
                                </button>
                                <button
                                  onClick={() => setEditScoreboardTarget(theme)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 cursor-pointer"
                                >
                                  Edit
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
            </div>
          )}

          {/* ── SAFEPAY PAYMENTS TAB ────────────────────────────────────── */}
          {activeTab === "payments" && (
            <div className="space-y-5 sm:space-y-7 animate-scale-up-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white font-space tracking-tight">SafePay Payments Logs</h1>
                    <span className="bg-[#00D09C]/15 border border-[#00D09C]/30 text-[#00D09C] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Gateway
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">Real-time SafePay transaction records, automated unlocks, and customer access management</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
                {[
                  {
                    label: "Total Transactions",
                    value: totalPayments,
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    color: "from-amber-500 to-orange-600",
                    glow: "shadow-amber-500/20",
                  },
                  {
                    label: "Approved / Active Unlocks",
                    value: approvedPayments,
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    color: "from-[#00D09C] to-teal-600",
                    glow: "shadow-[#00D09C]/20",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl p-3.5 sm:p-4.5 flex items-center gap-3.5 shadow-lg shadow-black/20">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.glow} flex-shrink-0`}>
                      {stat.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate">{stat.label}</p>
                      <p className="text-white text-lg sm:text-2xl font-extrabold font-space truncate">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payments Table Container */}
              <div className="bg-[#07092e] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-black/30 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 sm:px-6 py-3.5 sm:py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-bold font-space text-sm">All SafePay Transactions</h2>
                    <span className="text-xs text-zinc-500 font-semibold">({filteredPayments.length})</span>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search email, tracker, item..."
                      value={paymentsSearchQuery}
                      onChange={(e) => setPaymentsSearchQuery(e.target.value)}
                      className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#00D09C] placeholder:text-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto w-full scrollbar-thin">
                  <table className="w-full text-left min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Customer Email</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Gateway / Source</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">SafePay Tracker / Token</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Plan / Item</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Amount</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Status</th>
                        <th className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Submitted</th>
                        <th className="text-right px-4 sm:px-6 py-3.5 text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingPayments ? (
                        <tr>
                          <td colSpan={8} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-[#00D09C] border-t-transparent rounded-full animate-spin" />
                              <span className="text-zinc-400 text-sm">Loading transactions...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-16">
                            <span className="text-zinc-400 text-sm">No transactions found.</span>
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
                            <tr key={payment._id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D09C]/80 to-teal-700 flex items-center justify-center text-slate-950 font-black text-xs flex-shrink-0">
                                    {payment.email.charAt(0).toUpperCase()}
                                  </div>
                                  <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[150px] sm:max-w-xs">{payment.email}</p>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/25">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C]" />
                                  {payment.senderNumber || "SafePay"}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-[#00D09C] font-mono text-xs font-bold whitespace-nowrap">
                                {payment.trxId}
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-zinc-300 font-semibold text-xs whitespace-nowrap">
                                <div>{payment.itemName}</div>
                                {payment.matchId && (
                                  <div className="mt-1">
                                    <a
                                      href={`/matches/${payment.matchId}/overlay`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-amber-400 hover:underline text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 inline-block"
                                    >
                                      View Scoreboard Overlay
                                    </a>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-emerald-400 font-extrabold text-xs sm:text-sm whitespace-nowrap">
                                {payment.itemPrice}
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide w-fit ${
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
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded w-fit ${
                                      isActive ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-zinc-500 bg-zinc-800"
                                    }`}>
                                      {expiryText}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-zinc-400 text-xs whitespace-nowrap">
                                {new Date(payment.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
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
                                      {payment.status === "approved" ? "Revoke" : "Reject"}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setEmailTarget(payment)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 cursor-pointer"
                                  >
                                    Email
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
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS RENDERING ────────────────────────────────────────────────── */}
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

      {/* Scoreboard Access Modals */}
      {showGrantModal && (
        <GrantScoreboardAccessModal
          users={users}
          themes={scoreboardThemes}
          prefillEmail={grantPrefillEmail}
          loadingThemes={loadingScoreboard}
          onClose={() => { setShowGrantModal(false); setGrantPrefillEmail(""); }}
          onGranted={() => { fetchAccesses(); }}
        />
      )}
      {extendTarget && (
        <ExtendScoreboardAccessModal
          access={extendTarget}
          themes={scoreboardThemes}
          loadingThemes={loadingScoreboard}
          onClose={() => setExtendTarget(null)}
          onExtended={fetchAccesses}
        />
      )}
      {deleteAccessTarget && (
        <DeleteAccessConfirmModal
          access={deleteAccessTarget}
          onClose={() => setDeleteAccessTarget(null)}
          onDeleted={fetchAccesses}
        />
      )}
    </div>
  );
}
