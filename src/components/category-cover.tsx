import Image from "next/image";
import { Images } from "lucide-react";
import type { ArticleCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

const coverImages: Record<ArticleCategory, string[]> = {
  news: [
    "/news-defaults/news.png",
    "/news-defaults/news-2.png",
    "/news-defaults/news-3.png",
    "/news-defaults/news-4.png",
  ],
  construction: ["/news-defaults/construction.png"],
  projects: ["/news-defaults/projects.png"],
  planning: ["/news-defaults/planning.png"],
};

function pickImage(category: ArticleCategory, variantKey?: string): string {
  const images = coverImages[category];
  if (!variantKey || images.length === 1) return images[0];

  let hash = 0;
  for (const char of variantKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return images[hash % images.length];
}

export function defaultArticleImage(
  category: ArticleCategory,
  variantKey?: string,
): string {
  return pickImage(category, variantKey);
}

export function CategoryCover({
  category,
  className,
  imageCount,
  variantKey,
}: {
  category: ArticleCategory;
  className?: string;
  imageCount?: number;
  variantKey?: string;
}) {
  const src = pickImage(category, variantKey);
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-100 text-white",
        className,
      )}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/25 via-transparent to-transparent" />
      {imageCount && imageCount > 0 && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-xs font-medium backdrop-blur">
          <Images className="size-3.5" />
          {imageCount}
        </span>
      )}
    </div>
  );
}
