"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { locate, meters, nextRadius, update, useData } from "@/lib/store";

export default function Me() {
  const data = useData();
  const [editing, setEditing] = useState(false);
  const ranked = Object.entries(data.history).sort((a, b) => b[1].n - a[1].n);
  const likes = ranked.filter(([, v]) => !v.avoid).slice(0, 8).map(([k]) => k);
  const avoids = ranked.filter(([, v]) => v.avoid).slice(0, 8).map(([k]) => k);
  const forget = (label: string) => update((d) => {
    const history = { ...d.history };
    delete history[label];
    return { history };
  });
  const chip = (label: string, selected: boolean) => editing ? (
    <button key={label} className="mn-chip mn-chip--removable" aria-label={`${label} 지우기`} onClick={() => forget(label)}>
      {label}<Icon name="x" size={14} />
    </button>
  ) : (
    <span key={label} className={`mn-chip${selected ? " mn-chip--selected" : ""}`}>
      {label}{selected && <Icon name="check" size={14} />}
    </span>
  );

  return (
    <div className="container">
      <div className="stack" style={{ gap: 4 }}>
        <h1 className="t-title">내 취향</h1>
        <p className="t-body">지금까지 {data.count}번 추천받았어요</p>
      </div>
      <div className="split">
        <section className="stack" style={{ gap: 24 }}>
          <div className="mn-card mn-card--pad">
            <div className="row" style={{ gap: 8 }}>
              <p className="t-headline" style={{ flex: 1 }}>자주 고른 취향</p>
              {ranked.length > 0 && (
                <button className="mn-btn mn-btn--ghost" onClick={() => setEditing(!editing)}>{editing ? "완료" : "수정"}</button>
              )}
            </div>
            {likes.length > 0 ? <div className="wrap">{likes.map((l) => chip(l, true))}</div> : (
              <p className="t-body">추천을 받으면 자주 고른 태그가 여기에 모여요</p>
            )}
            {avoids.length > 0 && (
              <div className="stack" style={{ gap: 6 }}>
                <p className="t-caption">피하는 것</p>
                <div className="wrap">{avoids.map((l) => chip(l, false))}</div>
              </div>
            )}
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <p className="t-caption">설정</p>
            <div className="mn-card mn-list">
              <button className="mn-row" onClick={locate}>
                <span className="mn-row__title" style={{ flex: 1 }}>기본 위치</span>
                <span className="mn-row__detail">{data.loc.label}</span>
              </button>
              <button className="mn-row" onClick={() => update((d) => ({ radius: nextRadius(d.radius) }))}>
                <span className="mn-row__title" style={{ flex: 1 }}>검색 반경</span>
                <span className="mn-row__detail">{meters(data.radius)}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="stack" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <p className="t-caption" style={{ flex: 1 }}>저장한 곳</p>
            <span className="mn-badge mn-badge--neutral">{data.saved.length}</span>
          </div>
          <div className="mn-card mn-list">
            {data.saved.length === 0 && <p className="mn-row t-body">상세 화면에서 저장하면 여기에 모여요</p>}
            {data.saved.map((p) => (
              <Link key={p.id} href={`/place/${p.id}`} className="mn-place">
                <span className="mn-photo" style={{ width: 40, height: 40, borderRadius: 12, flex: "none" }}>
                  {p.image ? <img src={p.image} alt="" referrerPolicy="no-referrer" /> : <Icon name="camera-sm" size={18} />}
                </span>
                <span className="mn-row mn-row--tall">
                  <span className="mn-row__texts">
                    <span className="mn-row__title">{p.name}</span>
                    <span className="t-body">{p.category} · {meters(p.distance)} · 취향 {p.match}%</span>
                  </span>
                  <Icon name="chevron" size={24} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
