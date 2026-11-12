"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  checkPassword,
  createSessionToken,
  DISABLED_MESSAGE,
  SESSION_MS,
  verifySessionToken,
} from "@/lib/admin-auth";
import { deleteNote } from "@/lib/guestbook";

const ADMIN_PATH = "/guestbook/admin";

function secrets(): { password: string; secret: string } | null {
  const password = process.env.GUESTBOOK_ADMIN_PASSWORD;
  const secret = process.env.GUESTBOOK_SECRET;
  return password && secret ? { password, secret } : null;
}

async function isAdmin(secret: string): Promise<boolean> {
  return verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value, secret);
}

export async function login(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const s = secrets();
  if (!s) return { error: DISABLED_MESSAGE };

  const given = form.get("password");
  if (typeof given !== "string" || !checkPassword(given, s.password)) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // slow down guessing
    return { error: "Wrong password." };
  }

  (await cookies()).set(ADMIN_COOKIE, createSessionToken(s.secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: ADMIN_PATH,
    maxAge: SESSION_MS / 1000,
  });
  redirect(ADMIN_PATH);
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: ADMIN_PATH });
  redirect(ADMIN_PATH);
}

export async function deleteNoteAction(form: FormData): Promise<void> {
  const s = secrets();
  if (!s || !(await isAdmin(s.secret))) return;

  const id = Number(form.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) return;

  await deleteNote(id);
  revalidatePath("/guestbook");
  revalidatePath(ADMIN_PATH);
}
