import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Container } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

export default async function NotFound() {
  const dict = await getDictionary();
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="text-7xl font-extrabold text-brand-200">404</span>
      <h1 className="mt-4 text-2xl font-bold text-brand-900">
        {dict.notFound.title}
      </h1>
      <p className="mt-2 max-w-md text-slate-500">{dict.notFound.text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700"
        >
          <Home className="size-4" />
          {dict.nav.home}
        </Link>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Search className="size-4" />
          {dict.notFound.browseNews}
        </Link>
      </div>
    </Container>
  );
}
