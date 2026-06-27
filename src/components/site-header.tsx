import Link from "next/link";
import { Clock, PhoneCall, Zap } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { getTickerAnnouncements } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n";
import { Container } from "./ui";
import { DesktopNav, MobileNav, type NavItem } from "./nav";
import { AnnouncementTicker } from "./announcement-ticker";
import { LanguageSwitcher } from "./language-switcher";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  YoutubeIcon,
} from "./social-icons";

export async function SiteHeader() {
  const [ticker, dict, locale] = await Promise.all([
    getTickerAnnouncements(),
    getDictionary(),
    getLocale(),
  ]);

  const nav: NavItem[] = [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.news, href: "/news" },
    { label: dict.nav.announcements, href: "/announcements" },
    { label: dict.nav.branches, href: "/branches" },
    { label: dict.nav.departments, href: "/departments" },
    { label: dict.nav.complaints, href: "/complaints" },
    { label: dict.nav.faq, href: "/faq" },
    { label: dict.nav.contact, href: "/contact" },
  ];

  return (
    <header>
      {/* شريط ذهبي رفيع — إطار رسمي */}
      <div className="h-1 bg-accent-500" aria-hidden />
      {/* الشريط العلوي */}
      <div className="bg-brand-900 text-brand-50">
        <Container className="flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <span className="hidden sm:inline">{dict.org.ministry}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${siteConfig.contact.emergency}`}
              className="flex items-center gap-1 font-semibold hover:text-accent-300"
            >
              <PhoneCall className="size-3.5" />
              {dict.common.emergency}: {siteConfig.contact.emergency}
            </a>
            <span className="hidden items-center gap-1 text-brand-200 md:flex">
              <Clock className="size-3.5" />
              {dict.common.workingHours}
            </span>
            <div className="hidden items-center gap-2.5 sm:flex">
              <a href={siteConfig.social.facebook} aria-label="Facebook" className="hover:text-accent-300" target="_blank" rel="noopener noreferrer">
                <FacebookIcon className="size-4" />
              </a>
              <a href={siteConfig.social.instagram} aria-label="Instagram" className="hover:text-accent-300" target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="size-4" />
              </a>
              <a href={siteConfig.social.youtube} aria-label="YouTube" className="hover:text-accent-300" target="_blank" rel="noopener noreferrer">
                <YoutubeIcon className="size-4" />
              </a>
              <a href={siteConfig.social.telegram} aria-label="Telegram" className="hover:text-accent-300" target="_blank" rel="noopener noreferrer">
                <TelegramIcon className="size-4" />
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* الشريط الرئيسي */}
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 shadow-sm backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex size-12 items-center justify-center rounded-full bg-brand-900 ring-1 ring-brand-200">
              <span className="absolute inset-[3px] rounded-full ring-1 ring-accent-400/45" aria-hidden />
              <Zap className="size-5 fill-accent-400 text-accent-400" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-brand-900 sm:text-base">
                {dict.org.name}
              </span>
              <span className="block text-[11px] text-slate-500 sm:text-xs">
                {dict.org.ministry}
              </span>
            </span>
          </Link>

          <DesktopNav items={nav} />

          <div className="flex items-center gap-2">
            <Link
              href="/complaints"
              className="hidden rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-brand-950 shadow-sm transition hover:bg-accent-400 sm:inline-block"
            >
              {dict.common.submitComplaint}
            </Link>
            <MobileNav items={nav} />
          </div>
        </Container>
      </div>

      <AnnouncementTicker items={ticker} label={dict.common.alerts} />
    </header>
  );
}
