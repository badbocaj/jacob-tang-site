"use client";

import { startTransition, useActionState, useId, useState, type FormEvent, type ReactNode } from "react";

import { submitNote } from "@/app/guestbook/actions";
import type { CollegeOption } from "@/lib/colleges";
import { settleSubmit } from "@/lib/guestbook-client";
import type { SubmitState } from "@/lib/guestbook-submit";
import { REASON_LABELS, REASONS, type NoteInput } from "@/lib/guestbook-types";
import CollegePicker from "./CollegePicker";
import { usePing } from "./PingContext";

const IDLE: SubmitState = { status: "idle" };
const length = (s: string) => [...s].length; // code points, matching the server

const FIELD =
  "w-full border-0 border-b border-[#7dffa0]/40 bg-transparent px-0 py-2 text-base text-[#c8ffd9] placeholder:text-[#6fa585]/70 focus:border-[#7dffa0] focus:outline-none";
const LABEL = "mb-1 block font-mono text-xs uppercase tracking-wider text-[#6fa585]";

function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="m-0 mt-1 font-mono text-xs text-[#ffb4a2]">
      {children}
    </p>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  const n = length(value);
  return (
    <span className={`font-mono text-[11px] ${n > max ? "text-[#ffb4a2]" : "text-[#6fa585]"}`}>
      {n}/{max}
    </span>
  );
}

/** `renderedAt` is the page's render time; the server rejects (quietly) anything sent within 3 s of it. */
export default function NoteForm({ renderedAt }: { renderedAt: number }) {
  const id = useId();
  const { ping } = usePing();
  const [name, setName] = useState("");
  const [college, setCollege] = useState<CollegeOption | null>(null);
  const [reason, setReason] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const [state, formAction, pending] = useActionState(async (prev: SubmitState, form: FormData) => {
    const next = await settleSubmit(() => submitNote(prev, form));
    if (next.status === "success") {
      setName("");
      setCollege(null);
      setReason("");
      setReasonNote("");
      setFeedback("");
      ping(next.collegeId);
    }
    return next;
  }, IDLE);

  // Submit by hand instead of <form action>: React resets a form after an action,
  // which unchecks the controlled reason chips and loses them on the next try.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  const errorFor = (field: keyof NoteInput) =>
    state.status === "error" && state.field === field ? state.message : undefined;
  const formError = state.status === "error" && !state.field ? state.message : undefined;
  const ids = { name: `${id}-name`, reasonNote: `${id}-rn`, feedback: `${id}-fb`, reason: `${id}-reason` };

  return (
    // method="post": if someone submits before hydration, the browser must not put the fields (feedback!) in the URL.
    <form method="post" onSubmit={onSubmit} className="flex flex-col gap-5 border border-dashed border-[#7dffa0]/40 bg-[#06110b]/70 p-5" noValidate>
      {/* Bot trap: humans never see or fill this. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="renderedAt" value={renderedAt} />

      <div>
        <label htmlFor={ids.name} className={LABEL}>
          Name <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id={ids.name}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Anonymous"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errorFor("name"))}
          aria-describedby={errorFor("name") ? `${ids.name}-err` : undefined}
          className={FIELD}
        />
        <FieldError id={`${ids.name}-err`}>{errorFor("name")}</FieldError>
      </div>

      <CollegePicker value={college} onChange={setCollege} error={errorFor("college")} />

      <fieldset className="m-0 border-0 p-0" aria-describedby={errorFor("reason") ? `${ids.reason}-err` : undefined}>
        <legend className={LABEL}>Why are you here?</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <label key={r} className="cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-9 items-center border border-[#7dffa0]/50 px-3 font-mono text-xs uppercase tracking-wider text-[#7dffa0] transition-colors peer-checked:bg-[#7dffa0] peer-checked:text-[#06110b] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#c8ffd9]">
                {REASON_LABELS[r]}
              </span>
            </label>
          ))}
        </div>
        <FieldError id={`${ids.reason}-err`}>{errorFor("reason")}</FieldError>
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={ids.reasonNote} className={LABEL}>
            …in a sentence? <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <Counter value={reasonNote} max={120} />
        </div>
        <input
          id={ids.reasonNote}
          name="reasonNote"
          type="text"
          value={reasonNote}
          onChange={(e) => setReasonNote(e.target.value)}
          aria-invalid={Boolean(errorFor("reasonNote"))}
          aria-describedby={errorFor("reasonNote") ? `${ids.reasonNote}-err` : undefined}
          className={FIELD}
        />
        <FieldError id={`${ids.reasonNote}-err`}>{errorFor("reasonNote")}</FieldError>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={ids.feedback} className={LABEL}>
            Roast or toast the site{" "}
            <span className="normal-case tracking-normal text-[#7dffa0]">· only Jacob sees this</span>
          </label>
          <Counter value={feedback} max={1000} />
        </div>
        <textarea
          id={ids.feedback}
          name="feedback"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          aria-invalid={Boolean(errorFor("feedback"))}
          aria-describedby={errorFor("feedback") ? `${ids.feedback}-err` : undefined}
          className={`${FIELD} resize-y border border-[#7dffa0]/40 px-2`}
        />
        <FieldError id={`${ids.feedback}-err`}>{errorFor("feedback")}</FieldError>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 w-fit items-center bg-[#7dffa0] px-6 font-mono text-xs font-semibold uppercase tracking-label text-[#06110b] transition-[filter] hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Transmitting…" : "Transmit"}
        </button>
        <p role="status" aria-live="polite" className="m-0 min-h-5 font-mono text-xs">
          {state.status === "success" && <span className="text-[#7dffa0]">{state.message}</span>}
          {formError && <span className="text-[#ffb4a2]">{formError}</span>}
        </p>
      </div>
    </form>
  );
}
