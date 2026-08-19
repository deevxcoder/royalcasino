import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { gameUid, currencyCode = "INR", language = "en" } = await req.json();

    if (!gameUid) {
      return NextResponse.json({ error: "gameUid is required" }, { status: 400 });
    }

    // Determine current user
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json(
        { error: "Please sign in to launch games. Create an account or sign in." },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Player account not found. Please sign in again." },
        { status: 401 }
      );
    }

    if (user.balance < 1.0) {
      return NextResponse.json(
        { error: "Insufficient balance to launch game. Please deposit funds." },
        { status: 400 }
      );
    }

    const royalggrUrl = process.env.ROYAL_GGR_URL || "http://localhost:3001";
    const royalggrToken = process.env.ROYAL_GGR_TOKEN || "roy_live_demo1234567890abcdef";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Call royalggr provider launch endpoint
    try {
      const ggrRes = await axios.post(
        `${royalggrUrl}/api/v1/launch`,
        {
          user_id: user.id,
          game_uid: String(gameUid),
          balance: user.balance,
          currency: user.currency || currencyCode,
          callback_url: `${appUrl}/api/callback`,
          return_url: `${appUrl}`,
        },
        {
          headers: {
            Authorization: `Bearer ${royalggrToken}`,
            "Content-Type": "application/json",
          },
          timeout: 8000,
        }
      );

      if (ggrRes.data?.status === 1 && ggrRes.data?.data?.launch_url) {
        return NextResponse.json({
          success: true,
          url: ggrRes.data.data.launch_url,
          user: {
            id: user.id,
            username: user.username,
            balance: user.balance,
          },
        });
      }
    } catch (ggrErr: any) {
      console.warn("RoyalGGR Gateway error:", ggrErr.message);
    }

    // Direct Studio fallback URL if royalggr is bootstrapping
    const studioUrl = process.env.ROYAL_STUDIO_URL || "http://localhost:3002";
    const fallbackUrl = `${studioUrl}/play/sess_${user.id}_${Date.now()}?token=jwt_sess&game=${gameUid}&returnUrl=${encodeURIComponent(
      appUrl
    )}`;

    return NextResponse.json({
      success: true,
      url: fallbackUrl,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
    });
  } catch (error: any) {
    console.error("Game launch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to launch game" },
      { status: 500 }
    );
  }
}
