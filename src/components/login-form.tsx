"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Lock, User } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white py-2.5 pe-11 ps-4 text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
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

      {from && <input type="hidden" name="from" value={from} />}

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
          اسم المستخدم
        </label>
        <div className="relative">
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            dir="ltr"
            className={inputClass + " text-start"}
            placeholder="admin"
          />
          <User className="absolute end-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            dir="ltr"
            className={inputClass + " text-start"}
            placeholder="••••••••"
          />
          <Lock className="absolute end-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending && <Loader2 className="size-5 animate-spin" />}
        {pending ? "جارٍ الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
