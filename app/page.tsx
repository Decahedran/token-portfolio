// app/page.tsx
"use client";

import { PORTFOLIO_SETS } from "@/data/portfolios";
import { useEffect, useMemo, useState } from "react";

type Row = {
  symbol: string;
  shares: number;
  purchasePrice: number;
  cards: number;
  refPrice: number;
  value: number;
  pnl: number;
  pnlPct: number;
  cardValue: number;
};

type SortKey =
  | "shares"
  | "purchasePrice"
  | "refPrice"
  | "value"
  | "pnl"
  | "pnlPct"
  | "cards"
  | "cardValue";
type SortDir = "asc" | "desc";

export default function Home() {
  const [setId, setSetId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlId = new URLSearchParams(window.location.search).get("set");
      return urlId || PORTFOLIO_SETS[0].id;
    }
    return PORTFOLIO_SETS[0].id;
  });
  const currentSet = PORTFOLIO_SETS.find((s) => s.id === setId) ?? PORTFOLIO_SETS[0];

  const [rows, setRows] = useState<Row[]>([]);
  const [marketOpen, setMarketOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function pushSetToUrl(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("set", id);
    window.history.replaceState(null, "", url.toString());
  }

  async function loadData(id = setId) {
    const res = await fetch(`/api/daily?set=${encodeURIComponent(id)}`, { cache: "no-store" });
    const j = await res.json();
    setRows(Array.isArray(j?.rows) ? j.rows : []);
    setMarketOpen(Boolean(j?.marketOpen));
    setLastRefreshed(j?.lastRefreshed ?? null);
  }

  async function refreshNow() {
    try {
      setLoading(true);
      await fetch(`/api/refresh?set=${encodeURIComponent(setId)}`);
      await loadData(setId);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      setRows([]);
      setMarketOpen(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.cost += (r.purchasePrice ?? 0) * (r.shares ?? 0);
      acc.value += r.value ?? 0;
      acc.pnl += r.pnl ?? 0;
      return acc;
    },
    { cost: 0, value: 0, pnl: 0 }
  );

  const lastRefText = lastRefreshed
    ? new Date(lastRefreshed).toLocaleString("en-US", { timeZone: "America/New_York" })
    : "never";
  const anyMissing = rows.some((r) => !r.refPrice || r.refPrice <= 0);

  // sorting helpers
  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(nextKey);
      setSortDir("desc");
    }
  }
  const arrow = (k: SortKey) => (sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "");

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    const get = (r: Row, k: SortKey): number => {
      switch (k) {
        case "shares": return +r.shares || 0;
        case "purchasePrice": return +r.purchasePrice || 0;
        case "refPrice": return +r.refPrice || 0;
        case "value": return +r.value || 0;
        case "pnl": return +r.pnl || 0;
        case "pnlPct": return +r.pnlPct || 0;
        case "cards": return +r.cards || 0;
        case "cardValue": return +r.cardValue || 0;
      }
    };
    copy.sort((a, b) => {
      const va = get(a, sortKey);
      const vb = get(b, sortKey);
      if (va === vb) return 0;
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  // ---------- EXPORT: Excel (.xlsx) ----------
  async function exportExcel() {
    const XLSX = await import("xlsx"); // dynamic import for client-only
    const now = new Date();
    const fn = `Portfolio_${currentSet.id}_${now.toISOString().slice(0,10)}.xlsx`;

    // Build AOA (array of arrays)
    const header = [
      "Symbol", "Shares", "Purchase", "Ref Price", "Holding Value",
      "Unrealized P/L", "P/L %", "Cards", "Per-Card Value"
    ];
    const body = sortedRows.map(r => ([
      r.symbol,
      r.shares,
      r.purchasePrice,
      r.refPrice,
      r.value,
      r.pnl,
      r.pnlPct / 100,  // as fraction for proper Excel % formatting
      r.cards,
      r.cardValue
    ]));

    const totalsRow = [
      "Totals", "", totals.cost, "", totals.value, totals.pnl, "", "", ""
    ];

    const ws = XLSX.utils.aoa_to_sheet([
      [`Portfolio — ${currentSet.name}`],
      [`Reference: ${marketOpen ? "OPEN" : "CLOSE"} • Last refreshed: ${lastRefText}`],
      [],
      header,
      ...body,
      [],
      totalsRow,
    ]);

    // Column widths
    ws["!cols"] = [
      { wch: 10 }, // Symbol
      { wch: 8  }, // Shares
      { wch: 12 }, // Purchase
      { wch: 12 }, // Ref Price
      { wch: 14 }, // Holding Value
      { wch: 14 }, // P/L
      { wch: 8  }, // P/L %
      { wch: 8  }, // Cards
      { wch: 14 }, // Per-Card Value
    ];

    // Apply number formats for numeric columns on data rows
    const startRow = 5; // header is row 4, data starts at 5 (1-indexed)
    const endRow = startRow + body.length - 1;
    const colFmt: Record<number, string> = {
      2: "$#,##0.00", // Purchase (C)
      3: "$#,##0.00", // Ref Price (D)
      4: "$#,##0.00", // Holding Value (E)
      5: "$#,##0.00;[Red]-$#,##0.00", // P/L (F) red negatives
      6: "0.00%",     // P/L % (G) (we stored fraction)
      8: "$#,##0.00" // Per-Card Value (I)
    };
    function cellRef(c:number, r:number){ return XLSX.utils.encode_cell({c, r}); }

    for (let r = startRow - 1; r <= endRow - 1; r++) {
      for (const [cStr, fmt] of Object.entries(colFmt)) {
        const c = Number(cStr);
        const addr = cellRef(c, r);
        const cell = ws[addr];
        if (cell && typeof cell.v === "number") {
          (cell as any).t = "n";
          (cell as any).z = fmt;
        }
      }
    }
    // Totals row formats (last rows)
    const totalsRowIdx = endRow + 2; // blank row + totals
    for (const [cStr, fmt] of Object.entries({2:"$#,##0.00",4:"$#,##0.00",5:"$#,##0.00;[Red]-$#,##0.00"})) {
      const addr = cellRef(Number(cStr), totalsRowIdx);
      const cell = ws[addr];
      if (cell && typeof cell.v === "number") {
        (cell as any).t = "n";
        (cell as any).z = fmt;
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentSet.name.slice(0,31));
    XLSX.writeFile(wb, fn);
  }

  // ---------- EXPORT: PDF ----------
  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default as any;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
    const marginX = 40;

    doc.setFontSize(14);
    doc.text(`Portfolio — ${currentSet.name}`, marginX, 40);
    doc.setFontSize(10);
    doc.text(
      `Reference: ${marketOpen ? "OPEN" : "CLOSE"} • Last refreshed: ${lastRefText}`,
      marginX, 58
    );

    const head = [
      ["Symbol","Shares","Purchase","Ref Price","Holding Value","Unrealized P/L","P/L %","Cards","Per-Card Value"]
    ];
    const fmt = (n:number) => `$${n.toFixed(2)}`;
    const body = sortedRows.map(r => [
      r.symbol,
      r.shares,
      fmt(r.purchasePrice),
      fmt(r.refPrice),
      fmt(r.value),
      `${r.pnl >= 0 ? "+" : "-"}${fmt(Math.abs(r.pnl))}`,
      `${r.pnlPct.toFixed(2)}%`,
      r.cards,
      `$${r.cardValue.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 75,
      head,
      body,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 30, 30], textColor: 255 },
      columnStyles: {
        1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" },
        4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" },
        7: { halign: "right" }, 8: { halign: "right" }
      },
      margin: { left: marginX, right: marginX },
      didDrawPage: (data:any) => {
        // footer
        const p = doc as any;
        const str = `Page ${p.internal.getNumberOfPages()}`;
        doc.setFontSize(9);
        doc.text(str, doc.internal.pageSize.getWidth() - marginX, doc.internal.pageSize.getHeight() - 20, { align: "right" });
      },
    });

    // Totals box
    doc.setFontSize(10);
    doc.text(
      `Totals — Value: ${fmt(totals.value)} • Cost: ${fmt(totals.cost)} • P/L: ${(totals.pnl>=0?"+":"-")}${fmt(Math.abs(totals.pnl))}`,
      marginX, doc.lastAutoTable.finalY + 20
    );

    const fn = `Portfolio_${currentSet.id}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fn);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Title + subtitle */}
      <h1 className="text-2xl font-semibold mb-1">Portfolio (Open/Close)</h1>
      <p className="text-sm opacity-75">
        Viewing: <strong>{currentSet.name}</strong> • Reference: {marketOpen ? "today’s OPEN" : "today’s CLOSE (or last close)"} • Last refreshed: {lastRefText}
      </p>
      {anyMissing && <p className="text-xs text-amber-700 mt-1">Some prices are missing. Click “Refresh Prices”.</p>}

      {/* Controls row — left aligned */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={setId}
          onChange={(e) => {
            const id = e.target.value;
            setSetId(id);
            pushSetToUrl(id);
          }}
          className="dark-dropdown border rounded-xl px-3 py-2 min-w-[240px] bg-white/10"
          title="Choose portfolio dataset"
        >
          {PORTFOLIO_SETS.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button onClick={refreshNow} disabled={loading} className="px-4 py-2 rounded-xl border">
          {loading ? "Refreshing…" : "Refresh Prices"}
        </button>

        {/* NEW: Export buttons */}
        <button onClick={exportExcel} className="px-4 py-2 rounded-xl border">
          Export Excel
        </button>
        <button onClick={exportPdf} className="px-4 py-2 rounded-xl border">
          Export PDF
        </button>
      </div>

      {/* Totals */}
      <div className="mt-4 mb-3 text-sm">
        <strong>Totals</strong> — Value: ${totals.value.toFixed(2)} • Cost: ${totals.cost.toFixed(2)} • P/L: {(totals.pnl >= 0 ? "+" : "-")}${Math.abs(totals.pnl).toFixed(2)}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Symbol</th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("shares")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  Shares {arrow("shares")}
                </button>
              </th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("purchasePrice")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  Purchase {arrow("purchasePrice")}
                </button>
              </th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("refPrice")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  Ref Price {arrow("refPrice")}
                </button>
              </th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("value")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  Holding Value {arrow("value")}
                </button>
              </th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("pnl")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  Unrealized P/L {arrow("pnl")}
                </button>
              </th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("pnlPct")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  P/L % {arrow("pnlPct")}
                </button>
              </th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("cards")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  Cards {arrow("cards")}
                </button>
              </th>

              <th className="text-right p-2">
                <button onClick={() => toggleSort("cardValue")} className="w-full text-right hover:underline underline-offset-4 cursor-pointer select-none">
                  Per-Card Value {arrow("cardValue")}
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.symbol} className="border-b">
                <td className="p-2">{r.symbol}</td>
                <td className="p-2 text-right">{r.shares}</td>
                <td className="p-2 text-right">${r.purchasePrice.toFixed(2)}</td>
                <td className="p-2 text-right">${r.refPrice.toFixed(2)}</td>
                <td className="p-2 text-right">${r.value.toFixed(2)}</td>
                <td className={`p-2 text-right ${r.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(r.pnl >= 0 ? "+" : "-")}${Math.abs(r.pnl).toFixed(2)}
                </td>
                <td className="p-2 text-right">{r.pnlPct.toFixed(2)}%</td>
                <td className="p-2 text-right">{r.cards}</td>
                <td className="p-2 text-right">${r.cardValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-4 opacity-60">For informational purposes only. Not investment advice.</p>
    </div>
  );
}
