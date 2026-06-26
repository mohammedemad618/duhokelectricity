"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, hashPassword } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  createUser,
  deleteUser,
  getUserById,
  logAction,
  updateUser,
  usernameExists,
  type UserInput,
} from "@/lib/admin";
import type { DepartmentType, Role } from "@/lib/types";

export type FormState = { error?: string };

const ROLES: Role[] = [
  "super_admin",
  "branch_admin",
  "department_admin",
  "editor",
  "reviewer",
];
const DEPARTMENTS: DepartmentType[] = [
  "construction",
  "projects",
  "planning",
  "services",
];

function parse(formData: FormData): UserInput & { password: string } {
  const role = formData.get("role") as Role;
  const dep = String(formData.get("departmentId") ?? "").trim();
  return {
    name: String(formData.get("name") ?? "").trim(),
    username: String(formData.get("username") ?? "").trim().toLowerCase(),
    role: ROLES.includes(role) ? role : "editor",
    branchId: String(formData.get("branchId") ?? "").trim() || undefined,
    departmentId: DEPARTMENTS.includes(dep as DepartmentType)
      ? (dep as DepartmentType)
      : undefined,
    status: formData.get("status") === "disabled" ? "disabled" : "active",
    password: String(formData.get("password") ?? ""),
  };
}

function validate(
  input: UserInput,
  password: string,
  isNew: boolean,
): string | null {
  if (input.name.length < 2) return "الاسم مطلوب.";
  if (!/^[a-z0-9_.-]{3,30}$/.test(input.username))
    return "اسم المستخدم يجب أن يكون 3 أحرف لاتينية/أرقام على الأقل (بدون مسافات).";
  if (isNew && password.length < 6)
    return "كلمة المرور مطلوبة (6 أحرف على الأقل).";
  if (!isNew && password && password.length < 6)
    return "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.";
  if (input.role === "branch_admin" && !input.branchId)
    return "مدير الفرع يجب أن يُربط بفرع.";
  if (input.role === "department_admin" && (!input.branchId || !input.departmentId))
    return "مسؤول القسم يجب أن يُربط بفرع وقسم.";
  return null;
}

export async function createUserAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireUser();
  if (!can(actor, "users:manage")) return { error: "لا تملك صلاحية." };

  const { password, ...input } = parse(formData);
  const err = validate(input, password, true);
  if (err) return { error: err };
  if (await usernameExists(input.username))
    return { error: "اسم المستخدم مستخدم بالفعل." };

  const id = await createUser(input, hashPassword(password));
  await logAction(actor, "إنشاء مستخدم", id, input.username);
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function updateUserAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireUser();
  if (!can(actor, "users:manage")) return { error: "لا تملك صلاحية." };

  const existing = await getUserById(id);
  if (!existing) return { error: "المستخدم غير موجود." };

  const { password, ...input } = parse(formData);
  const err = validate(input, password, false);
  if (err) return { error: err };
  if (await usernameExists(input.username, id))
    return { error: "اسم المستخدم مستخدم بالفعل." };

  await updateUser(id, input, password ? hashPassword(password) : undefined);
  await logAction(actor, "تعديل مستخدم", id, input.username);
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteUserAction(id: string): Promise<void> {
  const actor = await requireUser();
  if (!can(actor, "users:manage")) return;
  if (id === actor.id) return; // لا يمكن حذف الحساب الحالي
  const existing = await getUserById(id);
  if (!existing) return;
  await deleteUser(id);
  await logAction(actor, "حذف مستخدم", id, existing.username);
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}
