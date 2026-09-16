import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";
import { User } from "@/models/User";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

// GET /api/admin/scoreboard-access
// Fetches list of all scoreboard access grants with optional query filters
export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();
    const status = searchParams.get("status")?.trim();
    const themeSlug = searchParams.get("themeSlug")?.trim();

    await connectDB();

    const query: any = {};
    if (email) query.email = { $regex: email, $options: "i" };
    if (status && status !== "all") query.status = status;
    if (themeSlug && themeSlug !== "all") query.themeSlug = themeSlug;

    const accessRecords = await ScoreboardAccess.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Fetch themes for title resolution
    const themes = await ScoreboardTheme.find({}).lean();
    const themeMap: Record<string, string> = {
      "all-themes": "All Scoreboards (Global Plan / Unlock)",
    };
    themes.forEach((t) => {
      themeMap[t.slug] = t.name;
    });

    // Fetch user details to enhance response
    const emails = Array.from(new Set(accessRecords.map((r) => r.email)));
    const users = await User.find({ email: { $in: emails } })
      .select("name email image")
      .lean();
    const userMap = new Map(users.map((u) => [u.email.toLowerCase(), u]));

    const enrichedRecords = accessRecords.map((record) => {
      const u = userMap.get(record.email.toLowerCase());
      const now = Date.now();
      const expiresAt = new Date(record.expiresAt).getTime();
      const isExpired = expiresAt <= now;
      const effectiveStatus = record.status === "revoked" ? "revoked" : isExpired ? "expired" : "active";
      const remainingMs = Math.max(0, expiresAt - now);

      return {
        ...record,
        userName: u?.name || record.email.split("@")[0],
        userImage: u?.image || null,
        themeName: themeMap[record.themeSlug] || record.themeSlug,
        effectiveStatus,
        remainingMs,
      };
    });

    return NextResponse.json({ accesses: enrichedRecords }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/scoreboard-access error:", error);
    return NextResponse.json(
      { message: "Failed to fetch scoreboard access records.", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/scoreboard-access
// Admin grants all or specific scoreboard access to a user for a specific duration
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, unlockType, themeSlugs, durationMs, expiresAt: customExpiresAt, durationLabel, note } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await connectDB();

    // Calculate expiry date
    const now = new Date();
    let expiresAt: Date;
    if (customExpiresAt) {
      expiresAt = new Date(customExpiresAt);
      if (isNaN(expiresAt.getTime()) || expiresAt <= now) {
        return NextResponse.json({ message: "Custom expiry date must be in the future." }, { status: 400 });
      }
    } else if (durationMs && typeof durationMs === "number" && durationMs > 0) {
      expiresAt = new Date(now.getTime() + durationMs);
    } else {
      // Default fallback: 7 days
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const grantedBy = (session.user as any)?.email || (session.user as any)?.name || "admin";
    const label = durationLabel || "Custom";
    const userNote = note ? String(note).trim() : "";
    const results = [];

    if (unlockType === "all") {
      // Unlock ALL scoreboards for this user (global "all-themes")
      const access = await ScoreboardAccess.findOneAndUpdate(
        { email: normalizedEmail, themeSlug: "all-themes" },
        {
          email: normalizedEmail,
          themeSlug: "all-themes",
          trxId: `ADMIN_GLOBAL_${Date.now().toString(36).toUpperCase()}`,
          grantedBy,
          durationLabel: label,
          note: userNote,
          grantedAt: now,
          expiresAt,
          status: "active",
        },
        { upsert: true, new: true }
      );
      results.push(access);
    } else {
      // Unlock specific scoreboard(s)
      const slugs: string[] = Array.isArray(themeSlugs) ? themeSlugs : [themeSlugs];
      if (slugs.length === 0) {
        return NextResponse.json({ message: "At least one scoreboard theme must be selected." }, { status: 400 });
      }

      for (const slug of slugs) {
        if (!slug || typeof slug !== "string") continue;
        const cleanSlug = slug.trim();
        const access = await ScoreboardAccess.findOneAndUpdate(
          { email: normalizedEmail, themeSlug: cleanSlug },
          {
            email: normalizedEmail,
            themeSlug: cleanSlug,
            trxId: `ADMIN_${cleanSlug.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`,
            grantedBy,
            durationLabel: label,
            note: userNote,
            grantedAt: now,
            expiresAt,
            status: "active",
          },
          { upsert: true, new: true }
        );
        results.push(access);
      }
    }

    return NextResponse.json(
      {
        message: `Successfully granted scoreboard access to ${normalizedEmail}!`,
        count: results.length,
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/scoreboard-access error:", error);
    return NextResponse.json(
      { message: "Failed to grant scoreboard access.", error: error.message },
      { status: 500 }
    );
  }
}
