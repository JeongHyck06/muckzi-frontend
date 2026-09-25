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
    try {
      if (!localStorage.getItem("muckzi")) locate();
    } catch {}
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
        <button className="mn-chip mn-navbar__loc" onClick={locate} title="현재 위치로 바꾸기">
          {data.loc.label} · {meters(data.radius)}
        </button>
      </div>
    </header>
  );
}
