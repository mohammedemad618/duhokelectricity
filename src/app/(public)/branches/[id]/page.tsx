import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  PhoneCall,
  User,
} from "lucide-react";
import {
  getAnnouncements,
  getArticles,
  getBranchById,
  getDepartments,
} from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { getDictionary } from "@/lib/i18n";
import { Breadcrumbs, Container, EmptyState, SectionHeading } from "@/components/ui";
import { ArticleCard } from "@/components/article-card";
import { AnnouncementCard } from "@/components/announcement-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const branch = await getBranchById(id);
  if (!branch) return { title: "404" };
  return { title: branch.name, description: branch.description };
}

export default async function BranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const branch = await getBranchById(id);
  if (!branch) notFound();

  const [articles, allAnnouncements, departments, dict] = await Promise.all([
    getArticles({ branchId: id }),
    getAnnouncements({ activeOnly: true }),
    getDepartments(),
    getDictionary(),
  ]);
  const announcements = allAnnouncements.filter((a) => a.branchId === id);

  const contactRows = [
    { Icon: MapPin, label: dict.branches.location, value: branch.location },
    { Icon: PhoneCall, label: dict.branches.phone, value: branch.phone, ltr: true },
    { Icon: Mail, label: dict.branches.email, value: branch.email, ltr: true },
    { Icon: User, label: dict.branches.management, value: branch.manager },
    { Icon: Clock, label: dict.branches.hours, value: siteConfig.contact.workingHours },
  ].filter((r) => r.value);

  return (
    <>
      <div className="bg-gradient-to-bl from-brand-800 to-brand-950 text-white">
        <Container className="py-10">
          <div className="mb-3 [&_*]:!text-brand-100/80 [&_a:hover]:!text-white">
            <Breadcrumbs
              items={[
                { label: dict.nav.home, href: "/" },
                { label: dict.nav.branches, href: "/branches" },
                { label: branch.name },
              ]}
            />
          </div>
          <div className="flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 sm:flex">
              <Building2 className="size-7 text-accent-400" />
            </span>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{branch.name}</h1>
              <p className="mt-2 max-w-3xl text-brand-100">{branch.description}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeading title={dict.branches.departmentsInBranch} />
            <div className="mb-10 flex flex-wrap gap-2">
              {departments.map((d) => (
                <Link
                  key={d.id}
                  href={`/departments/${d.id}`}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  {d.name}
                </Link>
              ))}
            </div>

            <SectionHeading
              title={dict.branches.branchNews}
              action={{ label: dict.common.viewAll, href: `/news?branch=${branch.id}` }}
            />
            {articles.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Newspaper className="size-6" />}
                title={dict.branches.noNews}
              />
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <h3 className="mb-4 font-bold text-brand-900">
                {dict.branches.contactInfo}
              </h3>
              <ul className="space-y-3 text-sm">
                {contactRows.map(({ Icon, label, value, ltr }) => (
                  <li key={label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-brand-500" />
                    <div>
                      <div className="text-xs text-slate-400">{label}</div>
                      <div className="text-slate-700" dir={ltr ? "ltr" : undefined}>
                        {value}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {announcements.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-bold text-brand-900">
                  <Megaphone className="size-4 text-accent-500" />
                  {dict.branches.branchAnnouncements}
                </h3>
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
