import { NextResponse } from "next/server";

/**
 * POST /api/safepay/create-session
 * 
 * Implements Safepay Express Checkout per the official documentation:
 * https://safepay-docs.netlify.app/build-your-integration/express-checkout/
 * 
 * 1. Initializes a tracker via POST https://sandbox.api.getsafepay.com/order/v1/init
 * 2. Builds the hosted checkout URL with beacon, order_id, redirect_url, cancel_url, source=custom, webhooks=true
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      orderId,
      currency = "PKR",
      redirectUrl,
      cancelUrl,
      source = "custom",
      webhooks = true,
    } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "amount and orderId are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SAFEPAY_API_KEY;
    const env = (process.env.SAFEPAY_ENV || "sandbox").toLowerCase().trim();
    const isSandbox = env === "sandbox";

    if (!apiKey) {
      console.error("Safepay API Key (SAFEPAY_API_KEY) is missing in environment variables.");
      return NextResponse.json(
        { error: "Safepay payment gateway is not configured on the server." },
        { status: 500 }
      );
    }

    // Safepay API Host
    const apiHost =
      process.env.SAFEPAY_BASE_URL ||
      (isSandbox
        ? "https://sandbox.api.getsafepay.com"
        : "https://api.getsafepay.com");

    // Safepay Hosted Checkout Host
    const checkoutHost =
      process.env.SAFEPAY_CHECKOUT_URL ||
      (isSandbox
        ? "https://sandbox.api.getsafepay.com/checkout/pay"
        : "https://getsafepay.com/checkout/pay");

    const numericAmount = Number(amount);

    // Step 1: Create payment / tracker
    const initPayload = {
      client: apiKey,
      amount: numericAmount,
      currency: String(currency).toUpperCase(),
      environment: isSandbox ? "sandbox" : "production",
    };

    console.log("Safepay /order/v1/init payload:", JSON.stringify(initPayload));

    const response = await fetch(`${apiHost}/order/v1/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(initPayload),
    });

    const rawText = await response.text();
    let data: any = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Failed to parse Safepay response:", parseErr, rawText);
        return NextResponse.json(
          { error: `Safepay response parse error (status ${response.status}): ${rawText}` },
          { status: 502 }
        );
      }
    }

    if (!response.ok) {
      const errorMsg =
        data?.status?.message ||
        data?.message ||
        data?.error ||
        `Safepay API returned error status ${response.status}`;
      console.error("Safepay init error:", errorMsg, data);
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    // Safepay returns token in data.data.token or data.token
    const token = data?.data?.token || data?.token || data?.data?.tracker || data?.tracker;

    if (!token) {
      console.error("Safepay response missing token:", data);
      return NextResponse.json(
        { error: "Payment gateway failed to issue a transaction token." },
        { status: 502 }
      );
    }

    // Step 2: Build the Safepay checkout URL
    const queryParams = new URLSearchParams({
      beacon: token,
      order_id: String(orderId),
      source: String(source),
      webhooks: webhooks ? "true" : "false",
      env: isSandbox ? "sandbox" : "production",
    });

    if (redirectUrl) {
      queryParams.set("redirect_url", redirectUrl);
    }
    if (cancelUrl) {
      queryParams.set("cancel_url", cancelUrl);
    }

    const checkoutUrl = `${checkoutHost}?${queryParams.toString()}`;

    return NextResponse.json({
      success: true,
      token,
      checkoutUrl,
    });
  } catch (error: any) {
    console.error("Safepay create-session route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

