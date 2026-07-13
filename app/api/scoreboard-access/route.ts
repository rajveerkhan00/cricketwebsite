import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";
import { Payment } from "@/models/Payment";

// GET /api/scoreboard-access?email=xxx&themeSlug=ipl
// Called by the overlay every few seconds to check if user has active access.
// Falls back to "all-themes" — a plan-level record that unlocks every scoreboard.
// Also retroactively restores missing scoreboard access if an approved plan payment exists.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();
    const themeSlug = searchParams.get("themeSlug")?.trim();

    if (!email || !themeSlug) {
      return NextResponse.json(
        { hasAccess: false, message: "email and themeSlug are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const now = new Date();

    // 1. Check exact theme match
    let access = await ScoreboardAccess.findOne({
      email,
      themeSlug,
      status: "active",
      expiresAt: { $gt: now },
    }).sort({ expiresAt: -1 });

    // 2. Fall back to plan-level "all-themes" access if no per-theme record
    if (!access) {
      access = await ScoreboardAccess.findOne({
        email,
        themeSlug: "all-themes",
        status: "active",
        expiresAt: { $gt: now },
      }).sort({ expiresAt: -1 });
    }

    // 3. Fallback: check if user has an approved plan payment but access wasn't created/synced yet
    if (!access) {
      const approvedPayment = await Payment.findOne({
        email,
        status: "approved",
        $or: [
          { itemName: /professional/i },
          { itemName: /pro/i },
          { itemName: /enterprise/i },
          { itemName: /basic/i },
          { itemName: /starter/i }
        ]
      }).sort({ createdAt: -1 });

      if (approvedPayment) {
        const itemName = approvedPayment.itemName;
        let planType = "basic";
        if (/enterprise/i.test(itemName)) planType = "enterprise";
        else if (/professional|pro/i.test(itemName)) planType = "professional";

        let duration = 24 * 60 * 60 * 1000; // default 24h
        if (planType === "enterprise") duration = 30 * 24 * 60 * 60 * 1000;
        else if (planType === "professional") duration = 7 * 24 * 60 * 60 * 1000;

        const paymentTime = new Date(approvedPayment.updatedAt || approvedPayment.createdAt).getTime();
        const expiresAt = new Date(paymentTime + duration);

        if (expiresAt > now) {
          access = await ScoreboardAccess.findOneAndUpdate(
            { email, themeSlug: "all-themes" },
            {
              email,
              themeSlug: "all-themes",
              paymentId: approvedPayment._id,
              trxId: approvedPayment.trxId,
              grantedAt: new Date(paymentTime),
              expiresAt,
              status: "active",
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    if (!access) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

    const remainingMs = access.expiresAt.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    return NextResponse.json(
      {
        hasAccess: true,
        expiresAt: access.expiresAt.toISOString(),
        grantedAt: access.grantedAt.toISOString(),
        remainingSeconds,
        trxId: access.trxId,
        planAccess: access.themeSlug === "all-themes",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Scoreboard Access Check Error:", error);
    return NextResponse.json(
      { hasAccess: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
