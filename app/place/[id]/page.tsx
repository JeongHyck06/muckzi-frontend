"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import Feedback, { sendFeedback } from "@/components/Feedback";
import { Crumb, Icon, Photo, StateView } from "@/components/ui";
import { dishLabel, findPlace, meters, type Place, shortLabels, update, useData, walk, won } from "@/lib/store";

const JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

declare global {
  interface Window { kakao: any }
}

function KakaoMap({ p }: { p: Place }) {
  const el = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !el.current) return;
    window.kakao.maps.load(() => {
      const { maps } = window.kakao;
      const center = new maps.LatLng(p.lat, p.lng);
      new maps.Marker({ map: new maps.Map(el.current, { center, level: 3 }), position: center });
    });
  }, [ready, p]);

  if (!JS_KEY) {
    return (
      <a href={p.url} target="_blank" className="mn-photo stack" style={{ height: 200, gap: 8, borderRadius: 20, alignContent: "center" }}>
        <Icon name="calendar" size={28} />
        <span className="t-caption t-3">카카오맵에서 위치 보기</span>
      </a>
    );
  }
  return (
    <>
      <Script src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&autoload=false`} onReady={() => setReady(true)} />
      <div ref={el} className="mn-photo" style={{ height: 200, borderRadius: 20 }} />
    </>
  );
}

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const data = useData();
  const p = findPlace(data, id);
  const [copied, setCopied] = useState(false);

  if (!p) {
    return (
      <div className="container">
        <StateView icon="inbox" title="음식점 정보를 찾을 수 없어요" desc="추천 결과에서 다시 골라 주세요"
          action={<Link href="/results" className="mn-btn mn-btn--secondary">추천 결과로</Link>} />
      </div>
    );
  }

  const saved = data.saved.some((s) => s.id === p.id);
  const toggleSave = () => update((d) => ({ saved: saved ? d.saved.filter((s) => s.id !== p.id) : [p, ...d.saved] }));
  const tags = data.last.tags;
  const fromResults = tags.length > 0 && !!p.keyword && data.last.places.some((x) => x.id === p.id);
  const picked = data.picked.includes(p.id);
  const pick = () => {
    sendFeedback(tags.join(" "), p, true, true);
    update((d) => ({ picked: [p.id, ...d.picked.filter((x) => x !== p.id)] }));
  };
  const copy = () => navigator.clipboard.writeText(p.address).then(() => setCopied(true));

  return (
    <div className="container">
      <Crumb items={[["홈", "/"], ["추천 결과", "/results"], [p.name]]} />
      <div className="split">
        <section className="stack" style={{ gap: 24 }}>
          <Photo src={p.image} maxHeight={420} icon="camera-lg" />
          <div className="stack" style={{ gap: 6 }}>
            <div className="row" style={{ gap: 8 }}>
              <h1 className="t-title" style={{ flex: 1 }}>{p.name}</h1>
              <span className="mn-badge">취향 {p.match}%</span>
            </div>
            <p className="t-body">{p.category} · {meters(p.distance)} · 도보 {walk(p.distance)}분</p>
            {p.hours && (
              <p className="row t-caption" style={{ gap: 6 }}>
                <span className="dot" style={{ background: p.open ? "#30d158" : "var(--text-3)" }} />
                {[p.hours, p.today && `오늘 ${p.today}`].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="stack" style={{ gap: 8, background: "var(--accent-soft)", borderRadius: 20, padding: "14px 16px" }}>
            <p className="row t-caption t-accent" style={{ gap: 6 }}><Icon name="flame" size={16} />왜 추천했나요</p>
            <p className="t-callout">
              {tags.length > 0 && `“${tags.join(" ")}” → `}
              {p.dish ? `${dishLabel(p.dish)} 메뉴가 있고` : `${p.menu} 메뉴가 조건에 잘 맞고`}, 도보 {walk(p.distance)}분 거리에 있어요.
            </p>
            {tags.length > 0 && (
              <div className="mn-tags">
                {tags.map((t) => <span key={t} className="mn-chip mn-chip--category">{t}</span>)}
              </div>
            )}
          </div>
          {fromResults && (
            <Feedback key={p.id} question="이 추천이 잘 맞았나요?" query={tags.join(" ")} places={[p]} />
          )}
          <div className="stack" style={{ gap: 8 }}>
            <p className="t-caption">{p.dishes?.length ? "대표 메뉴" : "추천 메뉴"}</p>
            <div className="mn-card mn-list">
              {p.dishes?.length ? p.dishes.map((d, i) => (
                <div key={d.name} className="mn-row mn-row--tall">
                  <div className="mn-row__texts">
                    <p className="mn-row__title">{d.name}</p>
                    {i === 0 && p.dish && <p className="t-body t-accent">추천 메뉴</p>}
                  </div>
                  <span className="mn-row__detail">{won(d.price)}</span>
                </div>
              )) : (
                <div className="mn-row mn-row--tall">
                  <div className="mn-row__texts">
                    <p className="mn-row__title">{p.menu}</p>
                    <p className="t-body">{shortLabels(p).join(" · ") || p.category}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="stack side side--400" style={{ gap: 16 }}>
          <div className="mn-card mn-list">
            <div className="mn-row mn-row--tall">
              <div className="mn-row__texts">
                <p className="mn-row__title" style={{ fontWeight: 400, color: "var(--text-2)" }}>주소</p>
                <p className="t-body" style={{ color: "var(--text)" }}>{p.address}</p>
              </div>
              <button className="t-body-lg t-accent" style={{ fontWeight: 500 }} onClick={copy}>{copied ? "복사됨" : "복사"}</button>
            </div>
            {p.phone && (
              <a href={`tel:${p.phone}`} className="mn-row mn-row--tall">
                <div className="mn-row__texts">
                  <p className="mn-row__title" style={{ fontWeight: 400, color: "var(--text-2)" }}>전화</p>
                  <p className="t-body" style={{ color: "var(--text)" }}>{p.phone}</p>
                </div>
                <Icon name="chevron" size={24} />
              </a>
            )}
            {p.hours && (
              <div className="mn-row mn-row--tall">
                <div className="mn-row__texts">
                  <p className="mn-row__title" style={{ fontWeight: 400, color: "var(--text-2)" }}>영업시간</p>
                  <p className="t-body" style={{ color: "var(--text)" }}>{p.today ? `오늘 ${p.today}` : p.hours}</p>
                </div>
              </div>
            )}
            <a href={p.url} target="_blank" className="mn-row mn-row--tall">
              <div className="mn-row__texts">
                <p className="mn-row__title" style={{ fontWeight: 400, color: "var(--text-2)" }}>카카오맵</p>
                <p className="t-body" style={{ color: "var(--text)" }}>리뷰와 전체 메뉴 보기</p>
              </div>
              <Icon name="chevron" size={24} />
            </a>
          </div>
          <div className="row" style={{ gap: 12 }}>
            <button className="mn-btn mn-btn--secondary" style={{ width: 120 }} onClick={toggleSave} aria-pressed={saved}>
              <Icon name="bell" size={20} />{saved ? "저장됨" : "저장"}
            </button>
            <a className="mn-btn mn-btn--accent" style={{ flex: 1 }} target="_blank"
              href={`https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lng}`}>
              길찾기 · 도보 {walk(p.distance)}분
            </a>
          </div>
          {fromResults && (
            <button className="mn-btn mn-btn--secondary" style={{ width: "100%", color: "var(--accent)" }}
              disabled={picked} onClick={pick}>
              {picked ? "골랐어요, 맛있게 드세요" : "이걸로 골랐어요!"}
            </button>
          )}
          <KakaoMap p={p} />
        </aside>
      </div>
    </div>
  );
}
