import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";

// GET /api/admin/seed-theme16 - inserts/forces CriOverlay Green as free theme #16
export async function GET() {
  try {
    await connectDB();

    let theme = await ScoreboardTheme.findOne({ slug: "crioverlay-green" });
    if (theme) {
      theme.price = 0;
      theme.badge = "FREE";
      theme.themeId = 16;
      await theme.save();
      return NextResponse.json({ message: "✅ Theme 16 (CriOverlay Green) reset to FREE in database!", theme });
    }

    theme = await ScoreboardTheme.create({
      themeId: 16,
      name: "CriOverlay Green",
      slug: "crioverlay-green",
      price: 0,
      badge: "FREE",
    });

    return NextResponse.json({ message: "✅ Theme 16 (CriOverlay Green) created successfully!", theme }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create/reset theme.", error: error.message }, { status: 500 });
  }
}
