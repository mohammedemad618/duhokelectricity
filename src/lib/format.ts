// تنسيق التواريخ بالأشهر الميلادية بالتسمية المعتمدة في العراق وأرقام لاتينية
// (تنسيق ثابت لتفادي اختلاف العرض بين الخادم والمتصفّح)

const MONTHS_AR = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

const localeMap = {
  ar: "ar-IQ",
  ku: "ku-IQ",
  en: "en-US",
} as const;

type DateLocale = keyof typeof localeMap;

export function formatDate(iso: string, locale: DateLocale = "ar"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (locale !== "ar") {
    return new Intl.DateTimeFormat(localeMap[locale], {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  }
  return `${d.getUTCDate()} ${MONTHS_AR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getUTCFullYear()}`;
}

export function formatDateTime(iso: string, locale: DateLocale = "ar"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(iso, locale)} — ${hh}:${mm}`;
}
