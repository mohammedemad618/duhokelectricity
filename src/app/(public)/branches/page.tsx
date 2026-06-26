import type { Metadata } from "next";
import { getBranches } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { Container, PageHeader } from "@/components/ui";
import { BranchCard } from "@/components/branch-card";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.branches, description: dict.branches.description };
}

export default async function BranchesPage() {
  const [branches, dict] = await Promise.all([getBranches(), getDictionary()]);
  return (
    <>
      <PageHeader
        title={dict.branches.title}
        description={dict.branches.description}
        breadcrumbs={[
          { label: dict.nav.home, href: "/" },
          { label: dict.nav.branches },
        ]}
      />
      <Container className="py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>
      </Container>
    </>
  );
}
