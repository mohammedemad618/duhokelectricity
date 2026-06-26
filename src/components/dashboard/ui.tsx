import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const toneMap = {
  brand: "bg-brand-50 text-brand-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
} as const;

export function StatCard({
  label,
  value,
  Icon,
  tone = "brand",
  href,
}: {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  tone?: keyof typeof toneMap;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-sm">
      <span className={cn("flex size-12 items-center justify-center rounded-xl", toneMap[tone])}>
        <Icon className="size-6" />
      </span>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          {title && <h2 className="font-bold text-slate-800">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-slate-400">{children}</div>
  );
}

const barTone = {
  brand: "bg-brand-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  blue: "bg-blue-500",
} as const;

export function BarList({
  items,
  tone = "brand",
  emptyLabel = "لا توجد بيانات.",
}: {
  items: { label: string; count: number }[];
  tone?: keyof typeof barTone;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-slate-400">{emptyLabel}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-3 p-5">
      {items.map((it) => (
        <div key={it.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-slate-600">{it.label}</span>
            <span className="font-bold text-slate-700">{it.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", barTone[tone])}
              style={{ width: `${Math.round((it.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
