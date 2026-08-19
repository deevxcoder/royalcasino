import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = generateToken({ userId: user.id, username: user.username });

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        currency: user.currency,
        isAdmin: user.isAdmin,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
