"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Status = "verifying" | "success" | "error";

function SafePaySuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const [planLabel, setPlanLabel] = useState("");

  useEffect(() => {
    const token =
      searchParams.get("token") ||
      searchParams.get("beacon") ||
      searchParams.get("tracker");
    const sig = searchParams.get("sig") || "";
    const orderId = searchParams.get("order_id");
    const email = searchParams.get("email");
    const itemName = searchParams.get("item");
    const itemPrice = searchParams.get("price");
    const planType = searchParams.get("planType") || "";

    if (!token || !email || !itemName || !itemPrice) {
      setStatus("error");
      setMessage("Missing payment details. Please contact support.");
      return;
    }

    setPlanLabel(itemName);

    async function verify() {
      try {
        const res = await fetch("/api/safepay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            orderId,
            email,
            itemName,
            itemPrice,
            planType,
            sig,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Payment verified! Your plan is now active.");
          // Redirect to pricing page after 4s
          setTimeout(() => router.push("/pricing"), 4000);
        } else {
          setStatus("error");
          setMessage(data.error || "Payment verification failed. Please contact support.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error during verification. Please contact support.");
      }
    }

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#060914] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0b0e1c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Brand bar */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${
            status === "success"
              ? "from-[#00D09C] via-[#00b386] to-[#0097ff]"
              : status === "error"
              ? "from-red-600 via-red-500 to-rose-400"
              : "from-[#00D09C]/40 via-[#00D09C]/60 to-[#0097ff]/40 animate-pulse"
          }`}
        />

        <div className="p-8 flex flex-col items-center gap-6 text-center">
          {/* ── Verifying ── */}
          {status === "verifying" && (
            <>
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-[#00D09C]/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-[#00D09C]/10 border-2 border-[#00D09C]/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#00D09C] border-t-transparent rounded-full animate-spin" style={{ borderWidth: "3px" }} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Verifying Payment</h1>
                <p className="text-[12px] text-slate-400 mt-2 leading-relaxed">
                  Please wait while we confirm your payment with SafePay…
                </p>
              </div>
            </>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#00D09C]/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center">
                  <svg className="w-9 h-9 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Payment Successful!</h1>
                <p className="text-[13px] text-slate-400 mt-2 leading-relaxed max-w-[300px]">
                  {message}
                </p>
                {planLabel && (
                  <div className="mt-3 inline-block bg-[#00D09C]/10 border border-[#00D09C]/20 rounded-xl px-4 py-2 text-[12px] text-[#00D09C] font-bold">
                    ✓ {planLabel} Activated
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 animate-pulse">
                Redirecting you to pricing page…
              </p>
            </>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-400/40 flex items-center justify-center">
                <svg className="w-9 h-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Verification Failed</h1>
                <p className="text-[12px] text-slate-400 mt-2 leading-relaxed max-w-[300px]">
                  {message}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Link
                  href="/pricing"
                  className="w-full py-3 rounded-xl font-bold text-sm text-center text-white bg-gradient-to-r from-[#00D09C] to-[#00b386] hover:opacity-90 transition-all"
                >
                  ← Back to Pricing
                </Link>
                <p className="text-[10px] text-slate-600">
                  Need help? Email <span className="text-slate-400">crioverlay@gmail.com</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Powered by */}
        {status !== "error" && (
          <div className="px-6 pb-5 text-center text-[10px] text-slate-600">
            Powered by <span className="text-[#00D09C] font-semibold">SafePay</span> · Secured with 256-bit SSL
          </div>
        )}
      </div>
    </div>
  );
}

export default function SafePaySuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060914] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#00D09C] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SafePaySuccessContent />
    </Suspense>
  );
}
