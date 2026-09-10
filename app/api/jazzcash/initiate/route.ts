import { NextResponse } from "next/server";
import { createHmac } from "crypto";

// ── Helpers ──────────────────────────────────────────────────────────────────

function nowPK(): string {
  // Returns current PKT (UTC+5) datetime as YYYYMMDDHHMMSS
  const now = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    now.getUTCFullYear().toString() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds())
  );
}

function expiryPK(): string {
  // Transaction expiry: 30 minutes from now in PKT
  const exp = new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    exp.getUTCFullYear().toString() +
    pad(exp.getUTCMonth() + 1) +
    pad(exp.getUTCDate()) +
    pad(exp.getUTCHours()) +
    pad(exp.getUTCMinutes()) +
    pad(exp.getUTCSeconds())
  );
}

function generateTxnRef(): string {
  // Unique transaction reference: T + timestamp + random 4 digits
  const ts = Date.now().toString().slice(-10);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `T${ts}${rand}`;
}

function buildSecureHash(params: Record<string, string>, integritySalt: string): string {
  // 1. Filter only pp_ keys (exclude pp_SecureHash itself)
  // 2. Sort alphabetically by key
  // 3. Concatenate values with & separator, prepend integritySalt
  // 4. HMAC-SHA256 with integritySalt as key
  const sortedKeys = Object.keys(params)
    .filter((k) => k.startsWith("pp_") && k !== "pp_SecureHash")
    .sort();

  const valueString =
    integritySalt + "&" + sortedKeys.map((k) => params[k]).join("&");

  return createHmac("sha256", integritySalt)
    .update(valueString)
    .digest("hex")
    .toUpperCase();
}

// ── POST /api/jazzcash/initiate ───────────────────────────────────────────────
// Initiates a JazzCash mWallet payment request.
// JazzCash sends an OTP push notification to the customer's JazzCash app.
export async function POST(req: Request) {
  try {
    const { mobileNumber, amountPaisa, description, cnic, txnRef: providedRef } =
      await req.json();

    if (!mobileNumber || !amountPaisa) {
      return NextResponse.json(
        { error: "Mobile number and amount are required." },
        { status: 400 }
      );
    }

    const merchantId = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const apiUrl =
      process.env.JAZZCASH_MWALLET_URL ||
      "https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

    if (!merchantId || !password || !integritySalt) {
      console.error("JazzCash env vars not set");
      return NextResponse.json(
        { error: "Payment gateway not configured." },
        { status: 500 }
      );
    }

    const txnDateTime = nowPK();
    const txnExpiryDateTime = expiryPK();
    const txnRefNo = providedRef || generateTxnRef();

    // Normalize mobile: ensure it starts with 03 (11 digits)
    const normalizedMobile = mobileNumber
      .trim()
      .replace(/\D/g, "")
      .replace(/^92/, "0");

    const params: Record<string, string> = {
      pp_Version: "2.0",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchantId,
      pp_SubMerchantID: "",
      pp_Password: password,
      pp_BillReference: `billRef${txnRefNo}`,
      pp_Amount: String(amountPaisa), // in paisa: PKR 100 = "10000"
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_TxnRefNo: txnRefNo,
      pp_Description: (description || "CricOverlay Subscription").substring(0, 100),
      pp_MobileNumber: normalizedMobile,
      pp_CNIC: (cnic || "").trim(),
      pp_ReturnURL: "",
    };

    params.pp_SecureHash = buildSecureHash(params, integritySalt);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    // JazzCash response codes:
    // 000 = success (OTP sent)
    // 121 = OTP sent, waiting for user confirmation
    // Others = error
    const responseCode = data.pp_ResponseCode || data.ResponseCode;
    const responseMessage = data.pp_ResponseMessage || data.ResponseMessage || "Unknown error";

    if (responseCode === "000" || responseCode === "121") {
      return NextResponse.json({
        success: true,
        txnRefNo,
        responseCode,
        message: "OTP sent to your JazzCash app. Please approve the payment.",
        raw: data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        responseCode,
        message: responseMessage,
        raw: data,
      },
      { status: 422 }
    );
  } catch (error: any) {
    console.error("JazzCash initiate error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment. Please try again." },
      { status: 500 }
    );
  }
}
