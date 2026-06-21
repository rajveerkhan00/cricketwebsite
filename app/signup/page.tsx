"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!terms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setSuccess("Account created successfully! Redirecting to login page...");
      setName("");
      setEmail("");
      setPassword("");
      setTerms(false);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#03041c] px-6 py-12 font-outfit select-none relative overflow-hidden">
      {/* Background glows */}
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
            Create Account
          </h2>
          <p className="text-xs text-zinc-400">
            Sign up to build and customize your live overlay scorecards
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
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              required
              disabled={loading}
            />
          </div>

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
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Password
            </label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              required
              disabled={loading}
            />
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded border-zinc-800 bg-[#121542] mt-0.5 cursor-pointer"
              required
              disabled={loading}
            />
            <label htmlFor="terms" className="text-xs text-zinc-400 leading-normal cursor-pointer">
              I agree to the{" "}
              <a href="#" className="font-bold text-amber-500 hover:text-amber-400">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-bold text-amber-500 hover:text-amber-400">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-3 rounded-lg mt-2 transition-all duration-200 tracking-wide text-sm flex items-center justify-center gap-2 ${
              loading ? "opacity-75 cursor-not-allowed bg-amber-600" : ""
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                CREATING ACCOUNT...
              </>
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-3 w-full">
          <div className="h-[1px] bg-zinc-800/80 flex-1" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">or sign up with</span>
          <div className="h-[1px] bg-zinc-800/80 flex-1" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 bg-[#121542] hover:bg-[#191e5e] border border-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs transition-colors duration-200 opacity-60 cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.48 0-6.3-2.82-6.3-6.3s2.82-6.3 6.3-6.3c1.8 0 3.42.76 4.58 2l3.06-3.06C19.78 3.12 16.18 1.8 12.24 1.8 6.6 1.8 2 6.4 2 12s4.6 10 10.24 10c5.78 0 9.76-3.95 9.76-9.76 0-.6-.05-1.17-.16-1.725h-9.6z" />
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#121542] hover:bg-[#191e5e] border border-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs transition-colors duration-200 opacity-60 cursor-not-allowed">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Link to Login */}
        <p className="text-xs text-center text-zinc-400 mt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-amber-500 hover:text-amber-400">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
