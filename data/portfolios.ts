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
      { symbol: "BAC",     shares: 0.0495638, purchasePrice: 50.44,  cards: 125 },
      { symbol: "CAT",     shares: 0.0046202, purchasePrice: 541.10,  cards: 125 },
      { symbol: "MSFT",     shares: 0.0048865, purchasePrice: 511.61,  cards: 125 },
      { symbol: "TSLA",     shares: 0.0058309, purchasePrice: 428.75,  cards: 125 },
      { symbol: "KO",     shares: 0.0369932, purchasePrice: 67.58,  cards: 125 },
      { symbol: "PFE",     shares: 0.1031779, purchasePrice: 24.23,  cards: 125 },
      { symbol: "CVX",     shares: 0.0164064, purchasePrice: 152.38,  cards: 125 },
      { symbol: "AMT",     shares: 0.0130569, purchasePrice: 191.47,  cards: 125 },
      { symbol: "GOOGL",     shares: 0.0099419, purchasePrice: 251.46,  cards: 125 },
      { symbol: "DD",     shares: 0.0320801, purchasePrice: 77.93,  cards: 125 }
      { symbol: "DUK",     shares: 0.0196232, purchasePrice: 127.40,  cards: 125 }
      { symbol: "WFC",     shares: 0.0297619, purchasePrice: 84.00,  cards: 125 }
      { symbol: "GE",     shares: 0.0083408, purchasePrice: 299.73,  cards: 125 }
      { symbol: "NVDA",     shares: 0.0137506, purchasePrice: 181.81,  cards: 125 }
      { symbol: "NKE",     shares: 0.0374083, purchasePrice: 66.83,  cards: 125 }
      { symbol: "PEP",     shares: 0.0163720, purchasePrice: 152.70,  cards: 125 }
      { symbol: "MRK",     shares: 0.0297903, purchasePrice: 83.92,  cards: 125 }
      { symbol: "COP",     shares: 0.0284770, purchasePrice: 87.79,  cards: 125 }
      { symbol: "SPG",     shares: 0.0141451, purchasePrice: 176.74,  cards: 125 }
      { symbol: "NFLX",     shares: 0.0021122, purchasePrice: 1183.59,  cards: 125 }
      { symbol: "LIN",     shares: 0.0056210, purchasePrice: 444.76,  cards: 125 }
      { symbol: "D",     shares: 0.0412405, purchasePrice: 60.62,  cards: 125 }
      { symbol: "C",     shares: 0.0259713, purchasePrice: 96.26,  cards: 125 }
      { symbol: "LMT",     shares: 0.0050718, purchasePrice: 492.92,  cards: 125 }
      { symbol: "AMD",     shares: 0.0106583, purchasePrice: 234.56,  cards: 125 }
      { symbol: "DIS",     shares: 0.0227480, purchasePrice: 109.90,  cards: 125 }
      { symbol: "WMT",     shares: 0.0234808, purchasePrice: 106.47,  cards: 125 }
      { symbol: "LLY",     shares: 0.0030511, purchasePrice: 819.38,  cards: 125 }
      { symbol: "OXY",     shares: 0.0597943, purchasePrice: 41.81,  cards: 125 }
      { symbol: "O",     shares: 0.1124979, purchasePrice: 59.29,  cards: 117 }
      { symbol: "T",     shares: 0.2545802, purchasePrice: 26.20,  cards: 117 }
      { symbol: "NUE",     shares: 0.0504615, purchasePrice: 132.18,  cards: 117 }
      { symbol: "SO",     shares: 0.0677639, purchasePrice: 98.43,  cards: 117 }
      { symbol: "GS",     shares: 0.0087984, purchasePrice: 758.09,  cards: 117 }
      { symbol: "RTX",     shares: 0.0425112, purchasePrice: 156.90,  cards: 117 }
      { symbol: "INTC",     shares: 0.1810532, purchasePrice: 36.84,  cards: 117 }
      { symbol: "SBUX",     shares: 0.0790847, purchasePrice: 84.34,  cards: 117 }
      { symbol: "COST",     shares: 0.0072060, purchasePrice: 925.62,  cards: 117 }
      { symbol: "ABBV",     shares: 0.0294001, purchasePrice: 226.87,  cards: 117 }
      { symbol: "SLB",     shares: 0.2042254, purchasePrice: 32.66,  cards: 117 }
      { symbol: "DLR",     shares: 0.0383421, purchasePrice: 173.96,  cards: 117 }
      { symbol: "VZ",     shares: 0.1652626, purchasePrice: 40.36,  cards: 117 }
      { symbol: "FCX",     shares: 0.1608780, purchasePrice: 41.46,  cards: 117 }
      { symbol: "AEP",     shares: 0.0567515, purchasePrice: 117.53,  cards: 117 }
      { symbol: "MS",     shares: 0.0416823, purchasePrice: 160.02,  cards: 117 }
      { symbol: "HON",     shares: 0.0328458, purchasePrice: 203.07,  cards: 117 }
      { symbol: "AVGO",     shares: 0.0188338, purchasePrice: 354.15,  cards: 117 }
      { symbol: "HD",     shares: 0.0172156, purchasePrice: 387.44,  cards: 117 }
      { symbol: "CL",     shares: 0.0854143, purchasePrice: 78.09,  cards: 117 }
      { symbol: "BMY",     shares: 0.1537221, purchasePrice: 43.39,  cards: 117 }
      { symbol: "HAL",     shares: 0.3086534, purchasePrice: 21.61,  cards: 117 }
      { symbol: "EQIX",     shares: 0.0082065, purchasePrice: 812.77,  cards: 117 }
      { symbol: "TMUS",     shares: 0.0294546, purchasePrice: 226.45,  cards: 117 }
      { symbol: "NEM",     shares: 0.0683122, purchasePrice: 97.64,  cards: 117 }
      { symbol: "EXC",     shares: 0.1408361, purchasePrice: 47.36,  cards: 117 }
      { symbol: "BRK-B",     shares: 0.0136454, purchasePrice: 488.81,  cards: 117 }
      { symbol: "DE",     shares: 0.0145968, purchasePrice: 456.95,  cards: 117 }
      { symbol: "CSCO",     shares: 0.0965407, purchasePrice: 69.09,  cards: 117 }
      { symbol: "MCD",     shares: 0.0218846, purchasePrice: 304.78,  cards: 117 }
      { symbol: "MDLZ",     shares: 0.2435065, purchasePrice: 61.60,  cards: 62 }
      { symbol: "AMGN",     shares: 0.0507082, purchasePrice: 295.81,  cards: 62 }
      { symbol: "PSX",     shares: 0.1172425, purchasePrice: 127.94,  cards: 62 }
      { symbol: "AVB",     shares: 0.0813184, purchasePrice: 184.46,  cards: 62 }
      { symbol: "CMCSA",     shares: 0.5126452, purchasePrice: 29.26,  cards: 62 }
      { symbol: "SHW",     shares: 0.0451481, purchasePrice: 332.24,  cards: 62 }
      { symbol: "XEL",     shares: 0.1849568, purchasePrice: 81.10,  cards: 62 }
      { symbol: "BLK",     shares: 0.0128056, purchasePrice: 1171.36,  cards: 62 }
      { symbol: "UNP",     shares: 0.0669673, purchasePrice: 223.99,  cards: 62 }
      { symbol: "ORCL",     shares: 0.0479233, purchasePrice: 313.00,  cards: 62 }
      { symbol: "TGT",     shares: 0.1665556, purchasePrice: 90.06,  cards: 62 }
      { symbol: "KMB",     shares: 0.1253133, purchasePrice: 119.70,  cards: 62 }
      { symbol: "GILD",     shares: 0.1272804, purchasePrice: 117.85,  cards: 62 }
      { symbol: "MPC",     shares: 0.0830979, purchasePrice: 180.51,  cards: 62 }
      { symbol: "WELL",     shares: 0.0871688, purchasePrice: 172.08,  cards: 62 }
      { symbol: "WBD",     shares: 0.8201203, purchasePrice: 18.29,  cards: 62 }
      { symbol: "ALB",     shares: 0.1579280, purchasePrice: 94.98,  cards: 62 }
      { symbol: "ED",     shares: 0.1484120, purchasePrice: 101.07,  cards: 62 }
      { symbol: "SCHW",     shares: 0.1605824, purchasePrice: 93.41,  cards: 62 }
      { symbol: "FDX",     shares: 0.0633473, purchasePrice: 236.79,  cards: 62 }
      { symbol: "ADBE",     shares: 0.1214956, purchasePrice: 329.23,  cards: 25 }
      { symbol: "LOW",     shares: 0.1645210, purchasePrice: 243.13,  cards: 25 }
      { symbol: "UL",     shares: 0.6449532, purchasePrice: 62.02,  cards: 25 }
      { symbol: "TMO",     shares: 0.0745184, purchasePrice: 536.78,  cards: 25 }
      { symbol: "VLO",     shares: 0.2574831, purchasePrice: 155.35,  cards: 25 }
      { symbol: "PSA",     shares: 0.1304079, purchasePrice: 306.73,  cards: 25 }
      { symbol: "RBLX",     shares: 0.2974199, purchasePrice: 134.49,  cards: 25 }
      { symbol: "APD",     shares: 0.1580403, purchasePrice: 253.10,  cards: 25 }
      { symbol: "INVH",     shares: 1.4059754, purchasePrice: 28.45,  cards: 25 }
      { symbol: "VNO",     shares: 1.0126582, purchasePrice: 39.50,  cards: 25 }
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
