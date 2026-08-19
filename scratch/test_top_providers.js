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

async function testTopProviders() {
  const brands = [
    { id: 57, name: 'Spribe' },
    { id: 45, name: 'PGSoft' },
    { id: 49, name: 'JILI' },
    { id: 54, name: 'PragmaticPlay' },
    { id: 107, name: 'Smartsoft (JetX)' },
    { id: 152, name: 'Endorphina' },
    { id: 136, name: 'RubyPlay' },
  ];

  for (const b of brands) {
    console.log(`\n=== Testing Provider: ${b.name} (brand_id: ${b.id}) ===`);
    try {
      const gRes = await axios.get(`${NEXX_API_URL}/games`, {
        params: { token: NEXX_TOKEN, brand_id: b.id, limit: 3 }
      });
      const games = gRes.data.data?.games || [];
      console.log(`Retrieved ${games.length} games.`);

      for (const g of games) {
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
        const lRes = await axios.post(NEXX_API_URL, { token: NEXX_TOKEN, payload: encrypted }, { timeout: 10000 });
        console.log(`- Game "${g.name}" (uid: ${g.game_uid}): Code ${lRes.data.code}, Msg: ${lRes.data.msg}`);
        if (lRes.data.data?.url) {
          console.log(`  URL: ${lRes.data.data.url}`);
        }
      }
    } catch (e) {
      console.error(`Error with ${b.name}:`, e.message);
    }
  }
}

testTopProviders();
