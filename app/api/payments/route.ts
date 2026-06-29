import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ScoreboardAccess } from "@/models/ScoreboardAccess";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";
import {
  sendPaymentReceivedConfirmationEmail,
  sendAdminPaymentNotificationEmail,
} from "@/lib/mail";

// Helper: find the matching theme slug from itemName
async function resolveThemeSlug(itemName: string): Promise<string | null> {
  try {
    const themes = await ScoreboardTheme.find({});
    const lowerItem = itemName.toLowerCase().trim();
    for (const theme of themes) {
      const slug = theme.slug.toLowerCase().trim();
      const name = theme.name.toLowerCase().trim();
      if (
        lowerItem === slug ||
        lowerItem === name ||
        lowerItem.includes(slug) ||
        lowerItem.includes(name) ||
        slug.includes(lowerItem) ||
        name.includes(lowerItem)
      ) {
        return theme.slug;
      }
    }
    // If itemName contains "match" it's a match-specific purchase — use the themeSlug from the item
    if (lowerItem.includes("scoreboard access")) {
      return "match-access"; // special slug for match-specific purchases
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { email, senderNumber, trxId, itemName, itemPrice, themeSlug: providedSlug } = await req.json();

    if (!email || !senderNumber || !trxId || !itemName || !itemPrice) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // All payments submitted via form are auto-approved immediately
    const paymentStatus = "approved";

    // Create the payment record
    const newPayment = await Payment.create({
      email: normalizedEmail,
      senderNumber: senderNumber.trim(),
      trxId: trxId.trim(),
      itemName: itemName.trim(),
      itemPrice: String(itemPrice).trim(),
      status: paymentStatus,
    });

    // Resolve theme slug — use provided one or detect from itemName
    const themeSlug = providedSlug || await resolveThemeSlug(itemName);

    // Immediately create ScoreboardAccess so the overlay unlocks right away
    if (themeSlug) {
      const grantedAt = new Date();
      const expiresAt = new Date(grantedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      // One access per email+theme — upsert to avoid duplicates
      await ScoreboardAccess.findOneAndUpdate(
        { email: normalizedEmail, themeSlug },
        {
          email: normalizedEmail,
          themeSlug,
          paymentId: newPayment._id,
          trxId: trxId.trim(),
          grantedAt,
          expiresAt,
          status: "active",
        },
        { upsert: true, new: true }
      );
    }

    // Send emails (non-blocking)
    try {
      await sendPaymentReceivedConfirmationEmail(normalizedEmail, {
        itemName,
        itemPrice,
        senderNumber,
        trxId,
      });
      const adminEmail = process.env.SMTP_USER || "cricovelay@gmail.com";
      await sendAdminPaymentNotificationEmail(adminEmail, {
        userEmail: normalizedEmail,
        itemName,
        itemPrice,
        senderNumber,
        trxId,
      });
    } catch (mailError: any) {
      console.error("Email sending failed:", mailError);
    }

    return NextResponse.json(
      {
        message: "Payment verified! Your scoreboard is now unlocked for 24 hours.",
        payment: newPayment,
        themeSlug,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Payment Submission Error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again.", error: error.message },
      { status: 500 }
    );
  }
}
