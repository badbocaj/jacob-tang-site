"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export const Navbar = () => {
  const pathname = usePathname()

  // 1. THE KILL SWITCH: hide the navbar on Home and on the cockpit, which
  // carries its own HUD channel bar and must not be covered by a black slab.
  if (pathname === "/" || pathname === "/cockpit") {
    return null
  }

  const navItems = [
    { label: "Cockpit", href: "/cockpit" },
    { label: "About", href: "/about" },

    { label: "Professional", href: "/professional" },
    { label: "Projects", href: "/projects" },
    { label: "Travel", href: "/travel" },
    { label: "Movies", href: "/movies" },
    { label: "Funny", href: "/funny" },
    { label: "Personalized", href: "/personalized" },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 h-16 z-50 bg-black border-b border-white/10">
      {/* Logo - White text for black background */}
      <div className="text-sm font-bold tracking-label text-white">
        <Link href="/">JACOB TANG</Link>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 items-center text-xs font-mono uppercase tracking-label">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`transition-colors duration-300 ${
                isActive ? "text-white" : "text-zinc-500 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Contacts - Styled to match the dark aesthetic */}
      <div className="text-xs font-mono uppercase tracking-label text-white border border-white/20 px-3 py-1 rounded-full hover:bg-white hover:text-black transition-all cursor-pointer">
        CONTACTS
      </div>
    </nav>
  )
}