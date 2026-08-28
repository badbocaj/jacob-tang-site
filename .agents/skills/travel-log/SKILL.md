---
name: travel-log
description: >-
  Interactive workflow for interviewing, drafting, and adding authentic new travel log entries
  to the personal site, including updating the TravelLog schema, PEOPLE registry, and asset paths.
---

# Travel Log Skill Guide

This skill guides the agent through adding a new travel log entry to the website's Archives section (`/travel`). It ensures the entry follows the project's **Zone B (The Archives)** aesthetic, exact TypeScript schema, companion registry, image asset paths, and mandatory interview protocol.

---

## 1. Interview Protocol (Mandatory First Step)

Before generating any story content or modifying `app/travel/page.tsx`, you **MUST** interview Jacob first with **1–2 quirky, specific questions** to extract authentic personal anecdotes, funny mistakes, or memorable details.

### What to Ask:
- **Story Details**: Ask about unexpected failures, funny interactions, weird weather, road trip chaos, bad food, or memorable banter with friends (e.g. *"What was the dumbest mistake made on this trip?"* or *"What moment made you feel like you were in an alien dimension?"*).
- **Metadata Check**: If not already provided, confirm:
  1. **Place & Country**: (e.g. `Sequoia National Park`, `USA`)
  2. **Season & Year**: (`Spring` | `Summer` | `Fall` | `Winter` and e.g. `2026`)
  3. **GPS Coordinates**: (e.g. `36.5626° N, 118.7796° W`)
  4. **Companions**: Who went on the trip (e.g. Shreyes, Justin, Daniel).

---

## 2. People Registry Check (`PEOPLE`)

Travel logs reference companions using keys from the `PEOPLE` object in `app/travel/page.tsx`.

1. Open [`app/travel/page.tsx`](file:///c:/Users/jacob/OneDrive/Desktop/New%20port/jacob-tang-site/app/travel/page.tsx#L337-L370).
2. Check if all trip companions mentioned during the interview already exist in `PEOPLE` (case-insensitive match on name).
3. **Auto-create, don't ask**: if a mentioned companion is missing, add a new entry to `PEOPLE` immediately — no need to pause and confirm with Jacob first.
   ```ts
   personkey: { name: "Full Name", image: "/people/personkey.png" },
   ```
   - **Key derivation**: lowercase full name, strip spaces/punctuation (e.g. "Tall David" → `talldavid`, "Jinqiu Wei" → `jinqiuwei`). Check the derived key doesn't already collide with an existing one before adding.
   - **Name casing**: use the proper-cased full name as given (or as best inferred) for the `name` field, even if Jacob typed it lowercase.
   - The `image` path is a placeholder — no avatar file exists on disk yet. Unlike `TravelPhoto`, `PeoplePanel`'s `<img>` has no error fallback, so it'll show a broken image icon until Jacob drops a file at `/public/people/<personkey>.png`. Mention this to him in the summary at the end.
   - *Note: Exclude Jacob himself from the `people` list — he's never a companion of his own trip.*

---

## 3. Photo Management & Asset Placement

Each travel log uses two primary images, plus avatar images for any new friends added to `PEOPLE`.

### Directory Structure & Naming Conventions:
- **Cover Image** (Polaroid thumbnail on timeline):
  - Path: `/public/travel/Cover/<slug>-cover.<ext>`
  - Field in `TravelLog`: `coverImage: "/travel/Cover/<slug>-cover.<ext>"`
- **Pop-up Image** (Header image inside the modal):
  - Path: `/public/travel/pop-up/<slug>-popup.<ext>`
  - Field in `TravelLog`: `popupImage: "/travel/pop-up/<slug>-popup.<ext>"`
- **Companion Avatars** (if adding a new person to `PEOPLE`):
  - Path: `/public/people/<personkey>.png`

### Photo Handling Rules & Web Best Practices:
1. **Case Sensitivity**: Linux web servers (Vercel, GitHub Pages) are case-sensitive. Ensure the filename extension in `page.tsx` matches the actual disk file case exactly (e.g. `.JPG` vs `.jpg` or `.HEIC` vs `.heic`).
2. **iPhone / HEIC Files**: iPhone photos often export as `.HEIC`. Recommend converting `.HEIC` images to standard `.jpg` or `.webp` for universal cross-browser performance.
3. **Agent Prompting**: During the interview, ask Jacob where his photo files are located or instruct him to drop the images into `/public/travel/Cover/` and `/public/travel/pop-up/`.
4. **Multiple Photos / Gallery (Optional Expansion)**: If Jacob wants to include a multi-photo gallery for a trip, optional `images?: string[]` array can be added to `TravelLog` and rendered inside the pop-up modal.

---

## 4. `TravelLog` Schema & Formatting

Add the new log entry into the `TRAVEL_LOGS` array in [`app/travel/page.tsx`](file:///c:/Users/jacob/OneDrive/Desktop/New%20port/jacob-tang-site/app/travel/page.tsx#L398).

```ts
{
  id: "location-season-year",           // e.g. "sequoia-national-park" or "Japan-Winter-2025"
  place: "Location Name",               // e.g. "Sequoia National Park"
  country: "Country",                   // e.g. "USA" or "Japan"
  season: "Spring",                     // "Spring" | "Summer" | "Fall" | "Winter"
  year: 2026,
  coverImage: "/travel/Cover/<slug>-cover.jpg",
  popupImage: "/travel/pop-up/<slug>-popup.jpg",
  coords: "36.5626° N, 118.7796° W",
  story:
    "The authentic personal story derived from the interview. Tone should be casual, opinionated, and focused on weird/memorable details.",
  tags: ["hiking", "national-park", "mountains"],
  placeholderGradient: "from-emerald-950 to-green-900", // Pick HSL/Tailwind gradient matching terrain/vibe
  people: ["justinyang", "shreyesbharat"],              // Keys matching the PEOPLE registry
}
```

### Tone Guidelines (Zone B):
- **Casual & Opinionated**: Avoid generic tourist descriptions like "the scenery was breathtaking and beautiful".
- **Focus on Quirks**: Emphasize unfiltered details like driving 9 hours on zero sleep, broken tents, freezing weather, state capital disappointments, or unmatched friend banter.

---

## 5. Verification

1. Verify that `app/travel/page.tsx` has valid syntax with no TypeScript errors.
2. Confirm the `PEOPLE` keys match existing keys.
3. Check that Next.js dev server compiles without errors.
