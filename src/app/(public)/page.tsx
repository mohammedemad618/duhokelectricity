import Link from "next/link";
import {
  HelpCircle,
  Megaphone,
  MessageSquarePlus,
  Newspaper,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import {
  getAnnouncements,
  getBranchNameMap,
  getBranches,
  getDepartments,
  getLatestNews,
} from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { getDictionary } from "@/lib/i18n";
import { Container, SectionHeading } from "@/components/ui";
import { ArticleCard } from "@/components/article-card";
import { AnnouncementCard } from "@/components/announcement-card";
import { DepartmentCard } from "@/components/department-card";
import { BranchCard } from "@/components/branch-card";

export default async function HomePage() {
  const [news, branches, announcements, departments, branchMap, dict] =
    await Promise.all([
      getLatestNews(6),
      getBranches(),
      getAnnouncements({ activeOnly: true }),
      getDepartments(),
      getBranchNameMap(),
      getDictionary(),
    ]);

  const quickLinks = [
    { label: dict.nav.news, desc: dict.home.quick.news, href: "/news", Icon: Newspaper },
    { label: dict.nav.announcements, desc: dict.home.quick.announcements, href: "/announcements", Icon: Megaphone },
    { label: dict.nav.complaints, desc: dict.home.quick.complaints, href: "/complaints", Icon: MessageSquarePlus },
    { label: dict.nav.faq, desc: dict.home.quick.faq, href: "/faq", Icon: HelpCircle },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-brand-800 via-brand-900 to-brand-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              <ShieldCheck className="size-4 text-accent-400" />
              {dict.common.official}
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {dict.org.name}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-brand-100 sm:text-lg">
              {dict.home.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/news"
                className="rounded-xl bg-accent-500 px-6 py-3 font-bold text-brand-950 shadow-sm transition hover:bg-accent-400"
              >
                {dict.home.browseNews}
              </Link>
              <Link
                href="/complaints"
                className="rounded-xl bg-white/10 px-6 py-3 font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
              >
                {dict.home.cta.button}
              </Link>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur">
              <div className="flex items-center gap-4 rounded-xl bg-accent-500 p-4 text-brand-950">
                <PhoneCall className="size-9 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">
                    {dict.home.emergencyTitle}
                  </div>
                  <a
                    href={`tel:${siteConfig.contact.emergency}`}
                    className="text-3xl font-extrabold"
                    dir="ltr"
                  >
                    {siteConfig.contact.emergency}
                  </a>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-brand-200">{dict.home.branchesCount}</dt>
                  <dd className="mt-1 text-2xl font-bold">{branches.length}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-brand-200">{dict.home.departmentsCount}</dt>
                  <dd className="mt-1 text-2xl font-bold">{departments.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* روابط سريعة */}
      <Container className="relative z-10 -mt-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {quickLinks.map(({ label, desc, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-brand-900">{label}</span>
                <span className="block truncate text-xs text-slate-500">{desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>

      {/* الأقسام */}
      <section className="py-14">
        <Container>
          <SectionHeading
            title={dict.home.sections.departmentsTitle}
            subtitle={dict.home.sections.departmentsSubtitle}
            action={{ label: dict.common.viewAll, href: "/departments" }}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((d) => (
              <DepartmentCard key={d.id} department={d} />
            ))}
          </div>
        </Container>
      </section>

      {/* آخر الأخبار */}
      <section className="bg-white py-14">
        <Container>
          <SectionHeading
            title={dict.home.sections.newsTitle}
            subtitle={dict.home.sections.newsSubtitle}
            action={{ label: dict.common.viewAll, href: "/news" }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                branchName={article.branchId ? branchMap[article.branchId] : undefined}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* الإعلانات */}
      <section className="py-14">
        <Container>
          <SectionHeading
            title={dict.home.sections.announcementsTitle}
            subtitle={dict.home.sections.announcementsSubtitle}
            action={{ label: dict.common.viewAll, href: "/announcements" }}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {announcements.slice(0, 4).map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                branchName={a.branchId ? branchMap[a.branchId] : undefined}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* الفروع */}
      <section className="bg-white py-14">
        <Container>
          <SectionHeading
            title={dict.home.sections.branchesTitle}
            subtitle={dict.home.sections.branchesSubtitle}
            action={{ label: dict.common.viewAll, href: "/branches" }}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <BranchCard key={b.id} branch={b} />
            ))}
          </div>
        </Container>
      </section>

      {/* دعوة لتقديم شكوى */}
      <section className="py-14">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-brand-700 to-brand-900 px-6 py-10 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.cta.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-brand-100">{dict.home.cta.text}</p>
            <Link
              href="/complaints"
              className="mt-6 inline-block rounded-xl bg-accent-500 px-8 py-3 font-bold text-brand-950 shadow-sm transition hover:bg-accent-400"
            >
              {dict.home.cta.button}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
