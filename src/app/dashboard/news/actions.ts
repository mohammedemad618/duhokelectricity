"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { can, canEditArticle, canReviewArticle } from "@/lib/permissions";
import {
  createArticle,
  deleteArticle,
  getArticleForEdit,
  logAction,
  setArticleStatus,
  updateArticle,
  type ArticleInput,
} from "@/lib/admin";
import type { ArticleCategory, DepartmentType, SessionUser } from "@/lib/types";

export type FormState = { error?: string };

const CATEGORIES: ArticleCategory[] = [
  "news",
  "construction",
  "projects",
  "planning",
];

function parseForm(formData: FormData): ArticleInput {
  const tags = String(formData.get("tags") ?? "")
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const imageCount = Number(formData.get("imageCount") ?? 0);
  return {
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    category: (CATEGORIES.includes(formData.get("category") as ArticleCategory)
      ? formData.get("category")
      : "news") as ArticleCategory,
    branchId: String(formData.get("branchId") ?? "").trim() || undefined,
    departmentId:
      (String(formData.get("departmentId") ?? "").trim() || undefined) as
        | DepartmentType
        | undefined,
    location: String(formData.get("location") ?? "").trim() || undefined,
    tags: tags.length ? tags : undefined,
    imageCount: Number.isFinite(imageCount) && imageCount > 0 ? imageCount : undefined,
  };
}

/** يفرض نطاق الفرع/القسم على الأدوار المقيّدة */
function applyScope(input: ArticleInput, user: SessionUser): ArticleInput {
  const out = { ...input };
  if (user.role === "branch_admin" || user.role === "editor") {
    out.branchId = user.branchId;
  }
  if (user.role === "department_admin") {
    out.branchId = user.branchId;
    out.departmentId = user.departmentId;
  }
  return out;
}

function validate(input: ArticleInput): string | null {
  if (input.title.length < 4) return "العنوان مطلوب (4 أحرف على الأقل).";
  if (input.excerpt.length < 10) return "الوصف المختصر مطلوب (10 أحرف على الأقل).";
  if (input.content.length < 20) return "المحتوى مطلوب (20 حرفاً على الأقل).";
  return null;
}

const PUBLIC_PATHS = ["/", "/news"];
function revalidatePublic(id?: string) {
  for (const p of PUBLIC_PATHS) revalidatePath(p);
  if (id) revalidatePath(`/news/${id}`);
  revalidatePath("/dashboard/news");
}

/* ------------------------------ إنشاء/تعديل ------------------------------ */

export async function createArticleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!can(user, "content:create")) return { error: "لا تملك صلاحية الإضافة." };

  const input = applyScope(parseForm(formData), user);
  const err = validate(input);
  if (err) return { error: err };

  const id = await createArticle(input, user);
  await logAction(user, "إنشاء محتوى", id, input.title);
  revalidatePublic(id);
  redirect(`/dashboard/news/${id}`);
}

export async function updateArticleAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const article = await getArticleForEdit(id);
  if (!article) return { error: "المحتوى غير موجود." };
  if (!canEditArticle(user, article)) return { error: "لا تملك صلاحية التعديل." };

  const input = applyScope(parseForm(formData), user);
  const err = validate(input);
  if (err) return { error: err };

  await updateArticle(id, input);
  await logAction(user, "تعديل محتوى", id, input.title);
  revalidatePublic(id);
  redirect(`/dashboard/news/${id}?saved=1`);
}

/* ------------------------------ سير العمل ------------------------------ */

async function loadForWorkflow(id: string) {
  const user = await requireUser();
  const article = await getArticleForEdit(id);
  return { user, article };
}

export async function submitForReviewAction(id: string): Promise<void> {
  const { user, article } = await loadForWorkflow(id);
  if (!article || !canEditArticle(user, article) || !can(user, "content:submit"))
    return;
  if (!["draft", "rejected"].includes(article.status)) return;
  await setArticleStatus(id, "review");
  await logAction(user, "إرسال للمراجعة", id, article.title);
  revalidatePublic(id);
  redirect(`/dashboard/news/${id}`);
}

export async function publishArticleAction(id: string): Promise<void> {
  const { user, article } = await loadForWorkflow(id);
  if (!article || !canReviewArticle(user, article)) return;
  await setArticleStatus(id, "published");
  await logAction(user, "نشر محتوى", id, article.title);
  revalidatePublic(id);
  redirect(`/dashboard/news/${id}`);
}

export async function rejectArticleAction(
  id: string,
  formData: FormData,
): Promise<void> {
  const { user, article } = await loadForWorkflow(id);
  if (!article || !canReviewArticle(user, article)) return;
  if (article.status !== "review") return;
  const note = String(formData.get("note") ?? "").trim();
  await setArticleStatus(id, "rejected", { reviewNote: note });
  await logAction(user, "رفض محتوى", id, note);
  revalidatePublic(id);
  redirect(`/dashboard/news/${id}`);
}

export async function archiveArticleAction(id: string): Promise<void> {
  const { user, article } = await loadForWorkflow(id);
  if (!article || !canReviewArticle(user, article)) return;
  await setArticleStatus(id, "archived");
  await logAction(user, "أرشفة محتوى", id, article.title);
  revalidatePublic(id);
  redirect(`/dashboard/news/${id}`);
}

export async function deleteArticleAction(id: string): Promise<void> {
  const { user, article } = await loadForWorkflow(id);
  if (!article || !can(user, "content:delete") || !canEditArticle(user, article))
    return;
  await deleteArticle(id);
  await logAction(user, "حذف محتوى", id, article.title);
  revalidatePublic(id);
  redirect("/dashboard/news");
}
