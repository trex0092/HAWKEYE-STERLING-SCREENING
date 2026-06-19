import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAWKEYE · Sterling Screening",
  description: "Compliance & sanctions screening console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-ink-1 antialiased">{children}</body>
    </html>
  );
}
