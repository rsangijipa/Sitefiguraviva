import type { ReactNode } from "react";

interface PublicPageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  visual?: ReactNode;
}

export default function PublicPageHero({
  eyebrow,
  title,
  description,
  actions,
  visual,
}: PublicPageHeroProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-primary/10 bg-paper px-6 pb-12 pt-28 md:pb-14 md:pt-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_32%,rgba(254,83,139,0.12),transparent_22%),radial-gradient(circle_at_72%_72%,rgba(1,201,77,0.10),transparent_24%),linear-gradient(120deg,rgba(241,233,219,0.55),transparent_62%)]" />
      <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-gold">
              {eyebrow}
            </p>
          )}
          <h1 className="font-serif text-5xl leading-[0.98] text-primary md:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary/65 md:text-xl">
              {description}
            </p>
          )}
          {actions && (
            <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
          )}
        </div>
        {visual && (
          <div className="pointer-events-none relative hidden min-h-64 items-center justify-center lg:flex">
            {visual}
          </div>
        )}
      </div>
    </header>
  );
}
