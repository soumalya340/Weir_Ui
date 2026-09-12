import { cn } from "@/lib/utils";
import { hashStr } from "@/lib/weir/format";

export function WeirMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("text-accent", className)} aria-hidden>
      <path
        d="M3.5 15.5h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <path
        d="M5 15.5V10l7-5 7 5v5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="miter"
      />
      <path
        d="M7.5 18.5h9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.45"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Identicon({ id, className }: { id: string; className?: string }) {
  const h = hashStr(id);
  const cells: boolean[] = [];
  let n = h;
  for (let i = 0; i < 15; i++) {
    cells.push((n & 3) !== 0);
    n = (n >>> 1) ^ (n << 3);
  }
  const fills = ["var(--color-accent)", "var(--color-foreground)", "var(--color-muted)"];
  const fill = fills[h % 3];
  return (
    <svg
      viewBox="0 0 10 10"
      className={cn("rounded-sm bg-card-2", className)}
      aria-hidden
    >
      {Array.from({ length: 5 }, (_, y) =>
        Array.from({ length: 5 }, (_, x) => {
          const cx = x < 3 ? x : 4 - x;
          const on = cells[y * 3 + cx] ?? false;
          if (!on) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x + 0.15}
              y={y + 0.15}
              width={0.7}
              height={0.7}
              fill={fill}
            />
          );
        }),
      )}
    </svg>
  );
}

export function Sparkline({
  data,
  className,
  up,
}: {
  data: number[];
  className?: string;
  up?: boolean;
}) {
  if (data.length < 2) {
    return <div className={cn("h-8 w-20", className)} />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const w = 80;
  const h = 32;
  const d = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("overflow-visible", className)} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={up === false ? "var(--color-down)" : "var(--color-up)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
