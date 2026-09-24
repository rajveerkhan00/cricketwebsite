import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";
import {
  sendPaymentReceivedConfirmationEmail,
  sendAdminPaymentNotificationEmail,
} from "@/lib/mail";

function planDurationMs(planType: string | null | undefined): number {
  switch (planType) {
    case "basic":        return 1  * 24 * 60 * 60 * 1000;  // 1 day
    case "professional": return 7  * 24 * 60 * 60 * 1000;  // 1 week
    case "enterprise":   return 30 * 24 * 60 * 60 * 1000;  // 1 month
    default:             return 24 * 60 * 60 * 1000;        // fallback 1 day
  }
}

function detectPlanTypeFromName(itemName: string): string | null {
  const lower = itemName.toLowerCase();
  if (lower.includes("enterprise")) return "enterprise";
  if (lower.includes("professional") || lower.includes("pro")) return "professional";
  if (lower.includes("basic") || lower.includes("starter")) return "basic";
  return null;
}

/**
 * POST /api/safepay/webhook
 * 
 * Safepay Webhook endpoint for asynchronous payment updates.
 * Documentation: https://safepay-docs.netlify.app/build-your-integration/overview/
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-sfpy-signature") || req.headers.get("x-signature") || "";
    const secretKey = process.env.SAFEPAY_WEBHOOK_SECRET || process.env.SAFEPAY_SECRET_KEY;

    let payload: any = {};
    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch (err) {
        console.error("Safepay webhook JSON parse error:", err);
      }
    }

    // Validate webhook signature if secret key is present
    if (secretKey && signature) {
      const calculatedSig = createHmac("sha256", secretKey)
        .update(rawBody)
        .digest("hex");

      if (calculatedSig.toLowerCase() !== signature.toLowerCase()) {
        console.warn("Safepay webhook signature validation failed:", {
          received: signature,
          calculated: calculatedSig,
        });
      }
    }

    const data = payload?.data || payload;
    const token = data?.token || data?.tracker || payload?.tracker?.token || payload?.token;
    const trackerState = data?.state || payload?.tracker?.state || data?.status;

    console.log("Safepay webhook received:", {
      token,
      state: trackerState,
      event: payload?.event || payload?.type,
    });

    // Check if tracker was completed/paid
    const isPaid =
      trackerState === "PAID" ||
      trackerState === "COMPLETED" ||
      trackerState === "TRACKER_ENDED" ||
      payload?.event === "payment.completed" ||
      payload?.event === "tracker.completed";

    if (isPaid && token) {
      await connectDB();
      const customerEmail = data?.customer?.email || data?.email || data?.metadata?.email;
      const itemName = data?.metadata?.item || data?.metadata?.itemName || "CriOverlay Scoreboard Plan";
      const itemPrice = data?.amount || data?.metadata?.price || "0";
      const planType = data?.metadata?.planType || detectPlanTypeFromName(itemName);

      if (customerEmail) {
        const normalizedEmail = customerEmail.toLowerCase().trim();
        const existing = await Payment.findOne({ trxId: token });

        if (!existing) {
          const newPayment = await Payment.create({
            email: normalizedEmail,
            senderNumber: "SafePay (Webhook)",
            trxId: token,
            itemName: itemName.trim(),
            itemPrice: String(itemPrice).trim(),
            status: "approved",
          });

          if (planType) {
            const grantedAt = new Date();
            const expiresAt = new Date(grantedAt.getTime() + planDurationMs(planType));

            await ScoreboardAccess.findOneAndUpdate(
              { email: normalizedEmail, themeSlug: "all-themes" },
              {
                email: normalizedEmail,
                themeSlug: "all-themes",
                paymentId: newPayment._id,
                trxId: token,
                grantedAt,
                expiresAt,
                status: "active",
              },
              { upsert: true, new: true }
            );

            try {
              await sendPaymentReceivedConfirmationEmail(normalizedEmail, {
                itemName,
                itemPrice,
                senderNumber: "SafePay",
                trxId: token,
              });
              const adminEmail = process.env.SMTP_USER || "crioverlay@gmail.com";
              await sendAdminPaymentNotificationEmail(adminEmail, {
                userEmail: normalizedEmail,
                itemName,
                itemPrice,
                senderNumber: "SafePay",
                trxId: token,
              });
            } catch (mailErr) {
              console.error("Safepay webhook mail sending error:", mailErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Safepay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler error", detail: error?.message },
      { status: 500 }
    );
  }
}
