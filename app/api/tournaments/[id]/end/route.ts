import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Tournament } from "@/models/Tournament";
import { Match } from "@/models/Match";

// POST /api/tournaments/[id]/end — mark tournament as Completed and clear all player rosters
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    await connectDB();

    // Verify ownership and mark as Completed
    const tournament = await Tournament.findOneAndUpdate(
      { _id: id, userId },
      { status: "Completed" },
      { new: true }
    );

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found or you do not have permission." },
        { status: 404 }
      );
    }

    // Clear all player rosters from matches in this tournament
    await Match.updateMany(
      { tournamentId: id, userId },
      { $set: { playersTeam1: [], playersTeam2: [] } }
    );

    return NextResponse.json(
      { message: "Tournament ended. All player rosters cleared.", tournament },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/tournaments/[id]/end error:", error);
    return NextResponse.json(
      { error: "Failed to end tournament." },
      { status: 500 }
    );
  }
}
