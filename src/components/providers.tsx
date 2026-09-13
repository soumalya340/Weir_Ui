"use client";

import type { ReactNode } from "react";
import { CircleWalletProvider } from "@/components/circle-wallet-provider";
import { WeirProvider } from "@/components/weir-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WeirProvider>
      <CircleWalletProvider>{children}</CircleWalletProvider>
    </WeirProvider>
  );
}
