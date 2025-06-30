import { Database } from 'arangojs';

const db = new Database({
  url: process.env.ARANGO_URL || 'http://db:8529',
});
db.useBasicAuth('root', process.env.ARANGO_ROOT_PASSWORD || 'password');

async function seed() {
  try {
    const dbName = 'candid_lcars';
    const exists = await db.listDatabases().then(dbs => dbs.includes(dbName));
    if (!exists) {
      await db.createDatabase(dbName);
      console.log(`Database '${dbName}' created.`);
    }

    db.useDatabase(dbName);

    const collections = ['users', 'missions', 'logs'];
    for (const name of collections) {
      const col = db.collection(name);
      if (!await col.exists()) {
        await col.create();
        console.log(`Collection '${name}' created.`);
        await col.save({ name: `${name}_seed`, timestamp: Date.now() });
      }
    }

    console.log("✅ ArangoDB seeded successfully.");
  } catch (err) {
    console.error("❌ Failed to seed ArangoDB:", err);
  }
}

seed();
