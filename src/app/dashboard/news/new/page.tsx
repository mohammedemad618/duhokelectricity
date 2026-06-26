import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getBranches, getDepartments } from "@/lib/data";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { ArticleForm } from "@/components/dashboard/article-form";
import { PageTitle, Panel } from "@/components/dashboard/ui";
import { createArticleAction } from "../actions";

export default async function NewArticlePage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t } = dashboard;
  if (!can(user, "content:create")) redirect("/dashboard/news");

  const [branches, departments] = await Promise.all([
    getBranches(),
    getDepartments(),
  ]);

  return (
    <>
      <Link
        href="/dashboard/news"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronRight className="size-4" />
        {t.common.backToList}
      </Link>
      <PageTitle title={t.news.newTitle} subtitle={t.news.newSubtitle} />
      <Panel className="p-6">
        <ArticleForm
          action={createArticleAction}
          branches={branches}
          departments={departments}
          canChooseBranch={user.role === "super_admin"}
          canChooseDepartment={user.role === "super_admin" || user.role === "branch_admin"}
          dictionary={t}
          submitLabel={t.news.createDraft}
        />
      </Panel>
    </>
  );
}
