"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Galaxy from "@/components/Galaxy";

type Links = {
  chrome: string;
  firefox: string;
  github: string;
};

export function Hero({ links }: { links: Links }) {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mediaReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setReduce(mediaReduce.matches);
    };

    sync();
    mediaReduce.addEventListener("change", sync);

    return () => {
      mediaReduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pb-12 pt-24 md:pb-16 md:pt-24">
      <div className="hero-galaxy" aria-hidden="true">
        <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={140}
          disableAnimation={reduce}
          speed={1}
          mouseInteraction
          glowIntensity={0.3}
          saturation={0}
          mouseRepulsion
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          transparent
        />
      </div>

      <div className="hero-veil" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[920px] text-center">
        <h1
          className="rise font-display text-[clamp(3.2rem,9.5vw,8rem)] font-bold leading-[0.9] tracking-[-0.04em]"
          style={{ animationDelay: "0ms" }}
        >
          <span className="text-white">Stardance Utils</span>
        </h1>

        <p
          className="rise mx-auto mt-7 max-w-[24ch] text-pretty text-[1.15rem] leading-relaxed text-[var(--fg-muted)] md:text-[1.5rem]"
          style={{ animationDelay: "80ms" }}
        >
          The missing constellation of features.
        </p>

        <div
          className="rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "160ms" }}
        >
          <a
            href={links.chrome}
            target="_blank"
            rel="noreferrer"
            className="cta-primary flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[0.95rem]"
          >
            Install on Chrome
            <ArrowRight size={16} weight="bold" />
          </a>
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            className="cta-secondary flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[0.95rem]"
          >
            View source
            <ArrowUpRight size={15} weight="bold" />
          </a>
        </div>

        <p className="rise mt-8 text-sm text-[var(--fg-subtle)]" style={{ animationDelay: "240ms" }}>
          Built by the same person behind <span className="text-[var(--fg-muted)]">FT</span>,{" "}
          <span className="text-[var(--fg-muted)]">Macondo</span>,{" "}
          <span className="text-[var(--fg-muted)]">Siege</span>, and{" "}
          <span className="text-[var(--fg-muted)]">SOM Utils</span>.
        </p>
      </div>
    </section>
  );
}
