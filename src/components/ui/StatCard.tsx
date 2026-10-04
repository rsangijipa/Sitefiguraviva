import Link from "next/link";
import { cn } from "@/lib/utils";

type StatCardProps = { label: string; value: React.ReactNode; trend?: string; icon?: React.ReactNode; href?: string; className?: string };

export function StatCard({ label, value, trend, icon, href, className }: StatCardProps) {
  const content = <div className={cn("editorial-card group flex items-center justify-between gap-4 p-5", className)}>
    <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>{trend && <p className="mt-1 text-xs font-medium text-primary">{trend}</p>}</div>
    {icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold transition-transform group-hover:scale-105">{icon}</div>}
  </div>;
  return href ? <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{content}</Link> : content;
}
