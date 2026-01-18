import { getTokenFromReq, verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const token = getTokenFromReq(req as any);
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { symbol, company } = await req.json();
    if (!symbol)
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("ai_finance");

    //Add to favorites if not already present
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $addToSet: { favorites: symbol.toUpperCase() } },
      );

    // KEY: Revalidate all pages that might show watchlist data
    revalidatePath("/stocks/[symbol]", "page");
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
