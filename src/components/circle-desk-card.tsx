"use client";

import { useCircleWallet } from "@/components/circle-wallet-provider";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/circle/config";

export function CircleDeskCard() {
  const {
    configured,
    ready,
    authenticated,
    primaryWallet,
    usdcBalance,
    status,
    error,
    connect,
    createWallet,
    logout,
  } = useCircleWallet();

  if (!configured) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">Wallet · Arc</p>
        <p className="mt-2 text-sm text-muted">
          Set <code className="text-foreground">CIRCLE_API_KEY</code>,{" "}
          <code className="text-foreground">NEXT_PUBLIC_CIRCLE_APP_ID</code>, and{" "}
          <code className="text-foreground">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in{" "}
          <code className="text-foreground">.env</code> to enable Circle user-controlled wallets on
          Arc Testnet.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-sm text-muted">Loading Circle wallet…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">Wallet · Arc Testnet</p>
        <p className="mt-2 text-sm text-muted">
          Sign in with Google via Circle user-controlled wallets. SCA is created on Arc Testnet.
        </p>
        <Button className="mt-4" variant="accent" onClick={() => void connect()}>
          Connect with Google
        </Button>
        {error ? <p className="mt-2 text-sm text-down">{error}</p> : null}
        <p className="mt-2 text-xs text-muted">{status}</p>
      </div>
    );
  }

  if (!primaryWallet) {
    return (
      <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">Wallet · Arc Testnet</p>
        <p className="mt-2 text-sm text-muted">
          You&apos;re signed in. Create an SCA on Arc to hold USDC.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="accent" onClick={() => void createWallet()}>
            Create Arc wallet
          </Button>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
        {error ? <p className="mt-2 text-sm text-down">{error}</p> : null}
        <p className="mt-2 text-xs text-muted">{status}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl bg-card p-4 shadow-card">
      <p className="text-xs tracking-wide text-muted uppercase">Wallet · Arc Testnet</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Address</dt>
          <dd className="tabular font-medium" title={primaryWallet.address}>
            {shortAddress(primaryWallet.address)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Chain</dt>
          <dd className="font-medium">{primaryWallet.blockchain}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">USDC</dt>
          <dd className="tabular font-medium">{usdcBalance ?? "—"}</dd>
        </div>
      </dl>
      <Button className="mt-4" variant="outline" onClick={logout}>
        Log out
      </Button>
      {error ? <p className="mt-2 text-sm text-down">{error}</p> : null}
      <p className="mt-2 text-xs text-muted">{status}</p>
    </div>
  );
}
