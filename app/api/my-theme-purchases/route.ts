import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ approvedSlugs: [], isPlanActive: false }, { status: 200 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    const now = new Date();

    // 1. Fetch all active, non-expired ScoreboardAccess records for this user
    const activeAccesses = await ScoreboardAccess.find({
      email: normalizedEmail,
      status: "active",
      expiresAt: { $gt: now },
    });

    // 2. Fetch all themes to map them
    const themes = await ScoreboardTheme.find({});
    const themeSlugs = themes.map(t => t.slug);

    const approvedSlugs: string[] = [];
    const themeRemainingSeconds: Record<string, number> = {};

    let isPlanActive = false;
    let planExpiresAt: string | null = null;
    let planRemainingSeconds = 0;
    let planName = "";

    // 3. Check plan-level access ("all-themes")
    const activePlanAccess = activeAccesses.find(a => a.themeSlug === "all-themes");
    
    if (activePlanAccess) {
      isPlanActive = true;
      planExpiresAt = activePlanAccess.expiresAt.toISOString();
      planRemainingSeconds = Math.max(0, Math.floor((activePlanAccess.expiresAt.getTime() - now.getTime()) / 1000));
      
      // Attempt to resolve plan name from linked payment
      if (activePlanAccess.paymentId) {
        const p = await Payment.findById(activePlanAccess.paymentId);
        if (p) planName = p.itemName;
      }
      if (!planName) planName = "Active Plan";

      // If they have plan access, ALL themes are unlocked!
      approvedSlugs.push(...themeSlugs);
      
      // Set remaining time for all themes to plan remaining time
      for (const slug of themeSlugs) {
        themeRemainingSeconds[slug] = planRemainingSeconds;
      }
    } else {
      // 4. Per-theme access logic (legacy or individual purchases)
      for (const access of activeAccesses) {
        if (access.themeSlug !== "all-themes") {
          approvedSlugs.push(access.themeSlug);
          themeRemainingSeconds[access.themeSlug] = Math.max(
            0,
            Math.floor((access.expiresAt.getTime() - now.getTime()) / 1000)
          );
        }
      }

      // 5. Fallback: check if they have an approved plan payment but access wasn't created yet
      const approvedPayment = await Payment.findOne({
        email: normalizedEmail,
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

        let duration = 24 * 60 * 60 * 1000;
        if (planType === "enterprise") duration = 30 * 24 * 60 * 60 * 1000;
        else if (planType === "professional") duration = 7 * 24 * 60 * 60 * 1000;

        const paymentTime = new Date(approvedPayment.updatedAt || approvedPayment.createdAt).getTime();
        const expiresAt = new Date(paymentTime + duration);

        if (expiresAt > now) {
          isPlanActive = true;
          planName = itemName;
          planExpiresAt = expiresAt.toISOString();
          planRemainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

          // Auto-insert missing scoreboard access record
          await ScoreboardAccess.findOneAndUpdate(
            { email: normalizedEmail, themeSlug: "all-themes" },
            {
              email: normalizedEmail,
              themeSlug: "all-themes",
              paymentId: approvedPayment._id,
              trxId: approvedPayment.trxId,
              grantedAt: new Date(paymentTime),
              expiresAt,
              status: "active",
            },
            { upsert: true }
          );

          // All themes are unlocked by plan
          approvedSlugs.push(...themeSlugs);
          for (const slug of themeSlugs) {
            themeRemainingSeconds[slug] = planRemainingSeconds;
          }
        }
      }
    }

    return NextResponse.json({
      approvedSlugs: Array.from(new Set(approvedSlugs)),
      themeRemainingSeconds,
      isPlanActive,
      planName,
      planExpiresAt,
      planRemainingSeconds,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Failed to check theme purchases:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
