"use client";

import { useEffect, useState } from "react";

import { deleteNoteAction } from "@/app/guestbook/admin/actions";

const CONFIRM_MS = 4000;

/** First click arms it ("Really delete?"); a second click within 4 s deletes. */
export default function DeleteButton({ id }: { id: number }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <form action={deleteNoteAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type={armed ? "submit" : "button"}
        onClick={armed ? undefined : () => setArmed(true)}
        className={`inline-flex min-h-9 items-center border px-3 font-mono text-[11px] uppercase tracking-wider ${
          armed ? "border-[#ffb4a2] bg-[#ffb4a2] text-[#06110b]" : "border-[#ffb4a2]/60 text-[#ffb4a2]"
        }`}
      >
        {armed ? "Really delete?" : "Delete"}
      </button>
    </form>
  );
}
