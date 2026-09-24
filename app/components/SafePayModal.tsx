"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface SafePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemPrice: string | number;
  planType?: string | null;
}

export default function SafePayModal({
  isOpen,
  onClose,
  itemName,
  itemPrice,
  planType,
}: SafePayModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Parse and display price
  const priceNum =
    typeof itemPrice === "number"
      ? itemPrice
      : parseFloat(String(itemPrice).replace(/[^0-9.]/g, ""));
  const priceDisplay = `PKR ${priceNum.toLocaleString()}`;

  // Generate a unique order ID for this checkout attempt
  const generateOrderId = () =>
    `SP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const orderId = generateOrderId();

      // Build redirect URLs
      const origin = window.location.origin;
      const successUrl = `${origin}/safepay/success?email=${encodeURIComponent(email)}&item=${encodeURIComponent(itemName)}&price=${encodeURIComponent(String(itemPrice))}&planType=${encodeURIComponent(planType || "")}&order_id=${encodeURIComponent(orderId)}`;
      const cancelUrl = `${origin}/safepay/cancel`;

      // Create SafePay payment session (server-side, keeps secret key safe)
      const res = await fetch("/api/safepay/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: priceNum,
          orderId,
          currency: "PKR",
          redirectUrl: successUrl,
          cancelUrl: cancelUrl,
          source: "custom",
          webhooks: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        toast.error(data.error || "Failed to create payment session. Please try again.");
        return;
      }

      // Redirect user directly to SafePay hosted checkout
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] bg-[#0b0e1c] border border-white/10 text-slate-100 rounded-3xl shadow-2xl overflow-hidden">
        {/* SafePay brand gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00D09C] via-[#00b386] to-[#0097ff]" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* SafePay logo mark */}
            <div className="w-9 h-9 rounded-xl bg-[#00D09C]/20 border border-[#00D09C]/30 flex items-center justify-center shadow-lg shadow-teal-900/30">
              <svg className="w-5 h-5 text-[#00D09C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide text-white uppercase">
                Safe<span className="text-[#00D09C]">Pay</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold">Secure Card Payment</p>
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
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Plan</p>
            <p className="text-sm font-extrabold text-white truncate max-w-[210px]">{itemName}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Amount</p>
            <p className="text-base font-black text-[#00D09C] font-mono">{priceDisplay}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCheckout} className="p-6 flex flex-col gap-5">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00D09C]/10 border border-[#00D09C]/20 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-[#00D09C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-white">Pay with SafePay</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-[280px] mx-auto">
              You'll be redirected to SafePay's secure checkout page to complete your payment via debit/credit card.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Your Email (for plan activation)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00D09C] focus:bg-white/8 transition-all"
              />
            </div>
          </div>

          {/* How it works info box */}
          <div className="bg-[#00D09C]/5 border border-[#00D09C]/15 rounded-2xl p-3.5 text-[11px] text-slate-400 leading-relaxed">
            <p className="font-bold text-[#00D09C] mb-1.5">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enter your email above</li>
              <li>Click the button below — you'll go to SafePay's secure page</li>
              <li>Pay <span className="text-[#00D09C] font-bold">{priceDisplay}</span> with your debit / credit card</li>
              <li>You're redirected back and your plan activates ✓</li>
            </ol>
          </div>

          {/* Accepted cards note */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <svg className="w-3.5 h-3.5 text-[#00D09C] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Visa · Mastercard · UnionPay · Direct Bank Card Checkout
          </div>

          {/* Compliance Agreement Note */}
          <p className="text-[10px] text-slate-400 leading-relaxed text-center">
            By proceeding, you agree to our{" "}
            <a href="/terms-and-conditions" target="_blank" className="text-[#00D09C] underline hover:text-white">
              Terms &amp; Conditions
            </a>
            ,{" "}
            <a href="/privacy-policy" target="_blank" className="text-[#00D09C] underline hover:text-white">
              Privacy Policy
            </a>
            , and{" "}
            <a href="/refund-policy" target="_blank" className="text-[#00D09C] underline hover:text-white">
              Refund Policy
            </a>
            .
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-slate-900 bg-gradient-to-r from-[#00D09C] to-[#00b386] hover:from-[#00ba8a] hover:to-[#009a74] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-900/30"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Preparing Checkout...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Pay {priceDisplay} with SafePay
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-5 text-center text-[10px] text-slate-400 leading-relaxed">
          Questions or disputes? Call <a href="tel:03704788581" className="text-white font-bold underline">03704788581</a> or email <a href="mailto:crioverlay@gmail.com" className="text-white font-bold underline">crioverlay@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
