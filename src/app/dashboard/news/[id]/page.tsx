import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  Eye,
  Send,
  Trash2,
  XCircle,
  Archive,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can, canEditArticle, canReviewArticle } from "@/lib/permissions";
import { getArticleForEdit } from "@/lib/admin";
import { getBranches, getDepartments } from "@/lib/data";
import { contentStatusClass } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { ArticleForm } from "@/components/dashboard/article-form";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { PageTitle, Panel, StatusBadge } from "@/components/dashboard/ui";
import {
  archiveArticleAction,
  deleteArticleAction,
  publishArticleAction,
  rejectArticleAction,
  submitForReviewAction,
  updateArticleAction,
} from "../actions";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [user, dashboard] = await Promise.all([
    requireUser(),
    getDashboardDictionary(),
  ]);
  const { t, locale } = dashboard;
  const article = await getArticleForEdit(id);
  if (!article) notFound();

  const editable = canEditArticle(user, article);
  const reviewable = canReviewArticle(user, article);
  if (!editable && !reviewable) redirect("/dashboard/news");

  const [branches, departments] = await Promise.all([
    getBranches(),
    getDepartments(),
  ]);

  const canSubmit =
    editable && can(user, "content:submit") &&
    ["draft", "rejected"].includes(article.status);
  const canPublish =
    reviewable && ["draft", "review", "archived"].includes(article.status);
  const canReject = reviewable && article.status === "review";
  const canArchive = reviewable && article.status === "published";
  const canDelete = can(user, "content:delete") && editable;

  const updateAction = updateArticleAction.bind(null, id);

  return (
    <>
      <Link
        href="/dashboard/news"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        <ChevronRight className="size-4" />
        {t.common.backToList}
      </Link>

      <PageTitle title={article.title} />

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-5" />
          {t.common.saved}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* المحتوى / التحرير */}
        <div className="lg:col-span-2">
          <Panel className="p-6">
            {editable ? (
              <ArticleForm
                action={updateAction}
                article={article}
                branches={branches}
                departments={departments}
                canChooseBranch={user.role === "super_admin"}
                canChooseDepartment={
                  user.role === "super_admin" || user.role === "branch_admin"
                }
                dictionary={t}
                submitLabel={t.common.saveChanges}
              />
            ) : (
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <Eye className="size-4" />
                  {t.news.previewOnly}
                </div>
                <h2 className="text-lg font-bold text-slate-800">{article.title}</h2>
                <p className="mt-2 font-medium text-slate-600">{article.excerpt}</p>
                <div className="article-body mt-4">
                  {article.content.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* لوحة سير العمل */}
        <aside className="space-y-6">
          <Panel title={t.news.workflow} className="p-5">
            <div className="mb-4">
              <StatusBadge
                label={t.labels.contentStatus[article.status]}
                className={contentStatusClass[article.status]}
              />
            </div>

            {article.status === "rejected" && article.reviewNote && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <strong className="block">{t.news.reviewerNote}</strong>
                {article.reviewNote}
              </div>
            )}

            <div className="space-y-2">
              {canSubmit && (
                <form action={submitForReviewAction.bind(null, id)}>
                  <ConfirmSubmit className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600">
                    <Send className="size-4" />
                    {t.news.submitForReview}
                  </ConfirmSubmit>
                </form>
              )}
              {canPublish && (
                <form action={publishArticleAction.bind(null, id)}>
                  <ConfirmSubmit className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                    <CheckCircle2 className="size-4" />
                    {article.status === "review" ? t.news.approvePublish : t.news.publish}
                  </ConfirmSubmit>
                </form>
              )}
              {canReject && (
                <form action={rejectArticleAction.bind(null, id)} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <label className="block text-xs font-semibold text-slate-600">
                    {t.news.rejectReason}
                  </label>
                  <textarea
                    name="note"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    placeholder={t.news.rejectPlaceholder}
                  />
                  <ConfirmSubmit className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">
                    <XCircle className="size-4" />
                    {t.news.reject}
                  </ConfirmSubmit>
                </form>
              )}
              {canArchive && (
                <form action={archiveArticleAction.bind(null, id)}>
                  <ConfirmSubmit className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                    <Archive className="size-4" />
                    {t.news.archive}
                  </ConfirmSubmit>
                </form>
              )}
              {canDelete && (
                <form action={deleteArticleAction.bind(null, id)}>
                  <ConfirmSubmit
                    confirm={t.news.deleteConfirm}
                    className="w-full rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-4" />
                    {t.common.delete}
                  </ConfirmSubmit>
                </form>
              )}
            </div>
          </Panel>

          <Panel title={t.news.info} className="p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.table.category}</dt>
                <dd className="font-medium text-slate-700">
                  {t.labels.categories[article.category]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.news.author}</dt>
                <dd className="font-medium text-slate-700">{article.author}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.news.createdAt}</dt>
                <dd className="font-medium text-slate-700">
                  {formatDate(article.createdAt, locale)}
                </dd>
              </div>
              {article.status === "published" && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">{t.news.publishedAt}</dt>
                  <dd className="font-medium text-slate-700">
                    {formatDate(article.publishedAt, locale)}
                  </dd>
                </div>
              )}
            </dl>
            {article.status === "published" && (
              <Link
                href={`/news/${article.id}`}
                target="_blank"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
              >
                <Eye className="size-4" />
                {t.news.viewOnSite}
              </Link>
            )}
          </Panel>
        </aside>
      </div>
    </>
  );
}
