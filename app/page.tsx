"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const TILES = [
  
  { 
    title: "Professional", 
    desc: "Work history & roles", 
    href: "/professional", 
    img: "/professional.jpg", 
    colSpan: "md:col-span-4" 
  },
  { 
    title: "Projects", 
    desc: "Systems & software", 
    href: "/projects", 
    img: "/projects.jpg", 
    colSpan: "md:col-span-4" 
  },
  { 
    title: "Travel", 
    desc: "Coordinates & logs", 
    href: "/travel", 
    img: "/travel.jpg", 
    colSpan: "md:col-span-4" 
  },
  { 
    title: "Movies", 
    desc: "Cinematic analysis", 
    href: "/movies", 
    img: "/movies.jpg", 
    colSpan: "md:col-span-4" 
  },
  { 
    title: "Funny", 
    desc: "Anomalies & humor", 
    href: "/funny", 
    img: "/funny.jpg", 
    colSpan: "md:col-span-8" 
  },
]
const ContactsDropdown = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 cursor-default" onClick={onClose} />
      {/* Fixed positioning guarantees it stays top right */}
      <div className="fixed right-6 top-24 z-50 w-80 rounded-xl border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          <a href="mailto:jacobdtang@gmail.com" className="group flex items-center justify-between rounded-lg p-3 hover:bg-white/10 transition-colors no-underline">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">Email</div>
              <div className="text-xs text-zinc-400 font-mono mt-1">Direct Line</div>
            </div>
            {/* Forced sizes to prevent giant icons */}
            <svg className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
          
          <a href="https://linkedin.com/in/tangjacob" target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-lg p-3 hover:bg-white/10 transition-colors no-underline">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">LinkedIn</div>
              <div className="text-xs text-zinc-400 font-mono mt-1">Professional Network</div>
            </div>
            <svg className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

export default function HomePage() {
  const [isContactsOpen, setIsContactsOpen] = useState(false)

  const scrollToGrid = () => {
    document.getElementById("grid-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative w-full bg-black min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        
        {/* Top Nav (Fixed to absolute top) */}
{/* Top Nav (Fixed to absolute top) */}
<div className="absolute top-0 left-0 right-0 z-50 flex w-full items-center justify-between p-6 md:p-10">
          
          {/* LEFT: Logo */}
          <Link href="/" className="no-underline z-10">
            <h1 className="text-xl font-bold uppercase tracking-widest text-white m-0">Jacob Tang's</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-400 m-0">Persolio</p>
          </Link>
          
          {/* CENTER: Navigation Banner */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 rounded-full border border-white/20 bg-black/50 px-8 py-3 backdrop-blur-md shadow-2xl">
          <Link href="/about" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors no-underline">About</Link>
            <Link href="/professional" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors no-underline">Professional</Link>
            <Link href="/projects" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors no-underline">Projects</Link>
            <Link href="/travel" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors no-underline">Travel</Link>
            <Link href="/movies" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors no-underline">Movies</Link>
            <Link href="/funny" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors no-underline">Funny</Link>
          </div>

          {/* RIGHT: Contacts Button */}
          <button 
            onClick={() => setIsContactsOpen(!isContactsOpen)}
            className="z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md hover:bg-white hover:text-black transition-all"
          >
            Contacts
            <svg className={`w-4 h-4 transition-transform ${isContactsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <ContactsDropdown isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} />

        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
            alt="Space Background" 
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>

        {/* Hero Center Text */}
        <div className="relative z-10 px-6 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter text-white drop-shadow-2xl m-0">
            "Frontend is a solved problem." <br></br>
            -Tony Fernandes
          </h2>
        </div>

        {/* Scroll Down Button */}
        <button 
          onClick={scrollToGrid}
          className="absolute bottom-12 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all animate-bounce"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      {/* 2. MAIN GRID SECTION */}
      <section id="grid-section" className="w-full bg-black px-4 py-24 md:px-12 pb-32">
        <div className="mx-auto max-w-7xl">
          
          {/* Changed Directory to an "About" link per your request */}
          <Link href="/about" className="inline-block mb-12 group no-underline">
            <h3 className="text-sm font-mono uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors m-0">
              About →
            </h3>
          </Link>
          
          {/* 12-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {TILES.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className={`group relative h-[400px] w-full overflow-hidden rounded-2xl bg-zinc-900 ${tile.colSpan} block no-underline`}
              >
                {/* Background Image w/ Scale & Brightness Hover */}
                <img
                  src={tile.img}
                  alt={tile.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-[1.02] group-hover:opacity-100 group-hover:brightness-110"
                />
                
                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                {/* Content (Bottom Left) */}
                <div className="absolute bottom-0 left-0 p-8 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h4 className="text-3xl font-bold uppercase tracking-tighter text-white drop-shadow-lg m-0">
                    {tile.title}
                  </h4>
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-300 opacity-0 transition-opacity duration-500 group-hover:opacity-100 m-0">
                    {tile.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}