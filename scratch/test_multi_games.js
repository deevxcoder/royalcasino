const axios = require('axios');
const crypto = require('crypto');

const NEXX_API_URL = 'https://api.nexxapi.tech/api/v1';
const NEXX_TOKEN = '79b49f0e7f96cb36a53abeba98126bc7';
const NEXX_SECRET = '67d048e3b071c6e06177054ea7062647';

function encryptPayload(data) {
  const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(NEXX_SECRET, 'utf8'), null);
  cipher.setAutoPadding(true);
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

async function testAllProviders() {
  try {
    // 1. Fetch Providers
    const provRes = await axios.get(`${NEXX_API_URL}/providers`, {
      params: { token: NEXX_TOKEN }
    });
    const providers = provRes.data.data || [];
    console.log(`Total Providers: ${providers.length}`);

    // 2. Fetch first 30 games
    const gamesRes = await axios.get(`${NEXX_API_URL}/games`, {
      params: { token: NEXX_TOKEN }
    });
    const games = gamesRes.data.data?.games || [];
    console.log(`Total Games fetched: ${games.length}`);

    // Pick 8 games across different brands
    const sampleGames = games.slice(0, 10);

    for (const g of sampleGames) {
      console.log(`\n--- Testing ${g.name} (game_uid: ${g.game_uid}, brand_id: ${g.brand_id}) ---`);
      const payload = {
        user_id: "demo_player",
        balance: 1000,
        game_uid: String(g.game_uid),
        token: NEXX_TOKEN,
        timestamp: Date.now(),
        return: "https://your-domain.com/lobby",
        callback: "https://your-domain.com/api/callback",
        currency_code: "INR",
        language: "en",
      };

      const encrypted = encryptPayload(payload);
      try {
        const launchRes = await axios.post(
          NEXX_API_URL,
          { token: NEXX_TOKEN, payload: encrypted },
          { timeout: 10000 }
        );
        console.log(`Launch status: ${launchRes.data.code} - ${launchRes.data.msg}`);
        if (launchRes.data.data?.url) {
          console.log(`URL: ${launchRes.data.data.url}`);
        }
      } catch (err) {
        console.log(`Launch failed: ${err.message}`);
        if (err.response) {
          console.log(`Response:`, err.response.data);
        }
      }
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testAllProviders();
