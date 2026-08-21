import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card border border-line rounded-xl p-5 ${className}`}>{children}</div>;
}

export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="font-serif text-3xl text-inkText mt-1">{value}</div>
      {sub && <div className="text-xs text-inkSoft mt-1">{sub}</div>}
    </Card>
  );
}
