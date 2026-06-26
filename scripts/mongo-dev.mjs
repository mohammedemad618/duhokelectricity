// خادم MongoDB محلي للتطوير — يشغّل mongod حقيقياً عبر mongodb-memory-server
// مع تخزين دائم على القرص في مجلد .mongo-data، على المنفذ 27017.
// للإنتاج: عيّن MONGODB_URI لقاعدة Atlas بدل تشغيل هذا الملف.
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), ".mongo-data");
mkdirSync(dbPath, { recursive: true });

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    dbPath,
    storageEngine: "wiredTiger",
  },
});

console.log("✅ MongoDB يعمل على:", mongod.getUri());
console.log("   مجلد البيانات:", dbPath);
console.log("   (اترك هذه النافذة مفتوحة أثناء التطوير — Ctrl+C للإيقاف)");

async function shutdown() {
  console.log("\nإيقاف MongoDB...");
  await mongod.stop({ doCleanup: false });
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// إبقاء العملية حيّة
setInterval(() => {}, 1 << 30);
