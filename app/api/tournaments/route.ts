import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Tournament } from "@/models/Tournament";

// GET /api/tournaments — fetch all tournaments for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = (session.user as any).id;
    const tournaments = await Tournament.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/tournaments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournaments." },
      { status: 500 }
    );
  }
}

// POST /api/tournaments — create a new tournament for the logged-in user
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, location } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tournament name is required." },
        { status: 400 }
      );
    }

    if (!location || !location.trim()) {
      return NextResponse.json(
        { error: "Tournament location is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = (session.user as any).id;
    const tournament = await Tournament.create({
      name: name.trim(),
      location: location.trim(),
      userId,
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tournaments error:", error);
    return NextResponse.json(
      { error: "Failed to create tournament." },
      { status: 500 }
    );
  }
}
