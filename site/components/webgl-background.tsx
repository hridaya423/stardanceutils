"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Galaxy = dynamic(() => import("@/components/Galaxy"), { ssr: false });

export function WebglBackground() {
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="webgl-fixed" aria-hidden="true">
      {ready && (
        <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={140}
          disableAnimation={reduce}
          speed={1}
          mouseInteraction={!isMobile}
          glowIntensity={0.3}
          saturation={0}
          mouseRepulsion
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          transparent
        />
      )}
    </div>
  );
}
