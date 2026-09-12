"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { Identicon } from "@/components/marks";
import { FeedCard, PageHead } from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { formatCompactUsd, formatPct } from "@/lib/weir/format";
import { useWeirStore } from "@/lib/weir/store";

export default function TraderPage() {
  const { id } = useParams() as { id: string };
  const trader = useWeirStore((s) => s.traders[id]);
  const allTrades = useWeirStore((s) => s.trades);
  const following = useWeirStore((s) => s.follows.includes(id));
  const follow = useWeirStore((s) => s.follow);
  const unfollow = useWeirStore((s) => s.unfollow);
  const trades = useMemo(() => allTrades.filter((t) => t.traderId === id), [allTrades, id]);

  if (!trader) {
    return (
      <div>
        <PageHead title="Unknown desk" />
        <Button asChild variant="outline">
          <Link href="/traders">Leaderboard</Link>
        </Button>
      </div>
    );
  }

  const isYou = trader.id === "you";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Identicon id={trader.id} className="size-16 rounded-lg" />
          <div>
            <p className="text-xs text-muted">{trader.name}</p>
            <h1 className="font-display text-3xl italic">{trader.handle}</h1>
            <p className="mt-2 max-w-xl text-sm text-muted">{trader.bio}</p>
          </div>
        </div>
        {!isYou ? (
          <Button
            variant={following ? "outline" : "default"}
            onClick={() => {
              if (following) {
                unfollow(id);
                toast.message(`Unfollowed ${trader.handle}`);
              } else {
                follow(id);
                toast.success(`Following ${trader.handle}`);
              }
            }}
          >
            {following ? "Following" : "Follow"}
          </Button>
        ) : null}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="PnL" value={formatPct(trader.pnlPct)} tone={trader.pnlPct >= 0 ? "up" : "down"} />
        <Stat label="USD" value={formatCompactUsd(trader.pnlUsd)} />
        <Stat label="Win" value={`${Math.round(trader.winRate * 100)}%`} />
        <Stat label="Avg hold" value={trader.avgHold} />
      </dl>
      <p className="mt-3 text-xs text-muted">
        {trader.followers.toLocaleString()} followers · {trader.following} following · {trader.thesisCount} theses
      </p>

      <h2 className="mt-8 font-display text-xl">Tape</h2>
      <div className="mt-3 flex flex-col gap-3">
        {trades.length === 0 ? (
          <p className="text-sm text-muted">No public prints yet.</p>
        ) : (
          trades.map((t) => <FeedCard key={t.id} trade={t} />)
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-lg bg-card p-3 shadow-card">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 tabular text-sm font-medium ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""}`}>
        {value}
      </div>
    </div>
  );
}
