// ─────────────────────────────────────────────────────────────────────────────
// PERSONALIZED — friend-exclusive content
// `id` matches a key in the PEOPLE registry (app/travel/page.tsx).
// `answers` are matched case-insensitively and trimmed.
// ─────────────────────────────────────────────────────────────────────────────

export interface PersonalizedFriend {
  id: string;
  name: string;
  question: string;
  answers: string[];
  title: string;
  letter: string;
  memories: string[];
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
