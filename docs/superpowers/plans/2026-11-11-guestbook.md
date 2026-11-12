# Guestbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public `/guestbook` wall where visitors leave a note, see a US map of visitors' colleges, and send Jacob private feedback, plus a password-gated `/guestbook/admin`.

**Architecture:** Server components read Neon Postgres directly; writes go through server actions (no `/api` routes). All rules (validation, filter, bot trap, rate limit, admin auth, IP hashing) live in small pure `lib/` modules that are unit tested without a database. The US map is projected and drawn on the server; the browser only runs the form, the college picker, and the map popups/animation.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Tailwind 4, Framer Motion, `@neondatabase/serverless`, `d3-geo`, `topojson-client`, `us-atlas`, `obscenity`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-11-guestbook-design.md`

## Global Constraints

- Branch: `feat/guestbook`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Next 16: `headers()`, `cookies()` and page `searchParams` are **async** (await them).
- No `/api` routes. Server actions live in `actions.ts` files with `"use server"`.
- Public queries select only `id, created_at, name, college_id, college_none, reason, reason_note`. Only admin code reads `feedback`; nothing ever selects `ip_hash` for display.
- Length limits count **code points** (`[...s].length`), matching Postgres `char_length`: name ≤ 40, one-liner ≤ 120, feedback ≤ 1000.
- Reasons, in this order: `recruiter, classmate, friend_family, engineer, wandering`; chip labels `Recruiter`, `Classmate`, `Friend/family`, `Fellow engineer`, `Just wandering`.
- Palette (this page only): bg `#06110b`, ink `#c8ffd9`, muted `#6fa585`, phosphor/accent `#7dffa0`, lines `rgba(125,255,160,.3)`. Note text uses ink/muted, never full-neon accent.
- Motion: Framer Motion springs `stiffness: 400, damping: 20`. Sweep and ping are off under `prefers-reduced-motion`.
- Rate limit: 3 notes per `ip_hash` per 60 minutes. Bot trap: honeypot field `website` non-empty, or submitted < 3000 ms after render.
- Copy, verbatim:
  - success: `Transmission received. You are now part of the permanent record.`
  - profanity: `Transmission blocked: language filter tripped.`
  - links: `Transmission blocked: no links on the wall.`
  - rate limit: `Easy, cadet. Try again in a bit.`
  - DB error on submit: `Comms down, try again in a minute.`
  - DB error on load: `Comms offline`
  - empty wall: `No signals yet. Be the first.`
  - header label `JT-01 // Guestbook`, title `Incoming transmissions`, subtitle `Sign in. The computer is watching.`, button `Transmit` / `Transmitting…`, feedback label `Roast or toast the site`, feedback hint `only Jacob sees this`.
- Env vars: `DATABASE_URL`, `GUESTBOOK_ADMIN_PASSWORD`, `GUESTBOOK_SECRET`. Missing `DATABASE_URL` → page renders the "Comms offline" state. Missing either guestbook secret → admin login disabled with a message; submissions fail with the "Comms down" message and a server log line.

## Review Focus

1. **Whitespace-only fields** — a name of `"   "` must become `Anonymous`; a blank one-liner/feedback must store `null`, not `""`. (Task 1)
2. **Emoji and non-ASCII length** — a name of 40 emoji is accepted; 41 is rejected. JS `.length` would count 80. (Task 1)
3. **Odd `x-forwarded-for`** — `"1.2.3.4, 10.0.0.1"`, `" 1.2.3.4 "`, empty, or missing header must yield the first trimmed IP or `127.0.0.1`, never `""`. (Task 4)
4. **College search on awkward queries** — `""`, `"a"`, `"st. john's"`, `"(" ` must not throw; an empty query returns only the two not-on-the-map options. (Task 2)
5. **Malformed admin cookies** — `"abc"`, `"123."`, `".sig"`, `undefined`, an expired token, or a token signed with another secret must return `false` without throwing. (Task 5)

## Prerequisites (Jacob does these; the executor asks for them when a task needs them)

- **P1 (before Task 2):** download the IPEDS directory file `HD2023.zip` from `https://nces.ed.gov/ipeds/datacenter/data/HD2023.zip`, unzip it, and put `hd2023.csv` at `scripts/data/hd2023.csv` (git-ignored).
- **P2 (before Task 8):** in the Vercel dashboard, add **Neon** from the Marketplace to this project. In Neon, create a branch named `dev`. Put the `dev` branch connection string in `.env.local` as `DATABASE_URL`. Run `db/schema.sql` (Task 3) in the Neon SQL editor on **both** `main` and `dev`.
- **P3 (before Task 8):** set `GUESTBOOK_ADMIN_PASSWORD` and `GUESTBOOK_SECRET` in `.env.local` and in Vercel's env vars. The executor generates the secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and gives it to Jacob.

## File map

```
vitest.config.ts                         test runner config (alias @ → repo root)
lib/guestbook-types.ts                   shared types + REASONS/labels (Task 1)
lib/guestbook-validate.ts                validateNote: lengths, profanity, links (Task 1)
scripts/build-colleges.ts                IPEDS CSV → data/colleges.json (Task 2)
data/colleges.json                       generated, committed (Task 2)
lib/colleges.ts                          getCollege, collegeExists, searchCollegeOptions (Task 2)
db/schema.sql                            notes table (Task 3)
lib/db.ts                                Neon client + DbUnavailableError (Task 3)
lib/guestbook.ts                         queries + formatReasonShares (Task 3)
lib/guestbook-ip.ts                      clientIpFrom, hashIp (Task 4)
lib/guestbook-submit.ts                  submitNoteCore (bot trap → validate → rate limit → insert) (Task 4)
app/guestbook/actions.ts                 submitNote, searchCollegesAction (Task 4)
lib/admin-auth.ts                        checkPassword, create/verifySessionToken (Task 5)
lib/us-map.ts                            MAP_WIDTH/HEIGHT, usOutline, projectPoint, dotRadius (Task 6)
components/guestbook/UsMap.tsx           server SVG (Task 6)
components/guestbook/MapDots.tsx         client popups, sweep, ping (Task 6)
components/guestbook/PingContext.tsx     client context: last submitted college id (Task 6)
components/guestbook/Stats.tsx           (Task 7)
components/guestbook/NoteWall.tsx        (Task 7)
app/guestbook/page.tsx                   (Task 7)
components/Navbar.tsx, app/globals.css   nav item + radar theme (Task 7)
components/guestbook/CollegePicker.tsx   (Task 8)
components/guestbook/NoteForm.tsx        (Task 8)
app/guestbook/admin/page.tsx             (Task 9)
app/guestbook/admin/actions.ts           (Task 9)
components/guestbook/admin/*.tsx         LoginForm, DeleteButton (Task 9)
tests/guestbook/*.test.ts                unit tests
```

---

### Task 1: Test runner, shared types, and note validation

**Files:**
- Create: `vitest.config.ts`, `lib/guestbook-types.ts`, `lib/guestbook-validate.ts`
- Modify: `package.json` (add `"test": "vitest run"`; dev deps `vitest`; dep `obscenity`)
- Test: `tests/guestbook/validate.test.ts`

**Interfaces:**
- Produces (`lib/guestbook-types.ts`):
  ```ts
  export const REASONS = ["recruiter","classmate","friend_family","engineer","wandering"] as const;
  export type Reason = (typeof REASONS)[number];
  export const REASON_LABELS: Record<Reason, string>;       // chip labels from Global Constraints
  export const NO_COLLEGE = ["outside_us", "not_listed"] as const;
  export type NoCollege = (typeof NO_COLLEGE)[number];
  export interface NoteInput { name: string; college: string; reason: string; reasonNote: string; feedback: string }
  export interface CleanNote { name: string; collegeId: string | null; collegeNone: NoCollege | null;
                               reason: Reason; reasonNote: string | null; feedback: string | null }
  export type ValidationResult =
    | { ok: true; note: CleanNote }
    | { ok: false; field: keyof NoteInput; message: string };
  export interface PublicNote { id: number; createdAt: Date; name: string; collegeId: string | null;
                                collegeNone: NoCollege | null; reason: Reason; reasonNote: string | null }
  export interface AdminNote extends PublicNote { feedback: string | null }
  export interface GuestbookStats { total: number; schools: number; byReason: Record<Reason, number> }
  export interface MapEntry { collegeId: string; names: string[] }
  ```
- Produces (`lib/guestbook-validate.ts`):
  `validateNote(input: NoteInput, collegeExists: (id: string) => boolean): ValidationResult`
  `codePointLength(s: string): number`

Order of checks and messages (first failure wins):
| check | field | message |
|---|---|---|
| name > 40 | name | `Name is too long (40 max).` |
| college not an existing id and not in NO_COLLEGE | college | `Pick a college, or one of the not-on-the-map options.` |
| reason not in REASONS | reason | `Pick why you're here.` |
| one-liner > 120 | reasonNote | `Keep it under 120 characters.` |
| feedback > 1000 | feedback | `Keep it under 1,000 characters.` |
| profanity in name or one-liner | name / reasonNote | profanity copy |
| link in name or one-liner | name / reasonNote | links copy |

- [ ] **Step 1: Install and configure.** `npm i obscenity` and `npm i -D vitest`; add the `test` script; `vitest.config.ts` with `resolve.alias: { "@": <repo root> }`, `test.include: ["tests/**/*.test.ts"]`, `environment: "node"`.

- [ ] **Step 2: Write the failing tests** in `tests/guestbook/validate.test.ts`, using `const exists = (id: string) => id === "123961"` and a `base: NoteInput = { name: "Maya", college: "123961", reason: "recruiter", reasonNote: "", feedback: "" }`:
  ```ts
  it("accepts a minimal note and nulls blank optionals", () => {
    expect(validateNote(base, exists)).toEqual({ ok: true, note: {
      name: "Maya", collegeId: "123961", collegeNone: null, reason: "recruiter", reasonNote: null, feedback: null } });
  });
  it("defaults blank and whitespace-only names to Anonymous", ...)          // "" and "   " → "Anonymous"
  it("trims every field", ...)                                              // "  Maya  " → "Maya", reasonNote "  hi " → "hi"
  it("counts code points: 40 emoji pass, 41 fail", ...)                     // "🚀".repeat(40) ok; repeat(41) → field "name"
  it("accepts outside_us and not_listed as the college", ...)              // collegeId null, collegeNone set
  it("rejects an unknown college id", ...)                                  // college "999" → field "college"
  it("rejects an unknown reason", ...)                                      // reason "spy" → field "reason"
  it("enforces 120 and 1000 limits", ...)                                   // 121 / 1001 chars → reasonNote / feedback
  it("blocks profanity in name and one-liner, incl. swaps", ...)           // name "sh1t head" → field "name", message = profanity copy
  it("does not filter private feedback", ...)                               // feedback "this site is shit" → ok
  it("blocks links in public fields", ...)                                  // reasonNote "see www.spam.io", "https://x.co", "buy.com now" → links copy
  it("allows dotted text that is not a link", ...)                          // reasonNote "U.S. citizen, Ph.D. student" → ok
  ```

- [ ] **Step 3: Run** `npm test` — expected: FAIL (module not found).

- [ ] **Step 4: Implement** the types file and `validateNote`. Profanity: `obscenity`'s `RegExpMatcher` with `englishDataset.build()` and `englishRecommendedTransformers`. Link check regex: `/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|xyz|ru|info|biz|me|ly|gg|app|dev)\b)/i`.

- [ ] **Step 5: Run** `npm test` — expected: all pass.

- [ ] **Step 6: Commit** — `git add vitest.config.ts package.json package-lock.json lib/guestbook-types.ts lib/guestbook-validate.ts tests/guestbook/validate.test.ts` → `feat(guestbook): note validation and profanity/link filter`.

---

### Task 2: College list and search

**Files:**
- Create: `scripts/build-colleges.ts`, `data/colleges.json` (generated), `lib/colleges.ts`
- Modify: `.gitignore` (add `scripts/data/`), `package.json` (dev dep `csv-parse`; script `"build:colleges": "node scripts/build-colleges.ts"`)
- Test: `tests/guestbook/colleges.test.ts`

**Interfaces:**
- Consumes: `NO_COLLEGE`, `NoCollege` from Task 1.
- Produces (`lib/colleges.ts`):
  ```ts
  export interface College { id: string; name: string; city: string; state: string; lat: number; lng: number; aliases: string[] }
  export interface CollegeOption { value: string; label: string; sub?: string }   // value = UNITID or a NoCollege
  export function getCollege(id: string): College | undefined;
  export function collegeExists(id: string): boolean;
  export function searchCollegeOptions(query: string, limit?: number): CollegeOption[];  // limit default 8
  export const NO_COLLEGE_OPTIONS: CollegeOption[];  // [{value:"outside_us",label:"Outside the US"},{value:"not_listed",label:"Didn't go / not listed"}]
  ```

Needs **P1**.

- [ ] **Step 1: Write `scripts/build-colleges.ts`** (Node 24 runs it directly; erasable TS syntax only). Read `scripts/data/hd2023.csv` as `latin1`, parse with `csv-parse/sync` (`columns: true`). Keep rows where `CYACTIVE === "1"`, `DEGGRANT === "1"`, `Number(HLOFFER) >= 5`, `STABBR` is one of the 50 states or `DC`, and `LATITUDE`/`LONGITUD` parse to finite numbers. Map to `College` (`id: UNITID`, `name: INSTNM`, `city: CITY`, `state: STABBR`, `lat`, `lng`, `aliases: []`). Apply this alias table, and **throw** if any id is missing from the output:
  ```ts
  const ALIASES: Record<string, string[]> = {
    "123961": ["USC"], "218663": ["USC"], "110662": ["UCLA"], "166683": ["MIT"],
    "110635": ["Berkeley", "Cal"], "243780": ["Purdue"], "228778": ["UT Austin"],
  };
  ```
  Write `data/colleges.json` sorted by name, no pretty-printing. Print the count.

- [ ] **Step 2: Run** `npm run build:colleges` — expected: prints a count between 2,000 and 3,000, and `data/colleges.json` exists. Spot-check that `123961` is "University of Southern California" and `218663` is "University of South Carolina-Columbia".

- [ ] **Step 3: Write the failing tests:**
  ```ts
  it("finds Purdue by prefix", () => expect(searchCollegeOptions("purdue")[0].label).toMatch(/^Purdue University/));
  it("finds both USCs by alias", () => {
    const v = searchCollegeOptions("usc").map(o => o.value);
    expect(v).toContain("123961"); expect(v).toContain("218663");
  });
  it("always ends with the two not-on-the-map options", () => {
    expect(searchCollegeOptions("purdue").slice(-2)).toEqual(NO_COLLEGE_OPTIONS);
  });
  it("returns only the not-on-the-map options for an empty query", () => {
    expect(searchCollegeOptions("")).toEqual(NO_COLLEGE_OPTIONS);
    expect(searchCollegeOptions("   ")).toEqual(NO_COLLEGE_OPTIONS);
  });
  it("does not throw on punctuation", () => {
    for (const q of ["(", "st. john's", "a", "*", "\\"]) expect(() => searchCollegeOptions(q)).not.toThrow();
  });
  it("caps college matches at the limit", () => expect(searchCollegeOptions("university").length).toBe(8 + 2));
  it("sub shows city and state", () => expect(searchCollegeOptions("purdue")[0].sub).toBe("West Lafayette, IN"));
  it("collegeExists / getCollege", ...)   // "123961" true; "nope" false
  ```

- [ ] **Step 4: Run** `npm test` — expected: FAIL.

- [ ] **Step 5: Implement `lib/colleges.ts`.** Import the JSON statically; build a `Map` by id once. Ranking (lower is better), ties broken by name: 0 = an alias equals the query (case-insensitive); 1 = name starts with the query; 2 = any word in the name starts with the query; 3 = name contains the query. Use plain `toLowerCase()` + `startsWith`/`includes` — no regex built from user input. Queries are trimmed; an empty query returns `NO_COLLEGE_OPTIONS`.

- [ ] **Step 6: Run** `npm test` — expected: pass.

- [ ] **Step 7: Commit** — `.gitignore package.json package-lock.json scripts/build-colleges.ts data/colleges.json lib/colleges.ts tests/guestbook/colleges.test.ts` → `feat(guestbook): IPEDS college list and search`.

---

### Task 3: Database schema and queries

**Files:**
- Create: `db/schema.sql`, `lib/db.ts`, `lib/guestbook.ts`
- Modify: `package.json` (dep `@neondatabase/serverless`)
- Test: `tests/guestbook/stats.test.ts`

**Interfaces:**
- Consumes: types from Task 1.
- Produces (`lib/db.ts`): `class DbUnavailableError extends Error`; `getSql(): NeonQueryFunction` — throws `DbUnavailableError` when `DATABASE_URL` is unset.
- Produces (`lib/guestbook.ts`):
  ```ts
  listNotes(limit?: number): Promise<PublicNote[]>                 // default 100, newest first
  getStats(): Promise<GuestbookStats>                              // schools = distinct non-null college_id
  getMapEntries(): Promise<MapEntry[]>                             // one entry per college_id, names oldest→newest
  insertNote(note: CleanNote, ipHash: string): Promise<PublicNote>
  countRecentByIp(ipHash: string, minutes?: number): Promise<number>   // default 60
  listAllNotes(onlyWithFeedback: boolean): Promise<AdminNote[]>
  deleteNote(id: number): Promise<void>
  formatReasonShares(byReason: Record<Reason, number>, total: number): string   // pure
  ```

- [ ] **Step 1: Write `db/schema.sql`** — copy the `create table notes` and both indexes verbatim from the spec's Data section.

- [ ] **Step 2: Write the failing test** for the one pure function. Plural labels: `recruiters`, `classmates`, `friends & family`, `fellow engineers`, `wanderers`. Sort by count desc, ties in `REASONS` order; omit zeros; `Math.round`; join with ` · `.
  ```ts
  it("formats shares", () => expect(formatReasonShares(
    { recruiter: 4, classmate: 3, friend_family: 0, engineer: 2, wandering: 1 }, 10))
    .toBe("40% recruiters · 30% classmates · 20% fellow engineers · 10% wanderers"));
  it("is empty when there are no notes", () => expect(formatReasonShares(
    { recruiter: 0, classmate: 0, friend_family: 0, engineer: 0, wandering: 0 }, 0)).toBe(""));
  ```

- [ ] **Step 3: Run** `npm test` — FAIL. **Step 4: Implement** `lib/db.ts` (`neon(process.env.DATABASE_URL)`) and `lib/guestbook.ts` with tagged-template queries. Every public query lists its columns explicitly (no `select *`). Map snake_case rows to the camelCase types. **Step 5: Run** `npm test` — pass; `npx tsc --noEmit` shows no new errors.

- [ ] **Step 6: Commit** — `feat(guestbook): notes schema and queries`.

---

### Task 4: Submitting a note (IP hash, bot trap, rate limit, server actions)

**Files:**
- Create: `lib/guestbook-ip.ts`, `lib/guestbook-submit.ts`, `app/guestbook/actions.ts`
- Test: `tests/guestbook/ip.test.ts`, `tests/guestbook/submit.test.ts`

**Interfaces:**
- Consumes: `validateNote` (T1), `collegeExists`/`searchCollegeOptions` (T2), `insertNote`/`countRecentByIp`/`DbUnavailableError` (T3).
- Produces:
  ```ts
  // lib/guestbook-ip.ts
  clientIpFrom(headers: Headers): string          // first trimmed x-forwarded-for entry, else "127.0.0.1"
  hashIp(ip: string, secret: string): string      // HMAC-SHA256 hex
  // lib/guestbook-submit.ts
  export type SubmitState =
    | { status: "idle" }
    | { status: "success"; message: string; collegeId: string | null }
    | { status: "error"; field?: keyof NoteInput; message: string };
  export interface SubmitDeps {
    collegeExists(id: string): boolean;
    countRecentByIp(ipHash: string): Promise<number>;
    insertNote(note: CleanNote, ipHash: string): Promise<PublicNote>;
    now(): number;
  }
  export async function submitNoteCore(form: FormData, ipHash: string, deps: SubmitDeps): Promise<SubmitState>;
  // app/guestbook/actions.ts  ("use server")
  submitNote(prev: SubmitState, form: FormData): Promise<SubmitState>
  searchCollegesAction(query: string): Promise<CollegeOption[]>
  ```
  Form field names: `name, college, reason, reasonNote, feedback, website, renderedAt` (`renderedAt` = ms epoch as a string).

- [ ] **Step 1: Write failing IP tests:** `"1.2.3.4, 10.0.0.1"` → `"1.2.3.4"`; `" 1.2.3.4 "` → `"1.2.3.4"`; `""` and missing header → `"127.0.0.1"`; `hashIp` is 64 hex chars, stable for the same input, different for a different secret.

- [ ] **Step 2: Write failing submit tests** with a `deps` factory using `vi.fn()` (`countRecentByIp` → 0, `insertNote` → a fake `PublicNote`, `now` → `10_000`) and a valid form with `renderedAt: "1000"`:
  ```ts
  it("saves a valid note and returns the success copy", ...)       // status success, collegeId "123961", insertNote called once
  it("fakes success for a filled honeypot without saving", ...)    // website "x" → success, insertNote not called
  it("fakes success when submitted under 3 s", ...)                // renderedAt "8000" → success, not saved
  it("fakes success when renderedAt is missing or junk", ...)      // "", "abc"
  it("returns validation errors with the field", ...)              // reason "spy" → { status: "error", field: "reason" }
  it("blocks the 4th note in an hour", ...)                        // countRecentByIp → 3 → rate-limit copy, not saved
  it("maps DB failures to the comms-down copy", ...)               // insertNote rejects → "Comms down, try again in a minute."
  ```
  Order inside `submitNoteCore`: bot trap → `validateNote` → `countRecentByIp` (≥ 3 blocks) → `insertNote`. Any thrown error from the DB deps → comms-down copy (log with `console.error`).

- [ ] **Step 3: Run** `npm test` — FAIL. **Step 4: Implement** the two lib files. **Step 5: Run** — pass.

- [ ] **Step 6: Implement `app/guestbook/actions.ts`.** `submitNote` reads `GUESTBOOK_SECRET` (missing → `console.error` + comms-down state), computes `hashIp(clientIpFrom(await headers()), secret)`, calls `submitNoteCore` with the real deps, and on success calls `revalidatePath("/guestbook")`. `searchCollegesAction` returns `searchCollegeOptions(query.slice(0, 80))`. Run `npx tsc --noEmit` — no new errors.

- [ ] **Step 7: Commit** — `feat(guestbook): submit action with bot trap and rate limit`.

---

### Task 5: Admin authentication helpers

**Files:**
- Create: `lib/admin-auth.ts`
- Test: `tests/guestbook/admin-auth.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const ADMIN_COOKIE = "gb_admin";
  export const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
  checkPassword(given: string, expected: string): boolean            // timingSafeEqual over SHA-256 digests
  createSessionToken(secret: string, now?: number): string           // `${expiresAtMs}.${hmacHex}`
  verifySessionToken(token: string | undefined, secret: string, now?: number): boolean
  ```

- [ ] **Step 1: Write failing tests:** right password true, wrong false, different lengths false (no throw); a fresh token verifies; at `now + SESSION_MS + 1` it fails; a token signed with another secret fails; a token with its expiry edited fails; `"abc"`, `"123."`, `".sig"`, `""`, `undefined` all return false without throwing.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement** with `node:crypto`. **Step 4: Run** — pass.
- [ ] **Step 5: Commit** — `feat(guestbook): admin session helpers`.

---

### Task 6: The US map

**Files:**
- Create: `lib/us-map.ts`, `components/guestbook/UsMap.tsx`, `components/guestbook/MapDots.tsx`, `components/guestbook/PingContext.tsx`
- Modify: `package.json` (deps `d3-geo`, `topojson-client`, `us-atlas`; dev deps `@types/d3-geo`, `@types/topojson-client`)
- Test: `tests/guestbook/us-map.test.ts`

**Interfaces:**
- Consumes: `getCollege` (T2), `MapEntry` (T1).
- Produces:
  ```ts
  // lib/us-map.ts (server only — imported only by server components)
  export const MAP_WIDTH = 975, MAP_HEIGHT = 610;
  export const nationPath: string;   // outline, from us-atlas/states-albers-10m.json objects.nation via geoPath()
  export const statesPath: string;   // interior state borders, topojson mesh (a, b) => a !== b
  projectPoint(lat: number, lng: number): { x: number; y: number } | null   // geoAlbersUsa().scale(1300).translate([487.5, 305])
  dotRadius(count: number): number   // Math.min(3 + 2.5 * Math.sqrt(count), 14)
  export interface MapDot { collegeId: string; x: number; y: number; r: number; label: string; names: string[] }
  toMapDots(entries: MapEntry[]): MapDot[]   // drops unknown ids and unprojectable points
  // components/guestbook/PingContext.tsx ("use client")
  PingProvider({ children }); usePing(): { pingId: string | null; ping(collegeId: string | null): void }
  // components/guestbook/UsMap.tsx (server)
  UsMap({ dots }: { dots: MapDot[] })
  // components/guestbook/MapDots.tsx ("use client")
  MapDots({ dots }: { dots: MapDot[] })
  ```

- [ ] **Step 1: Write failing tests:**
  ```ts
  it("puts USC in southern California", () => { const p = projectPoint(34.0224, -118.2851)!;
    expect(p.x).toBeLessThan(220); expect(p.y).toBeGreaterThan(280); expect(p.y).toBeLessThan(450); });
  it("puts UH Manoa in the Hawaii inset", () => { const p = projectPoint(21.2969, -157.8171)!;
    expect(p.x).toBeLessThan(420); expect(p.y).toBeGreaterThan(480); });
  it("returns null outside the US", () => expect(projectPoint(48.8566, 2.3522)).toBeNull());
  it("grows dots with the square root, capped", () => {
    expect(dotRadius(1)).toBe(5.5); expect(dotRadius(4)).toBe(8); expect(dotRadius(100)).toBe(14); });
  it("toMapDots drops unknown colleges", () =>
    expect(toMapDots([{ collegeId: "nope", names: ["x"] }])).toEqual([]));
  it("nationPath is a non-empty SVG path", () => expect(nationPath).toMatch(/^M/));
  ```
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement `lib/us-map.ts`.** The albers file is pre-projected, so draw outlines with `geoPath()` (null projection); use `geoAlbersUsa` only for points. **Step 4: Run** — pass.

- [ ] **Step 5: Build the components.** `UsMap` renders `<svg viewBox="0 0 975 610" role="img" aria-label="Map of where visitors went to college">`: radar rings (3 concentric circles at the map centre, line colour), `statesPath` stroked faintly, `nationPath` stroked in ink with a soft green glow (`drop-shadow` filter), then `<MapDots dots={dots} />` inside the same `<svg>` (a client component rendering a `<g>`). `MapDots`: circles in accent; hover/focus/tap a dot → a small HTML popup (absolutely positioned over the SVG via a wrapper) with the school `label` and `names.join(", ")`; each dot is focusable (`tabIndex={0}`, `aria-label` = label + count). A rotating sweep (conic-gradient wedge, ~8 s per turn) via Tailwind `motion-safe:` classes. When `usePing().pingId` matches a dot, play a ring-expand animation once (Framer spring per Global Constraints) unless `useReducedMotion()`.

- [ ] **Step 6: Commit** — `feat(guestbook): server-drawn US map with dots`.

---

### Task 7: The page (read side) and navbar

**Files:**
- Create: `app/guestbook/page.tsx`, `components/guestbook/Stats.tsx`, `components/guestbook/NoteWall.tsx`
- Modify: `components/Navbar.tsx` (add `{ label: "Guestbook", href: "/guestbook" }` after Funny; `NavTheme` gains `"radar"`; `themeFor` returns `"radar"` for paths starting with `/guestbook`), `app/globals.css` (add `.site-nav[data-theme="radar"]` using the page palette: dark glass bg `rgba(6,17,11,.7)`, ink `#c8ffd9`, muted `#6fa585`, border `rgba(125,255,160,.2)`, active pill bg `#7dffa0` / ink `#06110b`)

**Interfaces:**
- Consumes: `listNotes`, `getStats`, `getMapEntries`, `formatReasonShares`, `DbUnavailableError` (T3); `toMapDots`, `UsMap`, `PingProvider` (T6); `getCollege` (T2); `REASON_LABELS` (T1).
- Produces: `Stats({ stats }: { stats: GuestbookStats })`, `NoteWall({ notes }: { notes: PublicNote[] })`.

- [ ] **Step 1: Build `app/guestbook/page.tsx`.** `export const dynamic = "force-dynamic"`; metadata title `Guestbook — Jacob Tang`. Load the three queries with `Promise.all` inside try/catch; on any error set `offline = true` and use empty data. Layout per spec (layout A): header → `UsMap` → `Stats` → two-column grid (`lg:grid-cols-2`, stacked below `lg`) with a placeholder slot for the form (Task 8) and the newest notes → `NoteWall`. Wrap the body in `PingProvider`. Background `#06110b` with a scanline repeating gradient, same `<main>` padding pattern as `app/about/page.tsx`. When offline, show the `Comms offline` notice under the header. When there are no notes, `NoteWall` shows the empty-wall copy.
- [ ] **Step 2: `NoteWall`** — each note: **name · school** (school from `getCollege`; `outside the US` for `outside_us`; nothing for `not_listed`), reason chip (`REASON_LABELS`), one-liner if present, relative time (`Intl.RelativeTimeFormat`). `Stats` — total, schools, `formatReasonShares` line.
- [ ] **Step 3: Navbar + CSS** as listed under Files.
- [ ] **Step 4: Verify.** `npm run lint` and `npx tsc --noEmit` — no new errors. With `DATABASE_URL` unset, run `npm run dev` and open `/guestbook`: page renders with the map, "Comms offline", and the empty-wall copy; the navbar shows Guestbook with the green pill. Check phone width (375 px): no horizontal scroll.
- [ ] **Step 5: Commit** — `feat(guestbook): page, stats, wall and radar nav theme`.

---

### Task 8: The form and college picker

**Files:**
- Create: `components/guestbook/NoteForm.tsx`, `components/guestbook/CollegePicker.tsx`
- Modify: `app/guestbook/page.tsx` (replace the form placeholder with `<NoteForm renderedAt={Date.now()} />`)

**Interfaces:**
- Consumes: `submitNote`, `searchCollegesAction`, `SubmitState` (T4); `REASONS`, `REASON_LABELS` (T1); `usePing` (T6); `CollegeOption` (T2).
- Produces: `NoteForm({ renderedAt }: { renderedAt: number })`; `CollegePicker({ value, onChange, error }: { value: CollegeOption | null; onChange(o: CollegeOption | null): void; error?: string })`.

- [ ] **Step 1: `CollegePicker`** — an ARIA combobox (`role="combobox"`, `aria-expanded`, `aria-controls`, listbox options, arrow keys + Enter + Escape). Calls `searchCollegesAction` 150 ms after typing stops; ignores responses older than the latest query. Shows `label` with `sub` beneath. Selected value goes into a hidden `<input name="college">`.
- [ ] **Step 2: `NoteForm`** — `useActionState(submitNote, { status: "idle" })`. **Controlled** inputs so text survives an error. Fields and labels per the spec's form table; reason is a radio group styled as chips; hidden `website` input (visually hidden, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`) and hidden `renderedAt`. Live character counters on the one-liner and feedback. Button `Transmit` / `Transmitting…`, disabled while pending. On `success`: clear the fields, show the success copy, call `ping(state.collegeId)`. On `error`: show the message next to `field` (or above the button when there is no field).
- [ ] **Step 3: Verify (needs P2, P3).** `npm run dev` against the `dev` Neon branch. Sign the wall with a real college → the note appears at the top, its dot pings, the stats change. Then confirm each error in turn: `sh1t` in the name, `www.spam.io` in the one-liner, a 4th note within an hour, and that typed text survives an error. Submitting within 3 s of load shows success and saves nothing (check the wall).
- [ ] **Step 4: Commit** — `feat(guestbook): note form and college picker`.

---

### Task 9: Admin page

**Files:**
- Create: `app/guestbook/admin/page.tsx`, `app/guestbook/admin/actions.ts`, `components/guestbook/admin/LoginForm.tsx`, `components/guestbook/admin/DeleteButton.tsx`

**Interfaces:**
- Consumes: `ADMIN_COOKIE`, `SESSION_MS`, `checkPassword`, `createSessionToken`, `verifySessionToken` (T5); `listAllNotes`, `deleteNote` (T3); `getCollege` (T2).
- Produces (`actions.ts`, `"use server"`):
  ```ts
  login(prev: { error?: string }, form: FormData): Promise<{ error?: string }>
  logout(): Promise<void>
  deleteNoteAction(form: FormData): Promise<void>          // reads "id"
  ```

- [ ] **Step 1: Actions.** Every action first reads both secrets; if either is missing, `login` returns `{ error: "Admin login is disabled: set GUESTBOOK_ADMIN_PASSWORD and GUESTBOOK_SECRET." }` and the others do nothing. `login`: on a wrong password wait 1000 ms, return `{ error: "Wrong password." }`; on success set the cookie (`httpOnly`, `secure` in production, `sameSite: "strict"`, `path: "/guestbook/admin"`, `maxAge` from `SESSION_MS`) and `redirect("/guestbook/admin")`. `logout`: delete the cookie, redirect. `deleteNoteAction`: verify the cookie (else return), parse `id` as a positive integer (else return), `deleteNote`, `revalidatePath("/guestbook")` and `revalidatePath("/guestbook/admin")`.
- [ ] **Step 2: Page.** `metadata.robots = { index: false, follow: false }`. Await `cookies()` and `searchParams`. Missing secrets → the disabled message. Invalid session → `LoginForm` (password field, `useActionState(login)`). Valid → header with a link toggling `?feedback=1` ("only notes with feedback" / "all notes"), a log-out form, and the list from `listAllNotes(feedback === "1")`: time (absolute, local), name, school, reason, one-liner, feedback (highlighted), and a `DeleteButton`. Same radar palette.
- [ ] **Step 3: `DeleteButton`** (client) — first click changes the label to `Really delete?` for 4 s; a second click within that window submits a form to `deleteNoteAction` with a hidden `id`.
- [ ] **Step 4: Verify (needs P2, P3).** Log in with a wrong then the right password; see the feedback from Task 8's test notes; toggle the feedback filter; delete a note and confirm it is gone from `/guestbook` and its dot/count update; log out and confirm the list is gone. Tamper with the cookie value in devtools → back to the login form.
- [ ] **Step 5: Commit** — `feat(guestbook): password-gated admin page`.

---

### Task 10: Final checks

- [ ] **Step 1:** `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` — all clean (ignore the pre-existing stale `.next/types` error for `app/cockpit`, which `npm run build` regenerates).
- [ ] **Step 2:** In the browser at 375 px and desktop width, with reduced motion on and off: no horizontal scroll, sweep/ping off under reduced motion, the map popup works by tap and by keyboard focus.
- [ ] **Step 3:** Confirm no response or page source for `/guestbook` contains any note's feedback text (view source after leaving a note with feedback `PRIVATE-CANARY`; search for it).
- [ ] **Step 4: Commit** any fixes — `fix(guestbook): final review fixes`.
