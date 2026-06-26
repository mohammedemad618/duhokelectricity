import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  MapPin,
  Paperclip,
  PhoneCall,
  User,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getComplaintById } from "@/lib/admin";
import { getBranchById, getDepartments } from "@/lib/data";
import {
  complaintStatusClass,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { PageTitle, Panel, StatusBadge } from "@/components/dashboard/ui";
import { ComplaintManageForm } from "@/components/dashboard/complaint-manage-form";
import { updateComplaintAction } from "../actions";

export default async function ComplaintDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t, locale } = dashboard;
  if (!can(user, "complaints:view")) redirect("/dashboard");

  const complaint = await getComplaintById(id);
  if (!complaint) notFound();

  // فحص النطاق للعرض
  const inScope =
    user.role === "super_admin" ||
    user.role === "reviewer" ||
    (user.role === "branch_admin" && complaint.branchId === user.branchId) ||
    (user.role === "department_admin" &&
      complaint.assignedDepartment === user.departmentId);
  if (!inScope) redirect("/dashboard/complaints");

  const [branch, departments] = await Promise.all([
    complaint.branchId ? getBranchById(complaint.branchId) : Promise.resolve(undefined),
    getDepartments(),
  ]);

  const manageable = can(user, "complaints:manage");
  const updateAction = updateComplaintAction.bind(null, id);

  const rows = [
    { Icon: User, label: t.complaints.submitter, value: complaint.fullName },
    { Icon: PhoneCall, label: t.complaints.phone, value: complaint.phone, ltr: true },
    { Icon: MapPin, label: t.complaints.area, value: complaint.area },
    { Icon: MapPin, label: t.complaints.branch, value: branch?.name ?? "—" },
  ];

  return (
    <>
      <Link
        href="/dashboard/complaints"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronRight className="size-4" />
        {t.common.backToList}
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <PageTitle title={complaint.subject} />
        <StatusBadge
          label={t.labels.complaintStatus[complaint.status]}
          className={complaintStatusClass[complaint.status]}
        />
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-5" />
          {t.complaints.updated}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* تفاصيل الشكوى */}
        <div className="space-y-6 lg:col-span-2">
          <Panel title={t.complaints.details} className="p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {t.labels.complaintKind[complaint.kind]}
            </div>
            <p className="whitespace-pre-wrap leading-8 text-slate-700">
              {complaint.description}
            </p>
            {complaint.attachmentName && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Paperclip className="size-4" />
                {t.complaints.attachment} {complaint.attachmentName}
              </div>
            )}
            {complaint.note && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <strong className="block text-sm text-slate-600">
                  {t.complaints.staffNote}
                </strong>
                <p className="mt-1 text-sm text-slate-600">{complaint.note}</p>
              </div>
            )}
          </Panel>

          <Panel title={t.complaints.submitterInfo} className="p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              {rows.map(({ Icon, label, value, ltr }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-brand-500" />
                  <div>
                    <dt className="text-xs text-slate-400">{label}</dt>
                    <dd className="font-medium text-slate-700" dir={ltr ? "ltr" : undefined}>
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              {t.complaints.sentAt.replace("{date}", formatDate(complaint.createdAt, locale))}
              {complaint.closedAt && <> · {t.complaints.closedAt.replace("{date}", formatDate(complaint.closedAt, locale))}</>}
            </p>
          </Panel>
        </div>

        {/* إدارة الشكوى */}
        <aside>
          {manageable ? (
            <Panel title={t.complaints.manage} className="p-5">
              <ComplaintManageForm
                action={updateAction}
                complaint={complaint}
                departments={departments.filter((d) => d.type !== "services")}
                canAssign={user.role === "super_admin" || user.role === "branch_admin"}
                dictionary={t}
              />
            </Panel>
          ) : (
            <Panel className="p-5 text-sm text-slate-500">
              {t.complaints.readOnly}
            </Panel>
          )}
        </aside>
      </div>
    </>
  );
}
