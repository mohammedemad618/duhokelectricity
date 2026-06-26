"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import type { Article, Branch, Department } from "@/lib/types";
import type { DashboardDictionary } from "@/lib/i18n/dashboard";
import type { FormState } from "@/app/dashboard/news/actions";

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const label = "mb-1.5 block text-sm font-semibold text-slate-700";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ArticleForm({
  action,
  article,
  branches,
  departments,
  canChooseBranch,
  canChooseDepartment,
  dictionary,
  submitLabel,
}: {
  action: Action;
  article?: Article;
  branches: Branch[];
  departments: Department[];
  canChooseBranch: boolean;
  canChooseDepartment: boolean;
  dictionary: DashboardDictionary;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

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
          <label htmlFor="category" className={label}>
            {dictionary.forms.category}
          </label>
          <select id="category" name="category" defaultValue={article?.category ?? "news"} className={input}>
            {(Object.keys(dictionary.labels.categories) as (keyof typeof dictionary.labels.categories)[]).map((c) => (
              <option key={c} value={c}>
                {dictionary.labels.categories[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className={label}>
            {dictionary.forms.location}
          </label>
          <input id="location" name="location" defaultValue={article?.location ?? ""} className={input} />
        </div>
      </div>

      <div>
          <label htmlFor="title" className={label}>
          {dictionary.forms.title} <span className="text-rose-500">*</span>
        </label>
        <input id="title" name="title" required defaultValue={article?.title ?? ""} className={input} />
      </div>

      <div>
          <label htmlFor="excerpt" className={label}>
          {dictionary.forms.excerpt} <span className="text-rose-500">*</span>
        </label>
        <textarea id="excerpt" name="excerpt" required rows={2} defaultValue={article?.excerpt ?? ""} className={input + " resize-y"} />
      </div>

      <div>
          <label htmlFor="content" className={label}>
          {dictionary.forms.content} <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          defaultValue={article?.content ?? ""}
          className={input + " resize-y leading-8"}
          placeholder={dictionary.forms.contentPlaceholder}
        />
        <p className="mt-1 text-xs text-slate-400">
          {dictionary.forms.contentHint}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {canChooseBranch && (
          <div>
            <label htmlFor="branchId" className={label}>
              {dictionary.forms.branch}
            </label>
            <select id="branchId" name="branchId" defaultValue={article?.branchId ?? ""} className={input}>
              <option value="">{dictionary.forms.noBranch}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {canChooseDepartment && (
          <div>
            <label htmlFor="departmentId" className={label}>
              {dictionary.forms.department}
            </label>
            <select id="departmentId" name="departmentId" defaultValue={article?.departmentId ?? ""} className={input}>
              <option value="">{dictionary.forms.noDepartment}</option>
              {departments
                .filter((d) => d.type !== "services")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="tags" className={label}>
            {dictionary.forms.tags}
          </label>
          <input id="tags" name="tags" defaultValue={article?.tags?.join("، ") ?? ""} className={input} />
        </div>
        <div>
          <label htmlFor="imageCount" className={label}>
            {dictionary.forms.imageCount}
          </label>
          <input id="imageCount" name="imageCount" type="number" min={0} defaultValue={article?.imageCount ?? 0} className={input} />
        </div>
      </div>

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
