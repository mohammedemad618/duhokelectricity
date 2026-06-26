"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Building2,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Newspaper,
  ScrollText,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { can } from "@/lib/permissions";
import type { Locale } from "@/lib/i18n";
import type { DashboardDictionary } from "@/lib/i18n/dashboard";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/app/dashboard/actions";
import { LanguageSwitcher } from "@/components/language-switcher";

type NavItem = {
  href: string;
  labelKey: keyof DashboardDictionary["nav"];
  Icon: LucideIcon;
  show: (u: SessionUser) => boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", Icon: LayoutDashboard, show: () => true },
  {
    href: "/dashboard/news",
    labelKey: "news",
    Icon: Newspaper,
    show: (u) => can(u, "content:create") || can(u, "content:review"),
  },
  {
    href: "/dashboard/announcements",
    labelKey: "announcements",
    Icon: Megaphone,
    show: (u) => can(u, "announcements:manage"),
  },
  {
    href: "/dashboard/complaints",
    labelKey: "complaints",
    Icon: MessageSquare,
    show: (u) => can(u, "complaints:view"),
  },
  {
    href: "/dashboard/branches",
    labelKey: "branches",
    Icon: Building2,
    show: (u) => can(u, "branches:manage"),
  },
  {
    href: "/dashboard/departments",
    labelKey: "departments",
    Icon: Layers,
    show: (u) => can(u, "departments:manage"),
  },
  {
    href: "/dashboard/reports",
    labelKey: "reports",
    Icon: BarChart3,
    show: (u) => can(u, "stats:view"),
  },
  {
    href: "/dashboard/users",
    labelKey: "users",
    Icon: Users,
    show: (u) => can(u, "users:manage"),
  },
  {
    href: "/dashboard/audit",
    labelKey: "audit",
    Icon: ScrollText,
    show: (u) => u.role === "super_admin",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function DashboardShell({
  user,
  locale,
  dir,
  dictionary,
  children,
}: {
  user: SessionUser;
  locale: Locale;
  dir: "rtl" | "ltr";
  dictionary: DashboardDictionary;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navItems.filter((i) => i.show(user));

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
          <Zap className="size-5 fill-accent-400 text-accent-400" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-bold">{dictionary.shell.title}</div>
          <div className="text-[11px] text-brand-300">{siteConfig.shortName}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ href, labelKey, Icon }) => {
          const active = isActive(pathname, href);
          const label = dictionary.nav[labelKey];
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-white/15 text-white"
                  : "text-brand-100 hover:bg-white/10",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-brand-200 hover:bg-white/10"
        >
          <Zap className="size-5 shrink-0" />
          {dictionary.shell.backToSite}
        </Link>
      </div>
    </div>
  );

  return (
    <div dir={dir} className="flex min-h-screen bg-slate-100">
      {/* الشريط الجانبي — سطح المكتب */}
      <aside className="hidden w-64 shrink-0 lg:block print:hidden">{sidebar}</aside>

      {/* درج الجوال */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 z-50 w-64 ltr:left-0 rtl:right-0 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      {/* المحتوى */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 print:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
            aria-label={dictionary.shell.menuOpen}
          >
            <Menu className="size-5" />
          </button>

          <div className="ms-auto flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-600">
              <LanguageSwitcher current={locale} />
            </div>
            <div className="text-end leading-tight">
              <div className="text-sm font-bold text-slate-800">{user.name}</div>
              <div className="text-xs text-slate-500">
                {dictionary.labels.roles[user.role]}
              </div>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
              {user.name.charAt(0)}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{dictionary.shell.logout}</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* زر إغلاق الدرج (جوال) */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed left-4 top-4 z-[60] inline-flex size-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow lg:hidden"
          aria-label={dictionary.shell.menuClose}
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
