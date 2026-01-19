import { getTokenFromReq, verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const token = getTokenFromReq(req as any);
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const params = await context.params; // unwrap the promise
    const alertId = params.id;

    if (!alertId) {
      return NextResponse.json({ error: "Missing alert ID" }, { status: 400 });
    }

    const { option, targetPrice } = await req.json();

    if (!option || !["eq", "lt", "gt"].includes(option)) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    if (targetPrice === undefined || typeof targetPrice !== "number") {
      return NextResponse.json(
        { error: "Invalid targetPrice" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ai_finance");

    // Step 1: Find the alert in the user's alerts array and update it
    const result = await db.collection("users").updateOne(
      {
        _id: new ObjectId(decoded.userId),
        "alerts._id": new ObjectId(alertId),
      },
      {
        $set: {
          "alerts.$.option": option,
          "alerts.$.targetPrice": targetPrice,
          "alerts.$.updatedAt": new Date(),
        },
      } as any,
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    // Optional: Revalidate pages that show alerts
    revalidatePath("/watchlist", "page");
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
