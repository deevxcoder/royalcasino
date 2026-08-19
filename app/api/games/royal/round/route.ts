import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Standard Deck Cards for Andar Bahar
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

interface Card {
  rank: string;
  suit: string;
  color: "red" | "black";
  display: string;
}

function generateShuffledDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    const color = suit === "♥" || suit === "♦" ? "red" : "black";
    for (const rank of RANKS) {
      deck.push({
        rank,
        suit,
        color,
        display: `${rank}${suit}`,
      });
    }
  }
  // Fisher-Yates shuffle with crypto random
  for (let i = deck.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Chicken Road Cross Multiplier tables
const CHICKEN_MULTIPLIERS = {
  easy: [1.15, 1.35, 1.65, 2.10, 2.90, 4.20, 6.80, 15.0],
  medium: [1.25, 1.60, 2.20, 3.40, 5.80, 11.0, 25.0, 60.0],
  hard: [1.45, 2.10, 3.50, 6.80, 15.0, 35.0, 85.0, 250.0],
};

const CHICKEN_CRASH_CHANCE = {
  easy: 0.10,   // 90% survival per lane
  medium: 0.18, // 82% survival per lane
  hard: 0.28,   // 72% survival per lane
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const auth = token ? verifyToken(token) : null;

    if (!auth) {
      return NextResponse.json({ error: "Please log in to play." }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 401 });
    }

    const body = await req.json();
    const { gameUid, action } = body;

    if (!gameUid) {
      return NextResponse.json({ error: "gameUid is required" }, { status: 400 });
    }

    // ==========================================
    // 1. COIN FLIP ROYALE
    // ==========================================
    if (gameUid === "royal_coinflip") {
      const { betAmount = 10, choice = "heads" } = body;
      const numBet = Number(betAmount);

      if (numBet <= 0 || isNaN(numBet)) {
        return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 });
      }

      if (user.balance < numBet) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }

      // Generate Provably Fair outcome
      const rng = crypto.randomInt(0, 100);
      const coinResult = rng < 50 ? "heads" : "tails";
      const won = coinResult === choice;
      const multiplier = 1.96;
      const winAmount = won ? Number((numBet * multiplier).toFixed(2)) : 0;
      const newBalance = Number((user.balance - numBet + winAmount).toFixed(2));

      const serialNumber = `SN-ROYAL-CF-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
      const roundId = `R-CF-${Date.now()}`;

      // Update balance & record round in database
      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { balance: newBalance },
        }),
        db.gameRound.create({
          data: {
            serialNumber,
            gameId: 88801,
            gameUid: "royal_coinflip",
            gameRound: roundId,
            memberAccount: user.id,
            betAmount: numBet,
            winAmount: winAmount,
            creditAmount: newBalance,
            gameName: "Coin Flip Royale",
            rawPayload: JSON.stringify({ choice, result: coinResult, won, multiplier }),
          },
        }),
        db.transaction.create({
          data: {
            userId: user.id,
            type: won ? "WIN" : "BET",
            amount: won ? winAmount - numBet : -numBet,
            balanceAfter: newBalance,
            referenceId: serialNumber,
            description: `Coin Flip (${choice.toUpperCase()} -> ${coinResult.toUpperCase()}) ${won ? "WON" : "LOST"}`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        coinResult,
        choice,
        won,
        multiplier: won ? multiplier : 0,
        winAmount,
        betAmount: numBet,
        newBalance,
        serialNumber,
      });
    }

    // ==========================================
    // 2. ANDAR BAHAR LIVE
    // ==========================================
    if (gameUid === "royal_andarbahar") {
      const { betAmount = 50, betSide = "andar" } = body;
      const numBet = Number(betAmount);

      if (numBet <= 0 || isNaN(numBet)) {
        return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 });
      }

      if (user.balance < numBet) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }

      const deck = generateShuffledDeck();
      // Draw Joker (Trump card)
      const jokerCard = deck.pop()!;

      const dealtAndar: Card[] = [];
      const dealtBahar: Card[] = [];
      let winningSide: "andar" | "bahar" = "andar";
      let matchedCard: Card | null = null;

      // Deal sequentially to Andar (1st), Bahar (2nd), Andar (3rd)...
      let currentSide: "andar" | "bahar" = "andar";
      while (deck.length > 0) {
        const card = deck.pop()!;
        if (currentSide === "andar") {
          dealtAndar.push(card);
          if (card.rank === jokerCard.rank) {
            winningSide = "andar";
            matchedCard = card;
            break;
          }
          currentSide = "bahar";
        } else {
          dealtBahar.push(card);
          if (card.rank === jokerCard.rank) {
            winningSide = "bahar";
            matchedCard = card;
            break;
          }
          currentSide = "andar";
        }
      }

      const won = betSide === winningSide;
      // Andar pays 1.90x (slight house edge since Andar gets 1st card), Bahar pays 2.00x
      const multiplier = winningSide === "andar" ? 1.90 : 2.00;
      const winAmount = won ? Number((numBet * multiplier).toFixed(2)) : 0;
      const newBalance = Number((user.balance - numBet + winAmount).toFixed(2));

      const serialNumber = `SN-ROYAL-AB-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
      const roundId = `R-AB-${Date.now()}`;

      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { balance: newBalance },
        }),
        db.gameRound.create({
          data: {
            serialNumber,
            gameId: 88802,
            gameUid: "royal_andarbahar",
            gameRound: roundId,
            memberAccount: user.id,
            betAmount: numBet,
            winAmount: winAmount,
            creditAmount: newBalance,
            gameName: "Andar Bahar Live",
            rawPayload: JSON.stringify({
              joker: jokerCard.display,
              matched: matchedCard?.display,
              winningSide,
              betSide,
              won,
            }),
          },
        }),
        db.transaction.create({
          data: {
            userId: user.id,
            type: won ? "WIN" : "BET",
            amount: won ? winAmount - numBet : -numBet,
            balanceAfter: newBalance,
            referenceId: serialNumber,
            description: `Andar Bahar (Bet: ${betSide.toUpperCase()} | Won: ${winningSide.toUpperCase()})`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        jokerCard,
        dealtAndar,
        dealtBahar,
        winningSide,
        matchedCard,
        totalCards: dealtAndar.length + dealtBahar.length,
        won,
        multiplier: won ? multiplier : 0,
        winAmount,
        betAmount: numBet,
        newBalance,
        serialNumber,
      });
    }

    // ==========================================
    // 3. CHICKEN ROAD CROSS (Crash & Stepper)
    // ==========================================
    if (gameUid === "royal_chickencross") {
      // Actions: "start" | "step" | "cashout"
      if (action === "start") {
        const { betAmount = 20, difficulty = "medium" } = body;
        const numBet = Number(betAmount);

        if (numBet <= 0 || isNaN(numBet)) {
          return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 });
        }

        if (user.balance < numBet) {
          return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }

        // Deduct initial bet
        const newBalance = Number((user.balance - numBet).toFixed(2));
        await db.user.update({
          where: { id: user.id },
          data: { balance: newBalance },
        });

        const multipliers = CHICKEN_MULTIPLIERS[difficulty as "easy" | "medium" | "hard"] || CHICKEN_MULTIPLIERS.medium;

        return NextResponse.json({
          success: true,
          gameState: "active",
          currentLane: 0,
          currentMultiplier: 1.0,
          multipliers,
          betAmount: numBet,
          difficulty,
          newBalance,
        });
      }

      if (action === "step") {
        const { currentLane = 0, difficulty = "medium", betAmount = 20 } = body;
        const diff = (difficulty as "easy" | "medium" | "hard") || "medium";
        const crashProb = CHICKEN_CRASH_CHANCE[diff] || 0.18;
        const multipliers = CHICKEN_MULTIPLIERS[diff] || CHICKEN_MULTIPLIERS.medium;
        const numBet = Number(betAmount);

        // RNG collision check
        const roll = Math.random();
        const crashed = roll < crashProb;

        if (crashed) {
          const serialNumber = `SN-ROYAL-CRC-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
          const roundId = `R-CRC-${Date.now()}`;

          // Log lost round
          await db.gameRound.create({
            data: {
              serialNumber,
              gameId: 88803,
              gameUid: "royal_chickencross",
              gameRound: roundId,
              memberAccount: user.id,
              betAmount: numBet,
              winAmount: 0,
              creditAmount: user.balance,
              gameName: "Chicken Road Cross",
              rawPayload: JSON.stringify({ crashedAtLane: currentLane + 1, difficulty: diff }),
            },
          });

          return NextResponse.json({
            success: true,
            crashed: true,
            currentLane: currentLane + 1,
            newBalance: user.balance,
            serialNumber,
          });
        }

        const nextLane = currentLane + 1;
        const nextMultiplier = multipliers[Math.min(nextLane - 1, multipliers.length - 1)];
        const isMaxLane = nextLane >= multipliers.length;

        // If crossed all lanes, automatically win jackpot
        if (isMaxLane) {
          const winAmount = Number((numBet * nextMultiplier).toFixed(2));
          const newBalance = Number((user.balance + winAmount).toFixed(2));
          const serialNumber = `SN-ROYAL-CRC-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
          const roundId = `R-CRC-${Date.now()}`;

          await db.$transaction([
            db.user.update({
              where: { id: user.id },
              data: { balance: newBalance },
            }),
            db.gameRound.create({
              data: {
                serialNumber,
                gameId: 88803,
                gameUid: "royal_chickencross",
                gameRound: roundId,
                memberAccount: user.id,
                betAmount: numBet,
                winAmount: winAmount,
                creditAmount: newBalance,
                gameName: "Chicken Road Cross (Jackpot)",
                rawPayload: JSON.stringify({ completedAllLanes: true, multiplier: nextMultiplier }),
              },
            }),
          ]);

          return NextResponse.json({
            success: true,
            crashed: false,
            currentLane: nextLane,
            currentMultiplier: nextMultiplier,
            completed: true,
            winAmount,
            newBalance,
            serialNumber,
          });
        }

        return NextResponse.json({
          success: true,
          crashed: false,
          currentLane: nextLane,
          currentMultiplier: nextMultiplier,
          completed: false,
          potentialWin: Number((numBet * nextMultiplier).toFixed(2)),
          newBalance: user.balance,
        });
      }

      if (action === "cashout") {
        const { currentMultiplier = 1.0, betAmount = 20, currentLane = 1 } = body;
        const numBet = Number(betAmount);
        const mult = Number(currentMultiplier);
        const winAmount = Number((numBet * mult).toFixed(2));
        const newBalance = Number((user.balance + winAmount).toFixed(2));

        const serialNumber = `SN-ROYAL-CRC-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
        const roundId = `R-CRC-${Date.now()}`;

        await db.$transaction([
          db.user.update({
            where: { id: user.id },
            data: { balance: newBalance },
          }),
          db.gameRound.create({
            data: {
              serialNumber,
              gameId: 88803,
              gameUid: "royal_chickencross",
              gameRound: roundId,
              memberAccount: user.id,
              betAmount: numBet,
              winAmount: winAmount,
              creditAmount: newBalance,
              gameName: "Chicken Road Cross",
              rawPayload: JSON.stringify({ cashedOutAtLane: currentLane, multiplier: mult }),
            },
          }),
          db.transaction.create({
            data: {
              userId: user.id,
              type: "WIN",
              amount: winAmount - numBet,
              balanceAfter: newBalance,
              referenceId: serialNumber,
              description: `Chicken Road Cross Cashout at ${mult}x (₹${winAmount})`,
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          cashedOut: true,
          winAmount,
          multiplier: mult,
          newBalance,
          serialNumber,
        });
      }
    }

    return NextResponse.json({ error: "Unknown royal game action" }, { status: 400 });
  } catch (error: any) {
    console.error("Royal Game Round error:", error);
    return NextResponse.json({ error: error.message || "Failed to process round" }, { status: 500 });
  }
}
