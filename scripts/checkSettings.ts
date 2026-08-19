import { db } from "../lib/db";

async function main() {
  const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
  console.log("ggrcasino siteSetting enabledProviders raw:", settings?.enabledProviders);
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });
