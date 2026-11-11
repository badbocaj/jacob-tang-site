import { Fragment } from "react";

/** Renders text, drawing any [placeholder] in the accent colour with a dashed underline. */
export function Text({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]+\])/);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <span key={i} className="border-b border-dashed border-[var(--accent)] text-[var(--accent)]">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
