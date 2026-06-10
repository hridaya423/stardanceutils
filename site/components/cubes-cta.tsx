"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Cubes = dynamic(() => import("@/components/Cubes"), { ssr: false });

export function CubesCta() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !ref.current) return;

    setIsCoarse(window.matchMedia("(pointer: coarse), (max-width: 768px)").matches);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        setActive(visible);
        if (visible) {
          setMounted(true);
        }
      },
      { threshold: 0, rootMargin: "280px 0px" },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="cubes-stage">
      {mounted && (
        <Cubes
          gridSize={isCoarse ? 14 : 20}
          cubeSize={undefined}
          maxAngle={20}
          radius={2}
          borderStyle="2px dashed #B497CF"
          faceColor="rgba(26, 26, 46, 0.04)"
          shadow={false}
          rippleColor="#87eefc"
          rippleSpeed={1.5}
          autoAnimate={active}
          rippleOnClick
          cellGap={isCoarse ? 5 : 6}
        />
      )}
    </div>
  );
}
