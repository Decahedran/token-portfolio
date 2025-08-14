// app/api/daily/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getPortfolio } from "@/data/portfolios";
import { ensurePrice } from "@/lib/prices";
import { store as kv } from "@/lib/store";
import { NextResponse } from "next/server";

function isUsMarketOpenNowET(): boolean {
  const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const d = et.getDay(); // 0 Sun .. 6 Sat
  if (d === 0 || d === 6) return false;
  const mins = et.getHours() * 60 + et.getMinutes();
  return mins >= 570 && mins < 960; // 9:30–16:00 ET
}
function isPosNum(val: unknown): val is number {
  const x = Number(val);
  return Number.isFinite(x) && x > 0;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setId = searchParams.get("set") || "set1";
  try {
    const marketOpen = isUsMarketOpenNowET();
    const lastRefreshed = await kv.get<number>(`price:last_refreshed:${setId}`);
    const portfolio = getPortfolio(setId);

    const rows = await Promise.all(
      portfolio.map(async (p) => {
        const priceObj = await ensurePrice(p.symbol, setId);
        let ref: number | null = null;
        if (priceObj) {
          ref = marketOpen
            ? (isPosNum(priceObj.open) ? priceObj.open
              : isPosNum(priceObj.close) ? priceObj.close
              : isPosNum(priceObj.prevClose) ? priceObj.prevClose
              : null)
            : (isPosNum(priceObj.close) ? priceObj.close
              : isPosNum(priceObj.prevClose) ? priceObj.prevClose
              : null);
        }
        const refPrice = isPosNum(ref) ? ref : 0;
        const value = p.shares * refPrice;
        const pnl = p.shares * (refPrice - p.purchasePrice);
        const pnlPct = p.purchasePrice ? ((refPrice - p.purchasePrice) / p.purchasePrice) * 100 : 0;
        const cardValue = p.cards > 0 ? value / p.cards : 0;
        return { symbol: p.symbol, shares: p.shares, purchasePrice: p.purchasePrice, cards: p.cards, refPrice, value, pnl, pnlPct, cardValue };
      })
    );

    return NextResponse.json(
      { rows, marketOpen, lastRefreshed: lastRefreshed ?? null, setId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    // Fail closed but don't leak internals
    return NextResponse.json(
      { rows: [], marketOpen: false, lastRefreshed: null, setId },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
