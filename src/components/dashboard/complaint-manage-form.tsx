"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import type { Complaint, Department } from "@/lib/types";
import type { DashboardDictionary } from "@/lib/i18n/dashboard";
import type { FormState } from "@/app/dashboard/complaints/actions";

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const label = "mb-1.5 block text-sm font-semibold text-slate-700";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ComplaintManageForm({
  action,
  complaint,
  departments,
  canAssign,
  dictionary,
}: {
  action: Action;
  complaint: Complaint;
  departments: Department[];
  canAssign: boolean;
  dictionary: DashboardDictionary;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="size-5 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="status" className={label}>
          {dictionary.forms.status}
        </label>
        <select id="status" name="status" defaultValue={complaint.status} className={input}>
          {(Object.keys(dictionary.labels.complaintStatus) as (keyof typeof dictionary.labels.complaintStatus)[]).map((s) => (
            <option key={s} value={s}>
              {dictionary.labels.complaintStatus[s]}
            </option>
          ))}
        </select>
      </div>

      {canAssign && (
        <div>
          <label htmlFor="assignedDepartment" className={label}>
            {dictionary.forms.assignDepartment}
          </label>
          <select
            id="assignedDepartment"
            name="assignedDepartment"
            defaultValue={complaint.assignedDepartment ?? ""}
            className={input}
          >
            <option value="">{dictionary.forms.noAssignment}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="note" className={label}>
          {dictionary.forms.staffNote}
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={complaint.note ?? ""}
          className={input + " resize-y"}
          placeholder={dictionary.forms.complaintNotePlaceholder}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
        {dictionary.forms.saveUpdate}
      </button>
    </form>
  );
}
