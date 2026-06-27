import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

// One-time seeder: creates the first admin account if none exists.
// Call GET /api/admin/seed once after deployment, then it becomes a no-op.
export async function GET() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin already exists. Seeder is a no-op." },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash("Admin@123456", 12);

    const admin = await User.create({
      name: "Super Admin",
      email: "admin@CricOverlay.com",
      password: hashedPassword,
      role: "admin",
      restricted: false,
    });

    return NextResponse.json(
      {
        message: "✅ Admin created successfully!",
        credentials: {
          email: "admin@CricOverlay.com",
          password: "Admin@123456",
          note: "Change this password immediately after first login.",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin seed error:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
