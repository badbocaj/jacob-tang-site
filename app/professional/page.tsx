'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause } from 'lucide-react'
import ProfileCard from '@/components/professional/ProfileCard'
import AnimatedList, { JobItem } from '@/components/professional/AnimatedList'

const JOB_HISTORY: JobItem[] = [
  {
    company: 'Vital Lyfe',
    title: 'Mechanical Engineering Intern',
    period: 'Jan 2026 – Present',
    location: 'Torrance, CA',
    hook: 'Solving the water crisis, clearly didn\'t solve traffic',
    description: 'Placeholder — replace with your full role description.',
    logo: '/logos/vital-lyfe.png',
    logoText: 'CA',
  },
  {
    company: 'L3Harris',
    title: 'Quality Engineering Intern',
    period: 'May 2025 – Aug 2025',
    location: 'Clifton, NJ',
    hook: 'Made the electronic warfare systems conform',
    description: 'Placeholder — replace with your full role description.',
    logo: '/logos/L3Harris.png',
    logoText: 'CB',
  },

  {
    company: 'AIM Lab @ UH',
    title: 'Structures Researcher',
    period: 'May 2024 – Aug 2024',
    location: 'Houston, TX',
    hook: 'Vibe-Researching',
    description: 'Placeholder — replace with your full role description.',
    logo: '/logos/UH.png',
    logoText: 'UP',
  },
  {
    company: 'CURVE @ USC',
    title: 'Researcher',
    period: 'Aug 2024 – May 2025',
    location: 'Los Angeles, CA',
    hook: 'Found solutions for LA traffic by secondhand experience.',
    description: 'Placeholder — replace with your full role description.',
    logo: '/logos/USC.png',
    logoText: 'CC',
  },
]

export default function ProfessionalPage() {
  const [isResumed, setIsResumed] = useState(false)
  const [activeJob, setActiveJob] = useState<JobItem | null>(null)

  return (
    <div className="relative w-full overflow-hidden bg-[#05070a]" style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}>
      <AnimatePresence>
        {!isResumed && (
          <motion.div
            key="paused"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer"
            onClick={() => setIsResumed(true)}
          >
            <p className="font-mono text-[10px] tracking-[0.5em] text-white/35 uppercase select-none">
              Click to Resume
            </p>

            <div className="relative">
              <Image
                src="/resume-bg.png"
                alt="Resume"
                width={580}
                height={380}
                className="object-cover border border-white/5"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="p-5 border border-white/10 bg-black/50 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 0 40px rgba(255,255,255,0.12), 0 0 80px rgba(255,255,255,0.04)',
                  }}
                >
                  <Pause size={44} className="text-white" fill="white" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResumed && (
          <motion.div
            key="resumed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex"
          >
            {/* Left — ProfileCard */}
            <div className="w-1/2 h-full flex items-center justify-center p-8">
              <ProfileCard
                name="Jacob Tang"
                title="Mechanical Engineer"
                handle="jacobtang"
                status="Open to work"
                contactText="Contact Me"
                avatarUrl="/profile.png"
                showUserInfo={false}
                enableTilt={true}
                enableMobileTilt={false}
                behindGlowEnabled
                behindGlowColor="rgba(125, 190, 255, 0.67)"
                innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
              />
            </div>

            {/* Right — AnimatedList */}
            <div className="w-1/2 h-full p-8">
              <div className="mb-6">
                <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-white/30">
                  Resume
                </h2>
                <div className="h-px w-full bg-white/5 mt-3" />
              </div>
              <div style={{ height: 'calc(100% - 56px)' }}>
                <AnimatedList
                  items={JOB_HISTORY}
                  showGradients
                  enableArrowNavigation
                  displayScrollbar={false}
                  onItemSelect={(item) => setActiveJob(item)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job detail pull-up modal */}
      <AnimatePresence>
        {activeJob && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"
              onClick={() => setActiveJob(null)}
            />

            {/* Panel dropping down from top */}
            <motion.div
              key="panel"
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 right-0 z-50 bg-[#0a0614] border-b border-white/10 rounded-b-3xl p-10 shadow-[0_20px_80px_rgba(125,190,255,0.08)]"
              style={{ maxHeight: '65vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-white/15 rounded-full mx-auto mt-2 mb-8" />

              {/* Close */}
              <button
                onClick={() => setActiveJob(null)}
                className="absolute top-8 right-10 font-mono text-xs text-white/30 hover:text-white/70 uppercase tracking-widest transition-colors"
              >
                [close]
              </button>

              <div className="flex gap-8 items-start">
                {/* Logo */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-[#0e0820] border border-white/10 flex items-center justify-center">
                  {activeJob.logo ? (
                    <img src={activeJob.logo} alt={activeJob.company} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono text-sm text-white/30 uppercase">{activeJob.logoText ?? activeJob.company.slice(0, 2)}</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em]">
                    {activeJob.company}
                  </p>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    {activeJob.title}
                  </h2>
                  <div className="flex gap-6 font-mono text-xs text-white/40 uppercase tracking-widest">
                    <span>{activeJob.period}</span>
                    <span>//</span>
                    <span>{activeJob.location}</span>
                  </div>
                  <div className="h-px w-12 bg-white/10 my-2" />
                  <p className="text-base text-white/60 leading-relaxed max-w-xl">
                    {activeJob.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
