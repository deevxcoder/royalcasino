import { NextResponse } from "next/server";
import { fetchGames } from "@/lib/nexx";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandIdParam = searchParams.get("brand_id");
    const category = searchParams.get("category")?.toLowerCase() || "all";
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const brandId = brandIdParam ? parseInt(brandIdParam, 10) : null;

    // Fetch site settings to check enabled providers if configured
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

    if (brandId && enabledProviders && !enabledProviders.includes(brandId)) {
      return NextResponse.json({ games: [], total: 0, brand_id: brandId });
    }

    const result = await fetchGames(brandId, query, limit, offset, category, enabledProviders);

    let filteredGames = result.games;

    // Filter games by enabled providers configured by admin
    if (enabledProviders && enabledProviders.length > 0) {
      filteredGames = filteredGames.filter((g) => {
        if (!g.brand_id) return true;
        return enabledProviders!.includes(g.brand_id);
      });
    }

    return NextResponse.json({
      games: filteredGames,
      total: filteredGames.length,
    });
  } catch (error: any) {
    console.error("Games catalog error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
