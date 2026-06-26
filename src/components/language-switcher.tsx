"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { locales, localeConfig, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function change(locale: Locale) {
    setOpen(false);
    await setLocale(locale);
    // إعادة تحميل كاملة لضمان تحديث اتجاه الصفحة (dir) واللغة
    window.location.reload();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 hover:text-accent-300"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="size-4" />
        <span>{localeConfig[current].name}</span>
      </button>

      {open && (
        <div className="absolute top-full z-50 mt-2 w-40 overflow-hidden rounded-xl bg-white p-1 text-slate-700 shadow-lg ring-1 ring-black/5 ltr:left-0 rtl:right-0">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => change(l)}
              dir={localeConfig[l].dir}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50",
                l === current && "font-bold text-brand-700",
              )}
            >
              {localeConfig[l].name}
              {l === current && <Check className="size-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
