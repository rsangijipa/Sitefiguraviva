import { cn } from "@/lib/utils";

type PanelHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PanelHeader({ eyebrow, title, description, actions, className }: PanelHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">{eyebrow}</p>}
        <h1 className="font-serif text-3xl tracking-tight text-primary sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
