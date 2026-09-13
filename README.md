# weir

Next.js port of the weir demo UI — community-governed launchpad for utility tokens (propose, vote, raise, trade).

Wallet layer: **Circle user-controlled wallets on Base Sepolia** (Base testnet).

## Scripts

```bash
npm install
cp .env.example .env   # fill Circle + Google values
npm run build
npm test
npm run dev            # only when you want to browse locally
```

## Circle user-controlled wallets (Base Sepolia)

1. Create keys in [Circle Developer Console](https://console.circle.com/).
2. **Wallets → User Controlled → Configurator**: copy **App ID**, enable **Google** social login with your Google OAuth Web Client ID.
3. Set in `.env`:

```bash
CIRCLE_API_KEY=...
NEXT_PUBLIC_CIRCLE_APP_ID=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_CIRCLE_BLOCKCHAIN=BASE-SEPOLIA
```

4. Allow `http://localhost:3000` as the Google OAuth redirect URI.

Flow in the app: **Connect** → Google OAuth → **Create wallet** (SCA on `BASE-SEPOLIA`) → address + USDC balance on `/me`.

To use Arc Testnet instead, set `NEXT_PUBLIC_CIRCLE_BLOCKCHAIN=ARC-TESTNET`.

Without env vars the UI still builds; Connect stays disabled and `/me` shows setup hints.

## Stack

Next.js 15 (App Router), React 19, Tailwind CSS v4, Zustand, Circle Web SDK (`@circle-fin/w3s-pw-web-sdk`), Radix UI, Sonner, Recharts.
