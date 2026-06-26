import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageSquarePlus, PhoneCall } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { getDictionary } from "@/lib/i18n";
import { Container, PageHeader } from "@/components/ui";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  YoutubeIcon,
} from "@/components/social-icons";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.contact.title, description: dict.contact.description };
}

export default async function ContactPage() {
  const dict = await getDictionary();

  const cards = [
    { Icon: MapPin, title: dict.contact.address, value: siteConfig.contact.address },
    { Icon: PhoneCall, title: dict.contact.phone, value: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone}`, ltr: true },
    { Icon: Mail, title: dict.contact.email, value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}`, ltr: true },
    { Icon: Clock, title: dict.contact.hours, value: siteConfig.contact.workingHours },
  ];

  const socials = [
    { Icon: FacebookIcon, href: siteConfig.social.facebook, label: "Facebook" },
    { Icon: InstagramIcon, href: siteConfig.social.instagram, label: "Instagram" },
    { Icon: YoutubeIcon, href: siteConfig.social.youtube, label: "YouTube" },
    { Icon: TelegramIcon, href: siteConfig.social.telegram, label: "Telegram" },
  ];

  return (
    <>
      <PageHeader
        title={dict.contact.title}
        description={dict.contact.description}
        breadcrumbs={[
          { label: dict.nav.home, href: "/" },
          { label: dict.nav.contact },
        ]}
      />

      <Container className="py-10">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-bl from-brand-700 to-brand-900 p-6 text-white sm:flex-row sm:p-8">
          <div className="flex items-center gap-4">
            <PhoneCall className="size-10 shrink-0 text-accent-400" />
            <div>
              <p className="text-brand-100">{dict.contact.emergencyTitle}</p>
              <p className="text-sm text-brand-200">
                {dict.contact.emergencySubtitle}
              </p>
            </div>
          </div>
          <a
            href={`tel:${siteConfig.contact.emergency}`}
            className="rounded-xl bg-accent-500 px-8 py-3 text-2xl font-extrabold text-brand-950"
            dir="ltr"
          >
            {siteConfig.contact.emergency}
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map(({ Icon, title, value, href, ltr }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5"
                >
                  <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-bold text-brand-900">{title}</h3>
                  {href ? (
                    <a
                      href={href}
                      className="mt-1 block text-slate-600 hover:text-brand-700"
                      dir={ltr ? "ltr" : undefined}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-slate-600">{value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5">
              <h3 className="mb-4 font-bold text-brand-900">
                {dict.contact.followUs}
              </h3>
              <div className="flex flex-wrap gap-3">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <MessageSquarePlus className="size-9 text-accent-500" />
              <h3 className="mt-3 font-bold text-brand-900">
                {dict.contact.haveComplaint}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {dict.contact.haveComplaintText}
              </p>
              <Link
                href="/complaints"
                className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {dict.footer.submitComplaintLink}
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <MapPin className="size-9 text-brand-500" />
              <h3 className="mt-3 font-bold text-brand-900">
                {dict.contact.branchesTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {dict.contact.branchesText}
              </p>
              <Link
                href="/branches"
                className="mt-4 inline-block rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {dict.contact.viewBranches}
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
