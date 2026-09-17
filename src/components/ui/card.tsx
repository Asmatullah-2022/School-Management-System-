import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {action}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <p className="px-5 py-8 text-center text-sm text-muted">{label}</p>;
}
