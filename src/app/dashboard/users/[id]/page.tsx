import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getUserById } from "@/lib/admin";
import { getBranches, getDepartments } from "@/lib/data";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { UserForm } from "@/components/dashboard/user-form";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { PageTitle, Panel } from "@/components/dashboard/ui";
import { deleteUserAction, updateUserAction } from "../actions";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [actor, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t } = dashboard;
  if (!can(actor, "users:manage")) redirect("/dashboard");

  const target = await getUserById(id);
  if (!target) notFound();

  const [branches, departments] = await Promise.all([
    getBranches(),
    getDepartments(),
  ]);
  const updateAction = updateUserAction.bind(null, id);
  const isSelf = id === actor.id;

  return (
    <>
      <Link
        href="/dashboard/users"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronRight className="size-4" />
        {t.common.backToList}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title={t.users.editTitle.replace("{name}", target.name)} />
        {!isSelf && (
          <form action={deleteUserAction.bind(null, id)}>
            <ConfirmSubmit
              confirm={t.users.deleteConfirm}
              className="mb-6 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="size-4" />
              {t.common.delete}
            </ConfirmSubmit>
          </form>
        )}
      </div>

      <Panel className="p-6">
        <UserForm
          action={updateAction}
          user={target}
          branches={branches}
          departments={departments}
          dictionary={t}
          submitLabel={t.common.saveChanges}
        />
      </Panel>
    </>
  );
}
