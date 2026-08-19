import { NextResponse } from "next/server";
import { getGgrBalance, getWhoami } from "@/lib/nexx";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [ggrBalance, whoami, rounds, totalUsers, latestTransactions] = await Promise.all([
      getGgrBalance(),
      getWhoami(),
      db.gameRound.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
      db.user.count(),
      db.transaction.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
    ]);

    return NextResponse.json({
      ggrBalance: ggrBalance?.wallet ?? "N/A",
      whoami,
      totalUsers,
      recentRounds: rounds,
      recentTransactions: latestTransactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
