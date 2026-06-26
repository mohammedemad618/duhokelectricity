import type { Metadata } from "next";
import { Cairo, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { localeConfig } from "@/lib/i18n/config";
import { dirFor, getDictionary, getLocale } from "@/lib/i18n";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// خط رسمي بتغطية كاملة للحروف الكردية (ڤ ێ ۆ ڕ ە) — يُطبَّق على اللغة الكردية
const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-kurdish",
  subsets: ["arabic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: {
      default: dict.org.name,
      template: `%s | ${dict.org.name}`,
    },
    description: dict.org.description,
    keywords: [
      "كهرباء دهوك",
      "Dohuk electricity",
      "دائرة توزيع كهرباء دهوك",
      "وزارة الكهرباء",
      "إقليم كوردستان",
    ],
    authors: [{ name: dict.org.name }],
    openGraph: {
      title: dict.org.name,
      description: dict.org.description,
      type: "website",
    },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={localeConfig[locale].htmlLang}
      dir={dirFor(locale)}
      className={`${cairo.variable} ${notoKufi.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
