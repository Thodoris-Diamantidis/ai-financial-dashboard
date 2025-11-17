// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getTokenFromReq, verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const token = getTokenFromReq(req as any); // Read cookie
  const decoded = verifyToken(token); // Verify JWT

  if (!decoded) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      userId: decoded.userId,
      email: decoded.email,
    },
  });
}
