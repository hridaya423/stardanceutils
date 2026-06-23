import Link from "next/link";
import Image from "next/image";
import { Star, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { Hero } from "@/components/hero";
import { HorizontalFeatures } from "@/components/horizontal-features";
import { FeaturesBento } from "@/components/features-bento";
import { TrackRecord } from "@/components/track-record";
import { FeedbackCarousels, REVIEW_SOURCES } from "@/components/feedback-carousels";
import { CubesCta } from "@/components/cubes-cta";
import { InstallCtaButtons, InstallNavButton } from "@/components/install-actions";
import { HOME_SCROLL_FEATURES } from "@/lib/features";

const links = {
  chrome: "https://chromewebstore.google.com/detail/stardance-utils/kapdpeddcghffhildgnbbdnaedeebdoj",
  firefox: "https://addons.mozilla.org/en-US/firefox/addon/stardance-utils/",
  github: "https://github.com/hridaya423/stardanceutils",
};

const follows = [
  { src: "/follows/zach.webp", name: "Zach", role: "Hack Club founder" },
  { src: "/follows/neon.webp", name: "Neon", role: "Stardance dev" },
  { src: "/follows/tongyu.webp", name: "Tongyu", role: "Stardance dev" },
];

export default function Home() {
  const pastReviews = REVIEW_SOURCES.filter((s) => s.era === "past");
  const stardanceReviews = REVIEW_SOURCES.filter((s) => s.product === "Stardance Utils");

  return (
    <div id="top" className="relative w-full">
      <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5">
        <div className="nav-shell mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full px-3 py-2 pl-4 sm:pl-5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 text-sm font-semibold tracking-tight text-white/90">
            <Image
              src="/5.png"
              alt="Stardance Utils logo"
              width={24}
              height={24}
              className="h-7 w-7 shrink-0 rounded-sm object-cover"
            />
            <span className="truncate">Stardance Utils</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hidden h-9 w-9 place-items-center rounded-full text-[var(--fg-muted)] hover:bg-white/5 hover:text-white sm:grid"
            >
              <GithubLogo size={18} />
            </a>
            <InstallNavButton links={links} />
          </div>
        </div>
      </nav>

      <Hero links={links} />

      <HorizontalFeatures features={HOME_SCROLL_FEATURES} />

      <FeaturesBento />

      <TrackRecord />

      <section className="relative pb-24 md:pb-32">
        <div className="mx-auto mb-8 max-w-6xl px-6" data-reveal>
          <span className="eyebrow">What people said</span>
        </div>
        <div data-reveal>
          <FeedbackCarousels sources={pastReviews} rows={4} />
        </div>
      </section>

      <section id="vouches" className="relative border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[96rem]" data-reveal>
          <div className="grid gap-10 text-center md:grid-cols-2 md:gap-10 lg:gap-12">
            <article>
              <div className="mb-5 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={16} weight="fill" className="text-[var(--accent)]" />
                ))}
              </div>
              <blockquote className="font-display text-[clamp(1.35rem,2.45vw,2rem)] font-medium leading-[1.28] tracking-[-0.02em] text-white">
                “Truly life changing. Before using Stardance Utils I had broken wrists…
                <span className="text-white/40">
                  {" "}now I still have broken wrists but hey, at least I can make a devlog now!”
                </span>
              </blockquote>
              <div className="mt-6 text-sm text-[var(--fg-muted)]">
                <span className="font-medium text-white/80">Rupnil</span> · Chrome Web Store
              </div>
            </article>

            <article>
              <div className="mb-5 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={16} weight="fill" className="text-[var(--accent)]" />
                ))}
              </div>
              <blockquote className="font-display text-[clamp(1.35rem,2.45vw,2rem)] font-medium leading-[1.28] tracking-[-0.02em] text-white">
                “Before this, I had to look at deep purples. With this extension, I selected the Catppuccin Mocha theme and it instantly reduced my eye strain.
                <span className="text-white/40">
                  {" "}Thank you Hridya for helping differently-abled people!”
                </span>
              </blockquote>
              <div className="mt-6 text-sm text-[var(--fg-muted)]">
                <span className="font-medium text-white/80">Keyboard1000n17</span> · Mozilla Addons
              </div>
            </article>
          </div>
          <div className="mt-8 text-center text-xs text-[var(--fg-subtle)]">
            Helping people with disabilities use Stardance, apparently.
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-6xl md:mt-20">
          <div className="mb-8 text-center" data-reveal>
            <span className="eyebrow">Stardance Utils · early reviews</span>
          </div>
          <div data-reveal>
            <FeedbackCarousels sources={stardanceReviews} rows={2} />
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {follows.map((follow) => (
              <div key={follow.name} className="tech-card overflow-hidden rounded-[12px] p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] border border-white/8 bg-[#0d0e16]">
                  <Image
                    src={follow.src}
                    alt={`${follow.name} follow notification`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-2"
                  />
                </div>
                <div className="mt-4 text-left">
                  <div className="text-base font-semibold text-white">{follow.name}</div>
                  <div className="mt-1 text-sm text-[var(--fg-subtle)]">{follow.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="install" className="install-cta relative overflow-hidden border-t border-[var(--border)] px-6 py-28 md:py-40">
        <CubesCta />
        <div className="relative z-10 mx-auto max-w-3xl text-center pointer-events-none">
          <h2
            className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-bold tracking-[-0.04em] text-white"
            data-reveal
          >
            Launch Stardance into <span className="text-white/35">orbit.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[38ch] text-pretty text-lg text-[var(--fg-muted)]" data-reveal>
            Install the extra toolkit that makes posting, theming, browsing, and
            editing Stardance feel far less cramped.
          </p>

          <div data-reveal>
            <InstallCtaButtons links={links} />
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-[var(--border)] px-6 pb-10 pt-24">
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[var(--fg-subtle)] sm:flex-row">
          <span className="flex items-center gap-2">
            <Image
              src="/5.png"
              alt="Stardance Utils logo"
              width={20}
              height={20}
              className="h-5 w-5 rounded-sm object-cover"
            />
            Stardance Utils · v0.0.4
          </span>
          <span>
            Built by{" "}
            <a
              href="https://github.com/hridaya423"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--fg-muted)] transition-colors hover:text-white"
            >
              Hridya Agrawal
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
