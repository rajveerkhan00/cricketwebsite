"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Successfully signed in! Redirecting...");

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#03041c] px-6 py-12 font-outfit select-none relative overflow-hidden">
      {/* Background glow backplates */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[#07092e] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/40 z-10 flex flex-col gap-6 animate-fade-in">

        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-white font-space">
            Crick<span className="text-amber-500">pro</span>BD
          </Link>
          <h2 className="text-xl font-bold text-zinc-100 font-space tracking-wide mt-2">
            Welcome Back
          </h2>
          <p className="text-xs text-zinc-400">
            Sign in to access your scorecard overlays
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-lg p-3.5 text-center font-semibold animate-pulse">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs rounded-lg p-3.5 text-center font-semibold">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-amber-500 hover:text-amber-400">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              required
              disabled={loading}
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded border-zinc-800 bg-[#121542] cursor-pointer"
              disabled={loading}
            />
            <label htmlFor="remember" className="text-xs text-zinc-400 font-semibold cursor-pointer">
              Remember me for 7 days
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-3 rounded-lg mt-2 transition-all duration-200 tracking-wide text-sm flex items-center justify-center gap-2 ${loading ? "opacity-75 cursor-not-allowed bg-amber-600" : ""
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                SIGNING IN...
              </>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
