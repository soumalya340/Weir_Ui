"use client";
import { useEffect } from "react";
import { useWeirStore, type WeirState } from "@/lib/weir/store";

const KEY = "weir-v1";

function snapshot(s: WeirState) {
  return {
    traders: s.traders,
    tokens: s.tokens,
    pools: s.pools,
    proposals: s.proposals,
    campaigns: s.campaigns,
    trades: s.trades,
    follows: s.follows,
    userVotes: s.userVotes,
    futarchyShares: s.futarchyShares,
    contributions: s.contributions,
    cashUsd: s.cashUsd,
    positions: s.positions,
    seq: s.seq,
  };
}

export function WeirProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) useWeirStore.setState(JSON.parse(raw) as Partial<WeirState>);
    } catch {
      /* ignore bad cache */
    }
    const unsub = useWeirStore.subscribe((s) => {
      try {
        localStorage.setItem(KEY, JSON.stringify(snapshot(s)));
      } catch {
        /* quota */
      }
    });
    const id = window.setInterval(() => {
      useWeirStore.getState().tick();
    }, 3200);
    return () => {
      unsub();
      window.clearInterval(id);
    };
  }, []);
  return children;
}
