import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/settings
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: auth.userId } });
    if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let settings = await db.siteSetting.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await db.siteSetting.create({
        data: {
          id: "default",
          siteName: "NEXX CASINO",
          siteSubtitle: "Casino Royale",
          logoUrl: null,
          themeColor: "gold",
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/api/callback`,
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/lobby`,
          currency: "INR",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/settings
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: auth.userId } });
    if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const {
      siteName,
      siteSubtitle,
      logoUrl,
      themeColor,
      callbackUrl,
      returnUrl,
      currency,
    } = await req.json();

    const updated = await db.siteSetting.upsert({
      where: { id: "default" },
      update: {
        siteName: siteName?.trim() || "NEXX CASINO",
        siteSubtitle: siteSubtitle?.trim() || "Casino Royale",
        logoUrl: logoUrl?.trim() || null,
        themeColor: themeColor || "gold",
        callbackUrl: callbackUrl?.trim() || "https://your-domain.com/api/callback",
        returnUrl: returnUrl?.trim() || "https://your-domain.com/lobby",
        currency: currency?.trim() || "INR",
      },
      create: {
        id: "default",
        siteName: siteName?.trim() || "NEXX CASINO",
        siteSubtitle: siteSubtitle?.trim() || "Casino Royale",
        logoUrl: logoUrl?.trim() || null,
        themeColor: themeColor || "gold",
        callbackUrl: callbackUrl?.trim() || "https://your-domain.com/api/callback",
        returnUrl: returnUrl?.trim() || "https://your-domain.com/lobby",
        currency: currency?.trim() || "INR",
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
