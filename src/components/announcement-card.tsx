import { AlertTriangle, CalendarDays, MapPin, Megaphone } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { announcementTypeClass } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Badge } from "./ui";

export async function AnnouncementCard({
  announcement,
  branchName,
}: {
  announcement: Announcement;
  branchName?: string;
}) {
  const dict = await getDictionary();
  const isUrgent = announcement.importance === "urgent";
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border bg-white p-5 transition hover:shadow-sm",
        isUrgent ? "border-rose-200" : "border-slate-200",
      )}
    >
      {/* شريط جانبي ملوّن */}
      <span
        className={cn(
          "absolute inset-y-0 right-0 w-1.5",
          isUrgent ? "bg-red-500" : "bg-brand-500",
        )}
        aria-hidden
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge className={announcementTypeClass[announcement.type]}>
          {isUrgent ? (
            <AlertTriangle className="size-3.5" />
          ) : (
            <Megaphone className="size-3.5" />
          )}
          {dict.announcementTypes[announcement.type]}
        </Badge>
        {announcement.pinned && (
          <Badge className="bg-slate-100 text-slate-600 ring-slate-200">
            {dict.common.pinned}
          </Badge>
        )}
        {branchName && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="size-3.5" />
            {branchName}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold leading-7 text-brand-900">
        {announcement.title}
      </h3>
      <p className="mt-2 leading-7 text-slate-600">{announcement.body}</p>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <CalendarDays className="size-3.5" />
        <span>
          {dict.announcements.publishedOn} {formatDate(announcement.startsAt)}
          {announcement.endsAt && (
            <> — {dict.announcements.until} {formatDate(announcement.endsAt)}</>
          )}
        </span>
      </div>
    </article>
  );
}
