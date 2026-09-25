"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { KAKAO_JS_KEY, useKakaoMaps } from "@/components/kakao";
import { Crumb, Icon } from "@/components/ui";
import { type Data, meters, RADII, update, useData } from "@/lib/store";

type Spot = { name: string; address: string; lat: number; lng: number };
type Loc = Data["loc"];

async function regionName(lat: number, lng: number) {
  const res = await fetch(`/api/region?lat=${lat}&lng=${lng}`).catch(() => null);
  return res?.ok ? (await res.json()).name || "선택한 위치" : "선택한 위치";
}

export default function LocationPage() {
  const router = useRouter();
  const data = useData();
  const ready = useKakaoMaps();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const nextLabel = useRef<string | null>(null);
  const touched = useRef(false);
  const [pick, setPick] = useState<Loc | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [spots, setSpots] = useState<Spot[] | null>(null);
  const loc = pick ?? data.loc;

  useEffect(() => {
    if (!ready || !el.current || map.current) return;
    const { maps } = window.kakao;
    const center = new maps.LatLng(data.loc.lat, data.loc.lng);
    const m = new maps.Map(el.current, { center, level: 4 });
    const pin = document.createElement("span");
    pin.className = "pin";
    marker.current = new maps.CustomOverlay({ map: m, position: center, content: pin, zIndex: 2 });
    maps.event.addListener(m, "dragstart", () => (touched.current = true));
    maps.event.addListener(m, "idle", async () => {
      const c = m.getCenter();
      const lat = c.getLat(), lng = c.getLng();
      marker.current.setPosition(c);
      const label = nextLabel.current ?? (await regionName(lat, lng));
      nextLabel.current = null;
      setPick({ lat, lng, label });
    });
    map.current = m;
  }, [ready, data.loc]);

  // 접속 시 받은 현재 위치가 지도보다 늦게 오면, 사용자가 아직 지도를 건드리지 않았을 때만 따라간다
  useEffect(() => {
    if (!touched.current && map.current) moveTo(data.loc.lat, data.loc.lng, data.loc.label);
  }, [data.loc]);

  const moveTo = (lat: number, lng: number, label: string | null, byUser = false) => {
    touched.current ||= byUser;
    if (map.current) {
      nextLabel.current = label;
      map.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
    } else {
      (label ? Promise.resolve(label) : regionName(lat, lng)).then((l) => setPick({ lat, lng, label: l }));
    }
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`/api/search?${new URLSearchParams({ q: query, lat: `${loc.lat}`, lng: `${loc.lng}` })}`)
      .catch(() => null);
    setSpots(res?.ok ? await res.json() : []);
  };

  const here = () => navigator.geolocation?.getCurrentPosition(({ coords }) => moveTo(coords.latitude, coords.longitude, null, true));

  const save = () => {
    update((d) => ({ loc, radius: radius ?? d.radius }));
    if (history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="container narrow">
      <Crumb items={[["홈", "/"], ["위치 설정"]]} />
      <div className="stack" style={{ gap: 4 }}>
        <h1 className="t-title">위치 설정</h1>
        <p className="t-body">지도를 움직여 핀을 원하는 곳에 맞추거나 장소를 검색해 주세요</p>
      </div>

      <form className="mn-card row" style={{ padding: "6px 6px 6px 16px", gap: 8 }} onSubmit={search}>
        <input className="t-body-lg" value={query} maxLength={50} placeholder="예: 성공회대, 역곡역" aria-label="장소 검색"
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 0, background: "none", border: 0, outline: 0, color: "var(--text)", font: "inherit" }} />
        <button className="mn-btn mn-btn--accent mn-btn--sm" disabled={!query.trim()}>검색</button>
      </form>

      {spots && (
        <div className="mn-card mn-list">
          {spots.length === 0 && <p className="mn-row t-body">검색 결과가 없어요</p>}
          {spots.map((s) => (
            <button key={`${s.name}${s.lat}`} className="mn-row mn-row--tall"
              onClick={() => { moveTo(s.lat, s.lng, s.name, true); setSpots(null); }}>
              <span className="mn-row__texts">
                <span className="mn-row__title">{s.name}</span>
                <span className="t-body">{s.address}</span>
              </span>
              <Icon name="chevron" size={24} />
            </button>
          ))}
        </div>
      )}

      <div className="mn-photo" style={{ aspectRatio: "4 / 3", maxHeight: 420, borderRadius: 20 }}>
        {KAKAO_JS_KEY ? (
          <div ref={el} style={{ position: "absolute", inset: 0 }} />
        ) : (
          <p className="t-caption t-3" style={{ padding: 20, textAlign: "center" }}>지도를 쓰려면 카카오 JavaScript 키가 필요해요<br />위에서 장소를 검색해 고를 수 있어요</p>
        )}
      </div>

      <div className="mn-card mn-list">
        <div className="mn-row mn-row--tall">
          <div className="mn-row__texts">
            <p className="mn-row__title" style={{ fontWeight: 400, color: "var(--text-2)" }}>선택한 위치</p>
            <p className="t-body" style={{ color: "var(--text)" }}>{loc.label}</p>
          </div>
          <button className="t-body-lg t-accent" style={{ fontWeight: 500 }} onClick={here}>현재 위치로</button>
        </div>
        <div className="mn-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <span className="mn-row__title">검색 반경</span>
          <div className="wrap">
            {RADII.map((r) => (
              <button key={r} className={`mn-chip${(radius ?? data.radius) === r ? " mn-chip--selected" : ""}`}
                onClick={() => setRadius(r)}>{meters(r)}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="mn-btn mn-btn--secondary" onClick={() => router.back()}>취소</button>
        <button className="mn-btn mn-btn--accent" onClick={save}>이 위치로 설정</button>
      </div>
    </div>
  );
}
