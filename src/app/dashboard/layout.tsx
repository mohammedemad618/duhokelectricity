import { requireUser } from "@/lib/auth";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { DashboardShell } from "@/components/dashboard/shell";

export async function generateMetadata() {
  const { t } = await getDashboardDictionary();
  return {
    title: t.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  return (
    <DashboardShell
      user={user}
      locale={dashboard.locale}
      dir={dashboard.dir}
      dictionary={dashboard.t}
    >
      {children}
    </DashboardShell>
  );
}
