export const circleAppId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "";
export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const circleConfigured = Boolean(circleAppId);

/** Arc Testnet — Circle user-controlled wallets default chain for weir. */
export const CIRCLE_BLOCKCHAIN = "ARC-TESTNET" as const;

export function shortAddress(address: string) {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
