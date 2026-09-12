const usdFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const usdMicro = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUsd(n: number, opts?: { micro?: boolean; sign?: boolean }) {
  const abs = Math.abs(n);
  const formatted =
    opts?.micro || (abs > 0 && abs < 0.01) ? usdMicro.format(n) : usdFull.format(n);
  if (opts?.sign && n > 0) return `+${formatted}`;
  return formatted;
}

export function formatCompactUsd(n: number) {
  if (Math.abs(n) < 1000) return formatUsd(n);
  return `$${compact.format(n)}`;
}

export function formatPct(n: number, sign = true) {
  const body = `${Math.abs(n).toFixed(1)}%`;
  if (!sign) return body;
  if (n > 0) return `+${body}`;
  if (n < 0) return `−${body}`;
  return body;
}

export function formatQty(n: number) {
  if (n >= 1000) return compact.format(n);
  if (n >= 10) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(4);
}

export function formatAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 8) return "now";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function formatLeft(endsAt: number, now = Date.now()) {
  const s = Math.max(0, Math.floor((endsAt - now) / 1000));
  if (s <= 0) return "ended";
  const h = Math.floor(s / 3600);
  if (h < 48) return `${h}h left`;
  return `${Math.floor(h / 24)}d left`;
}

export function categoryLabel(c: string) {
  if (c === "art") return "Artist";
  if (c === "startup") return "Startup";
  return "Utility";
}

export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mcapOf(price: number, supply: number) {
  return price * supply;
}

export function changeFrom(history: number[], price: number) {
  const start = history[0] ?? price;
  if (!start) return 0;
  return ((price - start) / start) * 100;
}
