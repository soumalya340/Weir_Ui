import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  changeFrom,
  formatCompactUsd,
  formatPct,
  formatUsd,
  mcapOf,
} from "./format";

describe("formatUsd", () => {
  it("formats standard USD amounts", () => {
    assert.equal(formatUsd(12.5), "$12.50");
    assert.equal(formatUsd(0), "$0.00");
  });

  it("adds a plus sign when requested", () => {
    assert.equal(formatUsd(3.25, { sign: true }), "+$3.25");
  });

  it("uses micro precision for tiny prices", () => {
    const out = formatUsd(0.001234, { micro: true });
    assert.match(out, /^\$0\.00/);
  });
});

describe("formatCompactUsd", () => {
  it("keeps small amounts as full USD", () => {
    assert.equal(formatCompactUsd(420), "$420.00");
  });

  it("compacts large amounts", () => {
    const out = formatCompactUsd(48200);
    assert.match(out, /^\$48(\.2)?K$/i);
  });
});

describe("formatPct", () => {
  it("formats signed percentages with en dash for negatives", () => {
    assert.equal(formatPct(12.34), "+12.3%");
    assert.equal(formatPct(-4.1), "−4.1%");
    assert.equal(formatPct(0), "0.0%");
  });

  it("omits sign when requested", () => {
    assert.equal(formatPct(55.5, false), "55.5%");
  });
});

describe("mcapOf / changeFrom", () => {
  it("computes market cap from price and supply", () => {
    assert.equal(mcapOf(0.1, 1_000_000), 100_000);
  });

  it("computes percent change from history start", () => {
    assert.equal(changeFrom([100, 110, 120], 120), 20);
    assert.equal(changeFrom([], 50), 0);
  });
});
