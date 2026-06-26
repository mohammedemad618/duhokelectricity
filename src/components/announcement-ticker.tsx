import Link from "next/link";
import { Megaphone } from "lucide-react";
import type { Announcement } from "@/lib/types";

export function AnnouncementTicker({
  items,
  label,
}: {
  items: Announcement[];
  label: string;
}) {
  if (items.length === 0) return null;

  const list = items.map((a) => (
    <Link
      key={a.id}
      href="/announcements"
      className="inline-flex shrink-0 items-center gap-2 px-6 text-sm hover:text-accent-200"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-accent-400" />
      <span className="whitespace-nowrap">{a.title}</span>
    </Link>
  ));

  return (
    <div className="bg-brand-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl items-stretch">
        {/* عنوان ثابت */}
        <div className="z-10 flex shrink-0 items-center gap-2 bg-accent-500 px-4 py-2 font-bold text-brand-950">
          <Megaphone className="size-4" />
          <span className="hidden text-sm sm:inline">{label}</span>
        </div>
        {/* الشريط المتحرك */}
        <div className="ticker-pause relative flex-1 overflow-hidden">
          <div className="animate-ticker flex w-max py-2">
            {list}
            {/* نسخة مكرّرة لاستمرارية الحركة */}
            <span aria-hidden className="flex">
              {list}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
