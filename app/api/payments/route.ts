import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import {
  sendPaymentReceivedConfirmationEmail,
  sendAdminPaymentNotificationEmail,
} from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, senderNumber, trxId, itemName, itemPrice } = await req.json();

    if (!email || !senderNumber || !trxId || !itemName || !itemPrice) {
      return NextResponse.json(
        { message: "All fields are required. Please provide email, senderNumber, trxId, itemName, and itemPrice." },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // Create the payment record
    const newPayment = await Payment.create({
      email: normalizedEmail,
      senderNumber: senderNumber.trim(),
      trxId: trxId.trim(),
      itemName: itemName.trim(),
      itemPrice: String(itemPrice).trim(),
      status: "pending",
    });

    // Send emails
    try {
      // 1. Send confirmation email to the user
      await sendPaymentReceivedConfirmationEmail(normalizedEmail, {
        itemName,
        itemPrice,
        senderNumber,
        trxId,
      });

      // 2. Send notification email to the admin
      const adminEmail = process.env.SMTP_USER || "cricovelay@gmail.com";
      await sendAdminPaymentNotificationEmail(adminEmail, {
        userEmail: normalizedEmail,
        itemName,
        itemPrice,
        senderNumber,
        trxId,
      });
    } catch (mailError: any) {
      // We log the error but don't fail the request, as the DB transaction succeeded.
      console.error("Email sending failed for payment:", mailError);
    }

    return NextResponse.json(
      {
        message: "Payment details submitted successfully. Admin will confirm and email credentials within 1 hour.",
        payment: newPayment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Payment Submission Error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again later.", error: error.message },
      { status: 500 }
    );
  }
}
