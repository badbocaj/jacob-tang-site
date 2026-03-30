# 🛰️ Project: The Cockpit (About Page)
**Status:** Phase 1 - Structural Interface
**Theme:** Aerospace / CAD / Tactical HUD

## 🧭 The Vision
Replacing the static "room" layout with an interactive spacecraft cockpit. This serves as the primary gateway to the Digital Garden (Travel, Movies, Engineering Projects).

## 🛠️ System Phases
1. **Sketch Layer:** A wireframe/CAD tribute to the human-powered plane design. Uses low-opacity lines to simulate a blueprint "drawing in."
2. **Boot Layer:** A terminal-style sequence initializing flight systems.
3. **Cockpit Layer:** The final interactive HUD. High contrast, neon accents, and immersive scaling.

## 📍 Interactive HUD Regions
| Region | Target Section | Description |
| :--- | :--- | :--- |
| Navigation Screen | /travel | Global map and flight logs. |
| Radar/System | /projects | Engineering work (HPFRT & Liquid Prop). |
| Log Panel | /professional | Career history and resume. |
| Media Screen | /movies | Reviews and watchlists. |
| Stats Panel | /stats | Personal metrics and "Strategic Statistics." |
| Trophy Area | /proud-moments | Achievements and milestones. |
| Sports Item | /sports | Athletics and fitness tracking. |

## 🤖 AI Guidance (For Claude/Antigravity)
- **Visuals:** Prioritize 'Dark Mode' aesthetics. Use `framer-motion` for all transitions.
- **Math:** Use $scale: 1.05$ for the final zoom to create depth.
- **Accessibility:** The user's keyboard has broken **24th (X)** and **26th (Z)** keys. Ensure all code is generated so the user only needs to copy/paste, not type these characters for setup.