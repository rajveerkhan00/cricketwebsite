import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

// PATCH /api/admin/scoreboard-access/[id]
// Action: "revoke" | "extend" | "reactivate"
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, additionalMs, newExpiresAt, note } = body;

    await connectDB();

    const record = await ScoreboardAccess.findById(id);
    if (!record) {
      return NextResponse.json({ message: "Scoreboard access record not found." }, { status: 404 });
    }

    if (action === "revoke") {
      record.status = "revoked";
      if (note) record.note = note;
      await record.save();
      return NextResponse.json({ message: "Scoreboard access revoked successfully.", record }, { status: 200 });
    }

    if (action === "reactivate" || action === "extend" || action === "update") {
      const now = new Date();
      let expiresAt: Date;

      if (newExpiresAt) {
        expiresAt = new Date(newExpiresAt);
      } else if (additionalMs && typeof additionalMs === "number") {
        const baseTime = record.expiresAt && new Date(record.expiresAt) > now
          ? new Date(record.expiresAt).getTime()
          : now.getTime();
        expiresAt = new Date(baseTime + additionalMs);
      } else {
        // default extend 7 days
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      record.status = "active";
      record.expiresAt = expiresAt;
      if (note !== undefined) record.note = note;
      if (body.durationLabel) record.durationLabel = body.durationLabel;

      const unlockType = body.unlockType;
      const themeSlugs = body.themeSlugs;

      if (unlockType === "all") {
        record.themeSlug = "all-themes";
        await record.save();
      } else if (unlockType === "specific" && Array.isArray(themeSlugs) && themeSlugs.length > 0) {
        // The current record takes the first selected theme slug
        record.themeSlug = themeSlugs[0].trim();
        await record.save();

        // If multiple themes were selected, ensure each has an active access record for this user
        const grantedBy = (session.user as any)?.email || (session.user as any)?.name || "admin";
        for (let i = 1; i < themeSlugs.length; i++) {
          const s = (themeSlugs[i] || "").trim();
          if (!s) continue;
          await ScoreboardAccess.findOneAndUpdate(
            { email: record.email, themeSlug: s },
            {
              email: record.email,
              themeSlug: s,
              trxId: `ADMIN_${s.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`,
              grantedBy,
              durationLabel: body.durationLabel || record.durationLabel || "Extended",
              note: note !== undefined ? note : record.note || "",
              grantedAt: now,
              expiresAt,
              status: "active",
            },
            { upsert: true, new: true }
          );
        }
      } else {
        await record.save();
      }

      return NextResponse.json({ message: "Scoreboard access updated successfully.", record }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/admin/scoreboard-access/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update scoreboard access record.", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/scoreboard-access/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectDB();

    const deleted = await ScoreboardAccess.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Access record not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Access record deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/admin/scoreboard-access/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete access record.", error: error.message },
      { status: 500 }
    );
  }
}
