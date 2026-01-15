// lib/auth.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { parse } from "cookie";
import { cookies } from "next/headers";
import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

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

//Fetch the currently logged-in user in server actions
export async function getCurrentUserFromServer() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;

  const client = await clientPromise;
  const db = client.db("ai_finance");

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(decoded.userId) });

  return user;
}
