import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";

// ── Themes permanently removed ─────────────────────────────────────────────
const REMOVED_SLUGS = ["cwc-25-india", "wcl-fancode", "sa20", "ipl"];

// ── Canonical theme list — defines order & defaults only ──────────────────
const DEFAULT_THEMES = [
  { themeId: 1,  name: "Asia Cup",                      slug: "asia-cup",              price: 0 },
  { themeId: 2,  name: "CWC 19",                        slug: "cwc-19",                price: 0 },
  { themeId: 3,  name: "Champions Trophy 2025",          slug: "champions-trophy-2025", price: 60 },
  { themeId: 4,  name: "CWC 23 India",                  slug: "cwc-23-india",          price: 75 },
  { themeId: 5,  name: "BBL Black",                     slug: "bbl-black",             price: 80 },
  { themeId: 6,  name: "CricFusion Theme",               slug: "cricfusion",            price: 80 },
  { themeId: 7,  name: "T20 EMERGING ASIA CUP 2024 🆕",  slug: "t20-emerging-asia-cup", price: 90 },
  { themeId: 8,  name: "Jio Cinema",                    slug: "jiocinema",             price: 120 },
  { themeId: 9,  name: "WT20 2024",                     slug: "wt20-2024",             price: 140 },
  { themeId: 10, name: "BBL Star Sports",                slug: "bbl-starsports",        price: 150 },
  { themeId: 11, name: "IPL 2025",                      slug: "ipl-2025",              price: 150 },
  { themeId: 12, name: "CriOverlay Green",               slug: "crioverlay-green",      price: 0, badge: "FREE" },
  { themeId: 13, name: "Star Sports T20",               slug: "starsports-t20",        price: 150, badge: "NEW" },
];

export async function GET() {
  try {
    await connectDB();

    // ── Step 1: Purge removed themes ───────────────────────────────────────
    await ScoreboardTheme.deleteMany({ slug: { $in: REMOVED_SLUGS } });

    // ── Step 2: Add any missing themes (preserves existing prices) ─────────
    const existing = await ScoreboardTheme.find({});
    const existingSlugs = new Set(existing.map((t: any) => t.slug));

    for (const t of DEFAULT_THEMES) {
      if (!existingSlugs.has(t.slug)) {
        await ScoreboardTheme.create(t);
      }
    }

    // ── Step 3: Return sorted by themeId ──────────────────────────────────
    const themes = await ScoreboardTheme.find({ slug: { $nin: REMOVED_SLUGS } }).sort({ themeId: 1 });

    return NextResponse.json({ themes }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/scoreboard-themes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scoreboard themes.", message: error.message },
      { status: 500 }
    );
  }
}
