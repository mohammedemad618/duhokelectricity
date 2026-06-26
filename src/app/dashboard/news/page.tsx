import Link from "next/link";
import { Plus } from "lucide-react";
import type { ContentStatus } from "@/lib/types";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listArticlesForUser } from "@/lib/admin";
import { getBranchNameMap } from "@/lib/data";
import {
  contentStatusClass,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { FilterChips } from "@/components/ui";
import { EmptyRow, PageTitle, Panel, StatusBadge } from "@/components/dashboard/ui";

const STATUSES: ContentStatus[] = [
  "draft",
  "review",
  "published",
  "rejected",
  "archived",
];

export default async function NewsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t, locale } = dashboard;
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as ContentStatus)
    ? (sp.status as ContentStatus)
    : undefined;

  const [articles, branchMap] = await Promise.all([
    listArticlesForUser(user, { status }),
    getBranchNameMap(),
  ]);

  const chips = [
    { label: t.common.all, href: "/dashboard/news", active: !status },
    ...STATUSES.map((s) => ({
      label: t.labels.contentStatus[s],
      href: `/dashboard/news?status=${s}`,
      active: status === s,
    })),
  ];

  return (
    <>
      <PageTitle
        title={t.news.title}
        subtitle={t.news.subtitle}
        action={
          can(user, "content:create") ? (
            <Link
              href="/dashboard/news/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <Plus className="size-4" />
              {t.news.add}
            </Link>
          ) : undefined
        }
      />

      <div className="mb-5">
        <FilterChips options={chips} />
      </div>

      <Panel>
        {articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.title}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.category}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.branch}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.status}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t.table.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((a) => (
                  <tr key={a.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/news/${a.id}`}
                        className="font-semibold text-slate-700 hover:text-brand-700"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.labels.categories[a.category]}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {a.branchId ? branchMap[a.branchId] : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={t.labels.contentStatus[a.status]}
                        className={contentStatusClass[a.status]}
                      />
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatDate(a.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyRow>{t.news.empty}</EmptyRow>
        )}
      </Panel>
    </>
  );
}
