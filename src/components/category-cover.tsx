import {
  Building2,
  ClipboardList,
  Images,
  Newspaper,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ArticleCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

const config: Record<
  ArticleCategory,
  { gradient: string; Icon: LucideIcon }
> = {
  news: { gradient: "from-brand-600 to-brand-800", Icon: Newspaper },
  construction: { gradient: "from-accent-500 to-accent-700", Icon: Wrench },
  projects: { gradient: "from-emerald-500 to-emerald-700", Icon: Building2 },
  planning: { gradient: "from-violet-500 to-violet-700", Icon: ClipboardList },
};

/**
 * غلاف رمزي للمحتوى (بديل مؤقت عن الصور الحقيقية).
 * يستخدم تدرّجاً لونياً وأيقونة حسب تصنيف المحتوى.
 */
export function CategoryCover({
  category,
  className,
  imageCount,
}: {
  category: ArticleCategory;
  className?: string;
  imageCount?: number;
}) {
  const { gradient, Icon } = config[category];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br text-white",
        gradient,
        className,
      )}
      aria-hidden
    >
      {/* زخرفة خلفية */}
      <Icon className="absolute -left-6 -top-6 size-40 opacity-10" strokeWidth={1.5} />
      <Icon className="size-12 opacity-90" strokeWidth={1.75} />
      {imageCount && imageCount > 0 && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-xs font-medium backdrop-blur">
          <Images className="size-3.5" />
          {imageCount}
        </span>
      )}
    </div>
  );
}
