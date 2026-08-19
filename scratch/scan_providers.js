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

async function scanProviders() {
  const provRes = await axios.get(`${NEXX_API_URL}/providers`, { params: { token: NEXX_TOKEN } });
  const raw = provRes.data.data;
  const providers = Array.isArray(raw) ? raw : (raw?.providers || []);
  console.log(`Found ${providers.length} providers.`);

  const activeProviders = [];
  const unavailableProviders = [];

  for (const p of providers.slice(0, 25)) {
    try {
      const gRes = await axios.get(`${NEXX_API_URL}/games`, {
        params: { token: NEXX_TOKEN, brand_id: p.id, limit: 1 }
      });
      const rawG = gRes.data.data;
      const gList = Array.isArray(rawG) ? rawG : (rawG?.games || []);
      if (!gList.length) {
        console.log(`- Provider ${p.name} (id: ${p.id}): No games found in catalog`);
        continue;
      }

      const testGame = gList[0];
      const payload = {
        user_id: "demo_test",
        balance: 500,
        game_uid: String(testGame.game_uid),
        token: NEXX_TOKEN,
        timestamp: Date.now(),
        return: "https://your-domain.com/lobby",
        callback: "https://your-domain.com/api/callback",
        currency_code: "INR",
        language: "en",
      };
      const encrypted = encryptPayload(payload);
      const lRes = await axios.post(NEXX_API_URL, { token: NEXX_TOKEN, payload: encrypted }, { timeout: 6000 });
      
      const isOk = lRes.data.code === 0 && !lRes.data.data?.url?.includes('error');
      if (isOk) {
        console.log(`✅ [ACTIVE] ${p.name} (id: ${p.id}) - Game: "${testGame.name}" -> ${lRes.data.data.url.substring(0, 60)}...`);
        activeProviders.push({ id: p.id, name: p.name, sampleGame: testGame.name });
      } else {
        console.log(`❌ [UNAVAILABLE] ${p.name} (id: ${p.id}) - Msg: ${lRes.data.msg}`);
        unavailableProviders.push({ id: p.id, name: p.name, reason: lRes.data.msg });
      }
    } catch (err) {
      console.log(`⚠️ [ERROR] ${p.name} (id: ${p.id}): ${err.message}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total Active Providers tested: ${activeProviders.length}`);
  console.log(activeProviders);
}

scanProviders();
