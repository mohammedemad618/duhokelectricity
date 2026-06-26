import { cookies } from "next/headers";
import { cache } from "react";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  localeConfig,
  type Locale,
} from "./config";
import { ar, type Dictionary } from "./dictionaries/ar";
import { en } from "./dictionaries/en";
import { ku } from "./dictionaries/ku";

const dictionaries: Record<Locale, Dictionary> = { ar, ku, en };

/** اللغة الحالية من الكوكي (افتراضياً العربية) */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
});

/** قاموس اللغة الحالية */
export const getDictionary = cache(async (): Promise<Dictionary> => {
  const locale = await getLocale();
  return dictionaries[locale];
});

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return localeConfig[locale].dir;
}

export type { Dictionary };
export { type Locale };
