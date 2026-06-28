import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ScoreboardTheme } from "@/models/ScoreboardTheme";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ approvedSlugs: [] }, { status: 200 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    // Find all approved payments for this email
    const payments = await Payment.find({
      email: normalizedEmail,
      status: "approved",
    });

    // Fetch all themes to map matching
    const themes = await ScoreboardTheme.find({});

    const approvedSlugs: string[] = [];

    // Check matches
    for (const theme of themes) {
      const isApproved = payments.some((payment) => {
        const item = payment.itemName.toLowerCase().trim();
        const slug = theme.slug.toLowerCase().trim();
        const name = theme.name.toLowerCase().trim();
        return (
          item === slug ||
          item === name ||
          item.includes(slug) ||
          item.includes(name) ||
          item.includes("all scoreboard themes")
        );
      });

      if (isApproved) {
        approvedSlugs.push(theme.slug);
      }
    }

    return NextResponse.json({ approvedSlugs }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to check theme purchases:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
