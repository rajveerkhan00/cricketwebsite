import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Tournament } from "@/models/Tournament";

// PUT /api/tournaments/[id] — update a tournament (owner only)
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
    const tournament = await Tournament.findOneAndUpdate(
      { _id: id, userId },
      { name: name.trim(), location: location.trim() },
      { new: true }
    );

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found or you do not have permission." },
        { status: 404 }
      );
    }

    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/tournaments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update tournament." },
      { status: 500 }
    );
  }
}

// DELETE /api/tournaments/[id] — delete a tournament (owner only)
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
    const tournament = await Tournament.findOneAndDelete({ _id: id, userId });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found or you do not have permission." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Tournament deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/tournaments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete tournament." },
      { status: 500 }
    );
  }
}
