import { MongoClient, type Db, type Collection, type Document } from "mongodb";

// اتصال MongoDB مع تخزين مؤقت عبر globalThis ليبقى عبر إعادة التحميل الساخن (HMR)
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "dohuk_electricity";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = new MongoClient(uri).connect());

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

/** مخطّط مستند عام بمعرّف نصّي (نستخدم سلاسل نصية بدل ObjectId) */
export type MongoDoc = { _id: string } & Record<string, unknown>;

/** أسماء المجموعات (Collections) */
export const Collections = {
  users: "users",
  branches: "branches",
  departments: "departments",
  articles: "articles",
  announcements: "announcements",
  faq: "faq",
  complaints: "complaints",
  auditLogs: "audit_logs",
} as const;

export async function collection<T extends Document = Document>(
  name: (typeof Collections)[keyof typeof Collections],
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
