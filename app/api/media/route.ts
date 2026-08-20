import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" fill="#0f172a"/>
  <rect x="1" y="1" width="598" height="398" rx="16" fill="url(#grad)" stroke="#1e293b"/>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="600" y2="400" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1e1b4b"/>
      <stop offset="0.5" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#311042"/>
    </linearGradient>
  </defs>
  <circle cx="300" cy="160" r="42" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="2"/>
  <polygon points="290,145 320,160 290,175" fill="#f59e0b"/>
  <text x="300" y="235" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="1">GGR CASINO GAME</text>
  <text x="300" y="260" font-family="monospace" font-size="12" fill="#eab308" text-anchor="middle">LIVE CASINO LOBBY</text>
</svg>`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl || imageUrl === "null" || imageUrl === "undefined") {
      return new NextResponse(FALLBACK_SVG, {
        status: 200,
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    try {
      const parsed = new URL(imageUrl);
      if (
        !parsed.hostname.includes("nexxapi.tech") &&
        !parsed.hostname.includes("ibb.co") &&
        !parsed.hostname.includes("unsplash.com") &&
        !parsed.hostname.includes("cloudinary.com")
      ) {
        return NextResponse.redirect(imageUrl);
      }
    } catch {
      return new NextResponse(FALLBACK_SVG, {
        status: 200,
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 6000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    const contentType = String(response.headers["content-type"] || "image/png");

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.warn("[GGR Media Proxy] Remote fetch failed, serving SVG fallback:", error.message);
    return new NextResponse(FALLBACK_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
