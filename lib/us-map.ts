import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import usAtlas from "us-atlas/states-albers-10m.json";

import { getCollege } from "./colleges";
import type { MapEntry } from "./guestbook-types";

/* ───────────────────────────────────────────────────────────────────────────
   The guestbook's US map, drawn on the server. us-atlas ships the states
   already projected (Albers USA, 975×610, Alaska and Hawaii as insets), so the
   outlines need no projection; geoAlbersUsa with the same scale and translate
   puts college coordinates in the same space.
   ─────────────────────────────────────────────────────────────────────────── */

export const MAP_WIDTH = 975;
export const MAP_HEIGHT = 610;

const us = usAtlas as unknown as Topology<{ states: GeometryCollection; nation: GeometryCollection }>;
const draw = geoPath();

export const nationPath: string = draw(feature(us, us.objects.nation)) ?? "";
export const statesPath: string = draw(mesh(us, us.objects.states, (a, b) => a !== b)) ?? "";

const projection = geoAlbersUsa().scale(1300).translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

export function projectPoint(lat: number, lng: number): { x: number; y: number } | null {
  const p = projection([lng, lat]);
  return p ? { x: p[0], y: p[1] } : null;
}

export function dotRadius(count: number): number {
  return Math.min(3 + 2.5 * Math.sqrt(count), 14);
}

export interface MapDot {
  collegeId: string;
  x: number;
  y: number;
  r: number;
  label: string;
  names: string[];
}

export function toMapDots(entries: MapEntry[]): MapDot[] {
  const dots: MapDot[] = [];
  for (const { collegeId, names } of entries) {
    const college = getCollege(collegeId);
    const p = college && projectPoint(college.lat, college.lng);
    if (!college || !p) continue;
    dots.push({ collegeId, x: p.x, y: p.y, r: dotRadius(names.length), label: college.name, names });
  }
  // Big dots underneath, so small ones stay clickable.
  return dots.sort((a, b) => b.r - a.r);
}
