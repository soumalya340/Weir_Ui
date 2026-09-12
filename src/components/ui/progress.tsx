import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-card-2", className)}>
      <div
        className={cn("h-full rounded-full bg-accent transition-[width] duration-300 ease-out", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
