import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "weir",
  description: "Community-governed launchpad for utility tokens. Propose, vote, raise, trade.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@400;500;600&display=swap"
        />
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster
            theme="dark"
            position="bottom-center"
            toastOptions={{
              className: "bg-card text-foreground border-0 shadow-card font-sans",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
