import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { FaqItem } from "@/lib/types";
import { getFaqItems } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { Container, PageHeader } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.faq.title, description: dict.faq.description };
}

export default async function FaqPage() {
  const [items, dict] = await Promise.all([getFaqItems(), getDictionary()]);

  const groups = new Map<string, FaqItem[]>();
  for (const item of items) {
    const key = item.category ?? "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return (
    <>
      <PageHeader
        title={dict.faq.title}
        description={dict.faq.description}
        breadcrumbs={[
          { label: dict.nav.home, href: "/" },
          { label: dict.nav.faq },
        ]}
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl space-y-10">
          {[...groups.entries()].map(([category, list]) => (
            <section key={category}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-900">
                <HelpCircle className="size-5 text-brand-500" />
                {category}
              </h2>
              <div className="space-y-3">
                {list.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-2xl border border-[var(--border)] bg-white px-5 open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-brand-900 marker:hidden [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="pb-5 leading-8 text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-2xl bg-gradient-to-bl from-brand-700 to-brand-900 p-8 text-center text-white">
            <h2 className="text-xl font-bold">{dict.faq.notFoundTitle}</h2>
            <p className="mx-auto mt-2 max-w-xl text-brand-100">
              {dict.faq.notFoundText}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-xl bg-accent-500 px-6 py-2.5 font-bold text-brand-950 transition hover:bg-accent-400"
              >
                {dict.nav.contact}
              </Link>
              <Link
                href="/complaints"
                className="rounded-xl bg-white/10 px-6 py-2.5 font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
              >
                {dict.faq.sendInquiry}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
