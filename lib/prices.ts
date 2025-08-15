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
}

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

/** ---------- Yahoo (primary) ---------- */
async function fetchFromYahoo(symbol: string): Promise<PriceObj | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
      symbol
    )}`;
    const r = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": UA,
        Accept: "application/json,text/plain,*/*",
        Referer: "https://finance.yahoo.com/",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    const q = j?.quoteResponse?.result?.[0];
    if (!q) return null;

    const open = Number(q.regularMarketOpen);
    const priceNow = Number(q.regularMarketPrice);
    const prevClose = Number(q.regularMarketPreviousClose);

    return {
      open: isPosNum(open) ? open : null,
      // Treat "close" as the best current reference if available, else prevClose
      close: isPosNum(priceNow) ? priceNow : isPosNum(prevClose) ? prevClose : null,
      prevClose: isPosNum(prevClose) ? prevClose : null,
      ts: Date.now(),
      src: "yahoo",
    };
  } catch {
    return null;
  }
}

/** ---------- Stooq (CSV fallback) ---------- */
async function fetchStooqCsv(domain: "stooq.com" | "stooq.pl", symbol: string): Promise<PriceObj | null> {
  try {
    const stooqSym = `${symbol.toLowerCase()}.us`;
    const url = `https://${domain}/q/d/l/?s=${encodeURIComponent(stooqSym)}&i=d`;
    const r = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": UA, Accept: "text/csv,text/plain,*/*" },
    });
    if (!r.ok) return null;
    const text = await r.text();
    // If HTML or empty, bail
    if (!text || text.trim().startsWith("<")) return null;

    const lines = text.trim().split(/\r?\n/);
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
      src: `stooq:${domain}`,
    };
  } catch {
    return null;
  }
}

async function fetchFromStooq(symbol: string): Promise<PriceObj | null> {
  const a = await fetchStooqCsv("stooq.com", symbol);
  if (a && (isPosNum(a.open) || isPosNum(a.close) || isPosNum(a.prevClose))) return a;
  const b = await fetchStooqCsv("stooq.pl", symbol);
  if (b && (isPosNum(b.open) || isPosNum(b.close) || isPosNum(b.prevClose))) return b;
  return null;
}

/** ---------- Public helpers (per set) ---------- */
const keyFor = (setId: string, symbol: string) => `price:${setId}:${symbol.toUpperCase()}`;

export async function ensurePrice(symbol: string, setId: string): Promise<PriceObj | null> {
  const key = keyFor(setId, symbol);
  const cached = await kv.get<PriceObj>(key);
  if (cached && (isPosNum(cached.open) || isPosNum(cached.close) || isPosNum(cached.prevClose))) {
    return cached;
  }

  // Yahoo first (more reliable on serverless with headers), then Stooq
  const y = await fetchFromYahoo(symbol);
  const m1 = mergePrices(cached, y);
  if (m1) await kv.set(key, m1);
  if (m1 && (isPosNum(m1.open) || isPosNum(m1.close) || isPosNum(m1.prevClose))) return m1;

  const s = await fetchFromStooq(symbol);
  const m2 = mergePrices(m1 ?? cached, s);
  if (m2) await kv.set(key, m2);
  return m2;
}

export async function refreshMany(symbols: string[], setId: string): Promise<{ updated: number }> {
  let updated = 0;
  for (const s of symbols) {
    const before = await kv.get<PriceObj>(keyFor(setId, s));
    const after = await ensurePrice(s, setId);
    if (after && JSON.stringify(after) !== JSON.stringify(before)) updated++;
    await sleep(300); // gentler pacing for free endpoints
  }
  if (updated > 0) await kv.set(`price:last_refreshed:${setId}`, Date.now());
  return { updated };
}
