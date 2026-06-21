"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token.");
    }
  }, [token]);

  useEffect(() => {
    if (success && redirectCount > 0) {
      const timer = setTimeout(() => {
        setRedirectCount((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && redirectCount === 0) {
      router.push("/login");
    }
  }, [success, redirectCount, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password. The link may have expired.");
      } else {
        setSuccess("Your password has been successfully reset!");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#07092e] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/40 z-10 flex flex-col gap-6 animate-fade-in">
      {/* Logo and Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-white font-space">
          Crick<span className="text-amber-500">pro</span>BD
        </Link>
        <h2 className="text-xl font-bold text-zinc-100 font-space tracking-wide mt-2">
          Reset Password
        </h2>
        <p className="text-xs text-zinc-400">
          Enter your new password below
        </p>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-lg p-3.5 text-center font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs rounded-lg p-3.5 text-center font-semibold flex flex-col gap-1">
          <span>{success}</span>
          <span className="text-[10px] opacity-80">Redirecting to login in {redirectCount}s...</span>
        </div>
      )}

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            required
            disabled={loading || !!success || !token}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            required
            disabled={loading || !!success || !token}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !!success || !token}
          className={`w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-3 rounded-lg mt-2 transition-all duration-200 tracking-wide text-sm flex items-center justify-center gap-2 ${
            loading || !!success || !token ? "opacity-75 cursor-not-allowed bg-amber-600" : ""
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              RESETTING PASSWORD...
            </>
          ) : (
            "RESET PASSWORD"
          )}
        </button>
      </form>

      {/* Back to Login link */}
      <div className="flex justify-center text-center mt-2">
        <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#03041c] px-6 py-12 font-outfit select-none relative overflow-hidden">
      {/* Background glow backplates */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-[#07092e] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/40 z-10 flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div>
          <span className="text-zinc-400 text-sm mt-4">Loading reset form...</span>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
