import { NextResponse } from "next/server";
import { getDb, Collections, type MongoDoc } from "@/lib/db";
import { branches } from "@/lib/data/branches";
import type { ComplaintKind } from "@/lib/types";

// تُخزَّن الشكاوى في مجموعة complaints بقاعدة MongoDB، وتُدار من لوحة التحكم.
interface Payload {
  fullName?: string;
  phone?: string;
  area?: string;
  branchId?: string;
  kind?: ComplaintKind;
  subject?: string;
  description?: string;
  attachmentName?: string;
  company?: string; // حقل فخّ لمكافحة الرسائل المزعجة (honeypot)
}

function str(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function validate(p: Payload): string[] {
  const errors: string[] = [];
  const fullName = str(p.fullName);
  const phone = str(p.phone);
  const area = str(p.area);
  const subject = str(p.subject);
  const description = str(p.description);

  if (fullName.length < 2 || fullName.length > 100)
    errors.push("الاسم الكامل مطلوب (2 إلى 100 حرف).");
  if (!/^[0-9+\s()-]{6,20}$/.test(phone)) errors.push("رقم هاتف غير صالح.");
  if (area.length < 2) errors.push("المنطقة مطلوبة.");
  if (p.kind !== "complaint" && p.kind !== "suggestion")
    errors.push("نوع الرسالة غير صالح.");
  if (subject.length < 3 || subject.length > 150)
    errors.push("عنوان الرسالة مطلوب (3 إلى 150 حرفاً).");
  if (description.length < 10 || description.length > 2000)
    errors.push("الوصف مطلوب (10 إلى 2000 حرف).");
  if (p.branchId && !branches.some((b) => b.id === p.branchId))
    errors.push("الفرع المحدّد غير معروف.");

  return errors;
}

function reference() {
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${Date.now().toString(36).toUpperCase()}-${rnd}`;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["تعذّر قراءة البيانات."] },
      { status: 400 },
    );
  }

  // فخّ مكافحة السبام: إن مُلئ هذا الحقل المخفي نعيد نجاحاً صورياً دون تخزين
  if (str(body.company)) {
    return NextResponse.json({ ok: true, reference: reference() });
  }

  const errors = validate(body);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const id = reference();
  const record = {
    _id: id,
    fullName: str(body.fullName),
    phone: str(body.phone),
    area: str(body.area),
    branchId: str(body.branchId) || undefined,
    kind: body.kind as ComplaintKind,
    subject: str(body.subject),
    description: str(body.description),
    attachmentName: str(body.attachmentName) || undefined,
    status: "new" as const,
    createdAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    await db.collection<MongoDoc>(Collections.complaints).insertOne(record);
  } catch (err) {
    console.error("فشل حفظ الشكوى:", err);
    return NextResponse.json(
      { ok: false, errors: ["حدث خطأ أثناء حفظ الرسالة، يرجى المحاولة لاحقاً."] },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, reference: id });
}
