// ─────────────────────────────────────────────────────────────────────────────
// PERSONALIZED — friend-exclusive content
// `id` matches a key in the PEOPLE registry (app/travel/page.tsx).
// `answers` are matched case-insensitively and trimmed.
//
// Every friend gets the same two-panel layout:
//   LEFT  — the dossier below. Authored by me. Four photos + database fields.
//   RIGHT — a whiteboard the logged-in friend draws on. Nothing to author.
// ─────────────────────────────────────────────────────────────────────────────

/** One frame in the 2x2 collage. A missing `src` renders as NO IMAGE ON FILE. */
export interface DossierPhoto {
  /** Path under /public, e.g. "/people/maxsong/01.jpg". */
  src: string;
  /** Stamped along the bottom of the frame. Keep it short — it gets clipped. */
  label: string;
}

/** One row in the database readout. Order in the array is the order on screen. */
export interface DossierField {
  label: string;
  value: string;
  /** Renders as a redaction bar until hovered. */
  redacted?: boolean;
}

export interface FriendDossier {
  /** Printed on the drawer plate and the file's spine. */
  fileNo: string;
  /** The tab label on the pulled folder. */
  codename: string;
  /** Exactly four — the collage is a fixed 2x2 grid. */
  photos: [DossierPhoto, DossierPhoto, DossierPhoto, DossierPhoto];
  /** NAME / ALIAS / LAST SEEN — extend freely, the panel just maps over it. */
  identity: DossierField[];
  /** HEIGHT / DISTINGUISHING FEATURES / SUSPECTED LOCATION. */
  physical: DossierField[];
}

export interface PersonalizedFriend {
  id: string;
  name: string;
  question: string;
  answers: string[];
  title: string;
  letter: string;
  memories: string[];
  dossier: FriendDossier;
}

export const PERSONALIZED_FRIENDS: PersonalizedFriend[] = [
  {
    id: "maxsong",
    name: "Max Song",
    question: "What is the golden rule of the workshop?",
    answers: ["always measure twice", "measure twice"],
    title: "MAX_SONG // CLEARANCE_GRANTED",
    letter:
      "Max — if you're reading this, you actually remembered the golden rule, which honestly puts you ahead of half the people who've touched my tools. This page is dumb and exists because I wanted a corner of this site that only people I actually know could get into. You're the test case, which means you get to tell me if it's broken before anyone else does. No pressure.",
    memories: [
      "The workshop rule you apparently still remember.",
      "Every project that almost worked on the first try.",
      "Placeholder memory #3 — replace me with something real.",
    ],
    // TODO(jacob): swap the placeholders below for real details + real photos.
    // Drop four images at /public/people/maxsong/01..04 and update `src`.
    dossier: {
      fileNo: "MX-0417",
      codename: "SUBJECT: SONGBIRD",
      photos: [
        { src: "/people/maxsong/01.jpg", label: "IMG_001 // ARCHIVE" },
        { src: "/people/maxsong/02.jpg", label: "IMG_002 // ARCHIVE" },
        { src: "/people/maxsong/03.jpg", label: "IMG_003 // ARCHIVE" },
        { src: "/people/maxsong/04.jpg", label: "IMG_004 // ARCHIVE" },
      ],
      identity: [
        { label: "NAME", value: "Max Song" },
        { label: "ALIAS", value: "Maxamillion / \"measure twice\" guy" },
        { label: "LAST SEEN", value: "Workshop, hunched over a caliper" },
      ],
      physical: [
        { label: "HEIGHT", value: "5'11\" (self-reported, unverified)" },
        {
          label: "DISTINGUISHING FEATURES",
          value: "Permanent squint of a man double-checking a dimension",
        },
        {
          label: "SUSPECTED LOCATION",
          value: "Within 40ft of a bandsaw at all times",
        },
      ],
    },
  },
];

export function findFriendByName(input: string): PersonalizedFriend | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  return (
    PERSONALIZED_FRIENDS.find((f) => f.name.toLowerCase() === normalized) ??
    null
  );
}

export function checkAnswer(friend: PersonalizedFriend, input: string): boolean {
  const normalized = input.trim().toLowerCase();
  return friend.answers.some((a) => a.toLowerCase() === normalized);
}
