import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { PricingTier } from "@/models/PricingTier";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

// PUT /api/admin/pricing-tiers/[id] - update pricing tier
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, price, period, description, features, buttonText, featured, order } = body;

    if (!name || !price || !period || !description || !buttonText) {
      return NextResponse.json(
        { message: "Name, price, period, description, and button text are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedTier = await PricingTier.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        price: price.trim(),
        period: period.trim(),
        description: description.trim(),
        features: Array.isArray(features) ? features : [],
        buttonText: buttonText.trim(),
        featured: !!featured,
        order: Number(order) || 0,
      },
      { new: true }
    );

    if (!updatedTier) {
      return NextResponse.json({ message: "Pricing tier not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Pricing tier updated successfully.", tier: updatedTier },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/pricing-tiers/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update pricing tier.", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pricing-tiers/[id] - delete pricing tier
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { id } = await params;

    await connectDB();

    const deletedTier = await PricingTier.findByIdAndDelete(id);

    if (!deletedTier) {
      return NextResponse.json({ message: "Pricing tier not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Pricing tier deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/pricing-tiers/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete pricing tier.", error: error.message },
      { status: 500 }
    );
  }
}
