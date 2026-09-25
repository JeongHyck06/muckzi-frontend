"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { locate, meters, useData } from "@/lib/store";

const LINKS = [
  { href: "/", label: "홈", match: (p: string) => p === "/" || p.startsWith("/tags") },
  { href: "/results", label: "추천", match: (p: string) => p.startsWith("/results") || p.startsWith("/place") },
  { href: "/me", label: "내 취향", match: (p: string) => p.startsWith("/me") },
];

export default function Navbar() {
  const path = usePathname();
  const data = useData();

  useEffect(() => {
    // 접속할 때마다 한 번 현재 위치로 잡고, 같은 탭에서 직접 바꾼 위치는 새로고침해도 유지한다
    try {
      if (sessionStorage.getItem("located")) return;
      sessionStorage.setItem("located", "1");
    } catch {}
    locate();
  }, []);

  return (
    <header className="mn-navbar">
      <div className="mn-navbar__inner">
        <Link href="/" className="mn-brand">
          먹지
        </Link>
        <nav className="mn-navbar__links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mn-navbar__link" aria-current={l.match(path) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/location" className="mn-chip mn-navbar__loc" title="위치 바꾸기">
          {data.loc.label} · {meters(data.radius)}
        </Link>
      </div>
    </header>
  );
}
