import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CIRCLE_BLOCKCHAIN, CIRCLE_CHAIN_LABEL, shortAddress } from "./config";

describe("circle config", () => {
  it("defaults to Base Sepolia for user-controlled wallets", () => {
    assert.equal(CIRCLE_BLOCKCHAIN, "BASE-SEPOLIA");
    assert.equal(CIRCLE_CHAIN_LABEL, "Base Sepolia");
  });

  it("compacts a 0x address", () => {
    assert.equal(
      shortAddress("0x1234567890abcdef1234567890abcdef12345678"),
      "0x1234…5678",
    );
  });
});
