import type {
  AnnouncementType,
  ArticleCategory,
  ComplaintKind,
  ComplaintStatus,
  ContentStatus,
  Importance,
} from "@/lib/types";

/* تسميات وألوان التصنيفات والإعلانات للعرض في الواجهة */

export const categoryLabels: Record<ArticleCategory, string> = {
  news: "أخبار",
  construction: "أعمال التشييد",
  projects: "المشاريع والبناء",
  planning: "التخطيط",
};

/** أصناف Tailwind للشارة (Badge) حسب التصنيف */
export const categoryBadgeClass: Record<ArticleCategory, string> = {
  news: "bg-brand-50 text-brand-700 ring-brand-200",
  construction: "bg-accent-50 text-accent-700 ring-accent-200",
  projects: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  planning: "bg-violet-50 text-violet-700 ring-violet-200",
};

export const announcementTypeLabels: Record<AnnouncementType, string> = {
  general: "عام",
  maintenance: "صيانة",
  outage: "انقطاع",
  warning: "تحذير",
  urgent: "عاجل",
};

export const announcementTypeClass: Record<AnnouncementType, string> = {
  general: "bg-brand-50 text-brand-700 ring-brand-200",
  maintenance: "bg-amber-50 text-amber-700 ring-amber-200",
  outage: "bg-orange-50 text-orange-700 ring-orange-200",
  warning: "bg-rose-50 text-rose-700 ring-rose-200",
  urgent: "bg-red-50 text-red-700 ring-red-200",
};

export const importanceLabels: Record<Importance, string> = {
  normal: "عادي",
  high: "مهم",
  urgent: "عاجل",
};

/* --- حالات المحتوى (سير المراجعة والنشر) --- */

export const contentStatusLabels: Record<ContentStatus, string> = {
  draft: "مسودة",
  review: "قيد المراجعة",
  published: "منشور",
  rejected: "مرفوض",
  archived: "مؤرشف",
};

export const contentStatusClass: Record<ContentStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  review: "bg-amber-50 text-amber-700 ring-amber-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  archived: "bg-slate-100 text-slate-500 ring-slate-200",
};

/* --- حالات الشكاوى --- */

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  new: "جديدة",
  review: "قيد المراجعة",
  assigned: "محالة إلى قسم",
  processing: "قيد المعالجة",
  completed: "مكتملة",
  rejected: "مرفوضة",
  closed: "مغلقة",
};

export const complaintStatusClass: Record<ComplaintStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  review: "bg-amber-50 text-amber-700 ring-amber-200",
  assigned: "bg-violet-50 text-violet-700 ring-violet-200",
  processing: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const complaintKindLabels: Record<ComplaintKind, string> = {
  complaint: "شكوى",
  suggestion: "مقترح",
};
