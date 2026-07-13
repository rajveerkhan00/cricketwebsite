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

// POST /api/admin/pricing-tiers - create a new plan
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { name, price, period, description, features, buttonText, featured, order, planType } = await req.json();

    if (!name || !price || !period || !description || !buttonText) {
      return NextResponse.json(
        { message: "Name, price, period, description, and button text are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const newTier = await PricingTier.create({
      name: name.trim(),
      price: price.trim(),
      period: period.trim(),
      description: description.trim(),
      features: Array.isArray(features) ? features : [],
      buttonText: buttonText.trim(),
      featured: !!featured,
      order: Number(order) || 0,
      planType: planType || null,
    });

    return NextResponse.json(
      { message: "Pricing tier created successfully.", tier: newTier },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/pricing-tiers error:", error);
    return NextResponse.json(
      { message: "Failed to create pricing tier.", error: error.message },
      { status: 500 }
    );
  }
}
