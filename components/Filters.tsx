"use client"

import { useMemo, useState } from "react"

export function Filters({
  chips,
  onChange,
}: {
  chips: string[]
  onChange: (active: string | null) => void
}) {
  const [active, setActive] = useState<string | null>(null)
  const items = useMemo(() => ["All", ...chips], [chips])

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((label) => {
        const isOn = (label === "All" && active === null) || label === active
        return (
          <button
            key={label}
            onClick={() => {
              const next = label === "All" ? null : label
              setActive(next)
              onChange(next)
            }}
            className={[
              "rounded-full px-4 py-2 text-xs transition-colors",
              isOn
                ? "bg-white text-black"
                : "border border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05]",
            ].join(" ")}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}