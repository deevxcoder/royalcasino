const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const db = new PrismaClient();

function h(p) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

(async () => {
  await db.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', email: 'admin@ggrcasino.com', passwordHash: h('admin123'), balance: 50000, currency: 'INR', isAdmin: true },
  });

  await db.user.upsert({
    where: { username: 'player_vip1' },
    update: {},
    create: { username: 'player_vip1', email: 'vip1@ggrcasino.com', passwordHash: h('vip123'), balance: 1500, currency: 'INR', isAdmin: false },
  });

  const users = await db.user.findMany();
  console.log('Users in Supabase PostgreSQL:');
  users.forEach(u => console.log('  -', u.username, '| Balance:', u.balance, '| Admin:', u.isAdmin));
  await db.$disconnect();
})();
