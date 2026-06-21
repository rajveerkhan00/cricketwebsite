import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

// GET /api/admin/payments — list all payments
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    await connectDB();
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ payments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch payments.", error: error.message }, { status: 500 });
  }
}
