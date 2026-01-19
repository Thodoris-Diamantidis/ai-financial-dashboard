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

    const {
      symbol,
      company,
      priceFormatted,
      changeFormatted,
      logo,
      option,
      targetPrice,
    } = await req.json();

    if (!symbol || !option || targetPrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ai_finance");

    // Step 1: Remove any existing alert for this symbol
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, {
        $pull: { alerts: { symbol: symbol.toUpperCase() } },
      } as any);

    // Step 2: Add new/updated alert
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, {
        $push: {
          alerts: {
            _id: new ObjectId(),
            symbol: symbol.toUpperCase(),
            company,
            priceFormatted,
            changeFormatted,
            logo,
            option,
            targetPrice,
            createdAt: new Date(),
          },
        },
      } as any);

    // Optional: revalidate pages that show alerts
    revalidatePath("/watchlist", "page");
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
