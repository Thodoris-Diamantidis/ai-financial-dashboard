import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  last_updated: string;
}
// GIA TWRA TO EXW MANUAL FETCH
export async function GET() {
  const client = await clientPromise;
  const db = client.db("ai_finance");

  //fetch top 100 crypto coins
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
  );
  const data = await res.json();

  //filter data to save space
  const filteredData: Coin[] = data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    current_price: coin.current_price,
    market_cap: coin.market_cap,
    last_updated: coin.last_updated,
  }));

  //delete all from database
  await db.collection("crypto").deleteMany({});
  //insert all 100 coins
  await db.collection("crypto").insertMany(filteredData);

  return NextResponse.json({ success: true, count: filteredData.length });
}
