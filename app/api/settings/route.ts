import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await db.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await db.siteSetting.create({
        data: {
          id: "default",
          siteName: "NEXX CASINO",
          siteSubtitle: "Casino Royale",
          logoUrl: null,
          themeColor: "gold",
          callbackUrl: "https://your-domain.com/api/callback",
          returnUrl: "https://your-domain.com/lobby",
          currency: "INR",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Settings error:", error);
    return NextResponse.json({
      settings: {
        siteName: "NEXX CASINO",
        siteSubtitle: "Casino Royale",
        logoUrl: null,
        themeColor: "gold",
        currency: "INR",
      },
    });
  }
}
