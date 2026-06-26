import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getAnnouncementForEdit } from "@/lib/admin";
import { getBranches } from "@/lib/data";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { AnnouncementForm } from "@/components/dashboard/announcement-form";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { PageTitle, Panel } from "@/components/dashboard/ui";
import {
  deleteAnnouncementAction,
  updateAnnouncementAction,
} from "../actions";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t } = dashboard;
  if (!can(user, "announcements:manage")) redirect("/dashboard");

  const announcement = await getAnnouncementForEdit(id);
  if (!announcement) notFound();
  if (user.role === "branch_admin" && announcement.branchId !== user.branchId)
    redirect("/dashboard/announcements");

  const branches = await getBranches();
  const updateAction = updateAnnouncementAction.bind(null, id);

  return (
    <>
      <Link
        href="/dashboard/announcements"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronRight className="size-4" />
        {t.common.backToList}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title={t.announcements.editTitle} />
        <form action={deleteAnnouncementAction.bind(null, id)}>
          <ConfirmSubmit
            confirm={t.announcements.deleteConfirm}
            className="mb-6 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="size-4" />
            {t.common.delete}
          </ConfirmSubmit>
        </form>
      </div>

      <Panel className="p-6">
        <AnnouncementForm
          action={updateAction}
          announcement={announcement}
          branches={branches}
          canChooseBranch={user.role === "super_admin"}
          dictionary={t}
          submitLabel={t.common.saveChanges}
        />
      </Panel>
    </>
  );
}
