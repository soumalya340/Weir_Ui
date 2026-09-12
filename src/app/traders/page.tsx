"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Identicon } from "@/components/marks";
import { PageHead } from "@/components/widgets";
import { formatCompactUsd, formatPct } from "@/lib/weir/format";
import { useWeirStore } from "@/lib/weir/store";

export default function Traders() {
  const traderMap = useWeirStore((s) => s.traders);
  const traders = useMemo(
    () =>
      Object.values(traderMap)
        .filter((t) => t.id !== "you")
        .sort((a, b) => b.pnlUsd - a.pnlUsd),
    [traderMap],
  );

  return (
    <div>
      <PageHead
        kicker="Leaderboard"
        title="Desks, not wallets."
        lede="Follow a room you trust. Copy a print from the feed. Average hold time is part of the thesis."
      />
      <div className="flex flex-col gap-2">
        {traders.map((t, i) => (
          <Link
            key={t.id}
            href={`/traders/${t.id}`}
            className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover"
          >
            <span className="w-6 tabular text-sm text-muted">{i + 1}</span>
            <Identicon id={t.id} className="size-10 rounded-md" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{t.handle}</div>
              <div className="truncate text-xs text-muted">{t.bio}</div>
            </div>
            <div className="text-right">
              <div className={`tabular text-sm ${t.pnlUsd >= 0 ? "text-up" : "text-down"}`}>
                {formatPct(t.pnlPct)}
              </div>
              <div className="tabular text-xs text-muted">{formatCompactUsd(t.pnlUsd)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
