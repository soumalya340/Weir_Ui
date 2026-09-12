"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { privyAppId, shortAddress } from "@/lib/privy/config";

export function PrivyAuthButton({
  size = "default",
  className,
}: {
  size?: "default" | "sm";
  className?: string;
}) {
  if (!privyAppId) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        className={className}
        title="Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local"
        disabled
      >
        Connect
      </Button>
    );
  }

  return <PrivyAuthButtonInner size={size} className={className} />;
}

function PrivyAuthButtonInner({
  size,
  className,
}: {
  size: "default" | "sm";
  className?: string;
}) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address;

  if (!ready) {
    return (
      <Button type="button" size={size} variant="outline" className={className} disabled>
        …
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button type="button" size={size} variant="outline" className={className} onClick={login}>
        Connect
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
      title={address ?? "Signed in — click to log out"}
    >
      {address ? shortAddress(address) : "Log out"}
    </Button>
  );
}
