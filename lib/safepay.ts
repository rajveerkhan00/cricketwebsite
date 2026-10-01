import Safepay from "@sfpy/node-core";

const PRIVATE_KEY =
  process.env.SAFEPAY_PRIVATE_KEY ||
  process.env.SAFEPAY_SECRET_KEY ||
  "ee4bc5d0a8d6713730ed4d402d53052f3e0eb3c66850142da395b56569f858ee";

const PUBLIC_KEY =
  process.env.SAFEPAY_PUBLIC_KEY ||
  process.env.SAFEPAY_API_KEY ||
  "sec_5d4ce87d-b7e5-4027-93e2-83d8455fe11e";

const SAFEPAY_ENV = ((process.env.SAFEPAY_ENV || "sandbox").toLowerCase().trim()) as
  | "sandbox"
  | "production"
  | "development";

const HOST =
  SAFEPAY_ENV === "production"
    ? "https://api.getsafepay.com"
    : "https://sandbox.api.getsafepay.com";

// Initialize Safepay SDK
export const safepay = (Safepay as any)(PRIVATE_KEY, {
  authType: "secret",
  host: HOST,
});

export { PRIVATE_KEY, PUBLIC_KEY, SAFEPAY_ENV, HOST };

export interface CreateSafepaySessionOptions {
  amount: number;
  orderId: string;
  currency?: string;
  redirectUrl?: string;
  cancelUrl?: string;
  source?: "hosted" | "mobile" | "popup" | "woocommerce" | "shopify";
}

/**
 * High-level helper to generate Safepay checkout URL using the official @sfpy/node-core SDK
 */
export async function createSafepayCheckoutSession({
  amount,
  orderId,
  currency = "PKR",
  redirectUrl,
  cancelUrl,
  source = "hosted",
}: CreateSafepaySessionOptions) {
  // 1. Generate Time-Based Token (tbt)
  const { data: tbt } = await safepay.client.passport.create();

  const safeCurrency =
    typeof currency === "string" && currency.trim().length > 0
      ? currency.trim().toUpperCase()
      : "PKR";

  // 2. Create payments checkout session setup
  const sessionRes = await safepay.payments.session.setup({
    merchant_api_key: PUBLIC_KEY,
    intent: "CYBERSOURCE",
    mode: "payment",
    currency: safeCurrency,
    // Safepay expects amounts in lowest currency subunit (1 PKR = 100 Paisas)
    amount: Math.round(Number(amount) * 100),
  });

  const token = sessionRes?.data?.tracker?.token;
  if (!token) {
    throw new Error(
      sessionRes?.status?.message ||
        "Safepay failed to return a transaction tracker token."
    );
  }

  // 3. Generate Safepay hosted checkout URL
  const checkoutUrl = safepay.checkout.createCheckoutUrl({
    env: SAFEPAY_ENV === "production" ? "production" : "sandbox",
    source,
    tbt,
    tracker: token,
    redirect_url: redirectUrl,
    cancel_url: cancelUrl,
    order_id: String(orderId),
  });

  return {
    tbt,
    token,
    checkoutUrl,
  };
}
