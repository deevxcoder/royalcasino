import axios from "axios";
import { Provider, Game, LaunchGameParams } from "./types";

const ROYAL_GGR_URL = process.env.ROYAL_GGR_URL || process.env.NEXX_API_URL || "http://localhost:3001";
const ROYAL_GGR_TOKEN = process.env.ROYAL_GGR_TOKEN || process.env.NEXX_TOKEN || "roy_live_demo1234567890abcdef";

let cachedProviders: Provider[] | null = null;
let lastProvidersFetch = 0;
const CACHE_TTL = 60 * 1000; // 1 min

export function proxyImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/api/media")) return url;
  if (url.includes("nexxapi.tech")) {
    return `/api/media?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function fetchProviders(): Promise<Provider[]> {
  if (cachedProviders && Date.now() - lastProvidersFetch < CACHE_TTL) {
    return cachedProviders;
  }

  const baseUrl = ROYAL_GGR_URL.endsWith("/api/v1")
    ? ROYAL_GGR_URL
    : `${ROYAL_GGR_URL}/api/v1`;

  try {
    const res = await axios.get(`${baseUrl}/providers`, {
      headers: { Authorization: `Bearer ${ROYAL_GGR_TOKEN}` },
      params: { token: ROYAL_GGR_TOKEN },
      timeout: 8000,
    });

    if (res.data?.data?.providers) {
      cachedProviders = res.data.data.providers.map((p: any) => ({
        brand_id: p.brand_id,
        name: p.name,
        logo: proxyImageUrl(p.logo || null),
        game_count: p.game_count || 0,
      }));
      lastProvidersFetch = Date.now();
      return cachedProviders!;
    }
  } catch (error: any) {
    console.error("Error fetching providers from RoyalGGR B2B Gateway:", error.message);
  }

  return cachedProviders || [];
}

export async function fetchGames(
  brandId?: number | null,
  query = "",
  limit = 100,
  offset = 0,
  category = "",
  enabledProviders?: number[] | null
): Promise<{ games: Game[]; total: number }> {
  const baseUrl = ROYAL_GGR_URL.endsWith("/api/v1")
    ? ROYAL_GGR_URL
    : `${ROYAL_GGR_URL}/api/v1`;

  try {
    const params: any = {
      token: ROYAL_GGR_TOKEN,
      brand_id: brandId || undefined,
      q: query || undefined,
      category: category && category !== "all" ? category : undefined,
      limit,
      offset,
    };

    if (!brandId && enabledProviders && enabledProviders.length > 0) {
      params.enabled_providers = enabledProviders.join(",");
    }

    const res = await axios.get(`${baseUrl}/games`, {
      headers: { Authorization: `Bearer ${ROYAL_GGR_TOKEN}` },
      params,
      timeout: 8000,
    });

    if (res.data?.data?.games) {
      const mappedGames: Game[] = res.data.data.games.map((g: any) => ({
        game_id: g.game_id,
        game_uid: g.game_uid,
        name: g.game_name || g.name,
        provider: g.provider || g.brand_name,
        brand_id: Number(g.brand_id || g.brandId || g.provider?.brandId || (g.provider === "Royal Games" ? 1 : 0)),
        category: g.category,
        logo: proxyImageUrl(g.thumbnail || g.banner || g.logo),
        rtp: g.rtp,
        max_multiplier: g.max_multiplier,
      }));

      return {
        games: mappedGames,
        total: res.data.data.total || mappedGames.length,
      };
    }
  } catch (error: any) {
    console.error("Error fetching games from RoyalGGR B2B Gateway:", error.message);
  }

  return { games: [], total: 0 };
}

export async function getGgrBalance(): Promise<{ wallet: number } | null> {
  const baseUrl = ROYAL_GGR_URL.endsWith("/api/v1")
    ? ROYAL_GGR_URL
    : `${ROYAL_GGR_URL}/api/v1`;

  try {
    const res = await axios.get(`${baseUrl}/ggr-balance`, {
      headers: { Authorization: `Bearer ${ROYAL_GGR_TOKEN}` },
      params: { token: ROYAL_GGR_TOKEN },
      timeout: 8000,
    });

    if (res.data?.data) {
      return { wallet: res.data.data.balance };
    }
  } catch (error: any) {
    console.error("Error fetching GGR balance:", error.message);
  }
  return null;
}

export async function getWhoami(): Promise<any> {
  const baseUrl = ROYAL_GGR_URL.endsWith("/api/v1")
    ? ROYAL_GGR_URL
    : `${ROYAL_GGR_URL}/api/v1`;

  try {
    const res = await axios.get(`${baseUrl}/whoami`, {
      headers: { Authorization: `Bearer ${ROYAL_GGR_TOKEN}` },
      params: { token: ROYAL_GGR_TOKEN },
      timeout: 8000,
    });
    return res.data || null;
  } catch (error: any) {
    console.error("Error calling whoami:", error.message);
    return null;
  }
}

export async function launchGameSession(params: LaunchGameParams): Promise<{ url: string; code: number; msg?: string }> {
  const baseUrl = ROYAL_GGR_URL.endsWith("/api/v1")
    ? ROYAL_GGR_URL
    : `${ROYAL_GGR_URL}/api/v1`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await axios.post(
    `${baseUrl}/launch`,
    {
      user_id: params.userId,
      game_uid: String(params.gameUid),
      balance: Number(params.balance.toFixed(2)),
      currency: params.currencyCode || "INR",
      callback_url: params.callbackUrl || `${appUrl}/api/callback`,
      return_url: params.returnUrl || `${appUrl}`,
    },
    {
      headers: {
        Authorization: `Bearer ${ROYAL_GGR_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  if (res.data?.status === 1 && res.data?.data?.launch_url) {
    return { url: res.data.data.launch_url, code: 0, msg: "Success" };
  }

  throw new Error(res.data?.error || "Failed to launch game via RoyalGGR gateway");
}
