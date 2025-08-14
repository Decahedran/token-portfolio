// data/portfolios.ts
export type PortfolioRow = {
  symbol: string;
  shares: number;
  purchasePrice: number;
  cards: number;
};

export type PortfolioSet = {
  id: string;      // URL/key id (e.g., "set1")
  name: string;    // Human label for dropdown
  rows: PortfolioRow[];
};

// --- EDIT THESE SETS AS YOU LIKE ---
export const PORTFOLIO_SETS: PortfolioSet[] = [
  {
    id: "set1",
    name: "Set 1 • Tech & Blue Chips",
    rows: [
      { symbol: "AAPL",  shares: 25, purchasePrice: 200, cards: 125 },
      { symbol: "MSFT",  shares: 10, purchasePrice: 200, cards: 125 },
      { symbol: "NVDA",  shares: 4,  purchasePrice: 75,  cards: 312 },
      { symbol: "AMZN",  shares: 12, purchasePrice: 75,  cards: 312 },
      { symbol: "GOOGL", shares: 15, purchasePrice: 75,  cards: 312 },
      { symbol: "META",  shares: 8,  purchasePrice: 75,  cards: 312 },
      { symbol: "TSLA",  shares: 6,  purchasePrice: 220, cards: 583 },
      { symbol: "AVGO",  shares: 3,  purchasePrice: 33,  cards: 583 },
      { symbol: "JPM",   shares: 20, purchasePrice: 33,  cards: 583 },
      { symbol: "JNJ",   shares: 18, purchasePrice: 33,  cards: 583 },
      { symbol: "V",     shares: 10, purchasePrice: 33,  cards: 583 },
      { symbol: "MA",    shares: 7,  purchasePrice: 33,  cards: 583 },
      { symbol: "UNH",   shares: 5,  purchasePrice: 12,  cards: 625 },
      { symbol: "XOM",   shares: 30, purchasePrice: 12,  cards: 625 },
      { symbol: "PG",    shares: 22, purchasePrice: 12,  cards: 625 },
      { symbol: "KO",    shares: 40, purchasePrice: 12,  cards: 625 },
      { symbol: "PEP",   shares: 15, purchasePrice: 12,  cards: 625 },
      { symbol: "COST",  shares: 5,  purchasePrice: 12,  cards: 625 },
      { symbol: "HD",    shares: 8,  purchasePrice: 12,  cards: 625 },
      { symbol: "AMD",   shares: 12, purchasePrice: 12,  cards: 625 },
    ],
  },
  {
    id: "set2",
    name: "Set 2 • Alt Mix",
    rows: [
      { symbol: "BRK-B", shares: 6,  purchasePrice: 340, cards: 400 },
      { symbol: "NFLX",  shares: 5,  purchasePrice: 450, cards: 400 },
      { symbol: "ADBE",  shares: 4,  purchasePrice: 480, cards: 400 },
      { symbol: "ORCL",  shares: 12, purchasePrice: 120, cards: 600 },
      { symbol: "CRM",   shares: 6,  purchasePrice: 220, cards: 500 },
      { symbol: "INTC",  shares: 30, purchasePrice: 40,  cards: 900 },
      { symbol: "QCOM",  shares: 10, purchasePrice: 150, cards: 500 },
      { symbol: "TXN",   shares: 12, purchasePrice: 160, cards: 500 },
      { symbol: "NKE",   shares: 18, purchasePrice: 90,  cards: 700 },
      { symbol: "DIS",   shares: 15, purchasePrice: 95,  cards: 700 },
      { symbol: "ABBV",  shares: 8,  purchasePrice: 150, cards: 500 },
      { symbol: "MRK",   shares: 10, purchasePrice: 110, cards: 600 },
      { symbol: "PFE",   shares: 30, purchasePrice: 35,  cards: 900 },
      { symbol: "T",     shares: 50, purchasePrice: 18,  cards: 1200 },
      { symbol: "VZ",    shares: 40, purchasePrice: 35,  cards: 1000 },
      { symbol: "CVX",   shares: 12, purchasePrice: 155, cards: 600 },
      { symbol: "GE",    shares: 6,  purchasePrice: 140, cards: 500 },
      { symbol: "BA",    shares: 6,  purchasePrice: 180, cards: 500 },
      { symbol: "SHOP",  shares: 10, purchasePrice: 70,  cards: 700 },
      { symbol: "SBUX",  shares: 14, purchasePrice: 90,  cards: 700 },
    ],
  },
  {
    id: "set3",
    name: "ST-091 • Master Veil",
    rows: [
      { symbol: "BRK-B", shares: 6,  purchasePrice: 340, cards: 400 },
      { symbol: "NFLX",  shares: 5,  purchasePrice: 450, cards: 400 },
      { symbol: "ADBE",  shares: 4,  purchasePrice: 480, cards: 400 },
      { symbol: "ORCL",  shares: 12, purchasePrice: 120, cards: 600 },
      { symbol: "CRM",   shares: 6,  purchasePrice: 220, cards: 500 },
      { symbol: "INTC",  shares: 30, purchasePrice: 40,  cards: 900 },
      { symbol: "QCOM",  shares: 10, purchasePrice: 150, cards: 500 },
      { symbol: "TXN",   shares: 12, purchasePrice: 160, cards: 500 },
      { symbol: "NKE",   shares: 18, purchasePrice: 90,  cards: 700 },
      { symbol: "DIS",   shares: 15, purchasePrice: 95,  cards: 700 },
      { symbol: "ABBV",  shares: 8,  purchasePrice: 150, cards: 500 },
      { symbol: "MRK",   shares: 10, purchasePrice: 110, cards: 600 },
      { symbol: "PFE",   shares: 30, purchasePrice: 35,  cards: 900 },
      { symbol: "T",     shares: 50, purchasePrice: 18,  cards: 1200 },
      { symbol: "VZ",    shares: 40, purchasePrice: 35,  cards: 1000 },
      { symbol: "CVX",   shares: 12, purchasePrice: 155, cards: 600 },
      { symbol: "GE",    shares: 6,  purchasePrice: 140, cards: 500 },
      { symbol: "BA",    shares: 6,  purchasePrice: 180, cards: 500 },
      { symbol: "SHOP",  shares: 10, purchasePrice: 70,  cards: 700 },
      { symbol: "SBUX",  shares: 14, purchasePrice: 90,  cards: 700 },
    ],
  },
];

// helpers
export function getPortfolio(setId?: string): PortfolioRow[] {
  const id = setId || PORTFOLIO_SETS[0].id;
  const found = PORTFOLIO_SETS.find((s) => s.id === id);
  return (found ? found.rows : PORTFOLIO_SETS[0].rows).map((r) => ({ ...r, symbol: r.symbol.toUpperCase() }));
}

export function getSymbols(setId?: string): string[] {
  return Array.from(new Set(getPortfolio(setId).map((r) => r.symbol.toUpperCase())));
}
