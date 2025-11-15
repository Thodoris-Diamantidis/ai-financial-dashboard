import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb"; //mongo client
import { Coin } from "@/app/types/crypto";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("ai_finance");

  const coins = await db
    .collection<Coin>("crypto")
    .find({})
    .sort({ market_cap: -1 }) //top by market cap
    .toArray();

  return NextResponse.json(coins);
}
