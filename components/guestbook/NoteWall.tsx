import { getCollege } from "@/lib/colleges";
import { REASON_LABELS, type PublicNote } from "@/lib/guestbook-types";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

function ago(date: Date, now: number): string {
  const seconds = Math.round((date.getTime() - now) / 1000);
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function school(note: PublicNote): string | null {
  if (note.collegeNone === "outside_us") return "outside the US";
  if (note.collegeId) return getCollege(note.collegeId)?.name ?? null;
  return null;
}

/** `now` comes from the page loader, so rendering stays pure. */
export default function NoteWall({ notes, now }: { notes: PublicNote[]; now: number }) {
  if (notes.length === 0) {
    return <p className="m-0 border border-dashed border-[#7dffa0]/30 p-6 font-mono text-sm text-[#6fa585]">No signals yet. Be the first.</p>;
  }

  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      {notes.map((note) => {
        const where = school(note);
        return (
          <li key={note.id} className="border border-[#7dffa0]/25 bg-[#06110b]/70 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="font-semibold text-[#c8ffd9]">
                {note.name}
                {where && <span className="font-normal text-[#6fa585]"> · {where}</span>}
              </span>
              <time dateTime={note.createdAt.toISOString()} className="font-mono text-xs text-[#6fa585]">
                {ago(note.createdAt, now)}
              </time>
            </div>
            <span className="mt-2 inline-block border border-[#7dffa0]/60 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#7dffa0]">
              {REASON_LABELS[note.reason]}
            </span>
            {note.reasonNote && <p className="m-0 mt-2 text-sm leading-relaxed text-[#c8ffd9]/90">{note.reasonNote}</p>}
          </li>
        );
      })}
    </ol>
  );
}
