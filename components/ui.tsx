import Link from "next/link";
import { Fragment, type ReactNode } from "react";

export function Icon({ name, size }: { name: string; size: number }) {
  return <img src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

export function Crumb({ items }: { items: [string, string?][] }) {
  return (
    <nav className="mn-crumb">
      {items.map(([label, href], i) => (
        <Fragment key={label}>
          {i > 0 && <Icon name="crumb" size={14} />}
          {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}

export function StateView({ icon, title, desc, action }: { icon?: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mn-card mn-state">
      {icon && <Icon name={icon} size={28} />}
      <p className="t-headline">{title}</p>
      {desc && <p className="t-body">{desc}</p>}
      {action}
    </div>
  );
}

export function Photo({ src, height, icon }: { src: string | null; height: number; icon: string }) {
  return (
    <div className="mn-photo" style={{ height }}>
      {src ? (
        <img src={src} alt="" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.src = `/icons/${icon}.svg`)} />
      ) : (
        <Icon name={icon} size={icon === "camera-lg" ? 40 : 28} />
      )}
    </div>
  );
}
