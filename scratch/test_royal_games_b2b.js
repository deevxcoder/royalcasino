const axios = require("axios");

async function testRoyalGamesEngine() {
  console.log("Testing Royal Games B2B Provider Engine & Database...");

  const { PrismaClient } = require("../royal-games/prisma-client");
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:C:/Users/vikram/Desktop/ggrcasino/royal-games/prisma/dev.db",
      },
    },
  });

  const operator = await prisma.operator.findUnique({
    where: { email: "partner@casino.com" },
    include: { tokens: true },
  });

  console.log("Found Operator:", operator?.companyName, "| Balance: ₹" + operator?.balance);
  console.log("Active API Token:", operator?.tokens[0]?.token);

  await prisma.$disconnect();
}

testRoyalGamesEngine().catch(console.error);
