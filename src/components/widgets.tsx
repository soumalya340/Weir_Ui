"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Lock, Unlock } from "lucide-react";
import { useMemo, useState } from "react";
import { Identicon, Sparkline } from "@/components/marks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  categoryLabel,
  changeFrom,
  formatAgo,
  formatCompactUsd,
  formatPct,
  formatUsd,
  mcapOf,
} from "@/lib/weir/format";
import { futarchyPrice, useWeirStore } from "@/lib/weir/store";
import type { Campaign, Proposal, Token, Trade, Trader } from "@/lib/weir/types";

const SIZES = [25, 50, 100, 250, 500];

export function LiveDot({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="weir-live size-1.5 rounded-full bg-up" />
      {label}
    </span>
  );
}

export function StatusChip({ token }: { token: Token }) {
  if (token.status === "live")
    return <Badge tone={token.lpLocked ? "accent" : "down"}>{token.lpLocked ? "LP locked" : "LP unlocked"}</Badge>;
  if (token.status === "raising") return <Badge tone="solid">Raising</Badge>;
  if (token.status === "proposed") return <Badge>Vote</Badge>;
  return <Badge tone="down">Failed</Badge>;
}

export function TokenLink({ token, className }: { token: Token; className?: string }) {
  return (
    <Link
      href={`/token/${token.id}`}
      className={cn("font-medium tracking-wide hover:text-accent", className)}
    >
      ${token.ticker}
    </Link>
  );
}

export function TraderChip({ trader, size = "md" }: { trader: Trader; size?: "sm" | "md" }) {
  return (
    <Link href={`/traders/${trader.id}`} className="inline-flex min-h-11 items-center gap-2">
      <Identicon id={trader.id} className={size === "sm" ? "size-6" : "size-8"} />
      <span className="text-sm font-medium">{trader.handle}</span>
    </Link>
  );
}

export function AmountPicker({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SIZES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(Math.min(n, Math.floor(max)))}
            className={cn(
              "h-11 min-w-16 rounded-md px-3 text-sm tabular shadow-card",
              value === n ? "bg-primary text-primary-foreground" : "bg-card-2 text-foreground",
            )}
          >
            ${n}
          </button>
        ))}
      </div>
      <Input
        type="number"
        min={1}
        max={Math.floor(max)}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Amount in USDC"
      />
    </div>
  );
}

export function TradeDialog({
  open,
  onOpenChange,
  token,
  side,
  copiedFrom,
  presetThesis,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  token: Token;
  side: Trade["side"];
  copiedFrom?: string;
  presetThesis?: string;
}) {
  const cash = useWeirStore((s) => s.cashUsd);
  const swap = useWeirStore((s) => s.swap);
  const positions = useWeirStore((s) => s.positions);
  const [usd, setUsd] = useState(100);
  const [err, setErr] = useState<string | null>(null);
  const pos = positions[token.id];
  const holdUsd = (pos?.amount ?? 0) * token.price;
  const max = side === "buy" ? cash : holdUsd;

  function submit() {
    const res = swap(token.id, side, usd, presetThesis, copiedFrom);
    if (res !== "ok") {
      setErr(res ?? "Could not fill.");
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {side === "buy" ? "Buy" : "Sell"} ${token.ticker}
        </DialogTitle>
        <DialogDescription>
          {formatUsd(token.price, { micro: token.price < 0.01 })} · {formatCompactUsd(mcapOf(token.price, token.supply))} mcap
        </DialogDescription>
        <div className="mt-4">
          <AmountPicker value={usd} onChange={setUsd} max={max} />
        </div>
        {err ? <p className="mt-2 text-sm text-down">{err}</p> : null}
        <Button
          className="mt-4 w-full"
          variant={side === "buy" ? "up" : "down"}
          onClick={submit}
        >
          {side === "buy" ? "Buy" : "Sell"} {formatUsd(usd)}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function FeedCard({ trade }: { trade: Trade }) {
  const trader = useWeirStore((s) => s.traders[trade.traderId]);
  const token = useWeirStore((s) => s.tokens[trade.tokenId]);
  const [open, setOpen] = useState(false);
  if (!trader || !token) return null;
  const up = trade.side === "buy";

  return (
    <article className="weir-in rounded-xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <TraderChip trader={trader} />
        <span className="tabular text-xs text-muted" suppressHydrationWarning>
          {formatAgo(trade.ts)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className={cn("inline-flex items-center gap-1 font-medium", up ? "text-up" : "text-down")}>
          {up ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
          {up ? "bought" : "sold"}
        </span>
        <TokenLink token={token} />
        <span className="tabular text-muted">{formatUsd(trade.usd)}</span>
        <span className="tabular text-muted">@ {formatUsd(trade.price, { micro: true })}</span>
        {trade.copiedFrom ? <Badge>copy</Badge> : null}
      </div>
      {trade.thesis ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">{trade.thesis}</p>
      ) : null}
      {token.status === "live" && trade.traderId !== "you" ? (
        <div className="mt-4">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Copy {trade.side}
          </Button>
        </div>
      ) : null}
      <TradeDialog
        open={open}
        onOpenChange={setOpen}
        token={token}
        side={trade.side}
        copiedFrom={trader.id}
        presetThesis={trade.thesis}
      />
    </article>
  );
}

export function TokenRow({ token }: { token: Token }) {
  const ch = changeFrom(token.history, token.price);
  const up = ch >= 0;
  return (
    <Link
      href={`/token/${token.id}`}
      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover"
    >
      <Identicon id={token.id} className="size-10 rounded-md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">${token.ticker}</span>
          <span className="truncate text-xs text-muted">{token.name}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge>{categoryLabel(token.category)}</Badge>
          <StatusChip token={token} />
        </div>
      </div>
      {token.status === "live" ? (
        <div className="hidden sm:block">
          <Sparkline data={token.history} up={up} className="h-8 w-20" />
        </div>
      ) : null}
      <div className="text-right">
        <div className="tabular text-sm">
          {token.status === "live" ? formatUsd(token.price, { micro: true }) : "—"}
        </div>
        {token.status === "live" ? (
          <div className={cn("tabular text-xs", up ? "text-up" : "text-down")}>{formatPct(ch)}</div>
        ) : (
          <div className="text-xs text-muted">{token.status}</div>
        )}
      </div>
    </Link>
  );
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const token = useWeirStore((s) => s.tokens[campaign.tokenId]);
  if (!token) return null;
  const pct = (campaign.raised / campaign.target) * 100;
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block rounded-xl bg-card p-4 shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">${token.ticker}</div>
          <div className="text-sm text-muted">{token.name}</div>
        </div>
        <Badge tone={campaign.status === "filled" ? "up" : "solid"}>{campaign.status}</Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-foreground/85">{token.pitch}</p>
      <Progress value={pct} className="mt-4" />
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span className="tabular">
          {formatCompactUsd(campaign.raised)} / {formatCompactUsd(campaign.target)}
        </span>
        <span>{campaign.backers} backers</span>
      </div>
    </Link>
  );
}

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const token = useWeirStore((s) => s.tokens[proposal.tokenId]);
  const prices = useMemo(() => futarchyPrice(proposal), [proposal]);
  const total = proposal.yesVotes + proposal.noVotes;
  const yesPct = proposal.kind === "futarchy" ? prices.yes * 100 : total ? (proposal.yesVotes / total) * 100 : 0;

  return (
    <Link
      href={`/proposals/${proposal.id}`}
      className="block rounded-xl bg-card p-4 shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover"
    >
      <div className="flex items-center gap-2">
        <Badge tone={proposal.kind === "futarchy" ? "accent" : "solid"}>
          {proposal.kind === "futarchy" ? "LP rights" : "Campaign"}
        </Badge>
        <Badge
          tone={
            proposal.status === "active" ? "solid" : proposal.status === "failed" ? "down" : "up"
          }
        >
          {proposal.status}
        </Badge>
        {token ? <span className="text-xs text-muted">${token.ticker}</span> : null}
      </div>
      <h3 className="mt-3 font-display text-lg">{proposal.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{proposal.body}</p>
      {proposal.status === "active" ? (
        <div className="mt-4">
          <Progress value={yesPct} barClassName={yesPct >= 50 ? "bg-up" : "bg-down"} />
          <div className="mt-2 flex justify-between text-xs text-muted">
            {proposal.kind === "futarchy" ? (
              <>
                <span className="tabular">YES {formatPct(prices.yes * 100, false)}</span>
                <span className="tabular">NO {formatPct(prices.no * 100, false)}</span>
              </>
            ) : (
              <>
                <span>
                  {proposal.yesVotes} yes · {proposal.noVotes} no
                </span>
                <span>
                  {total}/{proposal.quorum} quorum
                </span>
              </>
            )}
          </div>
        </div>
      ) : null}
    </Link>
  );
}

export function LpBadge({ locked }: { locked: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      {locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
      {locked ? "Community LP locked" : "LP may be pulled"}
    </span>
  );
}

export function PageHead({
  kicker,
  title,
  lede,
  action,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker ? <p className="text-xs tracking-wide text-muted uppercase">{kicker}</p> : null}
        <h1 className="mt-1 font-display text-3xl italic sm:text-4xl">{title}</h1>
        {lede ? <p className="mt-2 max-w-xl text-sm text-muted">{lede}</p> : null}
      </div>
      {action}
    </header>
  );
}
