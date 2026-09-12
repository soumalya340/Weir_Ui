"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AmountPicker, PageHead, TokenLink } from "@/components/widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCompactUsd, formatLeft, formatPct, formatUsd } from "@/lib/weir/format";
import { futarchyPrice, useWeirStore } from "@/lib/weir/store";

export default function ProposalPage() {
  const { id } = useParams() as { id: string };
  const proposal = useWeirStore((s) => s.proposals[id]);
  const token = useWeirStore((s) => (proposal ? s.tokens[proposal.tokenId] : undefined));
  const creator = useWeirStore((s) => (proposal ? s.traders[proposal.creatorId] : undefined));
  const userVote = useWeirStore((s) => s.userVotes[id]);
  const vote = useWeirStore((s) => s.vote);
  const buyFutarchy = useWeirStore((s) => s.buyFutarchy);
  const shares = useWeirStore((s) => s.futarchyShares[id]);
  const cash = useWeirStore((s) => s.cashUsd);
  const [usd, setUsd] = useState(100);

  if (!proposal) {
    return (
      <div>
        <PageHead title="Missing proposal" lede="That vote is not on the board." />
        <Button asChild variant="outline">
          <Link href="/proposals">Back to proposals</Link>
        </Button>
      </div>
    );
  }

  const prices = futarchyPrice(proposal);
  const total = proposal.yesVotes + proposal.noVotes;
  const yesPct =
    proposal.kind === "futarchy" ? prices.yes * 100 : total ? (proposal.yesVotes / total) * 100 : 0;

  function onVote(side: "yes" | "no") {
    const res = vote(proposal.id, side);
    if (res === "passed") toast.success("Proposal passed. Campaign is live.");
    else if (res === "failed") toast.message("Proposal failed.");
    else if (res === "ok") toast.success("Vote recorded.");
    else toast.error(res ?? "Could not vote.");
  }

  function onMarket(side: "yes" | "no") {
    const res = buyFutarchy(proposal.id, side, usd);
    if (res === "ok") toast.success(`Bought ${side.toUpperCase()} on the LP market.`);
    else toast.error(res ?? "Could not fill.");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHead
        kicker={proposal.kind === "futarchy" ? "Futarchy · LP rights" : "Campaign vote"}
        title={proposal.title}
        lede={proposal.body}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={proposal.kind === "futarchy" ? "accent" : "solid"}>
          {proposal.kind === "futarchy" ? "LP rights" : "Campaign"}
        </Badge>
        <Badge>{proposal.status}</Badge>
        {token ? <TokenLink token={token} /> : null}
        {creator ? (
          <Link href={`/traders/${creator.id}`} className="text-sm text-muted">
            by {creator.handle}
          </Link>
        ) : null}
        <span className="text-sm text-muted" suppressHydrationWarning>
          {formatLeft(proposal.endsAt)}
        </span>
      </div>

      {proposal.kind === "campaign" ? (
        <section className="mt-6 rounded-xl bg-card p-5 shadow-card">
          <div className="flex justify-between text-sm">
            <span>Yes {proposal.yesVotes}</span>
            <span>No {proposal.noVotes}</span>
          </div>
          <Progress value={yesPct} className="mt-3 h-2" barClassName={yesPct >= 50 ? "bg-up" : "bg-down"} />
          <p className="mt-3 text-xs text-muted">
            {total}/{proposal.quorum} toward quorum
            {proposal.raiseTarget
              ? ` · raise ${formatCompactUsd(proposal.raiseTarget)} over ${proposal.raiseDays}d`
              : null}
          </p>
          {proposal.status === "active" ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="up" disabled={Boolean(userVote)} onClick={() => onVote("yes")}>
                Vote yes
              </Button>
              <Button variant="down" disabled={Boolean(userVote)} onClick={() => onVote("no")}>
                Vote no
              </Button>
            </div>
          ) : proposal.status === "executed" ? (
            <Button asChild className="mt-5 w-full" variant="outline">
              <Link href="/campaigns">Open campaigns</Link>
            </Button>
          ) : null}
          {userVote ? <p className="mt-3 text-sm text-muted">You voted {userVote}.</p> : null}
        </section>
      ) : (
        <section className="mt-6 space-y-3">
          <p className="text-sm text-muted">
            Buying YES is a bet that the desk should be allowed to pull LP. Buying NO is a bet the pool stays in the weir. The higher-priced side is the room’s forecast.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <MarketSide
              label="YES · allow pull"
              price={prices.yes}
              pool={proposal.yesPool ?? 0}
              tone="down"
            />
            <MarketSide
              label="NO · keep locked"
              price={prices.no}
              pool={proposal.noPool ?? 0}
              tone="up"
            />
          </div>
          {proposal.status === "active" ? (
            <div className="rounded-xl bg-card p-5 shadow-card">
              <AmountPicker value={usd} onChange={setUsd} max={cash} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="down" onClick={() => onMarket("yes")}>
                  Buy YES
                </Button>
                <Button variant="up" onClick={() => onMarket("no")}>
                  Buy NO
                </Button>
              </div>
              {shares ? (
                <p className="mt-3 text-xs text-muted">
                  Your shares · YES {shares.yes.toFixed(2)} · NO {shares.no.toFixed(2)}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Resolved. {prices.yes > prices.no ? "LP may be pulled." : "LP stays locked with the community."}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function MarketSide({
  label,
  price,
  pool,
  tone,
}: {
  label: string;
  price: number;
  pool: number;
  tone: "up" | "down";
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-2 font-display text-3xl tabular ${tone === "up" ? "text-up" : "text-down"}`}>
        {formatPct(price * 100, false)}
      </div>
      <div className="mt-1 text-xs text-muted">{formatUsd(pool)} in the pot</div>
    </div>
  );
}
