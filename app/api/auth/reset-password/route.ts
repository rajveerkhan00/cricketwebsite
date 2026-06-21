import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token) {
      console.error("[RESET-PASSWORD] Missing token in request body");
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      console.error("[RESET-PASSWORD] Password too short or missing");
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    await connectDB();

    // Find user by valid token and unexpired date
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      console.error("[RESET-PASSWORD] No user found for token:", token?.substring(0, 10) + "...");
      return NextResponse.json({ error: "Invalid or expired password reset token." }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({ message: "Your password has been successfully reset." }, { status: 200 });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
