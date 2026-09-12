export type Category = "art" | "startup" | "utility";

export type TokenStatus = "proposed" | "raising" | "live" | "failed";

export type ProposalKind = "campaign" | "futarchy";

export type ProposalStatus = "active" | "passed" | "failed" | "executed";

export type CampaignStatus = "live" | "filled" | "failed";

export type TradeSide = "buy" | "sell";

export type Trader = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  pnlPct: number;
  pnlUsd: number;
  winRate: number;
  avgHold: string;
  thesisCount: number;
};

export type Token = {
  id: string;
  ticker: string;
  name: string;
  pitch: string;
  category: Category;
  creatorId: string;
  status: TokenStatus;
  supply: number;
  price: number;
  volume24h: number;
  holders: number;
  history: number[];
  lpLocked: boolean;
  createdAt: number;
};

export type Pool = {
  tokenId: string;
  base: number;
  quote: number;
};

export type Proposal = {
  id: string;
  kind: ProposalKind;
  tokenId: string;
  title: string;
  body: string;
  creatorId: string;
  status: ProposalStatus;
  endsAt: number;
  yesVotes: number;
  noVotes: number;
  quorum: number;
  raiseTarget?: number;
  raiseDays?: number;
  yesPool?: number;
  noPool?: number;
};

export type Campaign = {
  id: string;
  tokenId: string;
  proposalId: string;
  raised: number;
  target: number;
  backers: number;
  endsAt: number;
  status: CampaignStatus;
};

export type Trade = {
  id: string;
  traderId: string;
  tokenId: string;
  side: TradeSide;
  usd: number;
  price: number;
  thesis?: string;
  ts: number;
  copiedFrom?: string;
};

export type Position = {
  amount: number;
  costUsd: number;
};

export type LaunchInput = {
  name: string;
  ticker: string;
  category: Category;
  pitch: string;
  raiseTarget: number;
  raiseDays: number;
  lpLocked: boolean;
};
