"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { searchCollegesAction } from "@/app/guestbook/actions";
import type { CollegeOption } from "@/lib/colleges";

const DEBOUNCE_MS = 150;

/** Type-ahead over the server's college list. Writes the chosen value to a hidden "college" input. */
export default function CollegePicker({
  value,
  onChange,
  error,
}: {
  value: CollegeOption | null;
  onChange(option: CollegeOption | null): void;
  error?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const errorId = `${id}-error`;
  const [query, setQuery] = useState(value?.label ?? "");
  const [options, setOptions] = useState<CollegeOption[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const latest = useRef(0);

  // The parent clears `value` after a successful submit; clear the text with it.
  const [shownValue, setShownValue] = useState(value);
  if (value !== shownValue) {
    setShownValue(value);
    setQuery(value?.label ?? "");
  }

  useEffect(() => {
    if (!open) return;
    const request = ++latest.current;
    const timer = setTimeout(async () => {
      let results: CollegeOption[];
      try {
        results = await searchCollegesAction(query);
      } catch {
        return; // network blip: keep the current list; the next keystroke retries
      }
      if (request !== latest.current) return; // a newer query is in flight
      setOptions(results);
      setActive(0);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, open]);

  function choose(option: CollegeOption) {
    onChange(option);
    setQuery(option.label);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block font-mono text-xs uppercase tracking-wider text-[#6fa585]">
        College
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open && options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
        placeholder="Start typing — Purdue, USC, …"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="w-full border-0 border-b border-[#7dffa0]/40 bg-transparent px-0 py-2 text-base text-[#c8ffd9] placeholder:text-[#6fa585]/70 focus:border-[#7dffa0] focus:outline-none"
      />
      <input type="hidden" name="college" value={value?.value ?? ""} />

      {open && options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full list-none overflow-y-auto border border-[#7dffa0]/40 bg-[#06110b] p-0 shadow-[0_0_16px_rgba(125,255,160,.15)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: fires before the input's blur closes the list
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 ${i === active ? "bg-[#7dffa0]/15" : ""} ${o.sub ? "" : "border-t border-dashed border-[#7dffa0]/25 italic"}`}
            >
              <span className="block text-sm text-[#c8ffd9]">{o.label}</span>
              {o.sub && <span className="block font-mono text-[11px] text-[#6fa585]">{o.sub}</span>}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} className="m-0 mt-1 font-mono text-xs text-[#ffb4a2]">
          {error}
        </p>
      )}
    </div>
  );
}
