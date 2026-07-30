import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Match } from "@/models/Match";

// GET /api/matches/active — Fetch active match of a user by email
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let email = searchParams.get("email");

    await connectDB();

    // If no email passed in query, try session
    if (!email) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        email = session.user.email;
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Email query param is required." }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.activeMatchId) {
      return NextResponse.json({ match: null }, { status: 200 });
    }

    const match = await Match.findById(user.activeMatchId).lean();
    return NextResponse.json({ match }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/matches/active error:", error);
    return NextResponse.json({ error: "Failed to fetch active match." }, { status: 500 });
  }
}

// POST /api/matches/active — Update active match for currently logged in user
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      { activeMatchId: matchId },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Active match updated successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/matches/active error:", error);
    return NextResponse.json({ error: "Failed to update active match." }, { status: 500 });
  }
}
