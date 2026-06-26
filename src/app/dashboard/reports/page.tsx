import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Megaphone,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getDashboardStats, getReportData } from "@/lib/admin";
import type { ArticleCategory, ComplaintStatus, ContentStatus } from "@/lib/types";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { BarList, PageTitle, Panel, StatCard } from "@/components/dashboard/ui";
import { PrintButton } from "@/components/dashboard/print-button";

export const metadata = { title: "التقارير والإحصائيات" };

export default async function ReportsPage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t } = dashboard;
  if (!can(user, "stats:view")) redirect("/dashboard");

  const [stats, report] = await Promise.all([
    getDashboardStats(user),
    getReportData(user),
  ]);
  const relabel = (
    items: { key: string; label: string; count: number }[],
    labels: Record<string, string>,
  ) =>
    items.map((item) => ({
      ...item,
      label: labels[item.key] ?? item.label,
    }));
  const noBranchLabels = { "—": t.common.noBranch };
  const articlesByStatus = relabel(
    report.articlesByStatus,
    t.labels.contentStatus as Record<ContentStatus | string, string>,
  );
  const articlesByCategory = relabel(
    report.articlesByCategory,
    t.labels.categories as Record<ArticleCategory | string, string>,
  );
  const complaintsByStatus = relabel(
    report.complaintsByStatus,
    t.labels.complaintStatus as Record<ComplaintStatus | string, string>,
  );

  return (
    <>
      <PageTitle
        title={t.reports.title}
        subtitle={t.reports.subtitle}
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <a
              href="/api/admin/export?type=articles"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="size-4" />
              {t.reports.exportNews}
            </a>
            <a
              href="/api/admin/export?type=complaints"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="size-4" />
              {t.reports.exportComplaints}
            </a>
            <PrintButton label={t.reports.print} />
          </div>
        }
      />

      {/* ملخّص */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t.reports.totalNews} value={stats.articles.total} Icon={Newspaper} tone="brand" />
        <StatCard label={t.reports.published} value={stats.articles.published} Icon={CheckCircle2} tone="emerald" />
        <StatCard label={t.reports.activeAnnouncements} value={stats.announcements.active} Icon={Megaphone} tone="violet" />
        <StatCard label={t.reports.totalComplaints} value={stats.complaints.total} Icon={MessageSquare} tone="blue" />
      </div>

      {/* التقارير */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t.reports.newsByStatus}>
          <BarList items={articlesByStatus} tone="brand" emptyLabel={t.common.noData} />
        </Panel>
        <Panel title={t.reports.newsByCategory}>
          <BarList items={articlesByCategory} tone="emerald" emptyLabel={t.common.noData} />
        </Panel>
        <Panel title={t.reports.newsByBranch}>
          <BarList items={relabel(report.articlesByBranch, noBranchLabels)} tone="brand" emptyLabel={t.common.noData} />
        </Panel>
        <Panel title={t.reports.mostActiveDepartments}>
          <BarList items={report.articlesByDepartment} tone="amber" emptyLabel={t.common.noData} />
        </Panel>
        <Panel title={t.reports.complaintsByStatus}>
          <BarList items={complaintsByStatus} tone="blue" emptyLabel={t.common.noData} />
        </Panel>
        <Panel title={t.reports.complaintsByBranch}>
          <BarList items={relabel(report.complaintsByBranch, noBranchLabels)} tone="violet" emptyLabel={t.common.noData} />
        </Panel>
      </div>
    </>
  );
}
