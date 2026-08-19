import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payload = token ? verifyToken(token) : null;

    let user;
    if (payload) {
      user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, balance: true, currency: true },
      });
    } else {
      user = await db.user.findFirst({
        where: { username: "demo_player" },
        select: { id: true, username: true, balance: true, currency: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.balance,
      currency: user.currency,
      userId: user.id,
      username: user.username,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
