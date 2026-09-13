export const circleAppId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "";
export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const circleConfigured = Boolean(circleAppId);

/**
 * Circle Wallets chain code for user-controlled SCA creation.
 * Default: Base Sepolia (Base testnet). Override with NEXT_PUBLIC_CIRCLE_BLOCKCHAIN.
 * Examples: BASE-SEPOLIA | ARC-TESTNET | MATIC-AMOY | ETH-SEPOLIA
 */
export const CIRCLE_BLOCKCHAIN =
  process.env.NEXT_PUBLIC_CIRCLE_BLOCKCHAIN?.trim() || "BASE-SEPOLIA";

export const CIRCLE_CHAIN_LABEL =
  CIRCLE_BLOCKCHAIN === "BASE-SEPOLIA"
    ? "Base Sepolia"
    : CIRCLE_BLOCKCHAIN === "ARC-TESTNET"
      ? "Arc Testnet"
      : CIRCLE_BLOCKCHAIN;

export function shortAddress(address: string) {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
