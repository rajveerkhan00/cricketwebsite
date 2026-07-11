import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";

// GET /api/matches/[id] — fetch match details (public or owner)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid match ID." }, { status: 400 });
    }
    await connectDB();
    const match = await Match.findById(id).lean();
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({ match }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/matches/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch match." }, { status: 500 });
  }
}

// PUT /api/matches/[id] — update a match (owner only)
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
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid match ID." }, { status: 400 });
    }
    const body = await req.json();
    const {
      team1Name,
      team2Name,
      overs,
      matchNo,
      tossWonBy,
      optedTo,
      matchTied,
      ballsPerOver,
      matchType,
      status,
      playersTeam1,
      playersTeam2,
      scoringState,
    } = body;

    await connectDB();

    const userId = (session.user as any).id;

    // Dynamically build the update fields object
    const updateFields: any = {};
    if (team1Name !== undefined) updateFields.team1Name = team1Name.trim();
    if (team2Name !== undefined) updateFields.team2Name = team2Name.trim();
    if (overs !== undefined) updateFields.overs = Number(overs);
    if (matchNo !== undefined) updateFields.matchNo = Number(matchNo);
    if (tossWonBy !== undefined) updateFields.tossWonBy = tossWonBy;
    if (optedTo !== undefined) updateFields.optedTo = optedTo;
    if (matchTied !== undefined) updateFields.matchTied = !!matchTied;
    if (ballsPerOver !== undefined) updateFields.ballsPerOver = Number(ballsPerOver);
    if (matchType !== undefined) updateFields.matchType = matchType;
    if (status !== undefined) updateFields.status = status;
    if (playersTeam1 !== undefined) updateFields.playersTeam1 = playersTeam1;
    if (playersTeam2 !== undefined) updateFields.playersTeam2 = playersTeam2;
    if (scoringState !== undefined) updateFields.scoringState = scoringState;

    const match = await Match.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true }
    );

    if (!match) {
      return NextResponse.json(
        { error: "Match not found or you do not have permission." },
        { status: 404 }
      );
    }

    return NextResponse.json({ match }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/matches/[id] error:", error);
    return NextResponse.json({ error: "Failed to update match." }, { status: 500 });
  }
}

// DELETE /api/matches/[id] — delete a match (owner only)
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
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid match ID." }, { status: 400 });
    }

    await connectDB();

    const userId = (session.user as any).id;
    const match = await Match.findOneAndDelete({ _id: id, userId });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found or you do not have permission." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Match deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/matches/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete match." }, { status: 500 });
  }
}
