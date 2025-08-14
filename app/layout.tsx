// app/layout.tsx
import SiteNav from "@/components/SiteNav";
import type { Metadata } from "next";
import "./globals.css"; // keep if you have it

export const metadata: Metadata = {
  title: "Token",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main className="min-h-dvh">{children}</main>
      </body>
    </html>
  );
}
