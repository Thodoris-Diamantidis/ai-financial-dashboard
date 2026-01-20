import { NextResponse } from "next/server";
import { inngest } from "@/lib/ingest/client";

export async function POST(req: Request) {
  const { userId, symbol, questionType } = await req.json();

  await inngest.send({
    name: "ai/favorite-stock-analysis",
    data: {
      userId,
      symbol,
      questionType,
    },
  });

  return NextResponse.json({ success: true });
}
