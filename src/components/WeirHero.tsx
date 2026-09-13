"use client";

import { useState } from "react";

/**
 * Exact copy of `Weir Hero (standalone).html`: top bar, `#waitlist` hero grid,
 * stats bar, "How things are different here" comparison rows, and the closing
 * CTA panel. All values (colors, fonts, spacing) match the source.
 */

const DIFFS = [
  {
    n: "01",
    stage: "Pre-launch — elsewhere",
    old: "Creators run off-chain whitelists and presale honeypots. Backers hand custody of their funds to unaccountable founders.",
    title: "Zero-custody commitments",
    body: "Backers pledge quote capital as resting 1inch SwapVM limit orders signed via EIP-712. Capital never leaves their wallet — it is backed by a hardcoded 20% protocol bond. Defect and the bond is slashed, the allocation burned, and the forfeit redistributed to honest backers.",
    code: "LimitSwap · StaticBalances · Deadline · InvalidateBit",
  },
  {
    n: "02",
    stage: "Public open — elsewhere",
    old: "Sub-second MEV bots front-run the open, monopolize supply, and dump within minutes.",
    title: "Three-partition anti-snipe curve",
    body: "Supply is fenced into pool seed, commitment tranche, and public curve. The backer tranche never enters the pricing equation, and a decaying tax scaling up to 99% in the opening seconds neutralizes block-0 cartels.",
    code: "poolSeed · commitmentTranche · publicCurve",
  },
  {
    n: "03",
    stage: "Graduation — elsewhere",
    old: "Migrating liquidity to an external AMM opens an oracle vulnerability and an execution window for bots.",
    title: "Atomic in-place graduation",
    body: "Settle commitments, burn unhonoured tokens, and seed a full-range Uniswap v4 position in one transaction. The curve trades in the pool's own quote asset, so nothing crosses a bridge and no oracle is consulted.",
    code: "settle() → burn() → seedFullRange()",
  },
  {
    n: "04",
    stage: "Liquidity — elsewhere",
    old: "LP positions are left fragile or outright predatory once the launchpad walks away.",
    title: "Permanent LP lock",
    body: "The resulting v4 Position NFT is minted directly into WeirV2LaunchLocker and locked forever. No unlock path, no team key, no timelock to wait out.",
    code: "WeirV2LaunchLocker · PositionManager · Permit2",
  },
  {
    n: "05",
    stage: "After launch — elsewhere",
    old: "Holders face pure price depreciation with zero ongoing yield or protocol-level utility.",
    title: "Real yield to stakers",
    body: "A singleton v4 hook intercepts every swap, converts fee deltas into quote assets, and streams real ETH/USDC to token stakers without LP impermanent loss. Yield can auto-compound back through SwapVM into standing buy pressure.",
    code: "WeirV2MemeHook · afterSwapReturnDelta",
  },
  {
    n: "06",
    stage: "Governance — elsewhere",
    old: "Policy is set by team keys and arbitrary multi-sigs.",
    title: "Futarchy-governed exits",
    body: "Early exit requires a funded MetaDAO-style binary LMSR decision market to pass. The market dictates protocol policy, not developer discretion.",
    code: "LMSR · PASS / FAIL",
  },
];

const STATS = [
  { value: "20%", label: "Hardcoded slashable bond" },
  { value: "0", label: "DEX migrations at graduation" },
  { value: "Forever", label: "v4 position NFT lock" },
  { value: "98%", label: "Of launchpad pools collapse in 24h" },
];

export default function WeirHero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      style={{
        background: "#14100f",
        color: "#f2ece8",
        fontFamily: "'IBM Plex Sans', sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "28px 32px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "30px",
              letterSpacing: "-0.01em",
            }}
          >
            Weir
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#8a807c",
            }}
          >
            Launch Protocol
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#8a807c",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#E5502A",
              animation: "weirpulse 2.4s ease-in-out infinite",
            }}
          />
          <span>Coming soon</span>
        </div>
      </div>

      <section
        id="waitlist"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "88px 32px 96px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
          gap: "56px",
          alignItems: "end",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-160px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100vw",
            height: "calc(100% + 200px)",
            pointerEvents: "none",
            zIndex: 0,
            mixBlendMode: "screen",
            opacity: 0.24,
            backgroundImage: 'url("/hero-bg.jpg")',
            backgroundSize: "150% auto",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center 58%",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div style={{ minWidth: 0, position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#E5502A",
              marginBottom: "28px",
              position: "relative",
              zIndex: 1,
            }}
          >
            Uniswap v4 hooks · 1inch SwapVM · Futarchy
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontSize: "clamp(46px, 7.2vw, 92px)",
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
              margin: "0 0 28px",
              textWrap: "balance",
            }}
          >
            The unruggable
            <br />
            launch protocol.
          </h1>
          <p
            style={{
              fontSize: "19px",
              lineHeight: 1.55,
              color: "#c4b9b4",
              margin: "0 0 14px",
              maxWidth: "40ch",
              textWrap: "pretty",
            }}
          >
            Fair-launch protocol on Uniswap v4 hooks &amp; 1inch SwapVM: bonded
            zero-custody pre-commitments, in-place graduation, permanent LP
            locks, and real staker yield.
          </p>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#d8cec9",
              margin: 0,
              maxWidth: "44ch",
              textWrap: "pretty",
              borderLeft: "2px solid #E5502A",
              padding: "2px 0 2px 16px",
            }}
          >
            Weir is not a launchpad storefront. It is the factory through which
            anyone deploys fair-launch tokens with{" "}
            <span style={{ color: "#f2ece8" }}>
              institutional-grade game theory
            </span>
            .
          </p>
        </div>

        <div
          style={{
            minWidth: 0,
            border: "1px solid #2c2523",
            background: "#1a1514",
            padding: "30px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#8a807c",
              marginBottom: "8px",
            }}
          >
            Waitlist
          </div>
          <div
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "28px",
              lineHeight: 1.15,
              marginBottom: "22px",
            }}
          >
            Get access before the first launch.
          </div>
          {submitted ? (
            <div
              style={{
                borderLeft: "2px solid #E5502A",
                padding: "4px 0 4px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  color: "#f2ece8",
                  marginBottom: "6px",
                }}
              >
                You&apos;re on the list.
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  color: "#8a807c",
                  wordBreak: "break-all",
                }}
              >
                {email}
              </div>
            </div>
          ) : (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubmitted(true);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@wallet.eth"
                  className="weir-email"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "14px",
                    color: "#f2ece8",
                    background: "#14100f",
                    border: "1px solid #332b29",
                    padding: "14px 16px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  className="weir-btn"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "12px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#14100f",
                    background: "#E5502A",
                    border: "none",
                    padding: "15px 16px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Join waitlist
                </button>
              </form>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  color: "#6b625f",
                  marginTop: "12px",
                  lineHeight: 1.5,
                }}
              >
                No custody. No presale. Testnet launches first.
              </div>
            </>
          )}
        </div>
      </section>

      <div style={{ borderTop: "1px solid #2c2523", borderBottom: "1px solid #2c2523" }}>
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "0 32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding:
                  i === 0
                    ? "30px 32px 30px 0"
                    : i === STATS.length - 1
                    ? "30px 0 30px 32px"
                    : "30px 32px",
                borderRight: i === STATS.length - 1 ? "none" : "1px solid #2c2523",
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "40px",
                  lineHeight: 1,
                  color: "#E5502A",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#8a807c",
                  marginTop: "10px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "96px 32px 40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "32px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontSize: "clamp(34px, 4.4vw, 56px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "22ch",
            }}
          >
            How things are different here
          </h2>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#8a807c",
            }}
          >
            Launchpad → Weir
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto 40px", padding: "0 32px" }}>
        <div style={{ borderTop: "1px solid #2c2523" }}>
          {DIFFS.map((row) => (
            <div
              key={row.n}
              style={{
                borderBottom: "1px solid #2c2523",
                padding: "34px 0",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                gap: "32px",
                alignItems: "start",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "12px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ color: "#6b625f" }}>{row.n}</span>
                  <span style={{ color: "#8a807c" }}>{row.stage}</span>
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.55,
                    color: "#8a807c",
                    textWrap: "pretty",
                  }}
                >
                  {row.old}
                </div>
              </div>
              <div
                style={{
                  minWidth: 0,
                  borderLeft: "1px solid #332b29",
                  paddingLeft: "32px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "27px",
                    lineHeight: 1.2,
                    marginBottom: "10px",
                    color: "#f2ece8",
                  }}
                >
                  {row.title}
                </div>
                <div
                  style={{
                    fontSize: "15.5px",
                    lineHeight: 1.6,
                    color: "#c4b9b4",
                    textWrap: "pretty",
                  }}
                >
                  {row.body}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11.5px",
                    color: "#E5502A",
                    marginTop: "14px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {row.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "56px 32px 120px" }}>
        <div
          style={{
            border: "1px solid #2c2523",
            background: "#1a1514",
            padding: "clamp(32px, 5vw, 64px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#E5502A",
                marginBottom: "18px",
              }}
            >
              Coming soon
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(30px, 3.6vw, 44px)",
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
                maxWidth: "24ch",
              }}
            >
              Launch a token nobody can rug — including you.
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "#8a807c",
                margin: "0 0 22px",
                maxWidth: "42ch",
                textWrap: "pretty",
              }}
            >
              Waitlist members get first access to the factory, testnet
              campaign slots, and the hook audit report before public
              release.
            </p>
            <a href="#waitlist" className="weir-cta">
              Join waitlist
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
