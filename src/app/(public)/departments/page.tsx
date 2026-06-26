import type { Metadata } from "next";
import { getDepartments } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { Container, PageHeader } from "@/components/ui";
import { DepartmentCard } from "@/components/department-card";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.departments, description: dict.departments.description };
}

export default async function DepartmentsPage() {
  const [departments, dict] = await Promise.all([
    getDepartments(),
    getDictionary(),
  ]);
  return (
    <>
      <PageHeader
        title={dict.departments.title}
        description={dict.departments.description}
        breadcrumbs={[
          { label: dict.nav.home, href: "/" },
          { label: dict.nav.departments },
        ]}
      />
      <Container className="py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d) => (
            <DepartmentCard key={d.id} department={d} />
          ))}
        </div>
      </Container>
    </>
  );
}
