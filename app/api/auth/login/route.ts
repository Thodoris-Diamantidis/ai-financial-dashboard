import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { serialize } from "cookie";

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
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ai_finance");

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credential" },
        { status: 401 }
      );
    }

    //create JWT token
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

    //create HttpOnly cookie
    const secure = process.env.NODE_ENV === "production";
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 1, //1day
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          subscription: user.subscription,
        },
      },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
