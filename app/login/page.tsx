"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-6 py-12 font-outfit select-none relative overflow-hidden">
      {/* Background glow backplates */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xl z-10 flex flex-col gap-6 animate-fade-in">

        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-slate-900 font-space">
            Cric<span className="text-amber-500 font-black">Over</span>lay
          </Link>
          <h2 className="text-xl font-bold text-slate-900 font-space tracking-wide mt-2">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your scorecard overlays
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg p-3.5 text-center font-semibold animate-pulse">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs rounded-lg p-3.5 text-center font-semibold">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded border-slate-300 cursor-pointer"
              disabled={loading}
            />
            <label htmlFor="remember" className="text-xs text-slate-600 font-semibold cursor-pointer">
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
