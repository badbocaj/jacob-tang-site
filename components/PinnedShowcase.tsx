"use client"

import { useMemo, useRef, useState } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { Diagram } from "./Diagram"

type Item = {
  kind: "project" | "blog"
  slug: string
  title: string
  summary: string
  date: string
  tags: string[]
  tools?: string[]
  outcomes?: string[]
  readingMinutes?: number
}

export function PinnedShowcase({ items }: { items: Item[] }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  // map scroll progress to index
  const idx = useTransform(scrollYProgress, [0, 1], [0, items.length - 1])
  const [tab, setTab] = useState<"project" | "blog">("project")

  const filtered = useMemo(() => items.filter((i) => i.kind === tab), [items, tab])

  // derive active index within filtered list
  const activeIndex = useTransform(idx, (v) => {
    const n = filtered.length || 1
    const raw = Math.round(v) % n
    return Math.max(0, Math.min(n - 1, raw))
  })

  // read motion value into state for rendering
  const [active, setActive] = useState(0)
  activeIndex.on("change", (v) => setActive(v))

  const current = filtered[active] ?? filtered[0]

  return (
    <section className="py-24 md:py-32">
      <div className="mb-10">
        <p className="text-xs tracking-widest text-zinc-400">SHOWCASE</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          Featured work, briefed like a system
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-300">
          Scroll to cycle. Click to inspect. Motion stays controlled.
        </p>
      </div>

      {/* Desktop pinned */}
      <div ref={ref} className="hidden md:block">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("project")}
                  className={`rounded-full px-4 py-2 text-xs ${
                    tab === "project"
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05]"
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setTab("blog")}
                  className={`rounded-full px-4 py-2 text-xs ${
                    tab === "blog"
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05]"
                  }`}
                >
                  Blog
                </button>
              </div>

              <div className="space-y-3">
                {filtered.map((it, i) => {
                  const isOn = i === active
                  return (
                    <button
                      key={it.slug}
                      onClick={() => setActive(i)}
                      className={[
                        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                        isOn
                          ? "border-white/30 bg-white/[0.06]"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]",
                      ].join(" ")}
                    >
                      <div className="text-sm font-medium">{it.title}</div>
                      <div className="mt-1 text-xs text-zinc-400">{it.date}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="col-span-7">
            {/* This creates scroll space */}
            <div className="h-[160vh]">
              <div className="sticky top-24">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8"
                >
                  <Diagram variant={current?.kind ?? "project"} />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-xs tracking-widest text-zinc-400">
                          {current?.kind === "project" ? "PROJECT" : "BLOG"}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{current?.title}</h3>
                        <p className="mt-3 text-zinc-300">{current?.summary}</p>
                      </div>
                      <div className="text-right text-xs text-zinc-400">
                        <div>{current?.date}</div>
                        {current?.kind === "blog" && current?.readingMinutes ? (
                          <div className="mt-1">{current.readingMinutes} min read</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {current?.tags?.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {current?.kind === "project" ? (
                      <div className="mt-8 grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs tracking-widest text-zinc-400">TOOLS</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(current.tools ?? []).map((c) => (
                              <span
                                key={c}
                                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs tracking-widest text-zinc-400">OUTCOMES</p>
                          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                            {(current.outcomes ?? []).slice(0, 3).map((o) => (
                              <li key={o}>• {o}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8">
                        <p className="text-xs tracking-widest text-zinc-400">KEY IDEA</p>
                        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                          <li>• Keep interfaces simple, then iterate fast.</li>
                          <li>• Don’t confuse motion for clarity.</li>
                          <li>• Make the system legible.</li>
                        </ul>
                      </div>
                    )}

                    <div className="mt-10">
                      <Link
                        href={`/${current?.kind === "project" ? "projects" : "blog"}/${current?.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-200 hover:text-white"
                      >
                        Open detail <span>→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fallback (not pinned) */}
      <div className="md:hidden space-y-6">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/${it.kind === "project" ? "projects" : "blog"}/${it.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          >
            <div className="text-xs tracking-widest text-zinc-400">{it.kind.toUpperCase()}</div>
            <div className="mt-2 text-lg font-medium">{it.title}</div>
            <div className="mt-2 text-sm text-zinc-300">{it.summary}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}