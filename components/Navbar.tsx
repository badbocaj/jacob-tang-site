"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"
import { Menu, X } from "lucide-react"

import { isLocked } from "@/lib/construction"
import { ContactsMenu } from "@/components/ContactsMenu"

/* ───────────────────────────────────────────────────────────────────────────
   Site navigation — a floating pill instead of a black slab.

   • It takes its colours from the page it sits on (see .site-nav themes in
     globals.css): cream paper over the journal pages, dark glass elsewhere,
     and on the Lab it follows the light switch between day and night.
   • It tucks away while you scroll down and comes back the moment you scroll
     up, so it never sits on top of what you are reading.
   • Sealed sections are left out entirely and show up on their own once they
     are unlocked in lib/construction.ts. /personalized is reachable from the
     cockpit's OVERRIDE rock, which is the fun way to find it anyway.
   ─────────────────────────────────────────────────────────────────────────── */

const ALL_ITEMS = [
  { label: "Cockpit", href: "/cockpit" },
  { label: "About", href: "/about" },
  { label: "Professional", href: "/professional" },
  { label: "Projects", href: "/projects" },
  { label: "Travel", href: "/travel" },
  { label: "Movies", href: "/movies" },
  { label: "Funny", href: "/fun" },
] as const

const NAV_ITEMS = ALL_ITEMS.filter((item) => !isLocked(item.href))

type NavTheme = "dark" | "paper" | "travel" | "lab"

function themeFor(pathname: string): NavTheme {
  if (pathname === "/projects") return "lab"
  // The service record shares travel's dark glass and amber active pill.
  if (pathname.startsWith("/travel") || pathname.startsWith("/professional")) return "travel"
  return "dark"
}

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

export const Navbar = () => {
  const pathname = usePathname()

  // The sheet remembers which page it was opened on, so navigating anywhere
  // closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === pathname

  // Hide on the way down, return on the way up.
  const { scrollY } = useScroll()
  const [tucked, setTucked] = useState(false)
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    const next = y > 120 && y > prev
    if (next !== tucked) setTucked(next)
  })

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
  if (pathname === "/" || pathname === "/cockpit") return null

  const theme = themeFor(pathname)
  const hidden = tucked && !menuOpen

  return (
    <>
      <motion.header
        data-theme={theme}
        className="site-nav pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-3 pt-3 sm:px-5 sm:pt-4"
        initial={false}
        animate={{ y: hidden ? -88 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 36 }}
      >
        {/* Name tag */}
        <Link
          href="/"
          className="nav-glass pointer-events-auto flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-bold tracking-label no-underline"
        >
          JACOB TANG
        </Link>

        {/* The pill */}
        <nav
          aria-label="Main"
          className="nav-glass pointer-events-auto absolute left-1/2 hidden h-11 -translate-x-1/2 items-center gap-1 rounded-full p-1 lg:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative flex h-full items-center whitespace-nowrap rounded-full px-4 font-mono text-xs uppercase tracking-label no-underline"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-[var(--nav-active-bg)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative transition-colors duration-200 ${
                    active ? "text-[var(--nav-active-ink)]" : "text-[var(--nav-muted)] hover:text-[var(--nav-ink)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <ContactsMenu />
          <button
            type="button"
            onClick={() => setMenuPath(menuOpen ? null : pathname)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="nav-glass flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            data-theme={theme}
            className="site-nav fixed inset-0 z-40 overflow-y-auto bg-[var(--nav-sheet)] backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <ul className="m-0 list-none px-5 pb-10 pt-24 sm:px-8">
              {NAV_ITEMS.map((item, i) => {
                const active = isActivePath(pathname, item.href)
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.03 }}
                    className="border-b border-[var(--nav-border)]"
                  >
                    <Link
                      href={item.href}
                      className={`wide flex items-center justify-between py-4 font-display text-2xl font-bold uppercase no-underline ${
                        active ? "text-[var(--nav-ink)]" : "text-[var(--nav-muted)]"
                      }`}
                    >
                      {item.label}
                      <span className="font-mono text-xs font-normal tracking-label opacity-60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
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
