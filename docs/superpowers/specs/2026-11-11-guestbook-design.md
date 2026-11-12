# Guestbook — design

**Date:** 2026-11-11
**Status:** Approved in conversation, awaiting written-spec review
**Route:** `/guestbook` (public), `/guestbook/admin` (private)

## Goal

Let visitors to the site leave a note on a public wall, and show where they
went to college as dots on a US map. Jacob also gets private feedback on the
site.

**Success looks like:** a recruiter can leave a note in under 30 seconds, it
appears on the wall and the map straight away, and anything embarrassing stays
up only until Jacob deletes it from the admin page.

## Decisions made

| Question | Decision |
|---|---|
| Purpose | Public guestbook wall |
| Moderation | Posts go live instantly after an automatic filter; Jacob deletes after the fact |
| Placement | Its own page, `/guestbook`, in the navbar after "Funny" |
| Note contents | Name, college, why you're here, optional one-liner, optional private feedback |
| College input | Type-ahead over a bundled list of US colleges (IPEDS), plus "Outside the US" and "Didn't go / not listed" |
| Feedback visibility | Private: admin page only |
| "Why here" | One required chip + optional one-liner |
| Admin | Password-protected `/guestbook/admin` |
| Storage | Neon Postgres, added through the Vercel Marketplace |
| Layout | "Map first" (layout A from the brainstorm mockups) |
| Look | Green radar CRT, unique to this page |
| Non-US visitors | Can sign; get no dot. A world map is out of scope for now. |

## Out of scope (for now)

- World map / non-US dots
- Accounts or sign-in for visitors
- Email alerts to Jacob on new notes
- Pagination beyond the newest 100 notes
- Editing notes after posting (visitor or admin)

## Architecture

Follows existing patterns: server-side data access like `lib/riot.ts`,
components under `components/<page>/`.

```
app/guestbook/page.tsx          server component: reads notes + stats, renders the page
app/guestbook/actions.ts        server action: submitNote
app/guestbook/admin/page.tsx    password-gated list of all notes
app/guestbook/admin/actions.ts  login, logout, deleteNote

lib/db.ts                       Neon client (@neondatabase/serverless), one place
lib/guestbook.ts                listNotes, getStats, insertNote, deleteNote, countRecentByIp
lib/guestbook-validate.ts       pure validation + filter (no I/O) — unit tested
lib/colleges.ts                 searchColleges(query), getCollege(id)
lib/us-map.ts                   US outline path + projectPoint(lat, lng), server only
lib/admin-auth.ts               password check, signed cookie create/verify

data/colleges.json              US degree-granting 4-year institutions: id, name, city, state, lat, lng
scripts/build-colleges.ts       one-off: IPEDS HD CSV → data/colleges.json

components/guestbook/
  NoteForm.tsx                  client: form, chips, pending/error/success states
  CollegePicker.tsx             client: type-ahead, calls a search server action
  UsMap.tsx                     server: renders the SVG (outline, rings, dots)
  MapDots.tsx                   client: hover/tap popups, new-note ping, sweep
  Stats.tsx                     server
  NoteWall.tsx                  server
```

- **No `/api` routes.** Writes go through server actions; secrets stay on the
  server, as with the Riot key.
- **College search runs on the server** (a server action called by the picker
  as the visitor types, debounced ~150 ms, max 8 results), so the college list
  is never shipped to the browser.
- **The map is drawn on the server** with `d3-geo` (`geoAlbersUsa`, which puts
  Alaska and Hawaii in insets) and `us-atlas` + `topojson-client`. The browser
  receives a finished SVG; only the popups/animation are client code.
- The page is dynamic (reads the DB per request). After a successful submit or
  delete, `revalidatePath("/guestbook")` refreshes it.

### New dependencies

Runtime: `@neondatabase/serverless`, `d3-geo`, `topojson-client`, `us-atlas`,
`obscenity`. Dev: `vitest`, `@types/d3-geo`, `@types/topojson-client`.

## Data

One table:

```sql
create table notes (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 1 and 40),
  college_id   text,                       -- null = "Outside the US" / "Didn't go"
  college_none text check (college_none in ('outside_us', 'not_listed')),
  reason       text not null check (reason in
                 ('recruiter','classmate','friend_family','engineer','wandering')),
  reason_note  text check (char_length(reason_note) <= 120),
  feedback     text check (char_length(feedback) <= 1000),
  ip_hash      text not null,
  check ((college_id is null) <> (college_none is null))
);
create index notes_created_at on notes (created_at desc);
create index notes_ip_recent  on notes (ip_hash, created_at desc);
```

- `college_id` points into `data/colleges.json` (IPEDS `UNITID`). College
  names and coordinates are looked up from the JSON at render time, so they
  stay consistent. An id that is no longer in the JSON renders as the note
  without a dot.
- `ip_hash` = HMAC-SHA256(`GUESTBOOK_SECRET`, client IP). Used only for rate
  limiting; never selected for display.
- **The public query selects only** `id, created_at, name, college_id,
  college_none, reason, reason_note`. `feedback` and `ip_hash` are only read
  by admin code.
- The schema lives in `db/schema.sql` and is applied once by hand (Neon SQL
  editor or `psql`). No migration tool.

### College list

`scripts/build-colleges.ts` reads the IPEDS "Institutional Characteristics —
Directory Information" (HD) CSV and keeps US degree-granting institutions that
award a bachelor's degree or higher, are active, and have coordinates (roughly
2,500 schools). Output fields: `id` (UNITID), `name`, `city`, `state`, `lat`,
`lng`, `aliases`. The CSV is downloaded by hand and not committed; the JSON is committed.

Search: case-insensitive match on name, ranking prefix matches first, then
word-start matches, then substring. Common short forms come from a small
hand-written alias table in `scripts/build-colleges.ts` and are stored as an
`aliases` array on each school in the JSON (e.g. "UCLA", "MIT"). An alias may
belong to more than one school ("USC" → Southern California and South
Carolina); all of them are shown. "Outside the US" and "Didn't go / not listed" always appear at the
bottom of the results.

## The page (`/guestbook`)

Top to bottom (layout A):

1. **Header**: label "JT-01 // Guestbook", title *Incoming transmissions*, one
   sarcastic subtitle line in Zone A voice.
2. **Map**: full width. US outline (Alaska and Hawaii insets) in phosphor
   green, faint radar rings, one dot per college. Dot radius grows with the
   number of notes from that school (√count, capped). Hover/tap a dot → popup
   with the school name and the names that signed from there.
3. **Stats strip**: total notes, number of schools, share per reason
   ("40% recruiters · 25% classmates …"; reasons with 0 notes are omitted).
4. **Form + newest notes** side by side on wide screens; stacked (form first)
   below `lg`.
5. **Notes wall**: newest 100 notes, newest first. Each shows name · school (or
   "outside the US" / no school), the reason chip, and the one-liner.

Empty state (no notes yet): the map with no dots, and the wall says something
like "No signals yet. Be the first."

### Look: green radar

- Page palette, unique to `/guestbook`: background `#06110b`, primary ink
  `#c8ffd9`, muted `#6fa585`, accent/phosphor `#7dffa0`, lines
  `rgba(125,255,160,.3)`.
- Scanlines (a repeating gradient) and glow on the map and frames only. Note
  text uses the softer mint ink, not full neon, and meets WCAG AA contrast.
- A slow radar sweep across the map, and a ping on a new note's dot. Both are
  turned off under `prefers-reduced-motion`.
- Animations use Framer Motion springs (`stiffness: 400`, `damping: 20`) per
  the Zone A rules.
- The navbar gets a green theme for this route, added next to the existing
  per-page navbar themes in `app/globals.css`.

## The form and the filter

| Field | Rule |
|---|---|
| Name | Optional, trimmed, ≤ 40 chars; blank → "Anonymous" |
| College | Required: a college id, or `outside_us`, or `not_listed` |
| Why are you here? | Required, exactly one of the five reasons |
| …in a sentence? | Optional, trimmed, ≤ 120 chars, public |
| Roast or toast the site | Optional, trimmed, ≤ 1,000 chars, labelled "only Jacob sees this" |

Button: **Transmit** → "Transmitting…" while pending (`useActionState`). On
success: the form resets, the note appears at the top of the wall, its dot
pings, and the form shows "Transmission received. You are now part of the
permanent record."

### Server-side checks in `submitNote`, in order

1. **Bot trap**: a hidden `website` field must be empty, and a hidden
   form-render timestamp must be at least 3 s old. On failure, return the
   normal success message and save nothing.
2. **Validation**: the field rules above. College ids must exist in the JSON.
3. **Profanity** (`obscenity`, English preset, which catches swaps like
   "sh1t") on **name and one-liner only**. On a match: "Transmission blocked:
   language filter tripped." Feedback is not filtered.
4. **No links** in name or one-liner (anything matching a URL or `www.` /
   `.com`-style domain). Error: "Transmission blocked: no links on the wall."
5. **Rate limit**: at most 3 notes per `ip_hash` in the last hour. Error:
   "Easy, cadet. Try again in a bit." The client IP comes from
   `x-forwarded-for` (first entry) on Vercel; locally it falls back to
   `127.0.0.1`.
6. Insert, then `revalidatePath("/guestbook")`.

Steps 2–4 live in `lib/guestbook-validate.ts` as a pure function returning
either a clean note or a field-level error, so they can be unit tested without
a database.

### Failure handling

- **DB unreachable on page load**: render the page with an empty map/wall and
  a "Comms offline" notice; the form stays visible but submit will show the
  error below.
- **DB unreachable on submit**: "Comms down, try again in a minute." The
  visitor's input is kept.
- Unexpected errors are logged on the server (`console.error`) and shown to
  the visitor as the generic "comms down" message.

## Admin (`/guestbook/admin`)

- Not linked anywhere; `robots: { index: false }` in the page metadata.
- **Login**: one password field, compared to `GUESTBOOK_ADMIN_PASSWORD` in
  constant time. A wrong password waits ~1 s before answering. Success sets an
  `httpOnly`, `secure`, `sameSite=strict` cookie holding an expiry timestamp
  plus an HMAC signature (`GUESTBOOK_SECRET`), valid for 7 days.
- **List**: all notes, newest first, with every field except `ip_hash`,
  including feedback and timestamp. Toggle: "only notes with feedback".
- **Delete**: per note, with a confirm step; hard delete, then revalidate
  `/guestbook` and the admin page.
- **Log out**: clears the cookie.
- Every admin action re-verifies the cookie on the server.

## Configuration

| Env var | Purpose |
|---|---|
| `DATABASE_URL` | Set automatically when Neon is connected through the Vercel Marketplace; copied to `.env.local` for development |
| `GUESTBOOK_ADMIN_PASSWORD` | Jacob's admin password |
| `GUESTBOOK_SECRET` | Long random string; signs the admin cookie and keys the IP hash |

If `DATABASE_URL` is missing, the page renders the "Comms offline" state
instead of crashing. If either guestbook secret is missing, admin login is
disabled with a clear message.

Development uses a separate Neon **branch** (a free copy of the database), so
testing never touches real notes.

## Testing

Add Vitest (dev only) with a `test` script. Unit tests:

- **Validation**: lengths, required fields, "Anonymous" default, invalid
  reason, unknown college id, trimming.
- **Filter**: profanity in name and one-liner (including character swaps);
  links blocked; feedback unfiltered.
- **Bot trap**: filled honeypot or a < 3 s submit returns success without
  inserting (insert function mocked).
- **Rate limit**: the 4th note within an hour from one `ip_hash` is rejected
  (count function mocked).
- **College search**: "purdue" finds Purdue; "usc" finds both the University
  of Southern California and the University of South Carolina; the two "not on the map" options are always present.
- **Map projection**: USC projects into the southern-California part of the
  map; a Hawaii school lands in the Hawaii inset; a point outside the US
  returns null.
- **Admin auth**: correct password succeeds; wrong password fails; an expired
  or tampered cookie fails.

Manual check in the browser against the dev Neon branch: sign the wall, see
the dot and stats update, trip the profanity, link and rate-limit errors,
check reduced motion and phone width, then log in to the admin page, read the
feedback and delete a note.
