"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementForEdit,
  logAction,
  updateAnnouncement,
  type AnnouncementInput,
} from "@/lib/admin";
import type {
  AnnouncementType,
  Importance,
  SessionUser,
} from "@/lib/types";

export type FormState = { error?: string };

const TYPES: AnnouncementType[] = [
  "general",
  "maintenance",
  "outage",
  "warning",
  "urgent",
];
const IMPORTANCE: Importance[] = ["normal", "high", "urgent"];
const STATUSES = ["active", "draft", "expired"] as const;

function toIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function parseForm(formData: FormData, user: SessionUser): AnnouncementInput {
  const startsAt = toIso(String(formData.get("startsAt") ?? "")) ?? new Date().toISOString();
  const type = formData.get("type") as AnnouncementType;
  const importance = formData.get("importance") as Importance;
  const status = formData.get("status") as (typeof STATUSES)[number];

  // مدير الفرع مقيّد بفرعه
  const branchId =
    user.role === "branch_admin"
      ? user.branchId
      : String(formData.get("branchId") ?? "").trim() || undefined;

  return {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    type: TYPES.includes(type) ? type : "general",
    importance: IMPORTANCE.includes(importance) ? importance : "normal",
    branchId,
    startsAt,
    endsAt: toIso(String(formData.get("endsAt") ?? "")),
    status: STATUSES.includes(status) ? status : "active",
    pinned: formData.get("pinned") === "on",
  };
}

function validate(input: AnnouncementInput): string | null {
  if (input.title.length < 4) return "العنوان مطلوب (4 أحرف على الأقل).";
  if (input.body.length < 10) return "نص الإعلان مطلوب (10 أحرف على الأقل).";
  return null;
}

function revalidate(id?: string) {
  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/dashboard/announcements");
  if (id) revalidatePath(`/dashboard/announcements/${id}`);
}

export async function createAnnouncementAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!can(user, "announcements:manage"))
    return { error: "لا تملك صلاحية إدارة الإعلانات." };
  const input = parseForm(formData, user);
  const err = validate(input);
  if (err) return { error: err };
  const id = await createAnnouncement(input, user);
  await logAction(user, "إنشاء إعلان", id, input.title);
  revalidate(id);
  redirect("/dashboard/announcements");
}

export async function updateAnnouncementAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!can(user, "announcements:manage"))
    return { error: "لا تملك صلاحية إدارة الإعلانات." };
  const existing = await getAnnouncementForEdit(id);
  if (!existing) return { error: "الإعلان غير موجود." };
  if (user.role === "branch_admin" && existing.branchId !== user.branchId)
    return { error: "لا تملك صلاحية تعديل إعلان فرع آخر." };

  const input = parseForm(formData, user);
  const err = validate(input);
  if (err) return { error: err };
  await updateAnnouncement(id, input);
  await logAction(user, "تعديل إعلان", id, input.title);
  revalidate(id);
  redirect("/dashboard/announcements");
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!can(user, "announcements:manage")) return;
  const existing = await getAnnouncementForEdit(id);
  if (!existing) return;
  if (user.role === "branch_admin" && existing.branchId !== user.branchId) return;
  await deleteAnnouncement(id);
  await logAction(user, "حذف إعلان", id, existing.title);
  revalidate();
  redirect("/dashboard/announcements");
}
