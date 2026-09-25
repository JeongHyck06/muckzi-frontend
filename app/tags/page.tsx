"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Crumb, Icon, StateView } from "@/components/ui";
import { nextRadius, radiusLabel, type Tag, update, useData } from "@/lib/store";

const GROUPS = ["맛", "메뉴", "상황"];

function AddChip({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button className="mn-chip mn-chip--add" onClick={() => setOpen(true)}>
        <Icon name="plus" size={14} />추가
      </button>
    );
  }
  return (
    <form className="mn-chip mn-chip--add" onSubmit={(e) => {
      e.preventDefault();
      const value = new FormData(e.currentTarget).get("tag")?.toString().trim();
      if (value) onAdd(value);
      setOpen(false);
    }}>
      <Icon name="plus" size={14} />
      <input name="tag" autoFocus maxLength={20} placeholder="입력 후 Enter" onBlur={(e) => e.currentTarget.form?.requestSubmit()} />
    </form>
  );
}

export default function Tags() {
  const q = useSearchParams().get("q") ?? "";
  const router = useRouter();
  const data = useData();
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: q }) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setTags)
      .catch(() => setFailed(true));
  }, [q]);

  const search = () => {
    const labels = tags!.map((t) => t.label);
    update((d) => {
      const history = { ...d.history };
      tags!.forEach((t) => (history[t.label] = { n: (history[t.label]?.n ?? 0) + 1, avoid: t.avoid }));
      return { history, count: d.count + 1, recent: [q, ...d.recent.filter((r) => r !== q)].slice(0, 5) };
    });
    const params = new URLSearchParams(labels.map((l) => ["tag", l]));
    router.push(`/results?${params}`);
  };

  return (
    <div className="container narrow">
      <Crumb items={[["홈", "/"], ["취향 정리"]]} />
      <div className="stack" style={{ gap: 4 }}>
        <h1 className="t-title">이렇게 이해했어요</h1>
        <p className="t-body">맞지 않는 태그는 빼고, 빠진 건 더해 주세요. 태그는 검색 조건으로 그대로 쓰여요.</p>
      </div>
      <p className="mn-notice">“{q}”</p>

      {failed ? (
        <StateView title="문장을 정리하지 못했어요" desc="잠시 뒤 다시 시도해 주세요"
          action={<Link href={`/?q=${encodeURIComponent(q)}`} className="mn-btn mn-btn--secondary">다시 말하기</Link>} />
      ) : (
        <div className="mn-card mn-card--pad" style={{ gap: 16 }}>
          {GROUPS.map((group) => (
            <div key={group} className="row" style={{ gap: 12, alignItems: "flex-start" }}>
              <span className="mn-chip mn-chip--category" style={{ width: 48 }}>{group}</span>
              <div className="wrap" style={{ flex: 1 }}>
                {tags === null && <span className="skeleton" style={{ width: 96, height: 32, borderRadius: 999 }} />}
                {tags?.filter((t) => t.group === group).map((t) => (
                  <button key={t.label} className="mn-chip mn-chip--removable" aria-label={`${t.label} 빼기`}
                    onClick={() => setTags(tags.filter((x) => x !== t))}>
                    {t.label}<Icon name="x" size={14} />
                  </button>
                ))}
                {tags && <AddChip onAdd={(label) => !tags.some((t) => t.label === label) && setTags([...tags, { label, group, avoid: false }])} />}
              </div>
            </div>
          ))}
          <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
            <span className="mn-chip mn-chip--category" style={{ width: 48 }}>거리</span>
            <div className="wrap" style={{ flex: 1 }}>
              <span className="mn-chip mn-chip--removable" style={{ paddingRight: 12 }}>{radiusLabel(data.radius)}</span>
              <button className="mn-chip mn-chip--add" onClick={() => update((d) => ({ radius: nextRadius(d.radius) }))}>
                <Icon name="plus" size={14} />거리 바꾸기
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="t-caption t-3">4~6개가 가장 잘 맞아요</p>
      <div className="actions">
        <Link href={`/?q=${encodeURIComponent(q)}`} className="mn-btn mn-btn--secondary">다시 말하기</Link>
        <button className="mn-btn mn-btn--accent" disabled={!tags?.length} onClick={search}>
          이 조건으로 찾기
        </button>
      </div>
    </div>
  );
}
