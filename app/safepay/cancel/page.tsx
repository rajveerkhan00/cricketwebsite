import Link from "next/link";

export const metadata = {
  title: "Payment Cancelled | CriOverlay",
  description: "Your SafePay payment was cancelled.",
};

export default function SafePayCancelPage() {
  return (
    <div className="min-h-screen bg-[#060914] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0b0e1c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Brand bar — muted to indicate cancellation */}
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />

        <div className="p-8 flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-slate-700/40 border-2 border-slate-600/40 flex items-center justify-center">
            <svg
              className="w-9 h-9 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-black text-white">Payment Cancelled</h1>
            <p className="text-[13px] text-slate-400 mt-2 leading-relaxed max-w-[280px]">
              No charges were made. You can go back to pricing and try again whenever
              you're ready.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/pricing"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-center text-slate-900 bg-gradient-to-r from-[#00D09C] to-[#00b386] hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-teal-900/20"
            >
              ← Back to Pricing
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-xl font-semibold text-sm text-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Go to Homepage
            </Link>
          </div>

          <p className="text-[10px] text-slate-600 leading-relaxed">
            Need help? Contact us at{" "}
            <a
              href="mailto:crioverlay@gmail.com"
              className="text-slate-400 hover:text-white transition-colors"
            >
              crioverlay@gmail.com
            </a>
          </p>
        </div>

        <div className="px-6 pb-5 text-center text-[10px] text-slate-600">
          Powered by <span className="text-[#00D09C] font-semibold">SafePay</span>
        </div>
      </div>
    </div>
  );
}
