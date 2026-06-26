import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import type { ArticleCategory } from "@/lib/types";
import { getArticles, getBranchNameMap, getBranches } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import {
  Container,
  EmptyState,
  FilterChips,
  PageHeader,
} from "@/components/ui";
import { ArticleCard } from "@/components/article-card";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.news.title, description: dict.news.description };
}

const categoryKeys: ArticleCategory[] = [
  "news",
  "construction",
  "projects",
  "planning",
];

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `/news?${qs}` : "/news";
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; branch?: string }>;
}) {
  const sp = await searchParams;
  const category = categoryKeys.includes(sp.category as ArticleCategory)
    ? (sp.category as ArticleCategory)
    : undefined;

  const [branches, branchMap, dict] = await Promise.all([
    getBranches(),
    getBranchNameMap(),
    getDictionary(),
  ]);
  const branch = branches.some((b) => b.id === sp.branch) ? sp.branch : undefined;

  const articles = await getArticles({ category, branchId: branch });

  const categoryOptions = [
    { label: dict.common.all, href: buildHref({ branch }), active: !category },
    ...categoryKeys.map((c) => ({
      label: dict.categories[c],
      href: buildHref({ category: c, branch }),
      active: category === c,
    })),
  ];

  const branchOptions = [
    { label: dict.news.allBranches, href: buildHref({ category }), active: !branch },
    ...branches.map((b) => ({
      label: b.shortName ?? b.name,
      href: buildHref({ category, branch: b.id }),
      active: branch === b.id,
    })),
  ];

  return (
    <>
      <PageHeader
        title={dict.news.title}
        description={dict.news.description}
        breadcrumbs={[{ label: dict.nav.home, href: "/" }, { label: dict.nav.news }]}
      />

      <Container className="py-8">
        <div className="mb-6 space-y-3 rounded-2xl border border-[var(--border)] bg-white p-4">
          <FilterChips label={dict.news.category} options={categoryOptions} />
          <div className="border-t border-slate-100" />
          <FilterChips label={dict.news.branch} options={branchOptions} />
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {articles.length > 0
            ? `${articles.length} ${dict.common.results}`
            : dict.common.noResults}
        </p>

        {articles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                branchName={article.branchId ? branchMap[article.branchId] : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Newspaper className="size-6" />}
            title={dict.news.empty}
            description={dict.news.emptyHint}
          />
        )}
      </Container>
    </>
  );
}
