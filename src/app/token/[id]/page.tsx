"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { FeedCard, LpBadge, PageHead, StatusChip, TradeDialog, TraderChip } from "@/components/widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  categoryLabel,
  changeFrom,
  formatCompactUsd,
  formatPct,
  formatQty,
  formatUsd,
  mcapOf,
} from "@/lib/weir/format";
import { useWeirStore } from "@/lib/weir/store";

export default function TokenPage() {
  const { id } = useParams() as { id: string };
  const token = useWeirStore((s) => s.tokens[id]);
  const pool = useWeirStore((s) => s.pools[id]);
  const allTrades = useWeirStore((s) => s.trades);
  const campaignMap = useWeirStore((s) => s.campaigns);
  const proposalMap = useWeirStore((s) => s.proposals);
  const pos = useWeirStore((s) => s.positions[id]);
  const [side, setSide] = useState<"buy" | "sell" | null>(null);

  const trades = useMemo(() => allTrades.filter((t) => t.tokenId === id), [allTrades, id]);
  const campaign = useMemo(
    () => Object.values(campaignMap).find((c) => c.tokenId === id),
    [campaignMap, id],
  );
  const lpVotes = useMemo(
    () => Object.values(proposalMap).filter((p) => p.kind === "futarchy" && p.tokenId === id),
    [proposalMap, id],
  );

  if (!token) {
    return (
      <div>
        <PageHead title="Unknown token" />
        <Button asChild variant="outline">
          <Link href="/discover">Discover</Link>
        </Button>
      </div>
    );
  }

  const ch = changeFrom(token.history, token.price);
  const up = ch >= 0;
  const mcap = mcapOf(token.price, token.supply);
  const holdUsd = (pos?.amount ?? 0) * token.price;
  const pnl = holdUsd - (pos?.costUsd ?? 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">{token.name}</p>
          <h1 className="font-display text-4xl italic">${token.ticker}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{categoryLabel(token.category)}</Badge>
            <StatusChip token={token} />
            {token.status === "live" ? <LpBadge locked={token.lpLocked} /> : null}
          </div>
        </div>
        {token.status === "live" ? (
          <div className="text-right">
            <div className="tabular font-display text-3xl">
              {formatUsd(token.price, { micro: true })}
            </div>
            <div className={`tabular text-sm ${up ? "text-up" : "text-down"}`}>{formatPct(ch)}</div>
          </div>
        ) : null}
      </div>

      <p className="mt-4 max-w-2xl text-sm text-muted">{token.pitch}</p>

      {token.status === "live" ? <PriceChart data={token.history} up={up} /> : null}

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Mcap" value={token.status === "live" ? formatCompactUsd(mcap) : "—"} />
        <Stat label="Volume" value={token.status === "live" ? formatCompactUsd(token.volume24h) : "—"} />
        <Stat label="Holders" value={String(token.holders)} />
        <Stat
          label="Pool TVL"
          value={pool ? formatCompactUsd(pool.base * 2) : "—"}
        />
      </dl>

      {token.status === "live" ? (
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="up" onClick={() => setSide("buy")}>
            Buy
          </Button>
          <Button variant="down" onClick={() => setSide("sell")}>
            Sell
          </Button>
        </div>
      ) : token.status === "raising" && campaign ? (
        <Button asChild className="mt-5 w-full">
          <Link href={`/campaigns/${campaign.id}`}>
            Back the campaign
          </Link>
        </Button>
      ) : token.status === "proposed" ? (
        <Button asChild className="mt-5 w-full" variant="outline">
          <Link href="/proposals">Vote to open the campaign</Link>
        </Button>
      ) : null}

      {pos && pos.amount > 0 ? (
        <p className="mt-3 text-sm text-muted">
          You hold {formatQty(pos.amount)} · {formatUsd(holdUsd)} ·{" "}
          <span className={pnl >= 0 ? "text-up" : "text-down"}>{formatUsd(pnl, { sign: true })}</span>
        </p>
      ) : null}

      {lpVotes.length > 0 ? (
        <div className="mt-5 rounded-xl bg-card p-4 shadow-card">
          <h2 className="text-xs tracking-wide text-muted uppercase">LP rights</h2>
          <ul className="mt-2 space-y-2">
            {lpVotes.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{p.title}</span>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/proposals/${p.id}`}>
                    Market
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Tabs defaultValue="tape" className="mt-8">
        <TabsList>
          <TabsTrigger value="tape">Tape</TabsTrigger>
          <TabsTrigger value="thesis">Thesis</TabsTrigger>
        </TabsList>
        <TabsContent value="tape">
          <div className="flex flex-col gap-3">
            {trades.length === 0 ? (
              <p className="text-sm text-muted">No prints yet.</p>
            ) : (
              trades.map((t) => <FeedCard key={t.id} trade={t} />)
            )}
          </div>
        </TabsContent>
        <TabsContent value="thesis">
          <div className="flex flex-col gap-3">
            {trades.filter((t) => t.thesis).length === 0 ? (
              <p className="text-sm text-muted">No written theses on this pool yet.</p>
            ) : (
              trades
                .filter((t) => t.thesis)
                .map((t) => <ThesisRow key={t.id} tradeId={t.id} />)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {side ? (
        <TradeDialog open onOpenChange={(v) => !v && setSide(null)} token={token} side={side} />
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card p-3 shadow-card">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 tabular text-sm font-medium">{value}</div>
    </div>
  );
}

function ThesisRow({ tradeId }: { tradeId: string }) {
  const trade = useWeirStore((s) => s.trades.find((t) => t.id === tradeId));
  const trader = useWeirStore((s) => (trade ? s.traders[trade.traderId] : undefined));
  if (!trade || !trader || !trade.thesis) return null;
  return (
    <article className="rounded-xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <TraderChip trader={trader} size="sm" />
        <span className={trade.side === "buy" ? "text-xs text-up" : "text-xs text-down"}>
          {trade.side} {formatUsd(trade.usd)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{trade.thesis}</p>
    </article>
  );
}

function PriceChart({ data, up }: { data: number[]; up: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const series = useMemo(() => data.map((p, i) => ({ i, p })), [data]);
  const stroke = up ? "var(--color-up)" : "var(--color-down)";
  if (!ready || series.length < 2) {
    return <div className="mt-6 h-52 rounded-xl bg-card shadow-card" />;
  }
  return (
    <div className="mt-6 h-52 rounded-xl bg-card p-2 shadow-card">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "none",
              boxShadow: "var(--shadow-card)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(v) => [formatUsd(Number(v), { micro: true }), "Price"]}
            labelFormatter={() => ""}
          />
          <Area type="monotone" dataKey="p" stroke={stroke} fill={stroke} fillOpacity={0.12} strokeWidth={1.8} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
