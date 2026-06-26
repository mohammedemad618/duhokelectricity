import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getBranches } from "@/lib/data";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { AnnouncementForm } from "@/components/dashboard/announcement-form";
import { PageTitle, Panel } from "@/components/dashboard/ui";
import { createAnnouncementAction } from "../actions";

export default async function NewAnnouncementPage() {
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t } = dashboard;
  if (!can(user, "announcements:manage")) redirect("/dashboard");
  const branches = await getBranches();

  return (
    <>
      <Link
        href="/dashboard/announcements"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronRight className="size-4" />
        {t.common.backToList}
      </Link>
      <PageTitle title={t.announcements.newTitle} />
      <Panel className="p-6">
        <AnnouncementForm
          action={createAnnouncementAction}
          branches={branches}
          canChooseBranch={user.role === "super_admin"}
          dictionary={t}
          submitLabel={t.announcements.publish}
        />
      </Panel>
    </>
  );
}
