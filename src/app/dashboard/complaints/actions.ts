"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getComplaintById, logAction, updateComplaint } from "@/lib/admin";
import type {
  ComplaintStatus,
  DepartmentType,
  SessionUser,
  Complaint,
} from "@/lib/types";

export type FormState = { error?: string };

const STATUSES: ComplaintStatus[] = [
  "new",
  "review",
  "assigned",
  "processing",
  "completed",
  "rejected",
  "closed",
];
const DEPARTMENTS: DepartmentType[] = [
  "construction",
  "projects",
  "planning",
  "services",
];

function inScope(user: SessionUser, complaint: Complaint): boolean {
  if (user.role === "super_admin" || user.role === "reviewer") return true;
  if (user.role === "branch_admin") return complaint.branchId === user.branchId;
  if (user.role === "department_admin")
    return complaint.assignedDepartment === user.departmentId;
  return false;
}

export async function updateComplaintAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!can(user, "complaints:manage"))
    return { error: "لا تملك صلاحية إدارة الشكاوى." };

  const complaint = await getComplaintById(id);
  if (!complaint) return { error: "الشكوى غير موجودة." };
  if (!inScope(user, complaint))
    return { error: "لا تملك صلاحية على هذه الشكوى." };

  const status = formData.get("status") as ComplaintStatus;
  const note = String(formData.get("note") ?? "").trim();
  const assignRaw = String(formData.get("assignedDepartment") ?? "").trim();

  const update: {
    status?: ComplaintStatus;
    assignedDepartment?: DepartmentType;
    note?: string;
  } = { note };

  if (STATUSES.includes(status)) update.status = status;

  // الإحالة إلى قسم متاحة للمدير العام ومدير الفرع فقط
  if (
    (user.role === "super_admin" || user.role === "branch_admin") &&
    DEPARTMENTS.includes(assignRaw as DepartmentType)
  ) {
    update.assignedDepartment = assignRaw as DepartmentType;
    if (update.status === "new") update.status = "assigned";
  }

  await updateComplaint(id, update);
  await logAction(user, "تحديث شكوى", id, update.status);
  revalidatePath("/dashboard/complaints");
  revalidatePath(`/dashboard/complaints/${id}`);
  redirect(`/dashboard/complaints/${id}?saved=1`);
}
