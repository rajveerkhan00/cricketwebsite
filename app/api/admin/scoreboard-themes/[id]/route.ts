import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

// PUT /api/admin/scoreboard-themes/[id] - update scoreboard theme
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { themeId, name, slug, price, badge } = body;

    if (!themeId || !name || !slug || price === undefined) {
      return NextResponse.json(
        { message: "themeId, name, slug, and price are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check unique constraints for other records
    const existingThemeId = await ScoreboardTheme.findOne({ themeId, _id: { $ne: id } });
    if (existingThemeId) {
      return NextResponse.json(
        { message: `Another theme with ID ${themeId} already exists.` },
        { status: 409 }
      );
    }

    const existingSlug = await ScoreboardTheme.findOne({ slug: slug.trim(), _id: { $ne: id } });
    if (existingSlug) {
      return NextResponse.json(
        { message: `Another theme with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const updatedTheme = await ScoreboardTheme.findByIdAndUpdate(
      id,
      {
        themeId: Number(themeId),
        name: name.trim(),
        slug: slug.trim(),
        price: Number(price),
        badge: badge ? badge.trim() : undefined,
      },
      { new: true }
    );

    if (!updatedTheme) {
      return NextResponse.json({ message: "Scoreboard theme not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Scoreboard theme updated successfully.", theme: updatedTheme },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/scoreboard-themes/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update scoreboard theme.", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/scoreboard-themes/[id] - delete scoreboard theme
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { id } = await params;

    await connectDB();

    const deletedTheme = await ScoreboardTheme.findByIdAndDelete(id);

    if (!deletedTheme) {
      return NextResponse.json({ message: "Scoreboard theme not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Scoreboard theme deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/scoreboard-themes/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete scoreboard theme.", error: error.message },
      { status: 500 }
    );
  }
}
