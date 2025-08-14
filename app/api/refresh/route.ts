// app/api/refresh/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSymbols } from "@/data/portfolios";
import { refreshMany } from "@/lib/prices";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setId = searchParams.get("set") || "set1";

  const symbols = getSymbols(setId);
  if (!symbols.length) return NextResponse.json({ ok: true, message: "no symbols in set", setId });

  const { updated } = await refreshMany(symbols, setId);
  return NextResponse.json({ ok: true, count: symbols.length, updated, setId });
}
