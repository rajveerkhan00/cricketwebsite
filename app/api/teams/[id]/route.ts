import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Team } from "@/models/Team";

// GET /api/teams/[id] — get a specific team
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const userId = (session.user as any).id;

    const team = await Team.findOne({ _id: id, userId }).lean();
    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    return NextResponse.json({ team }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch team." }, { status: 500 });
  }
}

// PUT /api/teams/[id] — update a specific team
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, shortName, logoUrl, players } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Team Name is required." }, { status: 400 });
    }

    await connectDB();
    const userId = (session.user as any).id;

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

    const updatedTeam = await Team.findOneAndUpdate(
      { _id: id, userId },
      {
        name: name.trim(),
        shortName: (shortName || "").trim().toUpperCase(),
        logoUrl: logoUrl || "",
        players: cleanPlayers,
      },
      { new: true }
    );

    if (!updatedTeam) {
      return NextResponse.json({ error: "Team not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ team: updatedTeam }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Failed to update team." }, { status: 500 });
  }
}

// DELETE /api/teams/[id] — delete a specific team
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const userId = (session.user as any).id;

    const deleted = await Team.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Team not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ message: "Team deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete team." }, { status: 500 });
  }
}
