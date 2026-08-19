const { Client } = require('pg');

const regions = [
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
  'ap-northeast-1', 'ap-northeast-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3',
  'eu-central-1', 'eu-central-2', 'eu-north-1',
  'sa-east-1', 'ca-central-1', 'me-south-1', 'af-south-1',
];

async function tryRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new Client({
    host,
    port: 6543,
    user: 'postgres.beiinfacldfooypzybrd',
    password: 'ilove@SB@143',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT current_database() as db, now() as time');
    console.log(`✅ FOUND! Region: ${region}`);
    console.log(`   Host: ${host}:6543`);
    console.log(`   DB: ${res.rows[0].db}, Time: ${res.rows[0].time}`);
    await client.end();
    return true;
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('not found')) {
      // wrong region, skip
    } else if (msg.includes('password') || msg.includes('auth')) {
      console.log(`⚠️  Region ${region} - Auth error (region might be correct): ${msg}`);
      return true; // region found but auth issue
    } else if (msg.includes('timeout') || msg.includes('ENOTFOUND')) {
      // skip
    } else {
      console.log(`❓ Region ${region}: ${msg}`);
    }
    try { await client.end(); } catch(_) {}
    return false;
  }
}

(async () => {
  console.log('Scanning all Supabase pooler regions for project beiinfacldfooypzybrd...\n');
  for (const r of regions) {
    process.stdout.write(`  Testing ${r}... `);
    const found = await tryRegion(r);
    if (found) {
      process.exit(0);
    } else {
      console.log('not here');
    }
  }
  console.log('\n❌ Project not found in any region. It may be paused or using a different architecture.');
})();
