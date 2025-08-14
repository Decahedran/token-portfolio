// app/api/refresh/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { PORTFOLIO_SETS, getSymbols } from "@/data/portfolios";
import { refreshMany } from "@/lib/prices";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("set") || "set1").toLowerCase();

  const known = new Set(PORTFOLIO_SETS.map(s => s.id.toLowerCase()));
  if (q !== "all" && !known.has(q)) {
    return NextResponse.json({ ok: false, error: `unknown set '${q}'` }, { status: 400 });
  }

  const setsToRun = q === "all" ? PORTFOLIO_SETS.map(s => s.id) : [q];

  const results: Array<{ setId: string; count: number; updated: number; message?: string }> = [];
  let totalSymbols = 0, totalUpdated = 0;

  for (const id of setsToRun) {
    const symbols = getSymbols(id);
    if (!symbols.length) {
      results.push({ setId: id, count: 0, updated: 0, message: "no symbols" });
      continue;
    }
    const { updated } = await refreshMany(symbols, id);
    results.push({ setId: id, count: symbols.length, updated });
    totalSymbols += symbols.length;
    totalUpdated += updated;
  }

  return NextResponse.json({ ok: true, totalSymbols, totalUpdated, results });
}
