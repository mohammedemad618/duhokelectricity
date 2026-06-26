import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listUsers } from "@/lib/admin";
import { getBranchNameMap, getDepartments } from "@/lib/data";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { EmptyRow, PageTitle, Panel, StatusBadge } from "@/components/dashboard/ui";

export default async function UsersManagementPage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t } = dashboard;
  if (!can(user, "users:manage")) redirect("/dashboard");

  const [users, branchMap, departments] = await Promise.all([
    listUsers(),
    getBranchNameMap(),
    getDepartments(),
  ]);
  const depMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  return (
    <>
      <PageTitle
        title={t.users.title}
        subtitle={t.users.subtitle}
        action={
          <Link
            href="/dashboard/users/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Plus className="size-4" />
            {t.users.add}
          </Link>
        }
      />

      <Panel>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.name}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.username}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.role}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.branchDepartment}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/users/${u.id}`}
                        className="font-semibold text-slate-700 hover:text-brand-700"
                      >
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500" dir="ltr">
                      <span className="block text-start">{u.username}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.labels.roles[u.role]}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {[u.branchId && branchMap[u.branchId], u.departmentId && depMap[u.departmentId]]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={t.labels.accountStatus[u.status]}
                        className={
                          u.status === "active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-slate-100 text-slate-500 ring-slate-200"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyRow>{t.users.empty}</EmptyRow>
        )}
      </Panel>
    </>
  );
}
