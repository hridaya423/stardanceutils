"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Galaxy from "@/components/Galaxy";
import type { Feature } from "@/lib/features";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  features: readonly Feature[];
};

type FeatureLayout = {
  frame: string;
  copyOrder: string;
  mediaOrder: string;
  mediaClass: string;
};

const DEFAULT_LAYOUT: FeatureLayout = {
  frame: "md:grid-cols-[0.94fr_1.06fr]",
  copyOrder: "md:order-2",
  mediaOrder: "md:order-1",
  mediaClass: "aspect-[20/11] md:max-w-[38rem] md:justify-self-start",
};

const FEATURE_LAYOUTS: Partial<Record<Feature["id"], FeatureLayout>> = {
  "theme-engine": {
    frame: "md:grid-cols-[0.9fr_1.1fr]",
    copyOrder: "md:order-1",
    mediaOrder: "md:order-2",
    mediaClass: "aspect-[16/10] md:max-w-[38rem] md:justify-self-end",
  },
  "devlog-composer": {
    frame: "md:grid-cols-[1.02fr_0.98fr]",
    copyOrder: "md:order-2",
    mediaOrder: "md:order-1",
    mediaClass: "aspect-[4/5] md:max-w-[28rem] md:justify-self-start",
  },
  "shop-goals": DEFAULT_LAYOUT,
};

function FeatureMedia({ index }: { index: number }) {
  return (
    <div className="feature-media-stage" data-variant={index}>
      <div className="feature-media-glow" />
      <div className="feature-media-shell">
        <div className="feature-media-composition" aria-hidden="true">
          <span className="feature-media-bar feature-media-bar-wide" />
          <span className="feature-media-bar feature-media-bar-mid" />
          <span className="feature-media-bar feature-media-bar-short" />
          <div className="feature-media-window">
            <div className="feature-media-window-grid" />
            <div className="feature-media-window-glow" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePanel({ feature, index }: { feature: Feature; index: number }) {
  const layout = FEATURE_LAYOUTS[feature.id] ?? DEFAULT_LAYOUT;
  const imageClass =
    feature.id === "theme-engine" || feature.id === "shop-goals" || feature.id === "devlog-composer"
      ? "object-contain p-4 md:p-6"
      : "object-cover";

  return (
    <div className="tech-card relative w-full max-w-6xl overflow-hidden rounded-[12px] p-7 md:p-12">
      <div className={`relative grid gap-8 md:items-center md:gap-12 ${layout.frame}`}>
        <div className={`order-2 ${layout.copyOrder}`}>
          <div className="mb-7 flex items-center gap-3">
            <span className="font-mono text-[0.68rem] tracking-[0.22em] text-[var(--fg-subtle)]">
              0{index + 1}
            </span>
            <span className="h-px w-8 bg-[var(--border)]" />
            <span className="font-mono text-[0.68rem] tracking-[0.16em] text-[var(--accent)]">
              {feature.metric}
            </span>
          </div>

          <h2 className="font-display text-[clamp(2.1rem,4vw,3.8rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
            {feature.title}
            <span className="text-white/30">.</span>
          </h2>

          <p className="mt-6 max-w-[46ch] text-pretty text-base leading-relaxed text-[var(--fg-muted)] md:text-lg">
            {feature.long}
          </p>
        </div>

        <div className={`order-1 ${layout.mediaOrder}`}>
          <div className={`feature-media w-full ${layout.mediaClass}`}>
            {feature.image ? (
              <Image
                src={feature.image}
                alt={`${feature.title} preview`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={imageClass}
              />
            ) : (
              <FeatureMedia index={index} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HorizontalFeatures({ features }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const firstSceneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flat = new URLSearchParams(window.location.search).has("flat");
    if (reduceMotion || flat || !sectionRef.current || !trackRef.current || !firstSceneRef.current) return;

    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const frameId = requestAnimationFrame(raf);

    const track = trackRef.current;
    const firstScene = firstSceneRef.current;
    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

    const ctx = gsap.context(() => {
      gsap.set(track, { autoAlpha: 0, x: window.innerWidth * 0.08 });

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.45}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
        .to(firstScene, { autoAlpha: 0, y: -34, duration: 0.24, ease: "power2.out" })
        .to(track, { autoAlpha: 1, duration: 0.08, ease: "none" }, 0.16)
        .to(track, { x: getScrollAmount, duration: 0.76, ease: "none" }, 0.24);

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      cancelAnimationFrame(frameId);
    };
  }, []);

  const [firstFeature, ...travelFeatures] = features;

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
    >
      <div className="horizontal-galaxy" aria-hidden="true">
        <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={140}
          speed={1}
          glowIntensity={0.3}
          saturation={0}
          mouseInteraction
          mouseRepulsion
          repulsionStrength={2}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          transparent
        />
      </div>
      <div className="horizontal-features-veil" aria-hidden="true" />

      {firstFeature && (
        <div ref={firstSceneRef} className="absolute inset-0 flex items-center justify-center px-6 md:px-12 lg:px-20">
          <FeaturePanel feature={firstFeature} index={0} />
        </div>
      )}

      <div
        ref={trackRef}
        className="absolute inset-0 flex h-full flex-nowrap"
        style={{ width: `${travelFeatures.length * 100}vw` }}
      >
        {travelFeatures.map((feature, i) => (
          <div
            key={feature.id}
            className="flex w-screen flex-shrink-0 items-center justify-center px-6 md:px-12 lg:px-20"
          >
            <FeaturePanel feature={feature} index={i + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
