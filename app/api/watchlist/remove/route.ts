import { getTokenFromReq, verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const token = getTokenFromReq(req as any);
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ai_finance");

    // Remove symbol from favorites
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $pull: { favorites: symbol.toUpperCase() } }
      );

    // KEY: Revalidate all pages that might show watchlist data
    revalidatePath("/stocks/[symbol]", "page");
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
