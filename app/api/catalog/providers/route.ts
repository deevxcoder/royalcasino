import { NextResponse } from "next/server";
import { fetchProviders } from "@/lib/nexx";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawProviders = await fetchProviders();

    const settings = await db.siteSetting.findUnique({
      where: { id: "default" },
    });

    let enabledProviders: number[] | null = null;
    if (settings?.enabledProviders) {
      try {
        const parsed = JSON.parse(settings.enabledProviders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          enabledProviders = parsed;
        }
      } catch (e) {
        console.error("Failed to parse enabledProviders:", e);
      }
    }

    const filteredProviders = enabledProviders
      ? rawProviders.filter((p) => enabledProviders!.includes(p.brand_id))
      : rawProviders;

    return NextResponse.json({ providers: filteredProviders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
