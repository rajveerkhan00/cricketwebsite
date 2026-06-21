import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PricingTier } from "@/models/PricingTier";

const DEFAULT_TIERS = [
  {
    name: "Basic",
    price: "$0",
    period: "forever",
    description: "Ideal for casual local matches and streaming beginners.",
    features: [
      "Standard Cricket Score Overlay",
      "Manual Score Inputs",
      "OBS & Web Browser Integrations",
      "Community Forum Access",
    ],
    buttonText: "Get Started",
    featured: false,
    order: 1,
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "Best for league organizers and serious sports streamers.",
    features: [
      "All Basic Features Included",
      "Advanced Graphic Theme Sets",
      "Automated Match Statistics API",
      "Football Score overlays",
      "Priority Email Support",
    ],
    buttonText: "Choose Pro",
    featured: true,
    order: 2,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "Built for major sports agencies and broadcasting channels.",
    features: [
      "All Pro Features Included",
      "Custom Branding & Watermarks",
      "Dedicated Live Server Stream APIs",
      "Multi-user Agency Roles",
      "24/7 Phone Support Access",
    ],
    buttonText: "Contact Sales",
    featured: false,
    order: 3,
  },
];

export async function GET() {
  try {
    await connectDB();

    let tiers = await PricingTier.find().sort({ order: 1 });

    if (tiers.length === 0) {
      await PricingTier.insertMany(DEFAULT_TIERS);
      tiers = await PricingTier.find().sort({ order: 1 });
    }

    return NextResponse.json({ tiers }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/pricing-tiers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing tiers.", message: error.message },
      { status: 500 }
    );
  }
}
