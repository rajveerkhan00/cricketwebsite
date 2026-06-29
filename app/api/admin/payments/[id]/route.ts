import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

async function resolveThemeSlug(itemName: string): Promise<string | null> {
  try {
    const themes = await ScoreboardTheme.find({});
    const lowerItem = itemName.toLowerCase().trim();
    for (const theme of themes) {
      const slug = theme.slug.toLowerCase().trim();
      const name = theme.name.toLowerCase().trim();
      if (
        lowerItem === slug || lowerItem === name ||
        lowerItem.includes(slug) || lowerItem.includes(name) ||
        slug.includes(lowerItem) || name.includes(lowerItem)
      ) return theme.slug;
    }
    return null;
  } catch { return null; }
}

// PATCH /api/admin/payments/[id]
// "approved" → create/restore ScoreboardAccess (24h)
// "rejected"  → revoke ScoreboardAccess immediately
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    await connectDB();

    const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    if (!payment) {
      return NextResponse.json({ message: "Payment not found." }, { status: 404 });
    }

    const themeSlug = await resolveThemeSlug(payment.itemName);
    const email = payment.email?.toLowerCase().trim();

    if (status === "approved" && themeSlug && email) {
      const grantedAt = new Date();
      const expiresAt = new Date(grantedAt.getTime() + 24 * 60 * 60 * 1000);
      await ScoreboardAccess.findOneAndUpdate(
        { email, themeSlug },
        { email, themeSlug, paymentId: payment._id, trxId: payment.trxId, grantedAt, expiresAt, status: "active" },
        { upsert: true, new: true }
      );
    } else if (status === "rejected" || status === "pending") {
      // Revoke immediately — overlay will lock within seconds
      await ScoreboardAccess.updateMany(
        { paymentId: payment._id },
        { status: "revoked" }
      );
      // Also revoke by email+theme if we can resolve it
      if (themeSlug && email) {
        await ScoreboardAccess.updateMany(
          { email, themeSlug, status: "active" },
          { status: "revoked" }
        );
      }
    }

    return NextResponse.json({ message: "Payment updated.", payment }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update payment.", error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/payments/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    await connectDB();
    const deleted = await Payment.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: "Payment not found." }, { status: 404 });
    await ScoreboardAccess.updateMany({ paymentId: id }, { status: "revoked" });
    return NextResponse.json({ message: "Payment deleted." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete.", error: error.message }, { status: 500 });
  }
}
