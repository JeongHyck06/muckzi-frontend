import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import "./globals.css";

const font = Noto_Sans_KR({ weight: ["400", "500", "700", "900"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "먹지",
  description: "오늘 당기는 걸 말하면 주변 음식점을 골라 드려요",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={font.className}>
        <Navbar />
        <main className="page">
          <Suspense>{children}</Suspense>
        </main>
        <footer className="mn-footer">
          <nav>
            <Link href="/">홈</Link>
            <Link href="/me">내 취향</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
