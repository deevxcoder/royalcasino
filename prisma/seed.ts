import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Seeding Supabase PostgreSQL database...");

  // Seed Admin
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@nexxcasino.com",
      passwordHash: hashPassword("admin123"),
      balance: 50000.0,
      currency: "INR",
      isAdmin: true,
    },
  });

  // Seed VIP Player
  const vipPlayer = await prisma.user.upsert({
    where: { username: "player_vip1" },
    update: {},
    create: {
      username: "player_vip1",
      email: "vip1@nexxcasino.com",
      passwordHash: hashPassword("vip123"),
      balance: 1500.0,
      currency: "INR",
      isAdmin: false,
    },
  });

  // Seed Default Site Settings
  const settings = await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "ROYAL GGR CASINO",
      siteSubtitle: "Casino Royale",
      logoUrl: null,
      themeColor: "gold",
      callbackUrl: "https://your-domain.com/api/callback",
      returnUrl: "https://your-domain.com/lobby",
      currency: "INR",
    },
  });

  console.log("✅ Seeded Admin User:", adminUser.username);
  console.log("✅ Seeded VIP Player:", vipPlayer.username, "Balance: ₹" + vipPlayer.balance);
  console.log("✅ Seeded Site Settings:", settings.siteName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
