"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FeedCard, LiveDot, PageHead, TokenLink } from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompactUsd, formatUsd } from "@/lib/weir/format";
import { useWeirStore } from "@/lib/weir/store";

export default function Home() {
  const trades = useWeirStore((s) => s.trades);
  const follows = useWeirStore((s) => s.follows);
  const tokens = useWeirStore((s) => s.tokens);
  const [tab, setTab] = useState("all");

  const visible = useMemo(() => {
    if (tab === "following") return trades.filter((t) => follows.includes(t.traderId) || t.traderId === "you");
    if (tab === "raise")
      return trades.filter((t) => {
        const tok = tokens[t.tokenId];
        return tok?.status === "raising" || tok?.status === "proposed";
      });
    return trades;
  }, [tab, trades, follows, tokens]);

  const tape = trades.slice(0, 12);

  return (
    <div>
      <PageHead
        kicker="Social trading"
        title="Follow the room."
        lede="People first, then the pool. Copy a desk, vote a campaign, keep LP in the weir."
        action={
          <Button asChild variant="outline">
            <Link href="/traders">Leaderboard</Link>
          </Button>
        }
      />

      <div className="mb-5 flex items-center gap-3">
        <LiveDot label="Tape" />
        <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-1">
          {tape.map((t) => {
            const token = tokens[t.tokenId];
            if (!token) return null;
            return (
              <div key={t.id} className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                <span className={t.side === "buy" ? "text-up" : "text-down"}>
                  {t.side === "buy" ? "buy" : "sell"}
                </span>
                <TokenLink token={token} className="text-xs" />
                <span className="tabular">{formatUsd(t.usd)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="raise">Raises</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-3">
          {visible.length === 0 ? (
            <p className="rounded-xl bg-card p-6 text-sm text-muted shadow-card">
              Nothing in this tape yet. Follow a desk or switch to All.
            </p>
          ) : (
            visible.map((t) => <FeedCard key={t.id} trade={t} />)
          )}
        </div>
        <aside className="hidden lg:flex lg:flex-col lg:gap-3">
          <HotRail />
        </aside>
      </div>
    </div>
  );
}

function HotRail() {
  const tokenMap = useWeirStore((s) => s.tokens);
  const live = useMemo(
    () =>
      Object.values(tokenMap)
        .filter((t) => t.status === "live")
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 5),
    [tokenMap],
  );
  const raising = useMemo(
    () => Object.values(tokenMap).filter((t) => t.status === "raising").slice(0, 3),
    [tokenMap],
  );

  return (
    <div className="sticky top-6 space-y-4">
      <section className="rounded-xl bg-card p-4 shadow-card">
        <h2 className="text-xs tracking-wide text-muted uppercase">Volume</h2>
        <ul className="mt-3 space-y-3">
          {live.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
              <TokenLink token={t} />
              <span className="tabular text-muted">{formatCompactUsd(t.volume24h)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl bg-card p-4 shadow-card">
        <h2 className="text-xs tracking-wide text-muted uppercase">Open raises</h2>
        <ul className="mt-3 space-y-3">
          {raising.map((t) => (
            <li key={t.id}>
              <TokenLink token={t} />
              <p className="mt-1 line-clamp-2 text-xs text-muted">{t.pitch}</p>
            </li>
          ))}
        </ul>
        <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
          <Link href="/campaigns">All campaigns</Link>
        </Button>
      </section>
    </div>
  );
}
