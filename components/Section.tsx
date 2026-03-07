import type { ReactNode } from "react"

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string
  eyebrow?: string
  title?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="py-20 md:py-28">
      {(eyebrow || title) && (
        <header className="mb-10 md:mb-14">
          {eyebrow && <p className="text-xs tracking-widest text-zinc-400">{eyebrow.toUpperCase()}</p>}
          {title && <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  )
}