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

async function testLaunch(gameUid = "737") {
  const payload = {
    user_id: "demo_player_test_1",
    balance: 500,
    game_uid: String(gameUid),
    token: NEXX_TOKEN,
    timestamp: Date.now(),
    return: "https://your-domain.com/lobby",
    callback: "https://your-domain.com/api/callback",
    currency_code: "INR",
    language: "en",
  };

  const encrypted = encryptPayload(payload);

  console.log("Testing launch for gameUid:", gameUid);
  try {
    const res = await axios.post(
      NEXX_API_URL,
      {
        token: NEXX_TOKEN,
        payload: encrypted,
      },
      { timeout: 15000 }
    );
    console.log("HTTP Status:", res.status);
    console.log("Response Data:", JSON.stringify(res.data, null, 2));

    if (res.data?.data?.url) {
      console.log("Game URL:", res.data.data.url);
      // Let's inspect the game URL response
      try {
        const gameRes = await axios.get(res.data.data.url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000
        });
        console.log("Game HTML Status:", gameRes.status);
        console.log("Game HTML snippet:", gameRes.data.substring(0, 500));
      } catch (err) {
        console.log("Game URL fetch error:", err.message);
        if (err.response) {
          console.log("Game URL response data:", err.response.data);
        }
      }
    }
  } catch (error) {
    console.error("Launch Error:", error.message);
    if (error.response) {
      console.error("Error Response:", error.response.status, error.response.data);
    }
  }
}

// Test multiple providers/games
async function run() {
  console.log("--- 1. Testing Aviator (737) ---");
  await testLaunch("737");

  console.log("\n--- 2. Testing Evolution/Pragmatic/Other games ---");
  await testLaunch("201");
  await testLaunch("101");
}

run();
