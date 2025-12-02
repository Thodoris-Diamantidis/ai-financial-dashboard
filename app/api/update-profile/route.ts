import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenFromReq, signToken, verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    const token = getTokenFromReq(req as any);
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    //add avatar later
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.length > 30) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ai_finance");

    //add on set avatar later
    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(decoded.userId) },
        { $set: { name } },
        { returnDocument: "after" }
      );
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // RE-SIGN TOKEN WITH UPDATED USER
    const newToken = signToken({
      userId: result._id.toString(),
      email: result.email,
      name: result.name,
      role: result.role,
      avatar: result.avatar,
      subscription: result.subscription,
    });

    //SET NEW COOKIE
    const cookie = serialize("token", newToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, //1day
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json(
      { user: result },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
