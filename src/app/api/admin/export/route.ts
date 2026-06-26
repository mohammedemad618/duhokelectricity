import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listArticlesForUser, listComplaintsForUser } from "@/lib/admin";
import { getBranchNameMap } from "@/lib/data";
import {
  categoryLabels,
  complaintKindLabels,
  complaintStatusLabels,
  contentStatusLabels,
} from "@/lib/labels";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((r) => r.map(csvEscape).join(","));
  return "﻿" + lines.join("\r\n"); // BOM لضمان قراءة Excel للترميز UTF-8
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !can(session, "stats:view")) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type");
  const branchMap = await getBranchNameMap();

  let filename = "articles.csv";
  let csv: string;

  if (type === "complaints") {
    const items = await listComplaintsForUser(session);
    filename = "complaints.csv";
    csv = toCsv(
      ["المعرّف", "الموضوع", "النوع", "مقدّم الشكوى", "الهاتف", "المنطقة", "الفرع", "الحالة", "التاريخ"],
      items.map((c) => [
        c.id,
        c.subject,
        complaintKindLabels[c.kind],
        c.fullName,
        c.phone,
        c.area,
        c.branchId ? (branchMap[c.branchId] ?? c.branchId) : "",
        complaintStatusLabels[c.status],
        c.createdAt,
      ]),
    );
  } else {
    const items = await listArticlesForUser(session);
    csv = toCsv(
      ["المعرّف", "العنوان", "التصنيف", "الفرع", "الكاتب", "الحالة", "تاريخ الإنشاء", "تاريخ النشر"],
      items.map((a) => [
        a.id,
        a.title,
        categoryLabels[a.category],
        a.branchId ? (branchMap[a.branchId] ?? a.branchId) : "",
        a.author,
        contentStatusLabels[a.status],
        a.createdAt,
        a.status === "published" ? a.publishedAt : "",
      ]),
    );
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
