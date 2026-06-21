import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { sendAdminCustomEmail } from "@/lib/mail";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

// POST /api/admin/payments/[id]/send-email — Admin sends custom email to payment email
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { subject, body } = await req.json();

    if (!subject || !body) {
      return NextResponse.json({ message: "Subject and Body are required." }, { status: 400 });
    }

    await connectDB();

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ message: "Payment record not found." }, { status: 404 });
    }

    // Send the custom email
    const mailResult = await sendAdminCustomEmail(payment.email, subject, body);

    return NextResponse.json(
      {
        message: `Email sent successfully to ${payment.email}.`,
        simulated: mailResult.simulated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to send admin custom email:", error);
    return NextResponse.json(
      { message: "Failed to send email.", error: error.message },
      { status: 500 }
    );
  }
}
