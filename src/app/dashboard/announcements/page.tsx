import Link from "next/link";
import { redirect } from "next/navigation";
import { Pin, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listAnnouncements } from "@/lib/admin";
import { getBranchNameMap } from "@/lib/data";
import {
  announcementTypeClass,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { EmptyRow, PageTitle, Panel, StatusBadge } from "@/components/dashboard/ui";

export default async function AnnouncementsManagementPage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t, locale } = dashboard;
  if (!can(user, "announcements:manage")) redirect("/dashboard");

  const [all, branchMap] = await Promise.all([
    listAnnouncements(),
    getBranchNameMap(),
  ]);
  const items =
    user.role === "branch_admin"
      ? all.filter((a) => !a.branchId || a.branchId === user.branchId)
      : all;

  return (
    <>
      <PageTitle
        title={t.announcements.title}
        subtitle={t.announcements.subtitle}
        action={
          <Link
            href="/dashboard/announcements/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Plus className="size-4" />
            {t.announcements.add}
          </Link>
        }
      />

      <Panel>
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.title}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.type}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.importance}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.status}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((a) => (
                  <tr key={a.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/announcements/${a.id}`}
                        className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-brand-700"
                      >
                        {a.pinned && <Pin className="size-3.5 text-accent-500" />}
                        {a.title}
                      </Link>
                      <span className="text-xs text-slate-400">
                        {a.branchId ? branchMap[a.branchId] : t.common.general}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={t.labels.announcementTypes[a.type]}
                        className={announcementTypeClass[a.type]}
                      />
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.labels.importance[a.importance]}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.labels.announcementStatus[a.status]}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatDate(a.startsAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyRow>{t.announcements.empty}</EmptyRow>
        )}
      </Panel>
    </>
  );
}
