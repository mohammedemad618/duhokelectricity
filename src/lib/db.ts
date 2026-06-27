import {
  MongoClient,
  type Collection,
  type Db,
  type Document,
  type MongoClientOptions,
} from "mongodb";

// اتصال MongoDB مهيّأ للبيئة بدون خادم (serverless) على Netlify
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "dohuk_electricity";

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  // فشل سريع بدل الانتظار 30 ثانية (تفادي تجاوز مهلة الدالة على Netlify)
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 30000,
  maxIdleTimeMS: 60000,
  retryWrites: true,
  retryReads: true,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * يعيد وعد الاتصال المخزّن (يبقى عبر إعادة التحميل الساخن وعبر الطلبات الدافئة).
 *
 * مهم: عند فشل الاتصال نُفرّغ المخزن فوراً حتى لا يبقى "وعد مرفوض" مخزّناً
 * يُفشل كل الطلبات اللاحقة على نفس نسخة الدالة — وهو سبب أن الموقع كان
 * "يسقط ثم يعود". هكذا يُعاد الاتصال تلقائياً في الطلب التالي.
 */
function clientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options)
      .connect()
      .catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
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
