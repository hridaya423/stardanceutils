import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { FEATURES } from "@/lib/features";
import { InstallNavButton, InstallPrimaryButton } from "@/components/install-actions";
import { WebglBackground } from "@/components/webgl-background";

const chrome =
  "https://chromewebstore.google.com/detail/stardance-utils/kapdpeddcghffhildgnbbdnaedeebdoj";

export const metadata: Metadata = {
  title: "Features — Stardance Utils",
  description: "The full index of everything Stardance Utils adds to Stardance.",
};

export default function FeaturesPage() {
  return (
    <div className="relative isolate w-full">
      <WebglBackground />

      <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5">
        <div className="nav-shell mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full px-3 py-2 pl-4 sm:pl-5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-white"
          >
            <Image
              src="/5.png"
              alt="Stardance Utils logo"
              width={24}
              height={24}
              className="h-7 w-7 shrink-0 rounded-sm object-cover"
            />
            <ArrowLeft size={15} weight="bold" />
            <span className="truncate">Back</span>
          </Link>
          <InstallNavButton links={{ chrome, firefox: "https://addons.mozilla.org/en-US/firefox/addon/stardance-utils/", github: "https://github.com/hridaya423/stardanceutils" }} />
        </div>
      </nav>

      <header className="relative px-6 pt-40 pb-16 md:pt-48">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display max-w-4xl text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.04em] text-white">
            Everything in <span className="text-white/35">Stardance Utils.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
            {FEATURES.length} features today, across appearance, devlogs, the shop,
            and the feed — with more landing every release.
          </p>
        </div>
      </header>

      <section className="relative px-6 pb-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div key={f.id} className="tech-card flex flex-col rounded-[10px] p-7 md:p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--fg-subtle)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="border border-[var(--border)] px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-[var(--accent)]">
                  {f.metric}
                </span>
              </div>
              <h2 className="font-display mt-8 text-2xl font-bold tracking-tight text-white">
                {f.title}
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--fg-muted)]">
                {f.long}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative border-t border-[var(--border)] px-6 py-24 text-center md:py-32">
        <h2 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-bold tracking-[-0.03em] text-white">
          Ready when you are.
        </h2>
        <div className="mt-8 flex justify-center">
          <InstallPrimaryButton links={{ chrome, firefox: "https://addons.mozilla.org/en-US/firefox/addon/stardance-utils/", github: "https://github.com/hridaya423/stardanceutils" }} />
        </div>
        <div className="mt-10">
          <Link href="/" className="eyebrow transition-colors hover:text-white">
            ← Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
