// app/api/refresh/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { PORTFOLIO_SETS, getSymbols } from "@/data/portfolios";
import { refreshMany } from "@/lib/prices";
import { NextResponse } from "next/server";

function nowInET(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
}
function minutesET(d = nowInET()): number {
  return d.getHours() * 60 + d.getMinutes();
}
function isWeekdayET(): boolean {
  const d = nowInET().getDay(); // 0 Sun .. 6 Sat
  return d >= 1 && d <= 5;
}
function inWindowET(startH: number, startM: number, endH: number, endM: number): boolean {
  const cur = minutesET();
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  return cur >= start && cur <= end;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setQ = (searchParams.get("set") || "set1").toLowerCase();
  const when = (searchParams.get("when") || "").toLowerCase(); // "", "close"

  // Only run near US market close if 'when=close' (cron path)
  if (when === "close") {
    // 16:10–17:30 ET covers both EST (16:10) and EDT (17:10) with buffer
    const okTime = inWindowET(16, 10, 17, 30) && isWeekdayET();
    if (!okTime) {
      return NextResponse.json({ ok: true, skipped: true, when, reason: "outside ET close window" });
    }
  }

  const known = new Set(PORTFOLIO_SETS.map(s => s.id.toLowerCase()));
  const setsToRun = setQ === "all" ? PORTFOLIO_SETS.map(s => s.id) : (known.has(setQ) ? [setQ] : []);
  if (!setsToRun.length) {
    return NextResponse.json({ ok: false, error: `unknown set '${setQ}'` }, { status: 400 });
  }

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

  return NextResponse.json({ ok: true, totalSymbols, totalUpdated, results, when: when || null });
}
