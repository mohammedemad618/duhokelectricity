import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComplaintStatus } from "@/lib/types";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listComplaintsForUser } from "@/lib/admin";
import { getBranchNameMap } from "@/lib/data";
import {
  complaintStatusClass,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { FilterChips } from "@/components/ui";
import { EmptyRow, PageTitle, Panel, StatusBadge } from "@/components/dashboard/ui";

const STATUSES: ComplaintStatus[] = [
  "new",
  "review",
  "assigned",
  "processing",
  "completed",
  "rejected",
  "closed",
];

export default async function ComplaintsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t, locale } = dashboard;
  if (!can(user, "complaints:view")) redirect("/dashboard");

  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as ComplaintStatus)
    ? (sp.status as ComplaintStatus)
    : undefined;

  const [items, branchMap] = await Promise.all([
    listComplaintsForUser(user, { status }),
    getBranchNameMap(),
  ]);

  const chips = [
    { label: t.common.all, href: "/dashboard/complaints", active: !status },
    ...STATUSES.map((s) => ({
      label: t.labels.complaintStatus[s],
      href: `/dashboard/complaints?status=${s}`,
      active: status === s,
    })),
  ];

  return (
    <>
      <PageTitle
        title={t.complaints.title}
        subtitle={t.complaints.subtitle}
      />

      <div className="mb-5">
        <FilterChips options={chips} />
      </div>

      <Panel>
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.subject}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.type}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.area}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.branch}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.status}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((c) => (
                  <tr key={c.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/complaints/${c.id}`}
                        className="font-semibold text-slate-700 hover:text-brand-700"
                      >
                        {c.subject}
                      </Link>
                      <span className="block text-xs text-slate-400">
                        {c.fullName}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.labels.complaintKind[c.kind]}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{c.area}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {c.branchId ? branchMap[c.branchId] : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={t.labels.complaintStatus[c.status]}
                        className={complaintStatusClass[c.status]}
                      />
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatDate(c.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyRow>{t.complaints.empty}</EmptyRow>
        )}
      </Panel>
    </>
  );
}
