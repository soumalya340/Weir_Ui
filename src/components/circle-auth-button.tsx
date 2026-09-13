"use client";

import { useCircleWallet } from "@/components/circle-wallet-provider";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/circle/config";

export function CircleAuthButton({
  size = "default",
  className,
}: {
  size?: "default" | "sm";
  className?: string;
}) {
  const {
    configured,
    ready,
    authenticated,
    primaryWallet,
    connect,
    createWallet,
    logout,
  } = useCircleWallet();

  if (!configured) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        className={className}
        title="Set Circle env vars in .env"
        disabled
      >
        Connect
      </Button>
    );
  }

  if (!ready) {
    return (
      <Button type="button" size={size} variant="outline" className={className} disabled>
        …
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button type="button" size={size} variant="outline" className={className} onClick={() => void connect()}>
        Connect
      </Button>
    );
  }

  if (!primaryWallet) {
    return (
      <Button
        type="button"
        size={size}
        variant="accent"
        className={className}
        onClick={() => void createWallet()}
      >
        Create wallet
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      variant="ghost"
      className={className}
      onClick={logout}
      title={`${primaryWallet.address} · click to log out`}
    >
      {shortAddress(primaryWallet.address)}
    </Button>
  );
}
