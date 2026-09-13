import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weir — The unruggable launch protocol",
  description:
    "Fair-launch protocol on Uniswap v4 hooks & 1inch SwapVM: bonded zero-custody pre-commitments, in-place graduation, permanent LP locks, and real staker yield.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
