// lib/prices.ts
import { store as kv } from "@/lib/store";

export type PriceObj = {
  open: number | null;
  close: number | null;
  prevClose: number | null;
  ts?: number;
  src?: string;
};

const good = (n: any) => {
  const x = Number(n);
  return Number.isFinite(x) && x > 0;
};

export function mergePrices(oldP?: PriceObj | null, incoming?: PriceObj | null): PriceObj | null {
  if (!oldP && !incoming) return null;
  const out: PriceObj = {
    open:      good(incoming?.open)      ? Number(incoming!.open)      : good(oldP?.open)      ? Number(oldP!.open)      : null,
    close:     good(incoming?.close)     ? Number(incoming!.close)     : good(oldP?.close)     ? Number(oldP!.close)     : null,
    prevClose: good(incoming?.prevClose) ? Number(incoming!.prevClose) : good(oldP?.prevClose) ? Number(oldP!.prevClose) : null,
    ts: Math.max(oldP?.ts ?? 0, incoming?.ts ?? 0),
    src: incoming?.src ?? oldP?.src,
  };
  if (!good(out.open) && !good(out.close) && !good(out.prevClose)) {
    return oldP ?? incoming ?? null;
  }
  return out;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// -------- sources (no API key) --------
async function fetchFromStooq(symbol: string): Promise<PriceObj | null> {
  try {
    const stooqSym = `${symbol.toLowerCase()}.us`;
    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSym)}&i=d`;
    const r = await fetch(url, { cache: "no-store" });
    const text = await r.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return null;
    const rows = lines.slice(1).map((l) => l.split(","));
    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2] || last;
    const open = Number(last?.[1]);
    const close = Number(last?.[4]);
    const prevClose = Number(prev?.[4]);
    return {
      open: good(open) ? open : null,
      close: good(close) ? close : null,
      prevClose: good(prevClose) ? prevClose : null,
      ts: Date.now(),
      src: "stooq",
    };
  } catch {
    return null;
  }
}

async function fetchFromYahoo(symbol: string): Promise<PriceObj | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    const q = j?.quoteResponse?.result?.[0];
    if (!q) return null;
    const open = Number(q.regularMarketOpen);
    const priceNow = Number(q.regularMarketPrice);
    const prevClose = Number(q.regularMarketPreviousClose);
    return {
      open: good(open) ? open : null,
      close: good(priceNow) ? priceNow : good(prevClose) ? prevClose : null,
      prevClose: good(prevClose) ? prevClose : null,
      ts: Date.now(),
      src: "yahoo",
    };
  } catch {
    return null;
  }
}

// -------- public helpers (namespaced by set) --------
const keyFor = (setId: string, symbol: string) => `price:${setId}:${symbol.toUpperCase()}`;

export async function ensurePrice(symbol: string, setId: string): Promise<PriceObj | null> {
  const key = keyFor(setId, symbol);
  const cached = await kv.get<PriceObj>(key);

  if (cached && (good(cached.open) || good(cached.close) || good(cached.prevClose))) {
    return cached;
  }

  const s = await fetchFromStooq(symbol);
  const m1 = mergePrices(cached, s);
  if (m1) await kv.set(key, m1);
  if (m1 && (good(m1.open) || good(m1.close) || good(m1.prevClose))) return m1;

  const y = await fetchFromYahoo(symbol);
  const m2 = mergePrices(m1 ?? cached, y);
  if (m2) await kv.set(key, m2);
  return m2;
}

export async function refreshMany(symbols: string[], setId: string): Promise<{ updated: number }> {
  let updated = 0;
  for (const s of symbols) {
    const before = await kv.get<PriceObj>(keyFor(setId, s));
    const after = await ensurePrice(s, setId);
    if (after && JSON.stringify(after) !== JSON.stringify(before)) updated++;
    await sleep(150);
  }
  if (updated > 0) await kv.set(`price:last_refreshed:${setId}`, Date.now());
  return { updated };
}
