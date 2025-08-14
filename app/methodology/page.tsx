// app/methodology/page.tsx
export default function MethodologyPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Methodology</h1>
      <p className="opacity-80">
        Prices shown are either today’s OPEN during market hours, or today’s CLOSE
        (falling back to previous close) outside market hours. Sources are Stooq/Yahoo (and Finnhub if configured).
      </p>
      <ul className="list-disc pl-6 space-y-1 opacity-80">
        <li>Holdings and purchase prices are defined in <code>data/portfolios.ts</code>.</li>
        <li>Values and P/L are computed on the fly per selected set.</li>
        <li>Server caches are namespaced per set to avoid collisions.</li>
      </ul>
    </div>
  );
}
