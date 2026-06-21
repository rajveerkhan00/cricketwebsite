import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { Tournament } from "@/models/Tournament";

// GET /api/matches?tournamentId=xxx — fetch all matches for a tournament (owner only)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");

    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId is required" }, { status: 400 });
    }

    await connectDB();

    const userId = (session.user as any).id;

    // Verify tournament belongs to user
    const tournament = await Tournament.findOne({ _id: tournamentId, userId });
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
    }

    const matches = await Match.find({ tournamentId, userId })
      .sort({ matchNo: 1 })
      .lean();

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json({ error: "Failed to fetch matches." }, { status: 500 });
  }
}

// POST /api/matches — create a new match
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      tournamentId,
      team1Name,
      team2Name,
      overs,
      matchNo,
      tossWonBy,
      optedTo,
      matchTied,
      ballsPerOver,
      matchType,
    } = body;

    if (!tournamentId) return NextResponse.json({ error: "tournamentId is required." }, { status: 400 });
    if (!team1Name?.trim()) return NextResponse.json({ error: "Team 1 Name is required." }, { status: 400 });
    if (!team2Name?.trim()) return NextResponse.json({ error: "Team 2 Name is required." }, { status: 400 });
    if (!overs || overs < 1) return NextResponse.json({ error: "Valid Overs is required." }, { status: 400 });
    if (!matchNo || matchNo < 1) return NextResponse.json({ error: "Valid Match No. is required." }, { status: 400 });
    if (!tossWonBy) return NextResponse.json({ error: "Toss Won By is required." }, { status: 400 });
    if (!optedTo) return NextResponse.json({ error: "Opted To is required." }, { status: 400 });

    await connectDB();

    const userId = (session.user as any).id;

    // Verify tournament belongs to user
    const tournament = await Tournament.findOne({ _id: tournamentId, userId });
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
    }

    const match = await Match.create({
      tournamentId,
      userId,
      team1Name: team1Name.trim(),
      team2Name: team2Name.trim(),
      overs: Number(overs),
      matchNo: Number(matchNo),
      tossWonBy,
      optedTo,
      matchTied: !!matchTied,
      ballsPerOver: Number(ballsPerOver) || 6,
      matchType: matchType || "Group Stage",
      status: "Not Started",
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/matches error:", error);
    return NextResponse.json({ error: "Failed to create match." }, { status: 500 });
  }
}
