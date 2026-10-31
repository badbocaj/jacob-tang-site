"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Lock, Menu, X } from "lucide-react"

import { isLocked } from "@/lib/construction"
import { ContactsMenu } from "@/components/ContactsMenu"

const NAV_ITEMS = [
  { label: "Cockpit", href: "/cockpit" },
  { label: "About", href: "/about" },
  { label: "Professional", href: "/professional" },
  { label: "Projects", href: "/projects" },
  { label: "Travel", href: "/travel" },
  { label: "Movies", href: "/movies" },
  // The route lives at app/fun; /funny 404s.
  { label: "Funny", href: "/fun" },
  { label: "Personalized", href: "/personalized" },
] as const

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

export const Navbar = () => {
  const pathname = usePathname()
  // The sheet remembers which page it was opened on, so navigating anywhere
  // closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === pathname
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null)

  // No scrolling the page behind the open sheet.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuPath(null)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  // Home and the cockpit carry their own chrome.
  if (pathname === "/" || pathname === "/cockpit") {
    return null
  }

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between gap-6 border-b border-white/10 bg-black/85 px-5 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-sm font-bold tracking-label text-white no-underline"
        >
          JACOB TANG
        </Link>

        {/* Full row only where it actually fits. */}
        <div className="hidden items-center gap-7 font-mono text-xs uppercase tracking-label xl:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href)
            const sealed = isLocked(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={sealed ? `${item.label} — under construction` : undefined}
                className={`relative flex items-center gap-1.5 whitespace-nowrap no-underline transition-colors duration-200 ${
                  active
                    ? "text-white"
                    : sealed
                      ? "text-zinc-600 hover:text-amber-300"
                      : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
                {sealed && <Lock className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2.5} />}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-[22px] left-0 right-0 h-px bg-white"
                  />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ContactsMenu />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-black xl:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-black/95 backdrop-blur-xl xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <ul className="m-0 list-none px-5 py-6 sm:px-8">
              {NAV_ITEMS.map((item, i) => {
                const active = isActivePath(pathname, item.href)
                const sealed = isLocked(item.href)
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.03 }}
                    className="border-b border-white/10"
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between py-4 font-display text-2xl font-bold uppercase no-underline wide ${
                        active ? "text-white" : sealed ? "text-zinc-600" : "text-zinc-300"
                      }`}
                    >
                      {item.label}
                      {sealed ? (
                        <span className="flex items-center gap-1.5 font-mono text-xs font-normal tracking-label text-zinc-600">
                          <Lock className="h-3 w-3" strokeWidth={2.5} /> SOON
                        </span>
                      ) : (
                        <span className="font-mono text-xs font-normal tracking-label text-zinc-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </Link>
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
