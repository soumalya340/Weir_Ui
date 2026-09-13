"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePrivyGate } from "@/components/privy-gate";
import { Button } from "@/components/ui/button";
import { privyAppId, shortAddress } from "@/lib/privy/config";

export function PrivyDeskCard() {
  const privyActive = usePrivyGate();

  if (!privyAppId) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">Wallet</p>
        <p className="mt-2 text-sm text-muted">
          Set <code className="text-foreground">NEXT_PUBLIC_PRIVY_APP_ID</code> in{" "}
          <code className="text-foreground">.env</code> to enable Privy login on Robinhood Chain.
        </p>
      </div>
    );
  }

  if (!privyActive) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-sm text-muted">Loading wallet…</p>
      </div>
    );
  }

  return <PrivyDeskCardInner />;
}

function PrivyDeskCardInner() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address;
  const email = user?.email?.address;

  if (!ready) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-sm text-muted">Loading wallet…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">Wallet</p>
        <p className="mt-2 text-sm text-muted">
          Connect with Privy. Embedded wallets default to Robinhood Chain.
        </p>
        <Button className="mt-4" variant="accent" onClick={login}>
          Connect wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
      <p className="text-xs tracking-wide text-muted uppercase">Wallet · Robinhood Chain</p>
      <dl className="mt-3 space-y-2 text-sm">
        {email ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Email</dt>
            <dd className="truncate font-medium">{email}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Address</dt>
          <dd className="tabular font-medium" title={address}>
            {address ? shortAddress(address) : "Provisioning…"}
          </dd>
        </div>
      </dl>
      <Button className="mt-4" variant="outline" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
