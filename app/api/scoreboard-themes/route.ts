import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";

const DEFAULT_THEMES = [
  { themeId: 1, name: "Asia Cup", slug: "asia-cup", price: 35 },
  { themeId: 2, name: "CWC 19", slug: "cwc-19", price: 45 },
  { themeId: 3, name: "Champions Trophy 2025", slug: "champions-trophy-2025", price: 60 },
  { themeId: 4, name: "CWC 25 India ♻️", slug: "cwc-25-india", price: 70 },
  { themeId: 5, name: "WCL (Fancode)", slug: "wcl-fancode", price: 60 },
  { themeId: 6, name: "CWC 23 India", slug: "cwc-23-india", price: 75 },
  { themeId: 7, name: "BBL Black", slug: "bbl-black", price: 80 },
  { themeId: 8, name: "CricFusion Theme", slug: "cricfusion", price: 80 },
  { themeId: 9, name: "T20 EMERGING ASIA CUP 2024 🆕", slug: "t20-emerging-asia-cup", price: 90 },
  { themeId: 10, name: "SA20", slug: "sa20", price: 100 },
  { themeId: 11, name: "Jio Cinema", slug: "jiocinema", price: 120 },
  { themeId: 12, name: "IPL", slug: "ipl", price: 130 },
  { themeId: 13, name: "WT20 2024", slug: "wt20-2024", price: 140 },
  { themeId: 14, name: "BBL Star Sports", slug: "bbl-starsports", price: 150 },
  { themeId: 15, name: "IPL 2025", slug: "ipl-2025", price: 150 },
];

export async function GET() {
  try {
    await connectDB();

    let themes = await ScoreboardTheme.find().sort({ themeId: 1 });

    if (themes.length < DEFAULT_THEMES.length) {
      for (const defaultTheme of DEFAULT_THEMES) {
        const exists = themes.some(t => t.themeId === defaultTheme.themeId);
        if (!exists) {
          await ScoreboardTheme.create(defaultTheme);
        }
      }
      themes = await ScoreboardTheme.find().sort({ themeId: 1 });
    }

    return NextResponse.json({ themes }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/scoreboard-themes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scoreboard themes.", message: error.message },
      { status: 500 }
    );
  }
}
