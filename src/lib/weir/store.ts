import { create } from "zustand";
import { makeSeed, type WeirSnapshot } from "./seed";
import type { Campaign, LaunchInput, Trade, TradeSide } from "./types";
import { mulberry32 } from "./prng";

const FEE = 0.01;
const SIM_THESES = [
  "Size is a clip. Watching the vote.",
  "Locked LP is the whole pitch.",
  "Room is loud. Still in.",
  "Fading this print.",
  "Allocation first, chart second.",
  "Utility actually does a job.",
  "Copying the slow hands.",
  "Out if the futarchy flips.",
];

type WeirActions = {
  tick: () => void;
  follow: (id: string) => void;
  unfollow: (id: string) => void;
  vote: (proposalId: string, side: "yes" | "no") => string | null;
  buyFutarchy: (proposalId: string, side: "yes" | "no", usd: number) => string | null;
  contribute: (campaignId: string, usd: number) => string | null;
  swap: (tokenId: string, side: TradeSide, usd: number, thesis?: string, copiedFrom?: string) => string | null;
  copyTrade: (tradeId: string, usd: number) => string | null;
  launch: (input: LaunchInput) => { proposalId: string } | { error: string };
  reset: () => void;
};

export type WeirState = WeirSnapshot & WeirActions;

function nextId(state: WeirSnapshot, p: string) {
  const seq = state.seq + 1;
  return { seq, id: `${p}${seq}` };
}

function applySwap(
  state: WeirSnapshot,
  tokenId: string,
  side: TradeSide,
  usd: number,
): { base: number; quote: number; tokens: number; price: number; usdOut: number } | null {
  const token = state.tokens[tokenId];
  const pool = state.pools[tokenId];
  if (!token || token.status !== "live" || !pool) return null;
  const k = pool.base * pool.quote;
  if (side === "buy") {
    const dx = usd * (1 - FEE);
    const base = pool.base + dx;
    const quote = k / base;
    const tokens = pool.quote - quote;
    const price = base / quote;
    return { base, quote, tokens, price, usdOut: usd };
  }
  const priceNow = pool.base / pool.quote;
  const tokensIn = usd / priceNow;
  const quote = pool.quote + tokensIn * (1 - FEE);
  const base = k / quote;
  const usdOut = pool.base - base;
  const price = base / quote;
  return { base, quote, tokens: -tokensIn, price, usdOut };
}

function settleCampaign(state: WeirSnapshot, campaign: Campaign): Partial<WeirSnapshot> {
  const token = state.tokens[campaign.tokenId];
  if (!token) return {};
  const raised = campaign.raised;
  const lpTokens = token.supply * 0.4;
  const saleTokens = token.supply * 0.35;
  const userCut = state.contributions[campaign.id] ?? 0;
  const userTokens = raised > 0 ? saleTokens * (userCut / raised) : 0;
  const price = lpTokens > 0 ? raised / lpTokens : 0;
  const history = [...token.history, price].slice(-48);
  const positions = { ...state.positions };
  if (userTokens > 0) {
    const prev = positions[token.id] ?? { amount: 0, costUsd: 0 };
    positions[token.id] = {
      amount: prev.amount + userTokens,
      costUsd: prev.costUsd + userCut,
    };
  }
  return {
    tokens: {
      ...state.tokens,
      [token.id]: {
        ...token,
        status: "live",
        price,
        holders: campaign.backers,
        history,
        volume24h: raised * 0.1,
      },
    },
    pools: {
      ...state.pools,
      [token.id]: { tokenId: token.id, base: raised, quote: lpTokens },
    },
    campaigns: {
      ...state.campaigns,
      [campaign.id]: { ...campaign, status: "filled", raised },
    },
    positions,
  };
}

function maybePassProposal(state: WeirSnapshot, proposalId: string): Partial<WeirSnapshot> {
  const p = state.proposals[proposalId];
  if (!p || p.status !== "active" || p.kind !== "campaign") return {};
  const total = p.yesVotes + p.noVotes;
  if (total < p.quorum) return {};
  if (p.yesVotes <= p.noVotes) {
    return {
      proposals: { ...state.proposals, [p.id]: { ...p, status: "failed" } },
      tokens: state.tokens[p.tokenId]
        ? { ...state.tokens, [p.tokenId]: { ...state.tokens[p.tokenId]!, status: "failed" } }
        : state.tokens,
    };
  }
  const { seq, id: campaignId } = nextId(state, "c");
  const campaign: Campaign = {
    id: campaignId,
    tokenId: p.tokenId,
    proposalId: p.id,
    raised: 0,
    target: p.raiseTarget ?? 10000,
    backers: 0,
    endsAt: Date.now() + (p.raiseDays ?? 10) * 86_400_000,
    status: "live",
  };
  const token = state.tokens[p.tokenId];
  return {
    seq,
    proposals: { ...state.proposals, [p.id]: { ...p, status: "executed" } },
    campaigns: { ...state.campaigns, [campaignId]: campaign },
    tokens: token
      ? { ...state.tokens, [token.id]: { ...token, status: "raising" } }
      : state.tokens,
  };
}

function maybeResolveFutarchy(state: WeirSnapshot, proposalId: string): Partial<WeirSnapshot> {
  const p = state.proposals[proposalId];
  if (!p || p.kind !== "futarchy" || p.status !== "active") return {};
  if (Date.now() < p.endsAt) return {};
  const yes = p.yesPool ?? 0;
  const no = p.noPool ?? 0;
  const passed = yes > no;
  const token = state.tokens[p.tokenId];
  return {
    proposals: { ...state.proposals, [p.id]: { ...p, status: "executed" } },
    tokens: token
      ? { ...state.tokens, [token.id]: { ...token, lpLocked: passed ? false : token.lpLocked } }
      : state.tokens,
  };
}

const THESES_N = SIM_THESES.length;

export const useWeirStore = create<WeirState>()((set, get) => ({
      ...makeSeed(),

      reset: () => set({ ...makeSeed(), seq: 100 }),

      follow: (id) =>
        set((s) => {
          if (s.follows.includes(id) || id === "you") return s;
          const t = s.traders[id];
          return {
            follows: [...s.follows, id],
            traders: t
              ? { ...s.traders, [id]: { ...t, followers: t.followers + 1 } }
              : s.traders,
          };
        }),

      unfollow: (id) =>
        set((s) => {
          const t = s.traders[id];
          return {
            follows: s.follows.filter((x) => x !== id),
            traders: t
              ? { ...s.traders, [id]: { ...t, followers: Math.max(0, t.followers - 1) } }
              : s.traders,
          };
        }),

      vote: (proposalId, side) => {
        const s = get();
        if (s.userVotes[proposalId]) return "Already voted.";
        const p = s.proposals[proposalId];
        if (!p || p.status !== "active" || p.kind !== "campaign") return "Vote is closed.";
        const next = {
          ...p,
          yesVotes: p.yesVotes + (side === "yes" ? 1 : 0),
          noVotes: p.noVotes + (side === "no" ? 1 : 0),
        };
        let patch: Partial<WeirSnapshot> = {
          proposals: { ...s.proposals, [p.id]: next },
          userVotes: { ...s.userVotes, [proposalId]: side },
        };
        const merged = { ...s, ...patch, proposals: patch.proposals! };
        patch = { ...patch, ...maybePassProposal(merged, p.id) };
        set(patch);
        const after = get().proposals[proposalId];
        if (after?.status === "executed") return "passed";
        if (after?.status === "failed") return "failed";
        return "ok";
      },

      buyFutarchy: (proposalId, side, usd) => {
        const s = get();
        if (usd <= 0) return "Enter an amount.";
        if (s.cashUsd < usd) return "Not enough USDC.";
        const p = s.proposals[proposalId];
        if (!p || p.kind !== "futarchy" || p.status !== "active") return "Market is closed.";
        const yesPool = (p.yesPool ?? 0) + (side === "yes" ? usd : 0);
        const noPool = (p.noPool ?? 0) + (side === "no" ? usd : 0);
        const yesP = yesPool / Math.max(1, yesPool + noPool);
        const sharesAdd = usd / Math.max(0.05, side === "yes" ? yesP : 1 - yesP);
        const prev = s.futarchyShares[proposalId] ?? { yes: 0, no: 0 };
        const shares = {
          yes: prev.yes + (side === "yes" ? sharesAdd : 0),
          no: prev.no + (side === "no" ? sharesAdd : 0),
        };
        const nextP = { ...p, yesPool, noPool };
        let patch: Partial<WeirSnapshot> = {
          cashUsd: s.cashUsd - usd,
          proposals: { ...s.proposals, [p.id]: nextP },
          futarchyShares: { ...s.futarchyShares, [proposalId]: shares },
        };
        const merged = { ...s, ...patch, proposals: patch.proposals! };
        patch = { ...patch, ...maybeResolveFutarchy(merged, p.id) };
        set(patch);
        return "ok";
      },

      contribute: (campaignId, usd) => {
        const s = get();
        if (usd <= 0) return "Enter an amount.";
        if (s.cashUsd < usd) return "Not enough USDC.";
        const c = s.campaigns[campaignId];
        if (!c || c.status !== "live") return "Campaign is closed.";
        const add = Math.min(usd, Math.max(0, c.target - c.raised));
        if (add <= 0) return "Campaign is already filled.";
        const first = !(s.contributions[campaignId] > 0);
        const raised = c.raised + add;
        const nextC: Campaign = {
          ...c,
          raised,
          backers: c.backers + (first ? 1 : 0),
        };
        let patch: Partial<WeirSnapshot> = {
          cashUsd: s.cashUsd - add,
          contributions: {
            ...s.contributions,
            [campaignId]: (s.contributions[campaignId] ?? 0) + add,
          },
          campaigns: { ...s.campaigns, [c.id]: nextC },
        };
        if (raised >= c.target) {
          const merged = { ...s, ...patch, campaigns: patch.campaigns! };
          patch = { ...patch, ...settleCampaign(merged, { ...nextC, raised }) };
        }
        set(patch);
        return raised >= c.target ? "filled" : "ok";
      },

      swap: (tokenId, side, usd, thesis, copiedFrom) => {
        const s = get();
        if (usd <= 0) return "Enter an amount.";
        const token = s.tokens[tokenId];
        if (!token || token.status !== "live") return "Token is not live.";
        const result = applySwap(s, tokenId, side, usd);
        if (!result) return "No pool.";
        if (side === "buy" && s.cashUsd < usd) return "Not enough USDC.";
        const pos = s.positions[tokenId] ?? { amount: 0, costUsd: 0 };
        if (side === "sell") {
          const haveUsd = pos.amount * (s.pools[tokenId]!.base / s.pools[tokenId]!.quote);
          if (haveUsd + 1e-6 < usd) return "Not enough tokens.";
        }
        const { seq, id } = nextId(s, "t");
        const trade: Trade = {
          id,
          traderId: "you",
          tokenId,
          side,
          usd: side === "buy" ? usd : result.usdOut,
          price: result.price,
          thesis,
          ts: Date.now(),
          copiedFrom,
        };
        const nextPos =
          side === "buy"
            ? { amount: pos.amount + result.tokens, costUsd: pos.costUsd + usd }
            : {
                amount: Math.max(0, pos.amount + result.tokens),
                costUsd: pos.costUsd * (pos.amount <= 0 ? 0 : Math.max(0, pos.amount + result.tokens) / pos.amount),
              };
        const history = [...token.history, result.price].slice(-64);
        set({
          seq,
          cashUsd: side === "buy" ? s.cashUsd - usd : s.cashUsd + result.usdOut,
          pools: {
            ...s.pools,
            [tokenId]: { tokenId, base: result.base, quote: result.quote },
          },
          tokens: {
            ...s.tokens,
            [tokenId]: {
              ...token,
              price: result.price,
              history,
              volume24h: token.volume24h + usd,
              holders: side === "buy" && pos.amount <= 0 ? token.holders + 1 : token.holders,
            },
          },
          positions: { ...s.positions, [tokenId]: nextPos },
          trades: [trade, ...s.trades].slice(0, 80),
        });
        return "ok";
      },

      copyTrade: (tradeId, usd) => {
        const t = get().trades.find((x) => x.id === tradeId);
        if (!t) return "Trade is gone.";
        if (t.traderId === "you") return "That's yours.";
        return get().swap(t.tokenId, t.side, usd, t.thesis, t.traderId);
      },

      launch: (input) => {
        const s = get();
        const ticker = input.ticker.trim().toUpperCase().replace(/[^A-Z]/g, "");
        if (ticker.length < 3 || ticker.length > 8) return { error: "Ticker should be 3–8 letters." };
        const id = ticker.toLowerCase();
        if (s.tokens[id]) return { error: "That ticker is taken." };
        if (input.name.trim().length < 2) return { error: "Name the project." };
        if (input.pitch.trim().length < 24) return { error: "Pitch needs a little more room." };
        if (input.raiseTarget < 1000) return { error: "Raise target is too small." };
        const { seq, id: pid } = nextId(s, "p");
        const now = Date.now();
        set({
          seq,
          tokens: {
            ...s.tokens,
            [id]: {
              id,
              ticker,
              name: input.name.trim(),
              pitch: input.pitch.trim(),
              category: input.category,
              creatorId: "you",
              status: "proposed",
              supply: 1_000_000,
              price: 0,
              volume24h: 0,
              holders: 0,
              history: [],
              lpLocked: input.lpLocked,
              createdAt: now,
            },
          },
          proposals: {
            ...s.proposals,
            [pid]: {
              id: pid,
              kind: "campaign",
              tokenId: id,
              title: `Open the ${ticker} campaign`,
              body: input.pitch.trim(),
              creatorId: "you",
              status: "active",
              endsAt: now + 2 * 86_400_000,
              yesVotes: 1,
              noVotes: 0,
              quorum: 20,
              raiseTarget: input.raiseTarget,
              raiseDays: input.raiseDays,
            },
          },
          userVotes: { ...s.userVotes, [pid]: "yes" },
        });
        return { proposalId: pid };
      },

      tick: () => {
        const s = get();
        const rand = mulberry32((Date.now() ^ s.seq) >>> 0);
        const liveIds = Object.values(s.tokens)
          .filter((t) => t.status === "live" && s.pools[t.id])
          .map((t) => t.id);
        if (liveIds.length === 0) return;
        const tokenId = liveIds[Math.floor(rand() * liveIds.length)]!;
        const traderIds = Object.keys(s.traders).filter((id) => id !== "you");
        const traderId = traderIds[Math.floor(rand() * traderIds.length)]!;
        const side: TradeSide = rand() > 0.38 ? "buy" : "sell";
        const usd = Math.round((40 + rand() * 900) / 10) * 10;
        const result = applySwap(s, tokenId, side, usd);
        if (!result) return;
        const token = s.tokens[tokenId]!;
        const { seq, id } = nextId(s, "t");
        const trade: Trade = {
          id,
          traderId,
          tokenId,
          side,
          usd: side === "buy" ? usd : Math.max(1, result.usdOut),
          price: result.price,
          thesis: rand() > 0.55 ? SIM_THESES[Math.floor(rand() * THESES_N)] : undefined,
          ts: Date.now(),
        };
        const history = [...token.history, result.price].slice(-64);
        const trader = s.traders[traderId];
        const drift = (side === "buy" ? 1 : -1) * usd * (0.02 + rand() * 0.08);
        set({
          seq,
          pools: {
            ...s.pools,
            [tokenId]: { tokenId, base: result.base, quote: result.quote },
          },
          tokens: {
            ...s.tokens,
            [tokenId]: {
              ...token,
              price: result.price,
              history,
              volume24h: token.volume24h + usd,
            },
          },
          trades: [trade, ...s.trades].slice(0, 80),
          traders: trader
            ? {
                ...s.traders,
                [traderId]: {
                  ...trader,
                  pnlUsd: trader.pnlUsd + drift,
                  pnlPct: trader.pnlPct + (rand() - 0.48) * 0.15,
                },
              }
            : s.traders,
        });

        if (rand() > 0.72) {
          const active = Object.values(get().proposals).filter(
            (p) => p.status === "active" && p.kind === "campaign",
          );
          const p = active[Math.floor(rand() * active.length)];
          if (p) {
            const sideVote = rand() > 0.35 ? "yes" : "no";
            const bumped = {
              ...p,
              yesVotes: p.yesVotes + (sideVote === "yes" ? 1 : 0),
              noVotes: p.noVotes + (sideVote === "no" ? 1 : 0),
            };
            const merged = {
              ...get(),
              proposals: { ...get().proposals, [p.id]: bumped },
            };
            set({
              proposals: merged.proposals,
              ...maybePassProposal(merged, p.id),
            });
          }
        }
      },
}));

export function tokenList(state: WeirSnapshot) {
  return Object.values(state.tokens);
}

export function traderList(state: WeirSnapshot) {
  return Object.values(state.traders).filter((t) => t.id !== "you");
}

export function campaignList(state: WeirSnapshot) {
  return Object.values(state.campaigns);
}

export function proposalList(state: WeirSnapshot) {
  return Object.values(state.proposals);
}

export function futarchyPrice(p: { yesPool?: number; noPool?: number }) {
  const y = p.yesPool ?? 0;
  const n = p.noPool ?? 0;
  const t = y + n;
  if (t <= 0) return { yes: 0.5, no: 0.5 };
  return { yes: y / t, no: n / t };
}

export function positionValue(amount: number, price: number) {
  return amount * price;
}
