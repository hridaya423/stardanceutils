import { closeSync, openSync, readSync, readdirSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

type Shot = { src: string; product: string; ratio: number };

export const REVIEW_SOURCES = [
  { dir: "somutilsreviews", product: "SOM Utils", era: "past" },
  { dir: "siegeutilsreviews", product: "Siege Utils", era: "past" },
  { dir: "ftutilsreviews", product: "FT Utils", era: "past" },
  { dir: "macondoutils", product: "Macondo Utils", era: "past" },
  { dir: "sdutilsreviews", product: "Stardance Utils", era: "current" },
] as const;

type ReviewSource = (typeof REVIEW_SOURCES)[number];

type FeedbackCarouselsProps = {
  sources?: readonly ReviewSource[];
  rows?: number;
};

function pngRatio(file: string): number {
  try {
    const fd = openSync(file, "r");
    const buf = Buffer.alloc(24);
    readSync(fd, buf, 0, 24, 0);
    closeSync(fd);
    if (buf.toString("ascii", 1, 4) !== "PNG") return 1.4;
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    if (!w || !h) return 1.4;
    return Math.min(Math.max(w / h, 0.6), 4.5);
  } catch {
    return 1.4;
  }
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function collectShots(sources: readonly ReviewSource[]): Shot[] {
  const all: Shot[] = [];
  for (const { dir, product } of sources) {
    try {
      const full = path.join(process.cwd(), "public", dir);
      const files = readdirSync(full)
        .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
        .sort();
      for (const f of files) {
        all.push({ src: `/${dir}/${f}`, product, ratio: pngRatio(path.join(full, f)) });
      }
    } catch {
    }
  }

  const rand = mulberry32(0x5ada9ce);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

function intoRows(shots: Shot[], rows: number): Shot[][] {
  const out: Shot[][] = Array.from({ length: rows }, () => []);
  shots.forEach((shot, index) => out[index % rows].push(shot));
  return out;
}

function ShotFrame({ src, product, ratio }: Shot) {
  const tag = product.replace(/\s*Utils$/, "");
  return (
    <figure
      className="vouch group relative mx-2 h-[124px] shrink-0 rounded-[12px] md:h-[150px]"
      style={{ aspectRatio: String(ratio) }}
    >
      <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full border border-white/10 bg-black/65 px-2 py-0.5 font-mono text-[0.56rem] uppercase tracking-wider text-white/70 backdrop-blur">
        {tag}
      </span>
      <Image
        src={encodeURI(src)}
        alt={`${product} review`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
      />
    </figure>
  );
}

function Row({ items, dur, reverse }: { items: Shot[]; dur: string; reverse?: boolean }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div className="marquee py-1">
      <div className={`marquee-track${reverse ? " reverse" : ""}`} style={{ ["--dur" as string]: dur }}>
        {doubled.map((shot, index) => (
          <ShotFrame key={`${shot.src}-${index}`} {...shot} />
        ))}
      </div>
    </div>
  );
}

export function FeedbackCarousels({ sources = REVIEW_SOURCES, rows: rowCount = 4 }: FeedbackCarouselsProps) {
  const rows = intoRows(collectShots(sources), rowCount);
  const durations = ["78s", "96s", "86s", "104s"];
  return (
    <div className="flex flex-col gap-3">
      {rows.map((items, index) => (
        <Row key={index} items={items} dur={durations[index % durations.length]} reverse={index % 2 === 1} />
      ))}
    </div>
  );
}
