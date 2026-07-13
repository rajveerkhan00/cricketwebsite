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

export default function JazzCashPaymentModal({
  isOpen,
  onClose,
  itemName,
  itemPrice,
  planType,
  onSuccess,
}: JazzCashPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"till" | "iban">("till");
  const [email, setEmail] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  // Format price display
  const priceDisplay = typeof itemPrice === "number" ? `PKR ${itemPrice}` : itemPrice;

  // QR Code URL based on the extracted Till Number
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=JazzCash Till ID: 983622181, Shop: MUHAMMAD Shop, Amount: ${itemPrice}`;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!senderNumber || senderNumber.trim().length < 10) {
      toast.error("Please enter a valid JazzCash sender mobile number.");
      return;
    }

    if (!trxId || trxId.trim().length < 8) {
      toast.error("Please enter a valid JazzCash Transaction ID (TRX ID).");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senderNumber,
          trxId,
          itemName,
          itemPrice,
          planType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Payment submitted! Admin will verify and email credentials within 1 hour.");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to submit payment details.");
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#090b26] border border-red-500/20 text-white rounded-3xl shadow-2xl font-sans animate-scale-up-fade">
        
        {/* Top JazzCash Brand bar */}
        <div className="bg-gradient-to-r from-[#d22630] to-[#ffb612] h-2 w-full" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Mock JazzCash Logo Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#d22630] flex items-center justify-center font-extrabold text-xs tracking-tighter text-white shadow-lg border border-[#ffb612]/30">
              JC
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide text-white font-space uppercase">
                JazzCash <span className="text-[#ffb612]">Pay</span>
              </h2>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase">Secure Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white font-extrabold text-lg w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Item & Price details */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Product</p>
            <p className="text-sm font-extrabold truncate text-zinc-200">{itemName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Amount</p>
            <p className="text-base font-black text-[#ffb612] font-mono">{priceDisplay}</p>
          </div>
        </div>

        {/* Tabs for payment options */}
        <div className="flex border-b border-white/5 bg-black/25">
          <button
            onClick={() => setActiveTab("till")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "till"
                ? "border-[#d22630] text-[#ffb612] bg-white/[0.01]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Option 1: Till Number
          </button>
          <button
            onClick={() => setActiveTab("iban")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "iban"
                ? "border-[#d22630] text-[#ffb612] bg-white/[0.01]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Option 2: Mobile Account / IBAN
          </button>
        </div>

        {/* Payment Details Content */}
        <div className="p-6">
          {activeTab === "till" ? (
            <div className="flex flex-col items-center gap-4 text-center animate-scale-up-fade">
              {/* QR Code */}
              <div className="p-2.5 bg-white rounded-xl shadow-md border border-zinc-200 flex items-center justify-center relative">
                <img
                  src={qrCodeUrl}
                  alt="JazzCash Till QR Code"
                  className="w-[140px] h-[140px] block"
                />
                {/* Visual indicator of official status */}
                <span className="absolute bottom-1 bg-[#d22630] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm border border-[#ffb612]/30 uppercase">
                  MUHAMMAD Shop
                </span>
              </div>

              {/* Till Info */}
              <div className="w-full">
                <p className="text-zinc-500 text-[10px] font-bold uppercase">JazzCash Till ID</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl font-extrabold text-[#ffb612] font-mono tracking-widest bg-black/40 px-3 py-1 rounded border border-white/5">
                    983622181
                  </span>
                  <button
                    onClick={() => copyToClipboard("983622181", "Till ID")}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Till ID"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 font-semibold mt-1">
                  Till Name: <span className="text-white font-bold">MUHAMMAD Shop</span>
                </p>
              </div>

              {/* Steps */}
              <div className="text-left w-full bg-black/25 border border-white/5 rounded-xl p-3 text-xs leading-relaxed text-zinc-400">
                <p className="font-bold text-zinc-200 mb-1">How to pay:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Open the <span className="text-white font-semibold">JazzCash App</span>.</li>
                  <li>Tap on <span className="text-white font-semibold">Scan QR</span> or enter Till Number.</li>
                  <li>Scan QR above or type Till ID: <span className="text-white font-mono font-bold">983622181</span>.</li>
                  <li>Enter exact amount: <span className="text-[#ffb612] font-bold">{priceDisplay}</span> and confirm.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 text-xs animate-scale-up-fade">
              {/* Account Details */}
              <div className="bg-black/25 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Account Title</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">MUHAMMAD RASHID</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">JazzCash Account / Mobile</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">01021410502</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard("01021410502", "Account Number")}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer font-bold"
                  >
                    Copy
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">IBAN Number</p>
                    <p className="text-[11px] font-mono font-bold text-white mt-0.5 truncate max-w-[240px]">
                      PK82JCMA1806921021410502
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard("PK82JCMA1806921021410502", "IBAN")}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer font-bold flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-black/25 border border-white/5 rounded-xl p-3 leading-relaxed text-zinc-400">
                <p className="font-bold text-zinc-200 mb-1">Transfer instructions:</p>
                <p>
                  Send the payment via your bank app or mobile wallet to <span className="text-white font-semibold">Mobilink Microfinance Bank</span> using the IBAN or directly transfer to the JazzCash mobile wallet.
                </p>
              </div>
            </div>
          )}

          {/* Form for TRX submission */}
          <form onSubmit={handleVerify} className="mt-5 border-t border-white/5 pt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Your Email Address (For Account Credentials)
              </label>
              <input
                type="email"
                placeholder="e.g. customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={verifying}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#d22630]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Your Sender JazzCash Mobile Number
              </label>
              <input
                type="text"
                placeholder="e.g. 03001234567"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                required
                disabled={verifying}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#d22630] font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Transaction ID (TRX ID)
              </label>
              <input
                type="text"
                placeholder="e.g. 02345678901 (11 digits)"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                required
                disabled={verifying}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#d22630] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#d22630] to-[#ffb612] hover:from-[#b91e27] hover:to-[#e09e0c]"
            >
              {verifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying with JazzCash...
                </>
              ) : (
                "Verify Payment & Unlock"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
