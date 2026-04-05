"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Caveat } from "next/font/google";
import { X, MapPin, Calendar } from "lucide-react";

// ─── Handwriting font for Polaroid captions ───────────────────────────────────
const hand = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

// ─────────────────────────────────────────────────────────────────────────────
// TEMPORAL LOOM — Canvas animation
// ─────────────────────────────────────────────────────────────────────────────

// Trunk(100f=1.67s) + wait(50f=0.83s) + climax(1/0.028≈36f=0.60s) = 3.1s canvas + 0.9s fade = 4.0s total
const TRUNK_FRAMES = 100;
const TRUNK_BRANCH_FRACS = [0.13, 0.27, 0.40, 0.53, 0.65, 0.77, 0.88, 0.95];
const CLIMAX_STEP = 0.028;

interface LoomBranch {
  x1: number; y1: number;
  x2: number; y2: number;
  angle: number;
  length: number;
  progress: number;
  speed: number;
  color: string;
  lineWidth: number;
  children: LoomBranch[];
  childrenSpawned: boolean;
}

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
}

function makeLoomBranch(
  x1: number, y1: number,
  angle: number, length: number, depth: number
): LoomBranch {
  return {
    x1, y1,
    x2: x1 + Math.cos(angle) * length,
    y2: y1 + Math.sin(angle) * length,
    angle, length,
    progress: 0,
    speed: 0.018 + Math.random() * 0.014,
    color: depth >= 2 ? "#10b981" : "#f59e0b",
    lineWidth: Math.max(0.4, 2.0 - depth * 0.45),
    children: [],
    childrenSpawned: false,
  };
}

function spawnChildren(
  x: number, y: number,
  parentAngle: number, parentLength: number, depth: number
): LoomBranch[] {
  if (depth >= 5) return [];
  const spread = 0.25 + Math.random() * 0.35;
  const count = Math.random() > 0.35 ? 2 : 1;
  const out: LoomBranch[] = [];
  for (let i = 0; i < count; i++) {
    const dir = i === 0 ? -1 : 1;
    const angle = parentAngle + dir * spread * (0.7 + Math.random() * 0.5);
    const len = parentLength * (0.5 + Math.random() * 0.35);
    out.push(makeLoomBranch(x, y, angle, len, depth));
  }
  return out;
}

function TemporalLoom({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const doneRef = useRef(false);
  const completeFn = useRef(onComplete);
  completeFn.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mutable animation state
    let frame = 0;
    let trunkH = 0;
    let trunkDoneFrame = -1;
    let climaxProgress = 0;
    let inClimax = false;

    const branches: LoomBranch[] = [];
    const sparks: Spark[] = [];
    const branchSpawned = new Array(TRUNK_BRANCH_FRACS.length).fill(false);
    const termLines: { text: string; opacity: number }[] = [];

    const TERM_SCHEDULE = [
      { at: 20,  text: "> WEAVING_TEMPORAL_BRANCHES..." },
      { at: 80,  text: "> LOCATING_VARIANCES..." },
      { at: 165, text: "> NEXUS_EVENT_IMMINENT." },
    ];

    function addSparks(x: number, y: number, n = 5) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 0.6 + Math.random() * 2.2;
        sparks.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1 });
      }
    }

    function drawLoomBranch(b: LoomBranch) {
      if (b.progress <= 0) return;
      const tipX = b.x1 + Math.cos(b.angle) * b.length * b.progress;
      const tipY = b.y1 + Math.sin(b.angle) * b.length * b.progress;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.lineWidth;
      ctx.shadowBlur = 5;
      ctx.shadowColor = b.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
      b.children.forEach(drawLoomBranch);
    }

    function updateBranchList(list: LoomBranch[], depth: number) {
      list.forEach((b) => {
        if (b.progress < 1) {
          b.progress = Math.min(1, b.progress + b.speed);
          if (Math.random() < 0.07) {
            const tx = b.x1 + Math.cos(b.angle) * b.length * b.progress;
            const ty = b.y1 + Math.sin(b.angle) * b.length * b.progress;
            addSparks(tx, ty, 2);
          }
        } else if (!b.childrenSpawned) {
          b.childrenSpawned = true;
          b.children = spawnChildren(b.x2, b.y2, b.angle, b.length, depth + 1);
        }
        updateBranchList(b.children, depth + 1);
      });
    }

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const maxH = h * 0.88;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      frame++;

      // Terminal lines
      TERM_SCHEDULE.forEach((item) => {
        if (frame === item.at) termLines.push({ text: item.text, opacity: 0 });
      });
      termLines.forEach((l) => { l.opacity = Math.min(1, l.opacity + 0.05); });

      if (!inClimax) {
        // Grow trunk
        if (trunkH < maxH) {
          trunkH = Math.min(maxH, trunkH + maxH / TRUNK_FRAMES);
        } else if (trunkDoneFrame < 0) {
          trunkDoneFrame = frame;
        }

        // Draw trunk
        ctx.beginPath();
        ctx.moveTo(cx, h);
        ctx.lineTo(cx, h - trunkH);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2.8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#f59e0b";
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Spawn lateral branches at fractions of trunk height
        TRUNK_BRANCH_FRACS.forEach((frac, i) => {
          if (!branchSpawned[i] && trunkH >= frac * maxH) {
            branchSpawned[i] = true;
            const by = h - frac * maxH;
            const len = 55 + Math.random() * 90;
            const leftAngle  = -Math.PI + 0.25 + Math.random() * 0.3;
            const rightAngle = -(0.25 + Math.random() * 0.3);
            branches.push(makeLoomBranch(cx, by, leftAngle, len, 0));
            branches.push(makeLoomBranch(cx, by, rightAngle, len, 0));
            addSparks(cx, by, 10);
          }
        });

        // Trigger climax 90 frames after trunk finishes
        if (trunkDoneFrame > 0 && frame >= trunkDoneFrame + 90) {
          inClimax = true;
        }

        updateBranchList(branches, 0);
        branches.forEach(drawLoomBranch);

        // Sparks
        sparks.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.05; s.life -= 0.028; });
        sparks.filter((s) => s.life > 0).forEach((s) => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249,115,22,${s.life})`;
          ctx.shadowBlur = 5;
          ctx.shadowColor = "#f97316";
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        sparks.splice(0, sparks.length, ...sparks.filter((s) => s.life > 0));

      } else {
        // CLIMAX — keep drawing tree
        ctx.beginPath();
        ctx.moveTo(cx, h);
        ctx.lineTo(cx, h - trunkH);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2.8;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#f59e0b";
        ctx.stroke();
        ctx.shadowBlur = 0;

        branches.forEach(drawLoomBranch);
        updateBranchList(branches, 0);

        // Rapid burst branches every 2 frames
        if (frame % 2 === 0) {
          const frac = TRUNK_BRANCH_FRACS[Math.floor(Math.random() * TRUNK_BRANCH_FRACS.length)];
          const by = h - frac * maxH;
          const baseAngle = Math.random() > 0.5 ? 1 : -1;
          branches.push(makeLoomBranch(cx, by, baseAngle * (0.2 + Math.random() * 0.7) - Math.PI / 2, 25 + Math.random() * 55, 2));
          addSparks(cx, by, 5);
        }

        // Sparks during climax
        sparks.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.life -= 0.025; });
        sparks.filter((s) => s.life > 0).forEach((s) => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249,115,22,${s.life})`;
          ctx.shadowBlur = 5;
          ctx.shadowColor = "#f97316";
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        sparks.splice(0, sparks.length, ...sparks.filter((s) => s.life > 0));

        // Radial white-gold fill expanding from top
        climaxProgress = Math.min(1, climaxProgress + CLIMAX_STEP);
        const grad = ctx.createRadialGradient(cx, h * 0.2, 0, cx, h * 0.2, w * 1.4 * climaxProgress);
        grad.addColorStop(0,    `rgba(255,255,255,${climaxProgress * 0.97})`);
        grad.addColorStop(0.38, `rgba(245,158,11,${climaxProgress * 0.75})`);
        grad.addColorStop(1,    `rgba(245,158,11,0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        if (climaxProgress >= 1 && !doneRef.current) {
          doneRef.current = true;
          completeFn.current();
          return; // stop the loop
        }
      }

      // Terminal text overlay
      const lineH = 17;
      const startY = h - 36 - termLines.length * lineH;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      termLines.forEach((line, i) => {
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(245,158,11,${line.opacity * 0.75})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#f59e0b";
        ctx.fillText(line.text, 32, startY + i * lineH);
        ctx.shadowBlur = 0;
      });
    };

    let lastTime = window.performance.now();
    let accumulator = 0;
    const TOTAL_SIM_FRAMES = 295.55;
    const TIME_STEP = 4000 / TOTAL_SIM_FRAMES;

    const frameTick = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;
      // Cap dt to prevent spiral of death if user tabs away
      accumulator += Math.min(dt, 100);

      let steps = 0;
      while (accumulator >= TIME_STEP && steps < 10) {
        draw();
        accumulator -= TIME_STEP;
        steps++;
      }
      
      if (!doneRef.current) {
        rafRef.current = requestAnimationFrame(frameTick);
      }
    };

    rafRef.current = requestAnimationFrame(frameTick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PEOPLE REGISTRY
// Add each person once here. Initials are auto-derived from their name.
// ─────────────────────────────────────────────────────────────────────────────

interface Person {
  name: string;
  image: string;
}

const PEOPLE: Record<string, Person> = {
  // e.g. alice: { name: "Alice Brown", image: "/people/alice.png" },
  justinyang: { name: "Justin Yang", image: "/people/justinyang.png" },
  shreyesbharat: { name: "Shreyes Keshav Bharat", image: "/people/shreyesbharat.png" },
  loganvines: { name: "Logan Vines", image: "/people/loganvines.png" },
  andrewhuang: { name: "Andrew Huang", image: "/people/andrewhuang.png" },
  saatvikkumar: { name: "Saatvik Kumar", image: "/people/saatvikkumar.png" },
  dorianhawkins: { name: "Dorian Hawkins", image: "/people/dorianhawkins.png" },
  maxsong: { name: "Max Song", image: "/people/maxsong.png" },
  jinqiuwei: { name: "Jinqiu Wei", image: "/people/jinqiuwei.png" },
  vincentalcantara: { name: "Vincent Alcantara", image: "/people/vincentalcantara.png" },
  danielhan: { name: "Daniel Han", image: "/people/danielhan.png" },
  pranavlingareddy: { name: "Pranav Lingareddy", image: "/people/pranavlingareddy.png" },
  tonyfernandes: { name: "Tony Fernandes", image: "/people/tonyfernandes.png" },
  saimhasan: { name: "Saim Hasan", image: "/people/saimhasan.png" },
  charlestang: { name: "Charles Tang", image: "/people/charlestang.png" },
  mom: { name: "Mom", image: "/people/mom.png" },
  dad: { name: "Dad", image: "/people/dad.png" },
  blakejanowitz: { name: "Blake Janowitz", image: "/people/blakejanowitz.png" },
  aidanjanowitz: { name: "Aidan Janowitz", image: "/people/aidanjanowitz.png" },
  unclepaul: { name: "Uncle Paul", image: "/people/unclepaul.png" },
  auntlin: { name: "Aunt Lin", image: "/people/auntlin.png" },
  





};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

interface TravelLog {
  id: string;
  place: string;
  country: string;
  season: "Spring" | "Summer" | "Fall" | "Winter";
  year: number;
  coverImage: string;   // shown on the timeline polaroid
  popupImage: string;   // shown inside the modal
  coords: string;
  story: string;
  tags: string[];
  placeholderGradient: string;
  people: string[];     // keys from PEOPLE registry (who you went with — exclude yourself)
}

const TRAVEL_LOGS: TravelLog[] = [
  {
    id: "sequoia-national-park",
    place: "Sequoia National Park",
    country: "USA",
    season: "Spring",
    year: 2026,
    coverImage: "/travel/Cover/sequoia-cover.jpg",
    popupImage: "/travel/pop-up/sequoia-popup.jpg",
    coords: "36.5626° N, 118.7796° W",
    story:
      "A week before, Justin told me he wanted to go to Sequoia. I said yes. The night before, I called him and asked if he had booked the motel. He said no. I drove 9 hours to hike 10 hours. The driving in the park was nerve wracking, as the descent forced the car to go 45+ mph, only for a hairpin turn to force me to brake to 10mph, sending all our water bottles flying. But the trees were worth it.",
    tags: ["national-park", "giant-trees", "hiking"],
    placeholderGradient: "from-emerald-950 to-green-900",
    people: ["justinyang"],
  },
  {
    id: "Japan-Winter-2025",
    place: "Japan",
    country: "Japan",
    season: "Winter",
    year: 2025,
    coverImage: "/travel/Cover/japan-cover.jpg",
    popupImage: "/travel/pop-up/japan-popup.jpg",
    coords: "35.6762° N, 139.6503° E",
    story:
      "This was the first time I really traveled with friends. Everything was closed for New Year's and I was PO'd. But, the country was lovely. I went from Tokyo to Hokkaido to Kyoto. Kyoto was by far my favorite city. It seemed to maintain the culture perfectly. The cozy houses integrated with the city, with random historical monuments at every corner. Too much chaos? Dart between the alleyways and find a small ramen shop. The perfect balance between organized chaos and tranquility.",
    tags: ["urban", "trains", "ramen", "temples"],
    placeholderGradient: "from-violet-950 to-purple-900",
    people: ["shreyesbharat","loganvines","andrewhuang","saatvikkumar","dorianhawkins"],
  },
  {
    id: "Northeast-Summer-2025" ,
    place: "Northeast",
    country: "USA",
    season: "Summer",
    year: 2025,
    coverImage: "/travel/Cover/northeast-summer-cover.heic",
    popupImage: "/travel/pop-up/northeast-summer-popup.jpg",
    coords: "40.7128° N, 74.0060° W",
    story:
      "I interned in North New Jersey for a couple months. I wasn't making much money but I had more than what I knew to spend it on. Shreyes and I pulled the forsaken Hartford maneuver. He was interning in Boston working Thurs/Fri remote, and I had every other Friday off. When I was young, I memorized the state capitals, glorifying all of the cities, as I imagined the political central would be place of great intrigue. It only took one trip to that unholy city to realize how wrong I was. 30+ gunshots in a row. Handgun magazines don't hold THAT MANY ROUNDS. Regardless, we insisted on meeting in the middle of Boston and Clifton, so we could both hang out in NYC and sleep in my NJ apartment. We met up with Jin every weekend in NYC, and for some reason, we all clicked. Shreyes was always saying and doing some dumb shit, I was always there to call him an idiot, and Jin seemed quite entertained to listen and contribute to the chaos. The banter was unmatched, and in those moments nothing else mattered. Also, Shreyes and I randomly decided to do the hardest hike in the White Mountains.",
    tags: ["coastal", "food", "trams", "tiles"],
    placeholderGradient: "from-amber-950 to-orange-900",
    people: ["shreyesbharat","jinqiuwei"],
  },
  {
    id: "Joshua-Tree-Winter-2024",
    place: "Joshua Tree",
    country: "USA",
    season: "Winter",
    year: 2024,
    coverImage: "/travel/Cover/joshua-tree-cover.jpg",
    popupImage: "/travel/pop-up/joshua-tree-popup.jpg",
    coords: "34.0111° N, 116.3026° W",
    story:
      "Roommates and I decided to go to Joshua Tree and camp. The problem? We didn't plan. Who knew Joshua Tree would get to 80+ with sun in the day and below freezing at night? Not us - none of us checked the weather. We climbed rocks the entire day, set up a campfire at night and stared at the stars. Our incompetence was only matched by our enjoyment. We broke the tent, and even though I had on 4 layers, I was still cold in my sleeping bag. Daniel, my junior year roommate, has a bad habit of being half concious and half asleep sometimes, and he rolled over to me in the middle of the night, looked me dead in the eye and asked if we could double up in the same sleeping bag. I had never been closer to saying yes to something so stupid in my life. I impolitely declined. In hindsight... actually no.",
    tags: ["altitude", "inca", "mountains", "history"],
    placeholderGradient: "from-emerald-950 to-teal-900",
    people: ["danielhan","pranavlingareddy","vincentalcantara","tonyfernandes"],
  },
  {
    id: "Banff-Summer-2024",
    place: "Banff",
    country: "Canada",
    season: "Summer",
    year: 2024,
    coverImage: "/travel/Cover/banff-summer-cover.jpeg",
    popupImage: "/travel/pop-up/banff-summer-popup.jpeg",
    coords: "51.1784° N, 115.5689° W",
    story:
      "Ok at the time of making this website my memory is sort of failing me. Banff was lovely, but it rained throughout our trip and our visibility sucked. Shreyes expressed great interested going, so I will porbably go with him and others sometime. Regardless, it was quite lovely. We spent good money on one of the weirder hikes, where we strapped into harnesses and used carabiners to safely climb up runs and ropes. But, the most memorable hike was an underrated one - Ha Ling Peak. Blake and I climbed 2600 feet in elevation to get to the top and got the best view of all the peaks. The weather was perfect that day, except for the wind. Near the top we felt winds of 40+mph, and for the first time ever I felt scared to stand at the peak for fear of being blown away into the valley's abyss.",
    tags: ["altitude", "inca", "mountains", "history"],
    placeholderGradient: "from-emerald-950 to-teal-900",
    people: ["blakejanowitz","mom","dad","unclepaul","auntlin","aidanjanowitz"],
  },
  {
    id: "Hawaii-Summer-2024",
    place: "Hawaii",
    country: "USA",
    season: "Summer",
    year: 2024,
    coverImage: "/travel/Cover/hawaii-summer-cover.jpeg",
    popupImage: "/travel/pop-up/hawaii-summer-popup.jpeg",
    coords: "21.3069° N, 157.8583° W",
    story:
      "Hawaii was beautiful. We came right before the fires hit. I'm glad we got to see it. I developed my love for hiking here. I planned all the hikes, I chose where to go, and I'm glad I did. I'm glad I got to share it with my family. As usual, Blake and I went on a random duo hike and it was fun. However, Hawaii is overrated, except for this cave we went to. It was straight out of Minecraft.",
    tags: ["altitude", "inca", "mountains", "history"],
    placeholderGradient: "from-emerald-950 to-teal-900",
    people: ["blakejanowitz","mom","dad","unclepaul","auntlin","aidanjanowitz"],
  },
  {
    id: "Western-Europe-Summer-2023",
    place: "Western Europe",
    country: "Europe",
    season: "Summer",
    year: 2023,
    coverImage: "/travel/Cover/western-europe-cover.jpeg",
    popupImage: "/travel/pop-up/western-europe-popup.jpeg",
    coords: "48.8566° N, 2.3522° E",
    story:
      "My parents have always loved travelling. Whereas others spend money or cars, clothes, or nice food, my parents spending money has always gone towards travel. I enjoyed it, but this is where my addiction started. My dad took me to Europe after I finished high school. He hadn't been for a while, and I had never been outside of the Americas. Again, like all plans with men, nothing was truly planned. Only a few things were certain: we flew into Amsterdam and would stay for 2 nights, we had the Louvre and the Eiffel Tower booked, and we flew out of Munich. I filled in the rest. I learned how to travel and the consequences of being poorly planned. I also learned that I love museums, architecture, and spontaneity. I got a lot closer with my dad, and I'm glad I got to share this experience with him.The trip was 25 days. We travelled to 13 cities. It is too much to write about, so here are the highlights. The Dutch are the kindest people in the world. Paris is dropdead gorgeous, but it fails in all the ways big cities fail. Switzerland is the most gorgeous place on the planet. Rome is the historical capitol of the world. Venice is dying. Vienna is underrated. I would live in Prague, it is pretty, cozy, and culture-rich. I loved the Munich architecture, and the German accent is the coolest.",
    tags: ["history", "architecture", "food", "mountains"],
    placeholderGradient: "from-emerald-950 to-teal-900",
    people: ["dad"],
  }
];

const ROTATIONS = [-2.8, 1.6, -1.2, 2.4, -0.9, 1.8, -2.3, 0.7, -1.5, 2.1];
const EASING: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

// ─────────────────────────────────────────────────────────────────────────────
// TRAVEL PHOTO — handles both cover and popup images with gradient fallback
// ─────────────────────────────────────────────────────────────────────────────

function TravelPhoto({
  src,
  alt,
  fill = false,
  placeholderGradient,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  placeholderGradient: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`w-full ${fill ? "h-full" : "aspect-square"} relative overflow-hidden bg-gradient-to-br ${placeholderGradient}`}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.18)3px,rgba(0,0,0,0.18)4px)",
          }}
        />
        <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20" />
        <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20" />
        <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <span className="font-mono text-[8px] tracking-[0.35em] text-white/20 uppercase">
            [ undeveloped ]
          </span>
          <span className="font-mono text-[7px] text-white/10 tracking-wider">{src}</span>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`w-full ${fill ? "h-full" : "aspect-square"} object-cover`}
      onError={() => setErrored(true)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PEOPLE PANEL — dynamic stick-figure crew section inside the modal
// ─────────────────────────────────────────────────────────────────────────────

function PeoplePanel({ peopleKeys }: { peopleKeys: string[] }) {
  const people = peopleKeys
    .map((k) => (PEOPLE[k] ? { key: k, ...PEOPLE[k] } : null))
    .filter(Boolean) as (Person & { key: string })[];

  if (people.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-1">
        <span className="font-mono text-[7px] tracking-[0.3em] text-zinc-700 uppercase">
          solo
        </span>
        <span className="font-mono text-[6px] text-zinc-800">mission</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ gap: people.length > 3 ? "4px" : "8px" }}>
      {people.map((person) => (
        <div
          key={person.key}
          className="flex-1 min-h-0 flex flex-col items-center"
        >
          {/* image fills all available flex space */}
          <div className="flex-1 min-h-0 w-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={person.image}
              alt={person.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          {/* initials pinned below */}
          <span className="flex-shrink-0 font-mono text-[9px] text-amber-400/60 leading-none pb-0.5">
            {getInitials(person.name)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POLAROID CARD
// ─────────────────────────────────────────────────────────────────────────────

function PolaroidCard({
  log,
  index,
  onClick,
}: {
  log: TravelLog;
  index: number;
  onClick: () => void;
}) {
  const rotation = ROTATIONS[index % ROTATIONS.length];
  return (
    <motion.button
      onClick={onClick}
      className="flex-shrink-0 bg-white text-left focus:outline-none"
      style={{
        width: "200px",
        padding: "10px 10px 36px",
        rotate: rotation,
        boxShadow: "0 6px 20px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)",
        cursor: "pointer",
      }}
      whileHover={{
        rotate: 0,
        scale: 1.07,
        boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 4px 14px rgba(0,0,0,0.45)",
        transition: { duration: 0.22, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
    >
      <div className="w-full overflow-hidden">
        <TravelPhoto
          src={log.coverImage}
          alt={`${log.place} — ${log.season} ${log.year}`}
          placeholderGradient={log.placeholderGradient}
        />
      </div>
      <div className={`${hand.className} pt-2 px-0.5`}>
        <p className="text-gray-900 font-bold text-[18px] leading-tight">{log.place}</p>
        <p className="text-gray-400 text-[14px]">
          {log.season} {log.year}
        </p>
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUNK DOT
// ─────────────────────────────────────────────────────────────────────────────

function TrunkDot({ index }: { index: number }) {
  return (
    <motion.div
      className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0"
      animate={{
        boxShadow: [
          "0 0 5px rgba(245,158,11,0.5), 0 0 10px rgba(245,158,11,0.15)",
          "0 0 12px rgba(245,158,11,0.85), 0 0 24px rgba(245,158,11,0.3)",
          "0 0 5px rgba(245,158,11,0.5), 0 0 10px rgba(245,158,11,0.15)",
        ],
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.45 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BRANCH LINE
// ─────────────────────────────────────────────────────────────────────────────

function Branch({ direction }: { direction: "left" | "right" }) {
  return (
    <div
      className="h-px flex-shrink-0"
      style={{
        width: "56px",
        background:
          direction === "right"
            ? "linear-gradient(to right, rgba(245,158,11,0.55), rgba(245,158,11,0.15))"
            : "linear-gradient(to left, rgba(245,158,11,0.55), rgba(245,158,11,0.15))",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE ITEM
// ─────────────────────────────────────────────────────────────────────────────

function TimelineItem({
  log,
  index,
  isLeft,
  onClick,
}: {
  log: TravelLog;
  index: number;
  isLeft: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="relative py-16 md:py-20"
      initial={{ opacity: 0, x: isLeft ? -55 : 55 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: EASING, delay: 0.05 }}
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center w-full">
        <div className="flex-1 flex items-center justify-end">
          {isLeft ? (
            <div className="flex items-center gap-0">
              <PolaroidCard log={log} index={index} onClick={onClick} />
              <Branch direction="right" />
            </div>
          ) : null}
        </div>
        <div className="w-3 flex-shrink-0 flex justify-center z-10">
          <TrunkDot index={index} />
        </div>
        <div className="flex-1 flex items-center justify-start">
          {!isLeft ? (
            <div className="flex items-center gap-0">
              <Branch direction="left" />
              <PolaroidCard log={log} index={index} onClick={onClick} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center pl-14">
        <div className="flex items-center gap-0">
          <Branch direction="left" />
          <PolaroidCard log={log} index={index} onClick={onClick} />
        </div>
      </div>
      <div className="md:hidden absolute left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <TrunkDot index={index} />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// Layout: [People panel] | [Photo] | [Description]
// ─────────────────────────────────────────────────────────────────────────────

function TemporalModal({ log, onClose }: { log: TravelLog; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl bg-zinc-950 border border-amber-400/20 overflow-hidden shadow-2xl"
        style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 0 40px rgba(245,158,11,0.06)" }}
        initial={{ scale: 0.9, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 24, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* top hazard stripe */}
        <div
          className="h-2 w-full flex-shrink-0"
          style={{
            background:
              "repeating-linear-gradient(45deg,#92400e,#92400e 8px,#1c1917 8px,#1c1917 16px)",
          }}
        />

        <div className="flex flex-col sm:flex-row" style={{ maxHeight: "80vh" }}>

          {/* ── PEOPLE PANEL ─────────────────────────────────────────────── */}
          <div className="flex-shrink-0 sm:w-28 border-b sm:border-b-0 sm:border-r border-amber-400/10 bg-zinc-900/40">

            {/* Mobile: horizontal strip */}
            <div className="sm:hidden flex flex-row items-center gap-4 px-4 py-3 overflow-x-auto">
              <span className="font-mono text-[7px] tracking-[0.3em] text-amber-400/30 uppercase flex-shrink-0">
                CREW
              </span>
              {log.people.length === 0 ? (
                <span className="font-mono text-[8px] text-zinc-700">solo mission</span>
              ) : (
                log.people.map((k) => {
                  const p = PEOPLE[k];
                  if (!p) return null;
                  return (
                    <div key={k} className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="w-9 h-9 object-contain" />
                      <span className="font-mono text-[8px] text-amber-400/60">
                        {getInitials(p.name)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop: vertical panel — fills parent height via self-stretch */}
            <div className="hidden sm:flex flex-col h-full p-3">
              <span className="font-mono text-[7px] tracking-[0.3em] text-amber-400/30 uppercase flex-shrink-0 mb-2">
                CREW
              </span>
              <div className="flex-1 min-h-0">
                <PeoplePanel peopleKeys={log.people} />
              </div>
            </div>
          </div>

          {/* ── PHOTO PANEL ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 sm:w-64 bg-zinc-900 border-b sm:border-b-0 sm:border-r border-amber-400/10">
            <div className="w-full aspect-video sm:aspect-auto sm:h-full min-h-[180px] overflow-hidden">
              <TravelPhoto
                src={log.popupImage}
                alt={`${log.place} — ${log.season} ${log.year}`}
                fill
                placeholderGradient={log.placeholderGradient}
              />
            </div>
          </div>

          {/* ── CONTENT PANEL ────────────────────────────────────────────── */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col gap-4 min-w-0 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[8px] tracking-[0.35em] text-amber-400/40 uppercase mb-1">
                  TEMPORAL_LOG // {log.id.toUpperCase().replace(/-/g, "_")}
                </p>
                <h2 className="text-2xl font-bold text-white leading-tight">{log.place}</h2>
                <p className="text-zinc-500 text-sm font-mono mt-0.5">{log.country}</p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-600 hover:text-white transition-colors duration-100 shrink-0 mt-1 p-1"
                aria-label="Close log"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400/55">
                <Calendar size={10} className="shrink-0" />
                {log.season} {log.year}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400/55">
                <MapPin size={10} className="shrink-0" />
                {log.coords}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {log.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 border border-amber-400/12 text-amber-400/35"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="h-px bg-amber-400/8" />
            <p className="text-zinc-400 text-[13px] leading-relaxed flex-1">{log.story}</p>
            <button
              onClick={onClose}
              className="self-start font-mono text-[9px] tracking-widest uppercase px-4 py-2 border border-amber-400/18 text-amber-400/40 hover:border-amber-400/50 hover:text-amber-400/80 transition-all duration-150"
            >
              [ CLOSE_LOG ]
            </button>
          </div>
        </div>

        {/* bottom hazard stripe */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background:
              "repeating-linear-gradient(45deg,#92400e,#92400e 8px,#1c1917 8px,#1c1917 16px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function TravelPage() {
  const [loomVisible, setLoomVisible] = useState(true);
  const [loomFading, setLoomFading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TravelLog | null>(null);

  const handleLoomComplete = useCallback(() => {
    setLoomFading(true);
    setTimeout(() => setLoomVisible(false), 900);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a]">

      {/* ── Temporal Loom overlay ───────────────────────────────────────── */}
      {loomVisible && (
        <div
          className="fixed inset-0 z-[60]"
          style={{
            transition: "opacity 0.9s ease",
            opacity: loomFading ? 0 : 1,
            pointerEvents: loomFading ? "none" : "all",
            background: "#050505",
          }}
        >
          <TemporalLoom onComplete={handleLoomComplete} />
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="pt-28 pb-6 text-center px-6">
        <motion.p
          className="font-mono text-[9px] tracking-[0.5em] text-amber-400/35 uppercase mb-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          TEMPORAL_ARCHIVE
        </motion.p>
        <motion.h1
          className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          Travel Log
        </motion.h1>
        <motion.div
          className="h-px w-14 mx-auto bg-amber-400/30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
        />
        <motion.p
          className="font-mono text-[10px] text-zinc-700 mt-4 tracking-[0.25em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {TRAVEL_LOGS.length} VARIANTS_ON_RECORD
        </motion.p>
      </div>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <div className="relative max-w-4xl mx-auto px-4 pb-40">
        <motion.div
          className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px -translate-x-px pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(245,158,11,0.55) 6%, rgba(245,158,11,0.55) 94%, transparent 100%)",
          }}
          animate={{
            boxShadow: [
              "0 0 4px rgba(245,158,11,0.2)",
              "0 0 10px rgba(245,158,11,0.5)",
              "0 0 4px rgba(245,158,11,0.2)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="block md:hidden absolute top-0 bottom-0 left-8 w-px pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(245,158,11,0.55) 6%, rgba(245,158,11,0.55) 94%, transparent 100%)",
          }}
          animate={{
            boxShadow: [
              "0 0 4px rgba(245,158,11,0.2)",
              "0 0 10px rgba(245,158,11,0.5)",
              "0 0 4px rgba(245,158,11,0.2)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {TRAVEL_LOGS.map((log, i) => (
          <TimelineItem
            key={log.id}
            log={log}
            index={i}
            isLeft={i % 2 === 0}
            onClick={() => setSelectedLog(log)}
          />
        ))}

        <div className="hidden md:flex justify-center pt-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-6 bg-amber-400/25" />
            <div
              className="w-2 h-2 rounded-full bg-amber-400/30"
              style={{ boxShadow: "0 0 6px rgba(245,158,11,0.2)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedLog && (
          <TemporalModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
