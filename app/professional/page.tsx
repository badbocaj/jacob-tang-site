'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause } from 'lucide-react'
import ReflectiveCard from '@/components/professional/ReflectiveCard'
import AnimatedList, { JobItem } from '@/components/professional/AnimatedList'

const JOB_HISTORY: JobItem[] = [
  {
    company: 'Company A',
    title: 'Senior Software Engineer',
    period: '2023 – Present',
    description: 'Led development of core platform features. Placeholder — replace with your real experience.',
    logoText: 'CA',
  },
  {
    company: 'Company B',
    title: 'Software Engineer',
    period: '2021 – 2023',
    description: 'Built and maintained full-stack web applications. Placeholder — replace with your real experience.',
    logoText: 'CB',
  },
  {
    company: 'Company C',
    title: 'Junior Developer',
    period: '2019 – 2021',
    description: 'Developed internal tooling and dashboards. Placeholder — replace with your real experience.',
    logoText: 'CC',
  },
  {
    company: 'University Project',
    title: 'Lead Engineer',
    period: '2018 – 2019',
    description: 'Capstone project involving full-stack development. Placeholder — replace with your real experience.',
    logoText: 'UP',
  },
]

export default function ProfessionalPage() {
  const [isResumed, setIsResumed] = useState(false)

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
              {/* Pause icon overlay */}
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
            {/* Left — ReflectiveCard */}
            <div className="w-1/2 h-full p-8">
              <ReflectiveCard
                name="JACOB TANG"
                role="Software Engineer"
                phone="+1 (XXX) XXX-XXXX"
                overlayColor="rgba(0, 0, 0, 0.38)"
                blurStrength={14}
                glassDistortion={25}
                metalness={1}
                roughness={0.75}
                displacementStrength={18}
                noiseScale={1}
                specularConstant={4}
                grayscale={0.2}
                color="#ffffff"
              />
            </div>

            {/* Right — AnimatedList */}
            <div className="w-1/2 h-full p-8">
              <div className="mb-6">
                <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-white/30">
                  Work History
                </h2>
                <div className="h-px w-full bg-white/5 mt-3" />
              </div>
              <div style={{ height: 'calc(100% - 56px)' }}>
                <AnimatedList
                  items={JOB_HISTORY}
                  showGradients
                  enableArrowNavigation
                  displayScrollbar={false}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
