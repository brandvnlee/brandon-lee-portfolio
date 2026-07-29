import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
