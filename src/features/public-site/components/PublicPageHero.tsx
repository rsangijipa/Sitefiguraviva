import Link from "next/link";
import type { ReactNode } from "react";

export interface PublicPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PublicPageHero({
  eyebrow,
  title,
  description,
  actions,
}: PublicPageHeroProps) {
  return (
    <header className="fv-bg fv-bg-hero border-b border-border bg-paper pb-20 pt-36 md:pb-28 md:pt-44">
      <div className="fv-container">
        <nav aria-label="Navegação estrutural" className="mb-10">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.16em] text-muted transition-colors hover:text-primary"
          >
            ← Página inicial
          </Link>
        </nav>
        <div className="max-w-4xl">
          <p className="fv-eyebrow mb-5">{eyebrow}</p>
          <h1 className="max-w-[18ch] text-balance font-serif text-[clamp(2.7rem,7vw,6.4rem)] font-semibold leading-[0.98] tracking-tight text-primary">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-balance text-lg leading-relaxed text-text/75 md:text-xl">
            {description}
          </p>
          {actions ? (
            <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
