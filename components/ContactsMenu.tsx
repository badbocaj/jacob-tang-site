"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, ChevronDown } from "lucide-react"

/* ───────────────────────────────────────────────────────────────────────────
   One contacts control for the whole site. The landing page and the navbar
   both render this, so the button that says CONTACTS always does something.
   The panel hangs off the button itself rather than a fixed screen corner.
   ─────────────────────────────────────────────────────────────────────────── */

const CONTACTS = [
  { label: "Email", sub: "jacobdtang@gmail.com", href: "mailto:jacobdtang@gmail.com", external: false },
  { label: "LinkedIn", sub: "in/tangjacob", href: "https://linkedin.com/in/tangjacob", external: true },
] as const

export function ContactsMenu({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onPointer)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-black/50 px-4 py-2 font-mono text-xs uppercase tracking-label text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
      >
        Contacts
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 top-full z-50 mt-3 w-72 origin-top-right border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {CONTACTS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group flex items-center justify-between px-3 py-3 no-underline transition-colors hover:bg-white/5"
              >
                <span>
                  <span className="block text-sm font-bold uppercase tracking-label text-white">
                    {c.label}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-zinc-500">{c.sub}</span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-zinc-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  strokeWidth={2}
                />
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
