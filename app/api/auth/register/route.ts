import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ai_finance");

    //Elengxo ama uparxei hdh o xrhsths
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = {
      email,
      password: hashed,
      name: name || "",
      favorites: [],
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(user);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
