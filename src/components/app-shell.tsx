"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Layers, Radio, User, Vote } from "lucide-react";
import { WeirMark } from "@/components/marks";
import { CircleAuthButton } from "@/components/circle-auth-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompactUsd } from "@/lib/weir/format";
import { useWeirStore } from "@/lib/weir/store";

const NAV = [
  { to: "/", label: "Feed", icon: Radio },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/proposals", label: "Proposals", icon: Vote },
  { to: "/campaigns", label: "Campaigns", icon: Layers },
  { to: "/me", label: "You", icon: User },
] as const;

function pathActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cash = useWeirStore((s) => s.cashUsd);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-background px-4 py-5 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} {...item} active={pathActive(pathname, item.to)} />
          ))}
        </nav>
        <Button asChild variant="accent" className="w-full">
          <Link href="/launch">Propose</Link>
        </Button>
        <CircleAuthButton className="mt-2 w-full" />
        <Link
          href="/me"
          className="mt-3 flex h-11 items-center justify-between rounded-md px-3 text-sm shadow-card hover:shadow-card-hover"
        >
          <span className="text-muted">USDC</span>
          <span className="tabular font-medium">{formatCompactUsd(cash)}</span>
        </Link>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-sm lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <span className="tabular text-sm text-muted">{formatCompactUsd(cash)}</span>
          <CircleAuthButton size="sm" />
          <Button asChild size="sm" variant="accent">
            <Link href="/launch">Propose</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pt-5 pb-24 lg:pl-64 lg:pb-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-border bg-background/95 px-1 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-xs",
                active ? "text-foreground" : "text-muted",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <WeirMark className="size-6" />
      <span className="font-display text-2xl italic tracking-tight">weir</span>
    </Link>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: (typeof NAV)[number]["to"];
  label: string;
  icon: typeof Radio;
  active: boolean;
}) {
  return (
    <Link
      href={to}
      className={cn(
        "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-[background-color,color] duration-150",
        active ? "bg-card-2 text-foreground" : "text-muted hover:bg-card-2/70 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
