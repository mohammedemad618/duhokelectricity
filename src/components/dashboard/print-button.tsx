"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "طباعة / PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 print:hidden"
    >
      <Printer className="size-4" />
      {label}
    </button>
  );
}
