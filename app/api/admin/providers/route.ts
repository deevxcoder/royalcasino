import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchProviders } from "@/lib/nexx";

export const dynamic = "force-dynamic";

// GET /api/admin/providers - Returns ALL providers from RoyalGGR B2B Gateway + current enabled list
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: auth.userId } });
    if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Fetch providers directly from RoyalGGR B2B Gateway
    const allProviders = await fetchProviders();

    // Get current enabled list from settings
    const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
    let enabledProviders: number[] = [];
    if (settings?.enabledProviders) {
      try {
        enabledProviders = JSON.parse(settings.enabledProviders);
      } catch {
        enabledProviders = [];
      }
    }

    return NextResponse.json({
      providers: allProviders,
      enabledProviders, // empty array means all are enabled (or none configured)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/providers - Update enabled providers list
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: auth.userId } });
    if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { enabledProviders } = await req.json();

    if (!Array.isArray(enabledProviders)) {
      return NextResponse.json({ error: "enabledProviders must be an array of brand_ids" }, { status: 400 });
    }

    const serialized = enabledProviders.length > 0 ? JSON.stringify(enabledProviders) : null;

    await db.siteSetting.upsert({
      where: { id: "default" },
      update: { enabledProviders: serialized },
      create: {
        id: "default",
        enabledProviders: serialized,
      },
    });

    return NextResponse.json({
      success: true,
      enabledProviders: enabledProviders.length > 0 ? enabledProviders : [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
