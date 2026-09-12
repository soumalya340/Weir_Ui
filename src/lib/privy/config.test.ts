import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { robinhoodChain, robinhoodTestnet } from "@/lib/chains/robinhood";
import { privyConfig, shortAddress } from "@/lib/privy/config";

describe("robinhood chain config", () => {
  it("uses mainnet chain id 4663", () => {
    assert.equal(robinhoodChain.id, 4663);
    assert.match(robinhoodChain.rpcUrls.default.http[0] ?? "", /robinhood/);
  });

  it("includes testnet 46630", () => {
    assert.equal(robinhoodTestnet.id, 46630);
  });
});

describe("privyConfig", () => {
  it("defaults embedded wallets to Robinhood Chain", () => {
    assert.equal(privyConfig.defaultChain?.id, 4663);
    const ids = (privyConfig.supportedChains ?? []).map((c) => c.id);
    assert.ok(ids.includes(4663));
    assert.ok(ids.includes(46630));
  });

  it("creates ethereum embedded wallets on login", () => {
    assert.equal(privyConfig.embeddedWallets?.ethereum?.createOnLogin, "users-without-wallets");
  });
});

describe("shortAddress", () => {
  it("compacts a 0x address", () => {
    assert.equal(
      shortAddress("0x1234567890abcdef1234567890abcdef12345678"),
      "0x1234…5678",
    );
  });
});
