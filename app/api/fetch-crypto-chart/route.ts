import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const apiKey = process.env.COINGECKO_DEMO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("ai_finance");

    const coins = await db
      .collection("crypto")
      .find({})
      .sort({ market_cap: -1 })
      .limit(100)
      .toArray();

    for (const coin of coins) {
      const coinId = coin.id;

      try {
        const chart = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`,
          {
            headers: {
              "x-cg-demo-api-key": apiKey,
              Accept: "application/json",
            },
          }
        ).then((res) => res.json());

        if (!chart.prices) {
          console.warn(`⚠ No chart data for ${coinId}`);
          continue;
        }

        //remove total_volumes (isws kai market_cap na mhn 8elw)
        const filteredChart = {
          prices: chart.prices,
          market_caps: chart.market_caps,
          updatedAt: new Date(),
        };

        await db.collection("coin_charts").updateOne(
          { coinId },
          {
            $set: {
              coinId,
              ...filteredChart,
            },
          },
          { upsert: true }
        );

        // Avoid rate limiting
        await new Promise((r) => setTimeout(r, 2100));
      } catch (err) {
        console.error("Error fetching chart for", coinId, err);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
