import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";

// GET /api/public/tournament-matches?tournamentId=xxx — fetch all matches for a tournament (public, no auth)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");

    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId is required" }, { status: 400 });
    }

    await connectDB();

    const matches = await Match.find({ tournamentId })
      .sort({ matchNo: 1 })
      .lean();

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/public/tournament-matches error:", error);
    return NextResponse.json({ error: "Failed to fetch matches." }, { status: 500 });
  }
}
