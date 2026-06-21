import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

// PUT /api/admin/users/[id] — edit user details (name, email, password, role)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
    }

    if (password && password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    await connectDB();

    // Check if the new email is taken by a DIFFERENT user
    const normalizedEmail = email.toLowerCase().trim();
    const emailConflict = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });
    if (emailConflict) {
      return NextResponse.json(
        { message: "This email is already in use by another account." },
        { status: 409 }
      );
    }

    // Build update payload
    const updateData: Record<string, any> = {
      name: name.trim(),
      email: normalizedEmail,
      role: role === "admin" ? "admin" : "user",
    };

    // Only hash & update password if a new one was provided
    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User updated successfully.", user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update user.", error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] — toggle restricted status
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
    const { restricted } = await req.json();
    await connectDB();

    const currentUserId = (session.user as any).id;
    if (id === currentUserId) {
      return NextResponse.json({ message: "You cannot restrict your own account." }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { restricted },
      { new: true, select: "-password" }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: `User ${restricted ? "restricted" : "unrestricted"} successfully.`,
        user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update user.", error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — delete a user
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

    const currentUserId = (session.user as any).id;
    if (id === currentUserId) {
      return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete user.", error: error.message }, { status: 500 });
  }
}
