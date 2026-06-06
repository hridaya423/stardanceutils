import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { FEATURES, HOME_BENTO_FEATURES } from "@/lib/features";
import { FEATURE_ICONS } from "@/components/feature-icons";

const SPAN: Record<number, string> = {
  0: "sm:col-span-2 lg:col-span-2 lg:row-span-2",
  3: "lg:col-span-2",
};

export function FeaturesBento() {
  return (
    <section id="more" className="relative border-t border-[var(--border)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end" data-reveal>
          <div className="max-w-xl">
            <span className="eyebrow">More tools</span>
            <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.6rem)] font-bold tracking-[-0.03em] text-white">
              The rest of the extension.
            </h2>
            <p className="mt-5 max-w-[40ch] text-pretty text-lg leading-relaxed text-[var(--fg-muted)]">
              The five above change the feel of Stardance first. These are the smaller
              tools that close the gaps once you start using it daily.
            </p>
          </div>
          <Link
            href="/features"
            className="cta-secondary group flex items-center gap-2 rounded-full px-5 py-3 text-sm"
          >
            See all {FEATURES.length} features
            <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_BENTO_FEATURES.map((f, i) => {
            const big = i === 0 || i === 3;
            const Icon = FEATURE_ICONS[f.id];
            return (
              <div
                key={f.id}
                data-reveal
                className={`feature-bento-card flex flex-col justify-between rounded-[14px] p-6 ${SPAN[i] ?? ""}`}
              >
                <div className="relative flex items-start justify-between gap-6">
                  <span className={`feature-bento-icon ${big ? "h-12 w-12" : ""}`}>
                    {Icon && <Icon size={big ? 22 : 18} weight="duotone" />}
                  </span>
                  <span className="feature-bento-pill">{f.metric}</span>
                </div>
                <div className="relative mt-8">
                  <h3
                    className={`font-display font-bold tracking-[-0.02em] text-white ${
                      big ? "text-[1.7rem]" : "text-lg"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`mt-2.5 leading-relaxed text-[var(--fg-muted)] ${
                      big ? "max-w-[42ch] text-base" : "text-sm"
                    }`}
                  >
                    {big ? f.long : f.short}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
