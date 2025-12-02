// lib/auth.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN ||
  "1d") as SignOptions["expiresIn"];

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

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
