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

// PATCH /api/admin/payments/[id] — update payment status (status: "approved" | "rejected" | "pending")
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { status } = await req.json();

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid payment status." }, { status: 400 });
    }

    await connectDB();

    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ message: "Payment record not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Payment status updated successfully.", payment },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update payment status.", error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/payments/[id] — delete a payment record
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    await connectDB();

    const deleted = await Payment.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Payment record not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Payment record deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete payment record.", error: error.message }, { status: 500 });
  }
}
