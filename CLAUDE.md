# Agent Instructions: jacob-tang-site

## Tech Stack & Architecture
- Framework: Next.js (App Router, TypeScript)
- Styling: Tailwind CSS
- Animation: Framer Motion / Motion.dev
- Icons: Lucide React

## Project Directory Map
- `/app` -> Page routes (`/about`, `/travel`, `/movies`, `/projects`)
- `/components` -> Reusable UI elements (`/components/Cockpit`, etc.)
- `/public` -> Static assets, images, sketches

## Clarification Protocol
When a prompt is ambiguous or unclear, ask 1-2 specific questions before writing code:
- Scope: Is this a new component, editing existing code, or a full page?
- Tone/Vibe: Which Zone does this fall under?
- Visual intent: Layout, animations, or styling goals?

## Interview Protocol (Digital Garden Entries)
When adding new entries to `/movies`, `/travel`, or `/projects`, interview me first with 1-2 quirky questions to pull out authentic personal details before generating content.

## Zone Rules (Tone & Aesthetics)

### Zone A — Front Door (`/components/Cockpit` or `/about`)
- Aesthetic: "Quirky Aerospace" — low-fi "Diary of a Wimpy Kid" sketches meets glitchy spacecraft terminals.
- Motion: Snappy spring animations (`stiffness: 400`, `damping: 20`), CRT scanlines, subtle glitch transitions.
- Tone: Sarcastic computer, incoming transmissions, error alerts.

### Zone B — The Archives (`/movies` and `/travel`)
- Aesthetic: Personal life log and diary.
- Motion: Smooth page transitions, staggered card reveals on scroll.
- Tone: Casual, opinionated, focused on weird/memorable details.

### Zone C — The Lab (`/projects` / Liquid Propulsion / HPFRT)
- Aesthetic: "Low-Fidelity Engineering."
- Motion: Interactive blueprint overlays, CAD-style interactive elements.
- Tone: Grounded in hardware engineering (thermodynamics, aero, math failures), kept light and personal.

## Coding Guidelines
- Always write clean, fully-typed TypeScript (`.tsx`).
- Use Tailwind for utility styling and Framer Motion for UI animations.
- Modify existing files in place rather than creating duplicate component variants.