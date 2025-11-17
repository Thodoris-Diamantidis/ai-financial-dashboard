// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;

export function getTokenFromReq(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const parsed = parse(cookie || "");
  return parsed.token;
}

export function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded; // { userId, email, iat, exp }
  } catch (err) {
    return null;
  }
}
