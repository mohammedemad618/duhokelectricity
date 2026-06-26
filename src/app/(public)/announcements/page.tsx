import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import type { AnnouncementType } from "@/lib/types";
import { getAnnouncements, getBranchNameMap } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import {
  Container,
  EmptyState,
  FilterChips,
  PageHeader,
} from "@/components/ui";
import { AnnouncementCard } from "@/components/announcement-card";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.announcements.title,
    description: dict.announcements.description,
  };
}

const typeKeys: AnnouncementType[] = [
  "general",
  "maintenance",
  "outage",
  "warning",
  "urgent",
];

function buildHref(type?: string) {
  return type ? `/announcements?type=${type}` : "/announcements";
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = typeKeys.includes(sp.type as AnnouncementType)
    ? (sp.type as AnnouncementType)
    : undefined;

  const [all, branchMap, dict] = await Promise.all([
    getAnnouncements({ activeOnly: true }),
    getBranchNameMap(),
    getDictionary(),
  ]);
  const items = type ? all.filter((a) => a.type === type) : all;

  const typeOptions = [
    { label: dict.common.all, href: buildHref(), active: !type },
    ...typeKeys.map((t) => ({
      label: dict.announcementTypes[t],
      href: buildHref(t),
      active: type === t,
    })),
  ];

  return (
    <>
      <PageHeader
        title={dict.announcements.title}
        description={dict.announcements.description}
        breadcrumbs={[
          { label: dict.nav.home, href: "/" },
          { label: dict.nav.announcements },
        ]}
      />

      <Container className="py-8">
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-4">
          <FilterChips label={dict.announcements.type} options={typeOptions} />
        </div>

        {items.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                branchName={a.branchId ? branchMap[a.branchId] : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Megaphone className="size-6" />}
            title={dict.announcements.empty}
            description={dict.announcements.emptyHint}
          />
        )}
      </Container>
    </>
  );
}
