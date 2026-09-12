"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WeirProvider } from "@/components/weir-provider";
import { privyAppId, privyConfig } from "@/lib/privy/config";

export function Providers({ children }: { children: React.ReactNode }) {
  if (!privyAppId) {
    return <WeirProvider>{children}</WeirProvider>;
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <WeirProvider>{children}</WeirProvider>
    </PrivyProvider>
  );
}
