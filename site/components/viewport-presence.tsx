"use client";

import { useEffect, useRef, useState } from "react";

type ViewportPresenceProps = {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
};

export function ViewportPresence({
  children,
  className,
  rootMargin = "200px 0px",
}: ViewportPresenceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry?.isIntersecting ?? false);
      },
      { threshold: 0, rootMargin },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} data-in-view={inView ? "true" : "false"}>
      {children}
    </div>
  );
}
