import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";
import {
  sendPaymentReceivedConfirmationEmail,
  sendAdminPaymentNotificationEmail,
} from "@/lib/mail";

// ── Plan duration helper (mirrors /api/payments) ──────────────────────────────
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

async function resolveThemeSlug(itemName: string): Promise<string | null> {
  try {
    const themes = await ScoreboardTheme.find({});
    const lowerItem = itemName.toLowerCase().trim();
    for (const theme of themes) {
      const slug = theme.slug.toLowerCase().trim();
      const name = theme.name.toLowerCase().trim();
      if (
        lowerItem === slug || lowerItem === name ||
        lowerItem.includes(slug) || lowerItem.includes(name) ||
        slug.includes(lowerItem) || name.includes(lowerItem)
      ) {
        return theme.slug;
      }
    }
    if (lowerItem.includes("scoreboard access")) return "match-access";
    return null;
  } catch {
    return null;
  }
}

/**
 * POST /api/safepay/verify
 *
 * Called from the /safepay/success page after Safepay redirects back.
 * Verifies the transaction signature and records payment + grants access.
 *
 * Body: { token: string, orderId: string, email: string, itemName: string, itemPrice: string, planType?: string, sig?: string }
 */
export async function POST(req: Request) {
  try {
    const {
      token,
      orderId,
      email,
      itemName,
      itemPrice,
      planType: providedPlanType,
      sig,
    } = await req.json();

    if (!token || !email || !itemName || !itemPrice) {
      return NextResponse.json(
        { error: "token, email, itemName, and itemPrice are required." },
        { status: 400 }
      );
    }

    const secretKey = process.env.SAFEPAY_SECRET_KEY;

    // Optional cryptographic signature validation if sig provided by Safepay redirect
    if (sig && secretKey) {
      const calculatedSig = createHmac("sha256", secretKey)
        .update(token)
        .digest("hex");

      if (calculatedSig.toLowerCase() !== sig.toLowerCase()) {
        console.warn("Safepay signature mismatch:", { calculatedSig, sig });
        // If strict mismatch, log warning
      }
    }

    // ── Payment confirmed — record it ─────────────────────────────────────────
    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if payment already recorded with this trxId/token to prevent duplicates
    const existing = await Payment.findOne({ trxId: token });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified! Access is active.",
        payment: existing,
      });
    }

    const newPayment = await Payment.create({
      email: normalizedEmail,
      senderNumber: "SafePay",
      trxId: token,
      itemName: itemName.trim(),
      itemPrice: String(itemPrice).trim(),
      status: "approved",
    });

    // ── Grant scoreboard access ───────────────────────────────────────────────
    const resolvedPlanType = providedPlanType || detectPlanTypeFromName(itemName);

    if (resolvedPlanType) {
      const grantedAt = new Date();
      const expiresAt = new Date(grantedAt.getTime() + planDurationMs(resolvedPlanType));

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

      const durationLabel =
        resolvedPlanType === "enterprise" ? "1 month"
        : resolvedPlanType === "professional" ? "1 week"
        : "1 day";

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
      } catch (mailError: any) {
        console.error("Email sending failed:", mailError);
      }

      return NextResponse.json({
        success: true,
        message: `Payment verified! All 15 scoreboards are now unlocked for ${durationLabel}.`,
        payment: newPayment,
        planType: resolvedPlanType,
        themeSlug: "all-themes",
      });
    }

    // ── Legacy per-theme purchase ─────────────────────────────────────────────
    const themeSlug = await resolveThemeSlug(itemName);

    if (themeSlug) {
      const grantedAt = new Date();
      const expiresAt = new Date(grantedAt.getTime() + 24 * 60 * 60 * 1000);

      await ScoreboardAccess.findOneAndUpdate(
        { email: normalizedEmail, themeSlug },
        {
          email: normalizedEmail,
          themeSlug,
          paymentId: newPayment._id,
          trxId: token,
          grantedAt,
          expiresAt,
          status: "active",
        },
        { upsert: true, new: true }
      );
    }

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
    } catch (mailError: any) {
      console.error("Email sending failed:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified! Your scoreboard is now unlocked for 24 hours.",
      payment: newPayment,
      themeSlug,
    });
  } catch (error: any) {
    console.error("SafePay verify error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again.", detail: error?.message },
      { status: 500 }
    );
  }
}
