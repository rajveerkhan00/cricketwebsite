"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface JazzCashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemPrice: string | number;
  planType?: string | null;
  onSuccess: () => void;
}

type Step = "enter_number" | "otp_pending" | "enter_trx" | "success";

export default function JazzCashPaymentModal({
  isOpen,
  onClose,
  itemName,
  itemPrice,
  planType,
  onSuccess,
}: JazzCashPaymentModalProps) {
  const [step, setStep] = useState<Step>("enter_number");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [email, setEmail] = useState("");
  const [txnRefNo, setTxnRefNo] = useState("");
  const [manualTrxId, setManualTrxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (!isOpen) return null;

  // Convert PKR price to paisa (multiply by 100)
  const priceNum = typeof itemPrice === "number" ? itemPrice : parseFloat(String(itemPrice).replace(/[^0-9.]/g, ""));
  const amountPaisa = Math.round(priceNum * 100);
  const priceDisplay = `PKR ${priceNum.toLocaleString()}`;

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const iv = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Step 1: Initiate mWallet payment (sends OTP to JazzCash app) ────────────
  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = mobileNumber.trim().replace(/\D/g, "");
    if (cleaned.length < 10 || cleaned.length > 11) {
      toast.error("Enter a valid 11-digit JazzCash mobile number (e.g. 03001234567).");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/jazzcash/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: cleaned,
          amountPaisa,
          description: itemName,
          cnic: cnic.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTxnRefNo(data.txnRefNo || "");
        setStep("otp_pending");
        startCountdown(120); // 2-minute window to approve
        toast.success("Payment request sent! Check your JazzCash app to approve.");
      } else {
        toast.error(data.message || "Failed to initiate payment. Check your number and try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: User has approved in app — now record the payment ───────────────
  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          senderNumber: mobileNumber.trim(),
          trxId: txnRefNo || manualTrxId.trim(),
          itemName,
          itemPrice,
          planType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("success");
        toast.success(data.message || "Payment confirmed! Your plan is now active.");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2500);
      } else {
        toast.error(data.message || "Payment confirmation failed. Please contact support.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTrxId.trim() || manualTrxId.trim().length < 6) {
      toast.error("Enter the Transaction ID from your JazzCash SMS.");
      return;
    }
    await handleConfirmPayment();
  };

  const handleReset = () => {
    setStep("enter_number");
    setMobileNumber("");
    setCnic("");
    setEmail("");
    setTxnRefNo("");
    setManualTrxId("");
    setLoading(false);
    setCountdown(0);
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] bg-[#0b0e1c] border border-white/10 text-slate-100 rounded-3xl shadow-2xl overflow-hidden">
        {/* JazzCash brand gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#d22630] via-[#e84040] to-[#ffb612]" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d22630] flex items-center justify-center font-black text-xs text-white shadow-lg shadow-red-900/40 border border-[#ffb612]/20">
              JC
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide text-white uppercase">
                JazzCash <span className="text-[#ffb612]">Pay</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold">Secure Mobile Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-base font-bold transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Product summary */}
        <div className="px-6 py-3 bg-white/[0.04] border-b border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Product</p>
            <p className="text-sm font-extrabold text-white truncate max-w-[210px]">{itemName}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Amount</p>
            <p className="text-base font-black text-[#ffb612] font-mono">{priceDisplay}</p>
          </div>
        </div>

        {/* ── STEP 1: Enter JazzCash number ─────────────────────────────── */}
        {step === "enter_number" && (
          <form onSubmit={handleInitiate} className="p-6 flex flex-col gap-4">
            <div className="text-center mb-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#d22630]/20 border border-[#d22630]/30 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#ffb612]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-white">Pay via JazzCash Wallet</h3>
              <p className="text-[11px] text-slate-400 mt-1">Enter your JazzCash number. We'll send a payment request to your JazzCash app.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JazzCash Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">🇵🇰</span>
                <input
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={13}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-[#d22630] focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CNIC Last 6 Digits <span className="text-slate-600 font-normal normal-case">(required by JazzCash)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 123456"
                value={cnic}
                onChange={(e) => setCnic(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={loading}
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#d22630] focus:bg-white/8 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Email (for plan activation)</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d22630] focus:bg-white/8 transition-all"
              />
            </div>

            {/* How it works */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 text-[11px] text-slate-400 leading-relaxed">
              <p className="font-bold text-white mb-1.5">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter your JazzCash number above</li>
                <li>A payment request of <span className="text-[#ffb612] font-bold">{priceDisplay}</span> will be sent to your app</li>
                <li>Open <span className="text-white font-semibold">JazzCash</span> app → approve the request</li>
                <li>Your plan activates instantly ✓</li>
              </ol>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-gradient-to-r from-[#d22630] to-[#ffb612] hover:from-[#b91e27] hover:to-[#e09e0c] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-900/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Send Payment Request
                </>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP Pending — waiting for user to approve in app ─── */}
        {step === "otp_pending" && (
          <div className="p-6 flex flex-col items-center gap-5 text-center">
            {/* Pulsing ring animation */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-[#ffb612]/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-[#d22630]/20 animate-ping" style={{ animationDelay: "0.3s" }} />
              <div className="relative w-20 h-20 rounded-full bg-[#d22630]/20 border-2 border-[#d22630]/50 flex items-center justify-center">
                <svg className="w-9 h-9 text-[#ffb612]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div>
              <h3 className="text-base font-black text-white">Approve in Your JazzCash App</h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed max-w-[280px]">
                A payment request of <span className="text-[#ffb612] font-bold">{priceDisplay}</span> has been sent to{" "}
                <span className="text-white font-bold">{mobileNumber}</span>.
                Open the <span className="text-white font-semibold">JazzCash app</span> and approve it.
              </p>
            </div>

            {countdown > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-slate-600 border-t-[#ffb612] rounded-full animate-spin" />
                Expires in <span className="text-[#ffb612] font-bold font-mono">{countdown}s</span>
              </div>
            )}

            {txnRefNo && (
              <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Ref No:</span>
                <span className="text-white font-mono font-bold">{txnRefNo}</span>
              </div>
            )}

            {/* Once approved, user clicks "I've Approved" */}
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-slate-900 bg-gradient-to-r from-[#ffb612] to-[#f59e0b] hover:from-[#f0a800] hover:to-[#d97706] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-900/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  I've Approved — Confirm Payment
                </>
              )}
            </button>

            {/* Fallback: enter TRX ID manually */}
            <div className="w-full border-t border-white/10 pt-4">
              <button
                onClick={() => setStep("enter_trx")}
                className="text-[11px] text-slate-500 hover:text-slate-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Didn't receive? Enter Transaction ID manually →
              </button>
            </div>

            <button
              onClick={handleReset}
              className="text-[11px] text-slate-600 hover:text-slate-400 cursor-pointer transition-colors"
            >
              ← Use different number
            </button>
          </div>
        )}

        {/* ── STEP 3: Manual TRX ID entry (fallback) ───────────────────── */}
        {step === "enter_trx" && (
          <form onSubmit={handleManualTrx} className="p-6 flex flex-col gap-4">
            <div className="text-center">
              <h3 className="text-sm font-black text-white">Enter Transaction ID</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                After approving, enter the Transaction ID from your JazzCash SMS confirmation.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID (TRX ID)</label>
              <input
                type="text"
                placeholder="e.g. TT2346789012"
                value={manualTrxId}
                onChange={(e) => setManualTrxId(e.target.value.trim())}
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#ffb612] focus:bg-white/8 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-gradient-to-r from-[#d22630] to-[#ffb612] hover:from-[#b91e27] hover:to-[#e09e0c] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Confirm & Unlock"
              )}
            </button>

            <button type="button" onClick={() => setStep("otp_pending")} className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer transition-colors text-center underline">
              ← Back
            </button>
          </form>
        )}

        {/* ── STEP 4: Success ───────────────────────────────────────────── */}
        {step === "success" && (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-white">Payment Successful!</h3>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              Your plan has been activated. A confirmation has been sent to{" "}
              <span className="text-white font-bold">{email}</span>.
            </p>
            <div className="text-[11px] text-slate-500 animate-pulse">Redirecting you...</div>
          </div>
        )}

        {/* Footer note */}
        {step !== "success" && (
          <div className="px-6 pb-5 text-center text-[10px] text-slate-600 leading-relaxed">
            Powered by <span className="text-slate-400 font-semibold">JazzCash</span> · Secured with HMAC-SHA256
          </div>
        )}
      </div>
    </div>
  );
}
