"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead } from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useWeirStore } from "@/lib/weir/store";
import type { Category } from "@/lib/weir/types";

const CATS: { id: Category; label: string; hint: string }[] = [
  { id: "art", label: "Artist", hint: "Studios, labels, rooms with a door." },
  { id: "startup", label: "Startup", hint: "Shipping a product with a ledger." },
  { id: "utility", label: "Utility", hint: "Membership, credits, a job in the world." },
];

export default function Launch() {
  const launch = useWeirStore((s) => s.launch);
  const router = useRouter();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [category, setCategory] = useState<Category>("utility");
  const [pitch, setPitch] = useState("");
  const [raiseTarget, setRaiseTarget] = useState(20000);
  const [raiseDays, setRaiseDays] = useState(10);
  const [lpLocked, setLpLocked] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = launch({ name, ticker, category, pitch, raiseTarget, raiseDays, lpLocked });
    if ("error" in res) {
      setErr(res.error);
      return;
    }
    toast.success("Proposal is on the board. You voted yes.");
    router.push(`/proposals/${res.proposalId}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHead
        kicker="Propose"
        title="Ask the room."
        lede="Artists and startups raise here only after a campaign vote. If it passes, the raise opens. LP is born with the community, not the desk."
      />
      <form onSubmit={submit} className="space-y-5">
        <Field label="Project name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Harbor Lights" required />
        </Field>
        <Field label="Ticker">
          <Input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="WAVE"
            maxLength={8}
            required
          />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm text-muted">Who is raising</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-lg p-3 text-left shadow-card",
                  category === c.id ? "bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                <div className="text-sm font-medium">{c.label}</div>
                <div className={cn("mt-1 text-xs", category === c.id ? "text-primary-foreground/70" : "text-muted")}>
                  {c.hint}
                </div>
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Pitch">
          <Textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="What the token does in the real room, and why LP should stay with holders."
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Raise target (USDC)">
            <Input
              type="number"
              min={1000}
              step={500}
              value={raiseTarget}
              onChange={(e) => setRaiseTarget(Number(e.target.value))}
            />
          </Field>
          <Field label="Days open">
            <Input
              type="number"
              min={3}
              max={30}
              value={raiseDays}
              onChange={(e) => setRaiseDays(Number(e.target.value))}
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={() => setLpLocked((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between rounded-lg bg-card px-4 text-left text-sm shadow-card"
        >
          <span>Community LP locked at launch</span>
          <span className="text-muted">{lpLocked ? "Yes" : "No"}</span>
        </button>
        {err ? <p className="text-sm text-down">{err}</p> : null}
        <Button type="submit" className="w-full">
          Submit proposal
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
