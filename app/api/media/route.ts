import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Only allow proxying from api.nexxapi.tech or approved domains for security
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.includes("nexxapi.tech") && !parsed.hostname.includes("ibb.co")) {
      return new NextResponse("Forbidden domain", { status: 403 });
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 8000,
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
    console.error("Image proxy error:", error.message);
    return new NextResponse("Failed to load image", { status: 502 });
  }
}
