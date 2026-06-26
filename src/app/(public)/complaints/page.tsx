import type { Metadata } from "next";
import { PhoneCall } from "lucide-react";
import { getBranches } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { getDictionary } from "@/lib/i18n";
import { Container, PageHeader } from "@/components/ui";
import { ComplaintForm } from "@/components/complaint-form";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.complaints.title, description: dict.complaints.description };
}

export default async function ComplaintsPage() {
  const [branches, dict] = await Promise.all([getBranches(), getDictionary()]);
  const options = branches.map((b) => ({ id: b.id, name: b.name }));

  return (
    <>
      <PageHeader
        title={dict.complaints.title}
        description={dict.complaints.description}
        breadcrumbs={[
          { label: dict.nav.home, href: "/" },
          { label: dict.nav.complaints },
        ]}
      />

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ComplaintForm branches={options} t={dict.complaints} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <h3 className="mb-4 font-bold text-brand-900">
                {dict.complaints.howTitle}
              </h3>
              <ol className="space-y-4">
                {dict.complaints.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-7 text-slate-600">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-gradient-to-bl from-brand-700 to-brand-900 p-6 text-white">
              <div className="flex items-center gap-3">
                <PhoneCall className="size-8 shrink-0 text-accent-400" />
                <div>
                  <p className="text-sm text-brand-100">
                    {dict.complaints.emergencyTitle}
                  </p>
                  <a
                    href={`tel:${siteConfig.contact.emergency}`}
                    className="text-2xl font-extrabold"
                    dir="ltr"
                  >
                    {siteConfig.contact.emergency}
                  </a>
                </div>
              </div>
              <p className="mt-3 text-sm text-brand-200">
                {dict.complaints.emergencyNote}
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
