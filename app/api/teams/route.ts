import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Team } from "@/models/Team";

// GET /api/teams — fetch all saved teams for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    const teams = await Team.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ teams }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json({ error: "Failed to fetch teams." }, { status: 500 });
  }
}

// POST /api/teams — create a new team with players
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, shortName, logoUrl, players } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Team Name is required." }, { status: 400 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    // Filter valid players with non-empty names
    const cleanPlayers = Array.isArray(players)
      ? players
          .filter((p: any) => p && p.name && p.name.trim().length > 0)
          .map((p: any) => ({
            name: p.name.trim(),
            isCaptain: !!p.isCaptain,
            isViceCaptain: !!p.isViceCaptain,
            isWicketKeeper: !!p.isWicketKeeper,
            role: p.role || "Batsman",
          }))
      : [];

    const newTeam = await Team.create({
      userId,
      name: name.trim(),
      shortName: (shortName || "").trim().toUpperCase(),
      logoUrl: logoUrl || "",
      players: cleanPlayers,
    });

    return NextResponse.json({ team: newTeam }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json({ error: "Failed to create team." }, { status: 500 });
  }
}
