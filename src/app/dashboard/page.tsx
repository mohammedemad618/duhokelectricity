import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  FileEdit,
  Megaphone,
  MessageSquare,
  Newspaper,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  getDashboardStats,
  getRecentArticlesForUser,
  getRecentComplaintsForUser,
} from "@/lib/admin";
import {
  complaintStatusClass,
  contentStatusClass,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import {
  EmptyRow,
  Panel,
  StatCard,
  StatusBadge,
  PageTitle,
} from "@/components/dashboard/ui";

export default async function DashboardHome() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t, locale } = dashboard;
  const stats = await getDashboardStats(user);

  const showContent = can(user, "content:create") || can(user, "content:review");
  const showComplaints = can(user, "complaints:view");

  const [recentArticles, recentComplaints] = await Promise.all([
    showContent ? getRecentArticlesForUser(user, 5) : Promise.resolve([]),
    showComplaints ? getRecentComplaintsForUser(user, 5) : Promise.resolve([]),
  ]);

  return (
    <>
      <PageTitle
        title={t.home.welcome.replace("{name}", user.name)}
        subtitle={t.home.subtitle}
      />

      {/* بطاقات الإحصائيات */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {showContent && (
          <>
            <StatCard label={t.home.publishedNews} value={stats.articles.published} Icon={Newspaper} tone="emerald" href="/dashboard/news?status=published" />
            <StatCard label={t.home.inReview} value={stats.articles.review} Icon={FileEdit} tone="amber" href="/dashboard/news?status=review" />
            <StatCard label={t.home.drafts} value={stats.articles.draft} Icon={ClipboardList} tone="slate" href="/dashboard/news?status=draft" />
          </>
        )}
        {showComplaints && (
          <StatCard label={t.home.newComplaints} value={stats.complaints.new} Icon={MessageSquare} tone="blue" href="/dashboard/complaints?status=new" />
        )}
        {can(user, "announcements:manage") && (
          <StatCard label={t.home.activeAnnouncements} value={stats.announcements.active} Icon={Megaphone} tone="violet" href="/dashboard/announcements" />
        )}
        {can(user, "users:manage") && (
          <StatCard label={t.home.users} value={stats.users} Icon={Users} tone="brand" href="/dashboard/users" />
        )}
        {can(user, "complaints:view") && (
          <StatCard label={t.home.completedComplaints} value={stats.complaints.completed} Icon={CheckCircle2} tone="emerald" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* أحدث المحتوى */}
        {showContent && (
          <Panel
            title={t.home.recentContent}
            action={
              <Link href="/dashboard/news" className="text-sm font-semibold text-brand-600 hover:text-brand-800">
                {t.common.viewAll}
              </Link>
            }
          >
            {recentArticles.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentArticles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/dashboard/news/${a.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-700">
                          {a.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(a.createdAt, locale)}
                        </span>
                      </span>
                      <StatusBadge
                        label={t.labels.contentStatus[a.status]}
                        className={contentStatusClass[a.status]}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow>{t.home.noContent}</EmptyRow>
            )}
          </Panel>
        )}

        {/* أحدث الشكاوى */}
        {showComplaints && (
          <Panel
            title={t.home.recentComplaints}
            action={
              <Link href="/dashboard/complaints" className="text-sm font-semibold text-brand-600 hover:text-brand-800">
                {t.common.viewAll}
              </Link>
            }
          >
            {recentComplaints.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentComplaints.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/complaints/${c.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-700">
                          {c.subject}
                        </span>
                        <span className="text-xs text-slate-400">
                          {t.labels.complaintKind[c.kind]} · {formatDate(c.createdAt, locale)}
                        </span>
                      </span>
                      <StatusBadge
                        label={t.labels.complaintStatus[c.status]}
                        className={complaintStatusClass[c.status]}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow>{t.home.noComplaints}</EmptyRow>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}
