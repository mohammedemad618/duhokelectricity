"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Paperclip } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

type BranchOption = { id: string; name: string };
type T = Dictionary["complaints"];

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

export function ComplaintForm({
  branches,
  t,
}: {
  branches: BranchOption[];
  t: T;
}) {
  const [kind, setKind] = useState<"complaint" | "suggestion">("complaint");
  const [attachmentName, setAttachmentName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [reference, setReference] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors([]);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      kind,
      fullName: data.get("fullName"),
      phone: data.get("phone"),
      area: data.get("area"),
      branchId: data.get("branchId") || undefined,
      subject: data.get("subject"),
      description: data.get("description"),
      attachmentName: attachmentName || undefined,
      company: data.get("company"),
    };

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setReference(json.reference);
        setStatus("success");
        form.reset();
        setAttachmentName("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors(json.errors ?? [t.errorGeneric]);
        setStatus("error");
      }
    } catch {
      setErrors([t.errorNetwork]);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
        <h3 className="mt-4 text-xl font-bold text-emerald-800">{t.successTitle}</h3>
        <p className="mt-2 text-emerald-700">{t.successText}</p>
        <div className="mx-auto mt-4 inline-block rounded-xl bg-white px-5 py-3 ring-1 ring-emerald-200">
          <span className="text-sm text-slate-500">{t.reference}</span>{" "}
          <span className="font-bold text-brand-800" dir="ltr">
            {reference}
          </span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            {t.sendAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8"
    >
      {status === "error" && errors.length > 0 && (
        <div className="mb-6 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="size-5 shrink-0" />
          <ul className="space-y-1">
            {errors.map((er, i) => (
              <li key={i}>{er}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-5">
        <span className={labelClass}>{t.kind}</span>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "complaint", label: t.complaint },
              { value: "suggestion", label: t.suggestion },
            ] as const
          ).map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setKind(opt.value)}
              className={
                "rounded-xl border px-4 py-2.5 font-semibold transition " +
                (kind === opt.value
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")
              }
              aria-pressed={kind === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            {t.fullName} <span className="text-rose-500">*</span>
          </label>
          <input id="fullName" name="fullName" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            {t.phone} <span className="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            inputMode="tel"
            required
            dir="ltr"
            className={inputClass}
            placeholder="07XX XXX XXXX"
          />
        </div>
        <div>
          <label htmlFor="area" className={labelClass}>
            {t.area} <span className="text-rose-500">*</span>
          </label>
          <input id="area" name="area" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="branchId" className={labelClass}>
            {t.branch}
          </label>
          <select id="branchId" name="branchId" className={inputClass}>
            <option value="">{t.branchOptional}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="subject" className={labelClass}>
          {t.subject} <span className="text-rose-500">*</span>
        </label>
        <input id="subject" name="subject" required className={inputClass} />
      </div>

      <div className="mt-5">
        <label htmlFor="description" className={labelClass}>
          {t.descriptionLabel} <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          className={inputClass + " resize-y"}
          placeholder={t.descriptionPlaceholder}
        />
      </div>

      <div className="mt-5">
        <span className={labelClass}>{t.attachment}</span>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 transition hover:border-brand-300 hover:bg-brand-50/40">
          <Paperclip className="size-5 text-slate-400" />
          <span>{attachmentName || t.attachmentHint}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-base font-bold text-brand-950 shadow-sm transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" && <Loader2 className="size-5 animate-spin" />}
        {status === "submitting" ? t.sending : t.send}
      </button>
    </form>
  );
}
