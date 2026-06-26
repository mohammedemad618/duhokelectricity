import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Article } from "@/lib/types";
import { categoryBadgeClass } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Badge } from "./ui";
import { CategoryCover } from "./category-cover";

export function articleHref(a: Pick<Article, "id">) {
  return `/news/${a.id}`;
}

/* بطاقة مقال كاملة (شبكة) */
export async function ArticleCard({
  article,
  branchName,
  className,
}: {
  article: Article;
  branchName?: string;
  className?: string;
}) {
  const dict = await getDictionary();
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <Link href={articleHref(article)} className="block">
        <CategoryCover
          category={article.category}
          imageCount={article.imageCount}
          className="aspect-[16/9] w-full"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge className={categoryBadgeClass[article.category]}>
            {dict.categories[article.category]}
          </Badge>
          {branchName && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="size-3.5" />
              {branchName}
            </span>
          )}
        </div>
        <h3 className="mb-2 text-base font-bold leading-7 text-brand-900">
          <Link
            href={articleHref(article)}
            className="line-clamp-2 hover:text-brand-700"
          >
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays className="size-3.5" />
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}

/* صف مقال مدمج (لقوائم جانبية) */
export function ArticleListItem({ article }: { article: Article }) {
  return (
    <Link
      href={articleHref(article)}
      className="group flex gap-3 rounded-xl p-2 transition hover:bg-slate-50"
    >
      <CategoryCover
        category={article.category}
        className="size-16 shrink-0 rounded-lg"
      />
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-brand-900 group-hover:text-brand-700">
          {article.title}
        </h4>
        <span className="mt-1 block text-xs text-slate-400">
          {formatDate(article.publishedAt)}
        </span>
      </div>
    </Link>
  );
}
