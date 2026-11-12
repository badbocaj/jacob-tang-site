import { formatReasonShares } from "@/lib/guestbook";
import type { GuestbookStats } from "@/lib/guestbook-types";

export default function Stats({ stats }: { stats: GuestbookStats }) {
  const shares = formatReasonShares(stats.byReason, stats.total);
  return (
    <dl className="m-0 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider text-[#6fa585]">
      <div className="flex items-baseline gap-2">
        <dt className="sr-only">Signals</dt>
        <dd className="m-0 text-xl font-semibold text-[#c8ffd9]">{stats.total}</dd>
        <span aria-hidden>{stats.total === 1 ? "signal" : "signals"}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="sr-only">Schools</dt>
        <dd className="m-0 text-xl font-semibold text-[#c8ffd9]">{stats.schools}</dd>
        <span aria-hidden>{stats.schools === 1 ? "school" : "schools"}</span>
      </div>
      {shares && (
        <div className="normal-case tracking-normal">
          <dt className="sr-only">Why people came</dt>
          <dd className="m-0 text-sm text-[#c8ffd9]/85">{shares}</dd>
        </div>
      )}
    </dl>
  );
}
