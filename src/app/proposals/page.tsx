"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHead, ProposalCard } from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeirStore } from "@/lib/weir/store";

export default function Proposals() {
  const proposalMap = useWeirStore((s) => s.proposals);
  const [tab, setTab] = useState("campaign");

  const list = useMemo(() => {
    return Object.values(proposalMap)
      .filter((p) => (tab === "campaign" ? p.kind === "campaign" : p.kind === "futarchy"))
      .sort((a, b) => {
        const rank = (s: string) => (s === "active" ? 2 : s === "executed" ? 1 : 0);
        return rank(b.status) - rank(a.status) || b.endsAt - a.endsAt;
      });
  }, [proposalMap, tab]);

  return (
    <div>
      <PageHead
        kicker="Governance"
        title="Two votes. One room."
        lede="Campaign votes decide who may raise. Futarchy markets decide whether community LP can ever leave the pool."
        action={
          <Button asChild>
            <Link href="/launch">New proposal</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="campaign">Launch a campaign</TabsTrigger>
          <TabsTrigger value="futarchy">LP rights</TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="mt-4 max-w-2xl text-sm text-muted">
        {tab === "campaign"
          ? "A project needs a yes from the room before a raise can open. Quorum, then majority. If it wins, the campaign and the pool queue start."
          : "Holders own the LP. YES is a forecast that the desk should be allowed to pull liquidity. NO keeps the weir closed. The market is the vote."}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {list.map((p) => (
          <ProposalCard key={p.id} proposal={p} />
        ))}
      </div>
    </div>
  );
}
