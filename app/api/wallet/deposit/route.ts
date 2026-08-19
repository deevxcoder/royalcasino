import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { amount, userId: requestedUserId } = await req.json();

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    let targetUserId = requestedUserId;

    if (!targetUserId) {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const payload = token ? verifyToken(token) : null;
      if (payload) {
        targetUserId = payload.userId;
      } else {
        const demo = await db.user.findFirst({ where: { username: "demo_player" } });
        targetUserId = demo?.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: {
        balance: { increment: depositAmount },
        transactions: {
          create: {
            type: "DEPOSIT",
            amount: depositAmount,
            balanceAfter: 0, // updated in transaction or trigger
            description: `Manual Topup ₹${depositAmount}`,
          },
        },
      },
      select: { id: true, username: true, balance: true, currency: true },
    });

    return NextResponse.json({ success: true, balance: updatedUser.balance, user: updatedUser });
  } catch (error: any) {
    console.error("Deposit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
