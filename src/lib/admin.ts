// ============================================================================
// طبقة الإدارة (لوحة التحكم) — قراءة وكتابة محميّة بالصلاحيات
// تُستخدم فقط من جانب الخادم (Server Components / Server Actions).
// ============================================================================

import { randomUUID } from "node:crypto";
import { getDb, Collections } from "@/lib/db";
import {
  articleScopeFilter,
  complaintScopeFilter,
} from "@/lib/permissions";
import {
  categoryLabels,
  complaintStatusLabels,
  contentStatusLabels,
} from "@/lib/labels";
import type {
  Announcement,
  Article,
  ArticleCategory,
  AuditLog,
  Complaint,
  ComplaintStatus,
  ContentStatus,
  DepartmentType,
  ReportBucket,
  SessionUser,
  User,
} from "@/lib/types";

type Doc = { _id: string } & Record<string, unknown>;

function mapDoc<T>(doc: Doc): T {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest } as T;
}

/* ------------------------------ سجل العمليات ------------------------------ */

export async function logAction(
  user: Pick<SessionUser, "id" | "name">,
  action: string,
  target: string,
  details?: string,
): Promise<void> {
  const db = await getDb();
  await db.collection<Doc>(Collections.auditLogs).insertOne({
    _id: `log_${randomUUID().slice(0, 8)}`,
    userId: user.id,
    userName: user.name,
    action,
    target,
    details,
    createdAt: new Date().toISOString(),
  });
}

/* ------------------------------ الإحصائيات ------------------------------ */

export interface DashboardStats {
  articles: { total: number; published: number; review: number; draft: number };
  announcements: { active: number; total: number };
  complaints: { total: number; new: number; inProgress: number; completed: number };
  users: number;
  branches: number;
  departments: number;
}

export async function getDashboardStats(
  user: SessionUser,
): Promise<DashboardStats> {
  const db = await getDb();
  const aScope = articleScopeFilter(user);
  const cScope = complaintScopeFilter(user);

  const A = db.collection<Doc>(Collections.articles);
  const N = db.collection<Doc>(Collections.announcements);
  const C = db.collection<Doc>(Collections.complaints);

  const [
    aTotal,
    aPublished,
    aReview,
    aDraft,
    nActive,
    nTotal,
    cTotal,
    cNew,
    cInProgress,
    cCompleted,
    users,
    branches,
    departments,
  ] = await Promise.all([
    A.countDocuments(aScope),
    A.countDocuments({ ...aScope, status: "published" }),
    A.countDocuments({ ...aScope, status: "review" }),
    A.countDocuments({ ...aScope, status: "draft" }),
    N.countDocuments({ status: "active" }),
    N.countDocuments({}),
    C.countDocuments(cScope),
    C.countDocuments({ ...cScope, status: "new" }),
    C.countDocuments({
      ...cScope,
      status: { $in: ["review", "assigned", "processing"] },
    }),
    C.countDocuments({ ...cScope, status: { $in: ["completed", "closed"] } }),
    db.collection<Doc>(Collections.users).countDocuments({}),
    db.collection<Doc>(Collections.branches).countDocuments({}),
    db.collection<Doc>(Collections.departments).countDocuments({}),
  ]);

  return {
    articles: { total: aTotal, published: aPublished, review: aReview, draft: aDraft },
    announcements: { active: nActive, total: nTotal },
    complaints: { total: cTotal, new: cNew, inProgress: cInProgress, completed: cCompleted },
    users,
    branches,
    departments,
  };
}

/* --------------------------- قوائم لوحة التحكم --------------------------- */

export async function getRecentArticlesForUser(
  user: SessionUser,
  limit = 5,
): Promise<Article[]> {
  const db = await getDb();
  const docs = await db
    .collection<Doc>(Collections.articles)
    .find(articleScopeFilter(user))
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => mapDoc<Article>(d));
}

export async function getRecentComplaintsForUser(
  user: SessionUser,
  limit = 5,
): Promise<Complaint[]> {
  const db = await getDb();
  const docs = await db
    .collection<Doc>(Collections.complaints)
    .find(complaintScopeFilter(user))
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => mapDoc<Complaint>(d));
}

/* ------------------------------ المقالات (إدارة) ------------------------------ */

export async function listArticlesForUser(
  user: SessionUser,
  opts: { status?: ContentStatus } = {},
): Promise<Article[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = { ...articleScopeFilter(user) };
  if (opts.status) filter.status = opts.status;
  const docs = await db
    .collection<Doc>(Collections.articles)
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => mapDoc<Article>(d));
}

/** يجلب مقالاً بأي حالة (للتحرير) */
export async function getArticleForEdit(
  id: string,
): Promise<Article | undefined> {
  const db = await getDb();
  const doc = await db.collection<Doc>(Collections.articles).findOne({ _id: id });
  return doc ? mapDoc<Article>(doc) : undefined;
}

/* ------------------------------ الإعلانات (إدارة) ------------------------------ */

export async function listAnnouncements(): Promise<Announcement[]> {
  const db = await getDb();
  const docs = await db
    .collection<Doc>(Collections.announcements)
    .find({})
    .sort({ startsAt: -1 })
    .toArray();
  return docs.map((d) => mapDoc<Announcement>(d));
}

export async function getAnnouncementForEdit(
  id: string,
): Promise<Announcement | undefined> {
  const db = await getDb();
  const doc = await db
    .collection<Doc>(Collections.announcements)
    .findOne({ _id: id });
  return doc ? mapDoc<Announcement>(doc) : undefined;
}

/* ------------------------------ الشكاوى (إدارة) ------------------------------ */

export async function listComplaintsForUser(
  user: SessionUser,
  opts: { status?: string } = {},
): Promise<Complaint[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = { ...complaintScopeFilter(user) };
  if (opts.status) filter.status = opts.status;
  const docs = await db
    .collection<Doc>(Collections.complaints)
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => mapDoc<Complaint>(d));
}

export async function getComplaintById(
  id: string,
): Promise<Complaint | undefined> {
  const db = await getDb();
  const doc = await db
    .collection<Doc>(Collections.complaints)
    .findOne({ _id: id });
  return doc ? mapDoc<Complaint>(doc) : undefined;
}

/* ------------------------------ المستخدمون (إدارة) ------------------------------ */

export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  const docs = await db
    .collection<Doc>(Collections.users)
    .find({})
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map((d) => mapDoc<User>(d));
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await getDb();
  const doc = await db.collection<Doc>(Collections.users).findOne({ _id: id });
  return doc ? mapDoc<User>(doc) : undefined;
}

/* ============================ عمليات الكتابة ============================ */

export interface ArticleInput {
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  branchId?: string;
  departmentId?: DepartmentType;
  location?: string;
  tags?: string[];
  imageCount?: number;
}

export async function createArticle(
  input: ArticleInput,
  user: SessionUser,
): Promise<string> {
  const db = await getDb();
  const id = `art_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  await db.collection<Doc>(Collections.articles).insertOne({
    _id: id,
    ...input,
    author: user.name,
    authorId: user.id,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  });
  return id;
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
): Promise<void> {
  const db = await getDb();
  await db.collection<Doc>(Collections.articles).updateOne(
    { _id: id },
    { $set: { ...input, updatedAt: new Date().toISOString() } },
  );
}

export async function setArticleStatus(
  id: string,
  status: ContentStatus,
  extra: { reviewNote?: string } = {},
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const update: Record<string, unknown> = { status, updatedAt: now };
  if (status === "published") {
    update.publishedAt = now;
    update.reviewNote = "";
  }
  if (extra.reviewNote !== undefined) update.reviewNote = extra.reviewNote;
  await db.collection<Doc>(Collections.articles).updateOne({ _id: id }, { $set: update });
}

export async function deleteArticle(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<Doc>(Collections.articles).deleteOne({ _id: id });
}

/* ------------------------------ الإعلانات ------------------------------ */

export interface AnnouncementInput {
  title: string;
  body: string;
  type: Announcement["type"];
  importance: Announcement["importance"];
  branchId?: string;
  startsAt: string;
  endsAt?: string;
  status: Announcement["status"];
  pinned?: boolean;
}

export async function createAnnouncement(
  input: AnnouncementInput,
  user: SessionUser,
): Promise<string> {
  const db = await getDb();
  const id = `ann_${randomUUID().slice(0, 8)}`;
  await db.collection<Doc>(Collections.announcements).insertOne({
    _id: id,
    ...input,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<void> {
  const db = await getDb();
  await db
    .collection<Doc>(Collections.announcements)
    .updateOne({ _id: id }, { $set: { ...input } });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<Doc>(Collections.announcements).deleteOne({ _id: id });
}

/* ------------------------------ الشكاوى ------------------------------ */

export async function updateComplaint(
  id: string,
  update: {
    status?: ComplaintStatus;
    assignedDepartment?: DepartmentType;
    note?: string;
  },
): Promise<void> {
  const db = await getDb();
  const set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (update.status) {
    set.status = update.status;
    if (update.status === "closed" || update.status === "completed") {
      set.closedAt = new Date().toISOString();
    }
  }
  if (update.assignedDepartment !== undefined)
    set.assignedDepartment = update.assignedDepartment;
  if (update.note !== undefined) set.note = update.note;
  await db.collection<Doc>(Collections.complaints).updateOne({ _id: id }, { $set: set });
}

/* ------------------------------ المستخدمون ------------------------------ */

export interface UserInput {
  name: string;
  username: string;
  role: User["role"];
  branchId?: string;
  departmentId?: DepartmentType;
  status: User["status"];
}

export async function createUser(
  input: UserInput,
  passwordHash: string,
): Promise<string> {
  const db = await getDb();
  const id = `u_${randomUUID().slice(0, 8)}`;
  await db.collection<Doc>(Collections.users).insertOne({
    _id: id,
    ...input,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateUser(
  id: string,
  input: UserInput,
  passwordHash?: string,
): Promise<void> {
  const db = await getDb();
  const set: Record<string, unknown> = { ...input };
  if (passwordHash) set.passwordHash = passwordHash;
  await db.collection<Doc>(Collections.users).updateOne({ _id: id }, { $set: set });
}

export async function deleteUser(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<Doc>(Collections.users).deleteOne({ _id: id });
}

export async function usernameExists(
  username: string,
  excludeId?: string,
): Promise<boolean> {
  const db = await getDb();
  const filter: Record<string, unknown> = { username };
  if (excludeId) filter._id = { $ne: excludeId };
  const count = await db.collection<Doc>(Collections.users).countDocuments(filter);
  return count > 0;
}

/* ============================ التقارير والإحصائيات ============================ */

export interface ReportData {
  articlesByStatus: ReportBucket[];
  articlesByCategory: ReportBucket[];
  articlesByBranch: ReportBucket[];
  articlesByDepartment: ReportBucket[];
  complaintsByStatus: ReportBucket[];
  complaintsByBranch: ReportBucket[];
}

type GroupRow = { _id: string | null; count: number };

async function groupCount(
  collectionName: string,
  match: Record<string, unknown>,
  field: string,
): Promise<GroupRow[]> {
  const db = await getDb();
  const rows = await db
    .collection<Doc>(collectionName)
    .aggregate([
      { $match: match },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
  return rows as GroupRow[];
}

export async function getReportData(user: SessionUser): Promise<ReportData> {
  const db = await getDb();
  const aMatch = articleScopeFilter(user);
  const cMatch = complaintScopeFilter(user);

  const [branchDocs, deptDocs] = await Promise.all([
    db.collection<Doc>(Collections.branches).find({}).toArray(),
    db.collection<Doc>(Collections.departments).find({}).toArray(),
  ]);
  const branchName: Record<string, string> = Object.fromEntries(
    branchDocs.map((b) => [b._id, (b.shortName as string) ?? (b.name as string)]),
  );
  const deptName: Record<string, string> = Object.fromEntries(
    deptDocs.map((d) => [d._id, d.name as string]),
  );

  const [aStatus, aCategory, aBranch, aDept, cStatus, cBranch] =
    await Promise.all([
      groupCount(Collections.articles, aMatch, "status"),
      groupCount(Collections.articles, aMatch, "category"),
      groupCount(Collections.articles, aMatch, "branchId"),
      groupCount(Collections.articles, aMatch, "departmentId"),
      groupCount(Collections.complaints, cMatch, "status"),
      groupCount(Collections.complaints, cMatch, "branchId"),
    ]);

  const toBuckets = (
    rows: GroupRow[],
    labelFn: (key: string | null) => string,
  ): ReportBucket[] =>
    rows.map((r) => ({ key: r._id ?? "—", label: labelFn(r._id), count: r.count }));

  return {
    articlesByStatus: toBuckets(
      aStatus,
      (k) => contentStatusLabels[k as ContentStatus] ?? "غير محدد",
    ),
    articlesByCategory: toBuckets(
      aCategory,
      (k) => categoryLabels[k as ArticleCategory] ?? "غير محدد",
    ),
    articlesByBranch: toBuckets(aBranch, (k) =>
      k ? (branchName[k] ?? k) : "بدون فرع",
    ),
    articlesByDepartment: toBuckets(
      aDept.filter((r) => r._id),
      (k) => (k ? (deptName[k] ?? k) : "غير محدد"),
    ),
    complaintsByStatus: toBuckets(
      cStatus,
      (k) => complaintStatusLabels[k as ComplaintStatus] ?? "غير محدد",
    ),
    complaintsByBranch: toBuckets(cBranch, (k) =>
      k ? (branchName[k] ?? k) : "بدون فرع",
    ),
  };
}

/* ------------------------------ سجلّ العمليات ------------------------------ */

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const db = await getDb();
  const docs = await db
    .collection<Doc>(Collections.auditLogs)
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => mapDoc<AuditLog>(d));
}
