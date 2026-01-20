import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // your Mongo client

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const symbol = searchParams.get("symbol");
  const questionType = searchParams.get("questionType");

  if (!userId || !symbol || !questionType) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("ai_finance");

  const latestResult = await db
    .collection("ai_runs")
    .find({ userId, symbol, questionType })
    .sort({ createdAt: -1 }) // latest first
    .limit(1)
    .toArray();

  return NextResponse.json({
    answer: latestResult[0]?.result ?? null,
  });
}
