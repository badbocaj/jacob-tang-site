"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

export function Card({
  href,
  title,
  meta,
  children,
  chips,
}: {
  href: string
  title: string
  meta?: string
  children: ReactNode
  chips?: string[]
}) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Link
        href={href}
        className="block rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 hover:from-white/[0.09] hover:to-white/[0.03] transition-colors"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-lg font-medium tracking-tight">{title}</h3>
            {meta && <p className="mt-1 text-sm text-zinc-400">{meta}</p>}
          </div>
          <span className="text-zinc-500">↗</span>
        </div>
        <div className="mt-4 text-sm leading-relaxed text-zinc-300">{children}</div>
        {chips?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
    </motion.div>
  )
}