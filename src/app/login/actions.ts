"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "");

  if (!username || !password) {
    return { error: "يرجى إدخال اسم المستخدم وكلمة المرور." };
  }

  const res = await login(username, password);
  if (!res.ok) {
    return { error: res.error };
  }

  const target = from.startsWith("/dashboard") ? from : "/dashboard";
  redirect(target);
}
