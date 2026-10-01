"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

export default function Pricing() {
  const { data: session } = useSession();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);

  const normalizePrice = (price: string) =>
    price?.toString().trim().toLowerCase().replace(/\s/g, "");
  const isFreePrice = (price: string) => {
    const normalized = normalizePrice(price);
    return (
      normalized === "0" ||
      normalized === "pkr0" ||
      normalized === "pk0" ||
      normalized.includes("free")
    );
  };

  const handlePlanCheckout = async (tier: any) => {
    if (isFreePrice(tier.price)) {
      toast.success(
        `Welcome to CriOverlay! You are now subscribed to the ${tier.name} Plan.`
      );
      return;
    }

    // Get email from current session or localStorage
    let email =
      session?.user?.email ||
      (typeof window !== "undefined"
        ? localStorage.getItem("crioverlay_user_email") || ""
        : "");

    if (!email) {
      const prompted = window.prompt(
        "Please enter your email address for plan activation & billing:"
      );
      if (!prompted || !prompted.includes("@")) {
        toast.error("A valid email address is required to activate your plan.");
        return;
      }
      email = prompted.trim();
      if (typeof window !== "undefined") {
        localStorage.setItem("crioverlay_user_email", email);
      }
    }

    const priceNum =
      typeof tier.price === "number"
        ? tier.price
        : parseFloat(String(tier.price).replace(/[^0-9.]/g, ""));

    if (!priceNum || isNaN(priceNum)) {
      toast.error("Invalid plan price format.");
      return;
    }

    const tierIdKey = tier._id || tier.name;
    setLoadingTierId(tierIdKey);

    try {
      const orderId = `SP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const origin = window.location.origin;
      const itemName = `${tier.name} Plan`;
      const successUrl = `${origin}/safepay/success?email=${encodeURIComponent(
        email
      )}&item=${encodeURIComponent(itemName)}&price=${encodeURIComponent(
        String(priceNum)
      )}&planType=${encodeURIComponent(tier.planType || "")}&order_id=${encodeURIComponent(
        orderId
      )}`;
      const cancelUrl = `${origin}/safepay/cancel`;

      // Call API to create Safepay session using official SDK
      const res = await fetch("/api/safepay/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: priceNum,
          orderId,
          currency: "PKR",
          redirectUrl: successUrl,
          cancelUrl: cancelUrl,
          source: "hosted",
          webhooks: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        toast.error(data.error || "Failed to create payment session with SafePay.");
        setLoadingTierId(null);
        return;
      }

      // Directly navigate to Safepay checkout URL
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error("Direct Safepay checkout error:", err);
      toast.error("Network error. Please try again.");
      setLoadingTierId(null);
    }
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
    <div className="flex flex-col min-h-screen w-full bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1 py-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col gap-12 font-outfit w-full">
        {/* Title */}
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space text-slate-900">
            Transparent <span className="text-amber-600">Pricing</span> Plans
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
            Choose the plan that matches your broadcasting scale. Upgrade or cancel anytime.
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-outfit text-sm">Loading pricing plans...</p>
          </div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-slate-500">No pricing plans available at the moment.</p>
          </div>
        ) : (
          /* Pricing Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 items-stretch">
            {tiers.map((tier, idx) => {
              const tierIdKey = tier._id || tier.name;
              const isProcessing = loadingTierId === tierIdKey;

              return (
                <div
                  key={tier._id || idx}
                  className={`flex flex-col rounded-2xl p-8 transition-all duration-300 relative ${
                    tier.featured
                      ? "bg-amber-50/40 border-2 border-amber-500 shadow-md scale-[1.02] md:scale-105"
                      : "bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  {tier.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Popular
                    </span>
                  )}

                  <div className="flex flex-col gap-2 mb-6">
                    <h3 className="text-xl font-bold font-space uppercase text-slate-900">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 mb-6 border-b border-slate-200 pb-6">
                    <span className="text-4xl font-extrabold text-slate-900 font-space">
                      {tier.price}
                    </span>
                    <span className="text-xs text-slate-500">/ {tier.period}</span>
                  </div>

                  <ul className="flex flex-col gap-4 mb-8 flex-1">
                    {tier.features.map((feature: string, fIdx: number) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanCheckout(tier)}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer active:scale-98 flex items-center justify-center gap-2 ${
                      tier.featured
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                    } disabled:opacity-75 disabled:cursor-wait`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirecting to SafePay...
                      </>
                    ) : (
                      tier.buttonText
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
