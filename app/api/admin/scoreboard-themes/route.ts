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

// POST /api/admin/scoreboard-themes - create a new theme
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { themeId, name, slug, price, badge } = await req.json();

    if (!themeId || !name || !slug || price === undefined) {
      return NextResponse.json(
        { message: "themeId, name, slug, and price are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check unique constraints
    const existingThemeId = await ScoreboardTheme.findOne({ themeId });
    if (existingThemeId) {
      return NextResponse.json(
        { message: `A theme with ID ${themeId} already exists.` },
        { status: 409 }
      );
    }

    const existingSlug = await ScoreboardTheme.findOne({ slug: slug.trim() });
    if (existingSlug) {
      return NextResponse.json(
        { message: `A theme with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const newTheme = await ScoreboardTheme.create({
      themeId: Number(themeId),
      name: name.trim(),
      slug: slug.trim(),
      price: Number(price),
      badge: badge ? badge.trim() : undefined,
    });

    return NextResponse.json(
      { message: "Scoreboard theme created successfully.", theme: newTheme },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/scoreboard-themes error:", error);
    return NextResponse.json(
      { message: "Failed to create scoreboard theme.", error: error.message },
      { status: 500 }
    );
  }
}
