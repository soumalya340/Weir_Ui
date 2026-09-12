import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "muted" | "accent" | "up" | "down" | "solid" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide",
        tone === "muted" && "bg-card-2 text-muted",
        tone === "accent" && "bg-accent/15 text-accent",
        tone === "up" && "bg-up/15 text-up",
        tone === "down" && "bg-down/15 text-down",
        tone === "solid" && "bg-foreground/10 text-foreground",
        className,
      )}
      {...props}
    />
  );
}
