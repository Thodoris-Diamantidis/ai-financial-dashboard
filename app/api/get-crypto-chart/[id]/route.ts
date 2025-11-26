import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params; // unwrap the Promise
  const coinId = resolvedParams.id;

  if (!coinId) {
    return NextResponse.json({ error: "Missing coin ID" }, { status: 400 });
  }
  try {
    if (!coinId) {
      return NextResponse.json(
        {
          error: "Missing coin ID",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ai_finance");

    const chart = await db.collection("coin_charts").findOne({ coinId });

    if (!chart) {
      return NextResponse.json(
        { error: "No chart data found for this coin" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      coinId: chart.coinId,
      prices: chart.prices,
      market_caps: chart.market_caps,
    });
  } catch (err) {
    console.error("Error fetching chart:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
