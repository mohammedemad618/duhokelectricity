// تعبئة قاعدة البيانات بالبيانات التجريبية + إنشاء المستخدمين والفهارس.
// التشغيل: npm run seed   (تأكّد أن قاعدة البيانات تعمل عبر: npm run db)
import bcrypt from "bcryptjs";
import { getDb, Collections, type MongoDoc } from "@/lib/db";
import { branches } from "@/lib/data/branches";
import { departments } from "@/lib/data/departments";
import { articles } from "@/lib/data/articles";
import { announcements } from "@/lib/data/announcements";
import { faqItems } from "@/lib/data/faq";
import type { Role } from "@/lib/types";

/** يحوّل عناصر تحمل id إلى مستندات MongoDB بمعرّف _id */
function idToDocs<T extends { id: string }>(items: T[]): MongoDoc[] {
  return items.map(({ id, ...rest }) => ({
    _id: id,
    ...(rest as Record<string, unknown>),
  }));
}

async function upsert(name: string, docs: MongoDoc[]) {
  if (docs.length === 0) return;
  const db = await getDb();
  await db.collection<MongoDoc>(name).bulkWrite(
    docs.map(({ _id, ...rest }) => ({
      updateOne: { filter: { _id }, update: { $set: rest }, upsert: true },
    })),
  );
  console.log(`  ✓ ${name}: ${docs.length}`);
}

const seedUsers: {
  _id: string;
  name: string;
  username: string;
  role: Role;
  branchId?: string;
  departmentId?: string;
  password: string;
}[] = [
  { _id: "u_admin", name: "المدير العام", username: "admin", role: "super_admin", password: "Admin@123" },
  { _id: "u_dohuk_admin", name: "مدير فرع دهوك", username: "dohuk_admin", role: "branch_admin", branchId: "dohuk", password: "Branch@123" },
  { _id: "u_construction_admin", name: "مسؤول قسم التشييد", username: "construction_admin", role: "department_admin", branchId: "dohuk", departmentId: "construction", password: "Dept@123" },
  { _id: "u_editor", name: "محرر المحتوى", username: "editor", role: "editor", branchId: "dohuk", password: "Editor@123" },
  { _id: "u_reviewer", name: "المراجع", username: "reviewer", role: "reviewer", branchId: "dohuk", password: "Review@123" },
];

async function main() {
  console.log("تعبئة قاعدة البيانات...");

  await upsert(Collections.branches, idToDocs(branches));
  await upsert(Collections.departments, idToDocs(departments));
  await upsert(
    Collections.articles,
    idToDocs(
      articles.map((a) => ({
        ...a,
        authorId: a.departmentId === "construction" ? "u_construction_admin" : "u_editor",
        updatedAt: a.publishedAt,
      })),
    ),
  );
  await upsert(
    Collections.announcements,
    idToDocs(
      announcements.map((a) => ({
        ...a,
        createdBy: "u_admin",
        createdAt: a.startsAt,
      })),
    ),
  );
  await upsert(Collections.faq, idToDocs(faqItems));

  // المستخدمون مع كلمات مرور مشفّرة
  const now = new Date().toISOString();
  const userDocs = seedUsers.map(({ password, ...u }) => ({
    ...u,
    passwordHash: bcrypt.hashSync(password, 10),
    status: "active" as const,
    createdAt: now,
  })) as MongoDoc[];
  await upsert(Collections.users, userDocs);

  // الفهارس
  const db = await getDb();
  await db.collection(Collections.users).createIndex({ username: 1 }, { unique: true });
  await db.collection(Collections.articles).createIndex({ status: 1, category: 1, publishedAt: -1 });
  await db.collection(Collections.articles).createIndex({ branchId: 1 });
  await db.collection(Collections.announcements).createIndex({ status: 1, importance: 1 });
  await db.collection(Collections.complaints).createIndex({ status: 1, createdAt: -1 });
  console.log("  ✓ الفهارس");

  console.log("\nبيانات الدخول التجريبية:");
  for (const u of seedUsers) {
    console.log(`  ${u.role.padEnd(16)} | ${u.username.padEnd(20)} | ${u.password}`);
  }
  console.log("\n✅ تمت التعبئة بنجاح.");
  process.exit(0);
}

main().catch((err) => {
  console.error("فشلت التعبئة:", err);
  process.exit(1);
});
