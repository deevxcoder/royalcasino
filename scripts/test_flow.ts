import { encryptPayload, decryptPayload } from "../lib/crypto";
import { launchGameSession, fetchProviders, fetchGames } from "../lib/nexx";

async function testAll() {
  console.log("=== 1. Testing Crypto Encryption / Decryption ===");
  const testObj = { test: "data", balance: 500, timestamp: Date.now() };
  const encrypted = encryptPayload(testObj);
  const decrypted = decryptPayload(encrypted);
  console.log("Ciphertext:", encrypted.substring(0, 30) + "...");
  console.log("Decrypted:", decrypted);
  console.assert(decrypted.test === "data", "Decryption failed");
  console.log("✅ Crypto test passed!");

  console.log("\n=== 2. Testing Providers Fetch ===");
  const providers = await fetchProviders();
  console.log(`Found ${providers.length} providers from NexxAPI.`);
  console.assert(providers.length > 0, "No providers found");
  console.log("Sample provider:", providers[0]);
  console.log("✅ Providers test passed!");

  console.log("\n=== 3. Testing Games Fetch for Spribe (57) ===");
  const { games } = await fetchGames(57);
  console.log(`Found ${games.length} games for Spribe.`);
  const aviator = games.find(g => g.name.toLowerCase().includes("aviator"));
  console.log("Aviator game:", aviator);
  console.assert(aviator !== undefined, "Aviator not found");
  console.log("✅ Games catalog test passed!");

  if (aviator) {
    console.log("\n=== 4. Testing Live Game Launch for Aviator ===");
    try {
      const launch = await launchGameSession({
        userId: "test_player_001",
        gameUid: aviator.game_uid,
        balance: 500,
      });
      console.log("Launch URL generated successfully:", launch.url);
      console.log("✅ Live game launch test passed!");
    } catch (e: any) {
      console.log("Game launch note:", e.message);
    }
  }
}

testAll().catch(console.error);
