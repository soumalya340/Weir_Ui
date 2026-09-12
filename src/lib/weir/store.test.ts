import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { futarchyPrice, useWeirStore } from "./store";

beforeEach(() => {
  useWeirStore.getState().reset();
});

describe("weir store seed", () => {
  it("starts with seeded cash and live tokens", () => {
    const s = useWeirStore.getState();
    assert.equal(s.cashUsd, 8420);
    assert.ok(s.tokens.aether);
    assert.equal(s.tokens.aether.status, "live");
    assert.ok(s.pools.aether);
    assert.ok(Object.keys(s.proposals).length > 0);
  });
});

describe("launch", () => {
  it("creates a proposal id for a valid launch", () => {
    const res = useWeirStore.getState().launch({
      name: "Harbor Test",
      ticker: "HTST",
      category: "utility",
      pitch: "A real room utility token with locked community LP at launch.",
      raiseTarget: 12000,
      raiseDays: 10,
      lpLocked: true,
    });
    assert.ok("proposalId" in res, `expected proposalId, got ${JSON.stringify(res)}`);
    const s = useWeirStore.getState();
    assert.ok(s.proposals[res.proposalId]);
    assert.equal(s.proposals[res.proposalId].status, "active");
    assert.ok(s.tokens.htst);
    assert.equal(s.tokens.htst.ticker, "HTST");
    assert.equal(s.userVotes[res.proposalId], "yes");
  });

  it("rejects short tickers", () => {
    const res = useWeirStore.getState().launch({
      name: "X",
      ticker: "AB",
      category: "art",
      pitch: "A real room utility token with locked community LP at launch.",
      raiseTarget: 5000,
      raiseDays: 7,
      lpLocked: true,
    });
    assert.ok("error" in res);
  });
});

describe("swap", () => {
  it("buy reduces cash and opens a position", () => {
    const before = useWeirStore.getState();
    const cashBefore = before.cashUsd;
    const res = before.swap("aether", "buy", 100);
    assert.equal(res, "ok");
    const after = useWeirStore.getState();
    assert.equal(after.cashUsd, cashBefore - 100);
    assert.ok((after.positions.aether?.amount ?? 0) > 0);
    assert.ok(after.trades[0]?.traderId === "you");
    assert.equal(after.trades[0]?.side, "buy");
  });

  it("sell returns cash when holding tokens", () => {
    useWeirStore.getState().swap("aether", "buy", 200);
    const mid = useWeirStore.getState();
    const holdUsd = (mid.positions.aether?.amount ?? 0) * mid.tokens.aether.price;
    const sellUsd = Math.min(50, Math.floor(holdUsd));
    const cashMid = mid.cashUsd;
    const res = mid.swap("aether", "sell", sellUsd);
    assert.equal(res, "ok");
    const after = useWeirStore.getState();
    assert.ok(after.cashUsd > cashMid);
  });
});

describe("vote / contribute / futarchy", () => {
  it("records a campaign vote", () => {
    const res = useWeirStore.getState().vote("p-wave", "yes");
    assert.ok(res === "ok" || res === "passed" || res === "failed");
    assert.equal(useWeirStore.getState().userVotes["p-wave"], "yes");
  });

  it("contribute reduces cash on a live campaign", () => {
    const before = useWeirStore.getState();
    const cashBefore = before.cashUsd;
    const res = before.contribute("c-nova", 50);
    assert.ok(res === "ok" || res === "filled");
    const after = useWeirStore.getState();
    assert.equal(after.cashUsd, cashBefore - 50);
    assert.equal(after.contributions["c-nova"], 50);
  });

  it("buyFutarchy spends cash on YES/NO pools", () => {
    const before = useWeirStore.getState();
    const cashBefore = before.cashUsd;
    const yesBefore = before.proposals["p-echo-lp"].yesPool ?? 0;
    const res = before.buyFutarchy("p-echo-lp", "yes", 25);
    assert.equal(res, "ok");
    const after = useWeirStore.getState();
    assert.equal(after.cashUsd, cashBefore - 25);
    assert.equal(after.proposals["p-echo-lp"].yesPool, yesBefore + 25);
  });
});

describe("follow / copyTrade", () => {
  it("follow adds a desk", () => {
    useWeirStore.getState().unfollow("nori");
    useWeirStore.getState().follow("nori");
    assert.ok(useWeirStore.getState().follows.includes("nori"));
  });

  it("copyTrade mirrors another desk print", () => {
    const trade = useWeirStore.getState().trades.find((t) => t.traderId !== "you" && t.tokenId === "aether");
    assert.ok(trade);
    const cashBefore = useWeirStore.getState().cashUsd;
    const res = useWeirStore.getState().copyTrade(trade.id, 40);
    assert.equal(res, "ok");
    assert.equal(useWeirStore.getState().cashUsd, cashBefore - 40);
  });
});

describe("futarchyPrice", () => {
  it("returns pool-weighted prices", () => {
    const p = futarchyPrice({ yesPool: 2500, noPool: 7500 });
    assert.equal(p.yes, 0.25);
    assert.equal(p.no, 0.75);
  });
});
