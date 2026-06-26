import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAuditLogs } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { EmptyRow, PageTitle, Panel } from "@/components/dashboard/ui";

export const metadata = { title: "سجلّ العمليات" };

export default async function AuditLogPage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t, locale } = dashboard;
  if (user.role !== "super_admin") redirect("/dashboard");

  const logs = await getAuditLogs(100);

  return (
    <>
      <PageTitle
        title={t.audit.title}
        subtitle={t.audit.subtitle}
      />

      <Panel>
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">{t.audit.employee}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.audit.action}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.audit.details}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.audit.time}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {log.userName}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {log.details || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatDateTime(log.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyRow>{t.audit.empty}</EmptyRow>
        )}
      </Panel>
    </>
  );
}
