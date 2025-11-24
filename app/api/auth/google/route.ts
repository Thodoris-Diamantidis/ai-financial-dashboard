import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { serialize } from "cookie";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//helper function epeidh me ebgaze oti to jwt secret mporei na einnai null
function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

const JWT_SECRET: Secret = getRequiredEnv("JWT_SECRET");
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN ||
  "1d") as SignOptions["expiresIn"];

export async function POST(req: Request) {
  try {
    //Token from Google frontend
    const { tokenId } = await req.json();

    //Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json(
        { error: "Invalid Google Token" },
        { status: 400 }
      );
    }

    const clientDB = await clientPromise;
    const db = clientDB.db("ai_finance");

    // Find or create user
    let user = await db.collection("users").findOne({ email: payload.email });
    if (!user) {
      const newUser = {
        name: payload.name || "",
        email: payload.email,
        role: "user",
        subscription: "free",
        avatar: payload.picture || "",
        favorites: [],
        createdAt: new Date(),
        googleId: payload.sub,
      };
      const result = await db.collection("users").insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
    const secure = process.env.NODE_ENV === "production";
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json(
      { success: true, user: { email: user.email, name: user.name } },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
