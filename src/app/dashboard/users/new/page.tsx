import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getBranches, getDepartments } from "@/lib/data";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { UserForm } from "@/components/dashboard/user-form";
import { PageTitle, Panel } from "@/components/dashboard/ui";
import { createUserAction } from "../actions";

export default async function NewUserPage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t } = dashboard;
  if (!can(user, "users:manage")) redirect("/dashboard");
  const [branches, departments] = await Promise.all([
    getBranches(),
    getDepartments(),
  ]);

  return (
    <>
      <Link
        href="/dashboard/users"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronRight className="size-4" />
        {t.common.backToList}
      </Link>
      <PageTitle title={t.users.newTitle} />
      <Panel className="p-6">
        <UserForm
          action={createUserAction}
          branches={branches}
          departments={departments}
          dictionary={t}
          submitLabel={t.users.createAccount}
        />
      </Panel>
    </>
  );
}
