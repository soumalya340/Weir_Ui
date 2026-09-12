# weir

Next.js port of the weir demo UI — community-governed launchpad for utility tokens (propose, vote, raise, trade).

## Scripts

```bash
npm install
cp .env.example .env.local   # then set NEXT_PUBLIC_PRIVY_APP_ID
npm run build
npm test
npm run dev                  # only when you want to browse locally
```

## Privy

Embedded auth + wallet via [`@privy-io/react-auth`](https://docs.privy.io/).

1. Create an app at [dashboard.privy.io](https://dashboard.privy.io).
2. Set `NEXT_PUBLIC_PRIVY_APP_ID` in `.env.local`.
3. In the Privy dashboard, allow your local origin (e.g. `http://localhost:3000`).

**Default chain:** Robinhood Chain (`4663`). Also supports Robinhood testnet, Arbitrum, Base, and Ethereum.

Without an app ID the UI still builds and runs; Connect stays disabled and `/me` shows setup instructions.

## Stack

Next.js 15 (App Router), React 19, Tailwind CSS v4, Zustand, Privy, Radix UI, Sonner, Recharts.
