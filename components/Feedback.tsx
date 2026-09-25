"use client";

import { useState } from "react";
import type { Place } from "@/lib/store";

export default function Feedback({ question, query, places }: { question: string; query: string; places: Place[] }) {
  const [sent, setSent] = useState(false);

  const send = (liked: boolean) => {
    setSent(true);
    const seen = new Set<string>();
    for (const p of places) {
      if (!p.keyword || seen.has(p.keyword)) continue;
      seen.add(p.keyword);
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, keyword: p.keyword, menu: p.menu, place_id: p.id, liked }),
      }).catch(() => {});
    }
  };

  if (sent) return <p className="t-callout" style={{ color: "var(--text-2)" }}>의견 고마워요, 다음 추천에 반영할게요</p>;
  return (
    <div className="row" style={{ gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
      <p className="t-headline">{question}</p>
      <div className="row" style={{ gap: 8 }}>
        <button className="mn-chip" onClick={() => send(true)}>좋아요</button>
        <button className="mn-chip" onClick={() => send(false)}>별로예요</button>
      </div>
    </div>
  );
}
