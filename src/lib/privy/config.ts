import type { PrivyClientConfig } from "@privy-io/react-auth";
import { arbitrum, base, mainnet } from "viem/chains";
import { robinhoodChain, robinhoodTestnet } from "@/lib/chains/robinhood";

export const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    accentColor: "#c5d5c8",
    logo: "/favicon.svg",
    walletChainType: "ethereum-only",
  },
  loginMethods: ["email", "google", "wallet"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
  defaultChain: robinhoodChain,
  supportedChains: [robinhoodChain, robinhoodTestnet, arbitrum, base, mainnet],
};

export function shortAddress(address: string) {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
