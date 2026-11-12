import { getSql } from "./db";
import {
  REASONS,
  type AdminNote,
  type CleanNote,
  type GuestbookStats,
  type MapEntry,
  type NoCollege,
  type PublicNote,
  type Reason,
} from "./guestbook-types";

/* ───────────────────────────────────────────────────────────────────────────
   Guestbook queries. Public queries name their columns and never touch
   feedback or ip_hash; only listAllNotes (admin) reads feedback.
   ─────────────────────────────────────────────────────────────────────────── */

type Row = Record<string, unknown>;

function toPublic(r: Row): PublicNote {
  return {
    id: Number(r.id),
    createdAt: new Date(r.created_at as string | Date),
    name: r.name as string,
    collegeId: (r.college_id as string | null) ?? null,
    collegeNone: (r.college_none as NoCollege | null) ?? null,
    reason: r.reason as Reason,
    reasonNote: (r.reason_note as string | null) ?? null,
  };
}

export async function listNotes(limit = 100): Promise<PublicNote[]> {
  const rows = await getSql()`
    select id, created_at, name, college_id, college_none, reason, reason_note
    from notes order by created_at desc, id desc limit ${limit}`;
  return rows.map(toPublic);
}

export async function getStats(): Promise<GuestbookStats> {
  const sql = getSql();
  const [totals, reasons] = await Promise.all([
    sql`select count(*)::int as total, count(distinct college_id)::int as schools from notes`,
    sql`select reason, count(*)::int as n from notes group by reason`,
  ]);
  const byReason = Object.fromEntries(REASONS.map((r) => [r, 0])) as Record<Reason, number>;
  for (const row of reasons) byReason[row.reason as Reason] = Number(row.n);
  return { total: Number(totals[0].total), schools: Number(totals[0].schools), byReason };
}

export async function getMapEntries(): Promise<MapEntry[]> {
  const rows = await getSql()`
    select college_id, array_agg(name order by created_at) as names
    from notes where college_id is not null group by college_id`;
  return rows.map((r) => ({ collegeId: r.college_id as string, names: r.names as string[] }));
}

export async function insertNote(note: CleanNote, ipHash: string): Promise<PublicNote> {
  const rows = await getSql()`
    insert into notes (name, college_id, college_none, reason, reason_note, feedback, ip_hash)
    values (${note.name}, ${note.collegeId}, ${note.collegeNone}, ${note.reason},
            ${note.reasonNote}, ${note.feedback}, ${ipHash})
    returning id, created_at, name, college_id, college_none, reason, reason_note`;
  return toPublic(rows[0]);
}

export async function countRecentByIp(ipHash: string, minutes = 60): Promise<number> {
  const rows = await getSql()`
    select count(*)::int as n from notes
    where ip_hash = ${ipHash} and created_at > now() - make_interval(mins => ${minutes})`;
  return Number(rows[0].n);
}

export async function listAllNotes(onlyWithFeedback: boolean): Promise<AdminNote[]> {
  const sql = getSql();
  const rows = onlyWithFeedback
    ? await sql`
        select id, created_at, name, college_id, college_none, reason, reason_note, feedback
        from notes where feedback is not null order by created_at desc, id desc`
    : await sql`
        select id, created_at, name, college_id, college_none, reason, reason_note, feedback
        from notes order by created_at desc, id desc`;
  return rows.map((r) => ({ ...toPublic(r), feedback: (r.feedback as string | null) ?? null }));
}

export async function deleteNote(id: number): Promise<void> {
  await getSql()`delete from notes where id = ${id}`;
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

const PLURALS: Record<Reason, string> = {
  recruiter: "recruiters",
  classmate: "classmates",
  friend_family: "friends & family",
  engineer: "fellow engineers",
  wandering: "wanderers",
};

/** "40% recruiters · 30% classmates · …" — largest first, ties in REASONS order, zeros omitted. */
export function formatReasonShares(byReason: Record<Reason, number>, total: number): string {
  if (total <= 0) return "";
  return REASONS.filter((r) => byReason[r] > 0)
    .map((r, order) => ({ r, n: byReason[r], order }))
    .sort((a, b) => b.n - a.n || a.order - b.order)
    .map(({ r, n }) => `${Math.round((n / total) * 100)}% ${PLURALS[r]}`)
    .join(" · ");
}
