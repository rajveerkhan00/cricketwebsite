import { NextResponse } from "next/server";
import { createSafepayCheckoutSession } from "@/lib/safepay";

/**
 * POST /api/safepay/create-session
 * 
 * Uses the official @sfpy/node-core SDK to:
 * 1. Generate Time-Based Token (tbt) via passport.create()
 * 2. Setup payment session via payments.session.setup(...)
 * 3. Generate hosted checkout URL via checkout.createCheckoutUrl(...)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      orderId,
      redirectUrl,
      cancelUrl,
      source = "hosted",
    } = body;

    const safeCurrency =
      typeof body?.currency === "string" && body.currency.trim().length > 0
        ? body.currency.trim().toUpperCase()
        : "PKR";

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "amount and orderId are required." },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount specified." },
        { status: 400 }
      );
    }

    // Normalize source for @sfpy/node-core (supports "hosted", "mobile", "popup", etc.)
    const normalizedSource =
      source === "custom" || !source ? "hosted" : source;

    const session = await createSafepayCheckoutSession({
      amount: numericAmount,
      orderId,
      currency: safeCurrency,
      redirectUrl,
      cancelUrl,
      source: normalizedSource,
    });

    return NextResponse.json({
      success: true,
      token: session.token,
      tbt: session.tbt,
      checkoutUrl: session.checkoutUrl,
    });
  } catch (error: any) {
    console.error("Safepay create-session error:", error);
    return NextResponse.json(
      {
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to initialize Safepay session.",
      },
      { status: 500 }
    );
  }
}
