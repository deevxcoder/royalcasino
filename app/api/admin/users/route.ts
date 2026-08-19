import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/users - List & Search Players
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: auth.userId } });
    if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const users = await db.user.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        currency: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { rounds: true, transactions: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/users - Adjust player balance (Credit / Debit)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: auth.userId } });
    if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // 1. Create New Player Account (Admin Only)
    if (action === "create") {
      const { username, password, initialBalance = 0, email, isAdmin = false } = body;

      if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
      }

      const existing = await db.user.findFirst({
        where: {
          OR: [
            { username: username.trim().toLowerCase() },
            ...(email ? [{ email: email.trim().toLowerCase() }] : []),
          ],
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
      }

      const { hashPassword } = await import("@/lib/auth");
      const initBal = Math.max(0, Number(initialBalance) || 0);

      const newUser = await db.user.create({
        data: {
          username: username.trim().toLowerCase(),
          email: email?.trim().toLowerCase() || null,
          passwordHash: hashPassword(password),
          balance: initBal,
          currency: "INR",
          isAdmin: Boolean(isAdmin),
          transactions: initBal > 0
            ? {
                create: {
                  type: "DEPOSIT",
                  amount: initBal,
                  balanceAfter: initBal,
                  description: "Initial balance credited by Admin",
                },
              }
            : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          balance: newUser.balance,
          currency: newUser.currency,
          isAdmin: newUser.isAdmin,
        },
      });
    }

    // 2. Adjust Existing Player Balance (Credit / Debit)
    const { userId, amount, note } = body;

    const changeAmount = Number(amount);
    if (!userId || !action || isNaN(changeAmount) || changeAmount <= 0) {
      return NextResponse.json({ error: "Invalid adjustment parameters" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    const newBalance =
      action === "credit"
        ? targetUser.balance + changeAmount
        : Math.max(0, targetUser.balance - changeAmount);

    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { balance: newBalance },
        select: { id: true, username: true, balance: true },
      }),
      db.transaction.create({
        data: {
          userId,
          type: action === "credit" ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
          amount: changeAmount,
          balanceAfter: newBalance,
          description: note || `Admin ${action.toUpperCase()} by ${admin.username}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
