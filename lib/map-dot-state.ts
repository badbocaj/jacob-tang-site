/* Which map dot's popup is open, as a pure function of pointer/focus events. */

export type DotEvent = "enter" | "leave" | "focus" | "blur" | "click";

export function nextActiveDot(active: string | null, dot: string, event: DotEvent): string | null {
  switch (event) {
    // A tap fires enter → focus → click, so click must open, never toggle shut.
    case "enter":
    case "focus":
    case "click":
      return dot;
    // Mouse away, or a tap elsewhere (which blurs the dot), closes it.
    case "leave":
    case "blur":
      return active === dot ? null : active;
  }
}
