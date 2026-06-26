import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getDb, Collections } from "@/lib/db";
import type { DepartmentType, Role, SessionUser, User } from "@/lib/types";

const COOKIE = "dohuk_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 أيام

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-secret-change-me",
  );
}

/* --------------------------- كلمات المرور --------------------------- */

export function hashPassword(pw: string): string {
  return bcrypt.hashSync(pw, 10);
}

export function verifyPassword(pw: string, hash: string): boolean {
  return bcrypt.compareSync(pw, hash);
}

/* ------------------------------ الجلسة ------------------------------ */

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    name: user.name,
    username: user.username,
    role: user.role,
    branchId: user.branchId,
    departmentId: user.departmentId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}

/** يقرأ الجلسة من الكوكي ويتحقّق منها (بدون الوصول لقاعدة البيانات) */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: payload.sub as string,
      name: payload.name as string,
      username: payload.username as string,
      role: payload.role as Role,
      branchId: payload.branchId as string | undefined,
      departmentId: payload.departmentId as DepartmentType | undefined,
    };
  } catch {
    return null;
  }
});

/** يتطلّب جلسة فعّالة وإلا يعيد التوجيه لتسجيل الدخول */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/* --------------------------- مستخدمو القاعدة --------------------------- */

type UserDoc = { _id: string } & Omit<User, "id">;

export async function findUserByUsername(
  username: string,
): Promise<User | undefined> {
  const db = await getDb();
  const doc = await db
    .collection<UserDoc>(Collections.users)
    .findOne({ username });
  if (!doc) return undefined;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

/** تسجيل الدخول: يتحقّق من المستخدم وكلمة المرور وينشئ الجلسة */
export async function login(
  username: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await findUserByUsername(username.trim());
  if (!user || user.status !== "active") {
    return { ok: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة." };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    branchId: user.branchId,
    departmentId: user.departmentId,
  });

  const db = await getDb();
  await db
    .collection<UserDoc>(Collections.users)
    .updateOne(
      { _id: user.id },
      { $set: { lastLoginAt: new Date().toISOString() } },
    );

  return { ok: true };
}
