"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import JazzCashPaymentModal from "../components/JazzCashPaymentModal";
import { toast } from "react-toastify";

export default function Pricing() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isJazzCashOpen, setIsJazzCashOpen] = useState(false);

  const handlePlanCheckout = (tier: any) => {
    if (tier.price === "$0" || tier.price.toLowerCase().includes("free") || tier.price === "0") {
      toast.success(`Welcome to CrickproBD! You are now subscribed to the ${tier.name} Plan.`);
      return;
    }
    setSelectedPlan(tier);
    setIsJazzCashOpen(true);
  };

  useEffect(() => {
    async function fetchTiers() {
      try {
        const res = await fetch("/api/pricing-tiers");
        if (res.ok) {
          const data = await res.json();
          setTiers(data.tiers || []);
        }
      } catch (error) {
        console.error("Failed to load pricing tiers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTiers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#03041c] text-white font-sans">
      <Header />

      <main className="flex-1 py-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col gap-12 font-outfit w-full">
        {/* Title */}
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space">
            Transparent <span className="text-amber-500">Pricing</span> Plans
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            Choose the plan that matches your broadcasting scale. Upgrade or cancel anytime.
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 font-outfit text-sm">Loading pricing plans...</p>
          </div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-20 bg-[#07092e] border border-zinc-800/60 rounded-2xl">
            <p className="text-zinc-400">No pricing plans available at the moment.</p>
          </div>
        ) : (
          /* Pricing Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 items-stretch">
            {tiers.map((tier, idx) => (
              <div
                key={tier._id || idx}
                className={`flex flex-col rounded-2xl p-8 transition-all duration-300 relative ${
                  tier.featured
                    ? "bg-[#0b0e4a] border-2 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02] md:scale-105"
                    : "bg-[#07092e] border border-zinc-800/60 hover:border-zinc-700/80"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Popular
                  </span>
                )}

                <div className="flex flex-col gap-2 mb-6">
                  <h3 className="text-xl font-bold font-space uppercase text-zinc-100">{tier.name}</h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-2 mb-6 border-b border-zinc-800/80 pb-6">
                  <span className="text-4xl font-extrabold text-white font-space">{tier.price}</span>
                  <span className="text-xs text-zinc-400">/ {tier.period}</span>
                </div>

                <ul className="flex flex-col gap-4 mb-8 flex-1">
                  {tier.features.map((feature: string, fIdx: number) => (
                    <li key={fIdx} className="flex items-center gap-3 text-sm font-semibold tracking-wide text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="break-words">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanCheckout(tier)}
                  className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer active:scale-98 ${
                    tier.featured
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
                      : "bg-[#121542] hover:bg-[#191e5e] border border-zinc-800 text-white"
                  }`}
                >
                  {tier.buttonText}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedPlan && (
        <JazzCashPaymentModal
          isOpen={isJazzCashOpen}
          onClose={() => {
            setIsJazzCashOpen(false);
            setSelectedPlan(null);
          }}
          itemName={`${selectedPlan.name} Plan`}
          itemPrice={`${selectedPlan.price}`}
          onSuccess={() => {
            toast.success(`Successfully subscribed to ${selectedPlan.name} Plan!`);
          }}
        />
      )}
    </div>
  );
}
