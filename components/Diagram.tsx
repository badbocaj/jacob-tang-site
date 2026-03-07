"use client"

import { motion, useReducedMotion } from "framer-motion"

export function Diagram({ variant }: { variant: "project" | "blog" }) {
  const reduce = useReducedMotion()
  const path =
    variant === "project"
      ? "M10 80 C 80 20, 140 140, 210 80 S 340 80, 410 80"
      : "M10 40 L110 40 L160 90 L260 90 L310 40 L410 40"

  return (
    <div aria-hidden className="absolute inset-0 opacity-30">
      <svg viewBox="0 0 420 160" className="h-full w-full">
        <motion.path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth="2"
          initial={reduce ? false : { pathLength: 0, opacity: 0.2 }}
          animate={reduce ? {} : { pathLength: 1, opacity: 0.35 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )
}