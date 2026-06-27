import Link from "next/link";
import { Mail, MapPin, PhoneCall, Zap } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { getDictionary } from "@/lib/i18n";
import { Container } from "./ui";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  YoutubeIcon,
} from "./social-icons";

export async function SiteFooter() {
  const dict = await getDictionary();
  const year = 2026;

  const columns = [
    {
      title: dict.footer.quickLinks,
      links: [
        { label: dict.footer.latestNews, href: "/news" },
        { label: dict.footer.officialAnnouncements, href: "/announcements" },
        { label: dict.nav.branches, href: "/branches" },
        { label: dict.nav.departments, href: "/departments" },
      ],
    },
    {
      title: dict.footer.citizenServices,
      links: [
        { label: dict.footer.submitComplaintLink, href: "/complaints" },
        { label: dict.nav.faq, href: "/faq" },
        { label: dict.footer.guidelines, href: "/departments/services" },
        { label: dict.nav.contact, href: "/contact" },
      ],
    },
    {
      title: dict.footer.departments,
      links: [
        { label: dict.categories.construction, href: "/departments/construction" },
        { label: dict.categories.projects, href: "/departments/projects" },
        { label: dict.categories.planning, href: "/departments/planning" },
      ],
    },
  ];

  return (
    <footer className="mt-16 bg-brand-950 text-brand-100">
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="relative flex size-12 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15">
                <span className="absolute inset-[3px] rounded-full ring-1 ring-accent-400/40" aria-hidden />
                <Zap className="size-5 fill-accent-400 text-accent-400" />
              </span>
              <span className="leading-tight">
                <span className="block font-bold text-white">{dict.org.name}</span>
                <span className="block text-xs text-brand-300">
                  {dict.org.ministry}
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-brand-200">
              {dict.org.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="flex size-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
                <FacebookIcon className="size-4" />
              </a>
              <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="flex size-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
                <InstagramIcon className="size-4" />
              </a>
              <a href={siteConfig.social.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="flex size-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
                <YoutubeIcon className="size-4" />
              </a>
              <a href={siteConfig.social.telegram} aria-label="Telegram" target="_blank" rel="noopener noreferrer" className="flex size-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
                <TelegramIcon className="size-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-bold text-white">{col.title}</h3>
                <ul className="space-y-2 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-brand-200 transition hover:text-accent-300">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-3 text-sm font-bold text-white">
              {dict.footer.contactUs}
            </h3>
            <ul className="space-y-3 text-sm text-brand-200">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-400" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="size-4 shrink-0 text-accent-400" />
                <a href={`tel:${siteConfig.contact.phone}`} dir="ltr">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-accent-400" />
                <a href={`mailto:${siteConfig.contact.email}`}>
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-brand-300 sm:flex-row">
          <p>
            © {year} {dict.org.name}. {dict.footer.rights}
          </p>
          <p>
            {dict.footer.emergencyNote}{" "}
            <a
              href={`tel:${siteConfig.contact.emergency}`}
              className="font-bold text-accent-300"
            >
              {siteConfig.contact.emergency}
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
