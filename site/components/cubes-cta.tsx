"use client";

import { useEffect, useState } from "react";
import Cubes from "@/components/Cubes";

export function CubesCta() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="cubes-stage">
      {mounted && (
        <Cubes
          gridSize={20}
          cubeSize={undefined}
          maxAngle={20}
          radius={2}
          borderStyle="2px dashed #B497CF"
          faceColor="rgba(26, 26, 46, 0.04)"
          shadow={false}
          rippleColor="#87eefc"
          rippleSpeed={1.5}
          autoAnimate
          rippleOnClick
          cellGap={6}
        />
      )}
    </div>
  );
}
