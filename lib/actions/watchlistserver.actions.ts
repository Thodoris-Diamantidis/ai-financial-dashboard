"use server";

import clientPromise from "../mongodb";

export async function getWatchlistSymbolByEmail(
  email: string
): Promise<string[]> {
  if (!email) return [];

  try {
    const client = await clientPromise;
    const db = client.db("ai_finance");
    if (!db) throw new Error("MongoDB connection not found");

    const user = await db.collection("user").findOne({ email });

    if (!user) return [];

    const userId = user.id as string;
    if (!userId) return [];

    const items = user.favorites;

    return items.map((i: any) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error", err);
    return [];
  }
}
