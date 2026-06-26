"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import type { Announcement, Branch } from "@/lib/types";
import type { DashboardDictionary } from "@/lib/i18n/dashboard";
import type { FormState } from "@/app/dashboard/announcements/actions";

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const label = "mb-1.5 block text-sm font-semibold text-slate-700";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function AnnouncementForm({
  action,
  announcement,
  branches,
  canChooseBranch,
  dictionary,
  submitLabel,
}: {
  action: Action;
  announcement?: Announcement;
  branches: Branch[];
  canChooseBranch: boolean;
  dictionary: DashboardDictionary;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );
  const dateVal = (iso?: string) => (iso ? iso.slice(0, 10) : "");

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="size-5 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className={label}>
          {dictionary.forms.announcementTitle} <span className="text-rose-500">*</span>
        </label>
        <input id="title" name="title" required defaultValue={announcement?.title ?? ""} className={input} />
      </div>

      <div>
        <label htmlFor="body" className={label}>
          {dictionary.forms.announcementBody} <span className="text-rose-500">*</span>
        </label>
        <textarea id="body" name="body" required rows={4} defaultValue={announcement?.body ?? ""} className={input + " resize-y leading-7"} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className={label}>{dictionary.forms.type}</label>
          <select id="type" name="type" defaultValue={announcement?.type ?? "general"} className={input}>
            {(Object.keys(dictionary.labels.announcementTypes) as (keyof typeof dictionary.labels.announcementTypes)[]).map((t) => (
              <option key={t} value={t}>{dictionary.labels.announcementTypes[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="importance" className={label}>{dictionary.forms.importance}</label>
          <select id="importance" name="importance" defaultValue={announcement?.importance ?? "normal"} className={input}>
            {(Object.keys(dictionary.labels.importance) as (keyof typeof dictionary.labels.importance)[]).map((i) => (
              <option key={i} value={i}>{dictionary.labels.importance[i]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="startsAt" className={label}>{dictionary.forms.startsAt}</label>
          <input id="startsAt" name="startsAt" type="date" defaultValue={dateVal(announcement?.startsAt) || new Date().toISOString().slice(0, 10)} className={input} dir="ltr" />
        </div>
        <div>
          <label htmlFor="endsAt" className={label}>{dictionary.forms.endsAt}</label>
          <input id="endsAt" name="endsAt" type="date" defaultValue={dateVal(announcement?.endsAt)} className={input} dir="ltr" />
        </div>
        <div>
          <label htmlFor="status" className={label}>{dictionary.forms.status}</label>
          <select id="status" name="status" defaultValue={announcement?.status ?? "active"} className={input}>
            {(Object.keys(dictionary.labels.announcementStatus) as (keyof typeof dictionary.labels.announcementStatus)[]).map((s) => (
              <option key={s} value={s}>{dictionary.labels.announcementStatus[s]}</option>
            ))}
          </select>
        </div>
        {canChooseBranch && (
          <div>
            <label htmlFor="branchId" className={label}>{dictionary.forms.optionalBranch}</label>
            <select id="branchId" name="branchId" defaultValue={announcement?.branchId ?? ""} className={input}>
              <option value="">{dictionary.forms.globalAnnouncement}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" name="pinned" defaultChecked={announcement?.pinned} className="size-4 rounded border-slate-300" />
        {dictionary.forms.pinAnnouncement}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
        {submitLabel ?? dictionary.common.save}
      </button>
    </form>
  );
}
