import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
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
        {/* Google Analytics 4. This is Google's own gtag snippet, only loaded
            after hydration instead of blocking in the head, which is the whole
            reason to use the component rather than paste the script Google
            hands you. The measurement ID is public by design — it travels in
            every request the tag makes — so it is written here rather than held
            in an environment variable that could only fail silently. */}
        <GoogleAnalytics gaId="G-1XJLK16LG7" />
      </body>
    </html>
  );
}
