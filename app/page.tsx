"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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
              <div className="text-sm font-bold text-white uppercase tracking-label">Email</div>
              <div className="text-xs text-zinc-400 font-mono mt-1">Direct Line</div>
            </div>
            {/* Forced sizes to prevent giant icons */}
            <svg className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
          
          <a href="https://linkedin.com/in/tangjacob" target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-lg p-3 hover:bg-white/10 transition-colors no-underline">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-label">LinkedIn</div>
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
    document.getElementById("statement-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative w-full bg-black min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        
        {/* Top Nav (Fixed to absolute top) */}
        <div className="absolute top-0 left-0 right-0 z-50 flex w-full items-center justify-between p-6 md:p-10">
          
          {/* LEFT: Logo */}
          <Link href="/" className="no-underline z-10">
            <h1 className="text-xl font-bold uppercase text-white m-0">Jacob Tang's</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-label text-zinc-400 m-0">Persolio</p>
          </Link>
          
          {/* RIGHT: Contacts Button */}
          <button 
            onClick={() => setIsContactsOpen(!isContactsOpen)}
            className="z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-label text-white backdrop-blur-md hover:bg-white hover:text-black transition-all"
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
          <h2 className="text-4xl md:text-6xl lg:text-6xl font-bold uppercase tracking-tighter text-white drop-shadow-2xl m-0">
            "Frontend is a solved problem." <br></br>
            -My Roomate
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

      {/* 2. STATEMENT SECTION */}
      <section
        id="statement-section"
        className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-6 py-32 md:px-12"
      >
        {/* Three beats — the reason, the result, the invitation — paced apart
            instead of run together as one slab. */}
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center sm:gap-14">
          <h2 className="m-0 text-2xl font-bold uppercase leading-[1.25] tracking-normal text-balance text-white sm:text-4xl lg:text-6xl">
            I wanted to learn how to use Claude Code because I thought it was
            important.
          </h2>

          <p className="m-0 text-xl font-bold uppercase leading-[1.3] tracking-normal text-zinc-400 sm:text-2xl lg:text-4xl">
            This is the result.
          </p>

          <p className="m-0 text-xl font-bold uppercase leading-[1.3] tracking-normal text-white sm:text-2xl lg:text-4xl">
            Please enjoy!
          </p>
        </div>

        {/* This is now the only way off the landing page, so it reads as a
            control rather than a caption. Styled to match the Contacts pill. */}
        <Link
          href="/cockpit"
          className="group mt-20 inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/50 px-6 py-3 no-underline backdrop-blur-md transition-all hover:border-white hover:bg-white"
        >
          <span className="font-mono text-xs uppercase tracking-label text-zinc-300 transition-colors group-hover:text-black sm:text-sm">
            Board the cockpit
          </span>
          <svg
            className="h-4 w-4 shrink-0 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

    </main>
  )
}