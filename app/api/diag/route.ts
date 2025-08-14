// app/api/diag/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { PORTFOLIO_SETS, getPortfolio, getSymbols } from "@/data/portfolios";
import { ensurePrice } from "@/lib/prices";
import { store as kv } from "@/lib/store";
import { NextResponse } from "next/server";

function nowET() { return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })); }

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const set = (searchParams.get("set") || "set1").toLowerCase();

    const env = {
      VERCEL: !!process.env.VERCEL,
      HAS_KV: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN && process.env.KV_REST_API_READ_ONLY_TOKEN),
      NODE_VERSION: process.version,
    };

    const setsSummary = PORTFOLIO_SETS.map(s => ({
      id: s.id,
      rows: s.rows.length,
      first3: s.rows.slice(0, 3).map(r => r.symbol),
    }));

    const portfolio = getPortfolio(set);
    const symbols = getSymbols(set);

    // Try one symbol fetch to verify network + price sources
    const probeSym = symbols[0] ?? "AAPL";
    const probe = await ensurePrice(probeSym, set);

    const lastRef = await kv.get<number>(`price:last_refreshed:${set}`);

    return NextResponse.json({
      ok: true,
      set,
      env,
      etNow: nowET().toISOString(),
      setsSummary,
      portfolioLen: portfolio.length,
      probe: { symbol: probeSym, price: probe, haveAny: !!(probe && (probe.open || probe.close || probe.prevClose)) },
      lastRefreshed: lastRef ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
