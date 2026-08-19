const dns = require('dns');
const net = require('net');

const regions = [
  'ap-south-1',       // Mumbai, India
  'ap-southeast-1',   // Singapore
  'us-east-1',        // N. Virginia
  'us-west-1',        // N. California
  'eu-central-1',     // Frankfurt
  'eu-west-1',        // Ireland
  'ap-northeast-1',   // Tokyo
  'ap-southeast-2',   // Sydney
  'sa-east-1',        // Sao Paulo
];

async function checkPoolers() {
  console.log("Checking Supabase pooler regions for project beiinfacldfooypzybrd...\n");

  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    try {
      const addresses = await dns.promises.resolve4(host);
      console.log(`Region [${r}]: Resolved IPv4 -> ${addresses.join(', ')}`);
      
      // Test TCP connection to port 6543 (transaction mode) and 5432 (session mode)
      const socket = new net.Socket();
      socket.setTimeout(3000);
      const isConnectable = await new Promise((resolve) => {
        socket.connect(6543, host, () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('error', () => resolve(false));
        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
      });
      console.log(`   TCP Port 6543 Reachable: ${isConnectable ? '✅ YES' : '❌ NO'}`);
    } catch (err) {
      // not in this region
    }
  }
}

checkPoolers();
