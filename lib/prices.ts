// lib/prices.ts
import { store as kv } from "@/lib/store";

export type PriceObj = {
  open: number | null;
  close: number | null;
  prevClose: number | null;
  ts?: number;
  src?: string;
};

const isPosNum = (val: unknown): val is number => {
  const x = Number(val);
  return Number.isFinite(x) && x > 0;
};

export function mergePrices(oldP?: PriceObj | null, incoming?: PriceObj | null): PriceObj | null {
  if (!oldP && !incoming) return null;
  const out: PriceObj = {
    open:      isPosNum(incoming?.open)      ? incoming!.open      : isPosNum(oldP?.open)      ? oldP!.open      : null,
    close:     isPosNum(incoming?.close)     ? incoming!.close     : isPosNum(oldP?.close)     ? oldP!.close     : null,
    prevClose: isPosNum(incoming?.prevClose) ? incoming!.prevClose : isPosNum(oldP?.prevClose) ? oldP!.prevClose : null,
    ts: Math.max(oldP?.ts ?? 0, incoming?.ts ?? 0),
    src: incoming?.src ?? oldP?.src,
  };
  if (!isPosNum(out.open) && !isPosNum(out.close) && !isPosNum(out.prevClose)) {
    return oldP ?? incoming ?? null;
  }
  return out;
};

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

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
      open: isPosNum(open) ? open : null,
      close: isPosNum(close) ? close : null,
      prevClose: isPosNum(prevClose) ? prevClose : null,
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
      open: isPosNum(open) ? open : null,
      close: isPosNum(priceNow) ? priceNow : isPosNum(prevClose) ? prevClose : null,
      prevClose: isPosNum(prevClose) ? prevClose : null,
      ts: Date.now(),
      src: "yahoo",
    };
  } catch {
    return null;
  }
}

// ---- namespaced helpers by set ----
const keyFor = (setId: string, symbol: string) => `price:${setId}:${symbol.toUpperCase()}`;

export async function ensurePrice(symbol: string, setId: string): Promise<PriceObj | null> {
  const key = keyFor(setId, symbol);
  const cached = await kv.get<PriceObj>(key);

  if (cached && (isPosNum(cached.open) || isPosNum(cached.close) || isPosNum(cached.prevClose))) {
    return cached;
  }

  const s = await fetchFromStooq(symbol);
  const m1 = mergePrices(cached, s);
  if (m1) await kv.set(key, m1);
  if (m1 && (isPosNum(m1.open) || isPosNum(m1.close) || isPosNum(m1.prevClose))) return m1;

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
