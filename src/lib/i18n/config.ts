// إعدادات تعدّد اللغات (i18n)
export const locales = ["ar", "ku", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const LOCALE_COOKIE = "locale";

export const localeConfig: Record<
  Locale,
  { name: string; dir: "rtl" | "ltr"; htmlLang: string }
> = {
  ar: { name: "العربية", dir: "rtl", htmlLang: "ar" },
  ku: { name: "کوردی", dir: "rtl", htmlLang: "kmr" },
  en: { name: "English", dir: "ltr", htmlLang: "en" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
