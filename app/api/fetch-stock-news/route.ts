import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("ai_finance");

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  //fetch news for the last month
  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2025-12-01&to=2025-12-31&token=${apiKey}`,
  );

  const data = await res.json();

  await db.collection("stock_news").insertMany(data);

  return NextResponse.json({ success: true, count: data.length });
}
