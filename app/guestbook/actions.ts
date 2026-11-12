"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { collegeExists, searchCollegeOptions, type CollegeOption } from "@/lib/colleges";
import { countRecentByIp, insertNote } from "@/lib/guestbook";
import { clientIpFrom, hashIp } from "@/lib/guestbook-ip";
import { COMMS_DOWN_MESSAGE, submitNoteCore, type SubmitState } from "@/lib/guestbook-submit";

export async function submitNote(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const secret = process.env.GUESTBOOK_SECRET;
  if (!secret) {
    console.error("[guestbook] GUESTBOOK_SECRET is not set; refusing submissions");
    return { status: "error", message: COMMS_DOWN_MESSAGE };
  }

  const ipHash = hashIp(clientIpFrom(await headers()), secret);
  const state = await submitNoteCore(form, ipHash, {
    collegeExists,
    countRecentByIp: (h) => countRecentByIp(h),
    insertNote,
    now: Date.now,
  });

  if (state.status === "success") revalidatePath("/guestbook");
  return state;
}

export async function searchCollegesAction(query: string): Promise<CollegeOption[]> {
  return searchCollegeOptions(String(query).slice(0, 80));
}
