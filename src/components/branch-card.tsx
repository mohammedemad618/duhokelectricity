import Link from "next/link";
import { ChevronLeft, MapPin, PhoneCall } from "lucide-react";
import type { Branch } from "@/lib/types";

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <Link
      href={`/branches/${branch.id}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <MapPin className="size-5" />
        </span>
        <ChevronLeft className="size-5 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-brand-500" />
      </div>
      <h3 className="text-lg font-bold text-brand-900 group-hover:text-brand-700">
        {branch.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-slate-600 line-clamp-3">
        {branch.description}
      </p>
      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-slate-400" />
          <span>{branch.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneCall className="size-4 shrink-0 text-slate-400" />
          <span dir="ltr">{branch.phone}</span>
        </div>
      </div>
    </Link>
  );
}
