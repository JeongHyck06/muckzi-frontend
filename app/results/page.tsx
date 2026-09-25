"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Feedback from "@/components/Feedback";
import { Crumb, Icon, Photo, StateView } from "@/components/ui";
import { dishLabel, meters, nextRadius, type Place, shortLabels, update, useData, walk } from "@/lib/store";

type Status = "loading" | "done" | "error";

function Card({ p }: { p: Place }) {
  return (
    <Link href={`/place/${p.id}`} className="mn-card mn-card--pad" style={{ padding: 12 }}>
      <Photo src={p.image} height={150} icon="camera" />
      <div className="row" style={{ gap: 8 }}>
        <p className="t-headline" style={{ flex: 1 }}>{p.name}</p>
        <span className="mn-badge">취향 {p.match}%</span>
      </div>
      <p className="t-caption">{p.category} · {meters(p.distance)} · 도보 {walk(p.distance)}분</p>
      <p className="t-caption">
        {[p.dish ? dishLabel(p.dish) : `추천 메뉴 ${p.menu}`, p.hours].filter(Boolean).join(" · ")}
      </p>
      <div className="mn-tags">
        {shortLabels(p).map((l) => <span key={l} className="mn-chip mn-chip--category">{l}</span>)}
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="mn-card mn-card--pad" style={{ padding: 12 }}>
      <div className="skeleton" style={{ height: 150, borderRadius: 16 }} />
      <div className="skeleton" style={{ height: 20, width: "60%" }} />
      <div className="skeleton" style={{ height: 14, width: "40%" }} />
    </div>
  );
}

export default function Results() {
  const params = useSearchParams();
  const data = useData();
  const urlTags = params.getAll("tag");
  const tags = urlTags.length ? urlTags : data.last.tags;
  const query = tags.join(" ");
  const [status, setStatus] = useState<Status>("loading");
  const [places, setPlaces] = useState<Place[]>([]);
  const [sort, setSort] = useState<"match" | "distance">("match");
  const { lat, lng, label } = data.loc;

  useEffect(() => {
    if (!query) return;
    setStatus("loading");
    fetch(`/api/recommend?${new URLSearchParams({ q: query, lat: `${lat}`, lng: `${lng}`, radius: `${data.radius}` })}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((res: { places: Place[] }) => {
        setPlaces(res.places);
        setStatus("done");
        update(() => ({ last: { tags, places: res.places } }));
      })
      .catch(() => setStatus("error"));
  }, [query, lat, lng, data.radius]);

  if (!query) {
    return (
      <div className="container">
        <StateView icon="inbox" title="아직 추천받은 적이 없어요" desc="먹고 싶은 걸 말하면 주변에서 골라 드려요"
          action={<Link href="/" className="mn-btn mn-btn--accent">추천 받으러 가기</Link>} />
      </div>
    );
  }

  const sorted = sort === "match" ? places : [...places].sort((a, b) => a.distance - b.distance);
  const wider = nextRadius(data.radius);

  return (
    <div className="container">
      <Crumb items={[["홈", "/"], ["취향 정리", `/tags?q=${encodeURIComponent(query)}`], ["추천 결과"]]} />
      <div className="wrap">
        {tags.map((t) => (
          <span key={t} className="mn-chip mn-chip--selected">{t}<Icon name="check" size={14} /></span>
        ))}
        <Link href={`/tags?q=${encodeURIComponent(query)}`} className="mn-chip mn-chip--add">
          <Icon name="plus" size={14} />수정
        </Link>
      </div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 2 }}>
          <h1 className="t-title">{status === "loading" ? "주변을 살펴보는 중" : `${places.length}곳 추천`}</h1>
          <p className="t-body">{label} 반경 {meters(data.radius)} · 취향 일치도 순</p>
        </div>
        <div className="mn-tabs" role="tablist">
          {([["match", "추천순"], ["distance", "거리순"]] as const).map(([key, text]) => (
            <button key={key} role="tab" aria-selected={sort === key} onClick={() => setSort(key)}>{text}</button>
          ))}
        </div>
      </div>

      {status === "error" && (
        <StateView icon="inbox" title="추천을 불러오지 못했어요" desc="잠시 뒤 다시 시도해 주세요"
          action={<button className="mn-btn mn-btn--secondary" onClick={() => location.reload()}>다시 시도</button>} />
      )}
      {status === "done" && places.length === 0 && (
        <StateView icon="inbox" title="조건에 맞는 곳이 없어요" desc={`반경을 ${meters(wider)}로 넓히거나 태그를 빼 보세요`}
          action={wider > data.radius && (
            <button className="mn-btn mn-btn--secondary" onClick={() => update(() => ({ radius: wider }))}>
              반경 {meters(wider)}로 넓히기
            </button>
          )} />
      )}
      <div className="grid">
        {status === "loading" && [0, 1, 2].map((i) => <Skeleton key={i} />)}
        {status === "done" && sorted.map((p) => <Card key={p.id} p={p} />)}
      </div>
      {status === "done" && places.length > 0 && (
        <div className="mn-card mn-card--pad">
          <Feedback key={query} question="결과에 만족하시나요?" query={query} places={places} />
        </div>
      )}
    </div>
  );
}
