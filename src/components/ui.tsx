import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------ Container ------------------------------ */

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/* --------------------------- عنوان قسم --------------------------- */

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-3",
        className,
      )}
    >
      <div className="border-r-4 border-accent-500 pr-3">
        <h2 className="text-xl font-bold text-brand-900 sm:text-2xl">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
        >
          {action.label}
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/* ------------------------------- Badge ------------------------------- */

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------- Breadcrumbs ----------------------------- */

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="مسار التنقّل" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-brand-700">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(last && "font-medium text-slate-700")}>
                  {item.label}
                </span>
              )}
              {!last && <span className="text-slate-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* --------------------------- ترويسة الصفحة --------------------------- */

export function PageHeader({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="border-b border-[var(--border)] bg-gradient-to-l from-brand-900 to-brand-700 text-white">
      <Container className="py-8 sm:py-10">
        {breadcrumbs && (
          <div className="mb-3 [&_*]:!text-brand-100/80 [&_a:hover]:!text-white">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-3xl text-brand-100/90">{description}</p>
        )}
      </Container>
    </div>
  );
}

/* ---------------------------- FilterChips ---------------------------- */

export function FilterChips({
  label,
  options,
}: {
  label?: string;
  options: { label: string; href: string; active: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="ml-1 text-sm font-medium text-slate-500">{label}</span>
      )}
      {options.map((o) => (
        <Link
          key={o.href}
          href={o.href}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition",
            o.active
              ? "bg-brand-600 text-white ring-brand-600"
              : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-brand-700",
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

/* ----------------------------- EmptyState ----------------------------- */

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      {icon && (
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}
