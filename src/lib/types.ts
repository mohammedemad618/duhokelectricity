// ============================================================================
// نماذج البيانات — دائرة توزيع كهرباء دهوك
// هذه الأنواع تطابق نماذج قاعدة البيانات المقترحة (القسم 15 من الخطة)
// وتُستخدم حالياً مع بيانات تجريبية، وهي جاهزة للربط مع MongoDB لاحقاً.
// ============================================================================

/** أدوار المستخدمين ونظام الصلاحيات (القسم 11 من الخطة) */
export type Role =
  | "super_admin"
  | "branch_admin"
  | "department_admin"
  | "editor"
  | "reviewer";

/** مستخدم/موظف — Users (القسم 15.1) */
export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: Role;
  branchId?: string;
  departmentId?: DepartmentType;
  status: "active" | "disabled";
  lastLoginAt?: string;
  createdAt: string;
}

/** بيانات الجلسة المخزّنة في الكوكي (بدون كلمة المرور) */
export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  branchId?: string;
  departmentId?: DepartmentType;
}

/** نوع القسم داخل الفرع */
export type DepartmentType = "construction" | "projects" | "planning" | "services";

/** تصنيف المحتوى المنشور */
export type ArticleCategory = "news" | "construction" | "projects" | "planning";

/** حالة المحتوى ضمن دورة المراجعة والنشر (القسم 12) */
export type ContentStatus =
  | "draft"
  | "review"
  | "published"
  | "rejected"
  | "archived";

/** الفرع — Branches (القسم 15.2) */
export interface Branch {
  id: string; // معرّف/slug
  name: string;
  shortName?: string;
  description: string;
  location: string;
  phone: string;
  email?: string;
  manager?: string;
  status: "active" | "inactive";
}

/** القسم — Departments (القسم 15.3) */
export interface Department {
  id: string; // slug, مثل: construction
  name: string;
  type: DepartmentType;
  description: string;
  /** ملخص لما يعرضه القسم */
  highlights: string[];
}

/** خبر أو عمل/تقرير — News (القسم 15.4) */
export interface Article {
  id: string; // slug
  title: string;
  excerpt: string;
  /** محتوى مبسّط: فقرات مفصولة بسطر فارغ */
  content: string;
  category: ArticleCategory;
  branchId?: string;
  departmentId?: DepartmentType;
  author: string;
  /** معرّف المستخدم الذي أنشأ المحتوى (لفحص الملكية في سير المراجعة) */
  authorId?: string;
  status: ContentStatus;
  createdAt: string; // ISO
  publishedAt: string; // ISO
  updatedAt?: string;
  /** ملاحظة المراجِع عند الرفض أو إعادة المحتوى للتعديل */
  reviewNote?: string;
  location?: string;
  tags?: string[];
  /** عدد الصور المرفقة (للعرض كمعرض صور تجريبي) */
  imageCount?: number;
}

export type AnnouncementType =
  | "general"
  | "maintenance"
  | "outage"
  | "warning"
  | "urgent";

export type Importance = "normal" | "high" | "urgent";

/** إعلان رسمي — Announcements (القسم 15.5) */
export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  importance: Importance;
  branchId?: string;
  startsAt: string; // ISO
  endsAt?: string; // ISO
  status: "active" | "expired" | "draft";
  pinned?: boolean;
  createdBy?: string;
  createdAt?: string;
}

/** سؤال شائع */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/** سجلّ عملية إدارية — Audit Logs (القسم 15.8) */
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target?: string;
  details?: string;
  createdAt: string;
}

/** عنصر في تقرير (مفتاح + تسمية + عدد) */
export interface ReportBucket {
  key: string;
  label: string;
  count: number;
}

/** شكوى أو اقتراح — Complaints (القسم 15.6) */
export type ComplaintKind = "complaint" | "suggestion";

export type ComplaintStatus =
  | "new"
  | "review"
  | "assigned"
  | "processing"
  | "completed"
  | "rejected"
  | "closed";

export interface Complaint {
  id: string;
  fullName: string;
  phone: string;
  area: string;
  branchId?: string;
  kind: ComplaintKind;
  subject: string;
  description: string;
  status: ComplaintStatus;
  /** القسم الذي أُحيلت إليه الشكوى داخلياً */
  assignedDepartment?: DepartmentType;
  /** ملاحظة الموظف المختص */
  note?: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt?: string;
  closedAt?: string;
}
