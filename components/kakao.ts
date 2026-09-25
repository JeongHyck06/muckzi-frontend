"use client";

import { useEffect, useState } from "react";

export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

declare global {
  interface Window { kakao: any }
}

/** SDK 스크립트는 한 번만 넣고, 로드가 끝나면 true */
export function useKakaoMaps() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!KAKAO_JS_KEY) return;
    const done = () => window.kakao.maps.load(() => setReady(true));
    if (window.kakao?.maps) return done();
    let script = document.querySelector<HTMLScriptElement>("script[data-kakao]");
    if (!script) {
      script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`;
      script.dataset.kakao = "1";
      document.head.appendChild(script);
    }
    script.addEventListener("load", done);
    return () => script.removeEventListener("load", done);
  }, []);

  return ready;
}
