"use client";

import { useEffect, useRef } from "react";

type Shape = "figure" | "star" | "cluster";

type ShapeParticleFieldProps = {
  className?: string;
  shape?: Shape;
};

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  size: number;
  alpha: number;
  phase: number;
  driftX: number;
  driftY: number;
  speed: number;
};

function generateFigurePoints(w: number, h: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const cx = w * 0.42;
  const top = h * 0.06;
  const scl = h * 0.78;

  const addCircle = (px: number, py: number, r: number, n: number, a = 0.9) => {
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * r;
      pts.push([px + Math.cos(angle) * dist, py + Math.sin(angle) * dist, a * (0.7 + Math.random() * 0.3)]);
    }
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, n: number, scat = 0.006, a = 0.85) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const s = (Math.random() - 0.5) * scat * Math.min(w, h);
      pts.push([
        x1 + t * (x2 - x1) + nx * s,
        y1 + t * (y2 - y1) + ny * s,
        a * (0.55 + Math.random() * 0.45),
      ]);
    }
  };

  const addFill = (cx2: number, cy2: number, rw: number, rh: number, n: number, a = 0.8) => {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const w2 = rw * (0.9 - t * 0.3);
      pts.push([
        cx2 + (Math.random() - 0.5) * w2,
        cy2 + (t - 0.5) * rh,
        a * (0.5 + Math.random() * 0.5),
      ]);
    }
  };

  const headY = top + scl * 0.08;
  const headR = scl * 0.074;
  addCircle(cx, headY, headR, 240);

  addLine(cx, headY + headR * 0.9, cx, headY + scl * 0.2, 35, 0.003, 0.82);

  const shoulderY = top + scl * 0.2;
  const shoulderW = scl * 0.13;
  addLine(cx - shoulderW, shoulderY, cx + shoulderW, shoulderY, 70, 0.003, 0.78);

  const hipY = top + scl * 0.5;
  const hipW = scl * 0.1;
  addFill(cx, (shoulderY + hipY) / 2, shoulderW * 2.2, hipY - shoulderY, 380, 0.82);

  const leftShoulderX = cx - shoulderW;
  const leftArmEndX = cx - scl * 0.38;
  const leftArmEndY = top + scl * 0.04;
  addLine(leftShoulderX, shoulderY, leftArmEndX, leftArmEndY, 260, 0.006, 0.88);
  addLine(leftArmEndX, leftArmEndY, leftArmEndX - scl * 0.07, leftArmEndY - scl * 0.04, 60, 0.004, 0.82);

  const rightShoulderX = cx + shoulderW;
  const rightArmEndX = cx + scl * 0.44;
  const rightArmEndY = shoulderY + scl * 0.16;
  addLine(rightShoulderX, shoulderY, rightArmEndX, rightArmEndY, 240, 0.006, 0.88);

  const lhX = cx - hipW * 0.8;
  const lKneeX = lhX - scl * 0.09;
  const lKneeY = hipY + scl * 0.22;
  const lFootX = lhX - scl * 0.17;
  const lFootY = hipY + scl * 0.47;
  addLine(lhX, hipY, lKneeX, lKneeY, 190, 0.005, 0.85);
  addLine(lKneeX, lKneeY, lFootX, lFootY, 160, 0.005, 0.8);

  const rhX = cx + hipW * 0.8;
  const rFootX = rhX + scl * 0.08;
  const rFootY = hipY + scl * 0.47;
  addLine(rhX, hipY, rFootX, rFootY, 310, 0.005, 0.85);

  for (let i = 0; i < 110; i++) {
    pts.push([
      Math.random() * w,
      Math.random() * h,
      0.08 + Math.random() * 0.12,
    ]);
  }

  return pts;
}

function generateStarPoints(w: number, h: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const cx = w * 0.44;
  const cy = h * 0.47;
  const outerR = Math.min(w, h) * 0.35;
  const innerR = outerR * 0.4;
  const spikes = 8;

  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    const nextAngle = (Math.PI * 2 * (i + 1)) / (spikes * 2) - Math.PI / 2;
    const nextR = (i + 1) % 2 === 0 ? outerR : innerR;
    const nx = cx + Math.cos(nextAngle) * nextR;
    const ny = cy + Math.sin(nextAngle) * nextR;

    const edgePts = 80;
    for (let j = 0; j < edgePts; j++) {
      const t = Math.random();
      const s = (Math.random() - 0.5) * 10;
      pts.push([
        x + t * (nx - x) + s,
        y + t * (ny - y) + s,
        0.55 + Math.random() * 0.45,
      ]);
    }
  }

  for (let i = 0; i < spikes; i++) {
    const outerAngle = (Math.PI * 2 * (i * 2)) / (spikes * 2) - Math.PI / 2;
    const ox = cx + Math.cos(outerAngle) * outerR;
    const oy2 = cy + Math.sin(outerAngle) * outerR;
    for (let j = 0; j < 55; j++) {
      const t1 = Math.random();
      pts.push([
        cx + t1 * (ox - cx) + (Math.random() - 0.5) * 18,
        cy + t1 * (oy2 - cy) + (Math.random() - 0.5) * 18,
        0.4 + Math.random() * 0.45,
      ]);
    }
  }

  for (let i = 0; i < 320; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * innerR * 0.82;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.6 + Math.random() * 0.4]);
  }

  for (let i = 0; i < 90; i++) {
    pts.push([Math.random() * w, Math.random() * h, 0.07 + Math.random() * 0.11]);
  }

  return pts;
}

function generateClusterPoints(w: number, h: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const cx = w * 0.44;
  const cy = h * 0.46;

  const addGaussian = (px: number, py: number, sigma: number, n: number, aBase: number) => {
    for (let i = 0; i < n; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
      const z1 = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.sin(2 * Math.PI * u2);
      const dist = Math.abs(z0) * sigma;
      const falloff = Math.exp(-(dist * dist) / (2 * sigma * sigma));
      pts.push([
        px + z0 * sigma,
        py + z1 * sigma,
        aBase * falloff * (0.6 + Math.random() * 0.4),
      ]);
    }
  };

  addGaussian(cx, cy, Math.min(w, h) * 0.14, 700, 0.95);
  addGaussian(cx - w * 0.18, cy - h * 0.08, Math.min(w, h) * 0.07, 200, 0.82);
  addGaussian(cx + w * 0.2, cy + h * 0.06, Math.min(w, h) * 0.06, 180, 0.78);
  addGaussian(cx - w * 0.06, cy + h * 0.2, Math.min(w, h) * 0.055, 140, 0.72);

  for (let i = 0; i < 80; i++) {
    pts.push([Math.random() * w, Math.random() * h, 0.06 + Math.random() * 0.1]);
  }

  return pts;
}

export function ShapeParticleField({
  className = "",
  shape = "figure",
}: ShapeParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let time = 0;

    const buildParticles = (w: number, h: number) => {
      const rawPts =
        shape === "figure"
          ? generateFigurePoints(w, h)
          : shape === "star"
            ? generateStarPoints(w, h)
            : generateClusterPoints(w, h);

      particles = rawPts.map(([ox, oy, alpha]) => ({
        x: ox + (Math.random() - 0.5) * 6,
        y: oy + (Math.random() - 0.5) * 6,
        ox,
        oy,
        size: 0.55 + Math.random() * 0.9,
        alpha,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 14,
        driftY: (Math.random() - 0.5) * 14,
        speed: 0.3 + Math.random() * 0.5,
      }));
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.008;

      for (const p of particles) {
        const t = time * p.speed + p.phase;
        const dx = Math.sin(t) * p.driftX * 0.5;
        const dy = Math.cos(t * 0.77) * p.driftY * 0.5;
        const px = p.ox + dx;
        const py = p.oy + dy;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(28, 26, 20, ${Math.min(1, p.alpha)})`;
        ctx.fill();
      }

      if (!reduceMotion) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;

      width = w;
      height = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildParticles(w, h);

      if (reduceMotion) render();
    };

    resize();
    if (!reduceMotion) render();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [shape]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
