"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import type { Branch, Department, User } from "@/lib/types";
import type { DashboardDictionary } from "@/lib/i18n/dashboard";
import type { FormState } from "@/app/dashboard/users/actions";

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const label = "mb-1.5 block text-sm font-semibold text-slate-700";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function UserForm({
  action,
  user,
  branches,
  departments,
  dictionary,
  submitLabel,
}: {
  action: Action;
  user?: User;
  branches: Branch[];
  departments: Department[];
  dictionary: DashboardDictionary;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );
  const isNew = !user;

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="size-5 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            {dictionary.forms.fullName} <span className="text-rose-500">*</span>
          </label>
          <input id="name" name="name" required defaultValue={user?.name ?? ""} className={input} />
        </div>
        <div>
          <label htmlFor="username" className={label}>
            {dictionary.forms.username} <span className="text-rose-500">*</span>
          </label>
          <input id="username" name="username" required dir="ltr" defaultValue={user?.username ?? ""} className={input + " text-start"} placeholder="username" />
        </div>
        <div>
          <label htmlFor="password" className={label}>
            {dictionary.forms.password} {isNew && <span className="text-rose-500">*</span>}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={isNew}
            dir="ltr"
            className={input + " text-start"}
            placeholder={isNew ? "••••••" : dictionary.forms.keepPassword}
          />
        </div>
        <div>
          <label htmlFor="role" className={label}>
            {dictionary.forms.role} <span className="text-rose-500">*</span>
          </label>
          <select id="role" name="role" defaultValue={user?.role ?? "editor"} className={input}>
            {(Object.keys(dictionary.labels.roles) as (keyof typeof dictionary.labels.roles)[]).map((r) => (
              <option key={r} value={r}>
                {dictionary.labels.roles[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="branchId" className={label}>
            {dictionary.forms.branch}
          </label>
          <select id="branchId" name="branchId" defaultValue={user?.branchId ?? ""} className={input}>
            <option value="">{dictionary.forms.noBranch}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="departmentId" className={label}>
            {dictionary.forms.department}
          </label>
          <select id="departmentId" name="departmentId" defaultValue={user?.departmentId ?? ""} className={input}>
            <option value="">{dictionary.forms.noDepartment}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={label}>
            {dictionary.forms.accountStatus}
          </label>
          <select id="status" name="status" defaultValue={user?.status ?? "active"} className={input}>
            <option value="active">{dictionary.labels.accountStatus.active}</option>
            <option value="disabled">{dictionary.labels.accountStatus.disabled}</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        {dictionary.forms.userHint}
      </p>

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
