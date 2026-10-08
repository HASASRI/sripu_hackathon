import { useEffect, useState } from "react";

const STAGES = [
  "Mixing the colors…",
  "Sketching the characters…",
  "Painting the world…",
  "Adding magical sparkles…",
  "Almost ready…",
];
const EXPECTED_SECONDS = 20;

function PaintingTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const stage = STAGES[Math.min(Math.floor(seconds / 4), STAGES.length - 1)];
  const pct = Math.min(95, Math.round((seconds / EXPECTED_SECONDS) * 100));
  return (
    <div className="flex w-64 flex-col items-center gap-2 rounded-2xl bg-paper/90 px-5 py-4 text-center shadow-brutal">
      <span className="font-display text-sm font-bold">🎨 Painting this scene…</span>
      <span className="font-display text-4xl font-bold text-flame tabular-nums">{seconds}s</span>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-flame transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-ink/70">{stage}</span>
      <span className="text-[11px] text-ink/50">Pictures usually take about 15–20 seconds</span>
    </div>
  );
}

// Large storybook illustration with a styled placeholder — never a broken image.
export function ChapterImage({ src, alt, loading }: { src?: string | undefined; alt: string; loading?: boolean }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden border-2 border-ink bg-sky/10 shadow-brutal">
      {show ? (
        <img
          key={src}
          src={src}
          alt={alt}
          width={1536}
          height={1024}
          onError={() => setFailed(true)}
          className="h-full w-full animate-fade-in object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_30%,var(--color-flame)_0,transparent_35%),radial-gradient(circle_at_75%_70%,var(--color-sky)_0,transparent_40%)]">
          {loading ? (
            <PaintingTimer />
          ) : (
            <>
              <span className="text-6xl">🎨</span>
              <span className="bg-paper px-3 py-1 font-display text-sm font-bold uppercase tracking-wide">
                Imagine this scene!
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
