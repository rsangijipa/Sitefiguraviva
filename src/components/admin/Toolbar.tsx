import { cn } from "@/lib/utils";
export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn("flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between", className)}>{children}</div>; }
