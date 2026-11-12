import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import DeleteButton from "@/components/guestbook/admin/DeleteButton";
import LoginForm from "@/components/guestbook/admin/LoginForm";
import { ADMIN_COOKIE, DISABLED_MESSAGE, verifySessionToken } from "@/lib/admin-auth";
import { getCollege } from "@/lib/colleges";
import { listAllNotes } from "@/lib/guestbook";
import { REASON_LABELS, type AdminNote } from "@/lib/guestbook-types";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Guestbook admin — Jacob Tang",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const LABEL = "font-mono text-xs uppercase tracking-label";
// Jacob is in LA; the server runs in UTC.
const when = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Los_Angeles" });

function school(n: AdminNote): string {
  if (n.collegeNone === "outside_us") return "outside the US";
  if (n.collegeNone === "not_listed") return "not listed";
  return (n.collegeId && getCollege(n.collegeId)?.name) || "unknown school";
}

async function loadNotes(onlyFeedback: boolean): Promise<AdminNote[] | null> {
  try {
    return await listAllNotes(onlyFeedback);
  } catch (err) {
    console.error("[guestbook] admin load failed", err);
    return null;
  }
}

export default async function GuestbookAdminPage({ searchParams }: { searchParams: Promise<{ feedback?: string }> }) {
  const secret = process.env.GUESTBOOK_SECRET;
  const enabled = Boolean(secret && process.env.GUESTBOOK_ADMIN_PASSWORD);
  const signedIn = enabled && verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value, secret!);
  const onlyFeedback = (await searchParams).feedback === "1";
  const notes = signedIn ? await loadNotes(onlyFeedback) : [];

  return (
    <main className="min-h-screen bg-[#06110b] px-4 pb-24 pt-28 text-[#c8ffd9] sm:px-8">
      <div className="mx-auto flex max-w-[900px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`m-0 ${LABEL} text-[#7dffa0]`}>JT-01 // Guestbook // Admin</p>
            <h1 className="wide m-0 mt-2 font-display text-3xl font-extrabold uppercase leading-none">Ground control</h1>
          </div>
          {signedIn && (
            <div className="flex items-center gap-4">
              <Link
                href={onlyFeedback ? "/guestbook/admin" : "/guestbook/admin?feedback=1"}
                className={`${LABEL} text-[#7dffa0] underline decoration-dashed underline-offset-4`}
              >
                {onlyFeedback ? "Show all notes" : "Only notes with feedback"}
              </Link>
              <form action={logout}>
                <button type="submit" className={`${LABEL} min-h-9 border border-[#7dffa0]/50 px-3 text-[#c8ffd9]`}>
                  Log out
                </button>
              </form>
            </div>
          )}
        </header>

        {!enabled && <p className="m-0 font-mono text-sm text-[#ffb4a2]">{DISABLED_MESSAGE}</p>}
        {enabled && !signedIn && <LoginForm />}
        {signedIn && notes === null && <p className={`m-0 ${LABEL} text-[#7dffa0]`}>Comms offline</p>}
        {signedIn && notes?.length === 0 && <p className="m-0 font-mono text-sm text-[#6fa585]">Nothing here.</p>}

        {signedIn && notes && notes.length > 0 && (
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {notes.map((n) => (
              <li key={n.id} className="flex flex-col gap-2 border border-[#7dffa0]/25 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">
                    {n.name} <span className="font-normal text-[#6fa585]">· {school(n)}</span>
                  </span>
                  <time dateTime={n.createdAt.toISOString()} className="font-mono text-xs text-[#6fa585]">
                    {when.format(n.createdAt)}
                  </time>
                </div>
                <span className={`${LABEL} text-[#7dffa0]`}>{REASON_LABELS[n.reason]}</span>
                {n.reasonNote && <p className="m-0 text-sm">{n.reasonNote}</p>}
                {n.feedback && (
                  <p className="m-0 whitespace-pre-wrap border-l-2 border-[#7dffa0] bg-[#7dffa0]/10 px-3 py-2 text-sm">
                    {n.feedback}
                  </p>
                )}
                <div>
                  <DeleteButton id={n.id} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
