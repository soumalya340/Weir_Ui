"use client";

import { useMemo, useState } from "react";
import { PageHead, TokenRow } from "@/components/widgets";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeirStore } from "@/lib/weir/store";
import type { TokenStatus } from "@/lib/weir/types";

export default function Discover() {
  const tokenMap = useWeirStore((s) => s.tokens);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return Object.values(tokenMap)
      .filter((t) => {
        if (tab === "live") return t.status === "live";
        if (tab === "raising") return t.status === "raising";
        if (tab === "vote") return t.status === "proposed";
        return t.status !== "failed";
      })
      .filter((t) => {
        if (!query) return true;
        return (
          t.ticker.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query) ||
          t.pitch.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => rank(b.status) - rank(a.status) || b.volume24h - a.volume24h);
  }, [tokenMap, q, tab]);

  return (
    <div>
      <PageHead
        kicker="Discover"
        title="Utility, not vapor."
        lede="Studios, co-ops, labels. If the room votes it through, the campaign opens. If it fills, the pool is born."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ticker, studio, pitch"
          className="sm:max-w-sm"
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="raising">Raising</TabsTrigger>
            <TabsTrigger value="vote">Vote</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col gap-2">
        {list.length === 0 ? (
          <p className="rounded-xl bg-card p-6 text-sm text-muted shadow-card">No tokens match.</p>
        ) : (
          list.map((t) => <TokenRow key={t.id} token={t} />)
        )}
      </div>
    </div>
  );
}

function rank(status: TokenStatus) {
  if (status === "raising") return 3;
  if (status === "proposed") return 2;
  if (status === "live") return 1;
  return 0;
}
