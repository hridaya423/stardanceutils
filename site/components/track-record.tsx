import Image from "next/image";

type Entry = {
  name: string;
  logo: string;
  installs: string;
  label: string;
};

const ENTRIES: Entry[] = [
  { name: "SOM Utils", logo: "/unnamed.png", installs: "350", label: "est. installs" },
  { name: "Siege Utils", logo: "/3.png", installs: "200", label: "est. installs" },
  { name: "FT Utils", logo: "/1.png", installs: "270", label: "peak installs" },
  { name: "Macondo Utils", logo: "/4.png", installs: "40", label: "est. installs" },
  { name: "Stardance Utils", logo: "/5.png", installs: "25", label: "live now" },
];

const TOTAL = "885";

export function TrackRecord() {
  return (
    <section id="track" className="relative border-t border-[var(--border)] px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end" data-reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">Track record</span>
            <h2 className="font-display mt-4 text-[clamp(2.6rem,6vw,5rem)] font-bold tracking-[-0.035em] text-white">
              Four shipped already. <span className="text-white/35">This is the fifth.</span>
            </h2>
            <p className="mt-6 max-w-[44ch] text-pretty text-lg leading-relaxed text-[var(--fg-muted)]">
              Stardance Utils follows FT, Macondo, Siege, and SOM Utils. The patterns in
              this release come from shipping earlier tools people actually kept using.
            </p>
          </div>
          <div className="shrink-0">
            <div className="font-display text-gloss text-[clamp(3rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">
              {TOTAL}
            </div>
            <div className="eyebrow mt-2 text-[0.62rem]">installs across five</div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {ENTRIES.map((e, i) => (
            <div
              key={e.name}
              data-reveal
                className={`tech-card flex flex-col gap-5 rounded-[10px] p-5 ${
                i === 4 ? "border-[var(--border-strong)]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <Image
                  src={e.logo}
                  alt={`${e.name} logo`}
                  width={52}
                  height={52}
                  className="rounded-[10px] border border-white/10 object-cover"
                />
                {i === 4 && (
                  <span className="border border-[var(--border-strong)] px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--accent)]">
                    Now
                  </span>
                )}
              </div>
              <div>
                <div className="font-display text-base font-bold tracking-tight text-white">
                  {e.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold tracking-tight text-white">
                    {e.installs}
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--fg-subtle)]">
                    {e.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
