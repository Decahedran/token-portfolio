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
function minutes(h: number, m: number) { return h * 60 + m; }
function isWeekdayET(): boolean { const d = nowInET().getDay(); return d >= 1 && d <= 5; }

// true if current ET time is in [start, end] inclusive
function inWindowET(startH: number, startM: number, endH: number, endM: number): boolean {
  const cur = minutesET();
  const start = minutes(startH, startM);
  const end = minutes(endH, endM);
  return cur >= start && cur <= end;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setQ = (searchParams.get("set") || "set1").toLowerCase();
  const when = (searchParams.get("when") || "").toLowerCase(); // "", "open", "close"

  // Only proceed near the intended ET time if "when" is provided (cron calls)
  if (when) {
    const okTime =
      when === "open"
        // 09:35–10:55 ET covers both EST (09:35) and EDT (10:35)
        ? inWindowET(9, 35, 10, 55) && isWeekdayET()
        // 16:10–17:30 ET covers both EST (16:10) and EDT (17:10)
        : when === "close"
        ? inWindowET(16, 10, 17, 30) && isWeekdayET()
        : true;

    if (!okTime) {
      return NextResponse.json({ ok: true, skipped: true, when, reason: "outside ET window" });
    }
  }

  const known = new Set(PORTFOLIO_SETS.map(s => s.id.toLowerCase()));
  const setsToRun = setQ === "all" ? PORTFOLIO_SETS.map(s => s.id) : (known.has(setQ) ? [setQ] : []);
  if (setsToRun.length === 0) {
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
