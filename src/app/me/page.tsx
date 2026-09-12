"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Identicon } from "@/components/marks";
import { FeedCard } from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { formatPct, formatQty, formatUsd } from "@/lib/weir/format";
import { useWeirStore } from "@/lib/weir/store";

export default function Me() {
  const me = useWeirStore((s) => s.traders.you);
  const cash = useWeirStore((s) => s.cashUsd);
  const positions = useWeirStore((s) => s.positions);
  const tokens = useWeirStore((s) => s.tokens);
  const allTrades = useWeirStore((s) => s.trades);
  const follows = useWeirStore((s) => s.follows);
  const contributions = useWeirStore((s) => s.contributions);
  const campaigns = useWeirStore((s) => s.campaigns);
  const reset = useWeirStore((s) => s.reset);
  const trades = useMemo(() => allTrades.filter((t) => t.traderId === "you"), [allTrades]);

  const bags = Object.entries(positions)
    .map(([id, p]) => {
      const token = tokens[id];
      if (!token || p.amount <= 0) return null;
      const value = p.amount * token.price;
      const pnl = value - p.costUsd;
      return { token, p, value, pnl };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const equity = cash + bags.reduce((n, b) => n + b.value, 0);

  return (
    <div>
      <div className="mb-6 flex items-start gap-4">
        <Identicon id="you" className="size-14 rounded-lg" />
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">Desk</p>
          <h1 className="font-display text-3xl italic">{me?.handle ?? "you"}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">{me?.bio}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Equity" value={formatUsd(equity)} />
        <Stat label="USDC" value={formatUsd(cash)} />
        <Stat label="Open bags" value={String(bags.length)} />
      </dl>

      <h2 className="mt-8 font-display text-xl">Positions</h2>
      <div className="mt-3 flex flex-col gap-2">
        {bags.length === 0 ? (
          <p className="text-sm text-muted">No bags yet. Copy a print or back a raise.</p>
        ) : (
          bags.map(({ token, p, value, pnl }) => (
            <Link
              key={token.id}
              href={`/token/${token.id}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 shadow-card"
            >
              <div>
                <div className="font-medium">${token.ticker}</div>
                <div className="text-xs text-muted">{formatQty(p.amount)} tokens</div>
              </div>
              <div className="text-right">
                <div className="tabular text-sm">{formatUsd(value)}</div>
                <div className={`tabular text-xs ${pnl >= 0 ? "text-up" : "text-down"}`}>
                  {formatUsd(pnl, { sign: true })} · {formatPct(p.costUsd ? (pnl / p.costUsd) * 100 : 0)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {Object.keys(contributions).length > 0 ? (
        <>
          <h2 className="mt-8 font-display text-xl">Raises</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(contributions).map(([cid, usd]) => {
              const c = campaigns[cid];
              const t = c ? tokens[c.tokenId] : undefined;
              if (!c || !t) return null;
              return (
                <li key={cid} className="flex justify-between rounded-lg bg-card px-3 py-2 shadow-card">
                  <Link href={`/campaigns/${cid}`}>
                    ${t.ticker}
                  </Link>
                  <span className="tabular text-muted">{formatUsd(usd)}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <h2 className="mt-8 font-display text-xl">Following</h2>
      <p className="mt-2 text-sm text-muted">
        {follows.length === 0 ? (
          <>
            Nobody yet.{" "}
            <Link href="/traders" className="text-foreground underline-offset-2 hover:underline">
              Open the board
            </Link>
            .
          </>
        ) : (
          follows.map((id, i) => (
            <span key={id}>
              {i > 0 ? ", " : ""}
              <Link href={`/traders/${id}`} className="text-foreground">
                {id}
              </Link>
            </span>
          ))
        )}
      </p>

      <h2 className="mt-8 font-display text-xl">Your tape</h2>
      <div className="mt-3 flex flex-col gap-3">
        {trades.length === 0 ? (
          <p className="text-sm text-muted">No prints under this desk yet.</p>
        ) : (
          trades.map((t) => <FeedCard key={t.id} trade={t} />)
        )}
      </div>

      <Button
        variant="ghost"
        className="mt-10"
        onClick={() => {
          reset();
        }}
      >
        Reset demo desk
      </Button>
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
