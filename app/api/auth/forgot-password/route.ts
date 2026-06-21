import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendResetPasswordEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, isAdmin } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // For security reasons, return generic response so we don't leak user emails.
    const genericSuccessResponse = NextResponse.json(
      { message: "If an account with that email exists, we have sent a password reset link." },
      { status: 200 }
    );

    if (!user) {
      return genericSuccessResponse;
    }

    // Role verification based on the portal origin
    if (isAdmin && user.role !== "admin") {
      return genericSuccessResponse;
    }

    // Generate secure random reset token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Set token expiration to 1 hour from now
    const expires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send reset email
    await sendResetPasswordEmail(user.email, token, !!isAdmin);

    return genericSuccessResponse;
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
