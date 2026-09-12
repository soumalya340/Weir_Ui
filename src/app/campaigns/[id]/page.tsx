"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AmountPicker, LpBadge, PageHead, StatusChip } from "@/components/widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { categoryLabel, formatCompactUsd, formatLeft, formatUsd } from "@/lib/weir/format";
import { useWeirStore } from "@/lib/weir/store";

export default function CampaignPage() {
  const { id } = useParams() as { id: string };
  const campaign = useWeirStore((s) => s.campaigns[id]);
  const token = useWeirStore((s) => (campaign ? s.tokens[campaign.tokenId] : undefined));
  const cash = useWeirStore((s) => s.cashUsd);
  const contribute = useWeirStore((s) => s.contribute);
  const mine = useWeirStore((s) => s.contributions[id] ?? 0);
  const [usd, setUsd] = useState(100);

  if (!campaign || !token) {
    return (
      <div>
        <PageHead title="Missing campaign" />
        <Button asChild variant="outline">
          <Link href="/campaigns">All campaigns</Link>
        </Button>
      </div>
    );
  }

  const pct = (campaign.raised / campaign.target) * 100;
  const remaining = Math.max(0, campaign.target - campaign.raised);

  function onBack() {
    const res = contribute(campaign.id, usd);
    if (res === "filled") toast.success("Campaign filled. Pool is live — community holds LP.");
    else if (res === "ok") toast.success(`Backed with ${formatUsd(usd)}.`);
    else toast.error(res ?? "Could not back.");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHead kicker="Campaign" title={token.name} lede={token.pitch} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">${token.ticker}</span>
        <Badge>{categoryLabel(token.category)}</Badge>
        <StatusChip token={token} />
        <LpBadge locked={token.lpLocked} />
      </div>

      <section className="mt-6 rounded-xl bg-card p-5 shadow-card">
        <Progress value={pct} className="h-2" />
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
          <span className="tabular">
            {formatCompactUsd(campaign.raised)} raised of {formatCompactUsd(campaign.target)}
          </span>
          <span className="text-muted" suppressHydrationWarning>
            {campaign.backers} backers · {formatLeft(campaign.endsAt)}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted">
            35% of supply goes to backers, 40% seeds the pool with the USDC raise, 25% sits with the studio. LP rights stay with the room unless a futarchy market says otherwise.
        </p>
        {campaign.status === "live" ? (
          <div className="mt-5 space-y-3">
            <AmountPicker value={usd} onChange={setUsd} max={Math.min(cash, remaining || cash)} />
            <Button className="w-full" onClick={onBack}>
              Back this raise
            </Button>
            {mine > 0 ? (
              <p className="text-sm text-muted">You are in for {formatUsd(mine)}.</p>
            ) : null}
          </div>
        ) : (
          <Button asChild className="mt-5 w-full">
            <Link href={`/token/${token.id}`}>
              Trade the pool
            </Link>
          </Button>
        )}
      </section>
    </div>
  );
}
