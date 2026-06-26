// ============================================================================
// طبقة الوصول إلى البيانات (Data Access Layer) — مدعومة بـ MongoDB
// ----------------------------------------------------------------------------
// نفس الواجهة غير المتزامنة السابقة، لكنها الآن تقرأ من قاعدة MongoDB.
// الصفحات والمكوّنات التي تستهلك هذه الدوال لم تتغيّر.
// ملاحظة: المعرّف يُخزَّن في MongoDB كـ _id (نص)، ويُحوَّل هنا إلى id.
// ============================================================================

import type {
  Article,
  ArticleCategory,
  Announcement,
  Branch,
  Department,
  DepartmentType,
  FaqItem,
} from "@/lib/types";
import { getDb, Collections } from "@/lib/db";

/* ----------------------------- أدوات مساعدة ----------------------------- */

type Doc = { _id: string } & Record<string, unknown>;

function mapDoc<T>(doc: Doc): T {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest } as T;
}

async function find<T>(
  name: string,
  filter: Record<string, unknown> = {},
  options: { sort?: Record<string, 1 | -1>; limit?: number } = {},
): Promise<T[]> {
  const db = await getDb();
  let cursor = db.collection<Doc>(name).find(filter);
  if (options.sort) cursor = cursor.sort(options.sort);
  if (options.limit) cursor = cursor.limit(options.limit);
  const docs = await cursor.toArray();
  return docs.map((d) => mapDoc<T>(d));
}

async function findOne<T>(
  name: string,
  filter: Record<string, unknown>,
): Promise<T | undefined> {
  const db = await getDb();
  const doc = await db.collection<Doc>(name).findOne(filter);
  return doc ? mapDoc<T>(doc) : undefined;
}

/* -------------------------------- الفروع -------------------------------- */

export async function getBranches(): Promise<Branch[]> {
  return find<Branch>(Collections.branches, { status: "active" });
}

export async function getBranchById(id: string): Promise<Branch | undefined> {
  return findOne<Branch>(Collections.branches, { _id: id });
}

export async function getBranchNameMap(): Promise<Record<string, string>> {
  const all = await find<Branch>(Collections.branches);
  return Object.fromEntries(all.map((b) => [b.id, b.shortName ?? b.name]));
}

/* -------------------------------- الأقسام -------------------------------- */

export async function getDepartments(): Promise<Department[]> {
  return find<Department>(Collections.departments);
}

export async function getDepartmentById(
  id: string,
): Promise<Department | undefined> {
  return findOne<Department>(Collections.departments, { _id: id });
}

/* ------------------------------- المقالات ------------------------------- */

interface ArticleQuery {
  category?: ArticleCategory;
  branchId?: string;
  departmentId?: DepartmentType;
  limit?: number;
  excludeId?: string;
}

export async function getArticles(query: ArticleQuery = {}): Promise<Article[]> {
  const filter: Record<string, unknown> = { status: "published" };
  if (query.category) filter.category = query.category;
  if (query.branchId) filter.branchId = query.branchId;
  if (query.departmentId) filter.departmentId = query.departmentId;
  if (query.excludeId) filter._id = { $ne: query.excludeId };

  return find<Article>(Collections.articles, filter, {
    sort: { publishedAt: -1 },
    limit: query.limit,
  });
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  return findOne<Article>(Collections.articles, {
    _id: id,
    status: "published",
  });
}

export async function getLatestNews(limit = 6): Promise<Article[]> {
  return getArticles({ category: "news", limit });
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  return find<Article>(
    Collections.articles,
    { status: "published" },
    { sort: { publishedAt: -1 }, limit },
  );
}

export async function getRelatedArticles(
  article: Article,
  limit = 3,
): Promise<Article[]> {
  return getArticles({
    category: article.category,
    excludeId: article.id,
    limit,
  });
}

/* ------------------------------ الإعلانات ------------------------------- */

interface AnnouncementQuery {
  activeOnly?: boolean;
  branchId?: string;
}

const importanceWeight = { urgent: 0, high: 1, normal: 2 } as const;

function sortAnnouncements(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    const w = importanceWeight[a.importance] - importanceWeight[b.importance];
    if (w !== 0) return w;
    return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
  });
}

export async function getAnnouncements(
  query: AnnouncementQuery = {},
): Promise<Announcement[]> {
  const filter: Record<string, unknown> = {};
  if (query.activeOnly) filter.status = "active";
  if (query.branchId) {
    filter.$or = [
      { branchId: { $exists: false } },
      { branchId: null },
      { branchId: query.branchId },
    ];
  }
  const list = await find<Announcement>(Collections.announcements, filter);
  return sortAnnouncements(list);
}

export async function getAnnouncementById(
  id: string,
): Promise<Announcement | undefined> {
  return findOne<Announcement>(Collections.announcements, { _id: id });
}

export async function getTickerAnnouncements(): Promise<Announcement[]> {
  const active = await getAnnouncements({ activeOnly: true });
  const pinned = active.filter((a) => a.pinned || a.importance !== "normal");
  return pinned.length > 0 ? pinned : active;
}

/* --------------------------- الأسئلة الشائعة --------------------------- */

export async function getFaqItems(): Promise<FaqItem[]> {
  return find<FaqItem>(Collections.faq);
}
