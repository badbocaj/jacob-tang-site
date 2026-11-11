import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { LAB_PROJECTS } from "./registry";
import { Text } from "./Text";
import type { CaseFigure, CaseSide, CaseStudyData, SectionKey } from "./types";

/* ───────────────────────────────────────────────────────────────────────────
   One layout for every project page. Each section is the same shape: a small
   numbered label, one bold sentence that is the takeaway, and one compact
   piece of evidence under it. Read only the bold sentences and you still get
   the whole story.

   Colours come from the Lab: hardware pages are daylight paper, software
   pages are the night sky. Each project adds its own `signature` piece
   (an interactive figure) in the Analysis section.
   ─────────────────────────────────────────────────────────────────────────── */

const THEME: Record<CaseSide, Record<string, string>> = {
  hardware: {
    "--bg": "#f4f1ea",
    "--ink": "#18181b",
    "--muted": "#57534e",
    "--faint": "rgba(24,24,27,0.12)",
    "--card": "#fbfaf6",
    "--accent": "#b45309",
  },
  software: {
    "--bg": "#060914",
    "--ink": "#e5e7eb",
    "--muted": "#94a3b8",
    "--faint": "rgba(148,163,184,0.16)",
    "--card": "rgba(15,23,42,0.55)",
    "--accent": "#a5b4fc",
  },
};

const DEFAULT_LABELS: Record<SectionKey, string> = {
  requirements: "Requirements",
  design: "Design",
  analysis: "Analysis",
  testing: "Testing",
  results: "Results",
  lessons: "Lessons learned",
};

const ORDER: SectionKey[] = ["requirements", "design", "analysis", "testing", "results", "lessons"];

const LABEL = "font-mono text-xs uppercase tracking-label text-[var(--muted)]";
const pad = (n: number) => String(n).padStart(2, "0");

export function CaseStudy({ data, signature }: { data: CaseStudyData; signature?: ReactNode }) {
  const index = LAB_PROJECTS.findIndex((p) => p.key === data.key);
  const side = LAB_PROJECTS[index]?.side ?? "hardware";
  const prev = LAB_PROJECTS[(index - 1 + LAB_PROJECTS.length) % LAB_PROJECTS.length];
  const next = LAB_PROJECTS[(index + 1) % LAB_PROJECTS.length];
  const labels = { ...DEFAULT_LABELS, ...data.labels };
  const n = (key: SectionKey) => pad(ORDER.indexOf(key) + 1);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]" style={THEME[side] as CSSProperties}>
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 sm:px-8 md:pt-32">
        {/* top bar */}
        <div className={`flex flex-wrap items-center justify-between gap-3 ${LABEL}`}>
          <Link href="/projects" className="py-2 text-[var(--muted)] no-underline hover:text-[var(--ink)]">
            ← The Lab
          </Link>
          <span>
            {side === "hardware" ? "Hardware" : "Software"} · Project {pad(index + 1)} of {pad(LAB_PROJECTS.length)}
          </span>
        </div>

        {/* hero */}
        <header className="flex flex-col gap-5 pb-10 pt-12">
          <p className={`m-0 ${LABEL}`}>
            <span className="text-[var(--accent)]">{pad(index + 1)}</span> · {data.eyebrow}
          </p>
          <h1 className="wide m-0 text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">{data.title}</h1>
          <p className="m-0 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
            <Text>{data.summary}</Text>
          </p>
        </header>

        {/* fact strip */}
        <dl className="m-0 grid grid-cols-2 border-y border-b-[var(--faint)] border-t-[var(--ink)] sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          {data.facts.map((f) => (
            <div key={f.label} className="flex flex-col gap-2 py-4 pr-5">
              <dt className={LABEL}>{f.label}</dt>
              <dd className="m-0 text-base font-semibold">
                <Text>{f.value}</Text>
              </dd>
            </div>
          ))}
        </dl>

        <Figure figure={data.hero} className="mt-10" priority />

        {/* contents */}
        <nav aria-label="Sections" className="mt-14 flex flex-wrap gap-x-7">
          {ORDER.map((key) => (
            <a key={key} href={`#${key}`} className={`py-3 no-underline hover:text-[var(--ink)] ${LABEL}`}>
              <span className="text-[var(--accent)]">{n(key)}</span> {labels[key]}
            </a>
          ))}
        </nav>

        <Section id="requirements" n={n("requirements")} label={labels.requirements} headline={data.requirements.headline}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-sm sm:text-base">
              <thead>
                <tr className="text-left">
                  <th className={`pb-3 pr-4 font-normal ${LABEL}`}>Requirement</th>
                  <th className={`pb-3 pr-4 font-normal ${LABEL}`}>Target</th>
                  <th className={`pb-3 font-normal ${LABEL}`}>Why</th>
                </tr>
              </thead>
              <tbody>
                {data.requirements.rows.map((r) => (
                  <tr key={r.need} className="border-t border-[var(--faint)] last:border-b">
                    <td className="py-3.5 pr-4 align-top font-semibold">{r.need}</td>
                    <td className="py-3.5 pr-4 align-top font-mono text-sm">
                      <Text>{r.target}</Text>
                    </td>
                    <td className="py-3.5 align-top text-[var(--muted)]">
                      <Text>{r.why}</Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="design" n={n("design")} label={labels.design} headline={data.design.headline}>
          {data.design.figure && <Figure figure={data.design.figure} />}
          <div className="grid gap-6 sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
            {data.design.choices.map((c) => (
              <div
                key={c.part}
                className={`flex flex-col gap-2 border-t-2 pt-3.5 ${c.key ? "border-[var(--accent)]" : "border-[var(--ink)]"}`}
              >
                <h3
                  className={`m-0 font-mono text-xs font-normal uppercase tracking-label ${
                    c.key ? "text-[var(--accent)]" : "text-[var(--muted)]"
                  }`}
                >
                  {c.part}
                </h3>
                <p className="m-0 text-base font-semibold">
                  <Text>{c.pick}</Text>
                </p>
                <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">
                  <Text>{c.why}</Text>
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="analysis" n={n("analysis")} label={labels.analysis} headline={data.analysis.headline}>
          {signature}
          <Facts facts={data.analysis.notes} />
        </Section>

        <Section id="testing" n={n("testing")} label={labels.testing} headline={data.testing.headline}>
          <ol className="m-0 list-none border-t border-[var(--ink)] p-0">
            {data.testing.tests.map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 border-b border-[var(--faint)] py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto]"
              >
                <span className="font-mono text-xs text-[var(--accent)]">{t.id}</span>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-sm text-[var(--muted)]">
                    <Text>{t.detail}</Text>
                  </span>
                </div>
                <span className="col-start-2 font-mono text-xs uppercase tracking-wider sm:col-start-auto">
                  <Text>{t.result}</Text>
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="results" n={n("results")} label={labels.results}>
          <div className="grid gap-8 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
            {data.results.map((s) => (
              <div key={s.label} className="flex flex-col gap-2.5">
                <p className="wide m-0 font-display text-4xl font-bold leading-none sm:text-6xl">
                  <Text>{s.value}</Text>
                </p>
                <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">
                  <Text>{s.label}</Text>
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="lessons" n={n("lessons")} label={labels.lessons}>
          <div className="grid gap-8 sm:grid-cols-2">
            <Lesson title={data.lessons.brokeTitle ?? "What broke"} body={data.lessons.broke} />
            <Lesson
              title={data.lessons.differentlyTitle ?? "What I'd do differently"}
              body={data.lessons.differently}
            />
          </div>
        </Section>

        {/* prev / next */}
        <nav aria-label="More projects" className="mt-24 flex flex-wrap justify-between gap-4 border-t border-[var(--ink)] pt-7">
          <NeighbourLink project={prev} index={LAB_PROJECTS.indexOf(prev)} direction="prev" />
          <NeighbourLink project={next} index={LAB_PROJECTS.indexOf(next)} direction="next" />
        </nav>
      </div>
    </main>
  );
}

function Section({
  id,
  n,
  label,
  headline,
  children,
}: {
  id: SectionKey;
  n: string;
  label: string;
  headline?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-16 flex scroll-mt-28 flex-wrap gap-x-12 gap-y-6 border-t border-[var(--faint)] pt-10">
      <h2 className="m-0 flex-[1_1_12rem] font-mono text-xs font-normal uppercase leading-relaxed tracking-label text-[var(--muted)]">
        <span className="text-[var(--accent)]">{n}</span>
        <br />
        {label}
      </h2>
      <div className="flex min-w-0 flex-[999_1_35rem] flex-col gap-6">
        {headline && (
          <p className="m-0 font-display text-2xl font-bold leading-snug">
            <Text>{headline}</Text>
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

function Figure({ figure, className = "", priority }: { figure: CaseFigure; className?: string; priority?: boolean }) {
  return (
    <figure className={`m-0 flex flex-col gap-3 ${className}`}>
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-[var(--card)]">
        <Image
          src={figure.src}
          alt={figure.alt}
          fill
          priority={priority}
          sizes="(min-width: 1152px) 1088px, 100vw"
          className={figure.look === "blend" ? "object-contain p-4 mix-blend-multiply" : "object-cover"}
          style={{ objectPosition: figure.position ?? "50% 50%" }}
        />
      </div>
      <figcaption className={`${LABEL} leading-relaxed tracking-wider`}>
        <Text>{figure.caption}</Text>
      </figcaption>
    </figure>
  );
}

function Facts({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className="m-0 grid gap-5 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
      {facts.map((f) => (
        <div key={f.label} className="flex flex-col gap-1.5">
          <dt className={LABEL}>{f.label}</dt>
          <dd className="m-0 text-sm leading-relaxed">
            <Text>{f.value}</Text>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Lesson({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="m-0 text-xl font-bold">{title}</h3>
      <p className="m-0 text-base leading-relaxed text-[var(--muted)]">
        <Text>{body}</Text>
      </p>
    </div>
  );
}

function NeighbourLink({
  project,
  index,
  direction,
}: {
  project: (typeof LAB_PROJECTS)[number];
  index: number;
  direction: "prev" | "next";
}) {
  const next = direction === "next";
  return (
    <Link
      href={project.href ?? "/projects"}
      className={`group flex flex-col gap-1.5 py-2 text-[var(--ink)] no-underline ${next ? "items-end text-right" : ""}`}
    >
      <span className={LABEL}>{next ? `${pad(index + 1)} →` : `← ${pad(index + 1)}`}</span>
      <span className="font-display text-xl font-bold uppercase transition-colors group-hover:text-[var(--accent)]">
        {project.title}
      </span>
    </Link>
  );
}
