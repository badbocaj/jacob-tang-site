"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FolderOpen, ImageOff, Lock } from "lucide-react";
import type {
  DossierField,
  DossierPhoto,
  PersonalizedFriend,
} from "@/data/personalized";
import { DecryptText, HazardStripe, PanelLabel, Scanlines } from "./chrome";

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL — the archive. A drawer sits open along the bottom of the panel
// with one record pulled out of it and held above: four photos and the
// database readout. Authored by me, read-only for whoever logged in.
// ─────────────────────────────────────────────────────────────────────────────

/** Corner brackets — the viewfinder framing used on every photo. */
function Brackets() {
  const corner =
    "pointer-events-none absolute h-2.5 w-2.5 border-green-400/70";
  return (
    <>
      <span className={`${corner} left-1 top-1 border-l border-t`} />
      <span className={`${corner} right-1 top-1 border-r border-t`} />
      <span className={`${corner} bottom-1 left-1 border-b border-l`} />
      <span className={`${corner} bottom-1 right-1 border-b border-r`} />
    </>
  );
}

function PhotoFrame({ photo, index }: { photo: DossierPhoto; index: number }) {
  const [failed, setFailed] = useState(!photo.src);

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 22,
        delay: 0.3 + index * 0.07,
      }}
      className="group relative aspect-[4/3] overflow-hidden border border-green-500/25 bg-black"
    >
      {failed ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-green-500/40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(34,197,94,0.06) 0 6px, transparent 6px 12px)",
          }}
        >
          <ImageOff size={16} />
          <span className="font-mono text-xs tracking-label uppercase">
            no image
          </span>
        </div>
      ) : (
        <Image
          src={photo.src}
          alt={photo.label}
          fill
          sizes="(max-width: 1024px) 45vw, 22vw"
          onError={() => setFailed(true)}
          className="object-cover grayscale contrast-125 transition duration-500 group-hover:grayscale-0 group-hover:scale-[1.03]"
        />
      )}

      {/* Green phosphor wash that lifts when you look closer. */}
      <div className="pointer-events-none absolute inset-0 bg-green-500/10 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-0" />
      <Brackets />

      <figcaption className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1.5 py-0.5 font-mono text-xs text-green-400/70 tracking-label uppercase">
        {photo.label}
      </figcaption>
    </motion.figure>
  );
}

function DataRow({ field, delay }: { field: DossierField; delay: number }) {
  const [unredacted, setUnredacted] = useState(false);
  const hidden = field.redacted && !unredacted;

  return (
    <div className="grid gap-x-3 gap-y-0.5 border-b border-dashed border-green-500/15 py-2 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <span className="pt-0.5 font-mono text-xs uppercase tracking-label text-green-500/50">
        {field.label}
      </span>
      {hidden ? (
        <button
          onClick={() => setUnredacted(true)}
          className="flex items-center gap-2 self-start bg-green-500/15 px-2 py-0.5 font-mono text-xs uppercase tracking-label text-green-500/60 transition-colors duration-150 hover:bg-green-500/25 hover:text-green-300"
        >
          <Lock size={11} />
          redacted — click to decrypt
        </button>
      ) : (
        <DecryptText
          text={field.value}
          delay={delay}
          className="break-words font-mono text-sm text-green-100/85"
        />
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-mono text-xs uppercase tracking-label text-green-400">
          {title}
        </h3>
        <span className="h-px flex-1 bg-green-500/20" />
      </div>
      {children}
    </section>
  );
}

/** The open drawer pinned along the bottom of the panel. */
function CabinetDrawer({ fileNo }: { fileNo: string }) {
  // Fixed widths — deterministic so server and client render the same tabs.
  const tabs = [26, 38, 20, 0, 34, 22, 30, 18, 36, 24];

  return (
    <div className="relative shrink-0 px-4 pb-4 sm:px-6 sm:pb-6">
      {/* Drawer interior: the row of filed records, with a lit gap where
          this one was pulled from. */}
      <div className="relative flex h-12 items-end gap-1.5 overflow-hidden border-x border-t border-green-500/20 bg-black/80 px-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black to-transparent" />
        {tabs.map((w, i) =>
          w === 0 ? (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 1, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="h-9 w-7 shrink-0 border-x border-t border-green-400/60 bg-green-400/10 shadow-[0_0_18px_rgba(34,197,94,0.45)]"
            />
          ) : (
            <div
              key={i}
              style={{ width: w, height: 20 + (i % 3) * 6 }}
              className="shrink-0 border-x border-t border-green-500/15 bg-zinc-900"
            />
          )
        )}
      </div>

      {/* Drawer face */}
      <div className="relative flex h-14 items-center justify-between border border-green-500/25 bg-gradient-to-b from-zinc-800 to-zinc-950 px-4">
        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase tracking-label text-green-500/45">
            archive drawer 04-B
          </span>
          <span className="font-mono text-xs text-zinc-500">
            RECORD PULLED :: {fileNo}
          </span>
        </div>

        {/* Handle */}
        <div className="h-4 w-24 rounded-sm border border-zinc-600 bg-gradient-to-b from-zinc-500 to-zinc-700 shadow-inner sm:w-32" />

        {/* Rivets */}
        <div className="flex flex-col gap-3">
          <span className="block h-1.5 w-1.5 rounded-full bg-zinc-600" />
          <span className="block h-1.5 w-1.5 rounded-full bg-zinc-600" />
        </div>
      </div>
    </div>
  );
}

export default function DossierPanel({
  friend,
}: {
  friend: PersonalizedFriend;
}) {
  const { dossier } = friend;
  const rows = [...dossier.identity, ...dossier.physical];
  // Each row's decrypt starts after the one above it has finished resolving.
  const delayFor = (index: number) =>
    450 + rows.slice(0, index).reduce((sum, f) => sum + f.value.length * 4, 0);

  return (
    <div className="relative flex flex-col overflow-hidden border border-green-500/30 bg-zinc-950 shadow-[0_0_60px_rgba(34,197,94,0.08)] lg:h-[74vh]">
      <HazardStripe position="top" />
      <Scanlines />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
          <PanelLabel icon={<FolderOpen size={14} className="text-green-400" />}>
            personnel archive
          </PanelLabel>
          <span className="font-mono text-xs uppercase tracking-label text-green-500/35">
            read only
          </span>
        </div>

        <div className="min-h-0 flex-1 px-4 pt-4 sm:px-6 lg:overflow-y-auto">
          {/* The pulled record */}
          <motion.article
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="relative"
          >
            {/* Folder tab */}
            <div className="flex">
              <div className="border-x border-t border-green-500/35 bg-green-500/10 px-3 py-1">
                <span className="font-mono text-xs uppercase tracking-label text-green-300">
                  {dossier.codename}
                </span>
              </div>
              <div className="flex-1 border-b border-green-500/35" />
            </div>

            {/* Folder body */}
            <div className="relative border border-green-500/35 bg-black/50 p-4 sm:p-5">
              {/* Punched spine */}
              <div className="absolute left-1.5 top-8 hidden flex-col gap-6 sm:flex">
                <span className="block h-2 w-2 rounded-full border border-green-500/25 bg-black" />
                <span className="block h-2 w-2 rounded-full border border-green-500/25 bg-black" />
                <span className="block h-2 w-2 rounded-full border border-green-500/25 bg-black" />
              </div>

              <div className="sm:pl-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-label text-green-500/40">
                      file no.
                    </p>
                    <p className="font-mono text-sm text-green-300">
                      {dossier.fileNo}
                    </p>
                  </div>
                  <span className="-rotate-6 border-2 border-red-500/40 px-2 py-0.5 font-mono text-xs uppercase tracking-label text-red-500/60">
                    eyes only
                  </span>
                </div>

                {/* Collage */}
                <div className="grid grid-cols-2 gap-2">
                  {dossier.photos.map((photo, i) => (
                    <PhotoFrame key={i} photo={photo} index={i} />
                  ))}
                </div>

                <Section title="identity">
                  {dossier.identity.map((field, i) => (
                    <DataRow
                      key={field.label}
                      field={field}
                      delay={delayFor(i)}
                    />
                  ))}
                </Section>

                <Section title="physical identifiers">
                  {dossier.physical.map((field, i) => (
                    <DataRow
                      key={field.label}
                      field={field}
                      delay={delayFor(dossier.identity.length + i)}
                    />
                  ))}
                </Section>

                <Section title="briefing note // author: j.tang">
                  <p className="whitespace-pre-line border-l-2 border-green-500/30 pl-3 text-sm leading-relaxed text-zinc-300">
                    {friend.letter}
                  </p>
                </Section>

                <Section title="logged incidents">
                  <ul className="space-y-2">
                    {friend.memories.map((memory, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: 0.5 + i * 0.08 }}
                        className="flex items-start gap-2 font-mono text-sm text-zinc-400"
                      >
                        <span className="shrink-0 text-green-500/60">&gt;</span>
                        {memory}
                      </motion.li>
                    ))}
                  </ul>
                </Section>
              </div>
            </div>
          </motion.article>
        </div>

        <CabinetDrawer fileNo={dossier.fileNo} />
      </div>

      <HazardStripe position="bottom" />
    </div>
  );
}
