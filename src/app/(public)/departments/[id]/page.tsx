import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Headphones,
  HelpCircle,
  MessageSquarePlus,
  Newspaper,
  PhoneCall,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ArticleCategory, DepartmentType } from "@/lib/types";
import {
  getArticles,
  getBranchNameMap,
  getDepartmentById,
} from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import {
  Breadcrumbs,
  Container,
  EmptyState,
  SectionHeading,
} from "@/components/ui";
import { ArticleCard } from "@/components/article-card";
import { cn } from "@/lib/cn";

const heroConfig: Record<DepartmentType, { gradient: string; Icon: LucideIcon }> = {
  construction: { gradient: "from-accent-500 to-accent-700", Icon: Wrench },
  projects: { gradient: "from-emerald-600 to-emerald-800", Icon: Building2 },
  planning: { gradient: "from-violet-600 to-violet-800", Icon: ClipboardList },
  services: { gradient: "from-brand-700 to-brand-900", Icon: Headphones },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dept = await getDepartmentById(id);
  if (!dept) return { title: "404" };
  return { title: dept.name, description: dept.description };
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dept = await getDepartmentById(id);
  if (!dept) notFound();

  const { gradient, Icon } = heroConfig[dept.type];
  const isServices = dept.type === "services";

  const [articles, branchMap, dict] = await Promise.all([
    isServices
      ? Promise.resolve([])
      : getArticles({ category: dept.type as ArticleCategory }),
    getBranchNameMap(),
    getDictionary(),
  ]);

  const serviceLinks = [
    { title: dict.nav.faq, desc: dict.departments.serviceLinks.faqDesc, href: "/faq", Icon: HelpCircle },
    { title: dict.footer.submitComplaintLink, desc: dict.departments.serviceLinks.complaintsDesc, href: "/complaints", Icon: MessageSquarePlus },
    { title: dict.nav.contact, desc: dict.departments.serviceLinks.contactDesc, href: "/contact", Icon: PhoneCall },
  ];

  return (
    <>
      <div className={cn("bg-gradient-to-bl text-white", gradient)}>
        <Container className="py-10">
          <div className="mb-3 [&_*]:!text-white/80 [&_a:hover]:!text-white">
            <Breadcrumbs
              items={[
                { label: dict.nav.home, href: "/" },
                { label: dict.nav.departments, href: "/departments" },
                { label: dept.name },
              ]}
            />
          </div>
          <div className="flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 sm:flex">
              <Icon className="size-7" />
            </span>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{dept.name}</h1>
              <p className="mt-2 max-w-3xl text-white/90">{dept.description}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <div className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-brand-900">
            {dict.departments.whatItShows}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {dept.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {isServices ? (
          <div className="space-y-10">
            <div>
              <SectionHeading title={dict.departments.usefulLinks} />
              <div className="grid gap-4 sm:grid-cols-3">
                {serviceLinks.map(({ title, desc, href, Icon: LinkIcon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                      <LinkIcon className="size-5" />
                    </span>
                    <h3 className="font-bold text-brand-900">{title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-rose-700">
                <ShieldCheck className="size-5" />
                {dict.departments.safetyTitle}
              </h2>
              <ul className="space-y-2">
                {dict.departments.safetyTips.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-slate-700">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <>
            <SectionHeading
              title={dict.departments.latestWorks}
              subtitle={dict.departments.latestWorksSubtitle}
            />
            {articles.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    branchName={a.branchId ? branchMap[a.branchId] : undefined}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Newspaper className="size-6" />}
                title={dict.departments.noWorks}
              />
            )}
          </>
        )}
      </Container>
    </>
  );
}
