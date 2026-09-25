"use client";

import { useSyncExternalStore } from "react";

export type Tag = { label: string; group: string; avoid: boolean };

export type Place = {
  id: string; name: string; category: string; address: string; phone: string; distance: number;
  lat: number; lng: number; url: string; image: string | null; menu: string; labels: string; match: number;
  dish?: Dish | null; dishes?: Dish[]; hours?: string | null; today?: string | null; open?: boolean | null;
};

export type Dish = { name: string; price: number | null };

export type Data = {
  loc: { lat: number; lng: number; label: string };
  radius: number;
  recent: string[];
  count: number;
  history: Record<string, { n: number; avoid: boolean }>;
  saved: Place[];
  last: { tags: string[]; places: Place[] };
};

const KEY = "muckzi";
const DEFAULTS: Data = {
  loc: { lat: 37.4876, lng: 126.8253, label: "성공회대 정문" },
  radius: 500,
  recent: [],
  count: 0,
  history: {},
  saved: [],
  last: { tags: [], places: [] },
};

let raw: string | null = null;
let cache = DEFAULTS;

function read(): Data {
  let next: string | null = null;
  try {
    next = localStorage.getItem(KEY);
  } catch {}
  if (next !== raw) {
    raw = next;
    try {
      cache = { ...DEFAULTS, ...JSON.parse(next ?? "{}") };
    } catch {
      cache = DEFAULTS;
    }
  }
  return cache;
}

export function update(fn: (d: Data) => Partial<Data>) {
  const next = { ...read(), ...fn(read()) };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  raw = null;
  cache = next;
  window.dispatchEvent(new Event(KEY));
}

function subscribe(cb: () => void) {
  window.addEventListener(KEY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(KEY, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useData() {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

export function locate() {
  navigator.geolocation?.getCurrentPosition(async ({ coords }) => {
    const lat = coords.latitude, lng = coords.longitude;
    const res = await fetch(`/api/region?lat=${lat}&lng=${lng}`).catch(() => null);
    const label = res?.ok ? (await res.json()).name || "현재 위치" : "현재 위치";
    update(() => ({ loc: { lat, lng, label } }));
  });
}

export const RADII = [300, 500, 1000, 2000];
export const nextRadius = (r: number) => RADII[(RADII.indexOf(r) + 1) % RADII.length];
export const walk = (m: number) => Math.max(1, Math.round(m / 67));
export const radiusLabel = (m: number) => (m <= 1000 ? `도보 ${walk(m)}분 안` : `${m / 1000}km 안`);
export const meters = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);
export const findPlace = (d: Data, id: string) => d.last.places.find((p) => p.id === id) ?? d.saved.find((p) => p.id === id);
export const shortLabels = (p: Place) => p.labels.split(", ").filter((l) => !l.includes(" ") && l !== "-").slice(0, 3);
export const won = (n: number | null) => (n == null ? "" : `${n.toLocaleString("ko-KR")}원`);
export const dishLabel = (d: Dish) => [d.name, won(d.price)].filter(Boolean).join(" ");
