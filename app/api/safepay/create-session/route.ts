import { NextResponse } from "next/server";

/**
 * POST /api/safepay/create-session
 * 
 * Initiates a Safepay payment session via /order/v1/init
 * 
 * Body: { amount: number (PKR), orderId: string, currency?: string }
 * Returns: { token: string, checkoutUrl: string }
 */
export async function POST(req: Request) {
  try {
    const { amount, orderId, currency = "PKR" } = await req.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "amount and orderId are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SAFEPAY_API_KEY;
    const env = process.env.SAFEPAY_ENV || "production";
    const isSandbox = env.toLowerCase() === "sandbox";

    const apiHost = isSandbox
      ? "https://sandbox.api.getsafepay.com"
      : "https://api.getsafepay.com";

    const checkoutHost = isSandbox
      ? "https://sandbox.api.getsafepay.com/checkout/pay"
      : "https://getsafepay.com/checkout/pay";

    if (!apiKey) {
      console.error("Safepay API Key (SAFEPAY_API_KEY) is missing in .env.local");
      return NextResponse.json(
        { error: "Payment gateway is not properly configured." },
        { status: 500 }
      );
    }

    // Safepay /order/v1/init accepts normal decimal amount in PKR (e.g. 1000.00)
    const numericAmount = Number(amount);

    const initPayload = {
      client: apiKey,
      amount: numericAmount,
      currency: currency.toUpperCase(),
      environment: isSandbox ? "sandbox" : "production",
    };

    console.log("Calling Safepay init:", `${apiHost}/order/v1/init`, JSON.stringify(initPayload));

    const response = await fetch(`${apiHost}/order/v1/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(initPayload),
    });

    const rawText = await response.text();
    console.log("Safepay response status:", response.status, "Raw body:", rawText);

    let data: any = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Failed to parse Safepay response JSON:", parseErr, rawText);
        return NextResponse.json(
          { error: `Safepay response error (status ${response.status}): ${rawText}` },
          { status: 502 }
        );
      }
    }

    if (!response.ok) {
      const errorMsg =
        data?.status?.message ||
        data?.message ||
        data?.error ||
        `Safepay returned status ${response.status}`;
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    // Safepay returns { data: { token: "..." } } or { token: "..." }
    const token = data?.data?.token || data?.token || data?.data?.tracker || data?.tracker;

    if (!token) {
      console.error("Safepay did not return a token:", data);
      return NextResponse.json(
        { error: "Payment gateway did not provide a transaction token." },
        { status: 502 }
      );
    }

    // Build the Safepay checkout redirect URL
    const checkoutUrl = `${checkoutHost}?env=${isSandbox ? "sandbox" : "production"}&beacon=${encodeURIComponent(token)}&order_id=${encodeURIComponent(orderId)}&source=custom`;

    return NextResponse.json({
      token,
      checkoutUrl,
    });
  } catch (error: any) {
    console.error("SafePay create-session error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
