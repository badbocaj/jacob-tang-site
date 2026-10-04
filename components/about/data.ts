/* ───────────────────────────────────────────────────────────────────────────
   THE JOURNAL — everything you'd want to edit on /about lives in this file.

   The book itself (flip mechanics, paper, doodles) is in Journal.tsx,
   Paper.tsx and Doodles.tsx. You should not need to touch those to change
   what the pages say.

   PORTFOLIO PDF: drop it at  public/about/portfolio.pdf  and the folder on
   the first page lights up on its own. Until then it says it's empty.
   ─────────────────────────────────────────────────────────────────────────── */

export const PORTFOLIO = {
  /** Public URL — matches public/about/portfolio.pdf on disk. */
  href: "/about/portfolio.pdf",
  /** Path relative to the project root, checked at render time. */
  diskPath: "public/about/portfolio.pdf",
  /** Name it saves as when someone hits download. */
  downloadAs: "Jacob-Tang-Portfolio.pdf",
};

// ─── Spread 1: work ─────────────────────────────────────────────────────────

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

// ─── Spread 2: outdoors ─────────────────────────────────────────────────────

export interface Sport {
  name: string;
  note: string;
}

export const SPORTS = {
  pickleball: { name: "Pickleball", note: "Dink responsibly." },
  golf: { name: "Golf", note: "The ball goes where it wants. I go find it." },
  hiking: { name: "Hiking", note: "Will walk uphill for a good view." },
} satisfies Record<string, Sport>;

export interface Photo {
  src: string;
  caption: string;
  alt: string;
}

/** Taped onto the hiking page. Borrowed from the travel log. */
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

// ─── Spread 3: games ────────────────────────────────────────────────────────
// Leave a value as "" and the page writes "???" with a "(ask me)" scribble.

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
    elo: "",
    /** e.g. "chess.com rapid" */
    site: "",
    note: "Will resign with dignity. Eventually.",
  },
  catan: {
    name: "Catan",
    note: "I have wood. I will not be trading it.",
  },
};

// ─── Spread 4: a short history of jacob ─────────────────────────────────────

export interface TimelineStop {
  when: string;
  what: string;
  where?: string;
  /** Hasn't happened yet — drawn dashed. */
  future?: boolean;
}

/** Oldest first. Add stops anywhere — the line stretches to fit. */
export const TIMELINE: TimelineStop[] = [
  { when: "May 2024", what: "Structures Researcher", where: "AIM Lab @ UH" },
  { when: "Aug 2024", what: "Researcher", where: "CURVE @ USC" },
  { when: "May 2025", what: "Quality Engineering Intern", where: "L3Harris" },
  { when: "Jan 2026", what: "Mechanical Engineering Intern", where: "Vital Lyfe" },
  { when: "Now", what: "Building rocket test stands", where: "USC" },
  { when: "Next", what: "Build Engineer", where: "SpaceX", future: true },
];

/** Pictures of me. The first one gets the biggest polaroid. */
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
