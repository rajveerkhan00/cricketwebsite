"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Verify admin role after sign in
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#03041c] px-6 py-12 font-outfit select-none relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[55%] rounded-full bg-red-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[55%] rounded-full bg-orange-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-[#07092e] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60 z-10 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          {/* Shield icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20 mb-1">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-white font-space">
            Crick<span className="text-amber-500">pro</span>BD
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 font-space tracking-wide">Admin Portal</h1>
            <p className="text-xs text-zinc-500 mt-1">Restricted access — authorized personnel only</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg p-3.5 text-center font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@CricOverlay.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                Password
              </label>
              <Link href="/admin/forgot-password" className="text-xs font-semibold text-red-400 hover:text-red-300">
                Forgot password?
              </Link>
            </div>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d0f3a] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
              required
              disabled={loading}
            />
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 active:scale-95 text-white font-bold py-3 rounded-lg mt-2 transition-all duration-200 tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 ${loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AUTHENTICATING...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                ACCESS ADMIN PANEL
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="flex flex-col items-center gap-2">
        </div>
      </div>
    </div>
  );
}
