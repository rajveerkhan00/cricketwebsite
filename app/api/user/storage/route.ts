import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserStorageUsage } from "@/lib/storage";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const usedKB = await getUserStorageUsage(userId);
    const limitKB = 10000;

    return NextResponse.json(
      {
        usedKB,
        limitKB,
        exceeded: usedKB >= limitKB,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/user/storage error:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage usage." },
      { status: 500 }
    );
  }
}
