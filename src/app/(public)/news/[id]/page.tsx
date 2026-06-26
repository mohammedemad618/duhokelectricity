import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, MapPin, Tag, User } from "lucide-react";
import {
  getArticleById,
  getBranchById,
  getRelatedArticles,
} from "@/lib/data";
import { categoryBadgeClass } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { Badge, Breadcrumbs, Container, SectionHeading } from "@/components/ui";
import { ArticleCard } from "@/components/article-card";
import { CategoryCover, defaultArticleImage } from "@/components/category-cover";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return { title: "404" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: defaultArticleImage(article.category, `${article.id}-${article.title}`) }],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const [branch, related, dict] = await Promise.all([
    article.branchId ? getBranchById(article.branchId) : Promise.resolve(undefined),
    getRelatedArticles(article, 3),
    getDictionary(),
  ]);

  const paragraphs = article.content.split("\n\n");

  return (
    <article>
      <div className="border-b border-[var(--border)] bg-white">
        <Container className="py-8">
          <Breadcrumbs
            items={[
              { label: dict.nav.home, href: "/" },
              { label: dict.nav.news, href: "/news" },
              { label: article.title },
            ]}
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className={categoryBadgeClass[article.category]}>
              {dict.categories[article.category]}
            </Badge>
            {branch && (
              <Link
                href={`/branches/${branch.id}`}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700"
              >
                <MapPin className="size-4" />
                {branch.shortName ?? branch.name}
              </Link>
            )}
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-bold leading-relaxed text-brand-900 sm:text-3xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4" />
              {article.author}
            </span>
            {article.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {article.location}
              </span>
            )}
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <CategoryCover
            category={article.category}
            imageCount={article.imageCount}
            variantKey={`${article.id}-${article.title}`}
            className="mb-8 aspect-[16/9] w-full rounded-2xl"
          />

          <div className="article-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {article.imageCount && article.imageCount > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 text-lg font-bold text-brand-900">
                {dict.news.gallery}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: Math.min(article.imageCount, 6) }).map(
                  (_, i) => (
                    <CategoryCover
                      key={i}
                      category={article.category}
                      variantKey={`${article.id}-${article.title}-${i}`}
                      className="aspect-square rounded-xl"
                    />
                  ),
                )}
              </div>
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
              <Tag className="size-4 text-slate-400" />
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
              {dict.news.backToNews}
            </Link>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-[var(--border)] bg-white py-12">
          <Container>
            <SectionHeading title={dict.news.relatedTitle} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}
