import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGgrBalance, getWhoami } from "@/lib/nexx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await db.user.findUnique({ where: { id: auth.userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Fetch aggregates
    const [
      ggrBalance,
      whoami,
      totalUsers,
      roundAggregates,
      depositAggregates,
      recentRounds,
      recentUsers,
    ] = await Promise.all([
      getGgrBalance(),
      getWhoami(),
      db.user.count(),
      db.gameRound.aggregate({
        _sum: {
          betAmount: true,
          winAmount: true,
        },
        _count: {
          id: true,
        },
      }),
      db.transaction.aggregate({
        where: { type: "DEPOSIT" },
        _sum: { amount: true },
      }),
      db.gameRound.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, username: true, email: true, balance: true, isAdmin: true, createdAt: true },
      }),
    ]);

    const totalBets = roundAggregates._sum.betAmount || 0;
    const totalWins = roundAggregates._sum.winAmount || 0;
    const ggrProfit = totalBets - totalWins; // GGR = Bets - Wins

    return NextResponse.json({
      ggrBalance: ggrBalance?.wallet ?? 0,
      whoami,
      totalUsers,
      totalRounds: roundAggregates._count.id || 0,
      totalBets,
      totalWins,
      ggrProfit,
      totalDeposits: depositAggregates._sum.amount || 0,
      recentRounds,
      recentUsers,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
