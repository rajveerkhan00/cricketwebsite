import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";

// GET /api/scoreboard-access?email=xxx&themeSlug=ipl
// Called by the overlay every few seconds to check if user has active access
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

    // Find active, non-expired access for this user + theme
    const access = await ScoreboardAccess.findOne({
      email,
      themeSlug,
      status: "active",
      expiresAt: { $gt: now },
    }).sort({ expiresAt: -1 });

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
