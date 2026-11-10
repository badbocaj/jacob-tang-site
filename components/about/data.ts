/* ───────────────────────────────────────────────────────────────────────────
   EXPLODED VIEW — everything you'd want to edit on /about lives in this file.

   The page is a rocket taken apart, one part per piece of Jacob:

     01 nose cone        where it's pointed        HEADING
     02 crew capsule     the pilot                 PILOT, PORTRAITS[0]
     03 avionics bay     running processes         CURRENTLY_WORKING_ON
     04 living quarters  off duty                  SPORTS, GAMES
     05 cargo bay        payload                   PORTFOLIO
     06 fuel tanks       what it runs on           FUEL
     07 engines          what makes it go          MOTTO

   The drawings are in RocketParts.tsx and the scroll mechanics in
   ExplodedView.tsx. You should not need to touch those to change the words.

   PORTFOLIO PDF: drop it at  public/about/portfolio.pdf  and the cargo bay
   buttons light up on their own.
   ─────────────────────────────────────────────────────────────────────────── */

// ─── Key specifications ─────────────────────────────────────────────────────

export const SPECS: { label: string; value: string; accent?: boolean }[] = [
  { label: "Designation", value: "JT-01" },
  { label: "Type", value: "Mechanical engineer" },
  { label: "Speciality", value: "Structures · testing · propulsion" },
  { label: "Base", value: "LAX" },
  { label: "Current post", value: "USC" },
  { label: "Status", value: "Operational", accent: true },
];

// ─── 01 nose cone · 02 crew capsule ─────────────────────────────────────────

export const HEADING = {
  title: "Where it's pointed",
  note: "Up, for now. No destination locked in yet. Still working out where the next burn should go.",
};

export const PILOT = {
  title: "The pilot",
  note: "Mechanical engineer: structures, testing, propulsion. Interned at Vital Lyfe and currently exploring mechatronics and software.",
};

// ─── 06 fuel tanks · 07 engines ─────────────────────────────────────────────

export interface FuelTank {
  tank: string;
  name: string;
  note: string;
}

export const FUEL: FuelTank[] = [
  { tank: "A", name: "McDonald's", note: "Primary propellant." },
  // TODO(spotify): make this tank live. Fetch the current top artist or
  // now-playing track from the Spotify API, the way lib/riot.ts does for the
  // League rank, and fall back to this entry when the API doesn't answer.
  { tank: "B", name: "Beabadoobee", note: "On repeat." },
  { tank: "C", name: "The Three-Body Problem", note: "Currently reading." },
];

export const MOTTO = {
  /** The last line is drawn in the accent colour. */
  lines: ["Try Building.", "Fail.", "Repeat."],
  note: "Nothing works the first time. That is what the second time is for.",
};

// TODO(heat shield): a possible eighth part — things that went wrong and what
// they taught. Parked until there is a failure story worth publishing.

export const PORTFOLIO = {
  /** Public URL — matches public/about/portfolio.pdf on disk. */
  href: "/about/portfolio.pdf",
  /** Path relative to the project root, checked at render time. */
  diskPath: "public/about/portfolio.pdf",
  /** Name it saves as when someone hits download. */
  downloadAs: "Jacob-Tang-Portfolio.pdf",
};

// ─── 03 avionics bay ────────────────────────────────────────────────────────

export interface WorkItem {
  title: string;
  /** One line, journal voice. */
  note: string;
  /** Scrawled next to the item. Keep it to a word or two. */
  status: string;
}

export const CURRENTLY_WORKING_ON: WorkItem[] = [
  {
    title: "Retrofit climate control system",
    note: "Teaching an old system some new tricks.",
    status: "in progress",
  },
  {
    title: "Cooking suggestor",
    note: "Decides what's for dinner so I don't have to.",
    status: "in progress",
  },
  {
    title: "This website",
    note: "You're standing in it. It will never be finished.",
    status: "forever",
  },
];

// ─── 04 living quarters: outside ────────────────────────────────────────────

export interface Sport {
  name: string;
  note: string;
}

export const SPORTS = {
  pickleball: { name: "Pickleball", note: "Dink responsibly." },
  golf: { name: "Golf", note: "Shoulder is currently post op. Still a 30 handicap." },
  hiking: { name: "Hiking", note: "Will walk uphill both ways for a view." },
} satisfies Record<string, Sport>;

export interface Photo {
  src: string;
  caption: string;
  alt: string;
}

/** Hiking pictures, borrowed from the travel log. Not shown on the page yet. */
export const HIKING_PHOTOS: Photo[] = [
  {
    src: "/travel/Cover/northeast-summer-cover.jpg",
    caption: "northeast '25",
    alt: "A glacial ravine seen from a granite ledge in the White Mountains",
  },
  {
    src: "/travel/Cover/banff-summer-cover.jpeg",
    caption: "banff '24",
    alt: "A snow-capped Rockies valley framed by pine trees",
  },
  {
    src: "/travel/Cover/hawaii-summer-cover.jpeg",
    caption: "hawaii '24",
    alt: "Deep green ridges of a Hawaiian valley",
  },
];

// ─── 04 living quarters: games ──────────────────────────────────────────────
// Leave a value as "" and the page writes "??? (ask me)".

export const GAMES = {
  league: {
    name: "League of Legends",
    /** e.g. "Gold II" */
    rank: "",
    note: "One more game. Then bed. (lie)",
  },
  chess: {
    name: "Chess",
    /** e.g. "1450" */
    elo: "1400",
    /** e.g. "chess.com rapid" */
    site: "",
    note: "Will resign after losing a pawn.",
  },
  catan: {
    name: "Catan",
    note: "I hate sheep.",
  },
};

// ─── Mission profile: a short history of jacob ──────────────────────────────

export interface TimelineStop {
  when: string;
  what: string;
  where?: string;
  /** Still going — a stage that is burning, not one that has separated. */
  active?: boolean;
  /** Hasn't happened yet — drawn dashed. */
  future?: boolean;
}

/** Oldest first. Each stop is a stage in the mission profile. */
export const TIMELINE: TimelineStop[] = [
  { when: "Aug 2023", what: "Researcher", where: "CURVE @ USC" },
  { when: "May 2024", what: "Structures Researcher", where: "AIM Lab @ UH" },
  { when: "May 2025", what: "Quality Engineering Intern", where: "L3Harris" },
  { when: "Jan 2026", what: "Mechanical Engineering Intern", where: "Vital Lyfe", active: false },
  { when: "Now", what: "Exploring mechatronics and software", where: "USC", active: true },
  { when: "Next", what: "Trajectory undecided", where: "Still working out where this goes", future: true },
];

/** Pictures of me. The first one sits beside the crew capsule. */
export const PORTRAITS: Photo[] = [
  {
    src: "/profile.png",
    caption: "official headshot",
    alt: "Jacob in a mirror selfie wearing aviators and an oversized leather coat",
  },
  {
    src: "/travel/pop-up/joshua-tree-popup.jpg",
    caption: "heart rock '24 — find me",
    alt: "Jacob and four friends posing in front of a heart-shaped boulder in Joshua Tree",
  },
];
