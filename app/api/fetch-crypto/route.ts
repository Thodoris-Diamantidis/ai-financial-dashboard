import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Coin } from "@/types/crypto";

// GIA TWRA TO EXW MANUAL FETCH 100TOP CRYPTO COINS
export async function GET() {
  const client = await clientPromise;
  const db = client.db("ai_finance");

  const apiKey = process.env.COINGECKO_DEMO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  //fetch top 100 crypto coins
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1",
    {
      headers: {
        "x-cg-demo-api-key": apiKey,
        Accept: "application/json",
      },
    }
  );
  const data = await res.json();

  //filter data to save space
  const filteredData: Coin[] = data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: coin.image,
    current_price: coin.current_price,
    change: coin.price_change_percentage_24h,
    market_cap: coin.market_cap,
    last_updated: coin.last_updated,
  }));

  //delete all from database
  await db.collection("crypto").deleteMany({});
  //insert all 100 coins
  await db.collection("crypto").insertMany(filteredData);

  return NextResponse.json({ success: true, count: filteredData.length });
}
