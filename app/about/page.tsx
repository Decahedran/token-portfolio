// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="opacity-80">
        This is a demonstration site that renders multiple fake portfolios using live open/close prices.
        Nothing here is investment advice.
      </p>
    </div>
  );
}
