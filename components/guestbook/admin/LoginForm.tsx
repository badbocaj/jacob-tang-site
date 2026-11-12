"use client";

import { useActionState } from "react";

import { login } from "@/app/guestbook/admin/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});
  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4 border border-dashed border-[#7dffa0]/40 p-5">
      <label htmlFor="gb-password" className="font-mono text-xs uppercase tracking-wider text-[#6fa585]">
        Password
      </label>
      <input
        id="gb-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="border-0 border-b border-[#7dffa0]/40 bg-transparent px-0 py-2 text-base text-[#c8ffd9] focus:border-[#7dffa0] focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-fit items-center bg-[#7dffa0] px-6 font-mono text-xs font-semibold uppercase tracking-label text-[#06110b] disabled:opacity-60"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
      <p role="status" className="m-0 min-h-5 font-mono text-xs text-[#ffb4a2]">
        {state.error}
      </p>
    </form>
  );
}
