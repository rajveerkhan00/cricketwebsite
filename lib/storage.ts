import { connectDB } from "./mongodb";
import { Tournament } from "@/models/Tournament";
import { Match } from "@/models/Match";

/**
 * Calculates the total storage footprint (in KB) used by a specific user's documents.
 * We measure the size of all their tournaments and matches.
 * 
 * @param userId - The ID of the user.
 * @returns The total size in Kilobytes (KB).
 */
export async function getUserStorageUsage(userId: string): Promise<number> {
  await connectDB();

  // Fetch all tournaments and matches owned by this user
  const tournaments = await Tournament.find({ userId }).lean();
  const matches = await Match.find({ userId }).lean();

  let totalBytes = 0;

  // Calculate the byte size of each tournament document in UTF-8
  for (const t of tournaments) {
    totalBytes += Buffer.byteLength(JSON.stringify(t), "utf8");
  }

  // Calculate the byte size of each match document (which holds scoringState, history, etc.)
  for (const m of matches) {
    totalBytes += Buffer.byteLength(JSON.stringify(m), "utf8");
  }

  // Convert to KB (1 KB = 1024 bytes)
  const totalKB = totalBytes / 1024;
  return totalKB;
}
