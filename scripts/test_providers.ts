import { fetchGames, launchGameSession, getGgrBalance, getWhoami } from "../lib/nexx";

async function testMultipleGames() {
  console.log("Checking Whoami & GGR Balance:");
  const whoami = await getWhoami();
  console.log("Whoami:", whoami);
  const bal = await getGgrBalance();
  console.log("GGR Balance:", bal);

  // Test Smartsoft games (brand_id 107) e.g. JetX
  const smartsoft = await fetchGames(107);
  console.log(`Smartsoft games (${smartsoft.games.length}):`, smartsoft.games.slice(0, 3));

  // Test Pragmatic Play (brand_id 54)
  const pragmatic = await fetchGames(54);
  console.log(`Pragmatic games (${pragmatic.games.length}):`, pragmatic.games.slice(0, 3));

  for (const game of [...smartsoft.games.slice(0, 2), ...pragmatic.games.slice(0, 2)]) {
    try {
      console.log(`\nAttempting launch for ${game.name} (${game.game_uid}, ${game.provider}):`);
      const res = await launchGameSession({
        userId: "test_user_001",
        gameUid: game.game_uid,
        balance: 1000,
      });
      console.log(`-> SUCCESS: ${res.url}`);
    } catch (e: any) {
      console.log(`-> Response: ${e.message}`);
    }
  }
}

testMultipleGames();
