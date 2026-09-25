"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { useData } from "@/lib/store";

const EXAMPLES = ["매운 거", "든든한 국물", "혼밥", "비 오는 날 파전", "가볍게", "튀김 말고"];
const STEPS = [
  ["문장으로 말하기", "\"얼얼한 국물, 혼밥\" 처럼 편하게"],
  ["태그 확인", "맛·메뉴·상황·거리로 정리된 조건을 고쳐요"],
  ["추천 받기", "반경 안에서 일치도 순으로 골라 드려요"],
];

export default function Home() {
  const router = useRouter();
  const data = useData();
  const [text, setText] = useState(useSearchParams().get("q") ?? "");
  const go = (q: string) => q.trim() && router.push(`/tags?q=${encodeURIComponent(q.trim())}`);

  return (
    <div className="container">
      <div className="split split--wide">
        <section className="stack" style={{ gap: 24 }}>
          <div className="stack" style={{ gap: 8 }}>
            <p className="t-caption t-accent">주변 음식점 추천</p>
            <h1 className="t-display">지금 뭐 먹지?<br />오늘 당기는 걸 그냥 말해요</h1>
            <p className="t-body-lg" style={{ color: "var(--text-2)", maxWidth: 460 }}>
              문장을 입력하면 맛·메뉴·상황·거리 태그로 정리하고, 반경 안에서 가장 잘 맞는 곳을 골라 드려요.
            </p>
          </div>
          <form className="mn-card mn-card--pad" onSubmit={(e) => { e.preventDefault(); go(text); }}>
            <textarea
              className="t-body-lg"
              value={text}
              maxLength={200}
              rows={4}
              placeholder="예: 얼얼한 국물에 밥 말아 먹고 싶어. 혼자 가도 편한 데"
              aria-label="먹고 싶은 것"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && go(text)}
              style={{ background: "none", border: 0, outline: 0, resize: "none", color: "var(--text)", font: "inherit", height: 96 }}
            />
            <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
              <p className="t-caption t-3">맛 · 메뉴 · 상황 · 거리 무엇이든 &nbsp;{text.length}/200</p>
              <button className="mn-btn mn-btn--accent mn-btn--sm" style={{ width: 150 }} disabled={!text.trim()}>
                <Icon name="arrow-right" size={20} />추천 받기
              </button>
            </div>
          </form>
          <div className="stack" style={{ gap: 8 }}>
            <p className="t-caption">이런 식으로도 말할 수 있어요</p>
            <div className="wrap">
              {EXAMPLES.map((ex) => (
                <button key={ex} className="mn-chip" onClick={() => setText(ex)}>{ex}</button>
              ))}
            </div>
          </div>
        </section>

        <aside className="stack side" style={{ gap: 16 }}>
          <div className="mn-card mn-list">
            <div className="mn-row mn-row--tall">
              <div className="mn-row__texts">
                <p className="mn-row__title">현재 위치</p>
                <p className="t-body">{data.loc.label} · 반경 {data.radius}m</p>
              </div>
              <Link href="/location" className="t-body-lg t-accent" style={{ fontWeight: 500 }}>변경</Link>
            </div>
            {data.recent.slice(0, 3).map((q) => (
              <Link key={q} href={`/tags?q=${encodeURIComponent(q)}`} className="mn-row mn-row--tall">
                <div className="mn-row__texts">
                  <p className="mn-row__title" style={{ fontWeight: 400 }}>{q}</p>
                  <p className="t-body">최근</p>
                </div>
                <Icon name="chevron" size={24} />
              </Link>
            ))}
          </div>
          <ol className="mn-card mn-card--pad" style={{ gap: 16, listStyle: "none" }}>
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                <span className="t-accent" style={{ fontSize: 22, fontWeight: 900 }}>{i + 1}</span>
                <div className="stack" style={{ gap: 2 }}>
                  <p className="t-headline">{title}</p>
                  <p className="t-callout" style={{ color: "var(--text-2)" }}>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
