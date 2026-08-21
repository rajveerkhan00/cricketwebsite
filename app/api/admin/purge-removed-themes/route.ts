import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";

const REMOVED_SLUGS = ["cwc-25-india", "wcl-fancode", "sa20", "ipl"];

export async function GET() {
  try {
    await connectDB();
    const result = await ScoreboardTheme.deleteMany({ slug: { $in: REMOVED_SLUGS } });
    return NextResponse.json({
      message: `Purged ${result.deletedCount} discontinued theme(s) from database.`,
      removed: REMOVED_SLUGS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
