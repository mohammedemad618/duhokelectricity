import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { getSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "تسجيل دخول الموظفين" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const { from } = await searchParams;

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-gradient-to-bl from-brand-800 via-brand-900 to-brand-950 p-4">
      <div className="w-full max-w-md">
        {/* الهوية */}
        <div className="mb-6 text-center text-white">
          <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Zap className="size-8 fill-accent-400 text-accent-400" />
          </span>
          <h1 className="text-xl font-bold">{siteConfig.name}</h1>
          <p className="mt-1 text-sm text-brand-200">
            بوابة دخول الموظفين — لوحة التحكم
          </p>
        </div>

        {/* البطاقة */}
        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <LoginForm from={from} />

          {/* تلميح بيانات تجريبية (للعرض فقط) */}
          <details className="mt-6 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-700">
              بيانات دخول تجريبية (للعرض)
            </summary>
            <ul className="mt-2 space-y-1 font-mono text-xs" dir="ltr">
              <li>admin / Admin@123 — المدير العام</li>
              <li>dohuk_admin / Branch@123 — مدير فرع</li>
              <li>construction_admin / Dept@123 — مسؤول قسم</li>
              <li>editor / Editor@123 — محرر</li>
              <li>reviewer / Review@123 — مراجِع</li>
            </ul>
          </details>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-brand-200 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            العودة إلى الموقع الرسمي
          </Link>
        </div>
      </div>
    </div>
  );
}
