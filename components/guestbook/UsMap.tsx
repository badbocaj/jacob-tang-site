import { MAP_HEIGHT, MAP_WIDTH, nationPath, statesPath, type MapDot } from "@/lib/us-map";
import MapDots from "./MapDots";

/* Server-drawn US outline with radar rings and a slow sweep; dots are a client layer on top. */
export default function UsMap({ dots }: { dots: MapDot[] }) {
  const cx = MAP_WIDTH / 2;
  const cy = MAP_HEIGHT / 2;

  return (
    <div className="relative overflow-hidden border border-[#7dffa0]/30 bg-[#06110b]/80">
      {/* Radar sweep: a rotating wedge, off under reduced motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:block motion-safe:animate-[radar-sweep_8s_linear_infinite]"
        style={{ background: "conic-gradient(from 0deg, rgba(125,255,160,.16), rgba(125,255,160,0) 55deg, transparent 360deg)" }}
      />

      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="relative block h-auto w-full"
        role="img"
        aria-label="Map of where visitors went to college"
      >
        <g fill="none" stroke="rgba(125,255,160,.18)" strokeWidth={1}>
          {[120, 240, 360].map((r) => (
            <circle key={r} cx={cx} cy={cy} r={r} />
          ))}
          <line x1={cx} y1={0} x2={cx} y2={MAP_HEIGHT} />
          <line x1={0} y1={cy} x2={MAP_WIDTH} y2={cy} />
        </g>
        <path d={statesPath} fill="none" stroke="rgba(125,255,160,.22)" strokeWidth={0.75} />
        <path
          d={nationPath}
          fill="rgba(125,255,160,.05)"
          stroke="#c8ffd9"
          strokeOpacity={0.75}
          strokeWidth={1.25}
          style={{ filter: "drop-shadow(0 0 3px rgba(125,255,160,.55))" }}
        />
      </svg>

      <MapDots dots={dots} />
    </div>
  );
}
