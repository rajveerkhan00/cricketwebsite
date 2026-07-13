import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";
import { PricingTier } from "@/models/PricingTier";
import {
  sendPaymentReceivedConfirmationEmail,
  sendAdminPaymentNotificationEmail,
} from "@/lib/mail";

// ── Plan duration helper ───────────────────────────────────────────────────────
// Returns ms to add to Date.now() based on planType
function planDurationMs(planType: string | null | undefined): number {
  switch (planType) {
    case "basic":        return 1 * 24 * 60 * 60 * 1000;   // 1 day
    case "professional": return 7 * 24 * 60 * 60 * 1000;   // 1 week
    case "enterprise":   return 30 * 24 * 60 * 60 * 1000;  // 1 month
    default:             return 24 * 60 * 60 * 1000;        // fallback 1 day
  }
}

// ── Keyword-based planType fallback ───────────────────────────────────────────
// Used when the PricingTier record has no planType set
function detectPlanTypeFromName(itemName: string): string | null {
  const lower = itemName.toLowerCase();
  if (lower.includes("enterprise")) return "enterprise";
  if (lower.includes("professional") || lower.includes("pro")) return "professional";
  if (lower.includes("basic") || lower.includes("starter")) return "basic";
  return null;
}

// ── Per-theme slug resolver (legacy / theme purchases) ────────────────────────
async function resolveThemeSlug(itemName: string): Promise<string | null> {
  try {
    const themes = await ScoreboardTheme.find({});
    const lowerItem = itemName.toLowerCase().trim();
    for (const theme of themes) {
      const slug = theme.slug.toLowerCase().trim();
      const name = theme.name.toLowerCase().trim();
      if (
        lowerItem === slug ||
        lowerItem === name ||
        lowerItem.includes(slug) ||
        lowerItem.includes(name) ||
        slug.includes(lowerItem) ||
        name.includes(lowerItem)
      ) {
        return theme.slug;
      }
    }
    if (lowerItem.includes("scoreboard access")) {
      return "match-access";
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const {
      email,
      senderNumber,
      trxId,
      itemName,
      itemPrice,
      themeSlug: providedSlug,
      planType: providedPlanType,
    } = await req.json();

    if (!email || !senderNumber || !trxId || !itemName || !itemPrice) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // All payments submitted via form are auto-approved immediately
    const paymentStatus = "approved";

    // Create the payment record
    const newPayment = await Payment.create({
      email: normalizedEmail,
      senderNumber: senderNumber.trim(),
      trxId: trxId.trim(),
      itemName: itemName.trim(),
      itemPrice: String(itemPrice).trim(),
      status: paymentStatus,
    });

    // ── Determine if this is a PLAN purchase (unlocks all themes) ─────────────
    // Priority: planType provided by client → detect from itemName
    const resolvedPlanType = providedPlanType || detectPlanTypeFromName(itemName);

    if (resolvedPlanType) {
      // ── Plan purchase: grant "all-themes" access ───────────────────────────
      const grantedAt = new Date();
      const expiresAt = new Date(grantedAt.getTime() + planDurationMs(resolvedPlanType));

      await ScoreboardAccess.findOneAndUpdate(
        { email: normalizedEmail, themeSlug: "all-themes" },
        {
          email: normalizedEmail,
          themeSlug: "all-themes",
          paymentId: newPayment._id,
          trxId: trxId.trim(),
          grantedAt,
          expiresAt,
          status: "active",
        },
        { upsert: true, new: true }
      );

      const durationLabel =
        resolvedPlanType === "enterprise"
          ? "1 month"
          : resolvedPlanType === "professional"
          ? "1 week"
          : "1 day";

      try {
        await sendPaymentReceivedConfirmationEmail(normalizedEmail, {
          itemName,
          itemPrice,
          senderNumber,
          trxId,
        });
        const adminEmail = process.env.SMTP_USER || "cricovelay@gmail.com";
        await sendAdminPaymentNotificationEmail(adminEmail, {
          userEmail: normalizedEmail,
          itemName,
          itemPrice,
          senderNumber,
          trxId,
        });
      } catch (mailError: any) {
        console.error("Email sending failed:", mailError);
      }

      return NextResponse.json(
        {
          message: `Payment verified! All 15 scoreboards are now unlocked for ${durationLabel}.`,
          payment: newPayment,
          planType: resolvedPlanType,
          themeSlug: "all-themes",
        },
        { status: 201 }
      );
    }

    // ── Legacy per-theme purchase ──────────────────────────────────────────────
    const themeSlug = providedSlug || (await resolveThemeSlug(itemName));

    if (themeSlug) {
      const grantedAt = new Date();
      const expiresAt = new Date(grantedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      await ScoreboardAccess.findOneAndUpdate(
        { email: normalizedEmail, themeSlug },
        {
          email: normalizedEmail,
          themeSlug,
          paymentId: newPayment._id,
          trxId: trxId.trim(),
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
        senderNumber,
        trxId,
      });
      const adminEmail = process.env.SMTP_USER || "cricovelay@gmail.com";
      await sendAdminPaymentNotificationEmail(adminEmail, {
        userEmail: normalizedEmail,
        itemName,
        itemPrice,
        senderNumber,
        trxId,
      });
    } catch (mailError: any) {
      console.error("Email sending failed:", mailError);
    }

    return NextResponse.json(
      {
        message: "Payment verified! Your scoreboard is now unlocked for 24 hours.",
        payment: newPayment,
        themeSlug,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Payment Submission Error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again.", error: error.message },
      { status: 500 }
    );
  }
}
