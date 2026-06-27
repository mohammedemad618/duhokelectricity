import Link from "next/link";
import {
  Building2,
  ClipboardList,
  Headphones,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Department, DepartmentType } from "@/lib/types";
import { cn } from "@/lib/cn";

const deptConfig: Record<
  DepartmentType,
  { Icon: LucideIcon; iconWrap: string }
> = {
  construction: {
    Icon: Wrench,
    iconWrap: "bg-accent-50 text-accent-600",
  },
  projects: {
    Icon: Building2,
    iconWrap: "bg-emerald-50 text-emerald-600",
  },
  planning: {
    Icon: ClipboardList,
    iconWrap: "bg-violet-50 text-violet-600",
  },
  services: {
    Icon: Headphones,
    iconWrap: "bg-brand-50 text-brand-600",
  },
};

export function DepartmentCard({ department }: { department: Department }) {
  const { Icon, iconWrap } = deptConfig[department.type];
  return (
    <Link
      href={`/departments/${department.id}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-sm"
    >
      <span
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-lg",
          iconWrap,
        )}
      >
        <Icon className="size-6" />
      </span>
      <h3 className="text-lg font-bold text-brand-900">{department.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">
        {department.description}
      </p>
      <span className="mt-4 text-sm font-semibold text-brand-600 group-hover:text-brand-800">
        عرض التفاصيل ←
      </span>
    </Link>
  );
}
