import type { Role, SessionUser } from "@/lib/types";

// ============================================================================
// نظام الصلاحيات (القسم 11 من الخطة)
// قدرات لكل دور + فحوص النطاق (الفرع / القسم / الملكية)
// ============================================================================

export type Capability =
  | "dashboard:view"
  | "content:create"
  | "content:editAny" // تعديل أي محتوى ضمن نطاقه
  | "content:editOwn" // تعديل محتواه فقط
  | "content:submit" // إرسال للمراجعة
  | "content:review" // قبول/رفض/نشر
  | "content:delete"
  | "announcements:manage"
  | "complaints:view"
  | "complaints:manage"
  | "branches:manage"
  | "departments:manage"
  | "users:manage"
  | "stats:view";

const CAPS: Record<Role, Capability[]> = {
  super_admin: [
    "dashboard:view",
    "content:create",
    "content:editAny",
    "content:submit",
    "content:review",
    "content:delete",
    "announcements:manage",
    "complaints:view",
    "complaints:manage",
    "branches:manage",
    "departments:manage",
    "users:manage",
    "stats:view",
  ],
  branch_admin: [
    "dashboard:view",
    "content:create",
    "content:editAny",
    "content:submit",
    "content:review",
    "content:delete",
    "announcements:manage",
    "complaints:view",
    "complaints:manage",
    "stats:view",
  ],
  department_admin: [
    "dashboard:view",
    "content:create",
    "content:editOwn",
    "content:submit",
    "complaints:view",
    "complaints:manage",
  ],
  editor: ["dashboard:view", "content:create", "content:editOwn", "content:submit"],
  reviewer: ["dashboard:view", "content:review", "complaints:view"],
};

export function can(
  user: Pick<SessionUser, "role">,
  capability: Capability,
): boolean {
  return CAPS[user.role]?.includes(capability) ?? false;
}

export const roleLabels: Record<Role, string> = {
  super_admin: "المدير العام",
  branch_admin: "مدير فرع",
  department_admin: "مسؤول قسم",
  editor: "محرر محتوى",
  reviewer: "مراجِع",
};

/* ----------------------------- نطاق المقالات ----------------------------- */

type ArticleScope = {
  branchId?: string;
  departmentId?: string;
  authorId?: string;
};

/** فلتر MongoDB لقصر قائمة المقالات على نطاق المستخدم */
export function articleScopeFilter(
  user: SessionUser,
): Record<string, unknown> {
  switch (user.role) {
    case "super_admin":
    case "reviewer":
      return {};
    case "branch_admin":
      return { $or: [{ branchId: user.branchId }, { branchId: { $exists: false } }] };
    case "department_admin":
      return { $or: [{ departmentId: user.departmentId }, { authorId: user.id }] };
    case "editor":
      return { authorId: user.id };
    default:
      return { _id: "__none__" };
  }
}

export function canEditArticle(user: SessionUser, article: ArticleScope): boolean {
  if (user.role === "super_admin") return true;
  if (can(user, "content:editAny")) {
    if (user.role === "branch_admin")
      return !article.branchId || article.branchId === user.branchId;
    return true;
  }
  if (can(user, "content:editOwn")) {
    if (user.role === "department_admin")
      return (
        article.departmentId === user.departmentId || article.authorId === user.id
      );
    return article.authorId === user.id;
  }
  return false;
}

export function canReviewArticle(
  user: SessionUser,
  article: ArticleScope,
): boolean {
  if (!can(user, "content:review")) return false;
  if (user.role === "branch_admin")
    return !article.branchId || article.branchId === user.branchId;
  return true; // reviewer / super_admin
}

/* ----------------------------- نطاق الشكاوى ----------------------------- */

/** فلتر MongoDB لقصر قائمة الشكاوى على نطاق المستخدم */
export function complaintScopeFilter(
  user: SessionUser,
): Record<string, unknown> {
  switch (user.role) {
    case "super_admin":
    case "reviewer":
      return {};
    case "branch_admin":
      return { branchId: user.branchId };
    case "department_admin":
      return { assignedDepartment: user.departmentId };
    default:
      return {};
  }
}
