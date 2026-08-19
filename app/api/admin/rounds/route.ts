import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { serialNumber: { contains: search } },
            { gameName: { contains: search } },
            { gameRound: { contains: search } },
            { user: { username: { contains: search } } },
          ],
        }
      : undefined;

    const [rounds, total] = await Promise.all([
      db.gameRound.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
      db.gameRound.count({ where }),
    ]);

    return NextResponse.json({ rounds, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
