import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CIRCLE_BLOCKCHAIN, shortAddress } from "./config";

describe("circle config", () => {
  it("targets Arc Testnet for user-controlled wallets", () => {
    assert.equal(CIRCLE_BLOCKCHAIN, "ARC-TESTNET");
  });

  it("compacts a 0x address", () => {
    assert.equal(
      shortAddress("0x1234567890abcdef1234567890abcdef12345678"),
      "0x1234…5678",
    );
  });
});
