import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SmoothScroll from "@/components/site/SmoothScroll";
import Motion from "@/components/type/Motion";
import Header from "@/components/site/Header";

export const metadata: Metadata = {
  title: "Selected Work — Brandon Lee",
  description: "Vehicle design, brand identity, and motion.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        <Motion />
        <Header />
        {children}
        {/* Page views, counted by Vercel. It ships nothing on a local run — the
            script only loads on a Vercel deployment — and sets no cookie, so it
            does not put a consent banner on a portfolio. */}
        <Analytics />
      </body>
    </html>
  );
}
