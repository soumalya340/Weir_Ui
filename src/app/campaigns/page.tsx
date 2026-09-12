"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CampaignCard, PageHead } from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { useWeirStore } from "@/lib/weir/store";

export default function Campaigns() {
  const campaignMap = useWeirStore((s) => s.campaigns);
  const campaigns = useMemo(
    () =>
      Object.values(campaignMap).sort(
        (a, b) => Number(b.status === "live") - Number(a.status === "live"),
      ),
    [campaignMap],
  );

  return (
    <div>
      <PageHead
        kicker="Raises"
        title="The pool waits on the room."
        lede="A campaign only exists after a proposal wins. Fill it and the LP is seeded — owned by holders, not the desk."
        action={
          <Button asChild variant="outline">
            <Link href="/launch">Propose a raise</Link>
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {campaigns.length === 0 ? (
          <p className="rounded-xl bg-card p-6 text-sm text-muted shadow-card">
            No campaigns yet. Pass a proposal to open one.
          </p>
        ) : (
          campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
        )}
      </div>
    </div>
  );
}
