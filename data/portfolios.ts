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
    name: "Set 1 • Sectors",
    rows: [
      { symbol: "JPM",  shares: 0.0083741, purchasePrice: 298.54, cards: 125 },
      { symbol: "BA",  shares: 0.0118136, purchasePrice: 211.62, cards: 125 },
      { symbol: "AAPL",  shares: 0.0101031,  purchasePrice: 247.45,  cards: 125 },
      { symbol: "AMZN",  shares: 0.0116566, purchasePrice: 214.47,  cards: 125 },
      { symbol: "PG", shares: 0.0167068, purchasePrice: 149.64,  cards: 125 },
      { symbol: "JNJ",  shares: 0.0130127,  purchasePrice: 192.12,  cards: 125 },
      { symbol: "XOM",  shares: 0.0223634,  purchasePrice: 111.79, cards: 125 },
      { symbol: "PLD",  shares: 0.0206322,  purchasePrice: 121.17,  cards: 125 },
      { symbol: "META",   shares: 0.0035109, purchasePrice: 712.07,  cards: 125 },
      { symbol: "DOW",   shares: 0.1151013, purchasePrice: 21.72,  cards: 125 },
      { symbol: "NEE",     shares: 0.0293945, purchasePrice: 85.05,  cards: 125 },
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
