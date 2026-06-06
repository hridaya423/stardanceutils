"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

type Links = {
  chrome: string;
  firefox: string;
  github: string;
};

type Browser = "chromium" | "firefox" | "safari" | "other";

function detectBrowser(userAgent: string): Browser {
  const ua = userAgent.toLowerCase();
  if (ua.includes("firefox")) return "firefox";
  if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) return "safari";
  if (ua.includes("chrome") || ua.includes("chromium") || ua.includes("edg") || ua.includes("brave")) return "chromium";
  return "other";
}

export function InstallNavButton({ links }: { links: Links }) {
  const [browser, setBrowser] = useState<Browser>("other");

  useEffect(() => {
    const id = requestAnimationFrame(() => setBrowser(detectBrowser(window.navigator.userAgent)));
    return () => cancelAnimationFrame(id);
  }, []);

  const config = useMemo(() => {
    if (browser === "firefox") {
      return { href: links.firefox, label: "Install for Firefox", disabled: false };
    }
    if (browser === "safari") {
      return { href: undefined, label: "TestFlight soon", disabled: true };
    }
    return { href: links.chrome, label: "Install for Chrome", disabled: false };
  }, [browser, links]);

  if (config.disabled) {
    return <span className="cta-primary rounded-full px-4 py-2 text-sm opacity-70">{config.label}</span>;
  }

  return (
    <a href={config.href} target="_blank" rel="noreferrer" className="cta-primary flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
      {config.label}
      <ArrowUpRight size={14} weight="bold" />
    </a>
  );
}

export function InstallCtaButtons({ links }: { links: Links }) {
  const [browser, setBrowser] = useState<Browser>("other");

  useEffect(() => {
    const id = requestAnimationFrame(() => setBrowser(detectBrowser(window.navigator.userAgent)));
    return () => cancelAnimationFrame(id);
  }, []);

  const config = useMemo(() => {
    if (browser === "firefox") {
      return {
        primary: { href: links.firefox, label: "Install with Firefox" },
        secondary: { href: links.chrome, label: "Chrome Web Store" },
      };
    }

    if (browser === "safari") {
      return {
        primary: { href: undefined, label: "TestFlight coming soon" },
        secondary: { href: links.chrome, label: "Chrome Web Store" },
      };
    }

    return {
      primary: { href: links.chrome, label: "Install with Chrome" },
      secondary: { href: links.firefox, label: "Firefox Add-ons" },
    };
  }, [browser, links]);

  return (
    <div className="pointer-events-auto mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
      {config.primary.href ? (
        <a href={config.primary.href} target="_blank" rel="noreferrer" className="cta-primary flex items-center gap-2 rounded-full px-8 py-4 text-[0.95rem]">
          {config.primary.label}
          <ArrowUpRight size={15} weight="bold" />
        </a>
      ) : (
        <span className="cta-primary rounded-full px-8 py-4 text-[0.95rem] opacity-70">{config.primary.label}</span>
      )}

      <a href={config.secondary.href} target="_blank" rel="noreferrer" className="cta-secondary flex items-center gap-2 rounded-full px-8 py-4 text-[0.95rem]">
        {config.secondary.label}
      </a>

      <a href={links.github} target="_blank" rel="noreferrer" className="cta-secondary flex items-center gap-2 rounded-full px-8 py-4 text-[0.95rem]">
        GitHub
      </a>
    </div>
  );
}

export function InstallPrimaryButton({ links }: { links: Links }) {
  const [browser, setBrowser] = useState<Browser>("other");

  useEffect(() => {
    const id = requestAnimationFrame(() => setBrowser(detectBrowser(window.navigator.userAgent)));
    return () => cancelAnimationFrame(id);
  }, []);

  const config = useMemo(() => {
    if (browser === "firefox") {
      return { href: links.firefox, label: "Install with Firefox", disabled: false };
    }
    if (browser === "safari") {
      return { href: undefined, label: "TestFlight coming soon", disabled: true };
    }
    return { href: links.chrome, label: "Install with Chrome", disabled: false };
  }, [browser, links]);

  if (config.disabled) {
    return <span className="cta-primary rounded-full px-8 py-4 text-[0.95rem] opacity-70">{config.label}</span>;
  }

  return (
    <a href={config.href} target="_blank" rel="noreferrer" className="cta-primary flex items-center gap-2 rounded-full px-8 py-4 text-[0.95rem]">
      {config.label}
      <ArrowUpRight size={15} weight="bold" />
    </a>
  );
}
