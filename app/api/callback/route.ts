import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptPayload } from "@/lib/crypto";
import { SettlementCallbackPayload } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    let payload: SettlementCallbackPayload;

    // Check if payload is encrypted
    if (rawBody.payload && typeof rawBody.payload === "string") {
      payload = decryptPayload<SettlementCallbackPayload>(rawBody.payload);
    } else {
      payload = rawBody;
    }

    const {
      serial_number,
      member_account,
      credit_amount,
      bet_amount = 0,
      win_amount = 0,
      game_id,
      game_uid,
      game_round,
      game_name,
    } = payload;

    if (!serial_number || !member_account || credit_amount === undefined) {
      console.warn("Callback missing essential fields:", payload);
      return NextResponse.json({ error: "Missing required callback parameters" }, { status: 400 });
    }

    // 1. Idempotency check: check if this round serial_number was already processed
    const existingRound = await db.gameRound.findUnique({
      where: { serialNumber: serial_number },
    });

    if (existingRound) {
      console.log(`[Idempotency] Round ${serial_number} already processed. Skipping.`);
      return NextResponse.json({ status: "already_processed", serial_number });
    }

    // 2. Find the user
    const user = await db.user.findUnique({
      where: { id: member_account },
    });

    if (!user) {
      console.error(`User ${member_account} not found during callback processing.`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Atomically update user's authoritative balance and record game round
    await db.$transaction([
      db.user.update({
        where: { id: member_account },
        data: { balance: Number(credit_amount) },
      }),
      db.gameRound.create({
        data: {
          serialNumber: serial_number,
          gameId: game_id ? Number(game_id) : null,
          gameUid: String(game_uid || ""),
          gameRound: game_round ? String(game_round) : null,
          memberAccount: member_account,
          betAmount: Number(bet_amount),
          winAmount: Number(win_amount),
          creditAmount: Number(credit_amount),
          gameName: game_name || null,
          rawPayload: JSON.stringify(payload),
        },
      }),
      db.transaction.create({
        data: {
          userId: member_account,
          type: Number(win_amount) >= Number(bet_amount) ? "WIN" : "BET",
          amount: Math.abs(Number(win_amount) - Number(bet_amount)),
          balanceAfter: Number(credit_amount),
          referenceId: serial_number,
          description: `Round ${game_round || serial_number} on ${game_name || game_uid}`,
        },
      }),
    ]);

    console.log(`[Callback Success] User ${member_account} balance updated to ₹${credit_amount}. Round ${serial_number}`);

    return NextResponse.json({ success: true, serial_number, credit_amount });
  } catch (error: any) {
    console.error("Callback processing error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
